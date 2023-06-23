import renderHelper from '../../helpers/render.helper'
import stringHelper from '../../helpers/stringHelper'

var checkIcon = renderHelper.getIconByKey('checkIcon')

var render = function (evDataService, group, groupTypes) {
	var groupType = groupTypes[group.___level - 1]

	var rowHeight = evDataService.getRowHeight()

	var foldButton =
		'<div class="g-group-fold-button"><div class="ev-fold-button" data-type="foldbutton" data-object-id="' +
		group.___id +
		'" data-parent-group-hash-id="' +
		group.___parentId +
		'">+</div></div>'

	if (group.___is_open) {
		foldButton =
			'<div class="g-group-fold-button"><div class="ev-fold-button" data-type="foldbutton" data-object-id="' +
			group.___id +
			'" data-parent-group-hash-id="' +
			group.___parentId +
			'">-</div></div>'
	}

	var classList = ['g-group-holder', 'g-row']
	classList.push('level-' + group.___level)

	var rowSelection

	if (group.___is_activated) {
		classList.push('selected')
		rowSelection = '<div class="g-row-selection">' + checkIcon + '</div>'
	} else {
		rowSelection = '<div class="g-row-selection"></div>'
	}

	var classes = classList.join(' ')

	var additionalText = ''

	if (groupType.value_type === 'field') {
		additionalText = additionalText + ' (' + group.___group_identifier + ')'
		additionalText = stringHelper.parseAndInsertHyperlinks(
			additionalText,
			"class='openLinkInNewTab'"
		)
	}

	var groupName = group.___group_name

	if (groupName && typeof groupName === 'string') {
		groupName = stringHelper.parseAndInsertHyperlinks(
			groupName,
			"class='openLinkInNewTab'"
		)
	}

	var offsetTop = group.___flat_list_offset_top_index * rowHeight

	return (
		'<div class="' +
		classes +
		'" style="top: ' +
		offsetTop +
		'px" data-type="group" data-object-id="' +
		group.___id +
		'" data-parent-group-hash-id="' +
		group.___parentId +
		'">' +
		rowSelection +
		foldButton +
		groupName +
		additionalText +
		'</div>'
	)
}

export default {
	render: render,
}
