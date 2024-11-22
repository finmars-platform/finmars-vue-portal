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

/**
 *
 * @param { [{}]|Ref< [{}] > } tableHeaderData - array with data for header of a table
 * @param { Object|null } sortSettingsData
 * @param {String} sortSettingsData.key - key of a column of a table to sort by
 * @param {String} sortSettingsData.direction - direction of sorting. Values: 'asc', 'desc'
 * @returns {*|Array} -
 */
export function applySortSettings(tableHeaderData, sortSettingsData) {

	let thData = toValue(tableHeaderData);
	let ssData = toValue(sortSettingsData);

	if ( !ssData || !Object.keys(ssData).length ) {

		thData = thData.map(col => {
			col.sorting = '';
			return col;
		})

		return thData;

	}

	thData = useToggleSorting(
		thData, ssData.key, ssData.direction
	);

	return thData;

}

/**
 * Common code for sorting rows of tables inside performance report by a column
 *
 * @param { [{}]|Ref< [{}] > } tableHeaderData - array with data for header of a table
 * @param columnKey {String}
 *
 * @returns { { sortSettings: {key: String, direction: String}|null, tableHeader: [{}] } }
 */
export function commonToggleSorting(tableHeaderData, columnKey) {

	let thData = toValue(tableHeaderData);

	thData = useToggleSorting(thData, columnKey);

	let sortSettings = thData.find(
		col => col.sorting
	);

	if (sortSettings) {

		sortSettings = {
			key: sortSettings.key,
			direction: sortSettings.sorting,
		};

	}

	return {
		sortSettings,
		tableHeader: thData,
	};
}
