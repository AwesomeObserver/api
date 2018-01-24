import * as koa from 'koa';
import * as cors from 'koa2-cors';
import * as passport from 'koa-passport';
import * as koaSession from 'koa-session';
import * as koaBody from 'koa-bodyparser';
import * as koaRouter from 'koa-router';
import * as RedisStore from 'koa-redis';
import { graphqlKoa, graphiqlKoa } from 'apollo-server-koa';
import { buildSchema } from './schema';
import { setupDB } from './db';
import { wsAPI } from './wsapi';
import { connectionAPI, userAPI } from 'app/api';
import { getFolderData } from './utils';

const authDir = __dirname + '/../app/auth/';

function setupServices(router) {
	const AuthServices = getFolderData(authDir);

	for (const APIName of Object.keys(AuthServices)) {
		const serviceData = AuthServices[APIName].default;

		passport.use(
			new serviceData.Strategy(
				{
					...serviceData.strategyOptions,
					callbackURL: `${process.env.BASE_URL}authend/${serviceData.name}`,
					passReqToCallback: true
				},
				(request, accessToken, refreshToken, profile, done) => {
					process.nextTick(async function() {
						const user = await userAPI.getOrCreate(
							serviceData.whereUser(profile),
							serviceData.createUser(profile)
						);

						if (serviceData.updateUser) {
							const currentData = serviceData.updateUser(profile);
							const newData = {};

							Object.keys(currentData).forEach(field => {
								if (user[field] != currentData[field]) {
									newData[field] = currentData[field];
								}
							});

							if (Object.keys(newData).length > 0) {
								await userAPI.update(user.id, newData);
							}
						}

						done(null, { userId: user.id });
					});
				}
			)
		);

		router.get(
			`/auth/${serviceData.name}/`,
			(ctx, next) => {
				ctx.session.redirectTo = ctx.headers.referer;
				next();
			},
			passport.authenticate(serviceData.name, serviceData.authOptions)
		);

		router.get(
			`/authend/${serviceData.name}/`,
			passport.authenticate(serviceData.name, { failureRedirect: '/' }),
			(ctx, next) => {
				ctx.redirect(ctx.session.redirectTo || '/');
			}
		);
	}
}

export class RPServer {
	API_PORT: number;
	WSAPI_PORT: number;
	app: any;
	router;
	any;

	constructor() {
		this.API_PORT = 8200;
		this.WSAPI_PORT = 8000;
		this.app = null;
		this.router = null;
	}

	setupHttp() {
		this.app = new koa();
		this.router = new koaRouter();

		this.app.use(koaBody());
		this.app.use(cors());

		this.setupAuth();
		this.setupGQL();

		this.app.use(this.router.routes());
		this.app.use(this.router.allowedMethods());
	}

	async setupAuth() {
		this.app.keys = [ process.env.SESSION_SECRET ];
		this.app.use(
			koaSession(
				{
					key: 'rpsession',
					store: new RedisStore({
						host: 'redis',
						port: 6379
					})
				},
				this.app
			)
		);

		setupServices(this.router);

		this.app.use(passport.initialize());
		this.app.use(passport.session());

		passport.serializeUser((user, cb) => cb(null, user));
		passport.deserializeUser((obj, cb) => cb(null, obj));

		this.router.get('/logout', (ctx) => {
			ctx.logout();
			ctx.redirect('/');
		});
	}

	async setupGQL() {
		const schema = buildSchema();

		this.router.post(
			'/graphql',
			graphqlKoa(function(ctx) {
				const token = ctx.request.header.token;

				return {
					schema,
					debug: false,
					context: {
						userId: ctx.state.user ? ctx.state.user.userId : null
					}
				};
			})
		);

		this.app.listen(this.API_PORT);
	}

	async setupWSAPI() {
		wsAPI.PORT = this.WSAPI_PORT;
		return wsAPI.run();
	}

	async run() {
		this.setupHttp();

		await setupDB();
		await this.setupWSAPI();
	}
}
