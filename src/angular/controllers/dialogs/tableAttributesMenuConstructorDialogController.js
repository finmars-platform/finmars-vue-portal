/**
 * Created by mevstratov on 13.01.2019.
 */

export default function ($scope, $mdDialog, data) {
	var vm = this

	vm.title = data.title || 'Available attributes'

	vm.availableAttrs = data.availableAttrs

	vm.selectedAttrs = []
	if (data.selectedAttrs) {
		vm.selectedAttrs = JSON.parse(JSON.stringify(data.selectedAttrs))
	}

	vm.isReport = data.isReport || false

	var setAttrsOrder = function () {
		for (var i = 0; i < vm.selectedAttrs.length; i++) {
			vm.selectedAttrs[i].order = i
		}
	}

	vm.moveUp = function (attrIndex) {
		var prevItemIndex = attrIndex - 1

		if (prevItemIndex >= 0) {
			var attrToMove = JSON.parse(JSON.stringify(vm.selectedAttrs[attrIndex]))
			attrToMove.order = attrToMove.order - 1

			vm.selectedAttrs[attrIndex] = vm.selectedAttrs[prevItemIndex]
			vm.selectedAttrs[attrIndex].order += 1
			vm.selectedAttrs[prevItemIndex] = attrToMove
		}
	}

	vm.moveDown = function (attrIndex) {
		var nextItemIndex = attrIndex + 1

		if (vm.selectedAttrs[nextItemIndex]) {
			var itemToMove = JSON.parse(JSON.stringify(vm.selectedAttrs[attrIndex]))
			itemToMove.order = itemToMove.order + 1

			vm.selectedAttrs[attrIndex] = vm.selectedAttrs[nextItemIndex]
			vm.selectedAttrs[attrIndex].order -= 1
			vm.selectedAttrs[nextItemIndex] = itemToMove
		}
	}

	var updateAvailableAttrs = function (attrKey) {
		for (var i = 0; i < vm.availableAttrs.length; i++) {
			if (vm.availableAttrs[i].key === attrKey) {
				vm.availableAttrs.splice(i, 1)
				break
			}
		}
	}

	vm.openAttributeSelector = function ($event) {
		$mdDialog
			.show({
				controller: 'TableAttributeSelectorDialogController as vm',
				templateUrl: 'views/dialogs/table-attribute-selector-dialog-view.html',
				targetEvent: $event,
				multiple: true,
				locals: {
					data: {
						availableAttrs: vm.availableAttrs,
						title: 'Select Column',
						isReport: vm.isReport,
						multiselector: true,
					},
				},
			})
			.then(function (res) {
				if (res && res.status === 'agree') {
					res.data.items.forEach(function (attrToAdd) {
						var keyOfAddedAttr = attrToAdd.key

						var attributeData = {
							attribute_data: attrToAdd,
							layout_name: '',
							order: vm.selectedAttrs.length,
						}

						vm.selectedAttrs.push(attributeData)

						updateAvailableAttrs(keyOfAddedAttr)
					})

					setAttrsOrder()
				}
			})
	}

	vm.changeAttributeOfMenuPosition = function (attribute, $event) {
		var attributeData = JSON.parse(JSON.stringify(attribute.attribute_data))

		$event.preventDefault()

		$mdDialog
			.show({
				controller: 'TableAttributeSelectorDialogController as vm',
				templateUrl: 'views/dialogs/table-attribute-selector-dialog-view.html',
				targetEvent: $event,
				multiple: true,
				locals: {
					data: {
						availableAttrs: vm.availableAttrs,
						title: 'Select Column',
						isReport: false,
					},
				},
			})
			.then(function (res) {
				if (res && res.status === 'agree') {
					var keyOfAddedAttr = res.data.items[0].key

					attribute.attribute_data = res.data.items[0]

					updateAvailableAttrs(keyOfAddedAttr)
					vm.availableAttrs.push(attributeData)
				}
			})
	}

	vm.deleteAttr = function ($index, attributeData) {
		vm.selectedAttrs.splice($index, 1)
		vm.availableAttrs.push(attributeData)

		setAttrsOrder()
	}

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.agree = function () {
		var selectedAttrs = null

		if (vm.selectedAttrs && vm.selectedAttrs.length > 0) {
			selectedAttrs = JSON.parse(angular.toJson(vm.selectedAttrs))
		}

		$mdDialog.hide({ status: 'agree', selectedAttrs: selectedAttrs })
	}

	if (vm.selectedAttrs && vm.selectedAttrs.length > 0) {
		vm.availableAttrs = vm.availableAttrs.filter(function (attr) {
			for (var i = 0; i < vm.selectedAttrs.length; i++) {
				if (vm.selectedAttrs[i].attribute_data.key === attr.key) {
					return false
				}
			}

			return true
		})
	}
}
