import renderHelper from '../../helpers/render.helper'
import stringHelper from '../../helpers/stringHelper'

/* var checkIcon = renderHelper.getCheckIcon();
    var lockIcon = renderHelper.getLockIcon();
    var lock2Icon = renderHelper.getLock2Icon();
    var starIcon = renderHelper.getStarIcon();
    var cancelIcon = renderHelper.getCancelIcon();
    var partiallyVisibleIcon = renderHelper.getPartiallyVisibleIcon(); */

/* var getIcon = function (obj, currentMember, classList) {

        var result = '';

        var hasChange = false;
        var hasManage = false;
        var partVisible = false;

        if (obj.object_permissions) {

            result = 'lockIcon'; // lock

            obj.object_permissions.forEach(function (perm) {

                if (currentMember.groups.indexOf(perm.group) !== -1) {

                    if (perm.permission.indexOf('change_') !== -1) {
                        hasChange = true
                    }

                    if (perm.permission.indexOf('manage_') !== -1) {
                        hasManage = true
                    }

                    if (perm.permission === 'view_complextransaction_show_parameters' ||
                        perm.permission === 'view_complextransaction_hide_parameters') {
                        partVisible = true;
                    }

                }

            });

            if (hasManage) {
                result = 'starIcon';

            } else if (hasChange) {
                result = '';

            } /!*else if (partVisible) {
                result = partiallyVisibleIcon;

            }*!/

            if (obj.___is_activated && result !== '') { // Be aware of specific mutation
                classList.push('selected-blue');
            }

        }

        if (obj.___is_activated) {
            result = 'checkIcon'
        }

        else if (partVisible) {
            result = 'partiallyVisibleIcon';
        }

        else if (obj.is_canceled) {
            result = 'cancelIcon';
        }

        else if (obj.is_locked) {
            result = 'lock2Icon';
        }

        else if (obj.is_deleted) {
            result = 'deletedIcon';
        }

        else if (obj.hasOwnProperty('is_enabled') && !obj.is_enabled) {
            result = 'disabledIcon';
        }

        else if (obj.hasOwnProperty('is_active') && !obj.is_active) {
            result = 'inactiveIcon';
        }

        else if (currentMember && currentMember.is_admin) {
            result = 'starIcon';
        }

        return renderHelper.getIconByKey(result);

    }; */

var getStatusIcon = function (obj, currentMember) {

	var result = '';

	var hasChange = false;
	var hasManage = false;
	var partVisible = false;

	// Deprecated
	/*if (obj.object_permissions) {

		result = 'lockIcon'; // lock

		obj.object_permissions.forEach(function (perm) {

			if (currentMember.groups.indexOf(perm.group) !== -1) {

				if (perm.permission.indexOf('change_') !== -1) {
					hasChange = true
				}

				if (perm.permission.indexOf('manage_') !== -1) {
					hasManage = true
				}

				if (perm.permission === 'view_complextransaction_show_parameters' ||
					perm.permission === 'view_complextransaction_hide_parameters') {
					partVisible = true;
				}

			}

		});

		if (hasManage) {
			result = 'starIcon';

		} else if (hasChange) {
			result = '';

		}

	}
*/
	/* if (obj.___is_activated) {
		result = 'checkIcon';

	} */
	if (partVisible) {
		result = 'partiallyVisibleIcon';

	} else if (obj.is_canceled) {
		result = 'cancelIcon';

	} else if (obj.is_locked) {
		result = 'lock2Icon';

	} else if (obj.is_deleted) {
		result = 'deletedIcon';

	} else if (obj.hasOwnProperty('is_enabled') && !obj.is_enabled) {
		result = 'disabledIcon';

	} else if (obj.hasOwnProperty('is_active') && !obj.is_active) {
		result = 'inactiveIcon';

		//     Probably deprecated, discussion needed
		// } else if (currentMember && currentMember.is_admin) {
	} else if (currentMember) {
		result = 'starIcon';
	}

	return renderHelper.getIconByKey(result);

};

var statusData = {
	'E': 'Error',
	'S': 'Skip',
	'C': 'Created',
	'Overwritten': 'Created',
	'R': 'Requested',

	1: 'Booked',
	2: 'Pending',
	3: 'Ignored',
}

var getAttributeTypeValue = function (obj, column) {

	if (!obj.attributes) {

		return {
			html_result: '',
			numeric_result: null,
			raw_text_result: '',
		}

	}

	var rawTextResult = '';

	// var pieces = column.key.split('.');
	var pieces = column.key.split('attributes.'); // probably should work TODO check

	// var id = parseInt(pieces[pieces.length - 1], 10);
	var user_code = pieces[pieces.length - 1];

	console.log('user_code', user_code)

	obj.attributes.forEach(function (item) {

		if (item.attribute_type_object && item.attribute_type_object.user_code === user_code) {

			if (column.value_type === 20 && item.value_float) {

				rawTextResult = item.value_float;

			}

			if (column.value_type === 10 && item.value_string) {
				rawTextResult = stringHelper.parseAndInsertHyperlinks(item.value_string, "class='openLinkInNewTab'");

			}

			if (column.value_type === 30 && item.classifier_object) {
				rawTextResult = item.classifier_object.name;
			}

			if (column.value_type === 40 && item.value_date) {
				rawTextResult = item.value_date;
			}

		}

	});

	return {
		html_result: rawTextResult,
		numeric_result: null,
		raw_text_result: rawTextResult,
	};

};

var getValue = function (obj, column) {

	if (column.status === 'missing') {
		return {
			html_result: 'Deleted',
			numeric_result: null,
			raw_text_result: 'Deleted'
		};
	}

	var result = {
		html_result: '',
		numeric_result: null,
		raw_text_result: ''
	};

	var rawTextResult = '';

	if (obj[column.key] != null && obj[column.key] !== undefined) {

		if (typeof obj[column.key] === 'string') {

			if (column.key === 'status') {


				// STATUS_ERROR = 'E'
				// STATUS_SKIP = 'S'
				// STATUS_CREATED = 'C'
				// STATUS_OVERWRITTEN = 'O'

				var statusKey = obj[column.key];
				rawTextResult = statusData[statusKey];

			}
			else if(column.key === 'procedure_modified_datetime' || column.key === 'created' || column.key === 'modified') {

				rawTextResult = moment(obj[column.key]).format('YYYY-MM-DD HH:mm:ss')

			}
			else {

				var aElem = stringHelper.parseAndInsertHyperlinks(obj[column.key], "class='openLinkInNewTab'");

				return {
					html_result: aElem,
					numeric_result: null,
					raw_text_result: obj[column.key] || '',
				};

			}
		}
		else if (typeof obj[column.key] === 'number') {
			/* if (obj[column.key + '_object'] && obj[column.key + '_object'].user_code) {
				return obj[column.key + '_object'].user_code;
			} */
			if (obj[column.key + '_object']) { // cell value is id of relation

				if (obj[column.key + '_object'].name) {

					if (obj[column.key + '_object'].short_name) {

						rawTextResult = obj[column.key + '_object'].short_name;

					} else {
						rawTextResult = obj[column.key + '_object'].name;
					}

				} else if (column.key === 'price_download_scheme') {

					rawTextResult = obj[column.key + '_object'].user_code;

				}

			}
			else if (column.key === 'status') {

				var statusKey = obj[column.key];
				rawTextResult = statusData[statusKey];

			} else {

				rawTextResult = renderHelper.formatValue(obj, column);

				result.numeric_result = rawTextResult;

			}

			// return obj[column.key]

		}
		else if (Array.isArray(obj[column.key])) {

			rawTextResult = '[' + obj[column.key].length + ']';

		}
		else if (typeof obj[column.key] === 'boolean') {

			rawTextResult = obj[column.key] ? 'True' : 'False';

		}

	}

	if (column.attribute_type || column.key.indexOf('attributes.') !== -1) { // TODO check what is wrong
		// why attribute_type is missing on column with user attribute

		return getAttributeTypeValue(obj, column);

	}

	result.html_result = rawTextResult;
	result.raw_text_result = rawTextResult;

	return result;

};

var addReconColorization = function (obj, classList, viewContext, verticalAdditions) {

	if (verticalAdditions.isOpen && verticalAdditions.type === 'reconciliation' || viewContext === 'reconciliation_viewer') {

		var status = 'no-recon-fields-row';

		if (obj.hasOwnProperty('fields') && obj.fields.length) {

			status = 'row-recon-matched';

			// MATCHED = 1
			// CONFLICT = 2
			// RESOLVED = 3
			// IGNORE = 4
			// AUTO_MATCHED = 5

			for (var i = 0; i < obj.fields.length; i = i + 1) {

				if (!obj.fields[i].status) {
					status = 'row-recon-new';
					break;
				}

				if (obj.fields[i].status === 2) {
					status = 'row-recon-conflict';
					break;
				}

				if (obj.fields[i].status === 5) {
					status = 'row-recon-auto-matched';
					break;
				}

			}

		}

		if (obj.hasOwnProperty('recon_fields') && obj.recon_fields.length) {

			status = 'row-recon-matched';

			// MATCHED = 1
			// UNMATCHED = 2
			// AUTO_MATCHED = 3
			// IGNORE = 4

			for (var i = 0; i < obj.recon_fields.length; i = i + 1) {

				if (obj.recon_fields[i].status !== 1) {
					status = 'row-recon-unmatched';
					break;
				}

				if (obj.recon_fields[i].status === 3) {
					status = 'row-recon-auto-matched';
					break;
				}
			}


		}

		if (obj.is_canceled) {
			status = 'row-recon-canceled';
		}

		classList.push(status)

	}

};

var getCellTextAlign = function (column) {

	var result = '';

	if (column.style && column.style.text_align) {
		result = ' text-' + column.style.text_align;
	}

	return result;

};

var getCellClasses = function (column, valueObj) {

	var result = [];

	var textAlign = getCellTextAlign(column);

	if (textAlign) {
		result.push(textAlign);
	}

	if (valueObj.numeric_result !== null && valueObj.numeric_result !== undefined) {

		var colorNegative = renderHelper.getColorNegativeNumber(valueObj.numeric_result, column);

		if (colorNegative) {
			result.push(colorNegative);
		}

	}

	return result;

};

var getRowGeneralClasses = function (obj, classList, markedRows) {

	if (obj.___context_menu_is_opened) {
		classList.push('context-menu-opened');
	}

	if (obj.___is_active_object) {
		classList.push('is-active-object');
	}

	if (obj.___is_activated) {
		classList.push('selected');
	}

	if (obj.is_deleted) {
		classList.push('deleted');
	}

}

var render = function (evDataService, obj, columns, currentMember, viewContext, verticalAdditions, markedRows) {

	var classList = ['g-row'];

	var rowSelection;
	var rowHeight = evDataService.getRowHeight();

	getRowGeneralClasses(obj, classList);
	// rowSelection = '<div class="g-row-selection">' + getIcon(obj, currentMember, classList) + '</div>';
	rowSelection = renderHelper.getRowSelectionElem(obj);

	var rowColor = 'none';

	if (markedRows.hasOwnProperty(obj.id)) {

		rowColor = markedRows[obj.id].color;
		classList.push('g-row-marked-' + rowColor);

	}

	var statusIcon = getStatusIcon(obj, currentMember);
	var rowSettings = renderHelper.getRowSettings(obj.___type, rowColor, statusIcon);

	addReconColorization(obj, classList, viewContext, verticalAdditions);

	var classes = classList.join(' ');

	var offsetTop = obj.___flat_list_offset_top_index * rowHeight;

	var result = '<div class="' + classes + '" style="top: ' + offsetTop + 'px" data-type="object" data-object-id="' + obj.___id + '" data-parent-group-hash-id="' + obj.___parentId + '">';
	var cell;

	result = result + rowSelection + rowSettings;

	obj.___cells_values = [];
	// console.log('render.columns', columns);

	columns.forEach(function (column, columnIndex) {

		var columnNumber = columnIndex + 1;

		/*var cellValue = getValue(obj, column);
		var textAlign = getCellTextAlign(column);*/
		var value_obj = getValue(obj, column);

		var gCellTitle = '';

		var cellClassesList = getCellClasses(column, value_obj);
		var cellClasses = cellClassesList.join(' ');

		obj.___cells_values.push({
			classList: cellClassesList,
			value: value_obj.html_result
		});

		/*if (cellValue !== '') {
			gCellTitle = ' title="' + cellValue + '"';
			cellValue = '<span class="g-cell-content">' + cellValue + '</span>';
		}*/

		var resultValue = '';

		if (value_obj.html_result) {
			resultValue = '<span class="g-cell-content">' + value_obj.html_result + '</span>';
		}

		if (value_obj.raw_text_result) {
			gCellTitle = ' title="' + value_obj.raw_text_result + '"'
		}

		cell = '<div data-column="' + columnNumber + '" class="g-cell-wrap" style="width: ' + column.style.width + '">' +
			// '<div class="g-cell' + textAlign + ' cell-status-' + column.status + '"' + gCellTitle + '>' +
			'<div class="g-cell' + ' cell-status-' + column.status + ' ' + cellClasses + '"' + gCellTitle + '>' +
			'<div class="g-cell-content-wrap">' +
			resultValue +
			'</div>' +
			'</div>' +
			'</div>';

		result = result + cell

	});

	result = result + '</div>';

	return result;

};

export default {
	render: render,
}
