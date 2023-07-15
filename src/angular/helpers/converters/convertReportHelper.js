import evHelperService from '../../services/entityViewerHelperService'
;('use strict')

var convertToExcel = function () {
	/*var rows = document.querySelectorAll('.ev-content .g-row');

        var table = '<table>';

        var columns = document.querySelectorAll('.g-columns-holder .g-cell');

        table = table + '<thead>';
        table = table + '<tr>';

        for (var hc = 0; hc < columns.length; hc = hc + 1) {

            table = table + '<th><b>' + columns[hc].querySelector('.g-cell-content').textContent + '</b></th>';
        }

        table = table + '</tr>';
        table = table + '</thead>';

        table = table + '<tbody>';

        var tr;
        var cells;
        var bg;
        for (var i = 0; i < rows.length; i = i + 1) {

            cells = rows[i].querySelectorAll('.g-cell');

            //;

            tr = '<tr>';

            for (var c = 0; c < cells.length; c = c + 1) {

                bg = getComputedStyle(cells[c].parentElement).backgroundColor;

                if (cells[c].querySelector('b')) {
                    tr = tr + '<td bgcolor="' + bg + '"><b>' + cells[c].innerText + '</b></td>'
                } else {
                    tr = tr + '<td bgcolor="' + bg + '">' + cells[c].innerText + '</td>'
                }
            }

            tr = tr + '</tr>';

            table = table + tr;
        }

        table = table + "</tbody>";
        table = table + "</table>";

        return table;*/
}

var useShortNameAttrs = ['instrument', 'instrument_type']

var getTransactionStatusName = function (statusNumber) {
	switch (statusNumber) {
		case 1:
			return 'Booked'
			break
		case 2:
			return 'Pending'
			break
	}
}

/*var getEntityViewerDynamicAttrCellVal = function (flatListItem, column) {

        var daKey = column.key.slice(11);
        var cellValue = '';

        for (var da = 0; da < flatListItem.attributes.length; da++) {
            var daObject = flatListItem.attributes[da];

            if (daObject.attribute_type_object.user_code === daKey) {

                if (daObject.attribute_type_object.value_type === 30) {

                    if (daObject.classifier_object) {
                        cellValue = daObject.classifier_object.name;
                    }

                    break;

                } else {

                    switch (daObject.attribute_type_object.value_type) {
                        case 10:
                            cellValue = daObject.value_string;
                            break;
                        case 40:
                            cellValue = daObject.value_date;
                            break;
                    }

                    break;

                }

            }

        }

        return cellValue;
    };*/

var getReportViewerCellVal = function (
	flatListItem,
	column,
	columnOrder,
	numberOfGroups,
	proxylineGroupData
) {
	var cellText = ''
	var resetPLGD = false

	if (flatListItem.___type === 'subtotal') {
		var columnWithGroupName = flatListItem.___level - 2 // group level count starts from 1 and we omit root group

		if (columnWithGroupName < 0 && columnOrder === 0) {
			// to show grand total

			cellText = 'Grand Total'
		} else if (columnOrder === columnWithGroupName) {
			cellText = String(flatListItem.___group_name)
		} else if (
			(flatListItem[column.key] || flatListItem[column.key] === 0) &&
			columnOrder >= numberOfGroups
		) {
			cellText = String(flatListItem[column.key])
		}
	} else {
		if (
			proxylineGroupData.level &&
			columnOrder === proxylineGroupData.level - 2
		) {
			cellText = proxylineGroupData.group_name
			resetPLGD = true
		} else if (flatListItem[column.key] && columnOrder >= numberOfGroups) {
			cellText = String(flatListItem[column.key])
		}
	}

	var result = {
		cellText: cellText,
		resetPLGD: resetPLGD,
	}

	return result
}

var getEntityViewerCellVal = function (flatListItem, column, columnOrder) {
	var cellText = ''

	if (flatListItem.___type === 'group') {
		var columnWithGroupName = flatListItem.___level - 1 // group level count starts from 1 and we omit root group

		if (columnOrder === 0) {
			if (columnWithGroupName > 0) {
				cellText =
					'&nbsp;&nbsp;'.repeat(columnWithGroupName) +
					String(flatListItem.___group_name) // distinguish group level by spaces
			} else {
				cellText = String(flatListItem.___group_name)
			}
		}
	} else if (
		flatListItem.hasOwnProperty('attributes') &&
		column.key.indexOf('attributes.') === 0
	) {
		// for dynamic attributes

		var daKey = column.key.slice(11)

		cellText = evHelperService.getValueFromDynamicAttrsByUserCode(
			daKey,
			flatListItem.attributes
		)

		/* if (cellText || cellText === 0) {

                if (typeof cellText !== 'string') {
                    cellText = String(cellText);
                }

            } else {
                cellText = '';
            } */

		if (!cellText && cellText !== 0) {
			cellText = ''
		} else if (
			typeof cellText === 'object' &&
			cellText.hasOwnProperty('classifier')
		) {
			cellText = cellText.classifier_object
				? cellText.classifier_object.name
				: ''
		} else if (typeof cellText !== 'string') {
			cellText = String(cellText)
		}
	} else if (flatListItem[column.key]) {
		var colValueType = column.value_type

		if (colValueType === 'field') {
			var attrObjName = column.key + '_object'
			var attrObj = flatListItem[attrObjName]

			if (useShortNameAttrs.indexOf(column.key) === -1) {
				if (column.key === 'price_download_scheme') {
					cellText = flatListItem['price_download_scheme_object'].user_code
				} else {
					cellText = attrObj.name
				}
			} else {
				// use short name for relation attributes
				cellText = attrObj.short_name
			}
		} else if (
			column.key === 'status' &&
			typeof flatListItem[column.key] === 'number'
		) {
			cellText = getTransactionStatusName(flatListItem[column.key])
		} else {
			cellText = String(flatListItem[column.key])
		}
	}

	return cellText
}

var convertFlatListToExcel = function (
	flatList,
	columns,
	isReport,
	numberOfGroups
) {
	var table = '<table><thead><tr>'

	for (var hc = 0; hc < columns.length; hc++) {
		var hColumnText

		if (columns[hc].layout_name) {
			hColumnText = columns[hc].layout_name
		} else {
			hColumnText = columns[hc].name
		}

		table = table + '<th>' + hColumnText + '</th>'
	}

	table = table + '</tr></thead>'

	table = table + '<tbody>'

	var reportViewerGetTdElements = function () {
		var td = ''

		var c
		for (c = 0; c < columns.length; c++) {
			/*var columnKey = columns[c].key;
                var cellText = '';

                if (flatList[r].___type === 'subtotal') {

                    var columnWithGroupName = flatList[r].___level - 2; // group level count starts from 1 and we omit root group

                    if (columnWithGroupName < 0 && c === 0) { // to show grand total

                        cellText = 'Grand Total'

                    } else if (c === columnWithGroupName) {

                        cellText = String(flatList[r].___group_name);

                    } else if ((flatList[r][columnKey] || flatList[r][columnKey] === 0) && c >= numberOfGroups) {

                        cellText = String(flatList[r][columnKey]);

                    }

                } else {

                    if (proxylineGroupData.level && c === proxylineGroupData.level - 2) {

                        cellText = proxylineGroupData.group_name;
                        proxylineGroupData = {}; // resetting after group name got rendered in row that goes after proxyline

                    } else if ((flatList[r][columnKey]) && c >= numberOfGroups) {

                        cellText = String(flatList[r][columnKey]);

                    }

                }*/

			var resultObj = getReportViewerCellVal(
				flatList[r],
				columns[c],
				c,
				numberOfGroups,
				proxylineGroupData
			)

			if (resultObj.resetPLGD) {
				proxylineGroupData = {} // resetting after group name got rendered in row that goes after proxyline
			}

			td = td + '<td>' + resultObj.cellText + '</td>'
		}

		return td
	}

	var entityViewerGetTdElements = function () {
		var td = ''

		var c
		for (c = 0; c < columns.length; c++) {
			/*var columnKey = columns[c].key;
                var cellText = '';

                if (flatList[r].___type === 'group') {

                    var columnWithGroupName = flatList[r].___level - 1; // group level count starts from 1 and we omit root group

                    if (c === 0) {

                        if (columnWithGroupName > 0) {
                            cellText = '&nbsp;&nbsp;'.repeat(columnWithGroupName) + String(flatList[r].___group_name); // distinguish group level by spaces
                        } else {
                            cellText = String(flatList[r].___group_name);
                        }

                    }

                } else if (flatList[r].hasOwnProperty('attributes') &&
                           columnKey.indexOf("attributes.") === 0) {  // for dynamic attributes

                    cellText = getEntityViewerDynamicAttrCellVal(flatList[r], columns[c]);

                } else if (flatList[r][columnKey]) {

                    var colValueType = columns[c].value_type;

                    if (colValueType === 'field') {

                        var attrObjName = columnKey + '_object';
                        var attrObj = flatList[r][attrObjName];

                        if (useShortNameAttrs.indexOf(columnKey) === -1) {

                            cellText = attrObj.name;

                        } else { // use short name for relation attributes

                            cellText = attrObj.short_name;
                        }


                    } else {
                        cellText = String(flatList[r][columnKey]);
                    }

                }*/

			var cellText = getEntityViewerCellVal(flatList[r], columns[c], c)

			td = td + '<td>' + cellText + '</td>'
		}

		return td
	}

	var tr
	var proxylineGroupData = {}

	var r
	for (r = 0; r < flatList.length; r++) {
		tr = ''

		if (isReport) {
			if (flatList[r].___type === 'subtotal') {
				if (flatList[r].___subtotal_type === 'proxyline') {
					proxylineGroupData.group_name = String(flatList[r].___group_name)
					proxylineGroupData.level = flatList[r].___level
				} else {
					tr = tr + '<tr>' + reportViewerGetTdElements() + '</tr>'
					table = table + tr
				}
			} else {
				tr = tr + '<tr>' + reportViewerGetTdElements() + '</tr>'
				table = table + tr
			}
		} else {
			if (flatList[r].___type !== 'control') {
				entityViewerGetTdElements()

				tr = tr + '<tr>' + entityViewerGetTdElements() + '</tr>'
				table = table + tr
			}
		}
	}

	table = table + '</tbody></table>'

	return table
}

var convertFlatListToCSV = function (
	flatList,
	columns,
	isReport,
	numberOfGroups
) {
	var csv = []

	// creating row with names of columns
	csv[0] = []
	for (var hc = 0; hc < columns.length; hc++) {
		var hColumnText

		if (columns[hc].layout_name) {
			hColumnText = columns[hc].layout_name
		} else {
			hColumnText = columns[hc].name
		}

		// Escaping double quotes and commas
		if (hColumnText.indexOf('"') !== -1) {
			hColumnText = hColumnText.replace(/"/g, '""')
		}
		hColumnText = '"' + hColumnText + '"'

		csv[0].push(hColumnText)
	}

	if (csv[0].length > 0) {
		csv[0] = csv[0].join(',')
	}

	// < creating row with names of columns >

	var reportViewerAddCellsToCSVRow = function (csvRowOrder) {
		var c
		for (c = 0; c < columns.length; c++) {
			var resultObj = getReportViewerCellVal(
				flatList[r],
				columns[c],
				c,
				numberOfGroups,
				proxylineGroupData
			)

			var cellText = resultObj.cellText

			if (resultObj.resetPLGD) {
				proxylineGroupData = {} // resetting after group name got rendered in row that goes after proxyline
			}

			// Escaping double quotes and commas
			if (cellText.indexOf('"') !== -1) {
				cellText = cellText.replace(/"/g, '""')
			}
			cellText = '"' + cellText + '"'

			csv[csvRowOrder].push(cellText)
		}
	}

	var entityViewerAddCellsToCSVRow = function (csvRowOrder) {
		var c
		for (c = 0; c < columns.length; c++) {
			var cellText = getEntityViewerCellVal(flatList[r], columns[c], c)

			// Escaping double quotes and commas
			if (cellText.indexOf('"') !== -1) {
				cellText = cellText.replace(/"/g, '""')
			}
			cellText = '"' + cellText + '"'

			csv[csvRowOrder].push(cellText)
		}
	}

	var proxylineGroupData = {}

	var r
	for (r = 0; r < flatList.length; r++) {
		var csvRowOrder = r + 1 // there is already row with index 0

		csv[csvRowOrder] = []

		if (isReport) {
			if (flatList[r].___type === 'subtotal') {
				if (flatList[r].___subtotal_type === 'proxyline') {
					proxylineGroupData.group_name = String(flatList[r].___group_name)
					proxylineGroupData.level = flatList[r].___level
				} else {
					reportViewerAddCellsToCSVRow(csvRowOrder)

					csv[csvRowOrder] = csv[csvRowOrder].join(',')
				}
			} else {
				reportViewerAddCellsToCSVRow(csvRowOrder)

				csv[csvRowOrder] = csv[csvRowOrder].join(',')
			}
		} else {
			if (flatList[r].___type !== 'control') {
				entityViewerAddCellsToCSVRow(csvRowOrder)

				csv[csvRowOrder] = csv[csvRowOrder].join(',')
			}
		}
	}

	csv = csv.filter(function (row) {
		// filter proxyline rows
		return row.length > 0
	})

	csv = csv.join('\n')

	return csv
}

export default {
	convertToExcel: convertToExcel,
	convertFlatListToExcel: convertFlatListToExcel,
	convertFlatListToCSV: convertFlatListToCSV,
}
