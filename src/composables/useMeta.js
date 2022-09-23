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

export const useGenerateUniqueId = function (key) {
	const currentDate = Date.now().toString();
	return useMd5(currentDate, key);
}

/**
 *
 * @param {function} dataRequest - asynchronous method that returns array of items
 * @param {array} argumentsList - array of arguments for dataRequest method. Must contain argument with options {pageSize: 1000, page: 1}
 * @param {array} [dataList] - array where requested data will be placed
 * @returns {Promise<unknown>}
 */
var loadDataFromAllPages = function (dataRequest, argumentsList, dataList) {

	if (!Array.isArray(dataList)) dataList = [];

	let optionsArg = argumentsList.find(arg => {
		return typeof arg === 'object' && arg.hasOwnProperty('page');
	});

	if (!optionsArg) throw new Error('No options with page number were specified in argumentsList');

	var loadAllPages = (resolve, reject) => {

		dataRequest(...argumentsList).then(function (data) {

			dataList = dataList.concat(data.results);

			if (data.next) {

				optionsArg.page = optionsArg.page + 1; // number of page to request
				loadAllPages(resolve, reject);

			} else {
				resolve(dataList);
			}

		}).catch(error => reject(error));

	};

	return new Promise((resolve, reject) => {

		loadAllPages(resolve, reject);

	});

};
