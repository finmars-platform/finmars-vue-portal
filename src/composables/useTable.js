function _sortNumberGetVal (value) {

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

export const useSortRowsByNumber = function(a, b, descending=true) {

	const aVal = _sortNumberGetVal(a);
	const bVal = _sortNumberGetVal(b);

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
