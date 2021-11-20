const http = require('http');
const Koa = require('koa');
const Router = require('koa-router');
const koaBody = require('koa-body');
const { v4: uuidv4 } = require('uuid');
const app = new Koa();
const faker = require('faker');

app.use(async (ctx, next) => {
  const origin = ctx.request.get('Origin');
  if (!origin) {
    return await next();
  }

  const headers = { 'Access-Control-Allow-Origin': '*', };

  if (ctx.request.method !== 'OPTIONS') {
    ctx.response.set({ ...headers });
    try {
      return await next();
    } catch (e) {
      e.headers = { ...e.headers, ...headers };
      throw e;
    }
  }

  if (ctx.request.get('Access-Control-Request-Method')) {
    ctx.response.set({
      ...headers,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH',
    });

    if (ctx.request.get('Access-Control-Request-Headers')) {
      ctx.response.set('Access-Control-Allow-Headers', ctx.request.get('Access-Control-Request-Headers'));
    }

    ctx.response.status = 204;
  }
});

app.use(koaBody({
  text: true,
  urlencoded: true,
  multipart: true,
  json: true,
}));

const router = new Router();

router.get('/messages/unread', async (ctx, next) => {
  const result = {
    status: "ok",
    timestamp: Date.now(),
    messages: []
  }
  for (let i = 0; i < 3; i++) {
    const newRandomMessage = {
    id : uuidv4(),
    from : faker.internet.email(),
    subject : `Hello from ${faker.name.findName()}!`,
    body : faker.lorem.sentence(),
    received : Date.now()
    }
    result.messages.push(newRandomMessage);
  }
  ctx.response.body = result;
  ctx.response.status = 200;
});

app.use(router.routes()).use(router.allowedMethods());

const port = process.env.PORT || 7070;
const server = http.createServer(app.callback());

server.listen(port);