/**
 * Created by szhitenev on 05.05.2016.
 */

// import usersGroupService from '../../services/usersGroupService';

import layoutService from '../../services/entity-data-constructor/layoutService'
import metaService from '../../services/metaService'
import evEditorEvents from '../../services/ev-editor/entityViewerEditorEvents'

import gridHelperService from '../../services/gridHelperService'

import EventService from '../../services/eventService'
import EntityViewerEditorDataService from '../../services/ev-editor/entityViewerEditorDataService'

import transactionTypeService from '../../services/transactionTypeService'
import portfolioService from '../../services/portfolioService'
import instrumentTypeService from '../../services/instrumentTypeService'
import tooltipsService from '../../services/tooltipsService'
import colorPalettesService from '../../services/colorPalettesService'

import metaHelper from '../../helpers/meta.helper'
import entityEditorHelper from '../../helpers/entity-editor.helper'
import ComplexTransactionEditorSharedLogicHelper from '../../helpers/entityViewer/sharedLogic/complexTransactionEditorSahredLogicHelper'
import transactionHelper from '../../helpers/transaction.helper'

export default function complexTransactionAddDialogController(
	$scope,
	$mdDialog,
	$bigDrawer,
	$state,
	toastNotificationService,
	usersService,
	usersGroupService,
	globalDataService,
	metaContentTypesService,
	attributeTypeService,
	entityType,
	entity,
	data
) {
	var vm = this
	var sharedLogicHelper = new ComplexTransactionEditorSharedLogicHelper(
		vm,
		$scope,
		$mdDialog
	)

	vm.readyStatus = {
		content: false,
		entity: true,
		permissions: true,
		transactionTypes: false,
		layout: false,
	}
	vm.entityType = entityType

	vm.entity = { $_isValid: true }
	var dataConstructorLayout = []
	var dcLayoutHasBeenFixed = false
	vm.transactionType = null

	vm.processing = false

	vm.transactionTypes = []

	vm.filters = {
		portfolio: null,
		instrument_type: null,
	}

	vm.contextData = null // data source when we book from report

	vm.entityTabs = []

	vm.transactionTypeId = null

	vm.attributesLayout = []
	vm.fixedAreaAttributesLayout = []

	vm.locsWithErrors = {}
	vm.errorFieldsList = []
	vm.inputsWithCalculations = null

	vm.openedIn = data.openedIn

	vm.fieldsDataStore = {}

	var notCopiedTransaction = true
	var contentType = metaContentTypesService.findContentTypeByEntity(
		'complex-transaction',
		'ui'
	)
	var ttypesList
	//var tooltipsList = [];

	vm.rearrangeMdDialogActions = function () {
		var dialogWindowWidth = vm.dialogElemToResize.clientWidth

		if (dialogWindowWidth < 695) {
			vm.dialogElemToResize.classList.add('two-rows-dialog-actions')
		} else {
			vm.dialogElemToResize.classList.remove('two-rows-dialog-actions')
		}
	}

	var fixFieldsLayoutWithMissingSockets = function () {
		var socketsHasBeenAddedToTabs = entityEditorHelper.fixCustomTabs(
			vm.tabs,
			dataConstructorLayout
		)

		if (vm.fixedArea && vm.fixedArea.isActive) {
			var socketsHasBeenAddedToFixedArea = entityEditorHelper.fixCustomTabs(
				vm.fixedArea,
				dataConstructorLayout
			)
		}

		if (socketsHasBeenAddedToTabs || socketsHasBeenAddedToFixedArea) {
			dcLayoutHasBeenFixed = true
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

		if (
			attributesLayoutData.dcLayoutHasBeenFixed ||
			(fixedAreaAttributesLayoutData &&
				fixedAreaAttributesLayoutData.dcLayoutHasBeenFixed)
		) {
			dcLayoutHasBeenFixed = true
		}
	}

	var mapAttributesAndFixFieldsLayout = function () {
		dcLayoutHasBeenFixed = false

		fixFieldsLayoutWithMissingSockets()
		mapAttributesToLayoutFields()
	}

	vm.getContextParameters = function () {
		var result = {}

		if (vm.contextData) {
			Object.keys(vm.contextData).forEach(function (key) {
				if (key.indexOf('_object') === -1) {
					result['context_' + key] = vm.contextData[key]
				}
			})
		}

		return result
	}

	var postBookComplexTransactionActions = function (cTransactionData) {
		/*
            // ng-repeat with bindFieldControlDirective may not update without this
            vm.tabs = {};
            vm.fixedArea = {};
            // < ng-repeat with bindFieldControlDirective may not update without this >

            if (Array.isArray(transactionData.book_transaction_layout.data)) {
                vm.tabs = transactionData.book_transaction_layout.data;

            } else {

            	vm.tabs = transactionData.book_transaction_layout.data.tabs;
                vm.fixedArea = transactionData.book_transaction_layout.data.fixedArea;

            }

            dataConstructorLayout = JSON.parse(JSON.stringify(transactionData.book_transaction_layout)); // unchanged layout that is used to remove fields without attributes

			vm.userInputs = transactionHelper.updateTransactionUserInputs(vm.userInputs, vm.tabs, vm.fixedArea, vm.transactionType);

			vm.inputsWithCalculations = transactionData.transaction_type_object.inputs;

            if (vm.inputsWithCalculations) {

            	vm.inputsWithCalculations.forEach(function (inputWithCalc) {

                    vm.userInputs.forEach(function (userInput) {

                    	if (userInput.name === inputWithCalc.name) {

                            if (!userInput.buttons) {
                                userInput.buttons = [];
                            }

                            if (inputWithCalc.can_recalculate === true) {
                                userInput.buttons.push({
                                    // iconObj: {type: 'fontawesome', icon: 'fas fa-redo'},
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
                                    // iconObj: {type: 'fontawesome', icon: 'fas fa-sync-alt'},
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
		vm.entity.attributes = pbraResult.attributes

		vm.tabs = pbraResult.tabs
		vm.fixedArea = pbraResult.fixedArea
		dataConstructorLayout = pbraResult.dataConstructorLayout
		vm.inputsWithCalculations = pbraResult.inputsWithCalculations
		vm.userInputs = pbraResult.userInputs

		mapAttributesAndFixFieldsLayout()
		/* // should be fired after mapAttributesAndFixFieldsLayout()
            return sharedLogicHelper.fillMissingFieldsByDefaultValues(vm.entity, vm.userInputs, vm.transactionType); */
	}

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
					vm.entity.values = data.values

					vm.entity.frontOptions = {
						dynamicAttributesValues: {},
						userInputsValues: {},
					}

					data = vm.mapValuesOnTransactionTypeChange(data)

					vm.specialRulesReady = true
					vm.readyStatus.entity = true

					var keys = Object.keys(data.values)

					keys.forEach(function (item) {
						vm.entity[item] = data.values[item]
					})

					if (data.book_transaction_layout) {
						vm.missingLayoutError = false

						postBookComplexTransactionActions(data)
					} else {
						vm.missingLayoutError = true
					}

					vm.readyStatus.layout = true
					resolve()
				})
		})
	}

	vm.attrs = []
	vm.userInputs = []
	vm.layoutAttrs = layoutService.getLayoutAttrs()
	vm.entityAttrs = metaService.getEntityAttrs(vm.entityType) || []

	vm.formIsValid = true

	vm.loadPermissions = function () {
		var promises = []

		promises.push(vm.getGroupList())

		Promise.all(promises).then(function (data) {
			vm.readyStatus.permissions = true
			$scope.$apply()
		})
	}

	vm.getGroupList = function () {
		return usersGroupService.getList().then(function (data) {
			vm.groups = data.results

			vm.groups.forEach(function (group) {
				if (vm.entity.object_permissions) {
					vm.entity.object_permissions.forEach(function (permission) {
						if (permission.group === group.id) {
							if (!group.hasOwnProperty('objectPermissions')) {
								group.objectPermissions = {}
							}
							if (
								permission.permission ===
								'manage_' + vm.entityType.split('-').join('')
							) {
								group.objectPermissions.manage = true
							}
							if (
								permission.permission ===
								'change_' + vm.entityType.split('-').join('')
							) {
								group.objectPermissions.change = true
							}
						}
					})
				}
			})
		})
	}

	/* var closeComponent = function (response) {

            if (data.openedIn === 'big-drawer') {
                $bigDrawer.hide(response);

            } else { // opened in mdDialog
                $mdDialog.hide(response);
            }

        }; */

	vm.cancel = function () {
		/* $mdDialog.hide({status: 'disagree'});
			$bigDrawer.hide({status: 'disagree'}); */
		metaHelper.closeComponent(vm.openedIn, $mdDialog, $bigDrawer, {
			status: 'disagree',
		})
	}

	vm.editLayout = function (ev) {
		$mdDialog
			.show({
				controller: 'EntityDataConstructorDialogController as vm',
				templateUrl: 'views/dialogs/entity-data-constructor-dialog-view.html',
				targetEvent: ev,
				multiple: true,
				locals: {
					data: vm.dataConstructorData,
				},
			})
			.then(function (res) {
				if (res.status === 'agree') {
					vm.layoutAttrs = layoutService.getLayoutAttrs()
					vm.entityAttrs = metaService.getEntityAttrs(vm.entityType) || []
					vm.getAttributeTypes()

					var entityState = JSON.parse(JSON.stringify(vm.entity))

					vm.getFormLayout().then(function (value) {
						vm.entity = entityState

						console.log('entityState', entityState)

						$scope.$apply()
					})
				}
			})
		/*var entityAddress = {entityType: vm.entityType};
            if (vm.entityType === 'transaction-type' || vm.entityType === 'complex-transaction') {
                entityAddress = {entityType: 'complex-transaction', from: vm.entityType};
            }
            $state.go('app.portal.data-constructor', entityAddress);
            $mdDialog.hide();*/
	}

	vm.manageAttrs = function (ev) {
		$mdDialog.show({
			controller: 'AttributesManagerDialogController as vm',
			templateUrl: 'views/dialogs/attributes-manager-dialog-view.html',
			targetEvent: ev,
			multiple: true,
			locals: {
				data: {
					entityType: vm.entityType,
				},
			},
		})
	}

	vm.getAttributeTypes = function () {
		attributeTypeService
			.getList(vm.entityType, { pageSize: 1000 })
			.then(function (data) {
				vm.attrs = data.results
				vm.readyStatus.content = true
				vm.readyStatus.entity = true

				setTimeout(function () {
					$scope.$apply()
				}, 0)
			})
	}

	vm.checkReadyStatus = function () {
		return (
			vm.readyStatus.content &&
			vm.readyStatus.entity &&
			vm.readyStatus.permissions &&
			vm.readyStatus.transactionTypes
		)
	}

	vm.range = gridHelperService.range

	vm.bindFlex = sharedLogicHelper.bindFlex

	vm.checkFieldRender = sharedLogicHelper.checkFieldRender

	vm.checkViewState = function (tab) {
		if (tab.hasOwnProperty('enabled')) {
			if (tab.enabled.indexOf(vm.evAction) == -1) {
				return false
			}
		}

		return true
	}

	vm.book = async function ($event) {
		transactionHelper.updateEntityBeforeSave(vm)

		var errors = entityEditorHelper.validateComplexTransaction(
			vm.entity,
			vm.transactionType.actions,
			vm.tabs,
			vm.entityAttrs,
			vm.attrs,
			vm.userInputs
		)

		if (errors.length) {
			vm.locsWithErrors = {}

			/* errors.forEach(function (errorObj) {

                    if (errorObj.locationData &&
                        errorObj.locationData.type === 'tab') {

                        var tabName = errorObj.locationData.name.toLowerCase();

                        var selectorString = ".tab-name-elem[data-tab-name='" + tabName + "']";

                        var tabNameElem = document.querySelector(selectorString);
                        tabNameElem.classList.add('error-tab');

                        if (!vm.locsWithErrors.hasOwnProperty(tabName)) {
							vm.locsWithErrors[tabName] = [errorObj.key];

                        } else if (vm.locsWithErrors[tabName].indexOf(errorObj.key) < 0) {
							vm.locsWithErrors[tabName].push(errorObj.key);

                        }

                        vm.errorFieldsList.push(errorObj.key);

                    }

                });

				sharedLogicHelper.processTabsErrors(errors, vm.locsWithErrors, vm.errorFieldsList);

                vm.evEditorEventService.dispatchEvent(evEditorEvents.MARK_FIELDS_WITH_ERRORS);

                $mdDialog.show({
                    controller: 'EvAddEditValidationDialogController as vm',
                    templateUrl: 'views/dialogs/ev-add-edit-validation-dialog-view.html',
                    targetEvent: $event,
                    multiple: true,
                    locals: {
                        data: {
                            errorsList: errors
                        }
                    }
                }) */

			entityEditorHelper.processTabsErrors(
				errors,
				vm.evEditorDataService,
				vm.evEditorEventService,
				$mdDialog,
				$event
			)
		} else {
			// var resultEntity = entityEditorHelper.removeNullFields(vm.entity, vm.entityType);

			var resultEntity = vm.entity

			/* resultEntity.values = {};

                vm.userInputs.forEach(function (userInput) {

                    if (userInput !== null) {

                        Object.keys(vm.entity).forEach(function (key) {

                            if (key === userInput.name) {

                                resultEntity.values[userInput.name] = vm.entity[userInput.name];

                                if (userInput.value_type === 120) { // Victor 2020.12.29 Button is required
                                    resultEntity.values[userInput.name] = true;
                                }

                            }

                        });

                    }

                }); */
			resultEntity.values = sharedLogicHelper.mapUserInputsOnEntityValues(
				resultEntity.values
			)

			resultEntity.store = true
			resultEntity.calculate = true

			console.log('resultEntity', resultEntity)

			vm.processing = true

			new Promise(function (resolve, reject) {
				transactionTypeService
					.initBookComplexTransaction(resultEntity.transaction_type, {})
					.then(function (data) {
						var res = Object.assign(data, resultEntity)

						res.complex_transaction.is_locked = resultEntity.is_locked
						res.complex_transaction.is_canceled = resultEntity.is_canceled

						res.complex_transaction_status = 1 // status PRODUCTION

						if (dcLayoutHasBeenFixed) {
							vm.transactionType.book_transaction_layout = dataConstructorLayout

							transactionTypeService.update(
								vm.transactionType.id,
								vm.transactionType
							)
						}

						transactionTypeService
							.bookComplexTransaction(resultEntity.transaction_type, res)
							.then(function (data) {
								vm.processing = false

								toastNotificationService.success(
									'Transaction was successfully booked'
								)

								resolve(data)
							})
							.catch(function (data) {
								console.log('here?', data)

								if (
									data.hasOwnProperty('message') &&
									data.message.reason == 410
								) {
									vm.processing = false

									$mdDialog
										.show({
											controller: 'BookUniquenessWarningDialogController as vm',
											templateUrl:
												'views/dialogs/book-uniqueness-warning-dialog-view.html',
											targetEvent: $event,
											parent: angular.element(document.body),
											multiple: true,
											locals: {
												data: {
													errorData: data,
												},
											},
										})
										.then(function (response) {
											console.log('response', response)

											if (response.reaction === 'cancel') {
												// do nothing
											}

											if (response.reaction === 'skip') {
												metaHelper.closeComponent(
													vm.openedIn,
													$mdDialog,
													$bigDrawer,
													{
														status: 'agree',
														data: null,
													}
												)
											}

											if (response.reaction === 'book_without_unique_code') {
												// TODO refactor here
												// 2 (BOOK_WITHOUT_UNIQUE_CODE, ugettext_lazy('Book without Unique Code ')),

												res.uniqueness_reaction = 2

												transactionTypeService
													.bookComplexTransaction(
														resultEntity.transaction_type,
														res
													)
													.then(function (data) {
														vm.processing = false

														toastNotificationService.success(
															'Transaction was successfully booked'
														)

														resolve(data)
													})
											}

											if (response.reaction === 'overwrite') {
												// TODO refactor here
												//  3 (OVERWRITE, ugettext_lazy('Overwrite')),

												res.uniqueness_reaction = 3

												transactionTypeService
													.bookComplexTransaction(
														resultEntity.transaction_type,
														res
													)
													.then(function (data) {
														vm.processing = false

														toastNotificationService.success(
															'Transaction was successfully booked'
														)

														resolve(data)
													})
											}
										})
								} else {
									vm.processing = false

									$mdDialog.show({
										controller: 'ValidationDialogController as vm',
										templateUrl: 'views/dialogs/validation-dialog-view.html',
										targetEvent: $event,
										parent: angular.element(document.body),
										multiple: true,
										locals: {
											validationData: {
												errorData: data,
												tableColumnsNames: ['Name of fields', 'Error Cause'],
												entityType: 'complex-transaction',
											},
										},
									})

									reject(data)
								}
							})
					})
			}).then(function (data) {
				if (data.hasOwnProperty('has_errors') && data.has_errors === true) {
					$mdDialog.show({
						controller: 'ValidationDialogController as vm',
						templateUrl: 'views/dialogs/validation-dialog-view.html',
						targetEvent: $event,
						locals: {
							validationData: {
								errorData: data,
								tableColumnsNames: ['Name of fields', 'Error Cause'],
								entityType: 'complex-transaction',
							},
						},
						multiple: true,
					})
				} else {
					metaHelper.closeComponent(vm.openedIn, $mdDialog, $bigDrawer, {
						status: 'agree',
						data: data,
					})
				}
			})
		}
	}

	vm.bookAsIgnored = async function ($event) {
		transactionHelper.updateEntityBeforeSave(vm)

		var errors = entityEditorHelper.validateComplexTransaction(
			vm.entity,
			vm.transactionType.actions,
			vm.tabs,
			vm.entityAttrs,
			vm.attrs,
			vm.userInputs
		)

		if (errors.length) {
			vm.locsWithErrors = {}

			/* errors.forEach(function (errorObj) {

                    if (errorObj.locationData &&
                        errorObj.locationData.type === 'tab') {

                        var tabName = errorObj.locationData.name.toLowerCase();

                        var selectorString = ".tab-name-elem[data-tab-name='" + tabName + "']";

                        var tabNameElem = document.querySelector(selectorString);
                        tabNameElem.classList.add('error-tab');

                        if (!vm.locsWithErrors.hasOwnProperty(tabName)) {
							vm.locsWithErrors[tabName] = [errorObj.key];

                        } else if (vm.locsWithErrors[tabName].indexOf(errorObj.key) < 0) {
							vm.locsWithErrors[tabName].push(errorObj.key);

                        }

                        vm.errorFieldsList.push(errorObj.key);

                    }

                });

				sharedLogicHelper.processTabsErrors(errors, vm.locsWithErrors, vm.errorFieldsList);

                vm.evEditorEventService.dispatchEvent(evEditorEvents.MARK_FIELDS_WITH_ERRORS);

                $mdDialog.show({
                    controller: 'EvAddEditValidationDialogController as vm',
                    templateUrl: 'views/dialogs/ev-add-edit-validation-dialog-view.html',
                    targetEvent: $event,
                    multiple: true,
                    locals: {
                        data: {
                            errorsList: errors
                        }
                    }
                }) */
			entityEditorHelper.processTabsErrors(
				errors,
				vm.evEditorDataService,
				vm.evEditorEventService,
				$mdDialog,
				$event
			)
		} else {
			// var resultEntity = entityEditorHelper.removeNullFields(vm.entity, vm.entityType);

			var resultEntity = vm.entity

			/* resultEntity.values = {};

                vm.userInputs.forEach(function (userInput) {

                    if (userInput !== null) {

                        Object.keys(vm.entity).forEach(function (key) {

                            if (key === userInput.name) {

                                resultEntity.values[userInput.name] = vm.entity[userInput.name];

                                if (userInput.value_type === 120) { // Victor 2020.12.29 Button is required
                                    resultEntity.values[userInput.name] = true;
                                }

                            }

                        });

                    }

                }); */
			resultEntity.values = sharedLogicHelper.mapUserInputsOnEntityValues(
				resultEntity.values
			)

			resultEntity.store = true
			resultEntity.calculate = true

			console.log('resultEntity', resultEntity)

			vm.processing = true

			new Promise(function (resolve, reject) {
				transactionTypeService
					.initBookComplexTransaction(resultEntity.transaction_type, {})
					.then(function (data) {
						var res = Object.assign(data, resultEntity)

						res.complex_transaction.is_locked = resultEntity.is_locked
						res.complex_transaction.is_canceled = resultEntity.is_canceled

						res.complex_transaction_status = 3 // status IGNORED

						if (dcLayoutHasBeenFixed) {
							vm.transactionType.book_transaction_layout = dataConstructorLayout

							transactionTypeService.update(
								vm.transactionType.id,
								vm.transactionType
							)
						}

						transactionTypeService
							.bookComplexTransaction(resultEntity.transaction_type, res)
							.then(function (data) {
								vm.processing = false

								toastNotificationService.success(
									'Transaction was successfully booked'
								)

								resolve(data)
							})
							.catch(function (data) {
								console.log('here?', data)

								if (
									data.hasOwnProperty('message') &&
									data.message.reason == 410
								) {
									vm.processing = false

									$mdDialog
										.show({
											controller: 'BookUniquenessWarningDialogController as vm',
											templateUrl:
												'views/dialogs/book-uniqueness-warning-dialog-view.html',
											targetEvent: $event,
											parent: angular.element(document.body),
											multiple: true,
											locals: {
												data: {
													errorData: data,
												},
											},
										})
										.then(function (response) {
											console.log('response', response)

											if (response.reaction === 'cancel') {
												// do nothing
											}

											if (response.reaction === 'skip') {
												metaHelper.closeComponent(
													vm.openedIn,
													$mdDialog,
													$bigDrawer,
													{
														status: 'agree',
														data: null,
													}
												)
											}

											if (response.reaction === 'book_without_unique_code') {
												// TODO refactor here
												// 2 (BOOK_WITHOUT_UNIQUE_CODE, ugettext_lazy('Book without Unique Code ')),

												res.uniqueness_reaction = 2

												transactionTypeService
													.bookComplexTransaction(
														resultEntity.transaction_type,
														res
													)
													.then(function (data) {
														vm.processing = false

														toastNotificationService.success(
															'Transaction was successfully booked'
														)

														resolve(data)
													})
											}

											if (response.reaction === 'overwrite') {
												// TODO refactor here
												//  3 (OVERWRITE, ugettext_lazy('Overwrite')),

												res.uniqueness_reaction = 3

												transactionTypeService
													.bookComplexTransaction(
														resultEntity.transaction_type,
														res
													)
													.then(function (data) {
														vm.processing = false

														toastNotificationService.success(
															'Transaction was successfully booked'
														)

														resolve(data)
													})
											}
										})
								} else {
									vm.processing = false

									$mdDialog.show({
										controller: 'ValidationDialogController as vm',
										templateUrl: 'views/dialogs/validation-dialog-view.html',
										targetEvent: $event,
										parent: angular.element(document.body),
										multiple: true,
										locals: {
											validationData: {
												errorData: data,
												tableColumnsNames: ['Name of fields', 'Error Cause'],
												entityType: 'complex-transaction',
											},
										},
									})

									reject(data)
								}
							})
					})
			}).then(function (data) {
				if (data.hasOwnProperty('has_errors') && data.has_errors === true) {
					$mdDialog.show({
						controller: 'ValidationDialogController as vm',
						templateUrl: 'views/dialogs/validation-dialog-view.html',
						targetEvent: $event,
						locals: {
							validationData: {
								errorData: data,
								tableColumnsNames: ['Name of fields', 'Error Cause'],
								entityType: 'complex-transaction',
							},
						},
						multiple: true,
					})
				} else {
					metaHelper.closeComponent(vm.openedIn, $mdDialog, $bigDrawer, {
						status: 'agree',
						data: data,
					})
				}
			})
		}
	}

	vm.bookAsPending = async function ($event) {
		transactionHelper.updateEntityBeforeSave(vm)

		// vm.entity.$_isValid = entityEditorHelper.checkForNotNullRestriction(vm.entity, vm.entityAttrs, vm.attrs);
		//
		// var hasProhibitNegNums = entityEditorHelper.checkForNegNumsRestriction(vm.entity, vm.entityAttrs, vm.userInputs, vm.layoutAttrs);

		var errors = entityEditorHelper.validateComplexTransaction(
			vm.entity,
			vm.transactionType.actions,
			vm.tabs,
			vm.entityAttrs,
			vm.attrs,
			vm.userInputs
		)

		if (errors.length) {
			entityEditorHelper.processTabsErrors(
				errors,
				vm.evEditorDataService,
				vm.evEditorEventService,
				$mdDialog,
				$event
			)
		} else {
			// if (vm.entity.$_isValid) {

			// if (hasProhibitNegNums.length === 0) {

			var resultEntity = entityEditorHelper.removeNullFields(
				vm.entity,
				vm.entityType
			)

			/*resultEntity.values = {};

                vm.userInputs.forEach(function (userInput) {

                    if (userInput !== null) {
                        var keys = Object.keys(vm.entity);
                        keys.forEach(function (key) {
                            if (key === userInput.name) {
                                resultEntity.values[userInput.name] = vm.entity[userInput.name];
                            }
                        });
                    }
                });*/
			resultEntity.values = sharedLogicHelper.mapUserInputsOnEntityValues(
				resultEntity.values
			)

			resultEntity.store = true
			resultEntity.calculate = true

			vm.processing = true

			new Promise(function (resolve, reject) {
				transactionTypeService
					.initBookPendingComplexTransaction(resultEntity.transaction_type)
					.then(function (data) {
						var res = Object.assign(data, resultEntity)

						res.complex_transaction.is_locked = resultEntity.is_locked
						res.complex_transaction.is_canceled = resultEntity.is_canceled

						transactionTypeService
							.bookPendingComplexTransaction(resultEntity.transaction_type, res)
							.then(function (data) {
								vm.processing = false

								toastNotificationService.success(
									'Transaction was successfully booked'
								)

								resolve(data)
							})
					})
			})
				.then(function (data) {
					if (data.hasOwnProperty('has_errors') && data.has_errors === true) {
						$mdDialog.show({
							controller: 'ValidationDialogController as vm',
							templateUrl: 'views/dialogs/validation-dialog-view.html',
							targetEvent: $event,
							locals: {
								validationData: {
									errorData: data,
									tableColumnsNames: ['Name of fields', 'Error Cause'],
									entityType: 'complex-transaction',
								},
							},
							multiple: true,
							preserveScope: true,
							autoWrap: true,
							skipHide: true,
						})
					} else {
						metaHelper.closeComponent(vm.openedIn, $mdDialog, $bigDrawer, {
							status: 'agree',
						})
					}
				})
				.catch(function (data) {
					$mdDialog.show({
						controller: 'ValidationDialogController as vm',
						templateUrl: 'views/dialogs/validation-dialog-view.html',
						targetEvent: $event,
						locals: {
							validationData: {
								errorData: data,
								tableColumnsNames: ['Name of fields', 'Error Cause'],
								entityType: 'complex-transaction',
							},
						},
						multiple: true,
						preserveScope: true,
						autoWrap: true,
						skipHide: true,
					})
				})

			// }
			// else {
			//
			//     var warningDescription = '<p>Next fields should have positive number value to proceed:';
			//
			//     hasProhibitNegNums.forEach(function (field) {
			//         warningDescription = warningDescription + '<br>' + field;
			//     });
			//
			//     warningDescription = warningDescription + '</p>';
			//
			//     $mdDialog.show({
			//         controller: "WarningDialogController as vm",
			//         templateUrl: "views/dialogs/warning-dialog-view.html",
			//         multiple: true,
			//         clickOutsideToClose: false,
			//         locals: {
			//             warning: {
			//                 title: "Warning",
			//                 description: warningDescription,
			//                 actionsButtons: [
			//                     {
			//                         name: "CLOSE",
			//                         response: {status: 'disagree'}
			//                     }
			//                 ]
			//             }
			//         }
			//
			//     });
			//
			// }
		}
	}

	vm.getPortfolios = function () {
		portfolioService.getListLight().then(function (data) {
			vm.portfolios = data.results
			$scope.$apply()
		})
	}

	vm.getInstrumentTypes = function () {
		instrumentTypeService.getListLight().then(function (data) {
			vm.instrumentTypes = data.results
			$scope.$apply()
		})
	}

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
	var getTransactionGroups = function () {
		var groups = {}

		ttypesList.forEach(function (item) {
			var ttypeItem = {
				user_code: item.user_code, // this property only used by getFavoriteTTypeOptions function
				id: item.id,
				name: item.name,
			}

			if (item.group_object) {
				if (!groups[item.group_object.id]) {
					groups[item.group_object.id] = {
						name: item.group_object.name,
						children: [],
					}
				}

				groups[item.group_object.id].children.push(ttypeItem)
			} else {
				if (!groups['ungrouped']) {
					groups['ungrouped'] = {
						name: 'Ungrouped',
						children: [],
					}
				}

				groups['ungrouped'].children.push(ttypeItem)
			}
		})

		var groupsList = Object.keys(groups).map(function (key) {
			return groups[key]
		})

		groupsList = groupsList.filter(function (item) {
			return !!item
		})

		return groupsList
	}

	var getFavoriteTTypeOptions = function (transactionGroups) {
		var favTTypeOpts = []
		var member = globalDataService.getMember()

		if (
			member.data &&
			member.data.favorites &&
			member.data.favorites.transaction_type
		) {
			favTTypeOpts = member.data.favorites.transaction_type
				.map(function (ttypeUserCode) {
					var favOption

					var i
					for (i = 0; i < transactionGroups.length; i++) {
						var tGroup = transactionGroups[i]

						favOption = tGroup.children.find(function (option) {
							return option.user_code === ttypeUserCode
						})

						if (favOption) {
							return {
								groupName: tGroup.name,
								id: favOption.id,
								name: favOption.name,
							}
						}
					}

					return null

					/* var ttype = ttypesList.find(function (ttype) {
                        return ttype.user_code === ttypeUserCode;
                    });

                    if (!ttype) {return ttype;}

                    return {
                        id: ttype.id,
                        name: ttype.name
                    }; */
				})
				.filter(function (fTttype) {
					return !!fTttype
				})
		}

		return favTTypeOpts
	}

	vm.saveFavoriteTTypeOptions = function () {
		var member = globalDataService.getMember()

		if (!member.data) {
			member.data = {}
		}

		if (!member.data.favorites) {
			member.data.favorites = {}
		}

		member.data.favorites.transaction_type = vm.favTTypeOpts.map(function (
			ttypeOpt
		) {
			var ttype = ttypesList.find((ttype) => ttype.id === ttypeOpt.id)
			return ttype.user_code
		})

		usersService.updateMember(member.id, member)
	}

	vm.loadTransactionTypes = function () {
		var options = {
			filters: vm.filters,
			pageSize: 1000,
		}

		// transactionTypeService.getList(options).then(function (data) {
		transactionTypeService.getListLight(options).then(function (data) {
			ttypesList = data.results
			vm.transactionGroups = getTransactionGroups(ttypesList)

			vm.favTTypeOpts = getFavoriteTTypeOptions(vm.transactionGroups)

			vm.readyStatus.transactionTypes = true
			setTimeout(function () {
				$scope.$apply()
			}, 0)

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

	vm.filtersChange = function () {
		vm.transactionTypeId = null
		vm.loadTransactionTypes()
	}
	/** @param transactionType {{id: Number, name: String}}*/
	vm.transactionTypeChange = function () {
		// vm.transactionTypeId = selectedTType.id;

		notCopiedTransaction = true
		vm.entity.transaction_type = vm.transactionTypeId

		vm.dataConstructorData = {
			entityType: vm.entityType,
			instanceId: vm.transactionTypeId,
		}

		// show loader while vm.getFormLayout performs
		vm.readyStatus.layout = false
		$scope.$apply()

		vm.getFormLayout().then(function () {
			$scope.$apply()
		})
	}

	vm.mapValuesOnTransactionTypeChange = function (newBookData) {
		if (vm.originalComplexTransaction) {
			Object.keys(newBookData.values).forEach(function (key) {
				Object.keys(vm.originalComplexTransaction.values).forEach(function (
					ctKey
				) {
					if (key === ctKey) {
						newBookData.values[key] = vm.originalComplexTransaction.values[key]
					}
				})
			})
		}

		return newBookData
	}

	vm.init = function () {
		setTimeout(function () {
			vm.dialogElemToResize = document.querySelector(
				'.cTransactionEditorDialogElemToResize'
			)
		}, 100)

		vm.evEditorEventService = new EventService()
		vm.evEditorDataService = new EntityViewerEditorDataService()

		vm.evEditorDataService.setRecalculationFunction(vm.recalculate)

		console.log('entity', entity)
		console.log('data', data)

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

		if (Object.keys(data).length) {
			if (data.hasOwnProperty('contextData')) {
				vm.contextData = Object.assign({}, data.contextData)
				//delete entity.contextData;

				vm.transactionTypeId = entity.transaction_type

				vm.dataConstructorData = {
					entityType: vm.entityType,
					instanceId: vm.transactionTypeId,
				}

				if (vm.transactionTypeId) {
					vm.getFormLayout().then(function (value) {
						$scope.$apply()
					})
				}
			} else if (data.isCopy) {
				/*else if (entity.hasOwnProperty('transaction_type')) {

                    vm.transactionTypeId = entity.transaction_type;

                    vm.dataConstructorData = {
                        entityType: vm.entityType,
                        instanceId: vm.transactionTypeId
                    };

                    vm.getFormLayout().then(function (value) {
                        $scope.$apply();
                    })

                } */
				// if copy

				console.log('Apply from make copy', entity)
				notCopiedTransaction = false
				vm.entity = entity
				vm.entity.frontOptions = {
					dynamicAttributesValues: {},
					userInputsValues: {},
				}

				var copy = JSON.parse(JSON.stringify(entity))

				vm.originalComplexTransaction = JSON.parse(
					JSON.stringify(data.originalComplexTransaction)
				)

				vm.transactionTypeId = vm.entity.transaction_type

				vm.getFormLayout().then(function (value) {
					Object.keys(copy).forEach(function (key) {
						vm.entity[key] = copy[key]
					})

					console.log('Copy finished vm.entity', vm.entity)

					delete vm.entity.id

					vm.entity.is_locked = false
					vm.entity.is_active = false

					$scope.$apply()
				})
			}
		}

		vm.getPortfolios()
		vm.getInstrumentTypes()
		vm.loadTransactionTypes()
		vm.loadPermissions()

		vm.getAttributeTypes()
	}

	/*vm.onEntityChange = function () {

            console.log("entityChange", vm);
            console.log("vm.oldValues", vm.oldValues);

            var changedInput = null;

            vm.userInputs.forEach(function (item) {
                if (vm.oldValues[item.name] !== vm.entity[item.name]) {
                    changedInput = item
                }
            });

            vm.userInputs.forEach(function (item) {
                vm.oldValues[item.name] = vm.entity[item.name]
            });

            var resultInput;

            if (changedInput) {

                vm.transactionType.inputs.forEach(function (item) {
                    if (item.name === changedInput.name) {
                        resultInput = item;
                    }
                });

            }


            if (resultInput && resultInput.settings) {
                if (resultInput.settings.linked_inputs_names) {

                    vm.recalculateInputs(resultInput.settings.linked_inputs_names.split(','))

                }
            }

            console.log('changedInput', changedInput);
            console.log('resultInput', resultInput);

        }; */

	/* vm.onEntityChange = function (fieldKey) {

            if (fieldKey) {

                if (vm.inputsWithCalculations) {

                    var i, a;
                    for (i = 0; i < vm.userInputs.length; i++) {

                        if (vm.userInputs[i].key === fieldKey) {

                            var uInputName = vm.userInputs[i].name;

                            for (a = 0; a < vm.inputsWithCalculations.length; a++) {
                                var inputWithCalc = vm.inputsWithCalculations[a];

                                if (inputWithCalc.name === uInputName &&
                                    inputWithCalc.settings && inputWithCalc.settings.linked_inputs_names) {

                                    var changedUserInputData = JSON.parse(JSON.stringify(vm.userInputs[i]));

                                    changedUserInputData.frontOptions.linked_inputs_names = JSON.parse(JSON.stringify(inputWithCalc.settings.linked_inputs_names.split(',')));

                                    vm.evEditorDataService.setChangedUserInputData(changedUserInputData);
                                    vm.evEditorEventService.dispatchEvent(evEditorEvents.FIELD_CHANGED);

                                    break;

                                }
                            }

                            break;

                        }

                    }
                }


                var attributes = {
                    entityAttrs: vm.entityAttrs,
                    attrsTypes: vm.attrs,
                    userInputs: vm.userInputs
                }

                entityEditorHelper.checkTabsForErrorFields(fieldKey, errorFieldsList, tabsWithErrors,
                    attributes,
                    vm.entity, vm.entityType, vm.tabs);
            }

        }; */
	vm.onEntityChange = sharedLogicHelper.onFieldChange

	vm.editAsJson = function (ev) {
		$mdDialog
			.show({
				controller: 'EntityAsJsonEditorDialogController as vm',
				templateUrl: 'views/dialogs/entity-as-json-editor-dialog-view.html',
				targetEvent: ev,
				multiple: true,
				locals: {
					data: {
						item: {},
						entityType: vm.entityType,
					},
				},
			})
			.then(function (res) {
				if (res.status === 'agree') {
				}
			})
	}

	vm.init()
}
