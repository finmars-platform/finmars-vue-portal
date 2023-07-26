/**
 * Created by szhitenev on 23.11.2016.
 */

function getItemValue(item, valueProperty) {
	return item[valueProperty] || 0

	// if (value === null || value === undefined || value === "") value = 0;

	// return value;
}

function sum(items, column) {
	let result = 0

	let i

	for (i = 0; i < items.length; i = i + 1) {
		var itemVal = getItemValue(items[i], column.key)

		/* if (!isNaN(parseFloat(itemVal))) {

                result = result + parseFloat(itemVal);

            } else {

                result = '#Error';

            } */
		if (!isNaN(itemVal)) {
			result = result + parseFloat(itemVal)
		} else {
			result = '#Error'
			console.error(
				column.key + ' with not a number',
				items[i],
				items[i][column.key]
			)
			break
		}
	}

	return result
}

const getWeightedValue = (items, columnKey, weightedKey) => {
	let result = 0

	let i

	for (i = 0; i < items.length; i = i + 1) {
		let value = getItemValue(items[i], weightedKey)

		if (value) {
			var itemVal = getItemValue(items[i], columnKey)

			if (itemVal) {
				result = result + parseFloat(itemVal) * parseFloat(value)
			}
		}
	}

	return result
}

function weightedMarketValue(items, column) {
	return getWeightedValue(items, column.key, 'market_value')
}

function weightedMarketValuePercent(items, column) {
	return getWeightedValue(items, column.key, 'market_value_percent')
}

function weightedExposure(items, column) {
	return getWeightedValue(items, column.key, 'exposure')
}

function weightedExposurePercent(items, column) {
	return getWeightedValue(items, column.key, 'exposure_percent')
}

const getWeightedAverageValue = (items, columnKey, weightedAverageKey) => {
	let result = 0
	let total = 0

	let i

	for (i = 0; i < items.length; i = i + 1) {
		let value = getItemValue(items[i], weightedAverageKey)

		if (value) total = total + value
	}

	if (total) {
		for (i = 0; i < items.length; i = i + 1) {
			let itemVal = getItemValue(items[i], columnKey)

			if (!isNaN(itemVal)) {
				let value = getItemValue(items[i], weightedAverageKey)

				var average = parseFloat(value) / total

				result = result + parseFloat(itemVal) * average
			} else {
				result = '#Error'
				break
			}
		}
	} else {
		console.error(weightedAverageKey + ' totals is', total, columnKey)
		result = '#Error'
	}

	return result
}

function weightedAverageMarketValue(items, column) {
	return getWeightedAverageValue(items, column.key, 'market_value')
}

function weightedAverageMarketValuePercent(items, column) {
	return getWeightedAverageValue(items, column.key, 'market_value_percent')
}

function weightedAverageExposure(items, column) {
	return getWeightedAverageValue(items, column.key, 'exposure')
}

function weightedAverageExposurePercent(items, column) {
	return getWeightedAverageValue(items, column.key, 'exposure_percent')
}

function resolveSubtotalFunction(items, column) {
	// ;

	if (column.report_settings && column.report_settings.subtotal_formula_id) {
		switch (column.report_settings.subtotal_formula_id) {
			case 1:
				return sum(items, column)
			case 2:
				return weightedMarketValue(items, column)
			case 3:
				return weightedMarketValuePercent(items, column)
			case 4:
				return weightedExposure(items, column)
			case 5:
				return weightedExposurePercent(items, column)
			case 6:
				return weightedAverageMarketValue(items, column)
			case 7:
				return weightedAverageMarketValuePercent(items, column)
			case 8:
				return weightedAverageExposure(items, column)
			case 9:
				return weightedAverageExposurePercent(items, column)
		}
	}
}

var calculate = function (items, columns) {
	var result = {}

	// ;

	columns.forEach(function (column) {
		if (column.value_type === 20) {
			result[column.key] = resolveSubtotalFunction(items, column)
		}
	})

	return result
}

var calculateColumn = function (items, column) {
	var result = {}

	result[column.key] = resolveSubtotalFunction(items, column)

	return result
}

export default {
	calculate: calculate,
	calculateColumn: calculateColumn,
}
