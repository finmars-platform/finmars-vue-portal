/**
 * Created by mevstratov on 27.06.2019.
 */

import metaService from '../../services/metaService'
import configurationService from '../../services/configurationService'
// import usersService from '../../services/usersService';

export default function (
	$scope,
	$mdDialog,
	usersService,
	metaContentTypesService,
	uiService
) {
	var vm = this

	vm.activeTab = 'configuration'

	vm.readyStatus = { content: false, layouts: false }
	vm.layouts = []

	vm.activeLayout = {
		data: {},
	}

	vm.groupPrefixes = []

	vm.selectAllState = false

	vm.getFile = function () {
		return new Promise(function (resolve, reject) {
			configurationService.getConfigurationData().then(function (data) {


				vm.file = data
				vm.items = data.body

				var groups = []
				var renderedFirstLevelGroups = [] // used to check if property with first level group name already added

				metaService
					.getContentGroups('exportImportConfigGroups')
					.then(function (data) {
						groups = data

						vm.items.forEach(function (parent) {
							parent.content = parent.content.filter(function (child) {
								if (
									child.hasOwnProperty('user_code') &&
									child.user_code === '-'
								) {
									return false
								}

								if (
									child.hasOwnProperty('user_code') &&
									child.user_code === '-'
								) {
									return false
								}

								return true
							})

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
										} else if (
											parent.entity === 'transactions.transactiontype'
										) {
											vm.groupByProperty(parent.content, '___group__user_code')
										}
										// < Divide children into subgroups >

										break loop1
									}
								}
							}
							// < Assign group to file >
						})

						vm.findDynamicAttributesInLayouts()

						vm.readyStatus.content = true
						resolve($scope.$apply())
					})
			})
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

	vm.findDynamicAttributesInLayouts = function () {
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

		vm.items.map(function (entityItem) {
			if (entityItem.order__ === dynamicAttrsGroupIndex) {
				var matchingLayout = [
					'reports.balancereport',
					'reports.plreport',
					'reports.transactionreport',
				]
				switch (entityItem.entity) {
					case 'obj_attrs.portfolioattributetype':
						matchingLayout.push('portfolios.portfolio')
						break
					case 'obj_attrs.accountattributetype':
						matchingLayout.push('accounts.account')
						break
					case 'obj_attrs.accounttypeattributetype':
						matchingLayout.push('accounts.accounttype')
						break
					case 'obj_attrs.responsibleattributetype':
						matchingLayout.push('counterparties.responsible')
						break
					case 'obj_attrs.counterpartyattributetype':
						matchingLayout.push('counterparties.counterparty')
						break
					case 'obj_attrs.instrumentattributetype':
						matchingLayout.push('instruments.instrument')
						break
					case 'obj_attrs.instrumenttypeattributetype':
						matchingLayout.push('instruments.instrumenttype')
						break
					case 'obj_attrs.currencyattributetype':
						matchingLayout.push('currencies.currency')
						break
				}

				entityItem.content.map(function (attr) {
					// For report layout check
					var daContentType = ''
					switch (attr.content_type) {
						case 'portfolios.portfolio':
							daContentType = 'Portfolio'
							break
						case 'instruments.instrument':
							daContentType = 'Instrument'
							break
						case 'counterparties.responsible':
							daContentType = 'Responsible'
							break
						case 'counterparties.counterparty':
							daContentType = 'Counterparty'
							break
						case 'accounts.account':
							daContentType = 'Account'
							break
					}

					var daName = attr.name
					var usagesCount = 0

					// Searching attribute usage in layout
					layoutsList.map(function (layout) {
						if (matchingLayout.indexOf(layout.content_type) !== -1) {
							// determine if it is possible for this layout can contain such an attribute

							var columnsInLayout = layout.data.columns
							var groupsInLayout = layout.data.grouping
							var attributeIsUsed = false

							if (layout.content_type.indexOf('report') !== -1) {
								var rg
								if (groupsInLayout) {
									for (rg = 0; rg < groupsInLayout.length; rg++) {
										var columnName = groupsInLayout[rg].name.split('. ')

										if (
											columnName[0].indexOf(daContentType) !== -1 &&
											columnName[1] === daName
										) {
											attributeIsUsed = true
											break
										}
									}
								}

								if (!attributeIsUsed) {
									var rс
									if (columnsInLayout) {
										for (rс = 0; rс < columnsInLayout.length; rс++) {
											var columnName = columnsInLayout[rс].name.split('. ')

											if (
												columnName[0].indexOf(daContentType) !== -1 &&
												columnName[1] === daName
											) {
												attributeIsUsed = true
												break
											}
										}
									}
								}
							} else {
								var g
								for (g = 0; g < groupsInLayout.length; g++) {
									if (groupsInLayout[g].name === daName) {
										attributeIsUsed = true
										break
									}
								}

								if (!attributeIsUsed) {
									var с
									for (с = 0; с < columnsInLayout.length; с++) {
										if (columnsInLayout[с].name === daName) {
											attributeIsUsed = true
											break
										}
									}
								}
							}

							if (attributeIsUsed) {
								entityItem.attributeIsUsed__ = true
								usagesCount = usagesCount + 1
								attr.countOfUsages__ = usagesCount - 1 // count starts from 0
							}
						}
					})
					// < Searching attribute usage in layout  >
				})
			}
		})
	}

	vm.getECProperties = function (item) {
		var result = {}

		if (item.hasOwnProperty('cron_expr')) {
			result.cron_expr = item.cron_expr
		} else if (item.hasOwnProperty('user_code')) {
			result.user_code = item.user_code
		} else if (item.hasOwnProperty('user_code')) {
			result.user_code = item.user_code
		} else if (item.hasOwnProperty('content_type')) {
			result.content_type = item.content_type
		} else if (item.hasOwnProperty('name')) {
			result.name = item.name
		}

		return result
	}

	vm.getConfigurationExportLayouts = function () {
		vm.readyStatus.layouts = false

		uiService.getConfigurationExportLayoutList().then(function (data) {
			vm.layouts = data.results

			if (vm.layouts.length) {
				vm.activeLayout = vm.layouts[0]

				vm.layouts.forEach(function (item) {
					if (item.is_default) {
						vm.activeLayout = item
					}
				})
			} else if (typeof vm.activeLayout === 'object') {
				delete vm.activeLayout.id
				delete vm.activeLayout.name
				delete vm.activeLayout.is_default
			}

			if (vm.activeLayout) {
				vm.syncWithLayout()
			}

			vm.readyStatus.layouts = true

			$scope.$apply()
		})
	}

	vm.deactivateAll = function () {
		vm.items.forEach(function (entityItem) {
			entityItem.active = false
			entityItem.someChildsActive = false

			entityItem.content.forEach(function (childItem) {
				childItem.active = false
			})
		})
	}

	var syncItemsWithLayout = function (itemType, entityItem) {
		var layoutData = vm.activeLayout.data[itemType][entityItem.entity]

		if (layoutData && layoutData.length > 0) {
			entityItem.content.forEach(function (childItem) {
				if (itemType === 'statuses') {
					var searchItem = vm.getECProperties(childItem)
				} else {
					var searchItem = childItem.value
				}

				// ;

				layoutData.forEach(function (layoutDataItem) {
					// ;

					if (layoutDataItem) {
						var active = true

						Object.keys(searchItem).forEach(function (key) {
							if (layoutDataItem[key] !== searchItem[key]) {
								active = false
							}
						})

						if (active) {
							childItem.active = true
							entityItem.someChildsActive = true
						}
					}
				})
			})

			entityItem.active = true
			entityItem.content.forEach(function (item) {
				if (!item.active) {
					entityItem.active = false
				}
			})
		}
	}

	var syncConfigItemsWithLayout = function (cItem) {
		syncItemsWithLayout('statuses', cItem)
	}

	var syncMappingItemsWithLayout = function (mItem) {
		syncItemsWithLayout('mappingsStatuses', mItem)
	}

	vm.syncWithLayout = function () {
		vm.layouts.forEach(function (item) {
			item.is_default = false
		})

		vm.activeLayout.is_default = true

		vm.deactivateAll()

		vm.filename = vm.activeLayout.data.filename

		if (!vm.activeLayout.data.statuses) {
			vm.activeLayout.data.statuses = {}
		}

		vm.items.forEach(syncConfigItemsWithLayout)

		if (!vm.activeLayout.data.mappingsStatuses) {
			vm.activeLayout.data.mappingsStatuses = {}
		}

		// syncing mappings with layout
		vm.dataSettings.forEach(syncMappingItemsWithLayout)
		vm.downloadSchemes.forEach(syncMappingItemsWithLayout)
		vm.systemElements.forEach(syncMappingItemsWithLayout)

		vm.checkSelectAll()
	}

	vm.updateLayout = function ($event) {
		if (!vm.activeLayout.data.statuses) {
			vm.activeLayout.data.statuses = {}
		}

		vm.activeLayout.data.filename = vm.filename

		vm.items.forEach(function (item) {
			vm.activeLayout.data.statuses[item.entity] = []

			item.content.forEach(function (child) {
				if (child.active) {
					var result = vm.getECProperties(child)

					if (result || typeof result === 'string') {
						vm.activeLayout.data.statuses[item.entity].push(result)
					}
				}
			})
		})

		var mappingsItems = assembleMappingsIntoArray()

		if (!vm.activeLayout.data.mappingsStatuses) {
			vm.activeLayout.data.mappingsStatuses = {}
		}

		mappingsItems.forEach(function (item) {
			vm.activeLayout.data.mappingsStatuses[item.entity] = []

			item.content.forEach(function (child) {
				if (child.active) {
					var result = child.value

					if (result || typeof result === 'string') {
						vm.activeLayout.data.mappingsStatuses[item.entity].push(result)
					}
				}
			})
		})



		$mdDialog
			.show({
				controller: 'SaveConfigurationExportLayoutDialogController as vm',
				templateUrl:
					'views/dialogs/save-configuration-export-layout-dialog-view.html',
				targetEvent: $event,
				locals: {
					data: {
						layout: vm.activeLayout,
					},
				},
				multiple: true,
				preserveScope: true,
				autoWrap: true,
				skipHide: true,
			})
			.then(function (res) {
				if (res.status === 'agree') {
					vm.getConfigurationExportLayouts()
				}
			})
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

		/*vm.items.forEach(function (item) {
                item.someChildsActive = false;
                item.active = vm.selectAllState;


                item.content.forEach(function (child) {
                    child.active = vm.selectAllState;
                })

            });*/
	}

	vm.checkSelectAll = function () {
		var active = true

		groupsPropertyNames.forEach(function (groupProperty) {
			if (vm[groupProperty]) {
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
			}
		})

		/*vm.items.forEach(function (item) {

                if (!item.active) {
                    active = false;
                }

                item.content.forEach(function (child) {

                    if (!child.active) {
                        active = false;
                    }

                })

            });*/

		vm.selectAllState = active
	}

	vm.getEntityName = function (item) {
		var name = metaContentTypesService.getEntityNameByContentType(item.entity)

		if (item.entity === 'obj_attrs.genericattributetype') {
			var attr_name = 'Unknown'

			if (item.content && item.content.length) {
				attr_name = metaContentTypesService.getEntityNameByContentType(
					item.content[0].content_type
				)
			}

			name = 'Attribute Type ' + attr_name
		}

		if (!name) {
			name = 'Unknown (' + item.entity + ')'
		}

		return name

		// switch (item.entity) {
		//     case 'transactions.transactiontype':
		//         return "Transaction Types";
		//     case 'transactions.transactiontypegroup':
		//         return "Transaction Type Groups";
		//     case 'accounts.accounttype':
		//         return "Account Types";
		//     case 'currencies.currency':
		//         return 'Currencies';
		//     case 'instruments.pricingpolicy':
		//         return "Pricing Policy";
		//     case 'instruments.instrumenttype':
		//         return "Instrument Types";
		//     case 'ui.editlayout':
		//         return "Input Form";
		//     case 'ui.listlayout':
		//         return "Entity viewer layouts";
		//     case 'ui.reportlayout':
		//         return "Report builder layouts";
		//     case 'ui.dashboardlayout':
		//         return "Dashboard layouts";
		//     case 'ui.templatelayout':
		//         return 'Template Layout';
		//     case 'ui.contextmenulayout':
		//         return 'Context Menu Layout';
		//     case 'ui.bookmark':
		//         return "Bookmarks";
		//     case 'ui.entitytooltip':
		//         return 'System Tooltips';
		//     case 'ui.colorpalette':
		//         return 'Color Palettes';
		//     case 'ui.columnsortdata':
		//         return 'Column Sort Data';
		//     case 'reference_tables.referencetable':
		//         return "Reference Tables";
		//     case 'csv_import.csvimportscheme':
		//         return "Data import from CSV schemes";
		//     case 'complex_import.compleximportscheme':
		//         return 'Complex Import Schemes';
		//     case 'integrations.instrumentdownloadscheme':
		//         return "Instrument Download Schemes";
		//     case 'integrations.pricedownloadscheme':
		//         return "Price Download Schemes";
		//     case 'integrations.complextransactionimportscheme':
		//         return "Complex Transaction Import Scheme";
		//     case 'obj_attrs.portfolioattributetype':
		//         return "Portfolio Dynamic Attributes";
		//     case 'obj_attrs.accountattributetype':
		//         return "Account Dynamic Attributes";
		//     case 'obj_attrs.accounttypeattributetype':
		//         return "Account Type Dynamic Attributes";
		//     case 'obj_attrs.responsibleattributetype':
		//         return "Responsible Dynamic Attributes";
		//     case 'obj_attrs.counterpartyattributetype':
		//         return "Counterparty Dynamic Attributes";
		//     case 'obj_attrs.instrumentattributetype':
		//         return "Instrument Dynamic Attributes";
		//     case 'obj_attrs.instrumenttypeattributetype':
		//         return "Instrument Type Dynamic Attributes";
		//     case 'obj_attrs.transactiontypeattributetype':
		//         return "Transaction Type Dynamic Attributes";
		//     case 'obj_attrs.strategy1attributetype':
		//         return "Strategy 1 Dynamic Attributes";
		//     case 'obj_attrs.strategy2attributetype':
		//         return "Strategy 2 Dynamic Attributes";
		//     case 'obj_attrs.strategy3attributetype':
		//         return "Strategy 3 Dynamic Attributes";
		//     case 'obj_attrs.currencyattributetype':
		//         return "Currency Dynamic Attributes";
		//     case 'reports.balancereportcustomfield':
		//         return "Balance Report Custom Fields";
		//     case 'reports.plreportcustomfield':
		//         return "P&L Report Custom Fields";
		//     case 'reports.transactionreportcustomfield':
		//         return "Transaction Report Custom Fields";
		//     case 'ui.instrumentuserfieldmodel':
		//         return 'Instrument User Text Field Names';
		//     case 'ui.transactionuserfieldmodel':
		//         return 'Transaction User Field Names';
		//     case 'pricing.currencypricingscheme':
		//         return 'Currency Pricing Scheme';
		//     case 'pricing.instrumentpricingscheme':
		//         return 'Instrument Pricing Scheme';
		//     case 'pricing.pricingprocedure':
		//         return 'Pricing Procedure';
		//     case 'schedules.pricingschedule':
		//         return 'Pricing Schedule';
		//     case 'procedures.requestdatafileprocedure':
		//         return 'Data Procedure';
		//     default:
		//         return "Unknown ("+item.entity+")"
		// }
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
		})

		if (ChildIsActive && !ChildIsNotActive) {
			parentIsActive = true
		} else if (!ChildIsActive && ChildIsNotActive) {
			parent.someChildsActive = false
		} else {
			parentIsActive = false
			parent.someChildsActive = true
		}

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

	vm.cleanItemsBeforeExport = function (items) {
		var results = []

		if (items) {
			results = JSON.parse(angular.toJson(items))

			// removing properties created for data rendering

			results.forEach(function (entity) {
				delete entity.order__
				delete entity.first_item__
				delete entity.attributeIsUsed__
				delete entity.first_level_header__

				entity.content.forEach(function (item) {
					delete item.order__
					delete item.first_item__
					delete item.countOfUsages__
				})

				return entity
			})
		}

		return results
	}

	vm.convertToExportStructure = function (items) {
		var results = []

		items.forEach(function (item) {
			var result = {
				entity: item.entity,
				content: [],
				dependencies: item.dependencies,
				count: 0,
			}

			item.content.forEach(function (child) {
				if (child.active) {
					result.content.push(child)
				}
			})

			result.count = result.content.length

			if (result.count > 0) {
				results.push(result)
			}
		})

		return results
	}

	vm.export = function () {
		var mappingsItems = assembleMappingsIntoArray()

		mappingsItems = JSON.parse(angular.toJson(mappingsItems))

		var configurationItems = vm.cleanItemsBeforeExport(vm.items)

		var configurationResults = vm.convertToExportStructure(configurationItems)
		var mappingsResults = vm.convertToExportStructure(mappingsItems)




		vm.file.notes = vm.activeLayout.data.notes
		vm.file.body = []

		if (configurationResults.length) {
			vm.file.body.push({
				section_name: 'configuration',
				items: configurationResults,
			})
		}

		if (mappingsResults.length) {
			vm.file.body.push({
				section_name: 'mappings',
				items: mappingsResults,
			})
		}

		var resultFile = JSON.stringify(vm.file)

		var a = document.createElement('a')
		var result = new File([resultFile], { type: 'text/json;charset=utf-8' })

		a.href = URL.createObjectURL(result)
		a.download = vm.filename ? vm.filename + '.fcfg' : 'configuration.fcfg'

		document.body.appendChild(a) // For Mozilla Firefox
		a.click()

		setTimeout(function () {
			document.body.removeChild(a)
		}, 100)
	}

	// Mapping Section Start

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

	vm.getMappingFile = function () {
		return new Promise(function (resolve, reject) {
			configurationService
				.getMappingData()
				.then(function (data) {


					vm.file = data

					var mappingItems = data.body

					mappingItems = mappingItems.filter(function (item) {
						return (
							[
								'integrations.portfoliomapping',
								'integrations.currencymapping',
								'integrations.accountmapping',
								'integrations.instrumentmapping',
								'integrations.counterpartymapping',
								'integrations.responsiblemapping',
								'integrations.strategy1mapping',
								'integrations.strategy2mapping',
								'integrations.strategy3mapping',
							].indexOf(item.entity) === -1
						)
					})

					separateMappingsIntoGroups(mappingItems)

					vm.readyStatus.content = true

					$scope.$apply()
					resolve(true)
				})
				.catch(function (error) {
					reject(error)
				})
		})
	}

	/*vm.toggleSelectAllMappings = function () {

            vm.selectAllStateMappings = !vm.selectAllStateMappings;

            vm.mappingItems.forEach(function (item) {
                item.someChildsActive = false;
                item.active = vm.selectAllStateMappings;


                item.content.forEach(function (child) {
                    child.active = vm.selectAllStateMappings;
                })

            })

        };*/

	vm.getMappingsEntityName = function (item) {
		return metaContentTypesService.getEntityNameByContentType(item.entity)
	}

	vm.getCurrentMember = function () {
		usersService.getMyCurrentMember().then(function (data) {
			vm.member = data
			$scope.$apply()
		})
	}

	vm.getUserCodePrefixes = function () {
		usersService.getUsercodePrefixList().then(function (data) {
			vm.groupPrefixes = data.results

			if (vm.groupPrefixes.length) {
				vm.selectedGroupPrefix = vm.groupPrefixes[0].value
			}

			$scope.$apply()
		})
	}

	vm.updateFilters = function () {


	}

	// Mapping Section End

	vm.init = function () {
		/*vm.getFile().then(function () {
                vm.getConfigurationExportLayouts();
            });*/
		var getConfigsPromise = vm.getFile()
		var getMappingsPromise = vm.getMappingFile()

		vm.getUserCodePrefixes()
		vm.getCurrentMember()

		Promise.all([getConfigsPromise, getMappingsPromise]).then(function () {
			vm.getConfigurationExportLayouts()
		})
	}

	vm.init()
}
