export default function (target, options) {
	const nuxtApp = useNuxtApp();

	let pickmeupOpts;

	if (options) {

		const singleDateMode = ['multiple', 'range'].includes(options.mode)

		const defaultOpts = {
			format: "Y-m-d",
			hide_on_select: !singleDateMode
		}

		pickmeupOpts = {...defaultOpts, ...options};

	}

	return nuxtApp.$pickmeup(target, pickmeupOpts);
}
