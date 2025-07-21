import { Hono } from 'hono';
import type { Chat } from './chat';

const app = new Hono<{ Bindings: { chat: DurableObjectStub<Chat>; assets: Env['ASSETS'] } }>();

app.get('/', async (c) => {
	const object = await c.env.assets.fetch('http://dummy/page.html');
	return c.html(await object.text());
});

app.get('/index.js', async (c) => {
	const object = await c.env.assets.fetch('http://dummy/index.js');
	return new Response(object.body, {
		headers: {
			'Content-Type': 'text/javascript',
		},
	});
});

app.get('/ws', async (c) => {
	const chat = c.env.chat;
	return chat.fetch(c.req.raw);
});

export default app;
