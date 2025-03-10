export function recursiveDeepCopy(o, saveFunctions) {
	let newO;
	let i;

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
		if (Object.prototype.hasOwnProperty.call(o, i)) {
			newO[i] = recursiveDeepCopy(o[i]);
		}
	}
	return newO;
}
