import cloneDeep from 'lodash/cloneDeep';

const ALPHABET_COLORS = [
	'#357EC7', // A
	'#C11B17', // B
	'#008080', // C
	'#728C00', // D
	'#0020C2', // E
	'#347C17', // F
	'#D4A017', // G
	'#7D0552', // H
	'#9F000F', // I
	'#E42217', // J
	'#F52887', // K
	'#571B7E', // L
	'#1F45FC', // M
	'#C35817', // N
	'#F87217', // O
	'#41A317', // P
	'#4C4646', // Q
	'#4CC417', // R
	'#C12869', // S
	'#15317E', // T
	'#AF7817', // U
	'#F75D59', // V
	'#FF0000', // W
	'#000000', // X
	'#E9AB17', // Y
	'#8D38C9' // Z
];

export const getNumberFormatSettings = function (column) {
	if (column.options && column.options.numberFormat) {
		return column.options.numberFormat;
	}

	if (column.report_settings) {
		// for old layouts
		return column.report_settings;
	}

	return null;
};

export const formatNumberRounding = function (value, column) {
	const numberFormat = getNumberFormatSettings(column);

	if (numberFormat) {
		switch (numberFormat.round_format_id) {
			case 0:
				return '' + value;
			case 1:
				//return parseInt(value, 10);
				return parseFloat(value).toFixed(0);
			case 2:
				return parseFloat(value).toFixed(1);
			case 3:
				return parseFloat(value).toFixed(2);
			case 4:
				return parseFloat(value).toFixed(4);
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

	return '' + value; // Must return string
};

export const formatNumberZero = function (value, column) {
	const numberFormat = getNumberFormatSettings(column);

	if (numberFormat) {
		if (parseFloat(value) === 0) {
			if (numberFormat.zero_format_id === 0) {
				return value;
			}

			if (numberFormat.zero_format_id === 1) {
				return '-';
			}

			if (numberFormat.zero_format_id === 2) {
				return '';
			}
		}
	}

	return value;
};

export const formatNumberNegative = function (value, column) {
	const numberFormat = getNumberFormatSettings(column);

	if (numberFormat) {
		var localValue = value;

		if (value.toString().indexOf(' ') !== -1) {
			localValue = value.split(' ').join('');
		}

		if (value.toString().indexOf("'") !== -1) {
			localValue = value.split("'").join('');
		}

		if (value.toString().indexOf('%') !== -1) {
			localValue = value.slice(0, value.length - 1);
		}

		if (value.toString().indexOf('bps') !== -1) {
			localValue = value.slice(0, value.length - 3);
		}

		if (localValue < 0) {
			if (numberFormat.negative_format_id === 0) {
				return value;
			}

			if (numberFormat.negative_format_id === 1) {
				value = value + '';

				value = '(' + value.slice(1, value.length) + ')';

				return value;
			}
		}
	}

	return value;
};

function editorInit(editor) {
	editor.setHighlightActiveLine(false);
	editor.setShowPrintMargin(false);
	editor.setFontSize(14);
	editor.setBehavioursEnabled(true);

	editor.focus();
	editor.navigateFileStart();

	editor = initEditor(editor);
}

/**
 * @param base
 * @param exponent
 * @return {number}
 */
export const utilsPower = function (base, exponent) {
	/* *
	 * JavaScript can return NaN if base number
	 * is a negative
	 * and exponent is a number with floating point
	 * */
	if (base < 0 && !Number.isInteger(exponent)) {
		return -Math.pow(-base, exponent);
	} else {
		return Math.pow(base, exponent);
	}
};

/**
 * Use inside Array.sort(). Sort strings alphabetically but put string that starts with '-' at the beginning
 *
 * @return {Number} - 1, -1, 0
 */
export const utilSortTextWithDash = (a, b) => {
	if (!a || !b) {
		return 0;
	}

	const aStartsWithDash = a.startsWith('-');
	const bStartsWithDash = b.startsWith('-');

	if (!aStartsWithDash && bStartsWithDash) {
		return 1;
	}

	if (aStartsWithDash && !bStartsWithDash) {
		return -1;
	}

	if (aStartsWithDash && bStartsWithDash) {
		const aWithoutDash = a.slice(1);
		const bWithoutDash = b.slice(1);

		if (aWithoutDash > bWithoutDash) {
			return 1;
		}

		if (aWithoutDash < bWithoutDash) {
			return -1;
		}

		return 0;
	}

	if (a > b) {
		return 1;
	}

	if (a < b) {
		return -1;
	}

	return 0;
};

/**
 *
 * @param year {number|string}
 * @param monthIndex {number|string} - month index
 * @param options {Object}
 * @param [options.excludeWeekend] {Boolean} - if `true` and last day is a weekend day, last business day will be returned
 * @param [options.formatted] {Boolean} - if `true` date returned as string in `YYYY-MM-DD` format
 *
 * @return {Date|String}
 *
 */
export const utilGetLastDayOfMonth = (
	year,
	monthIndex,
	{ excludeWeekend, formatted = true } = {}
) => {
	const origYear = year;
	year = parseInt(year);

	if (Number.isNaN(year)) {
		throw `[utilGetLastDayOfMonth] Invalid year provided ${origYear}`;
	}

	const origMonthIndex = monthIndex;
	monthIndex = parseInt(monthIndex);

	if (Number.isNaN(monthIndex) || monthIndex > 11 || monthIndex < 0) {
		throw `[utilGetLastDayOfMonth] Invalid month index provided: ${origMonthIndex}`;
	}

	/*
	`month + 1` bellow because 0 date sets month to previous one
	relative to specified in new Date()
	*/
	const endDate = new Date(year, monthIndex + 1, 0);

	if (excludeWeekend) {
		// If Saturday, move to Friday
		if (endDate.getDay() === 6) {
			endDate.setDate(endDate.getDate() - 1);
		}
		// If Sunday, move to Friday
		else if (endDate.getDay() === 0) {
			endDate.setDate(endDate.getDate() - 2);
		}
	}

	if (formatted) {
		const month = `${endDate.getMonth() + 1}`.padStart(2, '0');
		const day = `${endDate.getDate()}`.padStart(2, '0');

		return `${endDate.getFullYear()}-${month}-${day}`;
	}

	return endDate;
};

export function splitLongWords(text, maxLength) {
	const words = text.split(' ');
	const splittedWords = words.map((word) => {
		if (word.length <= maxLength) {
			return word;
		}

		let chunks = [];
		for (let i = 0; i < word.length; i += maxLength) {
			chunks.push(word.substring(i, i + maxLength));
		}
		return chunks.join(' ');
	});

	return splittedWords.join(' ');
}

export function downloadFile(blobParts, blobType, downloadFileName) {
	const newBlob = new Blob([blobParts], { type: blobType });
	const data = window.URL.createObjectURL(newBlob);
	const link = document.createElement('a');

	link.href = data;
	link.download = downloadFileName;

	document.body.appendChild(link);
	link.click();

	setTimeout(() => {
		document.body.removeChild(link);
		window.URL.revokeObjectURL(data);
	}, 100);
}

export function copyToBuffer(content, fn) {
	const listener = function (e) {
		e.clipboardData.setData('text/plain', content);

		e.preventDefault();
	};

	document.addEventListener('copy', listener, { once: true });

	document.execCommand('copy');

	fn();
}

export function getAvatarColor(char) {
	if (!char) {
		return '';
	}

	const charCode = char.charCodeAt(0);
	const charIndex = charCode - 65;
	const colorIndex = charIndex % ALPHABET_COLORS.length;
	return ALPHABET_COLORS[colorIndex];
}

export async function loadDataFromAllPages(fn, argumentsList = [], dataList) {
	let dataListInner = !Array.isArray(dataList) ? [] : cloneDeep(dataList);
	const optionsArg = argumentsList.find(
		(arg) => typeof arg === 'object' && 'page' in arg
	);
	if (!optionsArg) {
		throw new Error(
			'No options with page number were specified in argumentsList'
		);
	}

	const loadAllPages = (resolve, reject) => {
		fn(...argumentsList)
			.then((data) => {
				dataListInner = [...dataListInner, ...data.results];
				if (data.next) {
					optionsArg.page += 1;
					loadAllPages(resolve, reject);
				} else {
					resolve(dataListInner);
				}
			})
			.catch((err) => reject(err));
	};

	return new Promise((resolve, reject) => loadAllPages(resolve, reject));
}
