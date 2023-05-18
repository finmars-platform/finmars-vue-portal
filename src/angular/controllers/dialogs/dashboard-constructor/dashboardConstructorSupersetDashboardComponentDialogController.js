/**
 * Created by szhitenev on 28.06.2016.
 */

export default function dashboardConstructorSupersetDashboardComponentDialogController(
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

	console.log('item', item)

	if (item) {
		vm.item = item
	} else {
		vm.item = {
			type: 'superset_dashboard',
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
		console.log('vm.item', vm.item)

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
		console.log('dataService', dataService)

		vm.componentsTypes = dataService.getComponents()

		console.log('vm.item.settings', vm.item)
	}

	vm.init()
}
