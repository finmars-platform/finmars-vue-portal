import uiService from '../../services/uiService'

export default function ($scope, $mdDialog, data, entityViewerDataService) {
	var vm = this

	vm.column = null
	vm.layout = null

	vm.selectAll = false

	vm.readyStatus = { content: false }

	vm.newValues = []

	vm.agree = function ($event) {
		let response = {
			status: 'agree',
		}

		if (vm.layout.id) {
			uiService
				.updateColumnSortData(vm.layout.id, vm.layout)
				.then(function (data) {
					response.data = data
					$mdDialog.hide(response)
				})
		} else {
			uiService.createColumnSortData(vm.layout).then(function (data) {
				response.data = data
				$mdDialog.hide(response)
			})
		}
	}

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.toggleSelectAll = function () {
		vm.selectAll = !vm.selectAll

		vm.newValues = vm.newValues.map(function (item) {
			item.selected = vm.selectAll

			return item
		})
	}

	vm.addSelectedValues = function () {
		vm.newValues.forEach((item, index) => {
			if (item.selected) {
				vm.layout.data.items.push({
					order: vm.layout.data.items.length,
					value: item.value,
				})
			}
		})

		vm.newValues = vm.newValues.filter(function (item) {
			return !item.selected
		})
	}

	vm.syncDataStructure = function () {
		if (!vm.layout.data.items) {
			vm.layout.data.items = []
		}

		var flatListItems = entityViewerDataService.getFlatList()
		var uniqueColumnValues = []
		var value

		flatListItems.forEach(function (flatListItem) {
			if (flatListItem.___type === 'object') {
				value = flatListItem[vm.column.key]

				if (uniqueColumnValues.indexOf(value) === -1) {
					uniqueColumnValues.push(value)
				}
			}
		})

		if (vm.layout.data.items.length) {
			// if existing layout opened, group values into selected and not

			// var exist = false;

			uniqueColumnValues.forEach(function (value, index) {
				/*exist = false;

                    vm.layout.data.items.forEach(function (item) {

                        if (item.value === value) {
                            exist = true;
                        }

                    })

                    if (exist === false) {

                        vm.newValues.push({
                            order: vm.newValues.length,
                            value: value
                        })

                    } */

				let valueNotSelected = !vm.layout.data.items.find((item) => {
					return item.value === value
				})

				if (valueNotSelected) {
					vm.newValues.push({
						order: vm.newValues.length,
						value: value,
					})
				}
			})
		} else {
			uniqueColumnValues.forEach(function (value, index) {
				vm.layout.data.items.push({
					order: index,
					value: value,
				})
			})
		}


	}

	vm.moveUp = function (item) {
		/* var currentOrder = item.order
            var order;

            vm.layout.data.items = vm.layout.data.items.map(function (item, index) {

                order = index + 1;

                if (currentOrder === order) { // decrease order of current value
                    item.order = item.order - 1;
                }

                if (currentOrder - 1 === order) { // increase order of next value
                    item.order = item.order + 1;
                }

                return item


            })

            vm.layout.data.items = vm.layout.data.items.sort(function (a, b) {
                return a.order - b.order
            })*/
		const itemIndex = item.order
		const prevItemIndex = itemIndex - 1

		if (prevItemIndex >= 0) {
			const itemToMove = JSON.parse(
				angular.toJson(vm.layout.data.items[itemIndex])
			)
			itemToMove.order -= 1

			vm.layout.data.items[itemIndex] = vm.layout.data.items[prevItemIndex]
			vm.layout.data.items[itemIndex].order += 1

			vm.layout.data.items[prevItemIndex] = itemToMove
		}
	}

	vm.moveDown = function (item) {
		/* var currentOrder = item.order
            var order;

            vm.layout.data.items = vm.layout.data.items.map(function (item, index) {

                order = index + 1;

                if (currentOrder === order) { // increase order of current value
                    item.order = item.order + 1;
                }

                if (currentOrder + 1 === order) { // decrease order of next value
                    item.order = item.order - 1;
                }

                return item


            })

            vm.layout.data.items = vm.layout.data.items.sort(function (a, b) {
                return a.order - b.order
            }) */
		const itemIndex = item.order
		const nextItemIndex = itemIndex + 1

		if (vm.layout.data.items[nextItemIndex]) {
			const itemToMove = JSON.parse(
				angular.toJson(vm.layout.data.items[itemIndex])
			)
			itemToMove.order += 1

			vm.layout.data.items[itemIndex] = vm.layout.data.items[nextItemIndex]
			vm.layout.data.items[itemIndex].order -= 1

			vm.layout.data.items[nextItemIndex] = itemToMove
		}
	}

	vm.delete = function (item) {
		/*var currentOrder = item.order
            var order;

            vm.layout.data.items = vm.layout.data.items.filter(function (item, index) {

                order = index + 1;

                return item.order !== currentOrder;

            })

            vm.layout.data.items = vm.layout.data.items.map(function (item, index) {

                order = index + 1;

                if (order > currentOrder) { // increase order of current value
                    item.order = item.order - 1;
                }

                return item


            })

            vm.layout.data.items = vm.layout.data.items.sort(function (a, b) {
                return a.order - b.order
            })*/

		vm.newValues.push({
			order: vm.newValues.length,
			value: item.value,
		})

		vm.layout.data.items.splice(item.order, 1)

		vm.layout.data.items = vm.layout.data.items.map((layout, index) => {
			layout.order = index
			return layout
		})
	}

	vm.addNewValue = function () {
		vm.layout.data.items.push({
			order: vm.layout.data.items.length,
			value: vm.newValue,
		})

		vm.newValue = null
	}

	vm.init = function () {


		vm.column = JSON.parse(angular.toJson(data.column))

		if (data.item) {
			vm.layout = data.item
		} else {
			vm.layout = {
				name: '',
				user_code: '',
				column_key: vm.column.key,
				data: {},
			}
		}

		vm.readyStatus.content = true

		if (entityViewerDataService) {
			vm.syncDataStructure()
		}
	}

	vm.init()
}
