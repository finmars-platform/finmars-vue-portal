/**
 * Created by szhitenev on 05.05.2016.
 */

// import usersGroupService from '../../services/usersGroupService';

import layoutService from '../../services/entity-data-constructor/layoutService'
import metaService from '../../services/metaService'

import gridHelperService from '../../services/gridHelperService'

// import ecosystemDefaultService from '../../services/ecosystemDefaultService';
import transactionTypeGroupService from '../../services/transaction/transactionTypeGroupService'

import portfolioService from '../../services/portfolioService'
import instrumentTypeService from '../../services/instrumentTypeService'
// import usersService from '../../services/usersService';

import metaHelper from '../../helpers/meta.helper'

import EventService from '../../services/eventService'

import GridTableDataService from '../../services/gridTableDataService'
import GridTableEventService from '../../services/gridTableEventService'

import entityEditorHelper from '../../helpers/entity-editor.helper'
import TransactionTypeEditorSharedLogicHelper from '../../helpers/entityViewer/sharedLogic/transactionTypeEditorSharedLogicHelper'

export default function transactionTypeAddDialogController(
	$scope,
	$mdDialog,
	$bigDrawer,
	$state,
	toastNotificationService,
	entityType,
	entity,
	data,
	usersService,
	usersGroupService,
	transactionTypeService,
	attributeTypeService,
	ecosystemDefaultService,
	metaContentTypesService,
	uiService,
	fieldResolverService,
	gridTableHelperService
) {
	var vm = this

	var sharedLogic = new TransactionTypeEditorSharedLogicHelper(
		vm,
		$scope,
		$mdDialog,
		ecosystemDefaultService,
		uiService,
		fieldResolverService,
		gridTableHelperService
	)

	vm.readyStatus = {
		content: false,
		entity: true,
		permissions: true,
		inputs: false,
	}
	vm.entityType = entityType

	vm.entity = { $_isValid: true, visibility_status: 1 }

	vm.processing = false

	vm.selectorContentTypes = []

	if (Object.keys(entity).length) {
		vm.entity = entity
	}

	vm.entityTabs = metaService.getEntityTabs(vm.entityType)

	vm.editLayoutEntityInstanceId = null
	vm.editLayoutByEntityInsance = false
	vm.entitySpecialRules = false
	vm.specialRulesReady = true

	vm.attrs = []
	var complexTransactionsAttrs = []
	vm.entityAttrs = []
	vm.layoutAttrs = layoutService.getLayoutAttrs()

	vm.entityAttrs = metaService.getEntityAttrs(vm.entityType) || []

	// Creating various variables to use as search terms for filters of repeating md-select components
	vm.searchTerms = {}

	vm.getInputsFilterST = function (name, index) {
		return name + index
	}
	// < Creating various variables to use as search terms for filters of repeating md-select components >

	vm.formIsFilled = false
	vm.canManagePermissions = false

	vm.expressionData = {
		groups: [],
		functions: [null],
	}

	vm.inputsToDelete = []
	vm.referenceTables = []
	vm.inputsForMultiselector = []

	vm.openedIn = data.openedIn
	vm.updateContextParameters = sharedLogic.updateContextParametersFunctions

	// var ecosystemDefaultData = {};

	vm.loadPermissions = function () {
		var promises = []

		promises.push(vm.getCurrentMember())
		promises.push(vm.getGroupList())

		Promise.all(promises).then(function (data) {
			vm.readyStatus.permissions = true

			vm.setPermissionsDefaults()

			if (vm.currentMember && vm.currentMember.is_admin) {
				vm.canManagePermissions = true
			}

			$scope.$apply()
		})
	}

	vm.getCurrentMember = function () {
		return new Promise(function (resolve, reject) {
			usersService.getMyCurrentMember().then(function (data) {
				vm.currentMember = data

				resolve(vm.currentMember)
			})
		})
	}

	vm.getGroupList = function () {
		return usersGroupService.getList().then(function (data) {
			vm.groups = data.results.filter(function (item) {
				return item.role === 2
			})
		})
	}

	vm.setPermissionsDefaults = function () {
		var contentType = metaContentTypesService.findContentTypeByEntity(
			vm.entityType
		)
		var table
		var isCreator

		// ;
		// ;

		vm.groups.forEach(function (group) {
			if (group.permission_table && group.permission_table.data) {
				table = group.permission_table.data.find(function (item) {
					return item.content_type === contentType
				}).data

				isCreator = vm.currentMember.groups.indexOf(group.id) !== -1

				group.objectPermissions = {}

				if (isCreator) {
					if (table.creator_manage) {
						group.objectPermissions.manage = true

						vm.canManagePermissions = true
					}

					if (table.creator_change) {
						group.objectPermissions.change = true
					}

					if (table.creator_view) {
						group.objectPermissions.view = true
					}
				} else {
					if (table.other_manage) {
						group.objectPermissions.manage = true

						vm.canManagePermissions = true
					}

					if (table.other_change) {
						group.objectPermissions.change = true
					}

					if (table.other_view) {
						group.objectPermissions.view = true
					}
				}
			}
		})
	}

	vm.cancel = function () {
		// $mdDialog.hide({status: 'disagree'});
		metaHelper.closeComponent(vm.openedIn, $mdDialog, $bigDrawer, {
			status: 'disagree',
		})
	}

	/*vm.editLayout = function (ev) {

            $mdDialog.show({
                controller: 'EntityDataConstructorDialogController as vm',
                templateUrl: 'views/dialogs/entity-data-constructor-dialog-view.html',
                targetEvent: ev,
                multiple: true,
                locals: {
                    data: {
                        entityType: vm.entityType,
                        fromEntityType: vm.entityType
                    }
                }
            }).then(function (res) {

                if (res.status === "agree") {

                    vm.readyStatus.entity = false;
                    vm.readyStatus.layout = false;

                    vm.getList();

                    vm.layoutAttrs = layoutService.getLayoutAttrs();
                    vm.entityAttrs = metaService.getEntityAttrs(vm.entityType) || [];

                }

            });

        };*/

	vm.manageAttrs = function (ev) {
		/*var entityAddress = {entityType: vm.entityType};
            if (vm.entityType === 'transaction-type' || vm.entityType === 'complex-transaction') {
                entityAddress = {entityType: vm.entityType, from: vm.entityType};
            }
            $state.go('app.portal.attributesManager', entityAddress);
            $mdDialog.hide();*/

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

	vm.transactionUserFields = {}
	vm.transactionUserFieldsState = {}

	vm.getTransactionUserFields = sharedLogic.getTransactionUserFields

	vm.getAttributeTypes = function () {
		var ttypeAttrTypesProm = attributeTypeService
			.getList(vm.entityType, { pageSize: 1000 })
			.then(function (data) {
				vm.attrs = data.results
				vm.readyStatus.content = true
			})

		var complTransactionAttrTypesProm = attributeTypeService
			.getList('complex-transaction', { pageSize: 1000 })
			.then(function (data) {
				complexTransactionsAttrs = data.results
			})

		return Promise.all([ttypeAttrTypesProm, complTransactionAttrTypesProm])
	}

	vm.checkReadyStatus = function () {
		return (
			vm.readyStatus.content &&
			vm.readyStatus.entity &&
			vm.readyStatus.permissions &&
			vm.readyStatus.inputs
		)
	}

	vm.range = gridHelperService.range

	vm.updateEntityBeforeSave = function (entity) {
		if (
			metaService.getEntitiesWithoutDynAttrsList().indexOf(vm.entityType) === -1
		) {
			entity.attributes = []

			vm.attrs.forEach(function (attributeType) {
				var value = entity[attributeType.user_code]

				entity.attributes.push(
					entityEditorHelper.appendAttribute(attributeType, value)
				)
			})
		}

		entity.object_permissions = []

		// code that should be working for Add and Edit complex transaction, add to sharedLogic.updateEntityBeforeSave()
		return sharedLogic.updateEntityBeforeSave(entity)
	}

	/* TODO grid table delete 2020-9-24
        var checkFieldExprForDeletedInput = function (actionFieldValue, actionItemKey, actionNotes) {

            for (var a = 0; a < inputsToDelete.length; a++) {
                var dInputName = inputsToDelete[a];

                var middleOfExpr = '[^A-Za-z_.]' + dInputName + '(?![A-Za-z1-9_])';
                var beginningOfExpr = '^' + dInputName + '(?![A-Za-z1-9_])';

                var dInputRegExpObj = new RegExp(beginningOfExpr + '|' + middleOfExpr, 'g');

                if (actionFieldValue.match(dInputRegExpObj)) {

                    var actionFieldLocation = {
                        action_notes: actionNotes,
                        key: actionItemKey, // for actions errors
                        name: actionItemKey, // for entity errors
                        message: "The deleted input is used in the Expression."
                    };

                    return actionFieldLocation;

                }
            }

        };

        vm.checkActionsForEmptyFields = function (actions) {

            var result = [];

            actions.forEach(function (action) {

                var actionKeys = Object.keys(action);

                actionKeys.forEach(function (actionKey) {

                    if (typeof action[actionKey] === 'object' && action[actionKey]) {

                        var actionItem = action[actionKey];
                        var actionItemKeys = Object.keys(actionItem);

                        actionItemKeys = actionItemKeys.filter(function (key) {

                            return key.indexOf('_object') === -1 && key.indexOf('_input') === -1 && key.indexOf('_phantom') === -1

                        });

                        ;

                        actionItemKeys.forEach(function (actionItemKey) {

                            if (actionItemKey === 'notes') {

                                if (actionItem[actionItemKey]) {

                                    var fieldWithInvalidExpr = checkFieldExprForDeletedInput(actionItem[actionItemKey], actionItemKey, action.action_notes);

                                    if (fieldWithInvalidExpr) {
                                        result.push(fieldWithInvalidExpr);
                                    }

                                }

                            } else {

                                if (actionItem.hasOwnProperty(actionItemKey + '_input')) {

                                    var inputValue = actionItem[actionItemKey + '_input'];
                                    var relationValue = actionItem[actionItemKey];

                                    var valueIsEmpty = false;

                                    ;
                                    ;
                                    ;

                                    if (actionItem.hasOwnProperty(actionItemKey + '_phantom')) {

                                        var phantomValue = actionItem[actionItemKey + '_phantom'];

                                        ;

                                        if (!inputValue && !relationValue && (phantomValue === null || phantomValue === undefined)) {
                                            valueIsEmpty = true;
                                        }

                                    } else {

                                        if (!inputValue && !relationValue) {
                                            valueIsEmpty = true;
                                        }

                                    }

                                    if (valueIsEmpty) {

                                        result.push({
                                            action_notes: action.action_notes,
                                            key: actionItemKey,
                                            value: actionItem[actionItemKey]
                                        })

                                    }


                                } else {

                                    if (actionItem[actionItemKey] === null ||
                                        actionItem[actionItemKey] === undefined ||
                                        actionItem[actionItemKey] === "") {

                                        result.push({
                                            action_notes: action.action_notes,
                                            key: actionItemKey,
                                            value: actionItem[actionItemKey]
                                        })

                                    } else if (actionItem[actionItemKey] && typeof actionItem[actionItemKey] === 'string') {

                                        var fieldWithInvalidExpr = checkFieldExprForDeletedInput(actionItem[actionItemKey], actionItemKey, action.action_notes);

                                        if (fieldWithInvalidExpr) {
                                            result.push(fieldWithInvalidExpr);
                                        }

                                    }

                                }

                            }

                        })

                    }


                })


            });


            return result;
        };

        var validateUserFields = function (entity, result) {

            var entityKeys = Object.keys(entity);

            entityKeys.forEach(function (entityKey) {

                if (entityKey.indexOf('user_text_') === 0 ||
                    entityKey.indexOf('user_number_') === 0 ||
                    entityKey.indexOf('user_date_') === 0) {

                    var fieldWithInvalidExpr = checkFieldExprForDeletedInput(entity[entityKey], entityKey, 'FIELDS');

                    if (fieldWithInvalidExpr) {
                        result.push(fieldWithInvalidExpr);
                    }

                }

            });
        };

        vm.checkEntityForEmptyFields = function (entity) {

            var result = [];

            if (entity.name === null || entity.name === undefined || entity.name === '') {
                result.push({
                    action_notes: 'General',
                    key: 'name',
                    name: 'Name',
                    value: entity.name
                })
            }

            if (entity.user_code === null || entity.user_code === undefined || entity.user_code === '') {
                result.push({
                    action_notes: 'General',
                    key: 'user_code',
                    name: 'User code',
                    value: entity.user_code
                })
            }

            if (entity.display_expr === null || entity.display_expr === undefined || entity.display_expr === '') {
                result.push({
                    action_notes: 'General',
                    key: 'display_expr',
                    name: 'Display Expression',
                    value: entity.display_expr
                })
            }

            if (entity.date_expr === null || entity.date_expr === undefined || entity.date_expr === '') {
                result.push({
                    action_notes: 'General',
                    key: 'date_expr',
                    name: 'Complex Transaction Date',
                    value: entity.date_expr
                })
            }

            if (entity.group === null || entity.group === undefined) {
                result.push({
                    action_notes: 'General',
                    key: 'group',
                    name: 'Group',
                    value: entity.group
                })
            }

            validateUserFields(entity, result);

            return result;

        };*/

	var getUserInputs = function (inputs) {
		var userInputs = []

		inputs.forEach(function (input) {
			var input_value_type = input.value_type
			if (input.value_type === 100) {
				input_value_type = 'field'
			}

			var contentType

			if (input.content_type && input.content_type !== undefined) {
				contentType = input.content_type.split('.')[1]

				if (contentType === 'eventclass') {
					contentType = 'event_class'
				}

				if (contentType === 'notificationclass') {
					contentType = 'notification_class'
				}

				if (contentType === 'accrualcalculationmodel') {
					contentType = 'accrual_calculation_model'
				}

				if (contentType === 'pricingpolicy') {
					contentType = 'pricing_policy'
				}
			} else {
				contentType = input.name.split(' ').join('_').toLowerCase()
			}

			userInputs.push({
				key: contentType,
				name: input.name,
				reference_table: input.reference_table,
				verbose_name: input.verbose_name,
				content_type: input.content_type,
				value_type: input_value_type,
			})
		})

		return userInputs
	}

	var doNotUseForEditLayoutAttrs = [
		'transaction_type',
		'code',
		'date',
		'status',
		'text',
		'user_text_1',
		'user_text_2',
		'user_text_3',
		'user_text_4',
		'user_text_5',
		'user_text_6',
		'user_text_7',
		'user_text_8',
		'user_text_9',
		'user_text_10',
		'user_text_1',
		'user_text_11',
		'user_text_12',
		'user_text_13',
		'user_text_14',
		'user_text_15',
		'user_text_16',
		'user_text_17',
		'user_text_18',
		'user_text_19',
		'user_text_20',
		'user_text_21',
		'user_text_22',
		'user_text_23',
		'user_text_24',
		'user_text_25',
		'user_text_26',
		'user_text_27',
		'user_text_28',
		'user_text_29',
		'user_text_30',

		'user_number_1',
		'user_number_2',
		'user_number_3',
		'user_number_4',
		'user_number_5',
		'user_number_6',
		'user_number_7',
		'user_number_8',
		'user_number_9',
		'user_number_10',
		'user_number_11',
		'user_number_12',
		'user_number_13',
		'user_number_14',
		'user_number_15',
		'user_number_16',
		'user_number_17',
		'user_number_18',
		'user_number_19',
		'user_number_20',

		'user_date_1',
		'user_date_2',
		'user_date_3',
		'user_date_4',
		'user_date_5',
	]

	var createDefaultEditLayout = function (ttypeData) {
		var instanceId = ttypeData.id
		var elFields = []
		var elAttrIndex = 0
		var complTransactionAttrs = metaService.getEntityAttrs(
			'complex-transaction'
		)

		var editLayoutEntityAttrs = complTransactionAttrs.filter(function (entity) {
			return doNotUseForEditLayoutAttrs.indexOf(entity.key) === -1
		})

		var userInputs = getUserInputs(ttypeData.inputs)

		var addFields = function (attrType) {
			var attributes = []
			var attributeClass = ''

			switch (attrType) {
				case 'attrs':
					attributes = complexTransactionsAttrs
					attributeClass = 'attr'
					break
				case 'entityAttrs':
					attributes = editLayoutEntityAttrs
					attributeClass = 'entityAttr'
					break
				case 'userInputs':
					attributes = userInputs
					attributeClass = 'userInput'
					break
				case 'layoutAttrs':
					attributes = vm.layoutAttrs
					attributeClass = 'decorationAttr'
					break
			}

			attributes.forEach(function (attribute) {
				if (
					attribute.key !== 'object_permissions_user' &&
					attribute.key !== 'object_permissions_group'
				) {
					elAttrIndex += 1

					var attrObj = JSON.parse(angular.toJson(attribute))
					delete attrObj.frontOptions

					var fieldData = {
						type: 'field',
						row: elAttrIndex,
						attribute: attrObj,
						column: 1,
						attribute_class: attributeClass,
						editable: true,
						name: attribute.name,
						colspan: 1,
					}

					if (attrType === 'attrs' && (attribute.id || attribute.id === 0)) {
						fieldData.attribute.id = attribute.id
					}

					elFields.push(fieldData)
				}
			})
		}

		addFields('attrs')
		addFields('entityAttrs')
		addFields('userInputs')
		addFields('layoutAttrs')

		var editLayoutData = {
			name: 'Form layout of transaction type: ' + ttypeData.name,
			user_code: ttypeData.user_code + '_edit_layout',
			data: [
				{
					layout: {
						rows: elAttrIndex,
						columns: 1,
						fields: elFields,
					},
					id: 1,
					name: 'Transaction Inputs',
				},
			],
		}

		return transactionTypeService.patch(instanceId, {
			book_transaction_layout: editLayoutData,
		})
	}

	vm.save = function ($event) {
		return new Promise(function (resolve, reject) {
			let entityToSave = JSON.parse(JSON.stringify(vm.entity))
			entityToSave = vm.updateEntityBeforeSave(entityToSave)

			var actionsErrors = sharedLogic.checkActionsForEmptyFields(
				entityToSave.actions
			)
			var inputsErrors = sharedLogic.validateInputs(entityToSave.inputs)
			actionsErrors = actionsErrors.concat(inputsErrors)

			var entityErrors = sharedLogic.checkEntityForEmptyFields(entityToSave)



			/*if (actionsErrors.length || entityErrors.length) {

                    $mdDialog.show({
                        controller: 'TransactionTypeValidationErrorsDialogController as vm',
                        templateUrl: 'views/entity-viewer/transaction-type-validation-errors-dialog-view.html',
                        parent: angular.element(document.body),
                        targetEvent: $event,
                        clickOutsideToClose: false,
                        multiple: true,
                        locals: {
                            data: {
                                actionErrors: actionsErrors,
                                entityErrors: entityErrors
                            }
                        }
                    });

                    vm.processing = false;

                    reject();

                }*/

			new Promise(function (resolve, reject) {
				if (actionsErrors.length || entityErrors.length) {
					$mdDialog
						.show({
							controller:
								'TransactionTypeValidationErrorsDialogController as vm',
							templateUrl:
								'views/entity-viewer/transaction-type-validation-errors-dialog-view.html',
							parent: angular.element(document.body),
							clickOutsideToClose: false,
							multiple: true,
							locals: {
								data: {
									actionErrors: actionsErrors,
									entityErrors: entityErrors,
								},
							},
						})
						.then(function (data) {
							if (data.status === 'agree') {
								resolve()
							} else {
								reject()
							}
						})
				} else {
					resolve()
				}
			}).then(function () {
				vm.processing = true

				transactionTypeService
					.create(entityToSave)
					.then(function (responseData) {
						toastNotificationService.success(
							'Transaction Type ' +
								' ' +
								entityToSave.name +
								' was successfully created'
						)

						/* if (vm.entity.inputs) {
                            vm.entity.inputs.forEach(function (input) {

                                if (input.settings && input.settings.linked_inputs_names) {
                                    input.settings.linked_inputs_names = input.settings.linked_inputs_names.split(',')
                                }

                            });

                        } */

						vm.entity.object_permissions = responseData.object_permissions

						console.log(
							'Creating: book_transaction_layout',
							vm.entity.book_transaction_layout
						)

						if (vm.entity.book_transaction_layout) {
							// if book_transaction_layout was copied from another TType

							vm.processing = false

							$scope.$apply()

							// resolve(resolve(responseData));
							resolve(responseData)
						} else {
							createDefaultEditLayout(responseData).then(function () {
								vm.processing = false

								$scope.$apply()

								resolve(responseData)
							})
						}
					})
					.catch(function (data) {
						$mdDialog.show({
							controller: 'ValidationDialogController as vm',
							templateUrl: 'views/dialogs/validation-dialog-view.html',
							targetEvent: $event,
							locals: {
								validationData: data,
							},
							preserveScope: true,
							multiple: true,
							autoWrap: true,
							skipHide: true,
						})

						vm.processing = false

						reject()
					})
			})
		})
	}

	vm.saveAndExit = function (action) {
		vm.save().then(function (responseData) {
			let responseObj = { status: 'disagree' }

			if (action === 'edit') {
				vm.entity = { ...vm.entity, ...responseData }
				vm.entity.$_isValid = true

				responseObj = {
					status: 'edit',
					data: {
						entityType: vm.entityType,
						entity: vm.entity,
					},
				}
			}

			metaHelper.closeComponent(vm.openedIn, $mdDialog, $bigDrawer, responseObj)
		})
	}

	// Transaction type General Controller start

	vm.entity.book_transaction_layout = vm.entity.book_transaction_layout || ''
	vm.entity.actions = vm.entity.actions || []
	vm.entity.inputs = vm.entity.inputs || []
	vm.entity.context_parameters = sharedLogic.getContextParameters()

	vm.readyStatus = {
		transactionTypeGroups: false,
		instrumentTypes: false,
		portfolios: false,
	}

	vm.getTransactionTypeGroups = function () {
		transactionTypeGroupService.getList().then(function (data) {
			vm.transactionTypeGroups = data.results
			vm.readyStatus.transactionTypeGroups = true
			$scope.$apply()
		})
	}

	vm.getPortfolios = function () {
		portfolioService.getList().then(function (data) {
			vm.portfolios = data.results
			vm.readyStatus.portfolios = true
			$scope.$apply()
		})
	}

	vm.getInstrumentTypes = function () {
		instrumentTypeService.getListLight().then(function (data) {
			vm.instrumentTypes = data.results
			vm.readyStatus.instrumentTypes = true
			$scope.$apply()
		})
	}

	vm.unselectAllEntities = function (entity) {
		if (entity === 'instruments') {
			if (vm.entity.is_valid_for_all_instruments) {
				vm.entity.instrument_types = []
			}
		} else if (entity === 'portfolios') {
			if (vm.entity.is_valid_for_all_portfolios) {
				vm.entity.portfolios = []
			}
		}
	}

	vm.notValidForAll = function (entity) {
		if (entity === 'instruments') {
			if (vm.entity.instrument_types && vm.entity.instrument_types.length > 0) {
				vm.entity.is_valid_for_all_instruments = false
			}
		} else if (entity === 'portfolios') {
			if (vm.entity.portfolios && vm.entity.portfolios.length > 0) {
				vm.entity.is_valid_for_all_portfolios = false
			}
		}

		$scope.$apply()
	}

	vm.bindSelectedText = function (entity, fallback) {
		if (entity) {
			return '[' + entity.length + ']'
		}
		return fallback
	}

	/*vm.tagTransform = function (newTag) {
            //;
            var item = {
                name: newTag,
                id: null
            };

            return item;
        };*/

	vm.checkReadyStatus = function () {
		if (
			vm.readyStatus.transactionTypeGroups == true &&
			vm.readyStatus.portfolios == true &&
			vm.readyStatus.instrumentTypes == true
		) {
			return true
		}
		return false
	}

	// Transaction Type General Controller end

	// Transaction Type Inputs Controller start

	/*vm.contextProperties = {

            'instruments.instrument': [
                {
                    key: 'instrument',
                    name: 'Instrument'
                }

                // TODO is not in use now
                // {
                //     id: 9,
                //     name: 'position'
                // },
                // {
                //     id: 10,
                //     name: 'effective_date'
                // }
            ],
            'currencies.currency': [
                {
                    key: 'pricing_currency',
                    name: 'Pricing Currency'
                },
                {
                    key: 'accrued_currency',
                    name: 'Accrued Currency'
                }
            ],
            'portfolios.portfolio': [
                {
                    key: 'portfolio',
                    name: 'Portfolio'
                }
            ],
            'accounts.account': [
                {
                    key: 'account',
                    name: 'Account'
                }
            ],
            'strategies.strategy1': [
                {
                    key: 'strategy1',
                    name: 'Strategy 1'
                }
            ],
            'strategies.strategy2': [
                {
                    key: 'strategy2',
                    name: 'Strategy 2'
                }
            ],
            'strategies.strategy3': [
                {
                    key: 'strategy3',
                    name: 'Strategy 3'
                }
            ]

        };*/
	vm.contextProperties = sharedLogic.getContextProperties()
	vm.relationItems = {}
	vm.valueTypes = sharedLogic.getValueTypes()
	vm.contentTypes = metaContentTypesService.getListForTransactionTypeInputs()

	vm.bindValueType = function (row) {
		var name
		vm.valueTypes.forEach(function (item) {
			if (row.value_type == item.value) {
				row.value_type_name = item.display_name
				name = item.display_name
			}
		})
		return name
	}

	vm.bindContentType = function (row) {
		var name
		vm.contentTypes.forEach(function (item) {
			if (row.content_type == item.key) {
				row.content_type_name = item.name
				name = item.name
			}
		})
		return name
	}

	/*vm.resolveRelation = function (item) {
            var entityKey;

            for (var i = 0; i < vm.contentTypes.length; i++) {
                if (vm.contentTypes[i].key === item.content_type) {
                    entityKey = vm.contentTypes[i].entity;

                    if (entityKey === 'strategy-1') {
                        return 'strategy1'
                    } else if (entityKey === 'strategy-2') {
                        return 'strategy2'
                    } else if (entityKey === 'strategy-3') {
                        return 'strategy3'
                    } else {

                        entityKey = entityKey.replace(/-/g, '_');

                        return entityKey;

                    }
                }
            }

        };

        vm.toggleQuery = function () {
            vm.queryStatus = !vm.queryStatus;
            vm.query = {};
        };

        vm.setSort = function (propertyName) {
            vm.direction = (vm.sort === propertyName) ? !vm.direction : false;
            vm.sort = propertyName;
        };

        vm.editItem = function (item) {
            item.editStatus = true;
        };*/
	vm.resolveRelation = sharedLogic.resolveRelation

	vm.saveItem = function (item) {
		vm.expressionData = sharedLogic.updateInputFunctions()
		vm.updateContextParameters()

		item.editStatus = false
	}

	/* TODO grid table delete
        var removeInputFromActions = function (deletedInputName) {

            inputsToDelete.push(deletedInputName);

            vm.entity.actions.forEach(function (action) {

                var actionKeys = Object.keys(action);

                actionKeys.forEach(function (actionKey) {

                    if (typeof action[actionKey] === 'object' && action[actionKey]) { // check if it is property that contains actions field data

                        var actionType = action[actionKey];
                        var actionTypeKeys = Object.keys(actionType);

                        var i;
                        for (i = 0; i < actionTypeKeys.length; i++) {

                            var key = actionTypeKeys[i];
                            var actionFieldValue = actionType[key];

                            if (key.length > 7 &&
                                key.indexOf('_input') === key.length - 6 &&
                                actionFieldValue === deletedInputName) { // if field is input fields

                                actionType[key] = null;

                            }


                        }


                    }

                });

            });

        };

        vm.deleteInput = function (item, index, $event) {

            $mdDialog.show({
                controller: 'WarningDialogController as vm',
                templateUrl: 'views/dialogs/warning-dialog-view.html',
                parent: angular.element(document.body),
                targetEvent: $event,
                preserveScope: true,
                autoWrap: true,
                multiple: true,
                skipHide: true,
                locals: {
                    warning: {
                        title: 'Warning',
                        description: "Please note that in Action all links to this input will be deleted. Expressions will not be affected, so you would need to amend them manually.",
                        actionsButtons: [
                            {
                                name: "OK, PROCEED",
                                response: {status: 'agree'}
                            },
                            {
                                name: "CANCEL",
                                response: {status: 'disagree'}
                            }
                        ]
                    }
                }
            }).then(function (res) {

                if (res.status === 'agree') {

                    vm.entity.inputs.splice(index, 1);
                    vm.updateInputFunctions();
                    removeInputFromActions(item.name);

                }

            });

        };*/

	vm.openExpressionDialog = function ($event, item, options) {
		$mdDialog
			.show({
				controller: 'ExpressionEditorDialogController as vm',
				templateUrl: 'views/dialogs/expression-editor-dialog-view.html',
				parent: angular.element(document.body),
				targetEvent: $event,
				preserveScope: true,
				autoWrap: true,
				skipHide: true,
				locals: {
					item: { expression: item[options.key] },
				},
			})
			.then(function (res) {
				if (res.status === 'agree') {

					item[options.key] = res.data.item.expression
				}
				// ;
			})
	}

	vm.valueTypeChanged = function (item) {
		item.content_type = null
		item.is_fill_from_context = false
		item.context_property = null

		if (item.value_type === 100) {
			item.content_type = 'accounts.account'
		}
	}

	vm.validateInputName = function () {
		var errorText = ''

		if (vm.newItem.name.match('[^1-9a-zA-Z_]')) {
			errorText = 'Only english letters and 1-9 numbers allowed for input name.'
		}

		if (vm.newItem.name.match('^[0-9]')) {
			if (errorText) {
				errorText += '\n'
			}

			errorText += 'Input name should not start with number.'
		}

		return errorText
	}

	/*vm.addRow = function ($event) {

            if (vm.newItem.name && vm.newItem.value_type) {

                var inputNameErrors = vm.validateInputName();

                if (!inputNameErrors) {

                    vm.entity.inputs.push({
                        name: vm.newItem.name,
                        verbose_name: vm.newItem.verbose_name,
                        value_type: vm.newItem.value_type,
                        content_type: vm.newItem.content_type,
                        is_fill_from_context: vm.newItem.is_fill_from_context,
                        reference_table: vm.newItem.reference_table,
                        account: vm.newItem.account,
                        instrument_type: vm.newItem.instrument_type,
                        instrument: vm.newItem.instrument,
                        currency: vm.newItem.currency,
                        counterparty: vm.newItem.counterparty,
                        responsible: vm.newItem.responsible,
                        portfolio: vm.newItem.portfolio,
                        strategy1: vm.newItem.strategy1,
                        strategy2: vm.newItem.strategy2,
                        strategy3: vm.newItem.strategy3,
                        daily_pricing_model: vm.newItem.daily_pricing_model,
                        payment_size_detail: vm.newItem.payment_size_detail,
                        price_download_scheme: vm.newItem.price_download_scheme,
                        pricing_policy: vm.newItem.pricing_policy,
                        value: vm.newItem.value,
                        value_expr: vm.newItem.value_expr
                    });

                    // if created input with name of deleted one, remove it from warning
                    for (var i = 0; i < inputsToDelete.length; i++) {
                        var inputToDelete = inputsToDelete[i];

                        if (inputToDelete === vm.newItem.name) {
                            inputsToDelete.splice(i, 1);
                            break;
                        }
                    }
                    // < if created input with name of deleted one, remove it from warning >

                    vm.newItem.name = null;
                    vm.newItem.verbose_name = null;
                    vm.newItem.value_type = null;
                    vm.newItem.content_type = null;
                    vm.newItem.is_fill_from_context = false;
                    vm.newItem.account = null;
                    vm.newItem.instrument_type = null;
                    vm.newItem.instrument = null;
                    vm.newItem.currency = null;
                    vm.newItem.counterparty = null;
                    vm.newItem.responsible = null;
                    vm.newItem.portfolio = null;
                    vm.newItem.strategy1 = null;
                    vm.newItem.strategy2 = null;
                    vm.newItem.strategy3 = null;
                    vm.newItem.daily_pricing_model = null;
                    vm.newItem.payment_size_detail = null;
                    vm.newItem.price_download_scheme = null;
                    vm.newItem.pricing_policy = null;
                    vm.newItem.value = null;
                    vm.newItem.value_expr = null;

                    vm.updateInputFunctions();

                } else {

                    $mdDialog.show({
                        controller: 'WarningDialogController as vm',
                        templateUrl: 'views/dialogs/warning-dialog-view.html',
                        parent: angular.element(document.body),
                        targetEvent: $event,
                        clickOutsideToClose: false,
                        multiple: true,
                        locals: {
                            warning: {
                                title: 'Warning',
                                description: inputNameErrors,
                                actionsButtons: [
                                    {
                                        name: 'CLOSE',
                                        response: false
                                    }
                                ]
                            }
                        }
                    });

                }

            } else {

                $mdDialog.show({
                    controller: 'WarningDialogController as vm',
                    templateUrl: 'views/dialogs/warning-dialog-view.html',
                    parent: angular.element(document.body),
                    targetEvent: $event,
                    clickOutsideToClose: false,
                    multiple: true,
                    locals: {
                        warning: {
                            title: 'Warning',
                            description: "Please fill in 'Name' and 'Value type' fields.",
                            actionsButtons: [
                                {
                                    name: 'CLOSE',
                                    response: false
                                }
                            ]
                        }
                    }
                });

            }

        };*/

	// Transaction Type Input Controller end

	// Transaction Type Recon start

	vm.addReconField = function () {
		vm.entity.recon_fields.push(Object.assign({}, vm.newReconField))

		vm.newReconField = {}
	}

	vm.deleteReconField = function ($event, $index) {
		vm.entity.recon_fields.splice($index, 1)
	}

	// Transaction Type Recon end

	//region Transaction type Actions controller

	vm.relationItems = {}

	vm.contentTypes = metaContentTypesService.getListForTransactionTypeInputs()

	vm.onActionAccordionCollapse = sharedLogic.onActionAccordionCollapse
	vm.toggleItem = sharedLogic.toggleItem

	vm.getActionTypeName = sharedLogic.getActionTypeName

	vm.preventSpace = function ($event) {
		$event.stopPropagation()
	}

	vm.rebookInstrumentReactions = [
		{
			name: 'Create Instrument. If exists: Overwrite',
			id: 2,
		},
		{
			name: "If exists: Phantom = existing Instrument, don't Overwrite. If not exists: create Instrument.",
			id: 0,
		},
		{
			name: 'Find the Instrument. If not found: create on the first booking. On rebook: nothing is created, Phantom = Default Instrument.',
			id: 5,
		},
	]

	vm.rebookOtherReactions = [
		{
			name: 'Append',
			id: 0,
		},
		{
			name: 'If book: Append. If rebook: Skip',
			id: 4,
		},
		{
			name: 'Clear & Append',
			id: 3,
		},
		{
			name: 'If book: Clear & Append. If rebook: Skip',
			id: 6,
		},
		{
			name: 'Clear',
			id: 7,
		},
	]

	vm.instrumentTypeTransactionTypes = [
		{
			name: 'One Off Event',
			value: 'one_off_event',
		},
		{
			name: 'Regular Event',
			value: 'regular_event',
		},
		{
			name: 'Factor up',
			value: 'factor_up',
		},
		{
			name: 'Factor same',
			value: 'factor_same',
		},
		{
			name: 'Factor down',
			value: 'factor_down',
		},
	]

	vm.actionsKeysList = [
		'instrument',
		'transaction',
		'instrument_factor_schedule',
		// 'instrument_manual_pricing_formula',
		'instrument_accrual_calculation_schedules',
		'instrument_event_schedule',
		'instrument_event_schedule_action',
	]

	vm.checkActionsIsNotNull = function () {
		return false
	}

	vm.entity.actions.forEach(function (action) {
		var keys

		vm.actionsKeysList.forEach(function (actionKey) {
			if (action[actionKey] !== null) {
				keys = Object.keys(action[actionKey])

				keys.forEach(function (key) {
					if (action[actionKey].hasOwnProperty(key + '_input')) {
						if (action[actionKey][key] !== null) {
							action[actionKey][key + '_toggle'] = true
						}
					}
				})
			}
		})
	})

	/* var setDefaultValueForRelation = function (actionData, propertyName, fieldName) {

            var relationType = '';
            switch (fieldName) {
                case 'linked_instrument':
                case 'allocation_pl':
                case 'allocation_balance':
                    relationType = 'instrument';
                    break;
                default:
                    relationType = fieldName;
            }

            var nameProperty = 'name';
            if (fieldName === 'price_download_scheme') {
                nameProperty = 'user_code';
            }

            var defaultValueKey = '';
            switch (relationType) {
                case 'account_position':
                case 'account_cash':
                case 'account_interim':
                    defaultValueKey = 'account';
                    break;
                case 'settlement_currency':
                case 'transaction_currency':
                case 'accrued_currency':
                case 'pricing_currency':
                    defaultValueKey = 'currency';
                    break;
                case 'strategy1_position':
                case 'strategy1_cash':
                    defaultValueKey = 'strategy1';
                    break;
                case 'strategy2_position':
                case 'strategy2_cash':
                    defaultValueKey = 'strategy2';
                    break;
                case 'strategy3_position':
                case 'strategy3_cash':
                    defaultValueKey = 'strategy3';
                    break;
                default:
                    defaultValueKey = relationType;
            }

            var defaultName = ecosystemDefaultData[defaultValueKey + '_object'][nameProperty];

            actionData[propertyName][fieldName] = ecosystemDefaultData[defaultValueKey];

            // needed for displaying default value after turning on 'relation' field
            actionData[propertyName][fieldName + '_object'] = {};
            actionData[propertyName][fieldName + '_object'][nameProperty] = defaultName;
            actionData[propertyName][fieldName + '_object']['id'] = ecosystemDefaultData[defaultValueKey];

        }; */

	vm.resetProperty = function (item, propertyName, fieldName) {
		item[propertyName][fieldName] = null
		item[propertyName][fieldName + '_input'] = null
	}

	vm.onActionMultitypeFieldToggle = sharedLogic.onActionMultitypeFieldToggle
	vm.onMultitypeFieldValChange = sharedLogic.onMultitypeFieldValChange

	vm.actionsMultitypeFieldsList = []
	vm.eventPhantomsOpts = []
	vm.paneActionsMenuPopups = []

	vm.createSelectorPopupDataForActions =
		sharedLogic.createSelectorPopupDataForActions

	/* vm.deletePane = function (item, $index, $event) {

            var description = 'Are you sure to delete this action?';

            $mdDialog.show({
                controller: 'WarningDialogController as vm',
                templateUrl: 'views/dialogs/warning-dialog-view.html',
                parent: angular.element(document.body),
                targetEvent: $event,
                preserveScope: true,
                autoWrap: true,
                multiple: true,
                skipHide: true,
                locals: {
                    warning: {
                        title: 'Warning',
                        description: description
                    }
                }
            }).then(function (res) {
                if (res.status === 'agree') {
                    vm.entity.actions.splice($index, 1);

                    vm.clearPhantoms();
                }
            });
        }; */

	vm.clearPhantoms = function () {


		var count = 0

		vm.entity.actions.forEach(function (action) {
			Object.keys(action).forEach(function (actionKey) {
				if (action[actionKey]) {
					Object.keys(action[actionKey]).forEach(function (key) {
						if (key.indexOf('phantom') !== -1) {
							action[actionKey][key] = null
							count = count + 1
						}
					})
				}
			})
		})

		if (count > 0) {
			toastNotificationService.warning(count + ' phantom inputs were reseted')
		}
	}

	vm.generateOperationPopupData = sharedLogic.generateOperationPopupData
	vm.generateInstrumentOperationPopupData =
		sharedLogic.generateInstrumentOperationPopupData

	vm.getActionPaneId = sharedLogic.getActionPaneId

	/* vm.makeCopyOfAction = function (actionToCopy, index) {

            var actionCopy = JSON.parse(JSON.stringify(actionToCopy));

            delete actionCopy.$$hashKey;

            var actionName = actionCopy.action_notes + ' (Copy)';
            var actionNameOccupied = true;

            var c = 1;
            while (actionNameOccupied) { // check that copy name is unique

                actionNameOccupied = false;

                for (var a = 0; a < vm.entity.actions.length; a++) {

                    if (vm.entity.actions[a].action_notes === actionName) {

                        c = c + 1;
                        actionName = actionCopy.action_notes + ' (Copy ' + c + ')';
                        actionNameOccupied = true;

                        break;

                    }

                }

                if (!actionNameOccupied) {
                    actionCopy.action_notes = actionName;

                    if (actionCopy.transaction && actionCopy.transaction.hasOwnProperty('action_notes')) {
                        actionCopy.transaction.action_notes = actionName;
                    }

                    if (actionCopy.instrument) {
                        actionCopy.instrument.action_notes = actionName;
                    }

                }

            }

            vm.accordion.collapseAll();

            actionCopy.isPaneExpanded = true;

            vm.entity.actions.splice(index + 1, 0, actionCopy);

            findPhantoms();
        }; */

	vm.moveDown = sharedLogic.moveDown
	vm.moveUp = sharedLogic.moveUp

	/* vm.setTransactionInstrumentInput = function (item, name, prop) {

            if (prop == 'instrument') {
                item.transaction.instrument_input = name;
                item.transaction.instrument_phantom = null;
                item.transaction.instrument = null;
            }

            if (prop == 'linked_instrument') {
                item.transaction.linked_instrument_input = name;
                item.transaction.linked_instrument_phantom = null;
                item.transaction.linked_instrument = null;
            }

            if (prop == 'allocation_pl') {
                item.transaction.allocation_pl_input = name;
                item.transaction.allocation_pl_phantom = null;
                item.transaction.allocation_pl = null;
            }

            if (prop == 'allocation_balance') {
                item.transaction.allocation_balance_input = name;
                item.transaction.allocation_balance_phantom = null;
                item.transaction.allocation_balance = null;
            }
        };

        vm.setTransactionInstrumentPhantom = function (item, positionOrder, prop) {

            if (prop == 'instrument') {
                item.transaction.instrument_input = null;
                item.transaction.instrument_phantom = positionOrder;
                item.transaction.instrument = null;
            }

            if (prop == 'linked_instrument') {
                item.transaction.linked_instrument_input = null;
                item.transaction.linked_instrument_phantom = positionOrder;
                item.transaction.linked_instrument = null;
            }

            if (prop == 'allocation_pl') {
                item.transaction.allocation_pl_input = null;
                item.transaction.allocation_pl_phantom = positionOrder;
                item.transaction.allocation_pl = null;
            }

            if (prop == 'allocation_balance') {
                item.transaction.allocation_balance_input = null;
                item.transaction.allocation_balance_phantom = positionOrder;
                item.transaction.allocation_balance = null;
            }

        }; */

	vm.setItemInstrumentInput = function (item, key, name, prop) {
		if (prop === 'instrument') {
			item[key].instrument_input = name
			item[key].instrument_phantom = null
			item[key].instrument = null
		}
	}

	vm.setItemInstrumentPhantom = function (item, key, positionOrder, prop) {
		if (prop === 'instrument') {
			item[key].instrument_input = null
			item[key].instrument_phantom = positionOrder
			item[key].instrument = null
		}
	}

	/* vm.findPhantoms = function () {
            var result = [];
            vm.entity.actions.forEach(function (action, $index) {
                action.positionOrder = $index;
                if (action.instrument !== null) {
                    result.push(action);
                }
            });
            return result;
        }; */

	/* vm.findEventSchedulePhantoms = function () {
            var result = [];
            vm.entity.actions.forEach(function (action, $index) {
                action.positionOrder = $index;
                if (action.instrument_event_schedule !== null) {
                    result.push(action);
                }
            });
            return result;
        };

		vm.findEventSchedulePhantoms = sharedLogic.findEventSchedulePhantoms;

        vm.loadRelation = function (field) {

            ;
            field = field.replace(/-/g, "_");

            return new Promise(function (resolve, reject) {
                if (!vm.relationItems[field]) {

                    fieldResolverService.getFields(field).then(function (data) {
                        vm.relationItems[field] = data.data;

                        $scope.$apply();

                        resolve(vm.relationItems[field]);
                    })
                } else {

                    resolve(vm.relationItems[field]);
                }

            })
        }; */
	vm.loadRelation = sharedLogic.loadRelation

	vm.getNameByValueType = function (value) {
		for (var i = 0; i < vm.valueTypes.length; i++) {
			if (vm.valueTypes[i].value === value) {
				return vm.valueTypes[i].display_name
			}
		}
	}

	vm.getNameByContentType = function (contentType) {
		for (var i = 0; i < vm.contentTypes.length; i++) {
			if (vm.contentTypes[i].key === contentType) {
				return vm.contentTypes[i].name
			}
		}
	}

	/* vm.getInputTemplates = function () {

            vm.readyStatus.input_templates = false;

            return uiService.getTemplateLayoutList({filters: {type: 'input_template'}}).then(function (data) {

                vm.inputTemplates = data.results;

                vm.readyStatus.input_templates = true;

                $scope.$apply();

            })

        }; */

	vm.getFieldTemplates = function () {
		vm.readyStatus.field_templates = false

		return uiService
			.getTemplateLayoutList({ filters: { type: 'field_template' } })
			.then(function (data) {
				vm.fieldTemplates = data.results

				vm.readyStatus.field_templates = true

				$scope.$apply()
			})
	}

	vm.getActionTemplates = function () {
		vm.readyStatus.action_templates = false

		return new Promise(function (res) {
			sharedLogic
				.getActionTemplates()
				.then(function (actionTemplatesData) {
					vm.actionTemplatesPopupData = actionTemplatesData

					vm.readyStatus.action_templates = true
					$scope.$apply()

					res()
				})
				.catch(function (error) {
					res()
				})
		})
	}

	/* vm.getActionTemplates = function () {

			vm.readyStatus.action_templates = false;

			return uiService.getTemplateLayoutList({filters: {type: 'action_template'}}).then(function (data) {

				vm.actionTemplatesPopup = data.results;

				vm.readyStatus.action_templates = true;

				$scope.$apply();

			})

		};

		vm.appendFromTemplate = function ($event, template) {

			;

			if (template.type === 'input_template') {

				$mdDialog.show({
					controller: 'InputTemplateLayoutViewerDialogController as vm',
					templateUrl: 'views/dialogs/input-template-layout-viewer-dialog-view.html',
					targetEvent: $event,
					locals: {
						data: {
							template: template
						}
					},
					preserveScope: true,
					autoWrap: true,
					skipHide: true,
					multiple: true
				}).then(function (res) {

					if (res.status === 'agree') {

						var template = res.data.template;

						template.data.inputs.forEach(function (input) {

							vm.entity.inputs.push(input);

						})

					}

				})

			}
			else if (template.type === 'field_template') {

				Object.keys(vm.entity).forEach(function (key) {

					if (key.indexOf('user_text_') !== -1) {
						vm.entity[key] = '';
					}

					if (key.indexOf('user_number_') !== -1) {
						vm.entity[key] = '';
					}

					if (key.indexOf('user_date_') !== -1) {
						vm.entity[key] = '';
					}

				});

				Object.keys(template.data.fields).forEach(function (key) {

					vm.entity[key] = template.data.fields[key];

				})

			}
			else if (template.type === 'action_template') {

				var actionsToAdd = template.data.actions.map(function (action) {

					Object.keys(action).forEach(function (key) {

						if (typeof action[key] === 'object' && action[key] !== null) {

							Object.keys(action[key]).forEach(function (actionItemKey) {

								if (action[key].hasOwnProperty(actionItemKey + '_input')) {

									if (action[key].hasOwnProperty(actionItemKey + '_field_type')) {

										action[key][actionItemKey + '_toggle'] = true;

										setDefaultValueForRelation(action, key, actionItemKey);

										delete action[key][actionItemKey + '_field_type']; // remove template specific properties before adding actions
									}

								}

							})

						}

					});

					return action;
				});

				vm.entity.actions = vm.entity.actions.concat(actionsToAdd);

			}

		}; */
	vm.appendFromTemplate = sharedLogic.appendFromTemplate
	vm.saveAsTemplate = sharedLogic.saveAsTemplate

	/* vm.saveAsTemplate = function ($event, type) {

            $mdDialog.show({
                controller: 'SaveAsDialogController as vm',
                templateUrl: 'views/dialogs/save-as-dialog-view.html',
                parent: angular.element(document.body),
                targetEvent: $event,
                clickOutsideToClose: false,
                preserveScope: true,
                autoWrap: true,
                skipHide: true,
                multiple: true,
                locals: {
                    data: {}
                }
            })
			.then(function (res) {


                if (res.status === 'agree') {

                    var template = {
                        name: '',
                        type: type,
                        data: {}
                    };

                    template.name = res.data.name;

                    if (type === 'input_template') {

                        template.data.inputs = vm.entity.inputs.map(function (item) {

                            return {
                                name: item.name,
                                verbose_name: item.verbose_name,
                                value_type: item.value_type,
                                content_type: item.content_type,
                                value: item.value,
                                value_expr: item.value_expr
                            }

                        })

                    }

                    if (type === 'field_template') {

                        template.data.fields = {};

                        Object.keys(vm.entity).forEach(function (key) {

                            if (key.indexOf('user_text_') !== -1) {
                                template.data.fields[key] = vm.entity[key];
                            }

                            if (key.indexOf('user_number_') !== -1) {
                                template.data.fields[key] = vm.entity[key];
                            }

                            if (key.indexOf('user_date_') !== -1) {
                                template.data.fields[key] = vm.entity[key];
                            }

                        });

                    }

                    if (type === 'action_template') {

                        template.data.actions = vm.entity.actions.map(function (action) {

                            var result = {};

                            Object.keys(action).forEach(function (key) {

                                if (typeof action[key] === 'object' && action[key] !== null) {

                                    result[key] = {};

                                    Object.keys(action[key]).forEach(function (actionItemKey) {

                                        result[key][actionItemKey] = action[key][actionItemKey];

                                        if (action[key].hasOwnProperty(actionItemKey + '_input')) {

                                            result[key][actionItemKey + '_field_type'] = 'input';

                                            if (action[key][actionItemKey + '_toggle']) {
                                                result[key][actionItemKey + '_field_type'] = 'relation';
                                            }

                                            result[key][actionItemKey] = null; // if its relation property
                                        }

                                        if (actionItemKey.indexOf('_input') !== -1) {
                                            result[key][actionItemKey] = null; // if its relation_input property
                                        }

                                        if (actionItemKey.indexOf('_toggle') !== -1) {
                                            delete result[key][actionItemKey]
                                        }

                                        if (actionItemKey.indexOf('_object') !== -1) {
                                            delete result[key][actionItemKey]
                                        }


                                    })


                                } else {
                                    result[key] = action[key];
                                }

                            });

                            return result

                        })

                    }

                    uiService.createTemplateLayout(template).then(function (data) {

                        $mdDialog.show({
                            controller: 'InfoDialogController as vm',
                            templateUrl: 'views/info-dialog-view.html',
                            parent: angular.element(document.body),
                            targetEvent: $event,
                            clickOutsideToClose: false,
                            preserveScope: true,
                            autoWrap: true,
                            skipHide: true,
                            multiple: true,
                            locals: {
                                info: {
                                    title: 'Success',
                                    description: "Template successfully created"
                                }
                            }
                        });

						sharedLogic.getInputTemplates();
                        vm.getFieldTemplates();
                        vm.getActionTemplates();

                    })

                }

            });

        }; */

	vm.userTextFields = []
	vm.userNumberFields = []
	vm.userDateFields = []

	for (var i = 1; i <= 30; i = i + 1) {
		vm.userTextFields.push({
			key: 'user_text_' + i,
		})
	}

	for (var i = 1; i <= 20; i = i + 1) {
		vm.userNumberFields.push({
			key: 'user_number_' + i,
		})
	}

	for (var i = 1; i <= 5; i = i + 1) {
		vm.userDateFields.push({
			key: 'user_date_' + i,
		})
	}

	vm.userTextFields = []
	vm.userNumberFields = []
	vm.userDateFields = []

	for (var i = 1; i <= 30; i = i + 1) {
		vm.userTextFields.push({
			key: 'user_text_' + i,
		})
	}

	for (var i = 1; i <= 20; i = i + 1) {
		vm.userNumberFields.push({
			key: 'user_number_' + i,
		})
	}

	for (var i = 1; i <= 5; i = i + 1) {
		vm.userDateFields.push({
			key: 'user_date_' + i,
		})
	}

	//endregion Transaction type Actions controller

	//region Context Parameters tab
	vm.deleteContextParameter = sharedLogic.deleteContextParameter
	vm.addContextParameter = sharedLogic.addContextParameter
	//endregion Context Parameters tab

	vm.init = function () {
		setTimeout(function () {
			vm.dialogElemToResize = document.querySelector('.ttypeCreationElemToDrag')
		})

		vm.actionsMFEventService = new EventService()

		vm.inputsGridTableDataService = new GridTableDataService()
		vm.inputsGridTableEventService = new GridTableEventService()

		sharedLogic.initGridTableEvents()

		/* ecosystemDefaultService.getList().then(function (data) {
                ecosystemDefaultData = data.results[0];
            }); */
		sharedLogic.loadEcosystemDefaults()

		var attrsProm = vm.getAttributeTypes() // this
		var userFieldsProm = vm.getTransactionUserFields()
		var permissionProm = vm.loadPermissions()
		var getRefTablesPromise = sharedLogic.getReferenceTables()

		vm.getTransactionTypeGroups()
		vm.getPortfolios()
		vm.getInstrumentTypes()

		// vm.getInputTemplates();
		var getInputTemplPromise = sharedLogic.getInputTemplates()
		vm.getFieldTemplates()
		vm.getActionTemplates()

		vm.expressionData = sharedLogic.updateInputFunctions()
		vm.updateContextParameters()

		var allDataPromises = [
			attrsProm,
			userFieldsProm,
			permissionProm,
			getRefTablesPromise,
			getInputTemplPromise,
		]

		Promise.all(allDataPromises).then(function () {
			vm.paneActionsMenuPopups = vm.createSelectorPopupDataForActions()

			var iamdlResult = sharedLogic.initAfterMainDataLoaded() // assembling of grid table and data for multitypeFields inside actions here
			vm.actionsMultitypeFieldsList = iamdlResult.actionsMultitypeFieldsList
			vm.eventPhantomsOpts = iamdlResult.eventPhantomsOpts

			vm.readyStatus.entity = true
			vm.readyStatus.inputs = true
		})
	}

	vm.init()
}
