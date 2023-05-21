<template>
	<div class="resize-slider" :ref="(el) => (elem = jquery(el))"></div>
</template>

<script setup>
	import evEvents from '@/angular/services/entityViewerEvents'
	import jquery from 'jquery'

	let elem = ref(null)

	var scrollableArea
	var evContent
	var minWidth = 65

	onMounted(() => {
		init()
	})

	function init() {
		// initColumnSliderListener();
		elem.value[0].addEventListener('mousedown', onColSliderMousedown)

		resizeScrollableArea()

		rtIndex = evEventService.addEventListener(
			evEvents.REDRAW_TABLE,
			function () {
				removeColSliderEventListeners()
				elem.value[0].addEventListener('mousedown', onColSliderMousedown)
				// initColumnSliderListener();
			}
		)

		uthcsIndex = evEventService.addEventListener(
			evEvents.UPDATE_TABLE_HEAD_COLUMNS_SIZE,
			function () {
				removeColSliderEventListeners()
				elem.value[0].addEventListener('mousedown', onColSliderMousedown)
				// initColumnSliderListener();
			}
		)

		ucsIndex = evEventService.addEventListener(
			evEvents.UPDATE_COLUMNS_SIZE,
			function () {
				removeColSliderEventListeners()
				elem.value[0].addEventListener('mousedown', onColSliderMousedown)
				// initColumnSliderListener();
			}
		)
	}
	function findColumnById(columnId) {
		var columns = evDataService.getColumns()
		var result

		columns.forEach(function (item) {
			if (item.___column_id === columnId) {
				result = item
			}
		})

		return result
	}

	function findColumnIndexById(columnId) {
		var columns = evDataService.getColumns()

		var result

		columns.forEach(function (item, index) {
			if (item.___column_id === columnId) {
				result = index
			}
		})

		return result
	}

	function updateColumn(column) {
		var columns = evDataService.getColumns()

		columns.forEach(function (item) {
			if (item.___column_id === column.___column_id) {
				item = column
			}
		})

		evDataService.setColumns(columns)
	}

	function updateCellsWidth(column, index) {
		if (!evContent) {
			evContent = elem.value
				.parents('.g-table-section')[0]
				.querySelector('.ev-content')
		}

		var columnNumber = index + 1

		var cells = evContent.querySelectorAll(
			".g-cell-wrap[data-column='" + columnNumber + "']"
		)

		for (var i = 0; i < cells.length; i = i + 1) {
			cells[i].style.width = column.style.width
		}
	}

	function toggleColumnNameTooltip(column) {
		if (column.width() <= minWidth && !column.hasClass('small-width')) {
			column.addClass('small-width')
		} else if (column.width() > minWidth && column.hasClass('small-width')) {
			column.removeClass('small-width')
		}
	}

	function resizeScrollableArea() {
		var viewContext = evDataService.getViewContext()
		var columns = evDataService.getColumns()

		var i
		var areaWidth = 0
		var columnMargins = 16
		var dropNewFieldWidth = 400
		if (viewContext === 'dashboard') {
			dropNewFieldWidth = 105
		}

		var buttonSelectAllWidth = 24

		if (!scrollableArea) {
			scrollableArea = elem.value
				.parents('.g-table-section')[0]
				.querySelector('.g-scrollable-area')
		}
		if (!evContent) {
			evContent = elem.value
				.parents('.g-table-section')[0]
				.querySelector('.ev-content')
		}

		for (i = 0; i < columns.length; i = i + 1) {
			var columnWidth = parseInt(columns[i].style.width.split('px')[0], 10)

			areaWidth = areaWidth + columnWidth + columnMargins
		}

		var resultWidth = areaWidth + dropNewFieldWidth

		var wrapperWidth = jquery('.ev-viewport').width()

		if (resultWidth < wrapperWidth) {
			resultWidth = wrapperWidth
			evContent.style.width = 'auto'
		} else {
			jquery(evContent).width(resultWidth + buttonSelectAllWidth)
		}

		jquery(scrollableArea).width(resultWidth)
	}

	function onColSliderMouseup(e) {
		jquery(window).unbind('mousemove')

		evEventService.dispatchEvent(evEvents.RESIZE_COLUMNS_END)
		// evEventService.dispatchEvent(evEvents.START_CELLS_OVERFLOW);
	}

	function onColSliderMousedown(e) {
		e.preventDefault()
		e.stopPropagation()

		evEventService.dispatchEvent(evEvents.RESIZE_COLUMNS_START)

		const isNewDesign = this.parentElement.classList.contains(
			'g-table-header-cell-wrapper'
		)

		var gColumnElem

		if (isNewDesign) {
			gColumnElem = jquery(this).parents('.g-table-header-cell-wrapper') // Victor 2020.12.16 New report viewer design
		} else {
			gColumnElem = jquery(this).parents('md-card.g-cell.g-column')
		}

		var column = findColumnById(gColumnElem[0].dataset.columnId)
		var columnIndex = findColumnIndexById(gColumnElem[0].dataset.columnId)

		var mouseDownLeft = e.clientX
		var diff
		var result
		var currentWidth = gColumnElem.width()

		jquery(window).bind('mousemove', function (e) {
			diff = e.clientX - mouseDownLeft

			result = currentWidth + diff

			if (result > 32) {
				gColumnElem.width(result)

				resizeScrollableArea()

				column.style.width = result + 'px'

				updateColumn(column)

				// utilsHelper.debounce(updateCellsWidth(column, columnIndex), 5);
				updateCellsWidth(column, columnIndex)

				toggleColumnNameTooltip(gColumnElem)
			}
		})

		// jquery(window).bind('mouseup', onColSliderMouseup);
		window.addEventListener('mouseup', onColSliderMouseup)
	}

	function removeColSliderEventListeners() {
		elem.value[0].removeEventListener('mousedown', onColSliderMousedown)
		window.removeEventListener('mouseup', onColSliderMouseup)
	}

	var rtIndex, uthcsIndex, ucsIndex

	onBeforeUnmount(() => {
		removeColSliderEventListeners()

		evEventService.removeEventListener(evEvents.REDRAW_TABLE, rtIndex)
		evEventService.removeEventListener(
			evEvents.UPDATE_TABLE_HEAD_COLUMNS_SIZE,
			uthcsIndex
		)
		evEventService.removeEventListener(evEvents.UPDATE_COLUMNS_SIZE, ucsIndex)
	})
</script>

<style lang="scss" scoped></style>
