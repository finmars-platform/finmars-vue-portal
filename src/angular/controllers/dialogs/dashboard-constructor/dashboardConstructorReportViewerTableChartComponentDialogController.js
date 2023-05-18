/**
 * Created by szhitenev on 08.12.2020.
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
			type: 'report_viewer_table_chart',
			id: null, // should be generated before create
			name: '',
			settings: {
				entity_type: 'balance-report',
				title_column: '',
				value_column: '',
				title_column_name: '',
				value_column_name: '',
				subtotal_formula_id: 1,
				styles: {
					cell: {
						text_align: 'center',
					},
				},
				auto_refresh: false,
				auto_scaling: false,
				linked_components: {},
				hide_empty_lines: '',
			},

			user_settings: {},
		}
	}

	vm.componentsTypes = []

	vm.componentType = dataService.getComponentById(vm.item.id)

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
				}
			})
	}

	/* vm.reportTypeChange = function(){

            vm.item.settings.layout = null;
            vm.item.settings.linked_components= {};

            vm.item.settings.title_column = null;
            vm.item.settings.value_column = null;
            vm.item.settings.percent_column = null;

            vm.item.user_settings = {};

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

				vm.item.settings.title_column = null
				vm.item.settings.value_column = null
				vm.item.settings.percent_column = null

				vm.item.user_settings = {}

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

	vm.getAttributes = function () {
		vm.attributes = attributeDataService.getAllAttributesByEntityType(
			vm.item.settings.entity_type
		)

		vm.numericAttributes = vm.attributes.filter(function (item) {
			return item.value_type === 20
		})
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

		if (vm.item.settings.subtotal_formula_id) {
			vm.item.settings.subtotal_formula_id = parseInt(
				vm.item.settings.subtotal_formula_id,
				10
			)
		}

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

	vm.init = function () {
		setTimeout(function () {
			vm.dialogElemToResize = document.querySelector('.dcMatrixElemToDrag')
		}, 100)

		vm.componentsTypes = dataService.getComponents()

		dashboardConstructorMethodsService.getDataForComponentsSelector(
			vm,
			componentsForLinking,
			vm.item.id
		)

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
