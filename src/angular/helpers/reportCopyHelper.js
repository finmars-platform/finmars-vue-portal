import convertReportHelper from './converters/convertReportHelper'

/*var copy = function () {

        var table = convertReportHelper.convertToExcel();

        var listener = function (e) {

            ;

            e.clipboardData.setData('text/html', table);

            e.preventDefault();
        };

        document.addEventListener('copy', listener, false);

        document.execCommand("copy");

        document.removeEventListener('copy', listener, false);


    };*/

var copy = function (evDataService, isReport, copyType) {
	var flatList = evDataService.getFlatList()

	if (copyType === 'selected') {
		if (isReport) {
			flatList = flatList.filter(function (row) {
				if (row.___type === 'subtotal') {
					var parentGroup = evDataService.getData(row.___parentId)

					if (
						row.___subtotal_type === 'line' &&
						parentGroup.___is_line_subtotal_activated
					) {
						return true
					}

					if (
						row.___subtotal_type === 'area' &&
						parentGroup.___is_area_subtotal_activated
					) {
						return true
					}
				} else if (row.___is_activated) {
					return true
				}

				return false
			})
		} else {
			flatList = flatList.filter(function (row) {
				return row.___is_activated
			})
		}
	}

	if (flatList.length) {
		var columns = evDataService.getColumns()
		var groups = evDataService.getGroups()

		var table = convertReportHelper.convertFlatListToExcel(
			flatList,
			columns,
			isReport,
			groups.length
		)

		var listener = function (e) {
			// ;

			e.clipboardData.setData('text/plain', table)

			e.preventDefault()
		}

		document.addEventListener('copy', listener, false)

		document.execCommand('copy')

		document.removeEventListener('copy', listener, false)
	}
}

export default {
	copy: copy,
}
