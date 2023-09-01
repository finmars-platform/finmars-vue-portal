/**
 * Created by szhitenev on 05.05.2016.
 */


	import logService from '@/angular/core/services/logService'

	import evEvents from '../../services/entityViewerEvents'

	import metaService from '../../services/metaService'

	import evDataHelper from '../../helpers/ev-data.helper'

	import GModalSharedLogicHelper from '../../helpers/entityViewer/sharedLogic/gModalSharedLogicHelper'

	import evHelperService from '../../services/entityViewerHelperService'

	export default function (
		$scope,
		$mdDialog,
		entityViewerDataService,
		entityViewerEventService,
		attributeDataService,
		contentWrapElement
	) {
		logService.controller('gModalController', 'initialized')

		var vm = this

		var gModalSharedLogicHelper = new GModalSharedLogicHelper(vm)

		vm.readyStatus = { content: false }

		vm.entityViewerDataService = entityViewerDataService
		vm.entityViewerEventService = entityViewerEventService

		vm.contentWrapElement = contentWrapElement

		vm.entityType = vm.entityViewerDataService.getEntityType()

		vm.general = []
		vm.attrs = []
		vm.custom = []

		vm.instrumentDynamicAttrs = []
		vm.accountDynamicAttrs = []
		vm.portfolioDynamicAttrs = []

		vm.cardsDividedIntoTabs = true

		var columns = vm.entityViewerDataService.getColumns()
		var filters = vm.entityViewerDataService.getFilters()
		var groups = vm.entityViewerDataService.getGroups()

		vm.balanceTabName = 'Profit & Loss'

		vm.attrsList = []

		$('body').addClass('drag-dialog') // hide backdrop

		var balanceAttrsComp = [
			'name',
			'short_name',
			'user_code',
			'item_type_name',
			'pricing_currency.name',
			'pricing_currency.short_name',
			'pricing_currency.user_code',
			'position_size',
			'instrument_pricing_currency_fx_rate',
			'instrument_accrued_currency_fx_rate',
			'net_cost_price_loc',
			'market_value',
			'market_value_loc',
			'market_value_percent',
			'exposure',
			'exposure_percent',
			'exposure_loc',
			'instrument_principal_price',
			'instrument_accrued_price',
			'detail',

			'ytm',
			'ytm_at_cost',
			'return_annually',
			'mismatch',
		]

		var performanceAttrsComp = [
			'item_group_name',
			'item_subtype_name',
			'pl_first_date',
			'report_date',
			'total',
			'total_fixed',
			'total_fx',
			'principal',
			'principal_fixed',
			'principal_fx',
			'carry',
			'carry_fixed',
			'carry_fx',
			'overheads',
			'overheads_fixed',
			'overheads_fx',
			'total_loc',
			'total_fixed_loc',
			'total_fx_loc',
			'principal_loc',
			'principal_fixed_loc',
			'principal_fx_loc',
			'carry_loc',
			'carry_fixed_loc',
			'carry_fx_loc',
			'overheads_loc',
			'overheads_fixed_loc',

			// 'total_closed', 'total_fixed_closed', 'total_fx_closed', 'principal_closed',
			// 'principal_fixed_closed', 'principal_fx_closed', 'carry_closed', 'carry_fixed_closed', 'carry_fx_closed', 'overheads_closed', 'overheads_fixed_closed',
			// 'overheads_fx_closed', 'total_closed_loc', 'total_fixed_closed_loc', 'total_fx_closed_loc', 'principal_closed_loc', 'principal_fixed_closed_loc',
			// 'principal_fx_closed_loc', 'carry_closed_loc', 'carry_fixed_closed_loc', 'carry_fx_closed_loc', 'overheads_closed_loc', 'overheads_fixed_closed_loc',
			// 'overheads_fx_closed_loc',

			'time_invested',
			'position_return',
			'net_position_return',
		]

		var linkedInstrumentAttrsComp = [
			'linked_instrument.name',
			'linked_instrument.short_name',
			'linked_instrument.user_code',
			'linked_instrument.user_text_1',
			'linked_instrument.user_text_2',
			'linked_instrument.user_text_3',
		]

		var accountAttrsComp = [
			'account.name',
			'account.short_name',
			'account.notes',
			'account.user_code',
			'account.public_name',
			'account.type.name',
			'account.type.short_name',
			'account.type.notes',
			'account.type.public_name',
			'account.type.user_code',
			'account.type.show_transaction_details',
		]

		var portfolioAttrsComp = [
			'portfolio.name',
			'portfolio.short_name',
			'portfolio.user_code',
			'portfolio.public_name',
		]

		var instrumentAttrsComp = [
			'instrument.name',
			'instrument.short_name',
			'instrument.user_code',
			'instrument.public_name',
			'instrument.instrument_type.name',
			'instrument.instrument_type.short_name',
			'instrument.instrument_type.user_code',
			'instrument.instrument_type.public_name',
			'instrument.is_active',
			'instrument.price_multiplier',
			'instrument.accrued_currency.name',
			'instrument.accrued_currency.short_name',
			'instrument.accrued_currency.user_code',
			'instrument.maturity_date',
			'instrument.maturity_price',
			'instrument.accrued_multiplier',
			'instrument.user_text_1',
			'instrument.user_text_2',
			'instrument.user_text_3',
		]

		var strategy1AttrsToRemove = [
			'strategy1.subgroup.short_name',
			'strategy1.subgroup.notes',
			'strategy1.subgroup.user_code',
		]
		var strategy2AttrsToRemove = [
			'strategy2.subgroup.short_name',
			'strategy2.subgroup.notes',
			'strategy2.subgroup.user_code',
		]
		var strategy3AttrsToRemove = [
			'strategy3.subgroup.short_name',
			'strategy3.subgroup.notes',
			'strategy3.subgroup.user_code',
		]

		var allocationAttrsComp = [
			'allocation.name',
			'allocation.short_name',
			'allocation.notes',
			'allocation.user_code',
			'allocation.instrument_type.name',
			'allocation.instrument_type.short_name',
			'allocation.instrument_type.user_code',
			'allocation.instrument_type.public_name',
			'allocation.user_text_1',
			'allocation.user_text_2',
			'allocation.user_text_3',
		]

		var filterAttrsToShow = function (vmAttrsKey, attrsToRemoveArray) {
			vm[vmAttrsKey].forEach(function (attr) {
				if (attrsToRemoveArray.indexOf(attr.key) === -1) {
					vm[vmAttrsKey + 'Filtered'].push(attr)
				}
			})
		}

		var composeAttrsInsideTab = function (vmAttrsKey, attrsToShow) {
			vm[vmAttrsKey].forEach(function (attr) {
				if (attrsToShow.indexOf(attr.key) !== -1) {
					attr.orderNumber__ = attrsToShow.indexOf(attr.key)
					vm[vmAttrsKey + 'Filtered'].push(attr)
				}
			})
		}

		vm.getAttributes = function () {
			// needed to display hided attributes inside selected Tab
			vm.balanceAttrsFiltered = []
			vm.balanceMismatchAttrsFiltered = []
			vm.balancePerformanceAttrsFiltered = []
			vm.instrumentAttrsFiltered = []
			vm.linkedInstrumentAttrsFiltered = []
			vm.accountAttrsFiltered = []
			vm.portfolioAttrsFiltered = []
			vm.strategy1attrsFiltered = []
			vm.strategy2attrsFiltered = []
			vm.strategy3attrsFiltered = []
			vm.allocationAttrsFiltered = []

			vm.balanceAttrs = attributeDataService.getAllAttributesAsFlatList(
				'reports.plreport',
				'',
				'Balance',
				{ maxDepth: 1 }
			)

			vm.balanceMismatchAttrs = attributeDataService.getAllAttributesAsFlatList(
				'reports.plreportmismatch',
				'',
				'Mismatch',
				{ maxDepth: 1 }
			)

			vm.balancePerformanceAttrs =
				attributeDataService.getAllAttributesAsFlatList(
					'reports.plreportperformance',
					'',
					'Performance',
					{ maxDepth: 1 }
				)

			vm.allocationAttrs = attributeDataService.getAllAttributesAsFlatList(
				'instruments.instrument',
				'allocation',
				'Allocation',
				{ maxDepth: 1 }
			)

			vm.instrumentAttrs = attributeDataService.getAllAttributesAsFlatList(
				'instruments.instrument',
				'instrument',
				'Instrument',
				{ maxDepth: 1 }
			)

			vm.linkedInstrumentAttrs =
				attributeDataService.getAllAttributesAsFlatList(
					'instruments.instrument',
					'linked_instrument',
					'Linked Instrument',
					{ maxDepth: 1 }
				)

			vm.accountAttrs = attributeDataService.getAllAttributesAsFlatList(
				'accounts.account',
				'account',
				'Account',
				{ maxDepth: 1 }
			)

			vm.portfolioAttrs = attributeDataService.getAllAttributesAsFlatList(
				'portfolios.portfolio',
				'portfolio',
				'Portfolio',
				{ maxDepth: 1 }
			)

			vm.strategy1attrs = attributeDataService.getAllAttributesAsFlatList(
				'strategies.strategy1',
				'strategy1',
				'Strategy 1',
				{ maxDepth: 1 }
			)

			vm.strategy2attrs = attributeDataService.getAllAttributesAsFlatList(
				'strategies.strategy2',
				'strategy2',
				'Strategy 2',
				{ maxDepth: 1 }
			)

			vm.strategy3attrs = attributeDataService.getAllAttributesAsFlatList(
				'strategies.strategy3',
				'strategy3',
				'Strategy 3',
				{ maxDepth: 1 }
			)

			var instrumentUserFields = attributeDataService.getInstrumentUserFields()

			instrumentUserFields.forEach(function (field) {
				vm.instrumentAttrs = vm.instrumentAttrs.map(function (
					entityAttr,
					index
				) {
					if (entityAttr.key === 'instrument.' + field.key) {
						entityAttr.name = 'Instrument. ' + field.name
					}

					return entityAttr
				})

				vm.allocationAttrs = vm.allocationAttrs.map(function (
					entityAttr,
					index
				) {
					if (entityAttr.key === 'allocation.' + field.key) {
						entityAttr.name = 'Allocation. ' + field.name
					}

					return entityAttr
				})

				vm.linkedInstrumentAttrs = vm.linkedInstrumentAttrs.map(function (
					entityAttr
				) {
					if (entityAttr.key === 'linked_instrument.' + field.key) {
						entityAttr.name = 'Linked Instrument. ' + field.name
					}

					return entityAttr
				})
			})

			vm.custom = attributeDataService.getCustomFieldsByEntityType(
				vm.entityType
			)

			vm.custom = vm.custom.map(function (customItem) {
				customItem.custom_field = Object.assign({}, customItem)

				customItem.key = 'custom_fields.' + customItem.user_code
				customItem.name = 'Custom Field. ' + customItem.name

				return customItem
			})

			var portfolioDynamicAttrs =
				attributeDataService.getDynamicAttributesByEntityType('portfolio')
			var accountDynamicAttrs =
				attributeDataService.getDynamicAttributesByEntityType('account')
			var instrumentDynamicAttrs =
				attributeDataService.getDynamicAttributesByEntityType('instrument')

			vm.portfolioDynamicAttrs = attributeDataService.formatAttributeTypes(
				portfolioDynamicAttrs,
				'portfolios.portfolio',
				'portfolio',
				'Portfolio'
			)
			vm.accountDynamicAttrs = attributeDataService.formatAttributeTypes(
				accountDynamicAttrs,
				'accounts.account',
				'account',
				'Account'
			)
			vm.instrumentDynamicAttrs = attributeDataService.formatAttributeTypes(
				instrumentDynamicAttrs,
				'instruments.instrument',
				'instrument',
				'Instrument'
			)
			vm.allocationDynamicAttrs = attributeDataService.formatAttributeTypes(
				instrumentDynamicAttrs,
				'instruments.instrument',
				'allocation',
				'Allocation'
			)
			vm.linkedInstrumentDynamicAttrs =
				attributeDataService.formatAttributeTypes(
					instrumentDynamicAttrs,
					'instruments.instrument',
					'linked_instrument',
					'Linked Instrument'
				)

			vm.attrsList = vm.attrsList.concat(vm.balanceAttrs)
			vm.attrsList = vm.attrsList.concat(vm.allocationAttrs)
			vm.attrsList = vm.attrsList.concat(vm.allocationDynamicAttrs)

			vm.attrsList = vm.attrsList.concat(vm.balancePerformanceAttrs)
			vm.attrsList = vm.attrsList.concat(vm.balanceMismatchAttrs)
			vm.attrsList = vm.attrsList.concat(vm.custom)

			vm.attrsList = vm.attrsList.concat(vm.instrumentAttrs)
			vm.attrsList = vm.attrsList.concat(vm.instrumentDynamicAttrs)

			vm.attrsList = vm.attrsList.concat(vm.linkedInstrumentAttrs)
			vm.attrsList = vm.attrsList.concat(vm.linkedInstrumentDynamicAttrs)

			vm.attrsList = vm.attrsList.concat(vm.accountAttrs)
			vm.attrsList = vm.attrsList.concat(vm.accountDynamicAttrs)

			vm.attrsList = vm.attrsList.concat(vm.portfolioAttrs)
			vm.attrsList = vm.attrsList.concat(vm.portfolioDynamicAttrs)

			vm.attrsList = vm.attrsList.concat(vm.strategy1attrs)
			vm.attrsList = vm.attrsList.concat(vm.strategy2attrs)
			vm.attrsList = vm.attrsList.concat(vm.strategy3attrs)

			composeAttrsInsideTab('balanceAttrs', balanceAttrsComp)
			composeAttrsInsideTab('balancePerformanceAttrs', performanceAttrsComp)
			composeAttrsInsideTab('instrumentAttrs', instrumentAttrsComp)
			composeAttrsInsideTab('linkedInstrumentAttrs', linkedInstrumentAttrsComp)

			composeAttrsInsideTab('accountAttrs', accountAttrsComp)
			composeAttrsInsideTab('portfolioAttrs', portfolioAttrsComp)
			filterAttrsToShow('strategy1attrs', strategy1AttrsToRemove)
			filterAttrsToShow('strategy2attrs', strategy2AttrsToRemove)
			filterAttrsToShow('strategy3attrs', strategy3AttrsToRemove)
			composeAttrsInsideTab('allocationAttrs', allocationAttrsComp)

			//vm.allAttributesList = vm.attrsList;

			vm.syncAttrs()
			getSelectedAttrs()

			vm.readyStatus.content = true
		}

		vm.getCustomAttrs = function () {
			vm.custom = attributeDataService.getCustomFieldsByEntityType(
				vm.entityType
			)
			vm.custom = vm.custom.map(function (customItem) {
				customItem.custom_field = Object.assign({}, customItem)

				customItem.key = 'custom_fields.' + customItem.user_code
				customItem.name = 'Custom Field. ' + customItem.name

				return customItem
			})

			vm.attrsList = []

			vm.attrsList = vm.attrsList.concat(vm.balanceAttrs)
			vm.attrsList = vm.attrsList.concat(vm.allocationAttrs)
			vm.attrsList = vm.attrsList.concat(vm.allocationDynamicAttrs)

			vm.attrsList = vm.attrsList.concat(vm.balancePerformanceAttrs)
			vm.attrsList = vm.attrsList.concat(vm.balanceMismatchAttrs)
			vm.attrsList = vm.attrsList.concat(vm.custom)

			vm.attrsList = vm.attrsList.concat(vm.instrumentAttrs)
			vm.attrsList = vm.attrsList.concat(vm.instrumentDynamicAttrs)

			vm.attrsList = vm.attrsList.concat(vm.linkedInstrumentAttrs)
			vm.attrsList = vm.attrsList.concat(vm.linkedInstrumentDynamicAttrs)

			vm.attrsList = vm.attrsList.concat(vm.accountAttrs)
			vm.attrsList = vm.attrsList.concat(vm.accountDynamicAttrs)

			vm.attrsList = vm.attrsList.concat(vm.portfolioAttrs)
			vm.attrsList = vm.attrsList.concat(vm.portfolioDynamicAttrs)

			vm.attrsList = vm.attrsList.concat(vm.strategy1attrs)
			vm.attrsList = vm.attrsList.concat(vm.strategy2attrs)
			vm.attrsList = vm.attrsList.concat(vm.strategy3attrs)

			vm.updateAttrs(vm.custom)
		}

		vm.checkAreaAccessibility = function (item, type) {
			if (type === 'group') {
				if (
					[
						'notes',
						'accounts',
						'responsibles',
						'counterparties',
						'transaction_types',
						'portfolios',
						'content_types',
					].indexOf(item.key) !== -1
				) {
					return true
				}
				return false
			} else {
				if (['notes'].indexOf(item.key) !== -1) {
					return true
				}
				return false
			}
		}

		vm.bindReportItemName = function (item) {
			// if (item.name.toLocaleLowerCase().indexOf('strategy') == -1) {
			//
			//     var pieces = item.name.split('.');
			//
			//     return pieces[pieces.length - 1];
			// }

			return item.name
		}

		vm.syncAttrs = function () {
			syncTypeAttrs(vm.balanceAttrs)
			syncTypeAttrs(vm.balancePerformanceAttrs)
			syncTypeAttrs(vm.balanceMismatchAttrs)
			syncTypeAttrs(vm.custom)
			syncTypeAttrs(vm.allocationAttrs)
			syncTypeAttrs(vm.allocationDynamicAttrs)

			syncTypeAttrs(vm.instrumentAttrs)
			syncTypeAttrs(vm.instrumentDynamicAttrs)

			syncTypeAttrs(vm.linkedInstrumentAttrs)
			syncTypeAttrs(vm.linkedInstrumentDynamicAttrs)

			syncTypeAttrs(vm.accountAttrs)
			syncTypeAttrs(vm.accountDynamicAttrs)

			syncTypeAttrs(vm.portfolioAttrs)
			syncTypeAttrs(vm.portfolioDynamicAttrs)

			syncTypeAttrs(vm.strategy1attrs)
			syncTypeAttrs(vm.strategy2attrs)
			syncTypeAttrs(vm.strategy3attrs)
		}

		function syncTypeAttrs(attrs) {
			var i
			for (i = 0; i < attrs.length; i = i + 1) {
				attrs[i].columns = false
				attrs[i].filters = false
				attrs[i].groups = false

				columns.map(function (item) {
					if (attrs[i].entity === item.entity) {
						if (attrs[i].key === item.key) {
							attrs[i].columns = true
						}
					}
				})

				filters.map(function (item) {
					if (attrs[i].entity === item.entity) {
						if (attrs[i].key === item.key) {
							attrs[i].filters = true
						}
					}
				})

				groups.map(function (item) {
					if (attrs[i].entity === item.entity) {
						if (attrs[i].key === item.key) {
							attrs[i].groups = true
						}
					}
				})
			}
		}

		function updateTypeAttrs(attrs) {
			var c, g, f
			var columnExist, groupExist, filterExist

			attrs.forEach(function (attr) {
				columnExist = false
				groupExist = false
				filterExist = false

				for (c = 0; c < columns.length; c = c + 1) {
					if (attr.entity === columns[c].entity) {
						if (attr.key === columns[c].key) {
							columnExist = true
							if (attr.columns === false) {
								columns.splice(c, 1)
								c = c - 1
							}
							break
						}
					}
				}

		@/angularroups

				for (g = 0; g < groups.length; g = g + 1) {
					if (attr.entity === groups[g].entity) {
						if (attr.key === groups[g].key) {
							groupExist = true
							if (attr.groups === false) {
								groups.splice(g, 1)
								g = g - 1
							}
							break
						}
					}
				}

		@/angularILTERING

				for (f = 0; f < filters.length; f = f + 1) {
					if (attr.entity === filters[f].entity) {
						if (attr.key === filters[f].key) {
							filterExist = true
							if (attr.filters === false) {
								filters.splice(f, 1)
								f = f - 1
							}
							break
						}
					}
				}

				if (!columnExist && attr.columns === true) {
					columns.push(evHelperService.getTableAttrInFormOf('column', attr))
				}

				if (!groupExist && attr.groups === true) {
					groups.push(evHelperService.getTableAttrInFormOf('group', attr))
				}

				if (!filterExist && attr.filters === true) {
					filters.push(evHelperService.getTableAttrInFormOf('filter', attr))
				}
			})

			vm.entityViewerDataService.setColumns(columns)
			vm.entityViewerDataService.setGroups(groups)
			vm.entityViewerDataService.setFilters(filters)
		}

		vm.updateAttrs = function (attrs) {
			updateTypeAttrs(attrs)

			evDataHelper.updateColumnsIds(vm.entityViewerDataService)
			evDataHelper.setColumnsDefaultWidth(vm.entityViewerDataService)

			vm.entityViewerEventService.dispatchEvent(evEvents.COLUMNS_CHANGE)
			vm.entityViewerEventService.dispatchEvent(evEvents.FILTERS_CHANGE)
			vm.entityViewerEventService.dispatchEvent(evEvents.GROUPS_CHANGE)

			vm.entityViewerEventService.dispatchEvent(evEvents.REDRAW_TABLE)
		}

		// format data for SELECTED tab
		vm.selectedGroups = []
		vm.selectedColumns = []
		vm.selectedFilters = []

		var getSelectedAttrs = function () {
			const attributes = [
				'balanceAttrs',
				'balancePerformanceAttrs',
				'balanceMismatchAttrs',
				'custom',
				'allocationAttrs',
				'allocationDynamicAttrs',
				'instrumentAttrs',
				'instrumentDynamicAttrs',
				'linkedInstrumentAttrs',
				'linkedInstrumentDynamicAttrs',
				'accountAttrs',
				'accountDynamicAttrs',
				'portfolioAttrs',
				'portfolioDynamicAttrs',
				'strategy1attrs',
				'strategy2attrs',
				'strategy3attrs',
			]

			const attrGroups = { groups, columns, filters } // Victor 2020.12.10 I need variables: groups, columns, filters in gModalSharedLogicHelper

			gModalSharedLogicHelper.getSelectedAttrs(attributes, attrGroups)
		}
		// < format data for SELECTED tab >

		vm.onSelectedAttrsChange = function (attributesList, selectedAttr) {
			for (var i = 0; i < attributesList.length; i++) {
				if (attributesList[i].key === selectedAttr.key) {
					attributesList[i].groups = selectedAttr.groups
					attributesList[i].columns = selectedAttr.columns
					attributesList[i].filters = selectedAttr.filters
					break
				}
			}

			vm.updateAttrs(attributesList)
		}

		vm.openCustomFieldsManager = function ($event) {
			$mdDialog.show({
				controller: 'CustomFieldDialogController as vm',
				templateUrl: 'views/dialogs/custom-field/custom-field-dialog-view.html',
				parent: angular.element(document.body),
				targetEvent: $event,
				clickOutsideToClose: false,
				multiple: true,
				autoWrap: true,
				skipHide: true,
				locals: {
					attributeDataService: attributeDataService,
					entityViewerEventService: entityViewerEventService,
					data: {
						entityType: vm.entityType,
					},
				},
			})
		}

		vm.selectAttribute = function (selectedGroup, event) {
			var availableAttrs
			var dialogTitle

			switch (selectedGroup) {
				case 'group':
					dialogTitle = 'Choose column to add'
					availableAttrs = vm.attrsList.filter(function (attr) {
						return !attr.groups
					})
					break
				case 'column':
					dialogTitle = 'Choose column to add'
					availableAttrs = vm.attrsList.filter(function (attr) {
						return !attr.columns
					})
					break
				case 'filter':
					dialogTitle = 'Choose filter to add'
					availableAttrs = vm.attrsList.filter(function (attr) {
						return !attr.filters
					})
					break
			}

			$mdDialog
				.show({
					controller: 'TableAttributeSelectorDialogController as vm',
					templateUrl:
						'views/dialogs/table-attribute-selector-dialog-view.html',
					targetEvent: event,
					multiple: true,
					locals: {
						data: {
							availableAttrs: availableAttrs,
							title: dialogTitle,
							isReport: true,
							multiselector: true,
						},
					},
				})
				.then(function (res) {
					if (res && res.status === 'agree') {
						for (var j = 0; j < res.data.items.length; j++) {
							for (var i = 0; i < vm.attrsList.length; i++) {
								if (vm.attrsList[i].key === res.data.items[j].key) {
									switch (selectedGroup) {
										case 'group':
											vm.attrsList[i].groups = true
											break
										case 'column':
											vm.attrsList[i].columns = true
											break
										case 'filter':
											vm.attrsList[i].filters = true
											break
									}

									break
								}
							}
						}

						vm.updateAttrs(vm.attrsList)
					}
				})
		}

		vm.cancel = function () {
			$('body').removeClass('drag-dialog')
			$mdDialog.hide()
		}

		vm.MABtnVisibility = function (entityType) {
			return metaService.checkRestrictedEntityTypesForAM(entityType)
		}

		var init = function () {
			vm.getAttributes()

			vm.entityViewerEventService.addEventListener(
				evEvents.COLUMNS_CHANGE,
				function () {
					columns = vm.entityViewerDataService.getColumns()
					vm.syncAttrs()
					getSelectedAttrs()
				}
			)

			vm.entityViewerEventService.addEventListener(
				evEvents.GROUPS_CHANGE,
				function () {
					groups = vm.entityViewerDataService.getGroups()
					vm.syncAttrs()
					getSelectedAttrs()
				}
			)

			vm.entityViewerEventService.addEventListener(
				evEvents.FILTERS_CHANGE,
				function () {
					filters = vm.entityViewerDataService.getFilters()
					vm.syncAttrs()
					getSelectedAttrs()
				}
			)

			vm.entityViewerEventService.addEventListener(
				evEvents.DYNAMIC_ATTRIBUTES_CHANGE,
				function () {
					vm.getCustomAttrs()
				}
			)
		}

		init()
	}

