/**
 * Created by szhitenev on 08.06.2016.
 */

export default function (
	$scope,
	$mdDialog,
	uiService,
	dashboardConstructorMethodsService,
	dashboardHelper,
	item,
	dataService,
	eventService,
	attributeDataService,
	multitypeFieldService,
	data
) {
	var vm = this

	vm.newFilter = {}

	vm.filterLinks = []
	vm.readyStatus = {
		layouts: false,
	}
	vm.componentsForMultiselector = []
	var componentsForLinking = dashboardHelper.getComponentsForLinking()

	if (item) {
		vm.item = item
	} else {
		vm.item = {
			type: 'report_viewer_grand_total',
			id: null, // should be generated before create
			name: '',
			settings: {
				entity_type: 'balance-report',
				components: {
					addEntityBtn: false,
					autoReportRequest: false,
					columnAreaHeader: true,
					fieldManagerBtn: false,
					groupingArea: false,
					layoutManager: false,
					sidebar: false,
					splitPanel: false,
				},
				grand_total_column: null,
			},
		}
	}

	vm.componentsTypes = []

	vm.layoutsByEntityType = {
		'balance-report': [],
		'pl-report': [],
		'transaction-report': [],
	}

	vm.layouts = []

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.getContentTypeByEntityType = function () {
		if (vm.item.settings.entity_type === 'balance-report') {
			return 'reports.balancereport'
		}

		if (vm.item.settings.entity_type === 'pl-report') {
			return 'reports.plreport'
		}

		if (vm.item.settings.entity_type === 'transaction-report') {
			return 'reports.transactionreport'
		}
	}

	vm.openNumberFormatSettings = function ($event) {
		$mdDialog
			.show({
				controller: 'NumberFormatSettingsDialogController as vm',
				templateUrl: 'views/dialogs/number-format-settings-dialog-view.html',
				targetEvent: $event,
				multiple: true,
				locals: {
					data: {
						settings: vm.item.settings.number_format,
					},
				},
			})
			.then(function (res) {
				if (res.status === 'agree') {
					vm.item.settings.number_format = res.data

					console.log(res)
				}
			})
	}

	/* vm.reportTypeChange = function(){

			vm.item.settings.layout = null;
			vm.item.settings.linked_components= {};

			vm.item.settings.grand_total_column = null;

			vm.getAttributes();
			vm.getLayouts();

		}; */
	vm.layoutsSelectorsList = multitypeFieldService
		.getReportLayoutsSelectorData()
		.map(function (type) {
			type.custom = {
				menuOptionsNotLoaded: true,
			}
			return type
		})

	vm.onLayoutEntityTypeChange = function (activeType) {
		/*vm.item.settings.entity_type = activeType.key;

			if (activeType.custom.menuOptionsNotLoaded) {

				activeType.fieldData.menuOptions = await vm.getLayouts();
				activeType.custom.menuOptionsNotLoaded = false;

				$scope.$apply();

			}*/
		dashboardConstructorMethodsService
			.onReportTypeChange(activeType, vm.item, vm.getLayouts, $scope)
			.then(function (item) {
				vm.layouts = vm.layoutsByEntityType[vm.item.settings.entity_type]
				vm.item = item

				vm.item.settings.linked_components = {}

				vm.item.settings.grand_total_column = null

				vm.getAttributes()
			})
	}

	vm.onLayoutChange = function () {
		var activeType = vm.layoutsSelectorsList.find(function (type) {
			return type.isActive
		})

		vm.item.settings.layout = activeType.model
	}

	vm.getLayouts = function () {
		return new Promise(function (resolve) {
			uiService
				.getListLayout(vm.item.settings.entity_type, { pageSize: 1000 })
				.then(function (data) {
					vm.layoutsByEntityType[vm.item.settings.entity_type] = data.results
					vm.layouts = data.results

					var layoutsForMultitypeSelector =
						dashboardHelper.getDataForLayoutSelectorWithFilters(vm.layouts)

					vm.showLinkingToFilters()

					$scope.$apply()

					resolve(layoutsForMultitypeSelector)
				})
				.catch(function (error) {
					console.error(error)
					resolve([])
				})
		})
	}

	vm.getAttributes = function () {
		vm.attributes = attributeDataService.getAllAttributesByEntityType(
			vm.item.settings.entity_type
		)
	}

	vm.agree = function () {
		var layoutName

		vm.layouts.forEach(function (layout) {
			if (layout.id === vm.item.settings.layout) {
				layoutName = layout.name
			}
		})

		vm.item.settings.layout_name = layoutName
		vm.item.settings.content_type = vm.getContentTypeByEntityType()

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

	vm.showLinkingToFilters = function () {
		for (var i = 0; i < vm.layouts.length; i++) {
			if (vm.layouts[i].id === vm.item.settings.layout) {
				var layout = vm.layouts[i]
				vm.linkingToFilters = dashboardHelper.getLinkingToFilters(layout)

				break
			}
		}
	}

	vm.clearSelect = function (item, propToDelete) {
		delete item[propToDelete]
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

		/*vm.controlComponentsTypes = vm.componentsTypes.filter(function (componentType) {
                return componentType.type === 'control';
            });

            vm.dateControlComponentsTypes = vm.componentsTypes.filter(function (componentType) {
                return componentType.type === 'control' && componentType.settings.value_type === 40
            });

            vm.currencyControlComponentsTypes = vm.componentsTypes.filter(function (componentType) {
                return componentType.type === 'control' &&
                    componentType.settings.value_type === 100 &&
                    componentType.settings.content_type === 'currencies.currency'
            });

            vm.pricingPolicyControlComponentsTypes = vm.componentsTypes.filter(function (componentType) {
                return componentType.type === 'control' &&
                    componentType.settings.value_type === 100 &&
                    componentType.settings.content_type === 'instruments.pricingpolicy'
            });

            vm.componentsTypes.forEach(function (comp) {
                if (componentsForLinking.indexOf(comp.type) !== -1 &&
                    comp.id !== vm.item.id) {
                    vm.componentsForMultiselector.push(
                        {
                            id: comp.id,
                            name: comp.name
                        });
                }
            });*/

		dashboardConstructorMethodsService.getDataForComponentsSelector(
			vm,
			componentsForLinking,
			vm.item.id
		)

		console.log('vm', vm)

		/* if (vm.item.id) {

				vm.getAttributes();
                // vm.getLayouts();

			} */

		vm.getAttributes()

		dashboardConstructorMethodsService
			.prepareDataForReportLayoutSelector(
				vm.layoutsSelectorsList,
				vm.item.settings.entity_type,
				vm.item.settings.layout,
				vm.getLayouts()
			)
			.then(function (layoutsSelectorsList) {
				vm.layoutsSelectorsList = layoutsSelectorsList
				vm.readyStatus.layouts = true
				$scope.$apply()
			})
	}

	vm.init()
}
