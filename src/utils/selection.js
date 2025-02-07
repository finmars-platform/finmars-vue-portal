/**
 * @param {HTMLElement} el
 * @param {'all' | 'start' | 'end'} type
 */
function focusSelection(el, type) {
	el.focus();

	const textNode = el.firstChild;
	console.log('textNode: ', el, textNode);
	// textNode can be null if there is no text in element.
	// In this case just focusing is enough, no need to select anything
	if (textNode) {
		const caret = textNode.length;
		const range = document.createRange();
		const sel = window.getSelection();

		switch (type) {
			case 'all':
				range.setStart(textNode, 0);
				range.setEnd(textNode, caret);
				break;
			case 'start':
				range.setStart(textNode, 0);
				range.setEnd(textNode, 0);
				break;
			case 'end':
				range.setStart(textNode, caret);
				range.setEnd(textNode, caret);
				break;
			default:
				range.setStart(textNode, 0);
				range.setEnd(textNode, caret);
		}

		sel && sel.removeAllRanges();
		sel && sel.addRange(range);
	}
}

/**
 * @param {HTMLElement} el
 */
export function selectAll(el) {
	focusSelection(el, 'all');
}

/**
 * @param {HTMLElement} el
 */
export function selectStart(el) {
	focusSelection(el, 'start');
}

/**
 * @param {HTMLElement} el
 */
export function selectEnd(el) {
	focusSelection(el, 'end');
}
