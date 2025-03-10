function insertHyperlinks(substr, aElemAttrs) {
	let value = substr;
	let linkElem = '';
	let linkElemStart = '<a ';

	if (value.indexOf(' ') === 0) {
		// if substring have space
		value = value.replace(/\s/, ''); // remove first space if it exist
		linkElem = ' '; // add space before link
	}

	if (aElemAttrs) {
		linkElemStart = `${linkElemStart}${aElemAttrs} `;
	}

	return `${linkElem}${linkElemStart}href="${value}">${value}</a>`;
}

export function escapeHtml(str) {
	if (typeof str !== 'string') {
		throw new Error(
			`[stringHelper escapeHtml] Invalid type of argument. Expected 'string' got an ${typeof str}: ${str}`
		);
	}

	return str
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#039;');
}

export function parseAndInsertHyperlinks(str, elemAttrs) {
	if (!str) return '';

	/*
      (?:^|\s) - start of text or white space
      (?:http|ftp|mailto|file|data|irc) - uri schemes
      :[^\s]+ - colon and any character before white space or end of text
      */
	return str.replaceAll(
		/(?:^|\s)(?:http|https|ftp|mailto|file|data|irc):[^\s]+/g,
		(txt) => insertHyperlinks(txt, elemAttrs)
	);
}
