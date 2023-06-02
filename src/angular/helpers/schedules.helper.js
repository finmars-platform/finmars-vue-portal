import ScrollHelper from './scrollHelper'
const scrollHelper = new ScrollHelper()

const createDragAndDropObject = function ($scope, viewModel) {
	setTimeout(() => {
		const scrollElem = document.querySelector(
			'.pricingSchedulesScrollElemOnDrag'
		)
		scrollHelper.setDnDScrollElem(scrollElem)
	})

	return {
		init: function () {
			this.dragulaInit()
			this.eventListeners()
			viewModel.dragAndDropInited = true
		},

		eventListeners: function () {
			var drake = this.dragula

			drake.on('drag', function () {
				scrollHelper.enableDnDWheelScroll()
			})

			drake.on('drop', function (elem, target, source, nextSiblings) {
				var draggedRowOrder = parseInt(elem.dataset.rowOrder)
				var siblingRowOrder = null
				if (nextSiblings) {
					siblingRowOrder = parseInt(nextSiblings.dataset.rowOrder)
				}

				var rowToInsert = viewModel.schedule.procedures[draggedRowOrder]
				viewModel.schedule.procedures.splice(draggedRowOrder, 1)

				if (siblingRowOrder !== null) {
					for (var i = 0; i < viewModel.schedule.procedures.length; i++) {
						if (viewModel.schedule.procedures[i].order === siblingRowOrder) {
							viewModel.schedule.procedures.splice(i, 0, rowToInsert)
							break
						}
					}
				} else {
					viewModel.schedule.procedures.push(rowToInsert)
				}

				for (var i = 0; i < viewModel.schedule.procedures.length; i++) {
					viewModel.schedule.procedures[i].order = i
				}

				$scope.$apply()
			})

			drake.on('dragend', function (elem) {
				scrollHelper.disableDnDWheelScroll()
			})
		},

		dragulaInit: function () {
			var items = [document.querySelector('.pricingSchedulesTableRowsHolder')]

			this.dragula = dragula(items, {
				moves: function () {
					return viewModel.dragIconGrabbed
				},
				revertOnSpill: true,
			})
		},
	}
}

export default {
	createDragAndDropObject: createDragAndDropObject,
}
