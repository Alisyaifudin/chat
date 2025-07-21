import { DurableObject } from 'cloudflare:workers';
import z from 'zod';

export class Chat extends DurableObject<Env> {
	private message = '';
	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);
		this.loadData();
	}
	async loadData() {
		const raw = await this.ctx.storage.get('polls');
		const parsed = z.string().optional().safeParse(raw);
		if (!parsed.success) {
			console.error(z.treeifyError(parsed.error));
			return;
		}
		const message = parsed.data;
		if (message === undefined) return;
		this.message = message;
	}
	saveData() {
		return this.ctx.storage.put('polls', this.message);
	}
	async fetch(request: Request) {
		const upgradeHeader = request.headers.get('Upgrade');
		if (upgradeHeader === 'websocket') {
			const webSocketPair = new WebSocketPair();
			const [client, server] = Object.values(webSocketPair);
			this.ctx.acceptWebSocket(server);
			this.broadcastToAll();
			return new Response(null, {
				status: 101,
				webSocket: client,
			});
		}
		return new Response('PollingServer is alive', { status: 200 });
	}
	async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer) {
		const now = Date.now();
		this.message += '\n' + `[${now}]: ` + message.toString();
		const lines = this.message.split('\n');
		if (lines.length > 30) {
			this.message = lines.filter((_, i) => i > 0).join('\n');
		}
		this.saveData();
		this.broadcastToAll();
	}
	broadcastToAll() {
		const websockets = this.ctx.getWebSockets();
		websockets.forEach((ws) => {
			try {
				ws.send(this.message);
			} catch (error) {
				// Handle disconnected websockets
				console.error('Failed to send message to websocket:', error);
			}
		});
	}
}
