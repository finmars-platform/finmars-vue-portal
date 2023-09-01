import processesService from '@/angular/services/processesService'
/**
 * Created by szhitenev on 30.05.2016.
 */

import metaService from '@/angular/services/metaService'
// import usersService from '@/angular/services/usersService';
// import backendConfigurationImportService from '@/angular/services/backendConfigurationImportService';
// import usersGroupService from '@/angular/services/usersGroupService';
import mappingsImportService from '@/angular/services/mappings-import/mappingsImportService'

export default function configurationImportDialogController(
	$scope,
	$mdDialog,
	usersService,
	usersGroupService,
	backendConfigurationImportService,
	systemMessageService,
	metaContentTypesService,
	configurationImportService,
	data
) {


	var vm = this

	vm.pageState = 'import-manager'

	vm.file = data.file
	vm.rawFile = data.rawFile

	vm.settings = { mode: 'skip' }
	vm.processing = false
	vm.selectAllState = false
	vm.counter = 0

	vm.readyStatus = { duplicates: false, member: false, groups: false }

	vm.toggleMode = function (mode) {
		if (vm.settings.mode === mode) {
			vm.settings.mode = null
		} else {
			vm.settings.mode = mode
		}
	}

	var sortItems = function () {
		var groups = []
		metaService
			.getContentGroups('exportImportConfigGroups')
			.then(function (data) {
				groups = data
				var renderedFirstLevelGroups = [] // used to check if property with first level group name already added

				vm.items.forEach(function (parent) {
					// Assign group to file
					var g, e, s
					loop1: for (g = 0; g < groups.length; g++) {
						for (e = 0; e < groups[g].entities.length; e++) {
							if (groups[g].entities[e] === parent.entity) {
								if (!groups[g].firstElementExist) {
									// If a file first in the group, attach to it group name to display

									if (
										renderedFirstLevelGroups.indexOf(
											groups[g].firstLevelGroup
										) === -1
									) {
										parent.first_level_header__ = groups[g].firstLevelGroup
										renderedFirstLevelGroups.push(groups[g].firstLevelGroup)
									}

									parent.first_item__ = groups[g].name
									groups[g].firstElementExist = true
								}

								parent.order__ = g // Set a group order position

								// Divide children into subgroups
								if (
									parent.entity === 'ui.listlayout' ||
									parent.entity === 'ui.reportlayout'
								) {
									var subGroupsList = groups[g].subGroups[parent.entity]

									var children = parent.content

									children.forEach(function (child) {
										for (s = 0; s < subGroupsList.length; s++) {
											if (
												child.content_type === subGroupsList[s].content_type
											) {
												if (!subGroupsList[s].firstElementExist) {
													child.first_item__ = subGroupsList[s].name
													subGroupsList[s].firstElementExist = true
												}

												child.order__ = s
											}
										}
									})
								} else if (parent.entity === 'transactions.transactiontype') {
									vm.groupByProperty(parent.content, '___group__user_code')
								}
								// < Divide children into subgroups >

								break loop1
							}
						}
					}
					// < Assign group to file >
				})

				findDynamicAttributesInLayouts()
			})
	}

	vm.groupByProperty = function (elements, propertyToGroupBy) {
		// add headers to groups of layouts based on property

		var hasFirstElement = []

		elements.forEach(function (element) {
			if (element.hasOwnProperty(propertyToGroupBy)) {
				var valueToGroupBy = element[propertyToGroupBy]

				if (valueToGroupBy === '-') {
					valueToGroupBy = 'Transaction types without group'
				}

				if (hasFirstElement.indexOf(valueToGroupBy) === -1) {
					element.first_item__ = valueToGroupBy
					hasFirstElement.push(valueToGroupBy)
				}

				element.order__ = valueToGroupBy
			}
		})
	}

	var findDynamicAttributesInLayouts = function () {
		var dynamicAttrsGroupIndex = 5

		var layoutsList = []

		var i
		for (i = 0; i < vm.items.length; i++) {
			if (
				vm.items[i].entity === 'ui.listlayout' ||
				vm.items[i].entity === 'ui.reportlayout'
			) {
				// create one array of all layouts
				layoutsList = layoutsList.concat(vm.items[i].content)
			}
		}

		if (layoutsList && layoutsList !== {}) {
			vm.items.map(function (entityItem) {
				if (entityItem.order__ === dynamicAttrsGroupIndex) {
					var matchingLayout = ''
					switch (entityItem.entity) {
						case 'obj_attrs.portfolioattributetype':
							matchingLayout = 'portfolios.portfolio'
							break
						case 'obj_attrs.accountattributetype':
							matchingLayout = 'accounts.account'
							break
						case 'obj_attrs.accounttypeattributetype':
							matchingLayout = 'accounts.accounttype'
							break
						case 'obj_attrs.responsibleattributetype':
							matchingLayout = 'counterparties.responsible'
							break
						case 'obj_attrs.counterpartyattributetype':
							matchingLayout = 'counterparties.counterparty'
							break
						case 'obj_attrs.instrumentattributetype':
							matchingLayout = 'instruments.instrument'
							break
						case 'obj_attrs.instrumenttypeattributetype':
							matchingLayout = 'instruments.instrumenttype'
							break
					}

					entityItem.content.map(function (attr) {
						var daName = attr.name
						var daUserCode = attr.user_code
						var usagesCount = 0

						layoutsList.map(function (layout) {
							if (matchingLayout.indexOf(layout.content_type) !== -1) {
								// to determine if it is possible for this layout can contain such an attribute
								var layoutColumns = layout.data.columns
								var layoutGroups = layout.data.grouping
								var attributeIsUsed = false
								var attributeNameProperty = 'name'

								if (layout.content_type.indexOf('report') !== -1) {
									// use source_name when map layout of report
									attributeNameProperty = 'source_name'
								}

								var l
								for (l = 0; l < layoutColumns.length; l++) {
									if (layoutColumns[l].hasOwnProperty('user_code')) {
										if (
											layoutColumns[l][attributeNameProperty] === daName &&
											layoutColumns[l].user_code === daUserCode
										) {
											attributeIsUsed = true
											break
										}
									}
								}

								if (!attributeIsUsed) {
									var g
									for (g = 0; g < layoutGroups.length; g++) {
										if (layoutGroups[g].hasOwnProperty('user_code')) {
											if (
												layoutGroups[g][attributeNameProperty] === daName &&
												layoutGroups[g].user_code === daUserCode
											) {
												attributeIsUsed = true
												break
											}
										}
									}
								}

								if (attributeIsUsed) {
									entityItem.attributeIsUsed__ = true
									usagesCount = usagesCount + 1
									attr.countOfUsages__ = usagesCount
								}
							}
						})
					})
				}
			})
		}
	}

	vm.getEntityName = function (item) {
		switch (item.entity) {
			case 'transactions.transactiontype':
				return 'Transaction Types'
			case 'transactions.transactiontypegroup':
				return 'Transaction Type Groups'
			case 'accounts.accounttype':
				return 'Account Types'
			case 'instruments.pricingpolicy':
				return 'Pricing Policy'
			case 'currencies.currency':
				return 'Currencies'
			case 'instruments.instrumenttype':
				return 'Instrument Types'
			case 'ui.editlayout':
				return 'Input Form'
			case 'ui.listlayout':
				return 'Entity viewer layouts'
			case 'ui.reportlayout':
				return 'Report builder layouts'
			case 'ui.dashboardlayout':
				return 'Dashboard layouts'
			case 'ui.templatelayout':
				return 'Template Layout'
			case 'ui.contextmenulayout':
				return 'Context Menu Layout'
			case 'ui.bookmark':
				return 'Bookmarks'
			case 'ui.columnsortdata':
				return 'Column Sort Data'
			case 'reference_tables.referencetable':
				return 'Reference Tables'
			case 'csv_import.csvimportscheme':
				return 'Simple Entity Import Schemes'
			case 'complex_import.compleximportscheme':
				return 'Complex Import Schemes'
			case 'integrations.instrumentdownloadscheme':
				return 'Instrument Download Schemes'
			case 'integrations.pricedownloadscheme':
				return 'Price Download Schemes'
			case 'integrations.complextransactionimportscheme':
				return 'Complex Transaction Import Scheme'
			case 'obj_attrs.portfolioattributetype':
				return 'Portfolio Dynamic Attributes'
			case 'obj_attrs.accountattributetype':
				return 'Account Dynamic Attributes'
			case 'obj_attrs.accounttypeattributetype':
				return 'Account Type Dynamic Attributes'
			case 'obj_attrs.responsibleattributetype':
				return 'Responsible Dynamic Attributes'
			case 'obj_attrs.counterpartyattributetype':
				return 'Counterparty Dynamic Attributes'
			case 'obj_attrs.instrumentattributetype':
				return 'Instrument Dynamic Attributes'
			case 'obj_attrs.instrumenttypeattributetype':
				return 'Instrument Type Dynamic Attributes'
			case 'obj_attrs.transactiontypeattributetype':
				return 'Transaction Type Dynamic Attributes'
			case 'obj_attrs.strategy1attributetype':
				return 'Strategy 1 Dynamic Attributes'
			case 'obj_attrs.strategy2attributetype':
				return 'Strategy 2 Dynamic Attributes'
			case 'obj_attrs.strategy3attributetype':
				return 'Strategy 3 Dynamic Attributes'
			case 'obj_attrs.currencyattributetype':
				return 'Currency Dynamic Attributes'
			case 'reports.balancereportcustomfield':
				return 'Balance Report Custom Fields'
			case 'reports.plreportcustomfield':
				return 'P&L Report Custom Fields'
			case 'reports.transactionreportcustomfield':
				return 'Transaction Report Custom Fields'
			case 'ui.instrumentuserfieldmodel':
				return 'Instrument User Text Field Names'
			case 'ui.transactionuserfieldmodel':
				return 'Transaction User Field Names'
			case 'ui.entitytooltip':
				return 'System Tooltips'
			case 'ui.colorpalette':
				return 'Color Palettes'
			case 'pricing.currencypricingscheme':
				return 'Currency Pricing Scheme'
			case 'pricing.instrumentpricingscheme':
				return 'Instrument Pricing Scheme'
			case 'pricing.pricingprocedure':
				return 'Pricing Procedure'
			case 'procedures.requestdatafileprocedure':
				return 'Data Procedure'
			case 'schedules.pricingschedule':
				return 'Pricing Schedule'
			case 'obj_attrs.genericattributetype':
				var result = 'Attribute types'

				if (item.content && item.content.length) {
					result = result + ' (' + item.content[0].content_type + ')'
				}

				return result
			default:
				return 'Unknown'
		}
	}

	vm.getItemName = function (item) {
		// transactions.transactiontype, transactions.transactiontypegroup, currencies.currency, instruments.pricingpolicy, instruments.instrumenttype, all dynamic attrs (obj_attrs)
		if (item.hasOwnProperty('user_code')) {
			var result = item.user_code

			if (item.hasOwnProperty('user_code')) {
				// integrations.instrumentdownloadscheme
				result = item.user_code
			}

			return result
		}

		// integrations.pricedownloadscheme, integrations.complextransactionimportscheme,
		if (item.hasOwnProperty('user_code')) {
			return item.user_code
		}

		if (item.hasOwnProperty('name')) {
			// csv_import.csvimportscheme
			if (item.hasOwnProperty('csv_fields')) {
				return (
					item.name +
					' (' +
					metaContentTypesService.getEntityNameByContentType(
						item.content_type
					) +
					')'
				)
			}

			// ui.listlayout, ui.reportlayout
			if (item.hasOwnProperty('data')) {
				// ui.bookmark
				if (item.hasOwnProperty('___content_type')) {
					/*if (item.hasOwnProperty('children') && item.children.length > 0) {
                            // return 'Bookmarks - Upper Layer (' + item.name + ')'
                            return "&folder;" + ' ' + item.name
                        } else {
                            return item.name
                        }*/
					return item.name
				}

				// return item.name + ' (' + metaContentTypesService.getEntityNameByContentType(item.content_type) + ')'
				return item.name
			}

			return item.name
		}

		// ui.editlayout
		if (item.hasOwnProperty('content_type')) {
			return metaContentTypesService.getEntityNameByContentType(
				item.content_type
			)
		}

		// import.pricingautomatedschedule
		if (item.hasOwnProperty('last_run_at')) {
			return 'Schedule'
		}
	}

	vm.checkForTextIcon = function (parentEntity, child) {
		if (parentEntity === 'ui.bookmark') {
			if (child.children.length > 0) {
				return true
			}
		}
	}

	var groupsPropertyNames = [
		'items',
		'dataSettings',
		'downloadSchemes',
		'systemElements',
	]

	vm.toggleSelectAll = function () {
		vm.selectAllState = !vm.selectAllState

		groupsPropertyNames.forEach(function (groupProperty) {
			vm[groupProperty].forEach(function (item) {
				item.someChildsActive = false
				item.active = vm.selectAllState

				item.content.forEach(function (child) {
					child.active = vm.selectAllState
				})
			})
		})
	}

	vm.checkSelectAll = function () {
		var active = true

		groupsPropertyNames.forEach(function (groupProperty) {
			vm[groupProperty].forEach(function (item) {
				if (!item.active) {
					active = false
				}

				item.content.forEach(function (child) {
					if (!child.active) {
						active = false
					}
				})
			})
		})

		vm.selectAllState = active
	}

	vm.toggleActiveForChildren = function (item) {
		item.active = !item.active
		item.someChildsActive = false
		item.content.forEach(function (child) {
			child.active = item.active
		})

		vm.checkSelectAll()
	}

	vm.updateActiveForParent = function (child, parent) {
		child.active = !child.active

		var ChildIsActive = false
		var ChildIsNotActive = false
		var parentIsActive = false

		parent.content.forEach(function (item) {
			if (item.active) {
				ChildIsActive = true
			} else {
				ChildIsNotActive = true
			}

			if (ChildIsActive && !ChildIsNotActive) {
				parentIsActive = true
			} else if (!ChildIsActive && ChildIsNotActive) {
				parent.someChildsActive = false
			} else {
				parentIsActive = false
				parent.someChildsActive = true
			}
		})

		parent.active = parentIsActive

		vm.checkSelectAll()
	}

	vm.getEntityDependenciesCaptions = function (entity) {
		var result = ''

		if (entity.dependencies && entity.dependencies.length) {
			result = result + '(Depends on: '

			var dependenciesList = []

			entity.dependencies.forEach(function (dependency) {
				dependenciesList.push(
					metaContentTypesService.getEntityNameByContentType(dependency.entity)
				)
			})

			result = result + dependenciesList.join(', ')

			result = result + ')'
		}

		return result
	}

	vm.getMappingsEntityName = function (item) {
		return metaContentTypesService.getEntityNameByContentType(item.entity)
	}

	var mappingGroups = [
		{
			entities: [
				'integrations.portfoliomapping',
				'integrations.currencymapping',
				'integrations.accountmapping',
				'integrations.instrumentmapping',
				'integrations.counterpartymapping',
				'integrations.responsiblemapping',
				'integrations.strategy1mapping',
				'integrations.periodicitymapping',
				'integrations.dailypricingmodelmapping',
				'integrations.paymentsizedetailmapping',
				'integrations.accrualcalculationmodelmapping',
				'integrations.pricingconditionmapping',
			],
			groupKey: 'systemElements',
		},
		{
			entities: [
				'integrations.accounttypemapping',
				'integrations.instrumenttypemapping',
				'integrations.pricingpolicymapping',
			],
			groupKey: 'dataSettings',
		},
		{
			entities: ['integrations.pricedownloadschememapping'],
			groupKey: 'downloadSchemes',
		},
	]

	vm.dataSettings = []
	vm.downloadSchemes = []
	vm.systemElements = []

	var separateMappingsIntoGroups = function (mItems) {
		vm.dataSettings = []
		vm.downloadSchemes = []
		vm.systemElements = []

		mItems.forEach(function (parent) {
			parent.content = parent.content.filter(function (child) {
				if (child.hasOwnProperty('user_code') && child.user_code === '-') {
					return false
				}

				if (child.hasOwnProperty('user_code') && child.user_code === '-') {
					return false
				}

				return true
			})

			for (var i = 0; i < mappingGroups.length; i++) {
				if (mappingGroups[i].entities.indexOf(parent.entity) !== -1) {
					vm[mappingGroups[i].groupKey].push(parent)
					break
				}

				if (i === mappingGroups.length - 1) {
					vm.systemElements.push(parent)
				}
			}
		})
	}

	var assembleMappingsIntoArray = function () {
		var mappings = [].concat(
			vm.dataSettings,
			vm.downloadSchemes,
			vm.systemElements
		)

		return mappings
	}

	vm.getCurrentMember = function () {
		return usersService.getMyCurrentMember().then(function (data) {
			vm.currentMember = data

			vm.readyStatus.member = true

			$scope.$apply()
		})
	}

	vm.getGroupList = function () {
		return usersGroupService.getList().then(function (data) {
			vm.groups = data.results.filter(function (item) {
				return item.role === 2
			})

			vm.readyStatus.groups = true
		})
	}

	vm.agree = function ($event) {
		vm.processing = true

		vm.activeItemTotal = 0
		window.importConfigurationCounter = 0

		vm.items.forEach(function (entity) {
			delete entity.order__
			delete entity.first_item__
			delete entity.attributeIsUsed__
			delete entity.first_level_header__

			entity.content.forEach(function (item) {
				delete item.order__
				delete item.first_item__
				delete item.countOfUsages__

				if (item.active) {
					vm.activeItemTotal = vm.activeItemTotal + 1
				}
			})
		})

		var mappingItems = assembleMappingsIntoArray()
		mappingItems = JSON.parse(angular.toJson(mappingItems))

		mappingItems.forEach(function (entityItem) {
			if (entityItem.active) {
				entityItem.content.forEach(function (item) {
					if (item.active) {
						vm.activeItemTotal = vm.activeItemTotal + 1
					}
				})
			}
		})

		try {
			var timeout = setInterval(function () {
				vm.counter = window.importConfigurationCounter
				$scope.$apply()
			}, 1000)

			vm.settings.member = vm.currentMember
			vm.settings.groups = vm.groups

			configurationImportService
				.importConfiguration(vm.items, vm.settings)
				.then(function (configurationData) {
					mappingsImportService
						.importMappings(mappingItems, vm.settings)
						.then(function (mappingsData) {
							clearInterval(timeout)




							if (configurationData.errors.length) {
								$mdDialog.hide({ status: 'errors_occurred', data: {} })

								// $mdDialog.show({
								//     controller: 'ConfigurationImportErrorsDialogController as vm',
								//     templateUrl: 'views/dialogs/configuration-import/configuration-import-errors-dialog-view.html',
								//     targetEvent: $event,
								//     preserveScope: true,
								//     multiple: true,
								//     autoWrap: true,
								//     skipHide: true,
								//     locals: {
								//         data: {
								//             errors: configurationData.errors
								//         }
								//     }
								//
								// });
							} else {
								$mdDialog
									.show({
										controller: 'SuccessDialogController as vm',
										templateUrl: 'views/dialogs/success-dialog-view.html',
										targetEvent: $event,
										preserveScope: true,
										multiple: true,
										autoWrap: true,
										skipHide: true,
										locals: {
											success: {
												title: '',
												description:
													'You have successfully imported configuration file',
											},
										},
									})
									.then(function () {
										$mdDialog.hide({ status: 'agree', data: {} })
									})
							}
						})
				})
				.catch(function (reason) {
					clearInterval(timeout)

					vm.processing = false

					$scope.$apply()
				})
		} catch (error) {
			vm.processing = false

			console.error(error)
		}
	}

	vm.getTask = function () {
		processesService.getByKey(vm.currentTaskId).then(function (data) {
			vm.task = data


			if (vm.task.status === 'D' || vm.task.status === 'E') {
				clearInterval(vm.poolingInterval)
				vm.poolingInterval = null
				vm.processing = false
				vm.importIsFinished = true

				vm.pageState = 'import-complete'
			}

			$scope.$apply()
		})
	}

	vm.importConfiguration = function ($event) {


		vm.processing = true

		clearInterval(vm.poolingInterval)
		vm.poolingInterval = null
		vm.importIsFinished = false

		vm.items.forEach(function (entity) {
			delete entity.order__
			delete entity.first_item__
			delete entity.attributeIsUsed__
			delete entity.first_level_header__

			entity.content.forEach(function (item) {
				delete item.order__
				delete item.first_item__
				delete item.countOfUsages__

				if (item.active) {
					vm.activeItemTotal = vm.activeItemTotal + 1
				}
			})
		})

		vm.items = vm.items.filter(function (entity) {
			entity.content = entity.content.filter(function (item) {
				return item.active
			})
			return true
		})

		var mappingItems = assembleMappingsIntoArray()
		mappingItems = JSON.parse(angular.toJson(mappingItems))

		mappingItems = mappingItems.filter(function (entity) {
			entity.content = entity.content.filter(function (item) {
				return item.active
			})
			return true
		})




		var date = new Date().toISOString().slice(0, 10) // yyyy-mm-dd

		var configuration = {
			head: {
				date: date,
			},
			body: [
				{
					section_name: 'configuration',
					items: vm.items,
				},
				{
					section_name: 'mappings',
					items: mappingItems,
				},
			],
		}

		vm.importConfig = {
			data: configuration,
			mode: vm.settings.mode,
		}

		vm.pageState = 'import-progress'

		backendConfigurationImportService
			.importConfigurationAsJson(vm.importConfig)
			.then(function (data) {
				vm.importConfig = data

				vm.currentTaskId = data.task_id

				$scope.$apply()

				vm.getTask()

				vm.poolingInterval = setInterval(function () {
					vm.getTask()
				}, 1000)
			})
			.catch(function (reason) {
				console.error(reason)
				vm.pageState = 'import-error'
				vm.errorMessage = reason
				$scope.$apply()
			})
	}

	vm.showImportDetails = function ($event) {
		// $mdDialog.show({
		//     controller: 'ConfigurationImportResultDialogController as vm',
		//     templateUrl: 'views/dialogs/configuration-import/configuration-import-result-dialog-view.html',
		//     targetEvent: $event,
		//     preserveScope: true,
		//     multiple: true,
		//     autoWrap: true,
		//     skipHide: true,
		//     locals: {
		//         data: vm.importConfig
		//     }
		//
		// })

		// TODO WTF why systemMessage Service, replace with FilePreview Service later
		systemMessageService
			.viewFile(vm.task.attachments[0].file_report)
			.then(function (data) {


				$mdDialog.show({
					controller: 'FilePreviewDialogController as vm',
					templateUrl: 'views/dialogs/file-preview-dialog-view.html',
					parent: angular.element(document.body),
					targetEvent: $event,
					clickOutsideToClose: false,
					preserveScope: true,
					autoWrap: true,
					skipHide: true,
					multiple: true,
					locals: {
						data: {
							content: data,
							info: vm.task.attachments[0],
						},
					},
				})
			})
	}

	vm.goToDefaultState = function ($event) {
		vm.importConfig = null
		vm.configurationFile = null
		vm.file = null
		vm.processing = false
		vm.pageState = 'import-manager'
	}

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.checkForDuplicates = function () {
		vm.readyStatus.duplicates = false

		configurationImportService
			.checkForDuplicates(vm.rawFile)
			.then(function (data) {
				vm.items.forEach(function (itemEntity) {
					data.results.forEach(function (duplicateDataEntity) {
						itemEntity.content.forEach(function (item) {
							duplicateDataEntity.content.forEach(function (duplicateDataItem) {
								if (
									item.hasOwnProperty('user_code') &&
									duplicateDataItem.hasOwnProperty('user_code')
								) {
									if (item.user_code === duplicateDataItem.user_code) {
										item.is_duplicate = duplicateDataItem.is_duplicate
									}
								} else {
									if (
										item.hasOwnProperty('user_code') &&
										duplicateDataItem.hasOwnProperty('user_code')
									) {
										if (item.user_code === duplicateDataItem.user_code) {
											item.is_duplicate = duplicateDataItem.is_duplicate
										}
									} else {
										if (
											item.hasOwnProperty('name') &&
											duplicateDataItem.hasOwnProperty('name')
										) {
											if (item.name === duplicateDataItem.name) {
												item.is_duplicate = duplicateDataItem.is_duplicate
											}
										}
									}
								}

								if (item.is_duplicate) {
									itemEntity.is_duplicate = true
								}

								if (itemEntity.entity === 'ui.editlayout') {
									itemEntity.is_duplicate = true
									item.is_duplicate = true
								}
							})
						})
					})
				})



				vm.readyStatus.duplicates = true
				$scope.$apply()
			})
	}

	vm.init = function () {
		setTimeout(function () {
			vm.dialogElemToResize = document.querySelector(
				'.configImportDialogElemToResize'
			)
		}, 100)

		vm.sections = vm.file.body

		vm.getCurrentMember()
		vm.getGroupList()

		vm.items = []
		var mappingItems = []

		if (data.selectAll) {
			vm.toggleSelectAll()
		}

		vm.sections.forEach(function (item) {
			if (item.section_name === 'configuration') {
				vm.items = item.items
			}

			if (item.section_name === 'mappings') {
				mappingItems = item.items
			}
		})




		vm.items.forEach(function (item) {
			item.active = false

			item.content.forEach(function (child) {
				child.active = false
			})
		})

		vm.checkForDuplicates()

		sortItems()
		separateMappingsIntoGroups(mappingItems)
	}

	vm.init()
}
