export function fmDebounce(func, wait, immediate) {

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
