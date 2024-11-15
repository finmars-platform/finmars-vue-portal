/**
 *
 * @param { {error?: Object} } a - object of a column
 * @param { {error?: Object} } b - object of a column
 * @param {Boolean} [descending]
 * @returns {number}
 */
export const useSortRowsWithErrors = function (a, b, descending) {

	if (!a.error && !b.error) {
		throw new Error("useSortRowsWithErrors was called for columns without errors");
	}

	if (a.error && !b.error) {
		return descending ? 1 : -1;

	} else if (!a.error && b.error) {
		return descending ? -1 : 1;

	} else if (a.error && b.error) {

		if (a.error.noErrorMode && !b.error.noErrorMode) {
			return descending ? -1 : 1;

		} else if (!a.error.noErrorMode && b.error.noErrorMode) {
			return descending ? 1 : -1;
		}

		return 0;

	}

}

function _sortNumberGetVal (value) {

	if (value === '-') {
		return 0;
	}

	const convertedVal = parseFloat(value);

	if ( Number.isNaN(convertedVal) ) {
		return value;
	}

	return convertedVal;

}

function _sortNumberCompareNaN (a, b, descending=true) {

	// move NaNs to the beginning of an array
	if (Number.isNaN(a) && !Number.isNaN(b)) {
		return descending ? 1 : -1;
	}

	// move NaNs to the end of an array
	if (!Number.isNaN(a) && Number.isNaN(b)) {
		return descending ? -1 : 1;
	}

	/*if ( Number.isNaN(a) && !Number.isNaN(b) ) {
		return -1;
	}

	// move NaNs to the end of an array
	if ( !Number.isNaN(a) && Number.isNaN(b) ) {
		return 1;
	}*/

	return 0;

}

/**
 *
 * @param { Object } a - object of a column
 * @param a.value
 * @param { Object } [a.error]
 * @param { Object } b - object of a column
 * @param b.value
 * @param { Object } [b.error]
 * @param {Boolean} [descending]
 *
 * @returns {number}
 */
export const useSortRowsByNumber = function(a, b, descending=true) {

	if (a.error || b.error) {
		return useSortRowsWithErrors(a, b, descending);
	}

	const aVal = _sortNumberGetVal(a.value);
	const bVal = _sortNumberGetVal(b.value);

	if ( Number.isNaN(aVal) || Number.isNaN(bVal) ) {
		return _sortNumberCompareNaN(aVal, bVal, descending);
	}

	if (aVal > bVal) {
		return descending ? -1 : 1;

	} else if (aVal < bVal) {

		return descending ? 1 : -1;

	}

	return 0;

}

/**
 * To
 *
 * @param { Array|Ref< UnwrapRef<Array> > } headerList
 * @param {String} columnKey - key of a column whose values to use for sorting
 * @return {Array} - headerList with applied sorting settings
 */
export const useToggleSorting = function (headerList, columnKey) {

	headerList = unref(headerList);

	const activeSortCol = headerList.find(
		col => col.sorting
	);

	const colData = headerList.find(col => col.key === columnKey);

	if (activeSortCol && activeSortCol.key !== colData.key) {
		// if there is active sorting by another column, turn it off
		activeSortCol.sorting = '';
	}

	if ( colData.sorting === 'desc' ) {
		colData.sorting = 'asc';

	} else { // `.sorting` === 'asc' or '';
		colData.sorting = 'desc';
	}

	return headerList;

}
