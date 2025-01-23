export function wrapperStringify(obj) {
	try {
		return JSON.stringify(obj || {}, null, 4);
	} catch (e) {
		console.warn(e, 'Json has problem');
		return '';
	}
}
