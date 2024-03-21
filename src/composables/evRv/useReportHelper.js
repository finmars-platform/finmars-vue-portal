const reportDateProperties = {
	'reports.balancereport': [null, 'report_date'],
	'reports.plreport': ['pl_first_date', 'report_date'],
	'reports.transactionreport': ['begin_date', 'end_date'],
	'reports.performancereport': [null, 'end_date'],
};

export function useGetDateProperties (content_type) {

	if ( reportDateProperties.hasOwnProperty(content_type) ) {

		return JSON.parse(JSON.stringify( reportDateProperties[content_type] ));

	}

	return null;

}

/**
 * Supports calculateReportDatesExprs function
 *
 * @param {string} contentType
 * @param {string} dateExpr
 * @param {Object} reportOptions
 * @param {Number} reportDateIndex
 * @returns {Promise<unknown>}
 */
const calcReportDateExpr = async function (contentType, dateExpr, reportOptions, reportDateIndex) {

	const dateProp = reportDateProperties[contentType][reportDateIndex];

	const opts = {
		body: {
			is_eval: true,
			expression: dateExpr,
		}
	}

	const res = await useApi('expression.post', opts);

	if (res._$error) throw new Error(res._$error);

	reportOptions[dateProp] = res.result;

};

export async function useCalculateReportDatesExprs (content_type, reportOptions, reportLayoutOptions) {

	const firstDateExpr = reportLayoutOptions.datepickerOptions.reportFirstDatepicker.expression; // for pl_first_date, begin_date
	const secondDateExpr = reportLayoutOptions.datepickerOptions.reportLastDatepicker.expression; // for report_date, end_date

	var dateExprsProms = [];

	if (firstDateExpr) {

		var dateFromProm = calcReportDateExpr(content_type, firstDateExpr, reportOptions, 0);
		dateExprsProms.push(dateFromProm);

	}

	if (secondDateExpr) {

		const dateToProm = calcReportDateExpr(content_type, secondDateExpr, reportOptions, 1);

		dateExprsProms.push(dateToProm);

	}

	try {
		await Promise.all(dateExprsProms);

		return reportOptions;

	} catch (e) {
		return {error: e};
	}

}
