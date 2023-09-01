/**
 * Created by szhitenev on 08.06.2016.
 */

export default function ($scope, $mdDialog, item, dataService, eventService) {
	var vm = this

	if (item) {
		vm.item = item
	} else {
		vm.item = {
			type: 'entity_viewer_split_panel',
			id: null, // should be generated before create
			name: '',
			settings: {},
		}
	}

	vm.componentsTypes = []

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.agree = function () {
		if (vm.item.id) {
			/* vm.componentsTypes = vm.componentsTypes.map(function (item) {

                    if (item.id === vm.item.id) {
                        return vm.item
                    }

                    return item;
                })*/
			dataService.updateComponentById(vm.item)
		} else {
			var pattern = new Date().getTime() + '_' + vm.componentsTypes.length

			vm.item.id = dataService.___generateId(pattern)

			vm.componentsTypes.push(vm.item)
		}

		dataService.setComponents(vm.componentsTypes)

		$mdDialog.hide({ status: 'agree' })
	}

	vm.init = function () {


		vm.componentsTypes = dataService.getComponents()
	}

	vm.init()
}
