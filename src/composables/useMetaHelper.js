export const recursiveDeepCopy = (o, saveFunctions) => {
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
			newO[i] = recursiveDeepCopy(o[i]);
		}
		return newO;

	} else if (saveFunctions && {}.toString.call(o) === '[object Function') {
		return o;
	}

	newO = {};
	for (i in o) {
		if (o.hasOwnProperty(i)) {
			newO[i] = recursiveDeepCopy(o[i]);
		}
	}
	return newO;
};

export const generateUniqueId = function (key) {
	const currentDate = Date.now().toString();
	return md5(currentDate, key);
}
