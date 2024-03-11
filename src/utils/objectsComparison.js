/**
 * Created by mevstratov on 01.05.2019.
 */

/**
 *
 * @param {Object} obj1
 * @param {Object} obj2
 * @returns {boolean} - Returns 'true' if objects have same properties and values. Otherwise, returns 'false'.
 */
export const utilAreObjectsTheSame = function (obj1, obj2) {

	// console.log('object comparison objects', obj1, obj2);
	var firstObject, secondObject;

	function areTwoObjectsTheSame(x, y) {
		var p;

		// Checking for isNaN
		if (isNaN(x) && isNaN(y) && typeof x === 'number' && typeof y === 'number') {
			return true;
		}

		if (x === y) {
			return true;
		}

		// Checking for prototype and constructor
		if (typeof x === 'function' && typeof y === 'function') {
			return true;
		}

		// Check for infinitive linking loops
		if (firstObject.indexOf(x) > -1 || secondObject.indexOf(y) > -1) {
			return false;
		}

		// Checking of one object being a subset of another.
		for (p in y) {
			if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
				console.log('object comparison lack of equivalent property', p);
				return false;
			} else if (typeof y[p] !== typeof x[p]) {
				return false;
			}
		}

		for (p in x) {

			if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
				console.log('object comparison lack of equivalent property', p);
				return false;
			} else if (typeof y[p] !== typeof x[p]) {
				return false;
			}

			switch (typeof (x[p])) {
				case 'object':
				case 'function':

					firstObject.push(x);
					secondObject.push(y);

					if (!areTwoObjectsTheSame(x[p], y[p])) {
						console.log('object comparison not the same objects', x[p], y[p]);
						return false;
					}

					firstObject.pop();
					secondObject.pop();
					break;

				default:
					if (x[p] !== y[p]) {
						console.log('object comparison properties with various values', x[p], y[p]);
						return false;
					}
					break;
			}
		}
		// console.log('object comparison objects are equals');
		return true;
	}

	firstObject = [];
	secondObject = [];

	if (!areTwoObjectsTheSame(obj1, obj2)) {
		return false;
	}

	return true;

}
