import * as crypto from 'crypto';
import * as urlTools from 'url';
import * as koa from 'koa';
import * as cors from 'koa2-cors';
import * as passport from 'koa-passport';
import * as koaSession from 'koa-session';
import * as koaBody from 'koa-bodyparser';
import * as koaRouter from 'koa-router';
import * as RedisStore from 'koa-redis';
import * as IoRedis from 'ioredis';
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
					callbackURL: `${process.env
						.AUTH_URL}authend/${serviceData.name}`,
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
				ctx.redirect(ctx.session.redirectTo || process.env.BASE_URL);
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
		this.app.use(
			cors({
				origin: process.env.BASE_URL,
				credentials: true
			})
		);

		this.setupAuth();
		this.setupGQL();
		this.setupXsolla();

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
						client: new IoRedis({
							host: 'sestorage',
							port: 6379
						})
					}),
					maxAge: 63072000000,
					domain: process.env.COOKIE_DOMAIN
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
			ctx.redirect(process.env.BASE_URL);
		});
	}

	async setupGQL() {
		const schema = buildSchema();

		this.router.post(
			'/graphql',
			graphqlKoa(function(ctx) {
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

	async setupXsolla() {
		const projectKey = process.env.XSOLLA_PROJECT_KEY;

		this.router.post('/xsolla', (ctx, next) => {
			const authorization = ctx.request.header.authorization;
			const bodyStr = JSON.stringify(ctx.request.body);
			const currentSign = crypto
				.createHash('sha1')
				.update(bodyStr + projectKey)
				.digest('hex');

			if (authorization !== `Signature ${currentSign}`) {
				return ctx.throw(400);
			}

			console.log(ctx.request.body);

			ctx.response.body = null;
			next();
		});
	}

	async run() {
		this.setupHttp();
		await setupDB();
		await this.setupWSAPI();
	}
}
