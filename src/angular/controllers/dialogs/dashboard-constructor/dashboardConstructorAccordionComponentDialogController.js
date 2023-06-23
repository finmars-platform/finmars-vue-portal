/**
 * Created by szhitenev on 22.01.2020.
 */

export default function ($scope, $mdDialog, item, dataService, eventService) {
	var vm = this
	vm.processing = false

	if (item) {
		vm.item = item
	} else {
		vm.item = {
			type: 'accordion',
			id: null, // should be generated before create
			name: '',
			settings: {},
		}
	}

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.agree = function () {
		vm.componentsTypes = dataService.getComponents()

		if (vm.item.id) {
			dataService.updateComponentById(vm.item)
		} else {
			var pattern = new Date().getTime() + '_' + vm.componentsTypes.length

			vm.item.id = dataService.___generateId(pattern)

			vm.componentsTypes.push(vm.item)
		}

		dataService.setComponents(vm.componentsTypes)

		$mdDialog.hide({ status: 'agree' })
	}

	vm.init = function () {}

	vm.init()
}
