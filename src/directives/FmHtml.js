import sanitizeHtml from 'sanitize-html';

function setValue(el, binding) {
	const { sanitize, classes } = binding.modifiers;
	el.innerHTML = sanitize
		? sanitizeHtml(binding.value, {
				...(classes && {
					allowedAttributes: { '*': ['class'] }
				})
			})
		: binding.value;
}

export default {
	mounted(el, binding) {
		setValue(el, binding);
	},
	updated(el, binding) {
		setValue(el, binding);
	}
};
