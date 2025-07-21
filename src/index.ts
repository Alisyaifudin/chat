import app from './app';
import { Chat } from './chat';

export { Chat };

export default {
	/**
	 * This is the standard fetch handler for a Cloudflare Worker
	 *
	 * @param request - The request submitted to the Worker from the client
	 * @param env - The interface to reference bindings declared in wrangler.jsonc
	 * @param ctx - The execution context of the Worker
	 * @returns The response to be sent back to the client
	 */
	async fetch(request, env, ctx): Promise<Response> {
		const id: DurableObjectId = env.DURABLE_OBJECT.idFromName('chat');
		const chat = env.DURABLE_OBJECT.get(id);
		const assets = env.ASSETS;
		return app.fetch(request, { chat, assets });
	},
} satisfies ExportedHandler<Env>;
