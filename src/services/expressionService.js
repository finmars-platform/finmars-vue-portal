import useApi from '~/composables/useApi';

export async function validate(data) {
	const body = { ...data };

	if (!('is_eval' in body)) {
		body.is_eval = false;
	}

	return useApi('expression.post', { body });
}

/**
 * @param data {Object}
 * @param {string} data.expression - expression formula
 * @param {boolean} [data.is_eval = true]
 * @returns {Promise<Response>}
 */
export async function getResultOfExpression(data = {}) {
	const body = { ...data };

	if (!('is_eval' in body)) {
		body.is_eval = true;
	}

	return useApi('expression.post', { body });
}

/**
 * @param {String} date - A string in YYYY-MM-DD ISO format representing the current date.
 * @param {String} frequency - values: "D" - (dayly) / "W" - (weekly) / "M" - (monthly) /
 *     "Q" - (quarterly) / "Y" - (yearly)
 * @param {Number} shift - Integer indicating how many periods to shift (-N for backward, +N for forward).
 * @param {Boolean} [isOnlyBday] - Whether to adjust the dates to business days.
 * @param start
 * @returns {*}
 */
export async function calcPeriodDate(
	date,
	frequency,
	shift,
	isOnlyBday,
	start
) {
	if (!['D', 'W', 'M', 'Q', 'Y'].includes(frequency)) {
		throw new Error(
			'[expressionService.calcPeriodDate] Error: invalid argument "frequency":',
			frequency
		);
	}

	if (!Number.isInteger(shift)) {
		throw new Error(
			'[expressionService.calcPeriodDate] Error: invalid argument "shift": ' +
				'Expected integer got:',
			shift
		);
	}

	const body = {
		date,
		frequency,
		shift,
		is_only_bday: !!isOnlyBday,
		start: !!start
	};

	return useApi('exprCalcPeriodDate.post', { body });
}

export async function calcBusinessDate(date) {
	const body = { date };
	return useApi('exprBusinessDate.post', { body });
}
