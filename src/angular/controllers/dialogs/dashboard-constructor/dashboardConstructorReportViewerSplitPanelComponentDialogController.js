/**
 * Created by szhitenev on 08.06.2016.
 */

export default function (
	$scope,
	$mdDialog,
	uiService,
	dashboardHelper,
	item,
	dataService,
	eventService,
	attributeDataService
) {
	var vm = this

	if (item) {
		vm.item = item
	} else {
		vm.item = {
			type: 'report_viewer_split_panel',
			id: null, // should be generated before create
			name: '',
			custom_component_name: '',
			settings: {
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
				auto_refresh: false,
				linked_components: {},
			},
			user_settings: {},
		}
	}

	vm.componentsTypes = []

	vm.layouts = []

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

	vm.showLinkingToFilters = function () {
		for (var i = 0; i < vm.layouts.length; i++) {
			if (vm.layouts[i].id === vm.item.settings.layout) {
				var layout = vm.layouts[i]
				vm.linkingToFilters = dashboardHelper.getLinkingToFilters(layout)

				break
			}
		}
	}

	vm.getLayouts = function () {
		return uiService
			.getListLayout(vm.item.settings.entity_type)
			.then(function (data) {
				vm.layouts = data.results

				vm.layoutsWithLinkToFilters =
					dashboardHelper.getDataForLayoutSelectorWithFilters(vm.layouts)

				vm.showLinkingToFilters()

				$scope.$apply()
			})
	}

	vm.agree = function () {
		var layoutName

		/*vm.layouts.forEach(function (layout) {

                if(layout.id === vm.item.settings.layout) {
                    layoutName = layout.name
                }

            });*/

		for (var i = 0; i < vm.layouts.length; i++) {
			if (vm.layouts[i].id === vm.item.settings.layout) {
				layoutName = vm.layouts[i].name
				break
			}
		}

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

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.getAttributes = function () {
		vm.attributes = attributeDataService.getAllAttributesByEntityType(
			vm.item.settings.entity_type
		)

		vm.multiselectorAttrs = vm.attributes.map(function (attribute) {
			var multiselectorName = attribute.name
			return { id: attribute.key, name: multiselectorName }
		})
	}

	vm.reportTypeChange = function () {
		vm.item.settings.layout = null
		vm.item.settings.linked_components = {}
		vm.item.user_settings = {}

		vm.getAttributes()
	}

	var componentsForLinking = dashboardHelper.getComponentsForLinking()

	vm.init = function () {
		setTimeout(function () {
			vm.dialogElemToResize = document.querySelector(
				'.dcRvSplitPanelElemToDrag'
			)
		}, 100)

		console.log('dataService', dataService)

		vm.componentsTypes = dataService.getComponents()

		vm.componentsForMultiselector = []
		/*vm.reportViewerComponentTypes = vm.componentsTypes.filter(function (componentType) {
                return componentsForLinking.indexOf(componentType.type) !== -1;
            });*/
		vm.componentsTypes.forEach(function (comp) {
			if (
				componentsForLinking.indexOf(comp.type) !== -1 &&
				comp.id !== vm.item.id
			) {
				vm.componentsForMultiselector.push({
					id: comp.id,
					name: comp.name,
				})
			}
		})

		console.log('vm', vm)

		if (vm.item.id) {
			vm.getLayouts()
			vm.getAttributes()
		}
	}

	vm.init()
}
