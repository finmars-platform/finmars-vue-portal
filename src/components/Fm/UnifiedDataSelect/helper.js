export function getHighlighted (filterText, value) {

	const inputTextPieces = filterText.replace(' ', '|');

	// Case-insensitive regular expression for highlighting multiple parts inside results
	const reg = new RegExp(`(?![^<]+>)(${inputTextPieces})`, "ig");

	return value.replace(reg, '<span class="highlight">$1</span>');

}

export async function fetchDatabaseEntities(content_type, filterText, pageNumber=1) {

	let result = {
		items: []
	};

	const options = {
		filters: {
			query: filterText || '',
			page: pageNumber,
			page_size: 40,
		}
	};

	let routeOpt;

	/* if (content_type === 'currencies.currency') {

		const options = {
			filters: {
				name: filterText || '',
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
			query: filterText || '',
		}
	}

	if (content_type === 'counterparties.counterparty') {

		options.params = {
			type: 'company'
		}

	}

	const res = await useApi('unifiedData.get', options); */

	if (content_type === 'currencies.currency') {
		routeOpt = 'currencyDatabaseSearch.get';
	}
	else if (content_type === 'counterparties.counterparty') {
		routeOpt = 'counterpartyDatabaseSearch.get';
	}

	const res = await useApi(routeOpt, options);

	if (res.error) {
		console.error("Unified Database error occurred", res.error);

	} else {

		result.itemsTotal = res.count;

		result.items = res.results.map(item => {

			item.frontOptions = {
				type: 'database'
			}

			return item;

		});

	}

	return result;

}

export async function fetchLocalEntities(content_type, filterText, pageNumber=1) {

	let result = {};

	const options = {
		listLight: true,
		filters: {
			page: pageNumber,
			pageSize: 500,
			query: filterText || '',
		}
	};

	let res = await useResolveEntityApi(content_type, 'get', options);

	if (!res.error) {

		result.itemsTotal = res.count;

		result.items = res.results.map(item => {

			item.frontOptions = {
				type: 'local'
			}

			return item;

		});

	}

	return result;

}

/** @return {Array} - not imported database items **/
export function filterDatabaseItems(dbItems, localItems) {
	return dbItems.filter(function (databaseItem) {
		// there is no such item locally
		return !localItems.find( item => item.user_code === databaseItem.user_code );

	});
}

/**
 *
 * @param {String} content_type
 * @param {String|null} inputText
 * @returns {Promise<{databaseData: Object, localData: Object}>}
 */
export async function getList(content_type, inputText) {

	const res = await Promise.allSettled([
		fetchDatabaseEntities(content_type, inputText),
		fetchLocalEntities(content_type, inputText),
	]);

	let databaseData = res[0].value;
	let localData = res[1].value;

	databaseData.items = filterDatabaseItems(databaseData.items, localData.items);

	return {databaseData, localData};

}

export function startImport(contentType, item) {

	if (contentType === 'currencies.currency') {

		const options = {
			body: {
				user_code: item.user_code,
				mode: 1,
			}
		}

		return useApi('importCurrencyFmDb.post', options);

	}
	else if (contentType === 'counterparties.counterparty') {

		const options = {
			body: {
				company_id: item.id,
			}
		}

		return useApi('importCurrencyFmDb.post', options);

	}

}
