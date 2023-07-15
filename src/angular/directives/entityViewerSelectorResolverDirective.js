/**
 * Created by szhitenev on 17.06.2016.
 */

import referenceTableService from '../services/referenceTablesService'

import evEditorEvents from '../services/ev-editor/entityViewerEditorEvents'

import metaHelper from '../helpers/meta.helper'

export default function () {
	return {
		require: '^^bindFieldControl',
		scope: {
			item: '=',
			options: '=',
			evEditorEventService: '=',
			itemChange: '&',
		},
		templateUrl: 'views/directives/entity-viewer-selector-resolver-view.html',
		link: function (scope, elem, attrs, bfcVm) {
			// scope.readyStatus = {content: false};
			scope.readyStatus = bfcVm.readyStatus
			scope.readyStatus.content = false

			scope.customStyles = null

			scope.modelObj = {
				model: scope.model,
			}

			scope.ciEventObj = {
				event: {},
			}

			scope.inputTextObj = {
				value: null,
			}

			// scope.searchTerm = '';
			scope.sorted = true
			scope.fields = []

			var fieldsDataIsLoaded = false
			var elIndexesData = {}

			/*scope.resolveSort = function (field) {

                    if (scope.item && scope.item.value_type === 110) {

                        return 'order'

                    } else if (field) {

                        if (field.hasOwnProperty('public_name')) {

                            return '-' + field.public_name

                        } else if (field.hasOwnProperty('user_code')) {

                            return '-' + field.user_code

                        } else if (field.hasOwnProperty('name')) {

                            return '-' + field.name

                        }

                    }

                };*/
			var sortFields = function (fields) {
				/*if (scope.item && scope.item.value_type === 110) {

                        return metaHelper.textWithDashSort(fields, 'order');

                    } else {
                        return metaHelper.textWithDashSort(fields);
                    }*/
				return metaHelper.textWithDashSort(fields, 'order')
			}

			scope.inputBackgroundColor = bfcVm.inputBackgroundColor

			var getSelectedFieldName = function () {
				// var id = scope.entity[scope.fieldKey];
				var id = scope.modelObj.model

				if (scope.fields && scope.fields.length) {
					for (var i = 0; i < scope.fields.length; i = i + 1) {
						if (scope.fields[i].id === id) {
							return scope.fields[i].name
						}
					}
				}

				return ''
			}

			scope.getName = function () {
				if (scope.item.hasOwnProperty('verbose_name')) {
					return scope.item.verbose_name
				}

				if (scope.item.options && scope.item.options.fieldName) {
					return scope.item.options.fieldName
				}
				return scope.item.name
			}

			var getData = function () {

				return new Promise(function (resolve, reject) {
					if (!fieldsDataIsLoaded) {
						referenceTableService
							.getList({
								filters: {
									name: scope.item.reference_table,
								},
							})
							.then(function (res) {
								var referenceTable

								res.results.forEach(function (item) {
									if (item.name === scope.item.reference_table) {
										referenceTable = item
									}
								})

								if (referenceTable) {


									// scope.fields = referenceTable.rows;
									/*scope.fields = referenceTable.rows.filter(function (row) {
                                        return !!row;

                                    }).map(function (row) {
                                        return {
                                            id: row.value,
                                            name: row.key
                                        }
                                    });*/

									scope.fields = referenceTable.rows.map(function (row) {
										return {
											id: row.value,
											name: row.key,
										}
									})

									scope.fields = sortFields(scope.fields)
								}

								scope.readyStatus.content = true
								fieldsDataIsLoaded = true

								resolve()
								// scope.readyStatus.content = true;

								/*scope.$apply(function () {

                                    setTimeout(function () {
                                        $(elem).find('.md-select-search-pattern').on('keydown', function (ev) {
                                            ev.stopPropagation();
                                        });
                                    }, 100);
                                });*/
							})
							.catch(function (error) {
								reject(error)
							})
					} else {
						resolve()
					}
				})
			}

			/* scope.changeHandler = function () {
                    if(scope.itemChange) {
                        scope.itemChange()
                    }
                }; */
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
								getData().then(function () {
									setItemSpecificSettings()
									// prepareDataForSelector();
									scope.inputTextObj.value = getSelectedFieldName()

									scope.$apply()
								})
							}
						}
					)
			}

			scope.$watch('item', function () {
				fieldsDataIsLoaded = false
				scope.inputTextObj.value = getSelectedFieldName()
			})

			/* scope.$watch('modelObj', function () {

                    fieldsDataIsLoaded = false;

                    // prepareDataForSelector();
                    scope.inputTextObj.value = scope.getInputTextForEntitySearch();

                }) */

			scope.init = function () {
				/*if (scope.entity[scope.item.name]) {
                        scope.fields = [];

                        var obj = {};
                        obj[scope.entity[scope.item.name]] = scope.entity[scope.item.name];

                        scope.fields.push(obj)
                    }*/
				getData().then(function () {
					scope.inputTextObj.value = getSelectedFieldName()
					scope.modelObj.model = bfcVm.getValueFromEntity()
					scope.options = bfcVm.checkForNotNull(scope.options)

					setItemSpecificSettings()

					scope.$apply()
				})

				initEventListeners()
			}

			scope.init()

			scope.$on('$destroy', function () {
				Object.keys(elIndexesData).forEach(function (eventName) {
					var eventIndex = elIndexesData[eventName]
					scope.evEditorEventService.removeEventListener(eventName, eventIndex)
				})
			})
		},
	}
}
