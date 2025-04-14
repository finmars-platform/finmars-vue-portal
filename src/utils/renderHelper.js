import { escapeHtml, parseAndInsertHyperlinks } from './stringHelper';

function processAffix(value, prefix = '', suffix = '') {
	return `${prefix}${value}${suffix}`;
}

export function getNumberFormatSettings(column) {
	if (column.options && column.options.numberFormat) {
		return column.options.numberFormat;
	}

	if (column.report_settings) {
		return column.report_settings;
	}

	return null;
}

export function getColorNegativeNumber(value, column) {
	const numberFormat = getNumberFormatSettings(column);
	const { negative_color_format_id } = numberFormat || {};
	const { value_type } = column || {};

	if (negative_color_format_id !== 1 || value_type !== 20) {
		return '';
	}

	// check whether number is float or integer
	if ((value % 1 === 0 && parseInt(value) < 0) || (value % 1 !== 0 && parseFloat(value) < 0)) {
		return 'var(--error)';
	}

	return '';
}

export function formatRounding(value, column) {
	const numberFormat = getNumberFormatSettings(column);

	if (!numberFormat || (numberFormat && numberFormat.round_format_id === 0)) {
		return `${value}`;
	}

	const fractionDigits = [0, 0, 1, 2, 4][numberFormat.round_format_id];
	return fractionDigits === undefined ? `${value}` : parseFloat(value).toFixed(fractionDigits);
}

export function formatZero(value, column) {
	const numberFormat = getNumberFormatSettings(column);

	if (!numberFormat || (numberFormat && parseFloat(value) !== 0)) {
		return value;
	}

	return [value, '-', ''][numberFormat.round_format_id] || value;
}

export function formatNegative(value, column) {
	const numberFormat = getNumberFormatSettings(column);

	if (numberFormat) {
		let localValue = value;

		if (`${value}`.includes(' ')) {
			localValue = value.split(' ').join('');
		}

		if (`${value}`.includes("'")) {
			localValue = value.split("'").join('');
		}

		if (`${value}`.includes('%')) {
			localValue = value.slice(0, value.length - 1);
		}

		if (`${value}`.includes('bps')) {
			localValue = value.slice(0, value.length - 3);
		}

		if (localValue < 0) {
			if (numberFormat.negative_format_id === 0) {
				return value;
			}

			if (numberFormat.negative_format_id === 1) {
				const res = `${value}`;
				return `(${res.slice(0, value.length)})`;
			}
		}
	}

	return value;
}

export function formatThousandsSeparator(value, column) {
	const numberFormat = getNumberFormatSettings(column);

	if (numberFormat) {
		const formatId = numberFormat.thousands_separator_format_id;

		if (formatId === 0) {
			return value;
		}

		if (formatId === 1 || formatId === 2) {
			const parts = `${value}`.split('.');
			const replaceValue = formatId === 1 ? ' ' : "'";
			parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, replaceValue);
			return parts.join('.');
		}
	}

	return value;
}

/**
 * Applies multiplier, rounding and suffix to number.
 * @param value {number | string}
 * @param column {Object}
 * @param applySuffix {string}
 * @returns {number | string | NaN}
 */
export function formatPercentage(value, column, applySuffix) {
	const numberFormat = getNumberFormatSettings(column);
	let result = value;

	if (numberFormat) {
		const { number_multiplier, percentage_format_id, number_suffix } = numberFormat;
		if (number_multiplier || number_multiplier === 0) {
			result = parseFloat(result) * number_multiplier;
		}

		result = [undefined, 0, 1, 2, 0, 1][percentage_format_id]
			? parseFloat(result).toFixed([undefined, 0, 1, 2, 0, 1][percentage_format_id])
			: result;

		if (applySuffix && number_suffix) {
			result = `${result}${number_suffix}`;
		}
	}

	return result;
}

/**
 * Format a number using number format settings from a column
 * @param obj {Object} - object that contains a number inside `obj[column.key]`
 * @param column {Object} - data of entity / report viewer column
 * @return {String} - formatted number
 */
export function formatValue(obj, column) {
	let value = obj[column.key];
	if (value === 'No Data') {
		return value;
	}

	if (value === null || value === undefined || isNaN(value)) {
		value = '';
	}

	const numberFormat = getNumberFormatSettings(column);
	const { zero_format_id, number_prefix, number_suffix } = numberFormat || {};

	if (!value && zero_format_id) {
		value = formatZero(value, column);
	} else {
		value = formatPercentage(value, column, false);
		value = formatRounding(value, column);
		value = formatThousandsSeparator(value, column);
		value = formatNegative(value, column);

		if (numberFormat && !!value) {
			value = processAffix(value, number_prefix, number_suffix);
		}
	}

	return value;
}

/**
 * Escape HTML special characters and if needed insert hyperlinks
 * @param value {String}
 * @return {String}
 */
export function formatStringForCell(value) {
	if (typeof value !== 'string') {
		throw new Error(
			`[stringHelper escapeHtml] Invalid type of argument. Expected 'string' got an ${typeof value}: ${value}`
		);
	}

	const str = escapeHtml(value);
	return parseAndInsertHyperlinks(str, 'class="openLinkInNewTab"');
}
