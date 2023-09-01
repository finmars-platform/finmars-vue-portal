/**
 * Created by szhitenev on 09.12.2019.
 */

import ScrollHelper from '@/angularlpers/scrollHelper'

var scrollHelper = new ScrollHelper()

module.exports = function transactionImportSchemeSelectorValuesDialogController(
	$scope,
	$mdDialog,
	commonDialogsService,
	data
) {
	var vm = this

	vm.scheme = data.scheme

	vm.dragAndDropInited = false

	vm.selectorValues = {
		value: JSON.parse(angular.toJson(vm.scheme.selector_values)),
	}

	vm.filterTerms = {
		value: '',
		notes: '',
	}

	var updateOrder = function (item, index) {
		item.order = index
		return item
	}

	vm.deleteSelector = function ($event, $index) {
		vm.selectorValues.value.splice($index, 1)
		vm.selectorValues.value = vm.selectorValues.value.map(updateOrder)
	}

	vm.addSelector = function () {
		vm.selectorValues.value.push({
			value: '',
			notes: '',
			order: vm.selectorValues.value.length,
		})
	}

	vm.dragIconGrabbed = false

	var turnOffDragging = function () {
		vm.dragIconGrabbed = false
	}

	vm.turnOnDragging = function () {
		vm.dragIconGrabbed = true
		document.body.addEventListener('mouseup', turnOffDragging, {
			once: true,
		})
	}

	vm.dragAndDrop = {
		init: function () {
			this.dragulaInit()
			this.eventListeners()
			vm.dragAndDropInited = true
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

				var rowToInsert = vm.selectorValues.value[draggedRowOrder]
				vm.selectorValues.value.splice(draggedRowOrder, 1)

				if (siblingRowOrder) {
					for (var i = 0; i < vm.selectorValues.value.length; i++) {
						if (vm.selectorValues.value[i].order === siblingRowOrder) {
							vm.selectorValues.value.splice(i, 0, rowToInsert)
							break
						}
					}
				} else {
					vm.selectorValues.value.push(rowToInsert)
				}

				/*for (var i = 0; i < vm.selectorValues.value.length; i++) {
                        vm.selectorValues.value[i].order = i;
                    }*/
				vm.selectorValues.value = vm.selectorValues.value.map(updateOrder)
			})

			drake.on('dragend', function (elem) {
				scrollHelper.disableDnDWheelScroll()
			})
		},

		dragulaInit: function () {
			var items = [
				document.querySelector('.transactionImportSchemeSelectorValues'),
			]

			this.dragula = dragula(items, {
				moves: function () {
					if (
						vm.dragIconGrabbed &&
						!vm.filterTerms.value &&
						!vm.filterTerms.notes
					) {
						return true
					}

					return false
				},
				revertOnSpill: true,
			})
		},
	}

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.agree = function () {
		var thereAreEmptyVals = false
		var duplicatedValsList = []

		vm.selectorValues.value.forEach(function (valueData, index) {
			if (duplicatedValsList.indexOf(valueData.value) > -1) {
				// values already marked as duplicated
				return
			}

			if (!valueData.value) {
				thereAreEmptyVals = true
				return
			}

			var valIndex = vm.selectorValues.value.findIndex(function (vData) {
				return valueData.value === vData.value
			})

			if (valIndex !== index) {
				duplicatedValsList.push(valueData.value)
			}
		})

		if (duplicatedValsList.length) {
			commonDialogsService.warning({
				warning: {
					description:
						'Value should be unique. Please delete duplicates for this values: ' +
						duplicatedValsList.join(', '),
				},
			})

			return
		}

		if (thereAreEmptyVals) {
			commonDialogsService.warning({
				warning: {
					description: 'Values should not be empty',
				},
			})

			return
		}

		$mdDialog.hide({ status: 'agree', data: vm.selectorValues.value })
	}

	var init = function () {
		var DnDScrollElem = document.querySelector('.vc-dnd-scrollable-elem')
		scrollHelper.setDnDScrollElem(DnDScrollElem)

		/* vm.selectorValues.value.forEach(function (row, index) {
                if (!row.order) {
                    row.order = index;
                }
            }); */
		vm.selectorValues.value = vm.selectorValues.value.map(updateOrder)
	}

	init()
}
