/**
 * Created by mevstratov on 18.01.2020.
 */

import layoutService from '../../services/entity-data-constructor/layoutService'
import metaService from '../../services/metaService'
import evEditorEvents from '../../services/ev-editor/entityViewerEditorEvents'

import gridHelperService from '../../services/gridHelperService'

import transactionTypeService from '../../services/transactionTypeService'
import portfolioService from '../../services/portfolioService'
import instrumentTypeService from '../../services/instrumentTypeService'
import tooltipsService from '../../services/tooltipsService'
import colorPalettesService from '../../services/colorPalettesService'

import EntityViewerEditorDataService from '../../services/ev-editor/entityViewerEditorDataService'
import EntityViewerEditorEventService from '../../services/eventService'

import ComplexTransactionEditorSharedLogicHelper from '../../helpers/entityViewer/sharedLogic/complexTransactionEditorSahredLogicHelper'

import entityEditorHelper from '../../helpers/entity-editor.helper'
import transactionHelper from '../../helpers/transaction.helper'

export default function (
	$scope,
	$mdDialog,
	metaContentTypesService,
	attributeTypeService,
	inputFormTabs,
	data
) {
	var vm = this
	var sharedLogicHelper = new ComplexTransactionEditorSharedLogicHelper(
		vm,
		$scope,
		$mdDialog
	)

	vm.entityType = data.entityType

	vm.entity = { $_isValid: true }

	vm.tabs = inputFormTabs

	vm.readyStatus = {
		content: false,
		entity: true,
		transactionTypes: false,
		layout: false,
	}

	vm.attrs = []
	vm.layoutAttrs = layoutService.getLayoutAttrs()
	vm.entityAttrs = metaService.getEntityAttrs(vm.entityType) || []

	vm.range = gridHelperService.range

	vm.transactionTypeId = data.transactionTypeId

	vm.attributesLayout = []

	var dataConstructorLayout = []
	var contentType = metaContentTypesService.findContentTypeByEntity(
		'complex-transaction',
		'ui'
	)

	var fixFieldsLayoutWithMissingSockets = function () {
		entityEditorHelper.fixCustomTabs(vm.tabs, dataConstructorLayout)

		if (vm.fixedArea && vm.fixedArea.isActive) {
			entityEditorHelper.fixCustomTabs(vm.fixedArea, dataConstructorLayout)
		}
	}

	var mapAttributesToLayoutFields = function () {
		var attributes = {
			entityAttrs: vm.entityAttrs,
			dynamicAttrs: vm.attrs,
			layoutAttrs: vm.layoutAttrs,
			userInputs: vm.userInputs,
		}

		var attributesLayoutData =
			entityEditorHelper.generateAttributesFromLayoutFields(
				vm.tabs,
				attributes,
				dataConstructorLayout,
				true
			)

		vm.attributesLayout = attributesLayoutData.attributesLayout

		if (vm.fixedArea && vm.fixedArea.isActive) {
			var fixedAreaAttributesLayoutData =
				entityEditorHelper.generateAttributesFromLayoutFields(
					vm.fixedArea,
					attributes,
					dataConstructorLayout,
					true
				)

			vm.fixedAreaAttributesLayout =
				fixedAreaAttributesLayoutData.attributesLayout
		}
	}

	var mapAttributesAndFixFieldsLayout = function () {
		fixFieldsLayoutWithMissingSockets()
		mapAttributesToLayoutFields()
	}

	var postBookComplexTransactionActions = async function (cTransactionData) {
		var keys = Object.keys(cTransactionData.values)

		/* if (recalculationInfo &&
				recalculationInfo.recalculatedInputs && recalculationInfo.recalculatedInputs.length) {

				recalculationInfo.recalculatedInputs.forEach(inputName => {
					vm.entity[inputName] = cTransactionData.values[inputName]
				});

				vm.evEditorEventService.dispatchEvent(evEditorEvents.FIELDS_RECALCULATION_END);

			} else {

				keys.forEach(item => vm.entity[item] = cTransactionData.values[item]);

			} */
		keys.forEach((item) => (vm.entity[item] = cTransactionData.values[item]))

		cTransactionData.complex_transaction.attributes.forEach(function (item) {
			if (item.attribute_type_object.value_type === 10) {
				vm.entity[item.attribute_type_object.name] = item.value_string
			}
			if (item.attribute_type_object.value_type === 20) {
				vm.entity[item.attribute_type_object.name] = item.value_float
			}
			if (item.attribute_type_object.value_type === 30) {
				vm.entity[item.attribute_type_object.name] = item.classifier
			}
			if (item.attribute_type_object.value_type === 40) {
				vm.entity[item.attribute_type_object.name] = item.value_date
			}
		})

		/*
			// ng-repeat with bindFieldControlDirective may not update without this
			vm.tabs = {};
			vm.fixedArea = {};
			// < ng-repeat with bindFieldControlDirective may not update without this >
			if (Array.isArray(cTransactionData.book_transaction_layout.data)) {
				vm.tabs = cTransactionData.book_transaction_layout.data;
			} else {
				vm.tabs = cTransactionData.book_transaction_layout.data.tabs;
				vm.fixedArea = cTransactionData.book_transaction_layout.data.fixedArea;
			}

			dataConstructorLayout = JSON.parse(JSON.stringify(cTransactionData.book_transaction_layout)); // unchanged layout that is used to remove fields without attributes

			vm.userInputs = transactionHelper.updateTransactionUserInputs(vm.userInputs, vm.tabs, vm.fixedArea, vm.transactionType);

			vm.inputsWithCalculations = cTransactionData.transaction_type_object.inputs;

			if (vm.inputsWithCalculations) {

				vm.inputsWithCalculations.forEach(function (inputWithCalc) {

					vm.userInputs.forEach(function (userInput) {

						  if (userInput.name === inputWithCalc.name) {

							if (!userInput.buttons) {
								userInput.buttons = [];
							}

							if (inputWithCalc.can_recalculate === true) {
								userInput.buttons.push({
									iconObj: {type: 'angular-material', icon: 'refresh'},
									tooltip: 'Recalculate this field',
									caption: '',
									classes: '',
									action: {
										key: 'input-recalculation',
										callback: vm.recalculate,
										parameters: {inputs: [inputWithCalc.name], recalculationData: 'input'}
									}
								})
							}

							if (inputWithCalc.settings && inputWithCalc.settings.linked_inputs_names) {

								var linkedInputsList = inputWithCalc.settings.linked_inputs_names.split(',');

								userInput.buttons.push({
									iconObj: {type: 'angular-material', icon: 'loop'},
									tooltip: 'Recalculate linked fields',
									caption: '',
									classes: '',
									action: {
										key: 'linked-inputs-recalculation',
										callback: vm.recalculate,
										parameters: {inputs: linkedInputsList, recalculationData: 'linked_inputs'}
									}
								})
							}

						}

					})

				});

			} */
		var pbraResult = sharedLogicHelper.postBookRebookActions(
			cTransactionData,
			vm.recalculate
		)
		vm.tabs = pbraResult.tabs
		vm.fixedArea = pbraResult.fixedArea
		dataConstructorLayout = pbraResult.dataConstructorLayout
		vm.inputsWithCalculations = pbraResult.inputsWithCalculations
		vm.userInputs = pbraResult.userInputs

		mapAttributesAndFixFieldsLayout()

		// should be fired after mapAttributesAndFixFieldsLayout()
		return sharedLogicHelper.fillMissingFieldsByDefaultValues(
			vm.entity,
			vm.userInputs,
			vm.transactionType
		)
	}

	/* var bookComplexTransaction = function (inputsToRecalculate, recalculationData) {

			vm.processing = true;

			var values = {};

			vm.userInputs.forEach(function (item) {
				values[item.name] = vm.entity[item.name]
			});

			var book = {
				transaction_type: vm.entity.transaction_type,
				recalculate_inputs: inputsToRecalculate,
				process_mode: 'recalculate',
				values: values
			};

			transactionTypeService.bookComplexTransaction(book.transaction_type, book).then(function (data) {

				vm.transactionTypeId = data.transaction_type;
				vm.editLayoutEntityInstanceId = data.transaction_type;

				vm.entity = data.complex_transaction;

				vm.transactionType = data.transaction_type_object;

				vm.specialRulesReady = true;
				vm.readyStatus.entity = true;

				var keys = Object.keys(data.values);

				keys.forEach(function (key) {
					vm.entity[key] = data.values[key];
				});

				data.complex_transaction.attributes.forEach(function (item) {
					if (item.attribute_type_object.value_type === 10) {
						vm.entity[item.attribute_type_object.name] = item.value_string;
					}
					if (item.attribute_type_object.value_type === 20) {
						vm.entity[item.attribute_type_object.name] = item.value_float;
					}
					if (item.attribute_type_object.value_type === 30) {
						vm.entity[item.attribute_type_object.name] = item.classifier;
					}
					if (item.attribute_type_object.value_type === 40) {
						vm.entity[item.attribute_type_object.name] = item.value_date;
					}
				});


				var recalculationInfo = {
					recalculatedInputs: inputsToRecalculate,
					recalculationData: recalculationData
				}


				postBookComplexTransactionActions(data, recalculationInfo);


				vm.processing = false;

				$scope.$apply();

				if (recalculationInfo.recalculatedInputs && recalculationInfo.recalculatedInputs.length) {
					vm.evEditorEventService.dispatchEvent(evEditorEvents.FIELDS_RECALCULATION_END);
				}

			}).catch(function (reason) {

				console.log("Something went wrong with recalculation", reason);

				vm.processing = false;
				vm.readyStatus.layout = true;

				$scope.$apply();

			})

		};

		vm.recalculate = function (paramsObj) {

			var inputs = paramsObj.inputs;
			var recalculationData = paramsObj.recalculationData;

			bookComplexTransaction(inputs, recalculationData);

		}; */
	vm.recalculate = function (paramsObj) {
		var inputs = paramsObj.inputs
		sharedLogicHelper.removeUserInputsInvalidForRecalculation(
			inputs,
			vm.transactionType.inputs
		)

		if (inputs && inputs.length) {
			var book = sharedLogicHelper.preRecalculationActions(
				inputs,
				paramsObj.updateScope
			)

			var recalcProm = transactionTypeService.recalculateComplexTransaction(
				book.transaction_type,
				book
			)
			sharedLogicHelper.processRecalculationResolve(
				recalcProm,
				inputs,
				paramsObj.recalculationData
			)
		}
	}

	vm.getContextParameters = function () {
		var result = {}

		if (vm.contextData) {
			Object.keys(vm.contextData).forEach(function (key) {
				if (key.indexOf('_object') === -1) {
					result[key] = vm.contextData[key]
				}
			})
		}

		return result
	}

	/* vm.getFormLayoutFields = function () {

            return new Promise(function (resolve, rejec) {

                vm.readyStatus.layout = false;

                var contextParameters = vm.getContextParameters();

                transactionTypeService.initBookComplexTransaction(vm.transactionTypeId, contextParameters).then(function (data) {

                    var inputsWithCalculations = data.transaction_type_object.inputs;

                    vm.entity = data.complex_transaction;

                    vm.transactionType = data.transaction_type_object;

                    vm.readyStatus.entity = true;

                    var keys = Object.keys(data.values);

                    keys.forEach(function (item) {
                        vm.entity[item] = data.values[item];
                    });

                    postBookComplexTransactionActions(data);

                    vm.userInputs = [];
                    vm.tabs.forEach(function (tab) {
                        tab.layout.fields.forEach(function (field) {
                            if (field.attribute_class === 'userInput') {
                                vm.userInputs.push(field.attribute);
                            }
                        });
                    });

                    vm.tabs = vm.tabs.map(function (item, index) {

                        item.index = index;
                        return item;

                    });

                    vm.readyStatus.layout = true;

                    resolve();

                });

            })

        }; */

	/* function getGroupsFromItems(items) {

            var groups = {};

            items.forEach(function (item) {

                if (item.group_object) {

                    if (!groups[item.group_object.id]) {
                        groups[item.group_object.id] = item.group_object;
                        groups[item.group_object.id].items = [];
                    }

                    groups[item.group_object.id].items.push(item);

                } else {

                    if (!groups['ungrouped']) {
                        groups['ungrouped'] = {name: 'Ungrouped'};
                        groups['ungrouped'].items = [];
                    }

                    groups['ungrouped'].items.push(item);

                }


            });

            var groupsList = Object.keys(groups).map(function (key) {
                return groups[key]
            });

            groupsList = groupsList.filter(function (item) {
                return !!item
            });

            return groupsList;

        } */

	/*vm.getPortfolios = function () {

            portfolioService.getList().then(function (data) {
                vm.portfolios = data.results;
                $scope.$apply();
            });

        };

        vm.getInstrumentTypes = function () {

            instrumentTypeService.getList().then(function (data) {
                vm.instrumentTypes = data.results;
                $scope.$apply();
            });

        }; */

	/* vm.loadTransactionTypes = function () {

            var options = {
                filters: {
                    portfolio: null,
                    instrument_type: null
                },
                pageSize: 1000
            };

            return transactionTypeService.getListLight(options).then(function (data) {

                vm.transactionGroups = getGroupsFromItems(data.results);

                vm.readyStatus.transactionTypes = true;

            })

        }; */

	vm.getFormLayout = function () {
		return new Promise(function (resolve, reject) {
			vm.readyStatus.layout = false

			var contextParameters = vm.getContextParameters()

			console.log('contextParameters', contextParameters)

			transactionTypeService
				.initBookComplexTransaction(vm.transactionTypeId, contextParameters)
				.then(async function (data) {
					vm.transactionType = data.transaction_type_object
					vm.entity = data.complex_transaction

					vm.readyStatus.entity = true

					var keys = Object.keys(data.values)

					keys.forEach(function (item) {
						vm.entity[item] = data.values[item]
					})

					if (data.book_transaction_layout) {
						vm.missingLayoutError = false

						await postBookComplexTransactionActions(data)

						/*vm.oldValues = {};

						vm.userInputs.forEach(function (item) {
							vm.oldValues[item.name] = vm.entity[item.name]
						});*/
					}

					vm.readyStatus.layout = true
					resolve()
				})
		})
	}

	vm.getAttributeTypes = function () {
		return attributeTypeService
			.getList(vm.entityType, { pageSize: 1000 })
			.then(function (data) {
				vm.attrs = data.results
				vm.readyStatus.content = true
			})
	}

	vm.checkReadyStatus = function () {
		return (
			vm.readyStatus.content && vm.readyStatus.entity && vm.readyStatus.layout
		)
	}

	vm.bindFlex = sharedLogicHelper.bindFlex

	vm.checkFieldRender = sharedLogicHelper.checkFieldRender

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	var init = function () {
		setTimeout(function () {
			vm.dialogElemToResize = document.querySelector(
				'.evEditorPreviewElemToResize'
			)
		}, 100)

		var promises = []

		vm.evEditorDataService = new EntityViewerEditorDataService()
		vm.evEditorEventService = new EntityViewerEditorEventService()

		vm.evEditorDataService.setRecalculationFunction(vm.recalculate)

		var tooltipsOptions = {
			pageSize: 1000,
			filters: {
				content_type: contentType,
			},
		}

		tooltipsService.getTooltipsList(tooltipsOptions).then(function (data) {
			var tooltipsList = data.results
			vm.evEditorDataService.setTooltipsData(tooltipsList)
		})

		colorPalettesService.getList({ pageSize: 1000 }).then(function (data) {
			var palettesList = data.results
			vm.evEditorDataService.setColorPalettesList(palettesList)
		})

		promises.push(vm.getFormLayout())

		// vm.getPortfolios();
		// vm.getInstrumentTypes();
		// promises.push(vm.loadTransactionTypes());

		promises.push(vm.getAttributeTypes())
		//vm.getAttributeTypes();

		Promise.all(promises).then(function () {
			$scope.$apply(function () {
				setTimeout(function () {
					$('body')
						.find('.md-select-search-pattern')
						.on('keydown', function (ev) {
							ev.stopPropagation()
						})
				}, 100)
			})
		})
	}

	init()
}
