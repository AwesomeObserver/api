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
import { getFolderData } from './utils';
import { broker } from './broker';
import { wsAPI } from './wsapi';

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
						const userId = await broker.call('userSocial.auth', {
							serviceData: serviceData.getData(profile)
						});

						done(null, { userId });
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
				ctx.cookies.set('token', '123');
				ctx.redirect(ctx.session.redirectTo || '/');
			}
		);
	}
}

export class RPServer {
	WSAPI_PORT: number;
	API_PORT: number;
	app: any;
	router;
	any;

	constructor() {
		this.WSAPI_PORT = 8000;
		this.API_PORT = 8200;
		this.app = null;
		this.router = null;
	}

	async setupWSAPI() {
		wsAPI.PORT = this.WSAPI_PORT;
		return wsAPI.run();
	}

	setupHttp() {
		this.app = new koa();
		this.router = new koaRouter();

		this.app.use(koaBody());
		this.app.use(false);

		this.setupAuth();
		this.setupGQL();

		this.app.use(this.router.routes());
		this.app.use(this.router.allowedMethods());
	}

	async setupAuth() {
		this.app.keys = [process.env.SESSION_SECRET];
		this.app.use(
			koaSession(
				{
					key: 'rpsession',
					store: new RedisStore({
						host: 'sestorage',
						port: 6379
					}),
					maxAge: 63072000000,
					domain: process.env.COOKIE_DOMAIN,
					httpOnly: false
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
				console.log(ctx.cookies.get('token'));
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

	async run() {
		this.setupHttp();
		await setupDB();
		await this.setupWSAPI();
	}
}
