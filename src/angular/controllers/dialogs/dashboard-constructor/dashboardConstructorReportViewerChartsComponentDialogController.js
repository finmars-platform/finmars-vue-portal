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

	vm.barsNamesAttrSelectorTitle = ''
	vm.barsNumbersAttrSelectorTitle = ''

	vm.multiselectModalName = 'Fields multiselector'

	vm.componentsForMultiselector = []
	var componentsForLinking = dashboardHelper.getComponentsForLinking()

	if (item) {
		vm.item = item
	} else {
		vm.item = {
			type: null,
			id: null, // should be generated before create
			name: '',
			settings: {
				entity_type: 'balance-report',
				auto_refresh: false,
				linked_components: {
					report_settings: {},
				},
			},
			user_settings: {},
		}
	}

	vm.componentsTypes = []

	vm.layoutsByEntityType = {
		'balance-report': [],
		'pl-report': [],
		'transaction-report': [],
	}

	vm.layouts = []

	var deleteChartTypeBasedProps = function () {
		delete vm.item.settings.bar_name_key
		delete vm.item.settings.bar_number_key
		delete vm.item.settings.min_bar_width
		delete vm.item.settings.max_bar_width
		delete vm.item.settings.group_number_calc_formula
		delete vm.item.settings.sorting_value_type
		delete vm.item.settings.sorting_type
		delete vm.item.settings.crop_tick_text
		delete vm.item.settings.auto_refresh
		delete vm.item.settings.tooltip_font_size
		delete vm.item.settings.abscissa_position
		delete vm.item.settings.ordinate_position
		// properties for pie chart
		//delete vm.item.settings.fieldsKeys;
		delete vm.item.settings.group_attr
		delete vm.item.settings.number_attr
		delete vm.item.settings.show_legends
		delete vm.item.settings.legends_position
		delete vm.item.settings.legends_columns_number
		delete vm.item.settings.chart_form
		delete vm.item.settings.pie_size_percent
	}

	/* vm.reportTypeChange = function() {

            vm.item.settings.layout = null;
            vm.item.settings.linked_components = {
                report_settings: {}
            };

            deleteChartTypeBasedProps();
            vm.item.user_settings = {};

            switch (vm.item.type) {
                case 'report_viewer_bars_chart':
                    vm.item.settings.bar_name_key = null;
                    vm.item.settings.bar_number_key = null;
                    vm.item.settings.group_number_calc_formula = 1;
                    vm.item.settings.autocalc_ticks_number = true;
                    vm.item.settings.bars_sorting = false;
                    break;
                case 'report_viewer_pie_chart':
                    vm.item.settings.group_attr = '';
                    vm.item.settings.number_attr = '';
                    vm.item.settings.group_number_calc_formula = 1;
                    vm.item.settings.show_legends = false;
                    vm.item.settings.legends_position = 'right';
                    vm.item.settings.legends_columns_number = 1;
                    break;
            }

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

				vm.item.settings.linked_components = {
					report_settings: {},
				}

				deleteChartTypeBasedProps()
				vm.item.user_settings = {}

				switch (vm.item.type) {
					case 'report_viewer_bars_chart':
						vm.item.settings.bar_name_key = null
						vm.item.settings.bar_number_key = null
						vm.item.settings.group_number_calc_formula = 1
						vm.item.settings.autocalc_ticks_number = true
						vm.item.settings.bars_sorting = false
						break
					case 'report_viewer_pie_chart':
						vm.item.settings.group_attr = ''
						vm.item.settings.number_attr = ''
						vm.item.settings.group_number_calc_formula = 1
						vm.item.settings.show_legends = false
						vm.item.settings.legends_position = 'right'
						vm.item.settings.legends_columns_number = 1
						break
				}

				vm.getAttributes()
			})
	}

	vm.onLayoutChange = function () {
		var activeType = vm.layoutsSelectorsList.find(function (type) {
			return type.isActive
		})

		vm.item.settings.layout = activeType.model
	}

	vm.getAttributes = function () {
		vm.attributes = attributeDataService.getAllAttributesByEntityType(
			vm.item.settings.entity_type
		)
		vm.numericAttributes = attributeDataService
			.getAllAttributesByEntityType(vm.item.settings.entity_type)
			.filter(function (item) {
				return item.value_type === 20
			})
	}

	vm.chartTypeChanged = function () {
		deleteChartTypeBasedProps()
		vm.item.settings = {
			linked_components: {
				report_settings: {},
			},
		}

		vm.item.user_settings = {}

		switch (vm.item.type) {
			case 'report_viewer_bars_chart':
				vm.item.settings = {
					bar_name_key: '',
					bar_number_key: '',
					abscissa_position: 'bottom',
					ordinate_position: 'left',
					bars_direction: 'bottom-top',
					group_number_calc_formula: 1,
					min_bar_width: 50,
					max_bar_width: 90,
					bars_sorting: false,
					sorting_value_type: null,
					sorting_type: null,
					autocalc_ticks_number: true,
					ticks_number: null,
					tooltip_font_size: 10,
				}
				break
			case 'report_viewer_pie_chart':
				vm.item.settings.group_attr = ''
				vm.item.settings.number_attr = ''
				vm.item.settings.group_number_calc_formula = 1
				vm.item.settings.show_legends = false
				vm.item.settings.legends_position = 'right'
				vm.item.settings.tooltip_font_size = 10
				vm.item.settings.chart_form = 'doughnut'
				vm.item.settings.pie_size_percent = 100
				break
		}
	}

	vm.chartBarsDirectionChanged = function () {
		if (vm.item.settings.bars_direction === 'bottom-top') {
			vm.item.settings.abscissa_position = 'bottom'
		} else {
			vm.item.settings.ordinate_position = 'left'
		}
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

	vm.getLayouts = function () {
		return new Promise(function (resolve) {
			uiService
				.getListLayout(vm.item.settings.entity_type)
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

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.agree = function () {
		var layoutName

		if (!vm.item.settings.bars_sorting) {
			delete vm.item.settings.sorting_value_type
			delete vm.item.settings.sorting_type
		}

		if (vm.item.settings.autocalc_ticks_number) {
			delete vm.item.settings.ticks_number
		}

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

	vm.isFormValid = function () {
		var pie_size_percent = vm.item.settings.pie_size_percent
		return (
			vm.item.type &&
			(!pie_size_percent || (pie_size_percent > 0 && pie_size_percent <= 100))
		)
	}

	vm.onPieSizePercentChange = function ($event) {
		if (vm.item.settings.pie_size_percent < 0) {
			vm.item.settings.pie_size_percent = 0
		}

		if (vm.item.settings.pie_size_percent > 100) {
			vm.item.settings.pie_size_percent = 100
		}
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
		setTimeout(function () {
			vm.dialogElemToResize = document.querySelector('.dcChartsElemToDrag')
		}, 100)

		if (vm.item.settings.bars_direction === 'bottom-top') {
			vm.barsNamesAttrSelectorTitle = 'Bars Names (Abscissa)'
			vm.barsNumbersAttrSelectorTitle = 'Bars Numbers (Ordinate)'
		} else {
			vm.barsNamesAttrSelectorTitle = 'Bars Names (Ordinate)'
			vm.barsNumbersAttrSelectorTitle = 'Bars Numbers (Abscissa)'
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

            vm.componentsTypes.forEach(function (comp) {

                if (componentsForLinking.indexOf(comp.type) !== -1 &&
                    comp.id !== vm.item.id) {

                    var compObj = {
                        id: comp.id,
                        name: comp.name
                    };

                    vm.componentsForMultiselector.push(compObj);

                }

            });*/

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
		// vm.getLayouts();
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
