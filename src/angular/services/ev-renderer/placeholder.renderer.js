function getRandomNumber(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min)
}

var render = function (evDataService, obj, columns) {
	var rowHeight = evDataService.getRowHeight()

	var rowSelection

	rowSelection = '<div class="g-row-selection"></div>'

	var offsetTop = obj.___flat_list_offset_top_index * rowHeight

	var result = '<div class="placeholder-row" style="top: ' + offsetTop + 'px" >'
	var cell

	result = result + rowSelection

	var width = [30, 40, 60, 80, 100]

	columns.forEach(function (column, columnIndex) {
		var columnNumber = columnIndex + 1
		var index = getRandomNumber(0, 4)

		var widthClass = 'width-' + width[index]

		cell =
			'<div data-column="' +
			columnNumber +
			'" class="g-cell-wrap" style="width: ' +
			column.style.width +
			'"><div class="g-cell"><div class="g-cell-content-wrap"><span class="placeholder-text ' +
			widthClass +
			'"></span></div></div></div>'

		result = result + cell
	})

	result = result + '</div>'

	return result
}

export default {
	render: render,
}
