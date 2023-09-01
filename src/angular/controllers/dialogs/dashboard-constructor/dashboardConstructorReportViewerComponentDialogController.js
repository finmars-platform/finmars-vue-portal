/**
 * Created by szhitenev on 08.06.2016.
 */

export default function (
	$scope,
	$mdDialog,
	uiService,
	dashboardConstructorMethodsService,
	dashboardHelper,
	evRvLayoutsHelper,
	item,
	dataService,
	eventService,
	attributeDataService,
	multitypeFieldService,
	data
) {
	var vm = this

	vm.newFilter = {}
	vm.processing = false
	vm.filterLinks = []
	vm.smallRvSelectedCols = []

	vm.launchedFromDashboard = data.openedFromDashboard
	vm.readyStatus = {
		layouts: false,
	}

	vm.componentsForMultiselector = []
	var componentsForLinking = dashboardHelper.getComponentsForLinking()

	if (item) {
		vm.item = item

		if (!vm.item.settings.hasOwnProperty('styles')) {
			vm.item.settings.styles = {
				cell: {},
			}
		}
	} else {
		vm.item = {
			type: 'report_viewer',
			id: null, // should be generated before create
			name: '',
			custom_component_name: '',
			settings: {
				entity_type: 'balance-report',
				components: {
					topPart: false,
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
				styles: {
					cell: {},
				},
				linked_components: {
					report_settings: {},
					filter_links: [],
					active_object: null,
				},
				filters: {
					show_filters_area: false,
					show_use_from_above_filters: false,
				},
			},
			user_settings: {},
		}
	}

	vm.layoutsByEntityType = {
		'balance-report': [],
		'pl-report': [],
		'transaction-report': [],
	}

	vm.deleteFilterLink = function (item, $index) {
		vm.item.settings.linked_components.filter_links =
			vm.item.settings.linked_components.filter_links.filter(function (
				item,
				index
			) {
				return $index !== index
			})
	}

	vm.getComponentTypesByValueType = function (value_type) {
		value_type = parseInt(value_type, 10)

		return vm.componentsTypes.filter(function (componentType) {
			return (
				componentType.type === 'control' &&
				componentType.settings.value_type === value_type
			)
		})
	}

	vm.addFilterLink = function () {
		if (!vm.item.settings.linked_components.filter_links) {
			vm.item.settings.linked_components.filter_links = []
		}

		vm.item.settings.linked_components.filter_links.push(vm.newFilter)

		vm.newFilter = {}
	}

	vm.componentsTypes = []

	vm.layouts = []

	/* vm.reportTypeChange = function() {

            vm.item.settings.layout = null;
            vm.item.settings.linked_components = {};
            vm.item.settings.linked_components.report_settings = {};
            vm.item.user_settings = {};

            vm.getAttributes();
            vm.getLayouts().then(function () {

                vm.item.user_settings.columns = JSON.parse(JSON.stringify(vm.tableColumns));
                vm.smallRvColumnsChanged();

            });

        }; */

	vm.layoutsSelectorsList = multitypeFieldService
		.getReportLayoutsSelectorData()
		.map(function (type) {
			type.custom = {
				menuOptionsNotLoaded: true,
			}
			return type
		})

	vm.getAttributes = function () {
		vm.attributes = attributeDataService.getAllAttributesByEntityType(
			vm.item.settings.entity_type
		)
		/*vm.multiselectorAttrs = vm.attributes.map(function (attribute) {
                return {id: attribute.key, name: attribute.name};
            });*/
	}

	vm.onLayoutEntityTypeChange = function (activeType) {
		dashboardConstructorMethodsService
			.onReportTypeChange(activeType, vm.item, vm.getLayouts, $scope)
			.then(function (item) {
				vm.layouts = vm.layoutsByEntityType[vm.item.settings.entity_type]
				vm.item = item

				vm.item.settings.linked_components = {}

				/*vm.item.settings.abscissa = null;
				vm.item.settings.ordinate = null;
				vm.item.settings.value_key = null;*/

				vm.item.user_settings = {}

				vm.getAttributes()

				vm.item.user_settings.columns = JSON.parse(
					JSON.stringify(vm.tableColumns)
				)
				vm.smallRvColumnsChanged()
			})
	}

	vm.onLayoutChange = function () {
		var activeType = vm.layoutsSelectorsList.find(function (type) {
			return type.isActive
		})

		vm.item.settings.layout = activeType.model
	}

	vm.getLayouts = function () {
		vm.processing = true

		return new Promise(function (resolve, reject) {
			uiService
				.getListLayout(vm.item.settings.entity_type, { pageSize: 1000 })
				.then(function (data) {
					vm.layoutsByEntityType[vm.item.settings.entity_type] = data.results
					vm.layouts = data.results

					var layoutsWithLinkToFilters =
						dashboardHelper.getDataForLayoutSelectorWithFilters(vm.layouts)

					extractDataFromSelectedLayout()

					// for small rv columns multiselector
					if (vm.item.user_settings.columns) {
						vm.smallRvSelectedCols = vm.item.user_settings.columns.map(
							function (selCol) {
								return selCol.key
							}
						)
					} else {
						vm.item.user_settings.columns = JSON.parse(
							JSON.stringify(vm.tableColumns)
						)
					}
					// < for small rv columns multiselector >

					vm.processing = false

					$scope.$apply()

					resolve(layoutsWithLinkToFilters)
				})
				.catch(function (error) {
					console.error(error)
					resolve([])
				})
		})
	}

	var extractDataFromSelectedLayout = function () {
		vm.selectedLayout = null
		vm.tableColumns = []
		vm.tableGroups = []
		vm.tableColumnsForMultiselector = []
		vm.smallRvSelectedCols = []
		vm.linkingToFilters = []

		if (vm.item.settings.layout) {
			for (var i = 0; i < vm.layouts.length; i++) {
				if (vm.layouts[i].id === vm.item.settings.layout) {
					vm.selectedLayout = JSON.parse(JSON.stringify(vm.layouts[i]))
					break
				}
			}
		}

		if (vm.selectedLayout) {
			if (
				vm.selectedLayout.data.columns &&
				vm.selectedLayout.data.columns.length
			) {
				vm.tableColumns = JSON.parse(
					angular.toJson(vm.selectedLayout.data.columns)
				)
			}

			if (
				vm.selectedLayout.data.grouping &&
				vm.selectedLayout.data.grouping.length
			) {
				vm.tableGroups = JSON.parse(
					angular.toJson(vm.selectedLayout.data.grouping)
				)
			}

			vm.tableColumnsForMultiselector = []

			vm.tableColumns.forEach(function (column) {
				var columnWithoutGroup = true

				for (var i = 0; i < vm.tableGroups.length; i++) {
					// excluding columns under groups

					if (vm.tableGroups[i].key === column.key) {
						columnWithoutGroup = false
						break
					}
				}

				if (columnWithoutGroup) {
					var colName = column.layoutName || column.name

					vm.tableColumnsForMultiselector.push({
						id: column.key,
						name: colName,
					})
				}
			})

			vm.smallRvSelectedCols = vm.tableColumnsForMultiselector.map(function (
				column
			) {
				return column.id
			})

			vm.linkingToFilters = evRvLayoutsHelper.getLinkingToFilters(
				vm.selectedLayout
			)
		}
	}

	vm.onRvLayoutChange = function () {
		extractDataFromSelectedLayout()

		vm.item.user_settings.columns = JSON.parse(JSON.stringify(vm.tableColumns))
		vm.smallRvColumnsChanged()
	}

	/* vm.showLinkingToFilters = function () {

            for (var i = 0; i < vm.layouts.length; i++) {

                if (vm.layouts[i].id === vm.item.settings.layout) {

                    var layout = vm.layouts[i];
                    vm.linkingToFilters = evRvLayoutsHelper.getLinkingToFilters(layout);

                    break;

                }

            }

        }; */
	vm.clearSelect = function (item, propToDelete) {
		delete item[propToDelete]
	}

	vm.smallRvColumnsChanged = function () {
		// remove not deselected columns
		vm.item.user_settings.columns = vm.item.user_settings.columns.filter(
			function (column) {
				for (var i = 0; i < vm.tableGroups.length; i++) {
					// for columns under groups
					if (column.key === vm.tableGroups[i].key) {
						return true
					}
				}

				return vm.smallRvSelectedCols.indexOf(column.key) > -1
			}
		)

		vm.smallRvSelectedCols.forEach(function (selColKey) {
			var columnIsNotSelected = true
			var i, a
			for (i = 0; i < vm.item.user_settings.columns.length; i++) {
				var column = vm.item.user_settings.columns[i]

				if (selColKey === column.key) {
					columnIsNotSelected = false
					break
				}
			}

			if (columnIsNotSelected) {
				for (a = 0; a < vm.tableColumns.length; a++) {
					var column = JSON.parse(JSON.stringify(vm.tableColumns[a]))

					if (column.key === selColKey) {
						vm.item.user_settings.columns.push(column)
					}
				}
			}
		})
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

	var updateComponentsBeforeSaving = function () {
		if (!vm.item.settings.linked_components.filter_links) {
			vm.item.settings.linked_components.filter_links = []
		}

		var layoutName

		vm.layouts.forEach(function (layout) {
			if (layout.id === vm.item.settings.layout) {
				layoutName = layout.name
			}
		})

		vm.item.settings.layout_name = layoutName
		vm.item.settings.content_type = vm.getContentTypeByEntityType()

		if (vm.item.id) {
			vm.componentsTypes = vm.componentsTypes.map(function (item) {
				if (item.id === vm.item.id) {
					return vm.item
				}

				return item
			})
		} else {
			var pattern = new Date().getTime() + '_' + vm.componentsTypes.length

			vm.item.id = dataService.___generateId(pattern)

			vm.componentsTypes.push(vm.item)
		}

		dataService.setComponents(vm.componentsTypes)
	}

	vm.customAgree = function (actionAfterClosing) {
		updateComponentsBeforeSaving()

		$mdDialog.hide({ status: 'agree', action: actionAfterClosing })
	}

	// Victor 2020.10.26 Issue #47
	vm.exportToDashboards = function () {
		dashboardConstructorMethodsService.exportComponentToDashboards(
			vm,
			$mdDialog,
			dataService
		)
	}

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.agree = function () {
		updateComponentsBeforeSaving()

		$mdDialog.hide({ status: 'agree' })
	}

	vm.init = function () {
		setTimeout(function () {
			vm.dialogElemToResize = document.querySelector(
				'.dcReportViewerElemToDrag'
			)
		}, 100)

		if (vm.item.type === 'report_viewer_split_panel') {
			vm.item.type = 'report_viewer'
		}

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

            vm.portfoliosComponentTypes = vm.componentsTypes.filter(function (componentType) {
                return componentType.type === 'control' &&
                    componentType.settings.value_type === 100 &&
                    componentType.settings.content_type === 'portfolios.portfolio'
            });

            vm.strategies1ComponentTypes = vm.componentsTypes.filter(function (componentType) {
                return componentType.type === 'control' &&
                    componentType.settings.value_type === 100 &&
                    componentType.settings.content_type === 'strategies.strategy1'
            });

            vm.strategies2ComponentTypes = vm.componentsTypes.filter(function (componentType) {
                return componentType.type === 'control' &&
                    componentType.settings.value_type === 100 &&
                    componentType.settings.content_type === 'strategies.strategy2'
            });

            vm.strategies3ComponentTypes = vm.componentsTypes.filter(function (componentType) {
                return componentType.type === 'control' &&
                    componentType.settings.value_type === 100 &&
                    componentType.settings.content_type === 'strategies.strategy3'
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



		/* if (vm.item.id) {
                // vm.getLayouts();
                vm.getAttributes();

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
