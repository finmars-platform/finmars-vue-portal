/**
 * Created by szhitenev on 07.10.2022.
 */

export default function dashboardConstructorFinmarsWidgetComponentDialogController(
	$scope,
	$mdDialog,
	metaContentTypesService,
	uiService,
	dashboardConstructorMethodsService,
	item,
	dataService,
	eventService
) {
	var vm = this



	if (item) {
		vm.item = item
	} else {
		vm.item = {
			type: 'finmars_widget',
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
			/*vm.componentsTypes = vm.componentsTypes.map(function (item) {

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

	// Victor 2020.10.26 Issue #47
	vm.exportToDashboards = function () {
		dashboardConstructorMethodsService.exportComponentToDashboards(
			vm,
			$mdDialog,
			dataService
		)
	}

	vm.init = function () {


		vm.componentsTypes = dataService.getComponents()


	}

	vm.init()
}
