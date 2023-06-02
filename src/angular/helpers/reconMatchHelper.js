/**
 * Created by szhitenev on 23.12.2016.
 */

var getBankLineByFieldId = function (id, type, list) {
	var result

	list.forEach(function (item) {
		item.fields.forEach(function (field) {
			if (field.id === id && field.type === type) {
				result = item
			}
		})
	})

	return result
}

var getBankFileField = function (id, type, list) {
	var result

	list.forEach(function (item) {
		item.fields.forEach(function (field) {
			if (field.id === id && field.type === type) {
				result = field
			}
		})
	})

	return result
}

var getBankFieldStatusIdByName = function (statusName) {
	var result

	// MATCHED = 1
	// CONFLICT = 2
	// RESOLVED = 3
	// IGNORE = 4
	// AUTO_MATCHED = 5

	if (statusName === 'ignore') {
		result = 4
	} else if (statusName === 'auto_matched') {
		result = 5
	} else if (statusName === 'matched') {
		result = 1
	} else if (statusName === 'resolved') {
		result = 3
	} else if (statusName === 'conflict') {
		result = 2
	}

	return result
}

var getBankFieldStatusNameById = function (id) {
	var result

	// MATCHED = 1
	// CONFLICT = 2
	// RESOLVED = 3
	// IGNORE = 4
	// AUTO_MATCHED = 5

	if (id === 4) {
		result = 'ignore'
	} else if (id === 5) {
		result = 'auto_matched'
	} else if (id === 1) {
		result = 'matched'
	} else if (id === 3) {
		result = 'resolved'
	} else if (id === 2) {
		result = 'conflict'
	} else if (id === undefined) {
		result = 'new'
	}

	return result
}

var getComplexTransactionLineByFieldId = function (id, list) {
	var result

	list.forEach(function (item) {
		item.recon_fields.forEach(function (field) {
			if (field.id === id) {
				result = item
			}
		})
	})

	return result
}

var getComplexTransactionField = function (id, list) {
	var result

	list.forEach(function (item) {
		item.recon_fields.forEach(function (field) {
			if (field.id === id) {
				result = JSON.parse(JSON.stringify(field))
			}
		})
	})

	return result
}

var getComplexTransactionFieldStatusIdByName = function (statusName) {
	var result

	// MATCHED = 1
	// UNMATCHED = 2
	// AUTO_MATCHED = 3
	// IGNORE = 4

	if (statusName === 'unmatched') {
		result = 2
	} else if (statusName === 'matched') {
		result = 1
	} else if (statusName === 'auto_matched') {
		result = 3
	} else if (statusName === 'ignore') {
		result = 4
	}

	return result
}

var getComplexTransactionFieldStatusNameById = function (id) {
	var result

	// MATCHED = 1
	// UNMATCHED = 2
	// AUTO_MATCHED = 3
	// IGNORE = 4

	if (id === 2) {
		result = 'unmatched'
	} else if (id === 1) {
		result = 'matched'
	} else if (id === 3) {
		result = 'auto_matched'
	} else if (id === 4) {
		result = 'ignore'
	}

	return result
}

export default {
	getBankLineByFieldId: getBankLineByFieldId,
	getBankFileField: getBankFileField,
	getBankFieldStatusIdByName: getBankFieldStatusIdByName,
	getBankFieldStatusNameById: getBankFieldStatusNameById,
	getComplexTransactionLineByFieldId: getComplexTransactionLineByFieldId,
	getComplexTransactionField: getComplexTransactionField,
	getComplexTransactionFieldStatusIdByName:
		getComplexTransactionFieldStatusIdByName,
	getComplexTransactionFieldStatusNameById:
		getComplexTransactionFieldStatusNameById,
}
