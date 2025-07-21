/// <reference lib="dom" />
// @ts-check
const btnEl = /** @type {HTMLButtonElement | null} */ (document.getElementById('connect'));
const inputEl = /** @type {HTMLInputElement | null} */ (document.getElementById('chatbox'));
const textEl = /** @type {HTMLParagraphElement | null} */ (document.getElementById('message'));
const formEl = /** @type {HTMLFormElement | null} */ (document.getElementById('form'));

if (!inputEl) {
	throw new Error("Connect input doesn't exist");
}
if (!textEl) {
	throw new Error("Connect text doesn't exist");
}
if (!btnEl) {
	throw new Error("Connect btn doesn't exist");
}
if (!formEl) {
	throw new Error("Connect form doesn't exist");
}

/**
 * @type {WebSocket | null}
 */
let ws = null;
/**
 * Establishes a WebSocket connection
 * @returns {boolean}
 */
function connectWs() {
	const url = window.location;
	try {
		ws = new WebSocket(`/ws`);
		ws.onopen = () => {
			console.log('connected!');
		};
		ws.onmessage = (e) => {
			const message = /** @type {string} */ (e.data);
			if (textEl === null) return;
			textEl.innerText = message;
		};
		return true;
	} catch (error) {
		return false;
	}
}

btnEl.addEventListener('click', (e) => {
	if (ws) {
		btnEl.innerText = 'Connect';
		ws = null;
	} else {
		const success = connectWs();
		if (success) {
			btnEl.innerText = 'Disconnect';
		}
	}
});

formEl.addEventListener('submit', (e) => {
	e.preventDefault();
	if (ws === null) return;
	ws.send(inputEl.value);
	inputEl.value = '';
});
