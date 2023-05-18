/**
 * Created by szhitenev on 17.06.2016.
 */

import evEditorEvents from '../services/ev-editor/entityViewerEditorEvents'

import metaService from '../services/metaService'
import metaHelper from '../helpers/meta.helper'

export default function (metaContentTypesService, fieldResolverService) {
	return {
		require: '^^bindFieldControl',
		scope: {
			item: '=',
			entity: '=',
			content_type: '=',
			options: '=',
			entityType: '=',
			evEditorDataService: '=',
			evEditorEventService: '=',
			fieldsDataStore: '=',
		},
		templateUrl: 'views/directives/entity-viewer-field-resolver-view.html',
		link: function (scope, elem, attrs, bfcVm) {
			// scope.readyStatus = {content: false};
			scope.readyStatus = bfcVm.readyStatus
			scope.readyStatus.content = false
			/** Used to differentiate between selector and multiselector **/
			scope.type = 'id'
			scope.fields = [] // list of menu options
			scope.sortedFields = []
			scope.schemeSortedFields = []

			scope.sorted = true
			scope.customStyles = null

			scope.modelObj = {
				model: null,
			}

			scope.ciEventObj = {
				event: {},
			}

			scope.inputTextObj = {
				value: null,
			}

			var fieldsDataIsLoaded = false
			var elIndexesData = {}
			// console.log('scope.item.name', scope.item);
			// console.log('scope.entity', scope.entity);

			if (
				[
					'counterparties',
					'accounts',
					'responsibles',
					'transaction_types',
				].indexOf(scope.item.key) !== -1
			) {
				scope.type = 'multiple-ids'
			}

			// console.log('scope.type', scope.type);

			scope.isSpecialSearchRelation = function () {
				return (
					[
						'instrument',
						'portfolio',
						'account',
						'responsible',
						'counterparty',
						'strategy-1',
						'strategy-2',
						'strategy-3',
						'currency',
					].indexOf(scope.getValueEntity()) !== -1
				)
			}

			scope.getValueEntity = function () {
				// console.log('scope.getModelKeyEntity scope.item.key', scope.item.key)

				//var key;
				var valueEntity = scope.item.key

				if (scope.entityType === 'complex-transaction') {
					valueEntity = metaContentTypesService.findEntityByContentType(
						scope.item.content_type
					)

					// console.log('valueEntity', valueEntity);
				} else {
					if (
						scope.item.key &&
						[
							'linked_instrument',
							'allocation_balance',
							'allocation_pl',
						].indexOf(scope.item.key) !== -1
					) {
						valueEntity = 'instrument'
					} else {
						switch (scope.item.name) {
							case 'account_interim':
							case 'account_cash':
							case 'account_position':
								valueEntity = 'account'
								break
						}
					}
				}

				return valueEntity
			}

			/*scope.resolveMultiple = function () {
                    if (scope.entityType !== 'instrument-type') { // refactor this
                        return true
                    }



                    return false;
                };*/

			scope.searchTerm = ''

			scope.resolveSort = function (field) {
				if (field) {
					if (field.hasOwnProperty('name')) {
						return '-' + field.name
					}
					if (field.hasOwnProperty('user_code')) {
						return '-' + field.user_code
					}
					if (field.hasOwnProperty('public_name')) {
						return '-' + field.public_name
					}
				}
			}

			scope.checkComplexEntityType = function () {
				if (
					metaService.getFieldsWithTagGrouping().indexOf(scope.item.key) !== -1
				) {
					return true
				}
				return false
			}

			scope.inputBackgroundColor = bfcVm.inputBackgroundColor

			scope.getName = function () {
				if (scope.item.options && scope.item.options.fieldName) {
					return scope.item.options.fieldName
				} else if (scope.item.hasOwnProperty('verbose_name')) {
					return scope.item.verbose_name
				}

				return scope.item.name
			}

			scope.bindFormFields = function () {
				var result = ''

				// var id = scope.entity[scope.fieldKey];
				var id = scope.modelObj.model

				if (id) {
					var i
					var attr

					for (i = 0; i < scope.fields.length; i = i + 1) {
						if (id === scope.fields[i].id) {
							attr = scope.fields[i]
						}
					}

					if (attr) {
						result = attr.name
					}

					if (scope.item.options && scope.item.options.fieldsForm) {
						var resultCaption = ''

						scope.item.options.fieldsForm.forEach(function (item, index) {
							if (index + 1 === scope.item.options.fieldsForm.length) {
								resultCaption = resultCaption + attr[item]
							} else {
								resultCaption = resultCaption + attr[item] + ' / '
							}
						})

						result = resultCaption
					}
				} else {
					result = scope.getName()
				}

				return result
			}

			scope.bindListFields = function (field) {
				if (scope.item.options && scope.item.options.fieldsList) {
					var resultCaption = ''

					scope.item.options.fieldsList.forEach(function (item, index) {
						if (index + 1 === scope.item.options.fieldsList.length) {
							resultCaption = resultCaption + field[item]
						} else {
							resultCaption = resultCaption + field[item] + ' / '
						}
					})

					return resultCaption
				}

				return field.name
			}

			var getListWithBindFields = function (items) {
				return items.map(function (item) {
					/* return {
                            ...item,
                            bindFieldsName: scope.bindListFields(item)
                        } */
					item.bindFieldsName = scope.bindListFields(item)
					return item
				})
			}

			var exposureTabAttrs = [
				'co_directional_exposure_currency',
				'counter_directional_exposure_currency',
				'long_underlying_instrument',
				'short_underlying_instrument',
				'exposure_calculation_model',
				'long_underlying_exposure',
				'short_underlying_exposure',
				'position_reporting',
			]

			var getSelectorOptions = function (items) {
				var nameField

				if (exposureTabAttrs.includes(scope.fieldKey) && items.length) {
					nameField = 'name'

					if (items[0].hasOwnProperty('short_name')) {
						nameField = 'short_name'
					}

					if (scope.entityType === 'instrument') {
						items = items.map(function (item) {
							item.name = item[nameField]
							return item
						})
					} else if (scope.entityType === 'instrument-type') {
						items = items.map(function (item) {
							item.id = item.user_code
							item.name = item[nameField]

							return item
						})
					}
				}

				items = metaHelper.textWithDashSort(items, nameField)

				return items.map(function (item) {
					item.bindFieldsName = scope.bindListFields(item)
					return item
				})
			}

			scope.getListWithSchemeName = function (items) {
				return items.map(function (item) {
					return {
						...item,
						name: item.user_code,
					}
				})
			}

			scope.bindMCField = function (model) {
				/* if (getSelectedFieldNamescope.entity[scope.fieldKey] && scope.entity[scope.fieldKey].length > 0) {
                        return '[' + scope.entity[scope.fieldKey].length + '] selected';
                    } */
				if (scope.modelObj.model && scope.modelObj.model.length > 0) {
					return '[' + scope.modelObj.model.length + '] selected'
				} else {
					return scope.getName()
				}
			}

			scope.getInputTextForEntitySearch = function () {
				var result = ''

				// var id = scope.entity[scope.fieldKey];
				var id = scope.modelObj.model

				if (scope.fields && scope.fields.length) {
					for (var i = 0; i < scope.fields.length; i = i + 1) {
						if (scope.fields[i].id === id) {
							if (scope.fields[i].short_name) {
								result = scope.fields[i].short_name
							} else if (scope.fields[i].name) {
								result = scope.fields[i].name
							} else {
								result = scope.fields[i].public_name
							}
						}

						if (result) {
							break
						}
					}
				}

				console.log('scope.fields', scope.fields)
				console.log('getInputTextForEntitySearch', result)

				return result
			}

			//scope.getModelKey = scope.$parent.getModelKey;
			scope.fieldKey = scope.$parent.vm.fieldKey

			if (scope.item.value_entity) {
				scope.crudEntityType = scope.item.value_entity
			} else {
				scope.crudEntityType = scope.item.entity
			}

			scope.checkForCrudSelects = function () {
				if (['group', 'subgroup'].indexOf(scope.fieldKey) !== -1) {
					return true
				}

				return false
			}

			scope.getData = function () {
				return new Promise(function (resolve, reject) {
					if (!fieldsDataIsLoaded) {
						var options = {}

						if (scope.options.entityType) {
							options.entityType = scope.options.entityType
						}

						if (scope.options.key) {
							options.key = scope.options.key
						}

						if (scope.entityType === 'complex-transaction') {
							console.log('scope.fieldsDataStore', scope.fieldsDataStore)

							if (scope.fieldsDataStore['fieldKeys']) {
								delete scope.fieldsDataStore['fieldKeys']['currencies.currency']
								delete scope.fieldsDataStore['fieldKeys'][
									'instruments.instrument'
								]
							}

							fieldResolverService
								.getFieldsByContentType(
									scope.item.content_type,
									options,
									scope.fieldsDataStore
								)
								.then(function (res) {
									console.log('res', res)

									scope.type = res.type
									scope.fields = res.data
									// scope.sortedFields = scope.getListWithBindFields(metaHelper.textWithDashSort(res.data));

									if (scope.fieldKey === 'price_download_scheme') {
										scope.schemeSortedFields = scope.getListWithSchemeName(
											metaHelper.textWithDashSort(res.data, 'user_code')
										)
									} else {
										scope.selectorOptions = getSelectorOptions(res.data)
									}

									scope.readyStatus.content = true
									fieldsDataIsLoaded = true

									resolve()
									// scope.$apply();
								})
						} else {
							fieldResolverService
								.getFields(scope.item.key, options, scope.fieldsDataStore)
								.then(function (res) {
									scope.type = res.type
									scope.fields = res.data
									// scope.sortedFields = scope.getListWithBindFields(metaHelper.textWithDashSort(res.data));

									if (scope.fieldKey === 'price_download_scheme') {
										scope.schemeSortedFields = scope.getListWithSchemeName(
											metaHelper.textWithDashSort(res.data, 'user_code')
										)
									} else {
										scope.selectorOptions = getSelectorOptions(res.data)
									}

									scope.readyStatus.content = true
									fieldsDataIsLoaded = true

									resolve()
									// scope.$apply();
								})
						}
					} else {
						resolve()
					}
				})
			}

			scope.getDataApply = function () {
				scope.getData().then(function () {
					scope.$apply()
				})
			}

			/*scope.getMultiselectorItems = function () {
                    return scope.getData().then(function () {

                        var data = {
                            results: scope.getListWithBindFields(metaHelper.textWithDashSort(scope.fields))
                        };

                        return data;
                    });
                };*/

			/* var prepareDataForSelector = function () {

                    scope.fields = [];

                    var item_object;

                    if (scope.entityType === 'complex-transaction') {
                        item_object = scope.entity[scope.item.name + '_object'];
                    } else {
                        item_object = scope.entity[scope.item.key + '_object'];
                    }

                    if (item_object) {

                        if (Array.isArray(item_object)) { // For multiselector
                            scope.fields = item_object;
                            var items = scope.fields.slice(0);
                            scope.sortedFields = scope.getListWithBindFields(metaHelper.textWithDashSort(items));
                            scope.schemeSortedFields = scope.getListWithSchemeName(metaHelper.textWithDashSort(items, 'user_code'));

                        } else {
                            scope.fields.push(item_object);
                            var items = scope.fields.slice(0);
                            scope.sortedFields = scope.getListWithBindFields(metaHelper.textWithDashSort(items));
                            scope.schemeSortedFields = scope.getListWithSchemeName(metaHelper.textWithDashSort(items, 'user_code'));
                        }

                    }

                    scope.inputTextObj.value = scope.getInputTextForEntitySearch();

                }; */

			scope.inputTextObj.value = scope.getInputTextForEntitySearch()

			scope.$watch('item', function () {
				fieldsDataIsLoaded = false

				// prepareDataForSelector();
				scope.inputTextObj.value = scope.getInputTextForEntitySearch()
			})

			scope.$watch('modelObj', function () {
				fieldsDataIsLoaded = false

				// prepareDataForSelector();
				scope.inputTextObj.value = scope.getInputTextForEntitySearch()
			})

			scope.changeHandler = function () {
				bfcVm.model = scope.modelObj.model

				if (bfcVm.itemChange) {
					bfcVm.itemChange()
				}
			}

			var setItemSpecificSettings = function () {
				/*if (scope.options.backgroundColor) {

                        scope.customStyles = {
                            'customInputBackgroundColor': 'background-color: ' + scope.options.backgroundColor + ';'
                        }

                    }

                    if (scope.item.frontOptions) {

                        if (scope.item.frontOptions.recalculated) {

                            scope.ciEventObj.event = {key: "set_style_preset1"};

                        }

                    }

                    scope.tooltipText = bfcVm.getTooltipText();*/
				var setSettingsResult = bfcVm.setItemSettings()

				scope.tooltipText = setSettingsResult.tooltipText
				scope.customStyles = setSettingsResult.customStyles
				scope.ciEventObj.event = setSettingsResult.event
			}

			var initEventListeners = function () {
				elIndexesData['MARK_FIELDS_WITH_ERRORS'] =
					scope.evEditorEventService.addEventListener(
						evEditorEvents.MARK_FIELDS_WITH_ERRORS,
						function () {
							scope.ciEventObj.event = { key: 'mark_not_valid_fields' }
						}
					)

				elIndexesData['ENTITY_UPDATED'] =
					scope.evEditorEventService.addEventListener(
						evEditorEvents.ENTITY_UPDATED,
						function () {
							scope.modelObj.model = bfcVm.getValueFromEntity()
						}
					)

				if (scope.entityType === 'complex-transaction') {
					elIndexesData['FIELDS_RECALCULATION_END'] =
						scope.evEditorEventService.addEventListener(
							evEditorEvents.FIELDS_RECALCULATION_END,
							function () {
								scope.modelObj.model = bfcVm.getValueFromEntity()

								if (
									scope.item &&
									scope.item.frontOptions &&
									scope.item.frontOptions.recalculated &&
									(scope.modelObj.model || scope.modelObj.model === 0)
								) {
									fieldsDataIsLoaded = false

									scope.getData().then(function () {
										setItemSpecificSettings()
										// prepareDataForSelector();
										scope.inputTextObj.value =
											scope.getInputTextForEntitySearch()

										scope.$apply()
									})
								}
							}
						)
				}

				/* scope.evEditorEventService.addEventListener(evEditorEvents.FIELD_CHANGED, function () {

                            var changedUserInputData;

                            if (scope.evEditorDataService) {
                                changedUserInputData = scope.evEditorDataService.getChangedUserInputData();
                            }

                            if (changedUserInputData && changedUserInputData.frontOptions &&
                                changedUserInputData.frontOptions.linked_inputs_names) {

                                if (changedUserInputData.frontOptions.linked_inputs_names.indexOf(scope.fieldKey) > -1) {
                                    scope.ciEventObj.event = {key: 'set_style_preset2'};
                                }

                            }

                        }); */
			}

			var init = function () {
				var tooltipsList = []

				if (scope.evEditorDataService) {
					tooltipsList = scope.evEditorDataService.getTooltipsData()
				}

				for (var i = 0; i < tooltipsList.length; i++) {
					if (tooltipsList[i].key === scope.fieldKey) {
						scope.tooltipText = tooltipsList[i].text
						break
					}
				}

				if (scope.item) {
					setItemSpecificSettings()
				}

				if (bfcVm.fieldType) {
					// should be called after setItemSpecificSettings()

					scope.getData().then(function () {
						scope.$apply()
					})

					var item_object

					if (
						scope.entityType === 'complex-transaction' &&
						bfcVm.fieldType.type === 'userInput'
					) {
						item_object = scope.entity.values[scope.item.name + '_object']
					} else {
						item_object = scope.entity[scope.item.key + '_object']
					}

					if (item_object) {
						if (Array.isArray(item_object)) {
							scope.fields = item_object
						} else {
							scope.fields.push(item_object)
						}
					}

					scope.modelObj.model = bfcVm.getValueFromEntity()
					scope.inputTextObj.value = scope.getInputTextForEntitySearch()

					scope.valueEntity = scope.getValueEntity()

					if (scope.evEditorEventService) {
						initEventListeners()
					}
				}

				scope.options = bfcVm.checkForNotNull(scope.options)
			}

			init()

			scope.$on('$destroy', function () {
				Object.keys(elIndexesData).forEach(function (eventName) {
					var eventIndex = elIndexesData[eventName]
					scope.evEditorEventService.removeEventListener(eventName, eventIndex)
				})
			})
		},
	}
}
