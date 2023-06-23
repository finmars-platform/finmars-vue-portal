/**
 * Created by szhitenev on 23.11.2016.
 */

function sum(calculatedColumns, column, group) {
	//console.log('calculatedColumns', calculatedColumns);
	//console.log('column', column);
	//console.log('group', group);

	if (!calculatedColumns[column.key]) {
		calculatedColumns[column.key] = 0
	}

	group.items.forEach(function (groupedItem) {
		calculatedColumns[column.key] =
			calculatedColumns[column.key] + parseFloat(groupedItem[column.key])
	})
}

function weightedMarketValue(calculatedColumns, column, group) {
	if (!calculatedColumns[column.key]) {
		calculatedColumns[column.key] = 0
	}

	group.items.forEach(function (groupedItem) {
		if (groupedItem['market_value']) {
			calculatedColumns[column.key] =
				calculatedColumns[column.key] +
				parseFloat(groupedItem[column.key] * groupedItem['market_value'])
		}
	})
}

function weightedMarketValuePercent(calculatedColumns, column, group) {
	if (!calculatedColumns[column.key]) {
		calculatedColumns[column.key] = 0
	}

	group.items.forEach(function (groupedItem) {
		if (groupedItem['market_value_percent']) {
			calculatedColumns[column.key] =
				calculatedColumns[column.key] +
				parseFloat(
					groupedItem[column.key] * groupedItem['market_value_percent']
				)
		}
	})
}

function weightedExposure(calculatedColumns, column, group) {
	if (!calculatedColumns[column.key]) {
		calculatedColumns[column.key] = 0
	}

	group.items.forEach(function (groupedItem) {
		if (groupedItem['exposure']) {
			calculatedColumns[column.key] =
				calculatedColumns[column.key] +
				parseFloat(groupedItem[column.key] * groupedItem['exposure'])
		}
	})
}

function weightedExposurePercent(calculatedColumns, column, group) {
	if (!calculatedColumns[column.key]) {
		calculatedColumns[column.key] = 0
	}

	group.items.forEach(function (groupedItem) {
		if (groupedItem['exposure_percent']) {
			calculatedColumns[column.key] =
				calculatedColumns[column.key] +
				parseFloat(groupedItem[column.key] * groupedItem['exposure_percent'])
		}
	})
}

function weightedAverageMarketValue(calculatedColumns, column, group) {
	if (!calculatedColumns[column.key]) {
		calculatedColumns[column.key] = 0
	}

	var total = 0

	group.items.forEach(function (groupedItem) {
		if (groupedItem['market_value']) {
			total = total + groupedItem['market_value']
		}
	})

	group.items.forEach(function (groupedItem) {
		if (groupedItem['market_value']) {
			var average = groupedItem['market_value'] / total

			calculatedColumns[column.key] =
				calculatedColumns[column.key] +
				parseFloat(groupedItem[column.key] * average)
		}
	})
}

function weightedAverageMarketValuePercent(calculatedColumns, column, group) {
	if (!calculatedColumns[column.key]) {
		calculatedColumns[column.key] = 0
	}

	var total = 0

	group.items.forEach(function (groupedItem) {
		if (groupedItem['market_value_percent']) {
			total = total + groupedItem['market_value_percent']
		}
	})

	group.items.forEach(function (groupedItem) {
		if (groupedItem['market_value_percent']) {
			var average = groupedItem['market_value_percent'] / total

			calculatedColumns[column.key] =
				calculatedColumns[column.key] +
				parseFloat(groupedItem[column.key] * average)
		}
	})
}

function weightedAverageExposure(calculatedColumns, column, group) {
	if (!calculatedColumns[column.key]) {
		calculatedColumns[column.key] = 0
	}

	var total = 0

	group.items.forEach(function (groupedItem) {
		if (groupedItem['exposure']) {
			total = total + groupedItem['exposure']
		}
	})

	group.items.forEach(function (groupedItem) {
		if (groupedItem['exposure']) {
			var average = groupedItem['exposure'] / total

			calculatedColumns[column.key] =
				calculatedColumns[column.key] +
				parseFloat(groupedItem[column.key] * average)
		}
	})
}

function weightedAverageExposurePercent(calculatedColumns, column, group) {
	if (!calculatedColumns[column.key]) {
		calculatedColumns[column.key] = 0
	}

	var total = 0

	group.items.forEach(function (groupedItem) {
		if (groupedItem['exposure_percent']) {
			total = total + groupedItem['exposure_percent']
		}
	})

	group.items.forEach(function (groupedItem) {
		if (groupedItem['exposure_percent']) {
			var average = groupedItem['exposure_percent'] / total

			calculatedColumns[column.key] =
				calculatedColumns[column.key] +
				parseFloat(groupedItem[column.key] * average)
		}
	})
}

function resolveSubtotalFunction(calculatedColumns, column, group) {
	if (column.report_settings && column.report_settings.subtotal_formula_id) {
		switch (column.report_settings.subtotal_formula_id) {
			case 1:
				sum(calculatedColumns, column, group)
				break
			case 2:
				weightedMarketValue(calculatedColumns, column, group)
				break
			case 3:
				weightedMarketValuePercent(calculatedColumns, column, group)
				break
			case 4:
				weightedExposure(calculatedColumns, column, group)
				break
			case 5:
				weightedExposurePercent(calculatedColumns, column, group)
				break
			case 6:
				weightedAverageMarketValue(calculatedColumns, column, group)
				break
			case 7:
				weightedAverageMarketValuePercent(calculatedColumns, column, group)
				break
			case 8:
				weightedAverageExposure(calculatedColumns, column, group)
				break
			case 9:
				weightedAverageExposurePercent(calculatedColumns, column, group)
				break
		}
	}
}

var calcColumnSubTotal = function (group, columns) {
	var calculatedColumns = {}

	columns.forEach(function (column) {
		if (column.value_type == 'float') {
			resolveSubtotalFunction(calculatedColumns, column, group)
		}
	})

	return calculatedColumns
}

var groupByAndCalc = function (items, options) {
	var groups = []

	if (options.calculationGroup) {
		items.forEach(function (item) {
			if (groups.length) {
				var exist = false

				groups.forEach(function (groupItem) {
					if (
						groupItem.name ==
						options.calculationGroup +
							'_' +
							item[options.calculationGroup + '_object'].id
					) {
						groupItem.items.push(item)
						exist = true
					}
				})

				if (!exist) {
					groups.push({
						name:
							options.calculationGroup +
							'_' +
							item[options.calculationGroup + '_object'].id,
						items: [item],
					})
				}
			} else {
				groups.push({
					name:
						options.calculationGroup +
						'_' +
						item[options.calculationGroup + '_object'].id,
					items: [item],
				})
			}
		})
	} else {
		groups.push({ name: '', items: items })
	}

	groups.forEach(function (group) {
		var marketValueTotal = 0
		var exposureValueTotal = 0

		group.items.forEach(function (item) {
			marketValueTotal = marketValueTotal + item.market_value
			exposureValueTotal = exposureValueTotal + item.exposure
		})

		//console.log('marketValueTotal', marketValueTotal);
		//console.log('exposureValueTotal', exposureValueTotal);

		group.items.forEach(function (item) {
			if (marketValueTotal != 0) {
				item.market_value_percent = (item.market_value / marketValueTotal) * 100
			} else {
				item.market_value_percent = 0
			}
			if (exposureValueTotal != 0) {
				item.exposure_percent = (item.exposure / exposureValueTotal) * 100
			} else {
				item.exposure_percent = 0
			}
		})
	})

	return items
}

export default {
	calcColumnSubTotal: calcColumnSubTotal,
	groupByAndCalc: groupByAndCalc,
}
