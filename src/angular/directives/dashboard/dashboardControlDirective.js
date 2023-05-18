import dashboardEvents from '../../services/dashboard/dashboardEvents'
import directivesEvents from '../../services/events/directivesEvents'
import dashboardComponentStatuses from '../../services/dashboard/dashboardComponentStatuses'

import EventService from '../../services/eventService'

export default function (
	metaContentTypesService,
	entityResolverService,
	uiService,
	reportHelper
) {
	return {
		restriction: 'E',
		scope: {
			tabNumber: '=',
			rowNumber: '=',
			columnNumber: '=',
			item: '=',
			dashboardDataService: '=',
			dashboardEventService: '=',
		},
		templateUrl: 'views/directives/dashboard/dashboard-control-view.html',
		link: function (scope, elem, attr) {
			scope.fields = []
			scope.entityType = null
			scope.readyStatus = {
				componentWidthCalculated: false,
			}

			scope.attribute = {
				key: 'value',
			}

			scope.entityData = {
				value: null,
			}

			var dashboardControlElem = elem[0].querySelector('.dashboardControl')
			var cellWidth
			var entitiesList = []

			scope.getEntityTypeByContentType = function (contentType) {
				/*if (contentType === 'instruments.instrument') {
                        return 'instrument'
                    }

                    if (contentType === 'portfolios.portfolio') {
                        return 'portfolio'
                    }

                    if (contentType === 'accounts.account') {
                        return 'account'
                    }

                    if (contentType === 'currencies.currency') {
                        return 'currency'
                    }

                    if (contentType === 'instruments.pricingpolicy') {
                        return 'pricing-policy'
                    }*/

				return metaContentTypesService.findEntityByContentType(contentType)
			}

			scope.getData = function () {
				var options = {
					pageSize: 1000,
					page: 1,
				}

				entitiesList = []

				var getEntitiesMethod = function (resolve, reject) {
					entityResolverService
						.getListLight(scope.entityType, options)
						.then(function (data) {
							//scope.fields = data.results;
							entitiesList = entitiesList.concat(data.results)

							if (data.next) {
								options.page += 1
								getEntitiesMethod(resolve, reject)
							} else {
								scope.fields = entitiesList.map(function (field) {
									return { id: field.user_code, name: field.short_name }
								})

								scope.$apply(function () {
									setTimeout(function () {
										$(elem)
											.find('.md-select-search-pattern')
											.on('keydown', function (ev) {
												ev.stopPropagation()
											})
									}, 100)
								})

								resolve()
							}
						})
						.catch(function (error) {
							reject(error)
						})
				}

				return new Promise(function (resolve, reject) {
					getEntitiesMethod(resolve, reject)
				})
			}

			scope.getDataForMultiselect = function () {
				return new Promise(function (resolve, reject) {
					entityResolverService
						.getList(scope.entityType, { pageSize: 1000 })
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

			function getSelectedIds(userCodes) {
				return userCodes.map(function (uCode) {
					var selEntity = entitiesList.find(function (entity) {
						return entity.user_code === uCode
					})
					return selEntity.id
				})
			}

			scope.valueChanged = function () {
				console.log('valueChanged', scope.item.data.store)
				console.log('valueChanged.value', scope.item.data.store.value)

				if (scope.componentData.settings.value_type === 100) {
					if (scope.componentData.settings.multiple) {
						if (scope.item.data.store.user_codes.length) {
							scope.item.data.store.value = getSelectedIds(
								scope.item.data.store.user_codes
							)
						}
					} else if (scope.entityData.value) {
						// for entity search select

						scope.item.data.store.user_codes = scope.entityData.value.user_code
						scope.item.data.store.name = scope.entityData.value.name
					}
				}

				var componentsOutputs =
					scope.dashboardDataService.getAllComponentsOutputs()
				var compsKeys = Object.keys(componentsOutputs)

				if (compsKeys.length > 0) {
					compsKeys.forEach(function (compKey) {
						if (componentsOutputs[compKey]) {
							componentsOutputs[compKey].changedLast = false
						}
					})

					scope.dashboardDataService.setAllComponentsOutputs(componentsOutputs)
				}

				var changedData = {
					changedLast: true,
					name: scope.componentData.name,
					data: null,
				}

				if (scope.item.data.store) {
					changedData.data = JSON.parse(JSON.stringify(scope.item.data.store))
				}

				scope.dashboardDataService.setComponentOutput(
					scope.item.data.id,
					changedData
				)
				scope.dashboardEventService.dispatchEvent(
					'COMPONENT_VALUE_CHANGED_' + scope.item.data.id
				)

				/*if (scope.componentData.settings.auto_refresh) {
                        scope.dashboardEventService.dispatchEvent(dashboardEvents.REFRESH_ALL)
                    }*/
				scope.dashboardEventService.dispatchEvent(
					dashboardEvents.COMPONENT_OUTPUT_CHANGE
				)
			}

			scope.clearValue = function () {
				scope.componentData.value = null
				var emptyVal = scope.componentData.settings.multiple ? [] : null

				scope.entityData.value = null // for entity search select

				scope.item.data.store.value = emptyVal
				scope.item.data.store.name = ''
				scope.item.data.store.user_codes = emptyVal

				delete scope.item.data.store.user_code

				scope.valueChanged()
			}

			scope.initEventListeners = function () {
				scope.dashboardEventService.addEventListener(
					dashboardEvents.COMPONENT_STATUS_CHANGE,
					function () {
						var status = scope.dashboardDataService.getComponentStatus(
							scope.item.data.id
						)

						if (status === dashboardComponentStatuses.START) {
							// No actual calculation happens, so set to Active state
							scope.dashboardDataService.setComponentStatus(
								scope.item.data.id,
								dashboardComponentStatuses.ACTIVE
							)
							scope.dashboardEventService.dispatchEvent(
								dashboardEvents.COMPONENT_STATUS_CHANGE
							)
						}
					}
				)

				if (scope.componentData.settings.multiple) {
					scope.dashboardEventService.addEventListener(
						dashboardEvents.COMPONENTS_SIZES_CHANGED,
						function () {
							var componentUIData =
								scope.dashboardDataService.getComponentUIData(
									scope.item.data.id
								)

							if (
								componentUIData &&
								componentUIData.width !== undefined &&
								componentUIData.width !== null
							) {
								dashboardControlElem.style.width = componentUIData.width
								scope.readyStatus.componentWidthCalculated = true // needed so that multiselector chips can get actual component width
							}

							scope.multiselectEventService.dispatchEvent(
								directivesEvents.CHIPS_LIST_ELEMENT_SIZE_CHANGED
							)
						}
					)
				}
			}

			const dataStoreNotEmpty = function () {
				if (scope.item.data.store.value) {
					if (scope.componentData.settings.multiple) {
						return !!scope.item.data.store.value.length
					}

					return true
				}

				return false
			}

			const reportDateKeys = [
				'report_date',
				'pl_first_date',
				'begin_date',
				'end_date',
			]

			const getReportOptionsValue = function (layout, key) {
				var rlOptions = layout.data.reportLayoutOptions

				/* if (rlOptions && rlOptions.datepickerOptions && reportDateKeys.indexOf(key) > -1) {

						var dateFrom = reportDateKeys.indexOf(key) < 2;
						var dateExpr = rlOptions.datepickerOptions.reportFirstDatepicker.expression;

						if (dateFrom) {
							dateExpr = rlOptions.datepickerOptions.reportFirstDatepicker.expression;

						} else {
							dateExpr = rlOptions.datepickerOptions.reportLastDatepicker.expression;
						}

						if (dateExpr) {

							return new Promise(function (resolve) {

								expressionService.getResultOfExpression({'expression': dateExpr}).then(function (data) {
									resolve(data.result)

								}).catch(function (error) {
									console.error('Error occurred while trying to evaluate: ' + dateExpr, error);
									resolve(null);
								});

							});

						}

					} */
				if (rlOptions && reportDateKeys.indexOf(key) > -1) {
					return reportHelper.getReportDate(
						layout.data.reportOptions,
						layout.data.reportLayoutOptions,
						key
					)
				}

				return new Promise(function (resolve) {
					resolve(layout.data.reportOptions[key])
				})
			}

			var formatValueForDataStore = function (value, componentData) {
				if (!value) {
					return {}
				}

				if (componentData.settings.multiple) {
					return Array.isArray(value) ? { value: value } : { value: [value] }
				}

				if (componentData.settings.value_type === 100) {
					value = Array.isArray(value) ? value[0] : value

					var selectedRelation = scope.fields.find(function (field) {
						return field.id === value
					})

					if (selectedRelation) {
						return { value: value, name: selectedRelation.name }
					}

					return {}
				}

				return Array.isArray(value) ? { value: value[0] } : { value: value }
			}

			/**
			 * Returns data about selected by default entity
			 *
			 * @param {boolean} multiple - is control multiselector
			 * @param {string|Array} defaultValue - user_code or (in case of multiselector) array of user codes
			 * @param {string} label
			 * @returns {Promise<{name, label, value, user_codes}|{}|{label, value, user_codes}>}
			 */
			const getEntitySelectorDefOption = async (
				multiple,
				defaultValue,
				label
			) => {
				if (multiple) {
					return {
						value: getSelectedIds(defaultValue),
						user_codes: defaultValue,
						label: label,
					}
				}

				try {
					const opts = { filters: { user_code: defaultValue } }

					const res = await entityResolverService.getListLight(
						scope.entityType,
						opts
					)

					if (res.results[0]) {
						return {
							value: res.results[0].id,
							user_codes: defaultValue,
							name: res.results[0].name,
							label: label,
						}
					}
				} catch (e) {}

				return {}
			}

			var resolveValueFromReportLayout = function (
				layoutData,
				componentData,
				resolve
			) {
				/* var layout;

					if (layoutData.results) {

						layout = layoutData.results.find(function (item) {
							return item.user_code === user_code
						})

					} */

				if (layoutData.results && layoutData.results[0]) {
					var layout = layoutData.results[0]
					var key = componentData.settings.defaultValue.reportOptionsKey
					// var value = layout.data.reportOptions[key];
					getReportOptionsValue(layout, key).then(function (value) {
						value = formatValueForDataStore(value, componentData)
						resolve(value)
					})
				} else {
					resolve({})
				}
			}

			/** Get data for selected relation by user code **/
			var getRelSelDataStore = function () {
				var options = {
					filters: {
						user_code: scope.item.data.store.user_codes,
					},
				}

				return new Promise(function (resolve, reject) {
					entityResolverService
						.getListLight(scope.entityType, options)
						.then(function (dataLight) {
							if (dataLight.results.length) {
								scope.item.data.store.value = dataLight.results[0].id
								scope.item.data.store.name = dataLight.results[0].short_name

								resolve(scope.item.data.store)
							} else {
								resolve({})
							}
						})
						.catch(function (e) {
							e._customData = {
								user_code: scope.item.data.store.user_codes,
								tab: scope.tabNumber,
								row: scope.rowNumber,
								column: scope.columnNumber,
								title: scope.customName,
							}

							console.error('Failed to load selected option for control', e)

							resolve({})
						})
				})
			}

			/** if value saved inside dashboard layout, return it **/
			var getDataStoreFromDashboardLayout = function (componentData) {
				var returnPromise = function (resolveVal) {
					return new Promise(function (resolve) {
						resolve(resolveVal)
					})
				}

				// if (scope.item.data.store && scope.item.data.store.value) {

				if (componentData.settings.value_type === 100) {
					if (componentData.settings.multiple) {
						scope.item.data.store.value = scope.item.data.store.user_codes.map(
							function (userCode) {
								var selected = entitiesList.find(function (entity) {
									return entity.user_code === userCode
								})
								return selected.id
							}
						)

						if (scope.item.data.store.value.length) {
							return returnPromise(scope.item.data.store)
						}
					} else if (scope.item.data.store.user_codes) {
						// scope.item.data.store.user_codes check needed for old dashboard layouts
						return getRelSelDataStore()
					}
				} else {
					return returnPromise(scope.item.data.store)
				}

				// }

				return returnPromise({})
			}

			var getItemDataStore = function (componentData) {
				if (scope.componentData.custom_component_name) {
					scope.customName = scope.componentData.custom_component_name
				}

				var promisify = function (value) {
					return new Promise(function (resolve) {
						return resolve(value)
					})
				}

				if (dataStoreNotEmpty()) {
					/*if (scope.item.data.store && scope.item.data.store.value) {

                            var isNotArray = !Array.isArray(scope.item.data.store.value);

                            if (isNotArray || scope.item.data.store.value.length > 0) {
                                return promisify(scope.item.data.store);
                            }

                        }

                        return promisify({});*/
					return getDataStoreFromDashboardLayout(componentData)
				}

				var mode

				/*if (!componentData.settings.defaultValue) {
                        return promisify({});
                    }*/

				if (componentData.settings.defaultValue) {
					mode = componentData.settings.defaultValue.mode
				}

				if (mode === 1) {
					// Set default value

					let value = componentData.settings.defaultValue.setValue
					value = componentData.settings.multiple ? value : [value]
					const name = componentData.settings.defaultValue.setValueName
					const label = componentData.settings.defaultValue.setValueLabel

					if (componentData.settings.value_type === 100) {
						return getEntitySelectorDefOption(
							componentData.settings.multiple,
							value,
							label
						)
					} else {
						return promisify({ value: value, name: name, label: label })
					}
				} else if (mode === 0) {
					// Get default value from report

					var user_code = componentData.settings.defaultValue.layout
					var entityType = componentData.settings.defaultValue.entity_type

					return new Promise(function (resolve) {
						uiService
							.getListLayout(entityType, {
								filters: {
									user_code: user_code,
								},
							})
							.then(function (data) {
								resolveValueFromReportLayout(data, componentData, resolve)
							})
							.catch(function (error) {
								console.error(error)
								resolve({})
							})
					})
				}
				/*else {
                        return getDataStoreFromDashboardLayout(componentData);
                    }*/
			}

			scope.settingUpDefaultValue = function (componentData) {
				return new Promise(function (resolve, reject) {
					getItemDataStore(componentData).then(function (store) {
						if (!store.value) {
							resolve()
							return
						}

						scope.item.data.store = store
						scope.$apply()
						scope.valueChanged()

						resolve()
					})
				})
			}

			scope.setDateToday = function () {
				scope.item.data.store.value = moment(new Date()).format('YYYY-MM-DD')
			}

			scope.setDatePlus = function () {
				scope.item.data.store.value = moment(
					new Date(scope.item.data.store.value)
				)
					.add(1, 'days')
					.format('YYYY-MM-DD')
			}

			scope.setDateMinus = function () {
				scope.item.data.store.value = moment(
					new Date(scope.item.data.store.value)
				)
					.subtract(1, 'days')
					.format('YYYY-MM-DD')
			}

			scope.init = function () {
				scope.componentData = scope.dashboardDataService.getComponentById(
					scope.item.data.id
				)
				scope.entityType = scope.getEntityTypeByContentType(
					scope.componentData.settings.content_type
				)

				scope.buttons = []

				if (scope.componentData.settings.value_type === 40) {
					scope.buttons.push({
						iconObj: { type: 'angular-material', icon: 'add' },
						tooltip: 'Increase by one day',
						classes: 'date-input-specific-btns',
						action: { callback: scope.setDatePlus },
					})

					scope.buttons.push({
						iconObj: {
							type: 'angular-material',
							icon: 'radio_button_unchecked',
						},
						tooltip: "Set today's date",
						classes: 'date-input-specific-btns',
						action: { callback: scope.setDateToday },
					})

					scope.buttons.push({
						iconObj: { type: 'angular-material', icon: 'remove' },
						tooltip: 'Decrease by one day',
						classes: 'date-input-specific-btns',
						action: { callback: scope.setDateMinus },
					})
				}

				if (!scope.item.data.store) scope.item.data.store = {}

				if (scope.componentData.settings.multiple) {
					if (!Array.isArray(scope.item.data.store.value))
						scope.item.data.store.value = []
					if (!Array.isArray(scope.item.data.store.user_codes))
						scope.item.data.store.user_codes = []
				}

				if (scope.entityType && scope.componentData.settings.multiple) {
					scope.getData().then(function () {
						scope.settingUpDefaultValue(scope.componentData).then(function () {
							scope.dashboardDataService.setComponentStatus(
								scope.item.data.id,
								dashboardComponentStatuses.INIT
							)
							scope.dashboardEventService.dispatchEvent(
								dashboardEvents.COMPONENT_STATUS_CHANGE
							)
						})
					})
				} else {
					scope.settingUpDefaultValue(scope.componentData).then(function () {
						scope.dashboardDataService.setComponentStatus(
							scope.item.data.id,
							dashboardComponentStatuses.INIT
						)
						scope.dashboardEventService.dispatchEvent(
							dashboardEvents.COMPONENT_STATUS_CHANGE
						)
					})
				}

				if (scope.componentData.settings.multiple) {
					scope.multiselectEventService = new EventService()

					var componentUIData = scope.dashboardDataService.getComponentUIData(
						scope.item.data.id
					)
					var componentSizeCalculated = componentUIData && componentUIData.width

					if (componentSizeCalculated) {
						dashboardControlElem.style.width = componentUIData.width // needed so that multiselector chips can get actual component width
						scope.readyStatus.componentWidthCalculated = true
					}
				} else {
					scope.readyStatus.componentWidthCalculated = true
				}

				if (scope.componentData.custom_component_name) {
					scope.customName = scope.componentData.custom_component_name
				}

				scope.initEventListeners()
			}

			scope.init()
		},
	}
}
