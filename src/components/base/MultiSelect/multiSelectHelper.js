/** @module multiSelect */

/**
 *
 * @param {String|Array}selModelValue
 * @param {Number} itemIdProp
 * @returns {Set<*>}
 */
export function getSelectedFilter (selModelValue, itemIdProp) {

	let modelValueArray = selModelValue;

	if ( typeof modelValueArray === 'string' ) { // if selected items in form of string, convert them into array
		modelValueArray = modelValueArray.split(',');
	}

	if (Array.isArray(modelValueArray) && typeof modelValueArray[0] === 'object') {
		modelValueArray = modelValueArray.map(selItem => selItem[itemIdProp]);
	}

	return new Set( modelValueArray || [] );

}

/**
 * Used inside computed to get list of selected options
 *
 * @param {Set} selectedFilter - set of ids of selected options
 * @param {Array} items - options of multiselector
 * @param {String} idProp - property with value to use as uuid for option
 * @param {String} titleProp - property with value to use as title for option
 * @returns {Array<Object>} - list of selected options
 */
export function computeSelectedList (selectedFilter, items, idProp, titleProp) {

	return [...selectedFilter].map(selId => {

		let selItem = items.find(item => item[idProp] === selId);

		if (!selItem) {

			return {
				[idProp]: selId,
				[titleProp]: 'Not found',
				error_data: {
					description: ''
				}
			}

		}

		return selItem;

	});

}

/**
 * Used inside computed to get list of available options
 *
 * @param {Set} selectedFilter - set of ids of selected options
 * @param {Array} items - options of multiselector
 * @param {String} idProp - property with value to use as uuid for option
 * @param {String} titleProp - property with value to use as title for option
 * @param {String} search - valur of filter for available options
 * @returns {Array<Object>} - list of available options
 * @memberOf module:multiSelect
 */
export function computeAvailableList (selectedFilter, items, idProp, titleProp, search) {

	return items.filter(
		item => {

			let itemId = item[idProp];

			let itemPassesFilter = item[titleProp].toLocaleLowerCase().includes( search.toLocaleLowerCase() );

			return !selectedFilter.has(itemId) && itemPassesFilter;

		}
	);

}
