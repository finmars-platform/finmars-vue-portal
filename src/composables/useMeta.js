export const useRecursiveDeepCopy = (o, saveFunctions) => {
	let newO,i;

	if (typeof o !== 'object') {
		return o;
	}
	if (!o) {
		return o;
	}

	if ('[object Array]' === Object.prototype.toString.apply(o)) {
		newO = [];
		for (i = 0; i < o.length; i += 1) {
			newO[i] = useRecursiveDeepCopy(o[i]);
		}
		return newO;

	} else if (saveFunctions && {}.toString.call(o) === '[object Function') {
		return o;
	}

	newO = {};
	for (i in o) {
		if (o.hasOwnProperty(i)) {
			newO[i] = useRecursiveDeepCopy(o[i]);
		}
	}
	return newO;
};

/** @param {String} [key] */
export const useGenerateUniqueId = key => {
	const currentDate = Date.now().toString();
	return useMd5(currentDate, key);
}

export const useLogResponseError = resposeData => {
	console.error(resposeData._$error);
	useNotify({type: 'error', title: resposeData._$error.error.message || resposeData._$error.error.details});
	return resposeData;
}

/**
 *
 * @param {String} text
 * @param {[String]} [occupiedList]
 * @param {String} [textName]
 * @returns {null|string} - returns 'null' if text is valid, otherwise returns an error description
 */
export const useTextNotValidForUserCode = (
		text,
		{
			occupiedList,
			textName,
		}
	) => {

	if (!text) {
		return `${ textName ? textName + ' ' : ''}should not be empty.`;
	}
	else if (text.match('[^1-9a-zA-Z_]')) {

		if (textName) textName = ' for ' + textName;

		return `Only english letters and 1-9 numbers allowed${textName}.`;
	}
	else if (text.match('^[0-9]')) {
		return `${ textName ? textName + ' ' : ''}should not start with number.`;
	}
	else if (occupiedList && occupiedList.length) {

		if (occupiedList.includes(text)) {
			return `${ textName ? textName + ' ' : ''}should be unique.`;
		}

	}

	return null;

}
