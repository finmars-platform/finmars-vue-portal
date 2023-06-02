import renderHelper from '../../helpers/render.helper'
import rvHelper from '../../helpers/rv.helper'
import evDataHelper from '../../helpers/ev-data.helper'
import stringHelper from '../../helpers/stringHelper'

import evRvCommonHelper from '../../helpers/ev-rv-common.helper'

var checkIcon = renderHelper.getIconByKey('checkIcon')

var REPORT_BG_CSS_SELECTOR = 'report-bg-level'
var REPORT_GRAND_TOTAL_CSS_SELECTOR = 'report-grand-total-bg'

/* var getBorderBottomTransparent = function (evDataService, obj, columnNumber, groups) {

        var result = '';

        var nextItem = null;
        var flatList = evDataService.getFlatList();

        if (flatList.length > obj.___flat_list_index + 1) {
            nextItem = flatList[obj.___flat_list_index + 1]
        }

        // whether it is the first column of subtotal row
        if (columnNumber <= groups.length && columnNumber <= obj.___level) {

            if (nextItem) {

                if (obj.___type === 'subtotal'
                    && columnNumber < obj.___level - 1
                    && columnNumber < nextItem.___level - 1) {
                    result = 'border-bottom-transparent';
                }

            }

        }

        return result;

    }; */

var getBorderClasses = function (evDataService, obj, column, columnNumber) {
	var columns = evDataService.getColumns()
	var nextColumn = columns[columnNumber] // columnNumber is columnIndex + 1

	var notLastColumn = columnNumber !== columns.length

	if (notLastColumn) {
		var isGrandTotalFirstColumn = obj.___level === 0 && columnNumber === 1

		if (isGrandTotalFirstColumn) {
			return 'border-right-transparent'
		}

		// var isSubtotalRow = obj.___subtotal_type || obj.___subtotal_subtype;
		var colSubtotalOff =
			!column.report_settings || !column.report_settings.subtotal_formula_id
		var nextColSubtotalOff =
			!nextColumn ||
			!nextColumn.report_settings ||
			!nextColumn.report_settings.subtotal_formula_id
		var nextIsNotCellWithGroupName = columnNumber + 1 !== obj.___level - 1

		if (
			colSubtotalOff &&
			notLastColumn &&
			nextColSubtotalOff &&
			nextIsNotCellWithGroupName
		) {
			return 'border-right-transparent'
		}
	}
}

var getDynamicAttributeValue = function (obj, column) {
	var result = {
		html_result: '',
		numeric_result: null,
		raw_text_result: '',
	}

	if (column.id && obj[column.entity + '_object']) {
		obj[column.entity + '_object'].attributes.forEach(function (item) {
			if (item.attribute_type === column.id) {
				if (column.value_type === 20 && item.value_float) {
					result.html_result = item.value_float.toString()
					result.numeric_result = item.value_float
					result.raw_text_result = item.value_float.toString()
				}

				if (column.value_type === 10 && item.value_string) {
					result.html_result = item.value_string
					result.raw_text_result = item.value_string
				}

				if (column.value_type === 30 && item.classifier_object) {
					result.html_result = item.classifier_object.name
					result.raw_text_result = item.classifier_object.name
				}

				if (column.value_type === 40 && item.value_date) {
					result.html_result = item.value_date
					result.raw_text_result = item.value_date
				}
			}
		})
	}

	return result
}

var getValue = function (evDataService, obj, column, columnNumber) {
	var result = {
		html_result: '',
		numeric_result: null,
		raw_text_result: '',
	}

	if (column.status === 'missing') {
		return (result = {
			html_result: 'Deleted',
			numeric_result: null,
			raw_text_result: 'Deleted',
		})
	}

	//var isFirst = rvHelper.isFirst(evDataService, obj);

	if (columnNumber < obj.___level - 1) {
		var groups = evDataService.getGroups()

		if (groups[columnNumber - 1].report_settings.subtotal_type === 'area') {
			var flatList = evDataService.getFlatList()
			var proxyLineSubtotal

			var skip = false

			for (var i = obj.___flat_list_index - 1; i >= 0; i = i - 1) {
				if (flatList[i].___type === 'subtotal') {
					if (flatList[i].___subtotal_type !== 'proxyline') {
						skip = true
						break
					}
				}

				if (
					flatList[i].___level === columnNumber + 1 &&
					flatList[i].___subtotal_type === 'proxyline'
				) {
					proxyLineSubtotal = flatList[i]
					break
				}
			}

			if (
				proxyLineSubtotal &&
				proxyLineSubtotal.___level < obj.___level &&
				obj.___type === 'subtotal' &&
				obj.___subtotal_type === 'area'
			) {
				skip = true
			}

			if (skip === false) {
				var currentGroup = evDataService.getData(proxyLineSubtotal.___parentId)
				var parentGroup = evDataService.getData(currentGroup.___parentId)

				if (parentGroup.___is_open) {
					var foldButtonSign = currentGroup.___is_open ? '-' : '+'

					var foldButton =
						'<div class="g-group-fold-button"><div class="ev-fold-button" data-type="foldbutton" data-object-id="' +
						currentGroup.___id +
						'" data-parent-group-hash-id="' +
						currentGroup.___parentId +
						'">' +
						foldButtonSign +
						'</div></div>'

					var groupName = currentGroup.___group_name

					if (groupName && typeof groupName === 'string') {
						groupName = stringHelper.parseAndInsertHyperlinks(
							groupName,
							"class='openLinkInNewTab'"
						)
					}

					result.html_result =
						foldButton + '<span class="">' + groupName + '</span>'
					result.raw_text_result = currentGroup.___group_name
				}
			}
		}

		return result
	} else if (columnNumber === obj.___level - 1) {
		var foldButton = ''
		var foldButtonStr = ''

		var group = evDataService.getData(obj.___parentId)
		var parentGroup = evDataService.getData(group.___parentId)

		if (parentGroup.___is_open) {
			var foldButtonSign = group.___is_open ? '-' : '+'

			foldButton =
				'<div class="g-group-fold-button"><div class="ev-fold-button" data-type="foldbutton" data-object-id="' +
				group.___id +
				'" data-parent-group-hash-id="' +
				group.___parentId +
				'">' +
				foldButtonSign +
				'</div></div>'

			if (obj.___level - 1 === columnNumber) {
				foldButtonStr = foldButton
			} else {
				foldButtonStr = ''
			}

			var groupName = obj.___group_name

			if (groupName && typeof groupName === 'string') {
				groupName = stringHelper.parseAndInsertHyperlinks(
					groupName,
					"class='openLinkInNewTab'"
				)
			}

			result.html_result =
				'<span class="g-cell-content">' +
				foldButtonStr +
				'<span class="">' +
				groupName +
				'</span></span>'
			result.raw_text_result = obj.___group_name
		}
	} else if (columnNumber > obj.___level - 1) {
		var showTotal
		var totalCalculationOn =
			column.report_settings && column.report_settings.subtotal_formula_id // if subtotal_formula_id === 0, it means no formula has been chosen
		var isNotGrandTotal = obj.___level !== 0

		if (isNotGrandTotal) {
			// showTotal = totalCalculationOn && !column.report_settings.hide_subtotal;
			showTotal = totalCalculationOn
		} else {
			// for grand total
			showTotal = totalCalculationOn && !column.report_settings.hide_grandtotal
		}

		if (showTotal) {
			// for subtotals

			if (obj.hasOwnProperty(column.key)) {
				result.html_result =
					'<span class="text-bold">' +
					renderHelper.formatValue(obj, column) +
					'</span>'
				result.numeric_result = obj[column.key]
				result.raw_text_result = renderHelper.formatValue(obj, column)
			} else {
				result = getDynamicAttributeValue(obj, column)
			}
		}
	}

	/* Insert 'Grand Total' text inside first cell of the row */
	/* var rootGroupOptions = evDataService.getRootGroupOptions();
        var grandTotalIsActive = rootGroupOptions.subtotal_type;

        if (obj.___level === 0 && grandTotalIsActive && columnNumber === 1) { */
	// in new rv interface, there is always Grand total row

	/* if (obj.___level === 0 && columnNumber === 1) {
            result.html_result = '<span class="text-bold">GRAND TOTAL</span> <span class="g-subtotals-settings-menu gTableActionBtn" data-click-action-type="open_subtotal_position_options"><span class="material-icons">more_vert</span></span>';
            result.raw_text_result = 'Grand Total';
        } */

	return result
}

var getBgColor = function (evDataService, obj, columnNumber) {
	// var result = '';
	//
	// if (columnNumber >= obj.___level - 1) {
	//
	//     result = REPORT_BG_CSS_SELECTOR + '-' + (obj.___level - 1);
	//
	// }
	//
	//
	// return result;

	var result = ''

	var parents = evRvCommonHelper.getParents(obj.___parentId, evDataService)

	var foldedParents = []
	var i

	for (i = 0; i < parents.length; i = i + 1) {
		if (parents[i].___is_open === false) {
			foldedParents.push(parents[i])
		}
	}

	var firstFoldedParent = foldedParents[foldedParents.length - 1]

	// console.log('firstFoldedParent', firstFoldedParent);

	if (firstFoldedParent && columnNumber >= firstFoldedParent.___level) {
		result = REPORT_BG_CSS_SELECTOR + '-' + firstFoldedParent.___level
	} else {
		if (columnNumber >= obj.___level - 1) {
			result = REPORT_BG_CSS_SELECTOR + '-' + (obj.___level - 1)
		}
	}

	/* For Grand Total background */
	var rootGroupOptions = evDataService.getRootGroupOptions()

	if (obj.___level === 0 && rootGroupOptions.subtotal_type) {
		result = REPORT_GRAND_TOTAL_CSS_SELECTOR
	}
	/* < For Grand Total background > */

	return result
}

var getCellTextAlign = function (evDataService, obj, column, columnNumber) {
	var result = ''
	var dashboardCellAlign = evDataService.dashboard.getColumnsTextAlign()

	var rootGroupOptions = evDataService.getRootGroupOptions()
	var grandTotalIsActive = rootGroupOptions.subtotal_type

	if (
		(obj.___level > 0 || !grandTotalIsActive || columnNumber > 1) &&
		obj.___level - 1 !== columnNumber
	) {
		// check whether cell contains grouping name or 'Grand Total' text

		if (column.style && column.style.text_align) {
			result = 'text-' + column.style.text_align
		} else if (dashboardCellAlign) {
			result = 'text-' + dashboardCellAlign
		} else if (column.value_type === 20) {
			result = 'text-right'
		}
	}

	return result
}

var getColorNegativeNumber = function (obj, column) {
	var result = ''

	if (
		column.report_settings &&
		column.report_settings.negative_color_format_id === 1
	) {
		if (column.value_type === 20) {
			if (parseInt(obj[column.key]) < 0) {
				result = 'negative-red'
			}
		}
	}

	return result
}

var getCellClasses = function (
	evDataService,
	obj,
	column,
	columnNumber,
	groups
) {
	var result = []

	var textAlign = getCellTextAlign(evDataService, obj, column, columnNumber)

	if (textAlign) {
		result.push(textAlign)
	}

	// var colorNegative = getColorNegativeNumber(obj, column);
	var colorNegative = renderHelper.getColorNegativeNumber(
		obj[column.key],
		column
	)

	if (colorNegative) {
		result.push(colorNegative)
	}

	var borderClasses = getBorderClasses(evDataService, obj, column, columnNumber)
	// grand total row
	if (borderClasses) {
		result.push(borderClasses)
	}

	if (column.isHidden) {
		result.push('display-none')
	}

	return result
}

var getRowGeneralClasses = function (
	obj,
	classList,
	isActivated,
	evDataService
) {
	if (obj.___subtotal_type === 'proxyline') {
		classList.push('proxyline')
	}

	if (isActivated) {
		classList.push('selected')
	}

	var activeObjRow = evDataService.getActiveObjectRow()

	if (
		activeObjRow &&
		activeObjRow.___id === obj.___id &&
		activeObjRow.___parentId === obj.___parentId
	) {
		classList.push('is-active-object')
	}

	return classList
}

var getCellWrapWidth = function (column) {}

var render = function (evDataService, obj) {
	var columns = evDataService.getColumns()
	var groups = evDataService.getGroups()
	var rowHeight = evDataService.getRowHeight()

	var parent = evDataService.getData(obj.___parentId)

	var rowClassList = ['g-row']

	if (obj.___backgrond_color) {
		rowClassList.push('g-row-marked-' + obj.___backgrond_color)
	}

	var is_activated = false
	var contextMenuIsOpened = false
	var subtotal_type

	if (obj.___subtotal_subtype) {
		subtotal_type = obj.___subtotal_subtype
	} else {
		subtotal_type = obj.___subtotal_type
	}

	if (subtotal_type === 'line') {
		is_activated = parent.___is_line_subtotal_activated
	} else if (subtotal_type === 'area') {
		is_activated = parent.___is_area_subtotal_activated
	}

	if (subtotal_type === 'line') {
		contextMenuIsOpened = parent.___line_subtotal_context_menu_is_opened
	} else if (subtotal_type === 'area') {
		contextMenuIsOpened = parent.___area_subtotal_context_menu_is_opened
	}

	rowClassList = getRowGeneralClasses(
		obj,
		rowClassList,
		is_activated,
		evDataService
	)

	var grandTotalCell = ''
	var rowSelection
	var rowSettings

	if (obj.___level === 0) {
		rowClassList.push('g-grand-total-row')

		/* grandTotalCell = '<div class="g-grand-total-first-cell">' +
				'<span class="text-bold">GRAND TOTAL</span> <span class="g-subtotals-settings-menu gTableActionBtn" data-click-action-type="open_subtotal_position_options"><span class="material-icons">more_vert</span></span>' +
			'</div>'; */
		grandTotalCell =
			'<div class="g-grand-total-first-cell">' +
			'<span class="text-bold">GRAND TOTAL</span>' +
			'</div>'

		rowSelection =
			'<div class="g-row-selection border-right-transparent"></div>'

		rowSettings =
			'<div class="g-row-settings g-row-settings-table border-right-transparent gRowSettings"></div>'
	} else {
		if (is_activated) {
			rowClassList.push('selected')
			rowSelection =
				'<div class="g-row-selection"><div class="g-row-selection-button checked">' +
				checkIcon +
				'</div></div>'
		} else {
			rowSelection =
				'<div class="g-row-selection"><div class="g-row-selection-button"></div></div>'
		}

		if (contextMenuIsOpened) {
			rowClassList.push('context-menu-opened')
		}

		rowSettings = renderHelper.getRowSettings(
			obj.___type,
			obj.___backgrond_color
		)
	}

	var rowClasses = rowClassList.join(' ')

	var offsetTop = obj.___flat_list_offset_top_index * rowHeight

	var result

	if (obj.___subtotal_subtype) {
		result =
			'<div class="' +
			rowClasses +
			'" style="top: ' +
			offsetTop +
			'px" data-type="subtotal" data-subtotal-type="' +
			obj.___subtotal_type +
			'" data-subtotal-subtype="' +
			obj.___subtotal_subtype +
			'" data-object-id="' +
			obj.___id +
			'" data-parent-group-hash-id="' +
			obj.___parentId +
			'">'
	} else {
		result =
			'<div class="' +
			rowClasses +
			'" style="top: ' +
			offsetTop +
			'px" data-type="subtotal" data-subtotal-type="' +
			obj.___subtotal_type +
			'" data-object-id="' +
			obj.___id +
			'" data-parent-group-hash-id="' +
			obj.___parentId +
			'">'
	}

	var cell

	result = result + grandTotalCell + rowSelection + rowSettings

	obj.___cells_values = []

	columns.forEach(function (column, index) {
		var columnNumber = index + 1
		/* var textAlign = getCellTextAlign(evDataService, obj, column, columnNumber);
            var colorNegative = getColorNegativeNumber(obj, column);

            var borderBottomTransparent = getBorderBottomTransparent(evDataService, obj, columnNumber, groups); */

		var value_obj = getValue(evDataService, obj, column, columnNumber)

		var cellClassesList = getCellClasses(
			evDataService,
			obj,
			column,
			columnNumber,
			groups
		)
		var cellClasses = cellClassesList.join(' ')

		obj.___cells_values.push({
			width: column.style.width,
			classList: cellClassesList,
			value: value_obj.html_result,
		})

		var gCellTitle = ''
		var resultValue = ''

		if (value_obj.html_result) {
			resultValue =
				'<span class="g-cell-content">' + value_obj.html_result + '</span>'
		}

		if (value_obj.raw_text_result) {
			gCellTitle = ' title="' + value_obj.raw_text_result + '"'
		}

		cell =
			'<div data-column="' +
			columnNumber +
			'" class="g-cell-wrap ' +
			getBgColor(evDataService, obj, columnNumber) +
			'" style="width: ' +
			(column.isHidden ? '0;' : column.style.width) +
			'">' +
			// '<div class="g-cell ' + textAlign + ' cell-status-' + column.status + ' ' + colorNegative + ' ' + borderBottomTransparent + '"' + gCellTitle + '>' +
			'<div class="g-cell' +
			' cell-status-' +
			column.status +
			' ' +
			cellClasses +
			'"' +
			gCellTitle +
			'>' +
			'<div class="g-cell-content-wrap">' +
			resultValue +
			'</div>' +
			'</div>' +
			'</div>'

		result = result + cell
	})

	evDataService.updateItemInFlatList(obj)

	result = result + '</div>'

	return result
}

export default {
	render: render,
}
