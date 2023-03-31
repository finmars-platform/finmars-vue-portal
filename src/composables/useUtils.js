import moment from 'moment';

export function useDebounce(func, wait, immediate) {

	var timeout;
	return function () {
		var context = this, args = arguments;
		var later = function () {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};

}

/**
 *
 * @param fn {Function}
 * @param wait {number} - milliseconds to wait
 * @param [options] {Object}
 * @param {boolean} [options.trailing=true] - execute fn on its last call after wait time
 * @returns {(function(): void)|*}
 */
export function fmThrottle(fn, wait, options) {

	var time = Date.now();
	var timeout = null;
	options = options || {};

	return function () {
		var waitRemains = time + wait - Date.now();

		if (waitRemains < 0) {
			if (timeout) {
				clearTimeout(timeout);
				timeout = null;
			}
			fn();
			time = Date.now();
		} else if (options.trailing !== false && !timeout && waitRemains > 0) {
			timeout = setTimeout(function () {
				timeout = null;
				fn();
				time = Date.now();
			}, waitRemains);
		}
	};
}

/**
 * Validates string with a date
 *
 * @param {String} date
 * @returns {boolean}
 */
export function useDateStringIsValid (date) {
	return moment(date, 'YYYY-MM-DD', true).isValid();
}

const regExpSpecials = [
	// order matters for these
	"-", "[", "]",
	// order doesn't matter for any of these
	"/", "{", "}", "(", ")", "*", "+", "?", ".", "\\", "^", "$", "|"
];

/**
 * Escape RexExp special symbols
 *
 * @param {string} string
 * @return {string} - string with all RexExp special symbols escaped
 *
 * */
export function useRegExpEscape (string) {

	/*
	Referring to the table here:
	https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/regexp
	these characters should be escaped
	\ ^ $ * + ? . ( ) | { } [ ]
	These characters only have special meaning inside of brackets
	they do not need to be escaped, but they MAY be escaped
	without any adverse effects (to the best of my knowledge and casual testing)
	: ! , =
	my test "~!@#$%^&*(){}[]`/=?+\|-_;:'\",<.>".match(/[\#]/g)
	*/


	// I choose to escape every character with '\'
	// even though only some strictly require it when inside []
	const regex = RegExp('[' + regExpSpecials.join('\\') + ']', 'g')

	return string.replace(regex, "\\$&");

}
