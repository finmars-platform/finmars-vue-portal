import dayjs from "dayjs";

/**
 * Get last not weekend day of a year.
 * This function used (instead of directly using utilGetLastDayOfMonth() )
 * to make sure that the same date is used as last day of a year
 * inside RvPerformanceBundles and RvPerformanceDetail
 *
 * @param year {String|Number} - the year to find last not weekend day for
 * @return {String} - date in YYYY-MM-DD format
 */
export function getEndOfYearDate(year) {
	return utilGetLastDayOfMonth(
		year,
		11,
		{excludeWeekend: true}
	);
}
