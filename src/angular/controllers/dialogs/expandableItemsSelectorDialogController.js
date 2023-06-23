/**
 * Created by mevstratov on 13.01.2019.
 */

export default function ($scope, $mdDialog, data) {
	var vm = this
	vm.collapsingItems = {}

	if (data.items) {
		vm.items = JSON.parse(JSON.stringify(data.items))
	} else {
		vm.items = []
	}

	vm.isMultiselector = data.multiselector

	//var selectedData = null;

	vm.dialogTitle = 'Select item'
	if (data.dialogTitle) {
		vm.dialogTitle = data.dialogTitle
	}

	if (data.selectedItem) {
		for (var i = 0; i < vm.items.length; i++) {
			if (vm.items[i].id === data.selectedItem) {
				vm.items[i].isSelected = true
				//selectedData = vm.items[i];
				break
			}
		}
	}

	var setCollapsingContainersHeight = function () {
		// for collapse animation

		var resizableSubitemssWrapList =
			document.querySelectorAll('.cb1-resizing-wrap')

		for (var i = 0; i < resizableSubitemssWrapList.length; i++) {
			var subitemsWrap = resizableSubitemssWrapList[i]
			var subitemsHolder = subitemsWrap.querySelector('.subitemsHeightWrap')

			var subitemsHolderHeight = subitemsHolder.clientHeight + 'px'
			subitemsWrap.style.height = subitemsHolderHeight
		}
	}

	vm.setCCHeight = function () {
		setTimeout(function () {
			setCollapsingContainersHeight()
		}, 100)
	}

	vm.expandAll = function () {
		Object.keys(vm.collapsingItems).forEach(function (key) {
			vm.collapsingItems[key] = false
		})
	}

	vm.collapseAll = function () {
		Object.keys(vm.collapsingItems).forEach(function (key) {
			vm.collapsingItems[key] = true
		})
	}

	vm.toggleSubitemsCollapse = function (itemId, $event) {
		$event.stopPropagation()

		vm.collapsingItems[itemId] = !vm.collapsingItems[itemId]
	}

	vm.selectItem = function (item) {
		if (vm.isMultiselector) {
			if (item.isSelected) {
				item.isSelected = false
			} else {
				item.isSelected = true
			}
		} else {
			for (var i = 0; i < vm.items.length; i++) {
				vm.items[i].isSelected = false
			}

			item.isSelected = true
		}
	}

	vm.selectItemAndSave = function (item) {
		vm.selectItem(item)
		vm.agree()
	}

	vm.agree = function () {
		var selectedData = []

		vm.items.forEach(function (item) {
			if (item.isSelected) {
				if (vm.isMultiselector) {
					selectedData.push(item)
				} else {
					selectedData = item
				}
			}

			delete item.isSelected
			delete item.content
		})

		$mdDialog.hide({ status: 'agree', selected: selectedData })
	}

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	var init = function () {
		setTimeout(function () {
			vm.dialogElemToResize = document.querySelector(
				'.eItemsSelectorElemToResize'
			)
			$scope.$apply()
		}, 100)

		if (vm.items) {
			vm.items.forEach(function (item) {
				if (!item.content) {
					item.content = []
				} else if (item.content.length) {
					vm.collapsingItems[item.id] = false
				}
			})
		}

		setTimeout(function () {
			setCollapsingContainersHeight()
		}, 100)
	}

	init()
}
