const windowOrigin = window.origin
// const windowOrigin = 'http://0.0.0.0:8080'; //for development


export function handleSend(data, iframeId, source = window.parent) {
	data.iframeId = iframeId;
	let dataObj = Object.assign(data, { iframeId: iframeId });
	source.postMessage(dataObj, windowOrigin);
}

export function handleOnMessage(e, onMessageStack) {
	if (!e.data.action) {
		console.warn('Message without action sent');
		return false;
	}

	if (e.origin !== windowOrigin) {
		console.error('Received message from a different origin', e.origin);
		return false;
	}

	if (onMessageStack[e.data.action]) {
		onMessageStack[e.data.action](e.data.payload);
	} else {
		console.log('e.data.action:', e.data);
	}
}
