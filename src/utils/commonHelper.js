export const getNumberFormatSettings = function (column) {
	if (column.options && column.options.numberFormat) {
		return column.options.numberFormat
	}

	if (column.report_settings) {
		// for old layouts
		return column.report_settings
	}

	return null
}

export const formatNumberRounding = function (value, column) {
	const numberFormat = getNumberFormatSettings(column)

	if (numberFormat) {
		switch (numberFormat.round_format_id) {
			case 0:
				return '' + value
				break
			case 1:
				//return parseInt(value, 10);
				return parseFloat(value).toFixed(0)
				break
			case 2:
				return parseFloat(value).toFixed(1)
				break
			case 3:
				return parseFloat(value).toFixed(2)
				break
			case 4:
				return parseFloat(value).toFixed(4)
				break
		}

		/*if (numberFormat.round_format_id === 0) {
            return value
        }

        if (numberFormat.round_format_id === 1) {
            return parseInt(value, 10);
        }

        if (numberFormat.round_format_id === 3) {
            return parseFloat(value).toFixed(2);
        }*/
	}

	return '' + value // Must return string
}
export const formatNumberZero = function (value, column) {
	const numberFormat = getNumberFormatSettings(column)

	if (numberFormat) {
		if (parseFloat(value) === 0) {
			if (numberFormat.zero_format_id === 0) {
				return value
			}

			if (numberFormat.zero_format_id === 1) {
				return '-'
			}

			if (numberFormat.zero_format_id === 2) {
				return ''
			}
		}
	}

	return value
}

export const formatNumberNegative = function (value, column) {
	const numberFormat = getNumberFormatSettings(column)

	if (numberFormat) {
		var localValue = value

		if (value.toString().indexOf(' ') !== -1) {
			localValue = value.split(' ').join('')
		}

		if (value.toString().indexOf("'") !== -1) {
			localValue = value.split("'").join('')
		}

		if (value.toString().indexOf('%') !== -1) {
			localValue = value.slice(0, value.length - 1)
		}

		if (value.toString().indexOf('bps') !== -1) {
			localValue = value.slice(0, value.length - 3)
		}

		if (localValue < 0) {
			if (numberFormat.negative_format_id === 0) {
				return value
			}

			if (numberFormat.negative_format_id === 1) {
				value = value + ''

				value = '(' + value.slice(1, value.length) + ')'

				return value
			}
		}
	}

	return value
}
