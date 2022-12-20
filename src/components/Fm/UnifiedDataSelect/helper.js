export function getHighlighted (inputText, value) {

	const inputTextPieces = inputText.split(' ')

	// Case-insensitive regular expression for highlighting multiple parts inside results
	var reg = new RegExp("(?![^<]+>)(" + inputTextPieces.join("|") + ")", "ig");

	return value.replace(reg, '<span class="highlight">$1</span>');

}

export async function findEntities(content_type, inputText, pageNumber) {

	if (!pageNumber) pageNumber = 0;

	let result = {
		items: []
	}

	if (content_type === 'currencies.currency') {

		const options = {
			filters: {
				name: inputText || '',
				page: pageNumber,
			}
		}

		const res = await useApi('currencyDatabaseSearch.get', options);

		if (res.error) {

			console.error("Unified Database error occurred", res.error);

		} else {

			result.itemsTotal = res.resultCount;
			// TODO make request for currencyDatabaseSearch.get return empty array instead of object
			if (Array.isArray(res.foundItems)) {
				result.items = res.foundItems;
			}

		}

		return result;

	}

	const options = {
		filters: {
			query: inputText || '',
		}
	}

	if (content_type === 'counterparties.counterparty') {

		options.params = {
			type: 'company'
		}

	}

	const res = await useApi('unifiedData.get', options);

	if (res.error) {
		console.error("Unified Database error occurred", res.error);

	} else {
		result.itemsTotal = res.count;
		result.items = res.results;
	}

	return result;

}

async function findEntitiesByUserCode(content_type, inputText) {

	let result = {};

	const options = {
		listLight: true,
		filters: {
			pageSize: 500,
			user_code: inputText || '',
		}
	};

	let res = await useResolveEntityApi(content_type, 'get', options);

	if (!res.error) {
		result.itemsTotal = res.count;
		result.items = res.results;
	}

	return result;

}

/**
 *
 * @param {String} content_type
 * @param {String|null} inputText
 * @returns {Promise<{databaseData: Object, localData: Object}>}
 */
export async function getList(content_type, inputText) {

	const res = await Promise.allSettled([
		findEntities(content_type, inputText),
		findEntitiesByUserCode(content_type, inputText),
	]);

	let res0 = res[0].value; // databaseItems
	let res1 = res[1].value; // localItems

	res0.items = res0.items.filter(function (databaseItem) {

		let userCodeProp = (content_type === 'currencies.currency') ? 'code' : 'user_code';

		let exist = !!res1.items.find(item => item.user_code === databaseItem[userCodeProp]);

		return !exist;

	})

	return {databaseData: res0, localData: res1};

}
