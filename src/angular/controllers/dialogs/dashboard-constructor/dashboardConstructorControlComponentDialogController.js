/**
 * Created by szhitenev on 08.06.2016.
 */

export default function (
	$scope,
	$mdDialog,
	uiService,
	dashboardConstructorMethodsService,
	reportHelper,
	dashboardHelper,
	entityResolverService,
	item,
	dataService,
	multitypeFieldService
) {
	var vm = this
	vm.processing = false
	vm.readyStatus = {
		layouts: false,
	}

	if (item) {
		vm.item = item
		delete vm.item.defaultValue
	} else {
		vm.item = {
			type: 'control',
			id: null, // should be generated before create
			name: '',
			settings: {},
		}
	}

	vm.layoutsByEntityType = {
		'balance-report': [],
		'pl-report': [],
		'transaction-report': [],
	}

	vm.layouts = []
	vm.layoutsWithLinkToFilters = []
	vm.reportFields = []
	vm.multiselectItems = []

	vm.initialDefaultSettings = {
		mode: 2,
		entity_type: null,
		layout: null,
		report_field: null,
		setValue: null,
		setValueName: null,
		setValueTitle: null,
	}

	if (vm.item.settings.defaultValue) {
		vm.defaultValue = vm.item.settings.defaultValue
	} else {
		vm.defaultValue = vm.initialDefaultSettings
	}

	vm.componentsTypes = []

	vm.contentTypes = [
		{
			name: 'Instrument',
			key: 'instruments.instrument',
		},
		{
			name: 'Portfolio',
			key: 'portfolios.portfolio',
			entityType: 'portfolio',
			reportOptionsKey: 'portfolios',
		},
		{
			name: 'Account',
			key: 'accounts.account',
			entityType: 'account',
			reportOptionsKey: 'accounts',
		},
		{
			name: 'Counterparty',
			key: 'counterparties.counterparty',
		},
		{
			name: 'Responsible',
			key: 'counterparties.responsible',
		},
		{
			name: 'Currency',
			key: 'currencies.currency',
			entityType: 'currency',
			reportOptionsKey: 'report_currency',
		},
		{
			name: 'Strategy 1',
			key: 'strategies.strategy1',
			entityType: 'strategy-1',
			reportOptionsKey: 'strategies1',
		},
		{
			name: 'Strategy 2',
			key: 'strategies.strategy2',
			entityType: 'strategy-2',
			reportOptionsKey: 'strategies2',
		},
		{
			name: 'Strategy 3',
			key: 'strategies.strategy3',
			entityType: 'strategy-3',
			reportOptionsKey: 'strategies3',
		},
		{
			name: 'Pricing Policy',
			key: 'instruments.pricingpolicy',
			entityType: 'pricing-policy',
			reportOptionsKey: 'pricing_policy',
		},
	]

	vm.currentContentType = null

	vm.valueTypes = [
		{ code: 10, name: 'Text' },
		{ code: 20, name: 'Number' },
		{ code: 40, name: 'Date' },
		{ code: 100, name: 'Relation' },
	]

	var layoutsSelectorDataNotReady = true

	vm.isRequiredDefaultValue = function () {
		if (vm.item.settings.value_type === 100) {
			const isRelationNeedDefaultValue =
				vm.currentContentType && vm.currentContentType.entityType
			return isRelationNeedDefaultValue
		}

		return vm.item.settings.value_type === 40
	}

	vm.clearDefaultValue = function () {
		Object.assign(vm.defaultValue, vm.initialDefaultSettings)
	}

	vm.valueTypeChanged = function () {
		vm.clearDefaultValue()
	}

	vm.contentTypeChanged = function () {
		vm.clearDefaultValue()

		vm.multiselectItems = []
		const entityType = vm.currentContentType.entityType

		if (vm.item.settings.multiple && entityType) {
			vm.getDataForMultiselect(entityType).then(function (resData) {
				vm.multiselectItems = JSON.parse(JSON.stringify(resData))
			})
		}
	}

	vm.onMultipleChange = function () {
		vm.defaultValue.setValue = null
		vm.defaultValue.setValueName = null
		vm.defaultValue.setValueObject = {}
	}

	vm.isTransactionReportDisabled = function () {
		if (!vm.currentContentType) {
			return false
		}

		return (
			vm.currentContentType.key === 'currencies.currency' ||
			vm.currentContentType.key === 'instruments.pricingpolicy'
		)
	}

	/* vm.onReportTypeChange = function() {

            vm.defaultValue.layout = null;
            vm.defaultValue.report_field = null;
            vm.layoutsWithLinkToFilters = [];
            vm.reportFields = [];

            vm.getLayouts();

        }; */

	vm.onLayoutEntityTypeChange = async function (activeType) {
		vm.defaultValue.entity_type = activeType.key

		vm.defaultValue.layout = null
		vm.defaultValue.report_field = null
		vm.layoutsWithLinkToFilters = []
		vm.reportFields = []

		if (activeType.custom.menuOptionsNotLoaded) {
			activeType.fieldData.menuOptions = await vm.getLayouts()
			activeType.custom.menuOptionsNotLoaded = false

			$scope.$apply()
		} else {
			vm.layouts = vm.layoutsByEntityType[vm.defaultValue.entity_type]
		}
	}

	vm.extractReportFieldsFromLayout = function (layoutUserCode) {
		var layout = vm.layouts.find(function (item) {
			return item.user_code === layoutUserCode
		})

		if (!layout) {
			// needed for old components where layout was stored as ID
			layout = vm.layouts.find((item) => item.id === layoutUserCode)
			if (layout) {
				vm.defaultValue.layout = layout.user_code
			}
		}

		// vm.reportFields = getReportFields(vm.defaultValue.entity_type, layout);

		return new Promise(function (resolve) {
			getReportFields(vm.defaultValue.entity_type, layout).then(function (
				fieldsData
			) {
				vm.reportFields = fieldsData

				if (vm.defaultValue.entity_type === 'balance-report') {
					vm.defaultValue.report_field = vm.reportFields[0]
				} else if (vm.defaultValue.reportOptionsKey) {
					vm.defaultValue.report_field = vm.reportFields.find(function (
						reportField
					) {
						return reportField.key === vm.defaultValue.reportOptionsKey
					})
				}

				resolve()
			})
		})
	}

	/* vm.onLayoutChange = function () {

            if (!vm.defaultValue.layout) {

                return;

            }

            if (vm.item.settings.value_type !== 40) { // not Date

                return;

            }

            vm.defaultValue.report_field = null;

            vm.extractReportFieldsFromLayout(vm.defaultValue.layout);

            $scope.$apply();

        }; */

	vm.onLayoutChange = function () {
		var activeType = vm.layoutsSelectorsList.find(function (type) {
			return type.isActive
		})

		vm.defaultValue.layout = activeType.model

		if (vm.defaultValue.layout && vm.item.settings.value_type === 40) {
			vm.defaultValue.report_field = null

			vm.extractReportFieldsFromLayout(vm.defaultValue.layout).then(
				function () {
					$scope.$apply()
				}
			)

			// $scope.$apply();
		}
	}

	var defaultValueReportFields = {
		'balance-report': [{ key: 'report_date', name: 'Date' }],
		'pl-report': [
			{ key: 'pl_first_date', name: 'Date from (excl)' },
			{ key: 'report_date', name: 'Date to (incl)' },
		],
		'transaction-report': [
			{ key: 'begin_date', name: 'Date from (incl)' },
			{ key: 'end_date', name: 'Date to (incl)' },
		],
	}

	var getReportFields = function (reportType, layout) {
		var promises = []

		var fieldsList = defaultValueReportFields[reportType].map(function (field) {
			return {
				key: field.key,
				name: field.name,
				// value: layout.data.reportOptions[field.key]
			}
		})

		fieldsList.forEach(function (field) {
			var dateValProm = new Promise(function (resolve) {
				reportHelper
					.getReportDate(
						layout.data.reportOptions,
						layout.data.reportLayoutOptions,
						field.key
					)
					.then(function (dateValue) {
						field.value = dateValue
						resolve()
					})
			})

			promises.push(dateValProm)
		})

		return new Promise(function (resolve) {
			Promise.all(promises).then(function () {
				resolve(fieldsList)
			})
		})
	}

	var getItemDefaultValue = function (defaultValue) {
		if (defaultValue.mode === 1) {


			var setValueLabel = vm.currentContentType
				? vm.currentContentType.name
				: ''

			var value = defaultValue.setValue

			if (defaultValue.setValueObject) {
				if (defaultValue.setValueObject.hasOwnProperty('user_code')) {
					value = defaultValue.setValueObject.user_code
				}
			}

			return {
				mode: 1,
				setValue: value,
				setValueName: defaultValue.setValueName,
				setValueLabel: setValueLabel,
			}
		}

		if (defaultValue.mode === 0) {
			var result = {
				mode: 0,
				entity_type: defaultValue.entity_type,
				layout: defaultValue.layout,
			}

			if (vm.item.settings.value_type === 40) {
				// Date

				result.reportOptionsKey = defaultValue.report_field.key
			}

			if (vm.item.settings.value_type === 100) {
				// Relations

				result.reportOptionsKey = vm.currentContentType.reportOptionsKey
			}

			return result
		}

		return null
	}

	vm.getLayouts = function () {
		vm.processing = true

		return new Promise(function (resolve) {
			uiService
				.getListLayout(vm.defaultValue.entity_type)
				.then(function (data) {
					vm.layoutsByEntityType[vm.defaultValue.entity_type] = data.results
					vm.layouts = data.results

					var layoutsForMultitypeSelector = dashboardHelper
						.getDataForLayoutSelectorWithFilters(vm.layouts)
						.map(function (item) {
							item.id = item.user_code
							return item
						})

					vm.processing = false
					$scope.$apply()

					resolve(layoutsForMultitypeSelector)
				})
				.catch(function (error) {
					console.error(error)

					vm.processing = false
					$scope.$apply()

					resolve([])
				})
		})
	}

	vm.isValidDefaultValue = function () {
		if (!vm.isRequiredDefaultValue()) {
			return true
		}

		if (vm.defaultValue.mode === 0) {
			// Get default value

			if (vm.item.settings.value_type === 40) {
				// Date

				return (
					vm.defaultValue.entity_type &&
					vm.defaultValue.layout &&
					vm.defaultValue.report_field &&
					Object.keys(vm.defaultValue.report_field).length > 0
				)
			}

			return vm.defaultValue.entity_type && vm.defaultValue.layout
		}

		if (vm.defaultValue.mode === 1) {
			// Set default value

			if (vm.item.settings.value_type === 40) {
				//Date

				return Boolean(Date.parse(vm.defaultValue.setValue))
			}

			if (Array.isArray(vm.defaultValue.setValue)) {
				return vm.defaultValue.setValue.length > 0
			}

			return Boolean(vm.defaultValue.setValue)
		}

		return vm.defaultValue.mode === 2 // No default value
	}

	vm.getCurrentValueTypeName = function () {
		var code = vm.item.settings.value_type

		var valueType = vm.valueTypes.find(function (type) {
			return type.code === code
		})

		if (!valueType) {
			return
		}

		if (code === 100) {
			// Relation

			var contentTypeName = vm.currentContentType
				? '/' + vm.currentContentType.name
				: ''

			return valueType.name + contentTypeName
		}

		return valueType.name
	}

	vm.getContentTypeByKey = function (key) {
		return vm.contentTypes.find(function (type) {
			return type.key === key
		})
	}

	vm.getDataForMultiselect = function (entityType) {
		// return entityResolverService.getList(entityType);
		return new Promise(function (resolve, reject) {
			entityResolverService
				.getList(entityType, { pageSize: 1000 })
				.then(function (data) {
					var options = data.results.map(function (item) {
						return { id: item.user_code, name: item.short_name }
					})

					resolve(options)
				})
				.catch(function (e) {
					reject(e)
				})
		})
	}

	// Victor 2020.10.26 Issue #47
	vm.exportToDashboards = function () {
		dashboardConstructorMethodsService.exportComponentToDashboards(
			vm,
			$mdDialog,
			dataService
		)
	}

	vm.onGetDefaultValueFromLayoutMode = function () {
		vm.layoutsSelectorsList = multitypeFieldService
			.getReportLayoutsSelectorData()
			.map(function (type) {
				type.custom = {
					menuOptionsNotLoaded: true,
				}
				return type
			})

		vm.defaultValue.entity_type =
			vm.defaultValue.entity_type || 'balance-report'

		vm.readyStatus.layouts = false

		dashboardConstructorMethodsService
			.prepareDataForReportLayoutSelector(
				vm.layoutsSelectorsList,
				vm.defaultValue.entity_type,
				vm.defaultValue.layout,
				vm.getLayouts()
			)
			.then(function (layoutsSelectorsList) {
				vm.layoutsSelectorsList = layoutsSelectorsList
				vm.readyStatus.layouts = true
				layoutsSelectorDataNotReady = false

				if (vm.defaultValue.layout) {
					vm.extractReportFieldsFromLayout(vm.defaultValue.layout).then(
						function () {
							$scope.$apply()
						}
					)
				} else {
					$scope.$apply()
				}
			})
	}

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.agree = function () {
		vm.item.settings.value_type = parseInt(vm.item.settings.value_type, 10)

		if (vm.currentContentType && vm.currentContentType.key) {
			vm.item.settings.content_type = vm.currentContentType.key
		} else {
			delete vm.item.settings.content_type
		}

		var defaultValue = getItemDefaultValue(vm.defaultValue)

		if (defaultValue) {
			vm.item.settings.defaultValue = defaultValue
		} else {
			delete vm.item.settings.defaultValue
		}

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

	vm.init = function () {
		vm.componentsTypes = dataService.getComponents()

		if (vm.item.settings.value_type === 100) {
			// relation

			vm.currentContentType = vm.getContentTypeByKey(
				vm.item.settings.content_type
			)

			const entityType = vm.currentContentType.entityType

			vm.multiselectItems = []

			if (vm.item.settings.multiple && entityType) {
				vm.getDataForMultiselect(entityType).then(function (resData) {
					vm.multiselectItems = JSON.parse(JSON.stringify(resData))
				})
			}
		}

		if (!vm.defaultValue.setValueObject) {
			vm.defaultValue.setValueObject = {}
		}

		/* if (vm.defaultValue.mode === 0) { // user selected NOT 'Get default value'

				return;

            } */
		/* vm.getLayouts().then(function () {

                vm.extractReportFieldsFromLayout(vm.defaultValue.layout);

            }) ;*/
		if (vm.defaultValue.mode === 0 && layoutsSelectorDataNotReady) {
			vm.onGetDefaultValueFromLayoutMode()
		}
	}

	vm.init()
}
