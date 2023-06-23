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
	console.error(resposeData.error);
	useNotify({type: 'error', title: resposeData.error.error.message || resposeData.error.error.details});
	return resposeData;
}
