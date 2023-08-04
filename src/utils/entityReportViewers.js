/**
 * Turn table attribute into group, column or filter
 * @param {string} form - In what form get attribute. Can be 'column', 'group', 'filter'.
 * @param {object} attrInstance - Object with attribute data on which attribute form will be based
 * @return {object} Return attribute in form of group, column or filter
 */
export const getEvRvAttrInFormOf = function (form, attrInstance) {
	let attrTypeToAdd = {};

	attrTypeToAdd.key = attrInstance.key;

	if (form === 'group' || form === 'column') {

		if ( attrInstance.hasOwnProperty('entity') ) {
			attrTypeToAdd.entity = attrInstance.entity;
		}

		if ( attrInstance.hasOwnProperty('id') ) {
			attrTypeToAdd.id = attrInstance.id;
		}

	}

	if ( attrInstance.hasOwnProperty('groups') ) {
		attrTypeToAdd.groups = attrInstance.groups;
	}

	if ( attrInstance.hasOwnProperty('columns') ) {
		attrTypeToAdd.columns = attrInstance.columns;
	}

	if ( attrInstance.hasOwnProperty('filters') ) {
		attrTypeToAdd.filters = attrInstance.filters;
	}

	attrTypeToAdd.name = attrInstance.name;
	attrTypeToAdd.value_type = attrInstance.value_type;

	if (attrInstance.layout_name) {
		attrTypeToAdd.layout_name = attrInstance.layout_name;
	}

	if (!attrTypeToAdd.options) {
		attrTypeToAdd.options = {};
	}

	switch (form) {

		case 'group':
			attrTypeToAdd.groups = true;

			attrTypeToAdd.options.sort = null;
			attrTypeToAdd.options.sort_settings = {};

			break;

		case 'column':

			attrTypeToAdd.columns = true;

			attrTypeToAdd.options.sort = null;
			attrTypeToAdd.options.sort_settings = {};

			break;

		case 'filter':

			attrTypeToAdd.filters = true;

			if (!attrTypeToAdd.options.filter_type) {
				attrTypeToAdd.options.filter_type = metaHelper.getDefaultFilterType(attrTypeToAdd.value_type);
			}

			if (!attrTypeToAdd.options.filter_values) {
				attrTypeToAdd.options.filter_values = [];
			}

			if (!attrTypeToAdd.options.hasOwnProperty('exclude_empty_cells')) {
				attrTypeToAdd.options.exclude_empty_cells = false;
			}

			break;
	}

	if (form === 'group' || form === 'column') {

		attrTypeToAdd.style = {
			width: evDataHelper.getColumnWidth(attrTypeToAdd)
		}

	}

	return attrTypeToAdd;

}
