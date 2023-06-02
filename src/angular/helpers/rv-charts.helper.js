/*var calculateFieldTotal = function (itemList, calcFormulaId) {

        var key;
        var errorText;
        var total = 0;

        switch (calcFormulaId) {
            case 5:
                key = "exposure_percent";
                errorText = "exposure_percent is not set";
                break;
            case 6:
                key = "market_value";
                errorText = "market_value is not set";
                break;
            case 7:
                key = "market_value_percent";
                errorText = "market_value_percent is not set";
                break;
            case 8:
                key = "exposure";
                errorText = "exposure is not set";
                break;
            case 9:
                key = "exposure_percent";
                errorText = "exposure_percent is not set";
                break;
        };


        for (var i = 0; i < itemList.length; i++) {
            var item = itemList[i]
            if (item.hasOwnProperty(key) && !isNaN(parseFloat(item[key]))) {
                total = total + parseFloat(item[key]);
            } else {
                throw Error(errorText);
            };

        };

        return total;

    };*/

function sum(flatListItem, valueInTotal, numberKey) {
	var result = valueInTotal

	if (!isNaN(parseFloat(flatListItem[numberKey]))) {
		result = result + parseFloat(flatListItem[numberKey])
	}

	return result
}

function weightedMarketValue(flatListItem, valueInTotal, numberKey) {
	var result = valueInTotal

	if (
		flatListItem.hasOwnProperty('market_value') &&
		!isNaN(parseFloat(flatListItem['market_value']))
	) {
		if (!isNaN(parseFloat(flatListItem[numberKey]))) {
			result =
				result +
				parseFloat(flatListItem[numberKey]) *
					parseFloat(flatListItem['market_value'])
		}
	} else if (flatListItem['market_value'] !== 0) {
		// throw Error("market_value is not set");
		console.log('market_value is not set', flatListItem)
	}

	return result
}

function weightedMarketValuePercent(flatListItem, valueInTotal, numberKey) {
	var result = valueInTotal

	if (
		flatListItem['market_value_percent'] &&
		!isNaN(parseFloat(flatListItem['market_value_percent']))
	) {
		if (!isNaN(parseFloat(flatListItem[numberKey]))) {
			result =
				result +
				parseFloat(flatListItem[numberKey]) *
					parseFloat(flatListItem['market_value_percent'])
		}
	} else if (flatListItem['market_value_percent'] !== 0) {
		// throw Error("market_value_percent is not set")
		console.log('market_value_percent is not set', flatListItem)
	}

	return result
}

function weightedExposure(flatListItem, valueInTotal, numberKey) {
	var result = valueInTotal

	if (
		flatListItem.hasOwnProperty('exposure') &&
		!isNaN(parseFloat(flatListItem['exposure']))
	) {
		if (!isNaN(parseFloat(flatListItem[numberKey]))) {
			result =
				result +
				parseFloat(flatListItem[numberKey]) *
					parseFloat(flatListItem['exposure'])
		}
	} else if (flatListItem['exposure'] !== 0) {
		// throw Error('exposure is not set')
		console.log('exposure is not set', flatListItem)
	}

	return result
}

function weightedExposurePercent(flatListItem, valueInTotal, numberKey) {
	var result = valueInTotal

	if (
		flatListItem['exposure_percent'] &&
		!isNaN(parseFloat(flatListItem['exposure_percent']))
	) {
		if (!isNaN(parseFloat(flatListItem[numberKey]))) {
			result =
				result +
				parseFloat(flatListItem[numberKey]) *
					parseFloat(flatListItem['exposure_percent'])
		}
	} else if (flatListItem['exposure_percent'] !== 0) {
		// throw Error("exposure_percent is not set");
		console.log('exposure_percent is not set', flatListItem)
	}

	return result
}

function weightedAverageMarketValue(
	flatList,
	flatListItem,
	valueInTotal,
	numberKey
) {
	var result = valueInTotal
	var total = 0

	var i
	for (i = 0; i < flatList.length; i = i + 1) {
		if (
			flatList[i].hasOwnProperty('market_value') &&
			!isNaN(parseFloat(flatList[i]['market_value']))
		) {
			total = total + parseFloat(flatList[i]['market_value'])
		} else if (flatList[i]['market_value'] !== 0) {
			// throw Error("market_value is not set");
			console.log('market_value is not set', flatList[i])
		}
	}

	if (!isNaN(parseFloat(flatListItem[numberKey])) && total) {
		var average = parseFloat(flatListItem['market_value']) / total

		result = result + parseFloat(flatListItem[numberKey]) * average
	}

	return result
}

function weightedAverageMarketValuePercent(
	flatList,
	flatListItem,
	valueInTotal,
	numberKey
) {
	var result = valueInTotal
	var total = 0

	var i
	for (i = 0; i < flatList.length; i = i + 1) {
		if (
			flatList[i]['market_value_percent'] &&
			!isNaN(parseFloat(flatList[i]['market_value_percent']))
		) {
			total = total + parseFloat(flatList[i]['market_value_percent'])
		} else if (flatList[i]['market_value_percent'] !== 0) {
			// throw Error("market_value_percent is not set");
			console.log('market_value_percent is not set', flatList[i])
		}
	}

	if (!isNaN(parseFloat(flatListItem[numberKey])) && total) {
		var average = parseFloat(flatListItem['market_value_percent']) / total

		result = result + parseFloat(flatListItem[numberKey]) * average
	}

	return result
}

function weightedAverageExposure(
	flatList,
	flatListItem,
	valueInTotal,
	numberKey
) {
	var result = valueInTotal
	var total = 0

	var i
	for (i = 0; i < flatList.length; i = i + 1) {
		if (
			flatList[i].hasOwnProperty('exposure') &&
			!isNaN(parseFloat(flatList[i]['exposure']))
		) {
			total = total + parseFloat(flatList[i]['exposure'])
		} else if (flatList[i]['exposure'] !== 0) {
			// throw Error("exposure is not set");
			console.log('exposure is not set', flatList[i])
		}
	}

	if (!isNaN(parseFloat(flatListItem[numberKey])) && total) {
		var average = parseFloat(flatListItem['exposure']) / total

		result = result + parseFloat(flatListItem[numberKey]) * average
	}

	return result
}

function weightedAverageExposurePercent(
	flatList,
	flatListItem,
	valueInTotal,
	numberKey
) {
	var result = valueInTotal
	var total = 0

	var i

	for (i = 0; i < flatList.length; i = i + 1) {
		if (
			flatList[i]['exposure_percent'] &&
			!isNaN(parseFloat(flatList[i]['exposure_percent']))
		) {
			total = total + parseFloat(flatList[i]['exposure_percent'])
		} else if (flatList[i]['exposure_percent'] !== 0) {
			// throw Error("exposure_percent is not set");
			console.log('exposure_percent is not set', flatList[i])
		}
	}

	if (!isNaN(parseFloat(flatListItem[numberKey])) && total) {
		var average = parseFloat(flatListItem['exposure_percent']) / total

		result = result + parseFloat(flatListItem[numberKey]) * average
	}

	return result
}

var calculateFieldValues = function (
	itemList,
	flatListItem,
	valueInTotal,
	numberKey,
	calcFormulaId
) {
	switch (calcFormulaId) {
		case 1:
			return sum(flatListItem, valueInTotal, numberKey)
		case 2:
			return weightedMarketValue(flatListItem, valueInTotal, numberKey)
		case 3:
			return weightedMarketValuePercent(flatListItem, valueInTotal, numberKey)
		case 4:
			return weightedExposure(flatListItem, valueInTotal, numberKey)
		case 5:
			return weightedExposurePercent(flatListItem, valueInTotal, numberKey)
		case 6:
			return weightedAverageMarketValue(
				itemList,
				flatListItem,
				valueInTotal,
				numberKey
			)
		case 7:
			return weightedAverageMarketValuePercent(
				itemList,
				flatListItem,
				valueInTotal,
				numberKey
			)
		case 8:
			return weightedAverageExposure(
				itemList,
				flatListItem,
				valueInTotal,
				numberKey
			)
		case 9:
			return weightedAverageExposurePercent(
				itemList,
				flatListItem,
				valueInTotal,
				numberKey
			)
	}
}

var getDataForChartsFromFlatList = function (
	itemList,
	nameKey,
	numberKey,
	calcFormulaId
) {
	var chartData = []

	var savedFields = {}

	/*var totalOfFieldValues = null;

        if (calcFormulaId >= 5) { // if it is formula that need total of some field'd values
            totalOfFieldValues = calculateFieldTotal(itemList, calcFormulaId);
        };*/

	itemList.forEach(function (item) {
		if (item[nameKey]) {
			var nameValue = item[nameKey]

			var numberValue = 0

			var savedNames = Object.keys(savedFields)

			if (savedNames.indexOf(nameValue) === -1) {
				numberValue = calculateFieldValues(
					itemList,
					item,
					numberValue,
					numberKey,
					calcFormulaId
				)

				chartData.push({ name: nameValue, numericValue: numberValue })
				var dataIndex = chartData.length - 1
				savedFields[nameValue] = dataIndex // save index of field
			} else {
				// if the field was already saved, add number to it

				var matchingDataIndex = savedFields[nameValue]
				numberValue = chartData[matchingDataIndex].numericValue // get value of saved field by its index

				chartData[matchingDataIndex].numericValue = calculateFieldValues(
					itemList,
					item,
					numberValue,
					numberKey,
					calcFormulaId
				)
			}
		}
	})

	return chartData
}

export default {
	getDataForChartsFromFlatList: getDataForChartsFromFlatList,
}
