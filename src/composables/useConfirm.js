export default function (opts) {
	return new Promise((resolve, reject) => {
		let confirmSettings = useState('confirmSettings');

		confirmSettings.value.title = opts.title
		confirmSettings.value.text = opts.text
		confirmSettings.value.check = opts.check
		confirmSettings.value.isOpen = true

		watch(confirmSettings.value, () => {
			if (confirmSettings.value.result) {
				resolve(true);
			} else {
				resolve(false);
			}
		})
	})
}
