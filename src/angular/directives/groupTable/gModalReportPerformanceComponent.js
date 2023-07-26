/**
 * Created by szhitenev on 05.05.2016.
 */


	import logService from '@/angular/core/services/logService'

	import evEvents from '../../services/entityViewerEvents'

	import metaService from '../../services/metaService'

	import evDataHelper from '../../helpers/ev-data.helper'

	export default function (
		$scope,
		$mdDialog,
		customFieldService,
		entityViewerDataService,
		entityViewerEventService,
		attributeDataService
	) {
		var vm = this
		vm.readyStatus = { content: false }

		vm.tabs = []
		vm.entityType = entityViewerDataService.getEntityType()

		//;
		//;

		logService.property('vm.entityType', vm.entityType)

		vm.general = []
		vm.attrs = []
		vm.baseAttrs = []
		vm.entityAttrs = []
		vm.custom = []

		vm.instrumentDynamicAttrs = []
		vm.accountDynamicAttrs = []
		vm.portfolioDynamicAttrs = []

		vm.isReport = metaService.isReport(vm.entityType)

		vm.tabAttrsReady = false

		// refactore this block
		function restoreAttrs() {
			function fillTabWithAttrs() {
				var i, x
				for (i = 0; i < vm.tabs.length; i = i + 1) {
					if (!vm.tabs[i].attrs) {
						vm.tabs[i].attrs = []

						for (x = 0; x < vm.tabs[i].layout.fields.length; x = x + 1) {
							if (vm.tabs[i].layout.fields[x].type !== 'empty') {
								if (vm.tabs[i].layout.fields[x].hasOwnProperty('id')) {
									vm.tabs[i].attrs.push({
										id: vm.tabs[i].layout.fields[x].id,
									})
								} else {
									if (vm.tabs[i].layout.fields[x].type !== 'empty') {
										if (
											vm.tabs[i].layout.fields[x].name != 'Labeled Line' &&
											vm.tabs[i].layout.fields[x].name != 'Line'
										) {
											vm.tabs[i].attrs.push({
												name: vm.tabs[i].layout.fields[x].name,
											})
										}
									}
								}
							}
						}
					}
				}
				//
			}

			function fillTabAttrs() {
				var a, t, c, b, e
				var tab, tabAttr, attr, baseAttr, attributeIsExist, entityAttr
				//;
				//;
				for (t = 0; t < vm.tabs.length; t = t + 1) {
					tab = vm.tabs[t]
					for (c = 0; c < tab.attrs.length; c = c + 1) {
						tabAttr = tab.attrs[c]
						attributeIsExist = false
						if (tabAttr.hasOwnProperty('id')) {
							for (a = 0; a < vm.attrs.length; a = a + 1) {
								attr = vm.attrs[a]
								if (tabAttr.id === attr.id) {
									vm.tabs[t].attrs[c] = attr
									attributeIsExist = true
								}
							}
							if (!attributeIsExist) {
								vm.tabs[t].attrs.splice(c, 1)
								c = c - 1
							}
						} else {
							for (b = 0; b < vm.baseAttrs.length; b = b + 1) {
								baseAttr = vm.baseAttrs[b]
								if (tabAttr.name === baseAttr.name) {
									vm.tabs[t].attrs[c] = baseAttr
									attributeIsExist = true
								}
							}
							for (e = 0; e < vm.entityAttrs.length; e = e + 1) {
								entityAttr = vm.entityAttrs[e]
								if (tabAttr.name === entityAttr.name) {
									vm.tabs[t].attrs[c] = entityAttr
									attributeIsExist = true
								}
							}

							if (!attributeIsExist) {
								vm.tabs[t].attrs.splice(c, 1)
								c = c - 1
							}
						}
					}
				}
			}

			fillTabWithAttrs()
			fillTabAttrs()
			vm.tabAttrsReady = true
		}

		// end refactore

		var columns = entityViewerDataService.getColumns()
		var currentColumnsWidth = columns.length
		var filters = entityViewerDataService.getFilters()
		var grouping = entityViewerDataService.getGroups()

		var attrsList = []

		$('body').addClass('drag-dialog') // hide backdrop

		vm.getAttributes = function () {
			if (
				metaService.getEntitiesWithoutBaseAttrsList().indexOf(vm.entityType) ===
				-1
			) {
				vm.baseAttrs = metaService.getBaseAttrs()
			}

			//vm.entityAttrs = metaService.getEntityAttrs(vm.entityType);

			vm.performanceAttrs = metaService
				.getEntityAttrs('performance-report')
				.map(function (item) {
					item.name = 'Performance.' + item.name
					return item
				})

			vm.portfolioAttrs = metaService
				.getEntityAttrs('portfolio')
				.map(function (item) {
					item.name = 'Portfolio.' + item.name
					item.entity = 'portfolio'
					item.key = 'portfolio_object_' + item.key
					return item
				})

			vm.instrumentAttrs = metaService
				.getEntityAttrs('instrument')
				.map(function (item) {
					item.name = 'Instrument.' + item.name
					item.entity = 'instrument'
					item.key = 'instrument_object_' + item.key
					return item
				})

			vm.responsibleAttrs = metaService
				.getEntityAttrs('responsible')
				.map(function (item) {
					item.name = 'Responsible.' + item.name
					item.entity = 'responsible'
					item.key = 'responsible_object_' + item.key
					return item
				})

			vm.counterpartyAttrs = metaService
				.getEntityAttrs('counterparty')
				.map(function (item) {
					item.name = 'Counterparty.' + item.name
					item.entity = 'counterparty'
					item.key = 'counterparty_object_' + item.key
					return item
				})

			// instruments

			vm.linkedInstrumentAttrs = metaService
				.getEntityAttrs('instrument')
				.map(function (item) {
					item.name = 'Linked instrument.' + item.name
					item.entity = 'instrument'
					item.key = 'linked_instrument_object_' + item.key
					return item
				})

			vm.allocationBalanceAttrs = metaService
				.getEntityAttrs('instrument')
				.map(function (item) {
					item.name = 'Allocation balance.' + item.name
					item.entity = 'instrument'
					item.key = 'allocation_balance_object_' + item.key
					return item
				})

			vm.allocationPlAttrs = metaService
				.getEntityAttrs('instrument')
				.map(function (item) {
					item.name = 'Allocation P&L.' + item.name
					item.entity = 'instrument'
					item.key = 'allocation_pl_object_' + item.key
					return item
				})

			// currencies

			vm.transactionCurrencyAttrs = metaService
				.getEntityAttrs('currency')
				.map(function (item) {
					item.name = 'Transaction currency.' + item.name
					item.entity = 'currency'
					item.key = 'transaction_currency_object_' + item.key
					return item
				})

			vm.settlementCurrencyAttrs = metaService
				.getEntityAttrs('currency')
				.map(function (item) {
					item.name = 'Settlement currency.' + item.name
					item.entity = 'currency'
					item.key = 'settlement_currency_object_' + item.key
					return item
				})

			// accounts

			vm.accountPositionAttrs = metaService
				.getEntityAttrs('account')
				.map(function (item) {
					item.name = 'Account Position.' + item.name
					item.entity = 'account'
					item.key = 'account_position_object_' + item.key
					return item
				})

			vm.accountCashAttrs = metaService
				.getEntityAttrs('account')
				.map(function (item) {
					item.name = 'Account Cash.' + item.name
					item.entity = 'account'
					item.key = 'account_cash_object_' + item.key
					return item
				})

			vm.accountInterimAttrs = metaService
				.getEntityAttrs('account')
				.map(function (item) {
					item.name = 'Account interim.' + item.name
					item.entity = 'account'
					item.key = 'account_interim_object_' + item.key
					return item
				})

			// strategies

			vm.strategy1cashAttrs = metaService
				.getEntityAttrs('strategy-1')
				.map(function (item) {
					item.name = 'Strategy1 Cash.' + item.name
					item.key = 'strategy1_cash_object_' + item.key
					return item
				})
			vm.strategy1positionAttrs = metaService
				.getEntityAttrs('strategy-1')
				.map(function (item) {
					item.name = 'Strategy1 Position.' + item.name
					item.key = 'strategy1_position_object_' + item.key
					return item
				})

			vm.strategy2cashAttrs = metaService
				.getEntityAttrs('strategy-2')
				.map(function (item) {
					item.name = 'Strategy2 Cash.' + item.name
					item.key = 'strategy2_cash_object_' + item.key
					return item
				})
			vm.strategy2positionAttrs = metaService
				.getEntityAttrs('strategy-2')
				.map(function (item) {
					item.name = 'Strategy2 Position.' + item.name
					item.key = 'strategy2_position_object_' + item.key
					return item
				})

			vm.strategy3cashAttrs = metaService
				.getEntityAttrs('strategy-3')
				.map(function (item) {
					item.name = 'Strategy3 Cash.' + item.name
					item.key = 'strategy3_cash_object_' + item.key
					return item
				})
			vm.strategy3positionAttrs = metaService
				.getEntityAttrs('strategy-3')
				.map(function (item) {
					item.name = 'Strategy3 Position.' + item.name
					item.key = 'strategy3_position_object_' + item.key
					return item
				})

			customFieldService.getList().then(function (data) {
				vm.custom = data.results
				vm.custom.forEach(function (customItem) {
					customItem.columnType = 'custom-field'
				})

				restoreAttrs()
				syncAttrs()

				vm.readyStatus.content = true
				$scope.$apply()
			})
		}

		vm.getAttributes()

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
			if (item.name.toLocaleLowerCase().indexOf('strategy') == -1) {
				var pieces = item.name.split('.')

				return pieces[pieces.length - 1]
			}

			return item.name
		}

		var syncAttrs = function () {
			syncTypeAttrs(vm.performanceAttrs)

			syncTypeAttrs(vm.portfolioAttrs)
			syncTypeAttrs(vm.instrumentAttrs)
			syncTypeAttrs(vm.responsibleAttrs)
			syncTypeAttrs(vm.counterpartyAttrs)

			syncTypeAttrs(vm.linkedInstrumentAttrs)
			syncTypeAttrs(vm.allocationBalanceAttrs)
			syncTypeAttrs(vm.allocationPlAttrs)

			syncTypeAttrs(vm.transactionCurrencyAttrs)
			syncTypeAttrs(vm.settlementCurrencyAttrs)

			syncTypeAttrs(vm.accountPositionAttrs)
			syncTypeAttrs(vm.accountCashAttrs)
			syncTypeAttrs(vm.accountInterimAttrs)

			syncTypeAttrs(vm.strategy1cashAttrs)
			syncTypeAttrs(vm.strategy1positionAttrs)

			syncTypeAttrs(vm.strategy2cashAttrs)
			syncTypeAttrs(vm.strategy2positionAttrs)

			syncTypeAttrs(vm.strategy3cashAttrs)
			syncTypeAttrs(vm.strategy3positionAttrs)

			syncTypeAttrs(vm.custom)
		}

		function syncTypeAttrs(attrs) {
			var i
			for (i = 0; i < attrs.length; i = i + 1) {
				attrs[i].columns = false
				attrs[i].filters = false
				attrs[i].groups = false
				columns.map(function (item) {
					//;
					//;
					if (attrs[i].name === item.name) {
						attrs[i].columns = true
					}
					return item
				})
				filters.map(function (item) {
					if (attrs[i].name === item.name) {
						attrs[i].filters = true
					}
					return item
				})
				grouping.map(function (item) {
					if (item.hasOwnProperty('key')) {
						if (attrs[i].key === item.key) {
							attrs[i].groups = true
						}
					} else {
						if (attrs[i].name === item.name) {
							attrs[i].groups = true
						}
					}
					return item
				})
			}
		}

		function updateTypeAttrs(typeAttrs) {
			var i, c, g, f
			var columnExist, groupExist, filterExist

			for (i = 0; i < typeAttrs.length; i = i + 1) {
				columnExist = false
				groupExist = false
				filterExist = false
				for (c = 0; c < columns.length; c = c + 1) {
					if (typeAttrs[i].hasOwnProperty('key')) {
						if (typeAttrs[i].key === columns[c].key) {
							columnExist = true
							if (typeAttrs[i].columns === false) {
								columns.splice(c, 1)
								c = c - 1
							}
						}
					} else {
						if (typeAttrs[i].name === columns[c].name) {
							columnExist = true
							if (typeAttrs[i].columns === false) {
								columns.splice(c, 1)
								c = c - 1
							}
						}
					}
				}
				if (!columnExist) {
					if (typeAttrs[i].columns === true) {
						columns.push(typeAttrs[i])
					}
				}

		@/angularROUPING

				for (g = 0; g < grouping.length; g = g + 1) {
					if (
						typeAttrs[i].hasOwnProperty('columnType') &&
						typeAttrs[i].columnType == 'custom-field' &&
						typeAttrs[i].name === grouping[g].name
					) {
						groupExist = true
						if (typeAttrs[i].groups === false) {
							grouping.splice(g, 1)
							g = g - 1
						}
					} else {
						if (typeAttrs[i].hasOwnProperty('key')) {
							if (typeAttrs[i].key === grouping[g].key) {
								groupExist = true
								if (typeAttrs[i].groups === false) {
									grouping.splice(g, 1)
									g = g - 1
								}
							}
						}
					}
					//else if (typeAttrs[i].name === grouping[g].name) {
					//
					//    groupExist = true;
					//    if (typeAttrs[i].groups === false) {
					//        grouping.splice(c, 1);
					//        g = g - 1;
					//    }
					//}
					//
					//else {
					//    //if (typeAttrs[i].id === grouping[g].id) {
					//    //    groupExist = true;
					//    //    if (typeAttrs[i].groups === false) {
					//    //        grouping.splice(g, 1);
					//    //        g = g - 1;
					//    //    }
					//    //}
					//}
				}
				if (!groupExist) {
					if (typeAttrs[i].groups === true) {
						grouping.push(typeAttrs[i])
					}
				}

		@/angularILTERING

				for (f = 0; f < filters.length; f = f + 1) {
					if (typeAttrs[i].hasOwnProperty('key')) {
						if (typeAttrs[i].key === filters[f].key) {
							filterExist = true
							if (typeAttrs[i].filters === false) {
								filters.splice(f, 1)
								f = f - 1
							}
						}
					} else {
						if (typeAttrs[i].name === filters[f].name) {
							filterExist = true
							if (typeAttrs[i].filters === false) {
								filters.splice(f, 1)
								f = f - 1
							}
						}
					}
				}
				if (!filterExist) {
					if (typeAttrs[i].filters === true) {
						filters.push(typeAttrs[i])
					}
				}
			}

			// ;
		}

		vm.updateAttrs = function () {
			updateTypeAttrs(vm.performanceAttrs)

			updateTypeAttrs(vm.portfolioAttrs)
			updateTypeAttrs(vm.instrumentAttrs)
			updateTypeAttrs(vm.responsibleAttrs)
			updateTypeAttrs(vm.counterpartyAttrs)

			updateTypeAttrs(vm.linkedInstrumentAttrs)
			updateTypeAttrs(vm.allocationBalanceAttrs)
			updateTypeAttrs(vm.allocationPlAttrs)

			updateTypeAttrs(vm.accountPositionAttrs)
			updateTypeAttrs(vm.accountCashAttrs)
			updateTypeAttrs(vm.accountInterimAttrs)

			updateTypeAttrs(vm.transactionCurrencyAttrs)
			updateTypeAttrs(vm.settlementCurrencyAttrs)

			updateTypeAttrs(vm.strategy1cashAttrs)
			updateTypeAttrs(vm.strategy1positionAttrs)

			updateTypeAttrs(vm.strategy2cashAttrs)
			updateTypeAttrs(vm.strategy2positionAttrs)

			updateTypeAttrs(vm.strategy3cashAttrs)
			updateTypeAttrs(vm.strategy3positionAttrs)

			updateTypeAttrs(vm.custom)

			addColumn()

			evDataHelper.updateColumnsIds(entityViewerDataService)
			evDataHelper.setColumnsDefaultWidth(entityViewerDataService)

			entityViewerEventService.dispatchEvent(evEvents.COLUMNS_CHANGE)
			entityViewerEventService.dispatchEvent(evEvents.FILTERS_CHANGE)
			entityViewerEventService.dispatchEvent(evEvents.GROUPS_CHANGE)

			entityViewerEventService.dispatchEvent(evEvents.REDRAW_TABLE)
		}

		var dragAndDrop = {
			init: function () {
				this.dragula()
				this.eventListeners()
			},

			eventListeners: function () {
				var that = this
				var exist = false
				this.dragula.on('over', function (elem, container, source) {
					$(container).addClass('active')
					$(container).on('mouseleave', function () {
						$(this).removeClass('active')
					})
				})
				this.dragula.on('drop', function (elem, target) {
					//; //TODO fallback to ids instead of name/key
					$(target).removeClass('active')
					var name = $(elem).html()
					var i

					//;
					//;
					//;
					//;

					var identifier
					if ($(elem).attr('data-key-identifier')) {
						identifier = $(elem).attr('data-key-identifier')
					} else {
						identifier = $(elem).html()
					}

					exist = false
					if (target === document.querySelector('#columnsbag')) {
						for (i = 0; i < columns.length; i = i + 1) {
							if (columns[i].key === identifier) {
								exist = true
							}

							if (columns[i].name === identifier) {
								exist = true
							}
						}
					}
					if (target === document.querySelector('#groupsbag')) {
						for (i = 0; i < grouping.length; i = i + 1) {
							if (grouping[i].key === identifier) {
								exist = true
							}

							if (grouping[i].name === identifier) {
								exist = true
							}
						}
					}
					if (
						target === document.querySelector('#filtersbag .drop-new-filter')
					) {
						for (i = 0; i < filters.length; i = i + 1) {
							if (filters[i].key === identifier) {
								exist = true
							}

							if (filters[i].name === identifier) {
								exist = true
							}
						}
					}

					if (!exist && target) {
						var a
						//;
						//;

						var nodes = Array.prototype.slice.call(target.children)
						var index = nodes.indexOf(elem)

						// .g-columns-holder
						//if (target === document.querySelector('#columnsbag')) {
						if (
							target === document.querySelector('.g-columns-holder') ||
							target === document.querySelector('#columnsbag')
						) {
							for (a = 0; a < attrsList.length; a = a + 1) {
								if (attrsList[a].key === identifier) {
									if (target === document.querySelector('#columnsbag')) {
										columns.push(attrsList[a])
									} else {
										columns.splice(index, 0, attrsList[a])
									}

									//columns.push(attrsList[a]);
								}

								if (attrsList[a].name === identifier) {
									if (target === document.querySelector('#columnsbag')) {
										columns.push(attrsList[a])
									} else {
										columns.splice(index, 0, attrsList[a])
									}

									//columns.push(attrsList[a]);
								}
							}
							syncAttrs()
							evDataHelper.updateColumnsIds(entityViewerDataService)
							evDataHelper.setColumnsDefaultWidth(entityViewerDataService)
							entityViewerEventService.dispatchEvent(evEvents.REDRAW_TABLE)
						}
						if (
							target === document.querySelector('#groupsbag') ||
							target === document.querySelector('.g-groups-holder')
						) {
							for (a = 0; a < attrsList.length; a = a + 1) {
								if (attrsList[a].key === identifier) {
									if (target === document.querySelector('#groupsbag')) {
										grouping.push(attrsList[a])
									} else {
										grouping.splice(index, 0, attrsList[a])
									}

									//columns.push(attrsList[a]);
								}

								if (attrsList[a].name === identifier) {
									if (target === document.querySelector('#groupsbag')) {
										grouping.push(attrsList[a])
									} else {
										grouping.splice(index, 0, attrsList[a])
									}
								}
							}
							syncAttrs()
							evDataHelper.updateColumnsIds(entityViewerDataService)
							evDataHelper.setColumnsDefaultWidth(entityViewerDataService)
							entityViewerEventService.dispatchEvent(evEvents.REDRAW_TABLE)
						}
						if (
							target ===
								document.querySelector('#filtersbag .drop-new-filter') ||
							target === document.querySelector('.g-filters-holder')
						) {
							for (a = 0; a < attrsList.length; a = a + 1) {
								if (attrsList[a].key === identifier) {
									if (
										target ===
										document.querySelector('#filtersbag .drop-new-filter')
									) {
										filters.push(attrsList[a])
									} else {
										filters.splice(index, 0, attrsList[a])
									}

									//columns.push(attrsList[a]);
								}

								if (attrsList[a].name === identifier) {
									if (
										target ===
										document.querySelector('#filtersbag .drop-new-filter')
									) {
										filters.push(attrsList[a])
									} else {
										filters.splice(index, 0, attrsList[a])
									}
								}
							}
							syncAttrs()
							evDataHelper.updateColumnsIds(entityViewerDataService)
							evDataHelper.setColumnsDefaultWidth(entityViewerDataService)
							entityViewerEventService.dispatchEvent(evEvents.REDRAW_TABLE)
						}
						$scope.$apply()
					}
					$scope.$apply()
				})

				this.dragula.on('dragend', function (el) {
					$scope.$apply()
					$(el).remove()
				})
			},

			dragula: function () {
				//var items = [
				//    document.querySelector('.g-columns-holder'),
				//    //document.querySelector('#columnsbag'),
				//    document.querySelector('#groupsbag'),
				//    document.querySelector('#filtersbag .drop-new-filter')
				//];

				var items = [
					document.querySelector('.g-columns-holder'),
					document.querySelector('#columnsbag'),
					document.querySelector('.g-groups-holder'),
					document.querySelector('#groupsbag'),
					document.querySelector('.g-filters-holder'),
					document.querySelector('#filtersbag .drop-new-filter'),
				]

				var i
				var itemsElem = document.querySelectorAll(
					'#dialogbag .g-modal-draggable-card'
				)
				for (i = 0; i < itemsElem.length; i = i + 1) {
					items.push(itemsElem[i])
				}

				this.dragula = dragula(items, {
					accepts: function (el, target, source, sibling) {
						//;

						if (target.classList.contains('g-modal-draggable-card')) {
							return false
						}

						return true
					},
					copy: true,
				})
			},

			destroy: function () {
				//
				this.dragula.destroy()
			},
		}

		var addColumn = function () {
			//;

			//if (currentColumnsWidth < parentScope.columns.length) {
			metaService.columnsWidthGroups(true)
			//}
			//else {
			//    metaService.columnsWidthGroups(false);
			//}
		}

		setTimeout(function () {
			dragAndDrop.init()
		}, 500)

		vm.cancel = function () {
			$('body').removeClass('drag-dialog')
			dragAndDrop.destroy()
			$mdDialog.hide()
		}

		vm.MABtnVisibility = function (entityType) {
			return metaService.checkRestrictedEntityTypesForAM(entityType)
		}

		var init = function () {
			entityViewerEventService.addEventListener(
				evEvents.COLUMNS_CHANGE,
				function () {
					columns = entityViewerDataService.getColumns()
					syncAttrs()
				}
			)

			entityViewerEventService.addEventListener(
				evEvents.GROUPS_CHANGE,
				function () {
					grouping = entityViewerDataService.getGroups()
					syncAttrs()
				}
			)

			entityViewerEventService.addEventListener(
				evEvents.FILTERS_CHANGE,
				function () {
					filters = entityViewerDataService.getFilters()
					syncAttrs()
				}
			)
		}

		init()
	}

