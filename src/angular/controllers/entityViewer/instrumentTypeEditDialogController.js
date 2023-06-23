/**
 * Created by szhitenev on 08.12.2021.
 */

// import usersGroupService from '../../services/usersGroupService';
// import usersService from '../../services/usersService';

import layoutService from '../../services/entity-data-constructor/layoutService'
import metaService from '../../services/metaService'
import evEditorEvents from '../../services/ev-editor/entityViewerEditorEvents'

import gridHelperService from '../../services/gridHelperService'
import evHelperService from '../../services/entityViewerHelperService'

import EntityViewerEditorDataService from '../../services/ev-editor/entityViewerEditorDataService'
import EntityViewerEditorEventService from '../../services/eventService'

// import attributeTypeService from '../../services/attributeTypeService';
import metaPermissionsService from '../../services/metaPermissionsService'
import tooltipsService from '../../services/tooltipsService'
import colorPalettesService from '../../services/colorPalettesService'

import metaHelper from '../../helpers/meta.helper'
import entityEditorHelper from '../../helpers/entity-editor.helper'
import EntityViewerEditorSharedLogicHelper from '../../helpers/entityViewer/sharedLogic/entityViewerEditorSharedLogicHelper'

import complexTransactionService from '../../services/transaction/complexTransactionService'

import currencyPricingSchemeService from '../../services/pricing/currencyPricingSchemeService'
import instrumentPricingSchemeService from '../../services/pricing/instrumentPricingSchemeService'

export default function entityViewerEditDialogController(
	$scope,
	$mdDialog,
	$bigDrawer,
	$state,
	toastNotificationService,
	authorizerService,
	usersService,
	usersGroupService,
	metaContentTypesService,
	instrumentService,
	entityResolverService,
	fieldResolverService,
	attributeTypeService,
	uiService,
	entityType,
	entityId,
	data
) {
	var vm = this

	var sharedLogic = new EntityViewerEditorSharedLogicHelper(
		vm,
		$scope,
		$mdDialog,
		$bigDrawer,
		instrumentService,
		entityResolverService,
		fieldResolverService,
		attributeTypeService,
		uiService
	)

	vm.processing = false

	vm.contextData = {}

	if (data.contextData) {
		vm.contextData = data.contextData
	}

	vm.entityType = 'instrument-type'

	vm.entityId = entityId

	vm.entity = { $_isValid: true }
	vm.dataConstructorLayout = {}
	vm.dcLayoutHasBeenFixed = false

	vm.hasEnabledStatus = false
	vm.evEditorEvent = null

	vm.readyStatus = sharedLogic.readyStatusObj

	vm.entityTabs = metaService.getEntityTabs(vm.entityType)

	vm.formIsValid = true

	vm.attributeTypes = []
	vm.layoutAttrs = layoutService.getLayoutAttrs()
	vm.entityAttrs = []

	vm.range = gridHelperService.range

	vm.attributesLayout = []

	vm.currentMember = null

	vm.hasEditPermission = false
	vm.canManagePermissions = false

	vm.attributeTypesByValueTypes = {} // need for pricing tab

	vm.currencies = [] // need for instrument pricing tab;

	vm.action = 'edit'

	vm.pricingConditions = [
		{ id: 1, name: "Don't Run Valuation" },
		{ id: 2, name: 'Run Valuation: if non-zero position' },
		{ id: 3, name: 'Run Valuation: always' },
	]

	vm.activeTab = null

	vm.openedIn = data.openedIn

	vm.exposureCalculationModelSelectorOptions =
		sharedLogic.exposureCalculationModelSelectorOptions
	vm.longUnderlyingExposureSelectorOptions =
		sharedLogic.longUnderlyingExposureSelectorOptions
	vm.shortUnderlyingExposureSelectorOptions =
		sharedLogic.shortUnderlyingExposureSelectorOptions
	vm.positionReportingSelectorOptions =
		sharedLogic.positionReportingSelectorOptions

	var formLayoutFromAbove = data.editLayout

	/* var getShowByDefaultOptions = function (columns, entityType) {
            if (columns > 2 && entityType !== 'instrument' && entityType !== 'account' && entityType !== 'instrument-type') {
                return vm.showByDefaultOptions.filter(option => option.id !== 'short_name')
            }

            return vm.showByDefaultOptions;

        }; */

	vm.entityTabsMenuTplt = sharedLogic.entityTabsMenuTplt
	vm.entityTabsMenuPopupData = { viewModel: vm }
	vm.entityTablePopupClasses = 'border-radius-2'

	//vm.currenciesSorted = [];

	vm.keysOfFixedFieldsAttrs = metaService.getEntityViewerFixedFieldsAttributes(
		vm.entityType
	)

	/* vm.tabsWithErrors = {"system_tab": {}, "user_tab": {}};
        vm.formErrorsList = []; */
	var contentType = metaContentTypesService.findContentTypeByEntity(
		vm.entityType,
		'ui'
	)

	vm.rearrangeMdDialogActions = function () {
		var dialogWindowWidth = vm.dialogElemToResize.clientWidth

		if (dialogWindowWidth < 805) {
			vm.dialogElemToResize.classList.add('two-rows-dialog-actions')
		} else {
			vm.dialogElemToResize.classList.remove('two-rows-dialog-actions')
		}
	}

	var getEntityAttrs = function () {
		vm.entityAttrs = metaService.getEntityAttrs(vm.entityType) || []
	}

	vm.getCurrencies = function () {
		entityResolverService
			.getListLight('currency', { pageSize: 1000 })
			.then(function (data) {
				// Victor 19.10.2020
				//vm.currencies = data.results;
				vm.currencies = metaHelper.textWithDashSort(data.results)
				console.log('vm.currencies', vm.currencies)

				$scope.$apply()
			})
	}

	vm.loadPermissions = function () {
		var promises = []

		promises.push(vm.getCurrentMember())
		promises.push(vm.getCurrentMasterUser())
		promises.push(vm.getGroupList())

		return new Promise(function (resolve, reject) {
			Promise.all(promises)
				.then(function (data) {
					// TODO object_permissions is undefined
					vm.entity.object_permissions &&
						vm.entity.object_permissions.forEach(function (perm) {
							if (
								perm.permission ===
								'change_' + vm.entityType.split('-').join('')
							) {
								if (vm.currentMember.groups.indexOf(perm.group) !== -1) {
									vm.hasEditPermission = true
								}
							}
						})

					if (vm.currentMember && vm.currentMember.is_admin) {
						vm.hasEditPermission = true
						vm.canManagePermissions = true
					}

					vm.readyStatus.permissions = true
					$scope.$apply()

					resolve()
				})
				.catch(function (error) {
					reject(error)
				})
		})
	}

	vm.getGroupList = function () {
		return usersGroupService.getList().then(function (data) {
			vm.groups = data.results.filter(function (item) {
				return item.role === 2
			})

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

								vm.canManagePermissions = true
							}

							if (
								permission.permission ===
								'change_' + vm.entityType.split('-').join('')
							) {
								group.objectPermissions.change = true
							}

							if (
								permission.permission ===
								'view_' + vm.entityType.split('-').join('')
							) {
								group.objectPermissions.view = true
							}
						}
					})
				}
			})
		})
	}

	vm.getCurrentMasterUser = function () {
		return authorizerService.getCurrentMasterUser().then(function (data) {
			vm.currentMasterUser = data
			vm.system_currency = data.system_currency
			vm.systemCurrencies = [data.system_currency_object]

			$scope.$apply()
		})
	}

	vm.getCurrentMember = function () {
		return usersService.getMyCurrentMember().then(function (data) {
			vm.currentMember = data

			$scope.$apply()
		})
	}

	vm.checkPermissions = function () {
		if (
			metaPermissionsService
				.getEntitiesWithDisabledPermissions()
				.indexOf(vm.entityType) !== -1
		) {
			return false
		}

		if (vm.currentMember && vm.currentMember.is_admin) {
			return true
		}

		var permission_code =
			'manage_' + vm.entityType.split('-').join('').toLowerCase()

		var haveAccess = false

		vm.entity.object_permissions.forEach(function (item) {
			if (
				item.permission === permission_code &&
				vm.currentMember.groups.indexOf(item.group) !== -1
			) {
				haveAccess = true
			}
		})

		return haveAccess
	}

	vm.entityTypeSlug = function () {
		return vm.entityType.split('-').join(' ').capitalizeFirstLetter()
	}

	vm.cancel = function () {
		metaHelper.closeComponent(vm.openedIn, $mdDialog, $bigDrawer, {
			status: 'disagree',
		})
	}

	vm.restoreDeleted = function () {
		console.log('Restore deleted here')

		vm.processing = true

		entityResolverService
			.getByKey(vm.entityType, vm.entity.id)
			.then(function (result) {
				var name = result.name.split('(del) ')[1]
				var short_name = result.short_name.split('(del) ')[1]

				var current_user_code = result.user_code

				result.name = name
				result.short_name = short_name
				result.user_code = result.deleted_user_code

				result.is_active = true
				result.is_enabled = true
				result.is_deleted = false

				var entityTypeVerbose = vm.entityType
					.split('-')
					.join(' ')
					.capitalizeFirstLetter()

				entityResolverService
					.update(vm.entityType, result.id, result)
					.then(function (data) {
						toastNotificationService.success(
							entityTypeVerbose +
								' ' +
								result.name +
								' was successfully restored'
						)

						vm.processing = false

						$scope.$apply()

						vm.init()
					})
					.catch(function () {
						result.user_code = current_user_code

						entityResolverService
							.update(vm.entityType, result.id, result)
							.then(function (data) {
								toastNotificationService.success(
									entityTypeVerbose +
										' ' +
										result.name +
										' was successfully restored. Old user code is already in use.'
								)

								vm.processing = false

								$scope.$apply()

								vm.init()
							})
					})
			})
	}

	vm.manageAttrs = sharedLogic.manageAttributeTypes

	var getFooterPopupData = function () {
		var data = {
			options: [],
		}

		data.options.push({
			icon: 'content_copy',
			name: 'Duplicate',
			classes: 'divider-bottom',
			isDisabled: !vm.hasEditPermission,
			onClick: function (option, _$popup) {
				_$popup.cancel()
				vm.copy(vm.openedIn)
			},
		})

		data.options.push({
			icon: 'edit',
			name: 'Edit as JSON',
			onClick: vm.editAsJson,
		})

		data.options.push({
			icon: 'delete',
			name: 'Delete',
			classes: 'divider-top',
			isDisabled: !vm.hasEditPermission,
			onClick: vm.delete,
		})

		return data
	}

	vm.footerPopupData = null

	vm.copy = function (windowType) {
		/*var entity = JSON.parse(JSON.stringify(vm.entity));

            entity["user_code"] = vm.entity["user_code"] + '_copy';
            entity["name"] = vm.entity["name"] + '_copy';

            console.log('copy entity', entity);

			if (windowType === 'big-drawer') {

				const responseObj = {status: 'copy', data: {entity: entity, entityType: vm.entityType}};
				return metaHelper.closeComponent(vm.openedIn, $mdDialog, $bigDrawer, responseObj);

			} else {

				$mdDialog.show({
					controller: 'InstrumentTypeAddDialogController as vm',
					templateUrl: 'views/entity-viewer/instrument-type-add-drawer-view.html',
					parent: angular.element(document.body),
					locals: {
						entityType: vm.entityType,
						entity: entity,
						data: {}
					}
				});

				metaHelper.closeComponent(vm.openedIn, $mdDialog, $bigDrawer, {status: 'copy'});

			}*/

		sharedLogic.copy(windowType, 'InstrumentTypeAddDialogController')
	}

	vm.getItem = function () {
		return new Promise(function (res, rej) {
			entityResolverService
				.getByKey(vm.entityType, vm.entityId)
				.then(function (data) {
					vm.entity = data

					console.log('vm.entity', vm.entity)

					vm.entity.$_isValid = true
					vm.readyStatus.entity = true
					// vm.readyStatus.permissions = true;
					// vm.hasEditPermission = true;

					// vm.getFormLayout();
					sharedLogic
						.getFormLayout(formLayoutFromAbove)
						.then((formLayoutData) => {
							vm.typeSelectorOptions = formLayoutData.typeSelectorOptions // list of instrument classes

							vm.attributeTypes = formLayoutData.attributeTypes
							vm.entity.attributes = formLayoutData.attributes

							vm.tabs = formLayoutData.tabs

							vm.attributesLayout = formLayoutData.attributesLayout

							vm.readyStatus.layout = true
							vm.readyStatus.entity = true

							// Resolving promise to inform child about end of editor building
							res()
						})
				})
		})
	}

	vm.checkReadyStatus = sharedLogic.checkReadyStatus
	vm.bindFlex = sharedLogic.bindFlex
	vm.checkFieldRender = sharedLogic.checkFieldRender

	vm.checkViewState = function (tab) {
		if (tab.hasOwnProperty('enabled')) {
			if (tab.enabled.indexOf(vm.evAction) === -1) {
				return false
			}
		}

		return true
	}

	vm.handleErrors = function (data) {
		$mdDialog.show({
			controller: 'ValidationDialogController as vm',
			templateUrl: 'views/dialogs/validation-dialog-view.html',
			multiple: true,
			locals: {
				validationData: {
					errorData: data,
					tableColumnsNames: ['Name of fields', 'Error Cause'],
				},
			},
		})
	}

	vm.updateEntityBeforeSave = function () {
		if (!vm.entity.instrument_factor_schedule_data) {
			vm.entity.instrument_factor_schedule_data = ''
		}

		/*if (vm.entity.attributes) {

                vm.entity.attributes.forEach(function (attribute) {

                    var value_type = attribute.attribute_type_object.value_type;
                    var key = attribute.attribute_type_object.user_code;

                    if (value_type === 10) {
                        attribute.value_string = vm.entity[key];
                    }
                    if (value_type === 20) {
                        attribute.value_float = vm.entity[key];
                    }
                    if (value_type === 30) {
                        attribute.classifier = vm.entity[key];
                    }
                    if (value_type === 40) {
                        attribute.value_date = vm.entity[key];
                    }

                })

            }*/

		vm.entity.object_permissions = []

		if (vm.groups) {
			vm.groups.forEach(function (group) {
				if (
					group.objectPermissions &&
					group.objectPermissions.manage === true
				) {
					vm.entity.object_permissions.push({
						member: null,
						group: group.id,
						permission: 'manage_' + vm.entityType.split('-').join(''),
					})
				}

				if (
					group.objectPermissions &&
					group.objectPermissions.change === true
				) {
					vm.entity.object_permissions.push({
						member: null,
						group: group.id,
						permission: 'change_' + vm.entityType.split('-').join(''),
					})
				}

				if (group.objectPermissions && group.objectPermissions.view === true) {
					vm.entity.object_permissions.push({
						member: null,
						group: group.id,
						permission: 'view_' + vm.entityType.split('-').join(''),
					})
				}
			})
		}
	}

	vm.updateItem = function () {
		console.log('updateItem', vm.entity.$_isValid)

		// TMP save method for instrument

		return new Promise(function (resolve) {
			vm.updateEntityBeforeSave()

			vm.entity.$_isValid = entityEditorHelper.checkForNotNullRestriction(
				vm.entity,
				vm.entityAttrs,
				vm.attributeTypes
			)

			var result = entityEditorHelper.removeNullFields(vm.entity, vm.entityType)

			entityResolverService
				.update(vm.entityType, result.id, result)
				.then(function (data) {
					resolve(data)
				})
		})
	}

	vm.delete = sharedLogic.deleteEntity

	vm.toggleEnableStatus = function () {
		vm.entity.is_enabled = !vm.entity.is_enabled

		entityResolverService
			.getByKey(vm.entityType, vm.entity.id)
			.then(function (result) {
				result.is_enabled = vm.entity.is_enabled

				entityResolverService
					.update(vm.entityType, result.id, result)
					.then(function (data) {
						// getEntityStatus();
						$scope.$apply()
					})
			})
	}

	vm.entityStatusChanged = function () {
		entityResolverService
			.getByKey(vm.entityType, vm.entity.id)
			.then(function (result) {
				switch (vm.entityStatus) {
					case 'enabled':
						result.is_enabled = true
						result.is_deleted = false
						vm.entity.is_enabled = true
						vm.entity.is_deleted = false
						break

					case 'disabled':
						result.is_enabled = false
						result.is_deleted = false
						vm.entity.is_enabled = false
						vm.entity.is_deleted = false
						break

					case 'deleted':
						result.is_deleted = true
						vm.entity.is_deleted = true
						break
				}

				entityResolverService
					.update(vm.entityType, result.id, result)
					.then(function (data) {
						$scope.$apply()
					})
			})
	}

	/* var getEntityStatus = function () {

			vm.entityStatus = 'enabled';

			if (!vm.entity.is_enabled) {
				vm.entityStatus = 'disabled';
			}

			if (vm.entity.is_deleted) {
				vm.entityStatus = 'deleted';
			}

        }; */

	vm.saveAndApplyPermissionsToInstrumentsByGroup =
		sharedLogic.saveAndApplyPermissionsToInstrumentsByGroup
	vm.switchPricingPolicyParameter = sharedLogic.switchPricingPolicyParameter

	vm.editAsJson = function (option, _$popup, ev) {
		_$popup.cancel()

		sharedLogic.editAsJsonDialog(ev).then(function (res) {
			if (res.status === 'agree') {
				vm.readyStatus.entity = false

				vm.getItem().then(function () {
					vm.evEditorDataService.setEntityAttributeTypes(vm.attributeTypes)
					$scope.$apply()
				})
			}
		})
	}

	vm.save = function ($event, isAutoExitAfterSave) {
		vm.updateEntityBeforeSave()

		var errors = entityEditorHelper.validateEntity(
			vm.entity,
			vm.entityType,
			vm.tabs,
			[],
			vm.entityAttrs,
			vm.attributeTypes
		)

		/* if (entityType === 'instrument-type') {

                vm.entity.accruals.forEach(accrual => {

                    if (accrual.name.trim() === '') {

                        errors.push({
                            fieldName: `#${accrual.order + 1}`,
                            message: 'Empty name',
                            locationData : {type: 'tab', name: 'Accruals', validatorText: 'Tab accruals'}

                        })

                    }

                });

            } */

		if (errors.length) {
			// sharedLogic.processTabsErrors(errors, $event);

			entityEditorHelper.processTabsErrorsInstrumentType(
				errors,
				vm.evEditorDataService,
				vm.evEditorEventService,
				$mdDialog,
				$event,
				vm.fixedAreaPopup
			)
		} else {
			// var result = entityEditorHelper.removeNullFields(vm.entity, vm.entityType);
			var result = entityEditorHelper.clearEntityBeforeSave(
				vm.entity,
				vm.entityType
			)

			if (vm.dcLayoutHasBeenFixed) {
				uiService.updateEditLayout(
					vm.dataConstructorLayout.id,
					vm.dataConstructorLayout
				)
			}

			vm.processing = true

			entityResolverService
				.update(vm.entityType, result.id, result)
				.then(function (responseData) {
					vm.processing = false

					if (responseData.status === 400) {
						vm.handleErrors(responseData)
					} else {
						var entityTypeVerbose = vm.entityType
							.split('-')
							.join(' ')
							.capitalizeFirstLetter()
						toastNotificationService.success(
							entityTypeVerbose +
								' ' +
								vm.entity.name +
								' was successfully saved'
						)

						if (isAutoExitAfterSave) {
							let responseObj = { status: 'agree', data: responseData }
							metaHelper.closeComponent(
								vm.openedIn,
								$mdDialog,
								$bigDrawer,
								responseObj
							)
						} else {
							vm.entity = { ...vm.entity, ...responseData }
							vm.evEditorEventService.dispatchEvent(
								evEditorEvents.ENTITY_UPDATED
							)

							vm.entity.$_isValid = true
							$scope.$apply()
						}
					}
				})
				.catch(function (data) {
					vm.processing = false
					vm.handleErrors(data)
				})
		}
	}

	vm.recalculatePermissions = function ($event) {
		vm.updateItem().then(function (value) {
			var config = {}

			// TODO make it recursive like transaction import

			complexTransactionService
				.recalculatePermissionTransaction(config)
				.then(function (value) {
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
								description:
									'Transaction Permissions successfully recalculated',
							},
						},
					})
				})
		})
	}

	vm.recalculateAccountPermissions = function ($event) {
		vm.updateItem().then(function (value) {
			entityResolverService
				.getList('account', { pageSize: 1000 })
				.then(function (data) {
					var accountsWithPermissions = data.results.map(function (item) {
						return {
							id: item.id,
							object_permissions: item.type_object.object_permissions.map(
								function (item) {
									item.permission = item.permission.split('_')[0] + '_account'

									return item
								}
							),
						}
					})

					entityResolverService
						.updateBulk('account', accountsWithPermissions)
						.then(function () {
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
										description: 'Accounts Permissions successfully updated',
									},
								},
							})
						})
				})
		})
	}

	vm.recalculateAccountWithTransactionPermissions = function ($event) {
		vm.updateItem().then(function (value) {
			entityResolverService
				.getList('account', { pageSize: 1000 })
				.then(function (data) {
					var accountsWithPermissions = data.results.map(function (item) {
						return {
							id: item.id,
							object_permissions: item.type_object.object_permissions.map(
								function (item) {
									item.permission = item.permission.split('_')[0] + '_account'

									return item
								}
							),
						}
					})

					entityResolverService
						.updateBulk('account', accountsWithPermissions)
						.then(function () {
							complexTransactionService
								.recalculatePermissionTransaction()
								.then(function (value) {
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
												description:
													'Accounts Permissions and Transaction Permissions successfully updated',
											},
										},
									})
								})
						})
				})
		})
	}

	vm.recalculateInstrumentsPermissions = function ($event) {
		vm.updateItem().then(function (value) {
			entityResolverService
				.getList('instrument', { pageSize: 1000 })
				.then(function (data) {
					var instrumentsWithPermissions = data.results.map(function (item) {
						return {
							id: item.id,
							object_permissions:
								item.instrument_type_object.object_permissions.map(function (
									item
								) {
									item.permission =
										item.permission.split('_')[0] + '_instrument'

									return item
								}),
						}
					})

					entityResolverService
						.updateBulk('instrument', instrumentsWithPermissions)
						.then(function () {
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
										description: 'Instrument Permissions successfully updated',
									},
								},
							})
						})
				})
		})
	}

	vm.generateCurrencyAttributeTypesByValueTypes = function () {
		vm.attributeTypesByValueTypes = {
			10: [],
			20: [],
			40: [],
		}

		vm.attributeTypesByValueTypes[10] =
			vm.attributeTypesByValueTypes[10].concat(
				vm.attributeTypes
					.filter(function (item) {
						return item.value_type === 10
					})
					.map(function (item) {
						return {
							name: item.name,
							user_code: 'attributes.' + item.user_code,
						}
					})
			)

		vm.attributeTypesByValueTypes[20] =
			vm.attributeTypesByValueTypes[20].concat(
				vm.attributeTypes
					.filter(function (item) {
						return item.value_type === 20
					})
					.map(function (item) {
						return {
							name: item.name,
							user_code: 'attributes.' + item.user_code,
						}
					})
			)

		vm.attributeTypesByValueTypes[40] =
			vm.attributeTypesByValueTypes[40].concat(
				vm.attributeTypes
					.filter(function (item) {
						return item.value_type === 40
					})
					.map(function (item) {
						return {
							name: item.name,
							user_code: 'attributes.' + item.user_code,
						}
					})
			)

		console.log('vm.attributeTypesByValueTypes', vm.attributeTypesByValueTypes)
	}

	vm.getCurrencyPricingSchemes = function () {
		currencyPricingSchemeService.getList().then(function (data) {
			vm.currencyPricingSchemes = data.results

			vm.generateCurrencyAttributeTypesByValueTypes()

			$scope.$apply()
		})
	}

	vm.generateInstrumentAttributeTypesByValueTypes = function () {
		vm.attributeTypesByValueTypes = {
			10: [
				{
					name: 'Reference For Pricing',
					user_code: 'reference_for_pricing',
				},
			],
			20: [
				{
					name: 'Default Price',
					user_code: 'default_price',
				},
			],
			40: [
				{
					name: 'Maturity Date',
					user_code: 'maturity_date',
				},
			],
		}

		vm.attributeTypesByValueTypes[10] =
			vm.attributeTypesByValueTypes[10].concat(
				vm.attributeTypes
					.filter(function (item) {
						return item.value_type === 10
					})
					.map(function (item) {
						return {
							name: item.name,
							user_code: 'attributes.' + item.user_code,
						}
					})
			)

		vm.attributeTypesByValueTypes[20] =
			vm.attributeTypesByValueTypes[20].concat(
				vm.attributeTypes
					.filter(function (item) {
						return item.value_type === 20
					})
					.map(function (item) {
						return {
							name: item.name,
							user_code: 'attributes.' + item.user_code,
						}
					})
			)

		vm.attributeTypesByValueTypes[40] =
			vm.attributeTypesByValueTypes[40].concat(
				vm.attributeTypes
					.filter(function (item) {
						return item.value_type === 40
					})
					.map(function (item) {
						return {
							name: item.name,
							user_code: 'attributes.' + item.user_code,
						}
					})
			)
	}

	vm.getInstrumentPricingSchemes = function () {
		instrumentPricingSchemeService.getList().then(function (data) {
			vm.instrumentPricingSchemes = data.results

			vm.generateInstrumentAttributeTypesByValueTypes()

			console.log('instrumentPricingSchemes', vm.instrumentPricingSchemes)

			$scope.$apply()
		})
	}

	vm.getEntityPricingSchemes = vm.getInstrumentPricingSchemes

	/* vm.pricingSchemeChange = function ($event, item) {

            item.pricing_scheme_object = null;
            item.default_value = null;
            item.attribute_key = null;
            item.data = null;

			vm.instrumentPricingSchemes.forEach(function (scheme) {

				if (scheme.id === item.pricing_scheme) {

					item.pricing_scheme_object = scheme;
				}

			})

            if (item.pricing_scheme_object && item.pricing_scheme_object.type_settings) {

                item.data = item.pricing_scheme_object.type_settings.data;
                item.attribute_key = item.pricing_scheme_object.type_settings.attribute_key;
                item.default_value = item.pricing_scheme_object.type_settings.default_value;

            }

            vm.entity.pricing_policies = vm.entity.pricing_policies.map(function (policy) {

                if (policy.id === item.id) {
                    return Object.assign({}, item);
                }

                return policy

            })

        }; */
	vm.pricingSchemeChange = function (pricingPolicy) {
		evHelperService.onPricingSchemeChangeInsidePricingPolicy(
			pricingPolicy,
			vm.instrumentPricingSchemes,
			vm.entity
		)
	}

	//region Exposure tab

	/* vm.instrumentTypeInstrumentsSelectorOptions = []
		vm.instrumentTypeCurrenciesSelectorOptions = []

		vm.getDataForExposureTab = function () {

			entityResolverService.getListLight('instrument', {pageSize: 1000}).then(function (data){

				vm.instrumentTypeInstrumentsSelectorOptions = data.results.map(function (item){
					return {
						id: item.user_code,
						name: item.name
					}
				})

			})

			entityResolverService.getListLight('currency', {pageSize: 1000}).then(function (data){

				vm.instrumentTypeCurrenciesSelectorOptions = data.results.map(function (item){
					return {
						id: item.user_code,
						name: item.name
					}
				})

			})


		}


        vm.exposureCalculationModelSelectorOptions = [
            {id: 1, name: "Market Value"},
            {id: 2, name: "Price exposure"},
            {id: 3, name: "Delta adjusted price exposure"},
            {id: 4, name: "Underlying long short exposure net"},
            {id: 5, name: "Underlying long short exposure split"},
        ];

        vm.longUnderlyingExposureSelectorOptions = [
            {id: 1, name: "Zero"},
            {id: 2, name: "Long Underlying Instrument Price Exposure"},
            {id: 3, name: "Long Underlying Instrument Price Delta"},
            {id: 4, name: "Long Underlying Currency FX Rate Exposure"},
            {id: 5, name: "Long Underlying Currency FX Rate Delta-adjusted Exposure"},
        ]

        vm.shortUnderlyingExposureSelectorOptions = [
            {id: 1, name: "Zero"},
            {id: 2, name: "Short Underlying Instrument Price Exposure"},
            {id: 3, name: "Short Underlying Instrument Price Delta"},
            {id: 4, name: "Short Underlying Currency FX Rate Exposure"},
            {id: 5, name: "Short Underlying Currency FX Rate Delta-adjusted Exposure"},
        ]

        vm.positionReportingSelectorOptions = [
            {
                id: 1,
                name: 'Direct Position'
            },
            {
                id: 2,
                name: 'Factor-adjusted Position'
            },
            {
                id: 3,
                name: 'Do not show'
            }
        ] */

	//endregion < Exposure tab >

	vm.typeSelectorChange = null
	vm.groupSelectorChange = null

	vm.openPricingMultipleParametersDialog = function ($event, item) {
		$mdDialog
			.show({
				controller: 'PricingMultipleParametersDialogController as vm',
				templateUrl:
					'views/dialogs/pricing/pricing-multiple-parameter-dialog-view.html',
				parent: angular.element(document.body),
				targetEvent: $event,
				clickOutsideToClose: false,
				preserveScope: true,
				autoWrap: true,
				skipHide: true,
				multiple: true,
				locals: {
					data: {
						item: item,
						entityType: vm.entityType,
						attributeTypes: vm.attributeTypes,
					},
				},
			})
			.then(function (res) {
				if (res.status === 'agree') {
					item.data = res.data.item.data
				}
			})
	}

	vm.runPricingInstrument = function ($event) {
		$mdDialog
			.show({
				controller: 'RunPricingInstrumentDialogController as vm',
				templateUrl:
					'views/dialogs/pricing/run-pricing-instrument-dialog-view.html',
				parent: angular.element(document.body),
				targetEvent: $event,
				clickOutsideToClose: false,
				preserveScope: true,
				autoWrap: true,
				skipHide: true,
				multiple: true,
				locals: {
					data: {
						instrument: vm.entity,
						contextData: vm.contextData,
					},
				},
			})
			.then(function (res) {
				if (res.status === 'agree') {
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
								description: 'Pricing Process Initialized.',
							},
						},
					})
				}
			})
	}

	vm.runPricingCurrency = function ($event) {
		$mdDialog
			.show({
				controller: 'RunPricingCurrencyDialogController as vm',
				templateUrl:
					'views/dialogs/pricing/run-pricing-currency-dialog-view.html',
				parent: angular.element(document.body),
				targetEvent: $event,
				clickOutsideToClose: false,
				preserveScope: true,
				autoWrap: true,
				skipHide: true,
				multiple: true,
				locals: {
					data: {
						currency: vm.entity,
						contextData: vm.contextData,
					},
				},
			})
			.then(function (res) {
				if (res.status === 'agree') {
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
								description: 'Pricing Process Initialized.',
							},
						},
					})
				}
			})
	}

	vm.onEntityChange = function (fieldKey) {
		if (fieldKey) {
			var attributes = {
				entityAttrs: vm.entityAttrs,
				attrsTypes: vm.attributeTypes,
			}

			entityEditorHelper.checkTabsForErrorFields(
				fieldKey,
				vm.evEditorDataService,
				attributes,
				vm.entity,
				vm.entityType,
				vm.tabs
			)
		}
	}

	vm.onNameInputBlur = function () {
		if (vm.entity.name && !vm.entity.short_name) {
			var entityName = vm.entity.name
			vm.entity.short_name = entityName

			$scope.$apply()
		}
	}

	vm.saveBtnDisabled = function () {
		const disabled = !vm.formIsValid || !vm.hasEditPermission || vm.processing

		return disabled || !vm.entity.is_enabled
	}

	//region Instrument Type Layout Settings tab start
	vm.instrLayoutsFromItype = []

	const getInstrumentFormLayouts = sharedLogic.getInstrumentFormLayouts
	vm.instrumentTypeMoveLayoutUp = sharedLogic.instrumentTypeMoveLayoutUp
	vm.instrumentTypeMoveLayoutDown = sharedLogic.instrumentTypeMoveLayoutDown
	vm.instrumentTypeDeleteInstrLayout =
		sharedLogic.instrumentTypeDeleteInstrLayout
	vm.addInstrLayoutToInstrumentType = sharedLogic.addInstrLayoutToInstrumentType
	vm.editInstrFormLayout = sharedLogic.editInstrFormLayout
	vm.createInstrFormLayout = sharedLogic.createInstrFormLayout

	//endregion Instrument Type Layout Settings tab end

	vm.init = function () {
		setTimeout(function () {
			vm.dialogElemToResize = sharedLogic.onEditorStart()
		}, 100)

		vm.evEditorDataService = new EntityViewerEditorDataService()
		vm.evEditorEventService = new EntityViewerEditorEventService()

		vm.evEditorDataService.setLocationsWithErrors(null)
		vm.evEditorDataService.setFormErrorsList([])

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

		vm.statusSelectorOptions = [
			{
				id: 'enabled',
				name: 'Enabled',
			},
			{
				id: 'disabled',
				name: 'Disabled',
			},
			{
				id: 'deleted',
				name: 'Deleted',
			},
		]

		getEntityAttrs()
		vm.getCurrencies()

		// vm.getItem().then(async function () {
		var exposureTabProm = new Promise(function (resolve) {
			sharedLogic.getDataForInstrumentExposureTab().then(function (data) {
				vm.instrumentsSelectorOptions = data[0]
				vm.currenciesSelectorOptions = data[1]
				resolve()
			})
		})

		Promise.allSettled([
			getInstrumentFormLayouts(),
			vm.getItem(),
			exposureTabProm,
		]).then(function () {
			vm.loadPermissions().then(function () {
				vm.footerPopupData = getFooterPopupData() // have to be called after vm.loadPermissions()
			})

			if (vm.entity.instrument_form_layouts) {
				// vm.instrLayoutsFromItype = vm.entity.instrument_form_layouts.split(',')
				vm.instrLayoutsFromItype = vm.entity.instrument_form_layouts
					.split(',')
					.map((userCode) => {
						return vm.instrumentFormLayouts.find(
							(ifLayout) => ifLayout.user_code === userCode
						)
					})
					.filter((ifLayout) => ifLayout) // filter out not found layouts
			}

			sharedLogic.getDailyPricingModelFields().then((data) => {
				vm.dailyPricingModelFields = data
			})

			sharedLogic.getCurrencyFields().then((data) => {
				vm.currencyFields = data
			})

			// vm.getDataForInstrumentTypeTabs();

			// getEntityStatus();

			vm.evEditorDataService.setEntityAttributeTypes(vm.attributeTypes)

			$scope.$apply()
		})
	}

	vm.init()

	// Special case for split-panel
	$scope.splitPanelInit = function (entityType, entityId) {
		vm.entityType = entityType
		vm.entityId = entityId
	}

	/*vm.onEntityChange = function () {

            console.log("entityChange", vm);

        };*/
}
