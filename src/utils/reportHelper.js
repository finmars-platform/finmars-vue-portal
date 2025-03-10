import { getResultOfExpression } from '~/services/expressionService';

const dateFromKeys = ['begin_date', 'pl_first_date'];
const dateToKeys = ['report_date', 'end_date'];

export async function getReportDate(
	reportOptions,
	reportLayoutOptions,
	dateKey
) {
	const dateFrom = dateFromKeys.includes(dateKey);
	const dateTo = dateToKeys.includes(dateKey);

	if (!dateFrom && !dateTo) {
		console.error(`key is not report date key: ${dateKey}`);
		return null;
	}

	if (reportLayoutOptions && reportLayoutOptions.datepickerOptions) {
		const dateExpr = dateFrom
			? reportLayoutOptions.datepickerOptions.reportFirstDatepicker
					.expression
			: dateTo
				? reportLayoutOptions.datepickerOptions.reportLastDatepicker
						.expression
				: undefined;

		if (dateExpr) {
			try {
				const data = await getResultOfExpression(dateExpr);
				return data?.result;
			} catch (e) {
				console.error(
					`Error occurred while trying to evaluate: ${dateExpr}, ${error}`
				);
				return null;
			}
		}
	}

	return reportOptions[dateKey];
}
