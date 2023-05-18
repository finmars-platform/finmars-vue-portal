export default function ($scope, $mdDialog, data) {
	var vm = this

	vm.itemsSearchTerm = ''
	vm.collapsingGroups = {}
	vm.groups = []

	if (data.groups) {
		vm.groups = JSON.parse(JSON.stringify(data.groups))
	}

	var options = data.options || {}
	vm.dialogTitle = data.title
	vm.isMultiselector = options.multiselector
	vm.allItemsActive = false

	var activeItem

	vm.expandAll = function () {
		var keys = Object.keys(vm.collapsingGroups)

		keys.forEach(function (key) {
			vm.collapsingGroups[key] = false
		})
	}

	vm.collapseAll = function () {
		var keys = Object.keys(vm.collapsingGroups)

		keys.forEach(function (key) {
			vm.collapsingGroups[key] = true
		})
	}

	vm.toggleAllItems = function () {
		vm.allItemsActive = !vm.allItemsActive

		vm.groups.forEach(function (group) {
			vm.toggleGroupItems(group, vm.allItemsActive)
		})
	}

	vm.toggleGroupItems = function (group, isActive) {
		if (isActive) {
			group.isActive = isActive
		} else {
			group.isActive = !group.isActive
		}

		group.content.forEach(function (item) {
			item.isActive = group.isActive
		})

		vm.allItemsActive = checkWhetherIsActive(vm.groups)
	}

	var setItemsContainersHeight = function () {
		// for collapse animation

		var resizableItemsWrapList = document.querySelectorAll('.cb1-resizing-wrap')

		for (var i = 0; i < resizableItemsWrapList.length; i++) {
			var itemsWrap = resizableItemsWrapList[i]
			var itemsHolder = itemsWrap.querySelector('.selectorWgItemsHolder')

			var itemsHolderHeight = itemsHolder.clientHeight + 'px'
			itemsWrap.style.height = itemsHolderHeight
		}
	}

	vm.setGIHeight = function () {
		setTimeout(function () {
			setItemsContainersHeight()
		}, 100)
	}

	/* vm.isLayoutSelected = function (itemId) {

            for (var i = 0; i < vm.selectedItems.length; i++) {

                if (vm.selectedItems[i].id === itemId) {
                    return true;
                }

            }

            return false;

        }; */

	var checkWhetherIsActive = function (itemsList) {
		for (var i = 0; i < itemsList.length; i++) {
			if (!itemsList[i].isActive) {
				return false
			}
		}

		return true
	}

	vm.agree = function () {
		var resData = {}

		if (vm.isMultiselector) {
			resData.selected = []

			vm.groups.forEach(function (group) {
				var activeGroupItems = group.content.filter(function (item) {
					return item.isActive
				})

				resData.selected = resData.selected.concat(activeGroupItems)
			})
		} else {
			resData.selected = vm.groups[activeItem.gOrder].content[activeItem.iOrder]
		}

		$mdDialog.hide({
			status: 'agree',
			data: resData,
		})
	}

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	var init = function () {
		setTimeout(function () {
			vm.dialogElemToResize = document.querySelector('.iSelectorWgElemToResize')
			$scope.$apply()
		}, 100)

		vm.groups.forEach(function (group, gIndex) {
			vm.collapsingGroups[group.id] = false
			group.order = gIndex

			group.content.forEach(function (item, iIndex) {
				item.order = iIndex
			})
		})

		if (vm.isMultiselector) {
			vm.toggleItem = function (group, item) {
				item.isActive = !item.isActive
				group.isActive = checkWhetherIsActive(group.content)
				vm.allItemsActive = checkWhetherIsActive(vm.groups)
			}
		} else {
			vm.toggleItem = function (group, item) {
				/* var i, a;
                    loop1: for (i = 0; i < vm.groups.length; i++) { // deactivate previous active item

                        for (a = 0; a < vm.groups[i].content.length; a++) {

                            if (vm.groups[i].content[a].id !== item.id &&
                                vm.groups[i].content[a].isActive) {

                                break loop1;

                            }

                        }

                    } */
				if (!item.isActive && activeItem) {
					// deactivate previous active item
					vm.groups[activeItem.gOrder].content[
						activeItem.iOrder
					].isActive = false
				}

				activeItem = { gOrder: group.order, iOrder: item.order }
				item.isActive = true
			}
		}

		vm.setGIHeight()
	}

	init()
}
