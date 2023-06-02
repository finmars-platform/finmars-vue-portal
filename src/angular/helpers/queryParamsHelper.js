/**
 * Created by szhitenev on 07.12.2016.
 */

var entityPluralToSingular = function (key) {
	switch (key) {
		case 'instruments':
			return 'instrument'
		case 'accounts':
			return 'account'
			break
		case 'portfolios':
			return 'portfolio'
			break
		case 'responsibles':
			return 'responsible'
			break
		case 'counterparties':
			return 'counterparty'
			break
		case 'content_types':
			return 'content_type'
		default:
			return key
			break
	}
}

var toQueryParamsString = function (params) {
	var resultArr = []

	var keys = Object.keys(params)

	var i, x
	var keysLen = keys.length
	var values
	var valuesLen

	for (i = 0; i < keysLen; i = i + 1) {
		values = params[keys[i]]

		if (typeof values === 'string' || typeof values === 'number') {
			resultArr.push(keys[i] + '=' + values)
		} else {
			if (values) {
				valuesLen = values.length

				for (x = 0; x < valuesLen; x = x + 1) {
					resultArr.push(keys[i] + '=' + values[x])
				}
			}
		}
	}

	return resultArr.join('&')
}

/*var formatFilterSettingsForQueryParams = function (filter) {

        var formattedFilterData = {};

        formattedFilterData.filter_type = filter.options.filter_type;
        formattedFilterData.filter_value_type = filter.value_type;

        if (filter.filter_type === 'from_to') {

            formattedFilterData.filter_value_from = filter.options.filter_values.min_value;
            formattedFilterData.filter_value_to = filter.options.filter_values.max_value;

        } else {

            filter.options.filter_values.forEach(function (filterValue, index) {

                var valueName = 'filter_values_' + index;
                formattedFilterData[valueName] = filterValue;

            });

        };

        return formattedFilterData;

    };*/

export default {
	toQueryParamsString: toQueryParamsString,
	entityPluralToSingular: entityPluralToSingular,
	// formatFilterSettingsForQueryParams: formatFilterSettingsForQueryParams
}
