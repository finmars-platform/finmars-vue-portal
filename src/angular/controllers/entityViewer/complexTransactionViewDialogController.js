/**
 * Created by szhitenev on 19.12.2022.
 */

// import usersGroupService from '../../services/usersGroupService';
// import usersService from '../../services/usersService';

import layoutService from '../../services/entity-data-constructor/layoutService'
import metaService from '../../services/metaService'
import evEditorEvents from '../../services/ev-editor/entityViewerEditorEvents'

import gridHelperService from '../../services/gridHelperService'
import complexTransactionService from '../../services/transaction/complexTransactionService'
import attributeTypeService from '../../services/attributeTypeService'

import EntityViewerEditorDataService from '../../services/ev-editor/entityViewerEditorDataService'
import EntityViewerEditorEventService from '../../services/eventService'

import metaContentTypesService from '../../services/metaContentTypesService'
import tooltipsService from '../../services/tooltipsService'
import colorPalettesService from '../../services/colorPalettesService'

import metaHelper from '../../helpers/meta.helper'
import entityEditorHelper from '../../helpers/entity-editor.helper'
import ComplexTransactionEditorSharedLogicHelper from '../../helpers/entityViewer/sharedLogic/complexTransactionEditorSahredLogicHelper'
import transactionHelper from '../../helpers/transaction.helper'
import transactionTypeService from '../../services/transactionTypeService'
import toastNotificationService from '@/angular/core/services/toastNotificationService'

import uiService from '../../services/uiService'

export default function complexTransactionEditDialogController(
	$scope,
	$mdDialog,
	$bigDrawer,
	$state,
	usersService,
	usersGroupService,
	globalDataService,
	entityType,
	entityId,
	data
) {
	var vm = this
	var sharedLogicHelper = new ComplexTransactionEditorSharedLogicHelper(
		vm,
		$scope,
		$mdDialog
	)

	vm.sharedLogic = sharedLogicHelper

	vm.entityType = entityType
	vm.entityId = entityId

	vm.entity = { $_isValid: true }
	var dataConstructorLayout = []
	var dcLayoutHasBeenFixed = false
	var notCopiedTransaction = true
	var ttypesList

	vm.readyStatus = {
		attrs: false,
		permissions: false,
		entity: false,
		layout: false,
		userFields: false,
	}

	vm.editLayoutEntityInstanceId = null
	vm.editLayoutByEntityInsance = false

	vm.processing = false
	vm.formIsValid = true
	vm.updateTableOnClose = {
		lockedStatusChanged: false,
		cancelStatusChanged: false,
	}

	vm.attrs = []

	vm.userInputs = []
	vm.layoutAttrs = layoutService.getLayoutAttrs()
	vm.entityAttrs = metaService.getEntityAttrs(vm.entityType) || []

	vm.range = gridHelperService.range

	vm.dataConstructorData = { entityType: vm.entityType }

	vm.attributesLayout = []
	vm.fixedAreaAttributesLayout = []

	vm.hasEditPermission = false

	vm.textFields = []
	vm.numberFields = []
	vm.dateFields = []

	vm.transactionInputs = []

	vm.baseTransactions = []
	vm.reconFields = []

	// vm.tabsWithErrors = {};
	// vm.errorFieldsList = [];
	vm.inputsWithCalculations = null

	vm.fieldsDataStore = {}

	vm.openedIn = data.openedIn

	vm.entityTabs = metaService.getEntityTabs(vm.entityType)



	vm.entityTabsMenuTplt = sharedLogicHelper.entityTabsMenuTplt
	vm.entityTabsMenuPopupData = { viewModel: vm }
	vm.entityTablePopupClasses = 'border-radius-2'

	var contentType = metaContentTypesService.findContentTypeByEntity(
		'complex-transaction',
		'ui'
	)

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

		// should be fired after mapAttributesAndFixFieldsLayout()
		// return sharedLogicHelper.fillMissingFieldsByDefaultValues(vm.entity, vm.userInputs, vm.transactionType);
	}

	/**
	 * Changes vm.entity, vm.tabs, vm.userInputs
	 *
	 * @param cTransactionData {Object} - complex transaction data
	 * @returns {Promise<void>} - returns promise after all async functions done
	 */
	var postRebookComplexTransactionActions = function (cTransactionData) {
		/* var keys = Object.keys(cTransactionData.values);

            keys.forEach(item => vm.entity[item] = cTransactionData.values[item]); */
		vm.entity.values = cTransactionData.values

		/* cTransactionData.complex_transaction.attributes.forEach(function (item) {
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
            }); */

		postBookComplexTransactionActions(cTransactionData)
	}

	vm.getFormLayout = function () {
		return new Promise(function (resolve, reject) {
			vm.readyStatus.layout = false

			var contextParameters = vm.getContextParameters()



			transactionTypeService
				.initBookComplexTransaction(vm.transactionTypeId, contextParameters)
				.then(async function (data) {
					vm.transactionType = data.transaction_type_object
					vm.entity = data.complex_transaction

					vm.specialRulesReady = true
					vm.readyStatus.entity = true

					data = vm.mapValuesOnTransactionTypeChange(data)

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

	vm.rearrangeMdDialogActions = function () {
		var dialogWindowWidth = vm.dialogElemToResize.clientWidth

		if (dialogWindowWidth < 905) {
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

	vm.loadPermissions = function () {
		var promises = []

		promises.push(vm.getCurrentMember())
		promises.push(vm.getGroupList())

		Promise.all(promises).then(function (data) {
			var hasTransactionTypeEditAccess = false
			var hasFullViewComplexTransaction = false

			vm.complexTransactionData.transaction_type_object.object_permissions.forEach(
				function (perm) {
					if (perm.permission === 'change_transactiontype') {
						if (vm.currentMember.groups.indexOf(perm.group) !== -1) {
							hasTransactionTypeEditAccess = true
						}
					}
				}
			)

			vm.complexTransactionData.complex_transaction.object_permissions.forEach(
				function (perm) {
					if (perm.permission === 'view_complextransaction') {
						if (vm.currentMember.groups.indexOf(perm.group) !== -1) {
							hasFullViewComplexTransaction = true
						}
					}
				}
			)

			if (hasTransactionTypeEditAccess && hasFullViewComplexTransaction) {
				vm.hasEditPermission = true
			}

			if (vm.currentMember && vm.currentMember.is_admin) {
				vm.hasEditPermission = true
			}

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

	vm.getCurrentMember = function () {
		return usersService.getMyCurrentMember().then(function (data) {
			vm.currentMember = data

			$scope.$apply()
		})
	}

	vm.checkPermissions = function () {
		if (vm.currentMember.is_admin) {
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

	vm.cancel = function () {
		var updateRowIcon = false

		if (
			vm.updateTableOnClose.lockedStatusChanged ||
			vm.updateTableOnClose.cancelStatusChanged
		) {
			updateRowIcon = {
				is_locked: vm.entity.is_locked,
				is_canceled: vm.entity.is_canceled,
			}
		}

		//$mdDialog.hide({status: 'disagree', data: {updateRowIcon: updateRowIcon}});
		var responseObj = {
			status: 'disagree',
			data: { updateRowIcon: updateRowIcon },
		}
		metaHelper.closeComponent(vm.openedIn, $mdDialog, $bigDrawer, responseObj)
	}

	vm.manageAttrs = function (ev) {
		/*var entityType = {entityType: vm.entityType};
            if (vm.fromEntityType) {
                entityType = {entityType: vm.entityType, from: vm.fromEntityType};
            }
            $state.go('app.portal.attributesManager', entityType);
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

	vm.copy = function (windowType) {
		var entity = JSON.parse(JSON.stringify(vm.entity))

		if (windowType === 'big-drawer') {
			const responseObj = {
				status: 'copy',
				data: {
					entity: entity,
					entityType: vm.entityType,
					isCopy: true,
					originalComplexTransaction: vm.originalComplexTransaction,
				},
			}
			return metaHelper.closeComponent(
				vm.openedIn,
				$mdDialog,
				$bigDrawer,
				responseObj
			)
		} else {
			$mdDialog.show({
				controller: 'ComplexTransactionAddDialogController as vm',
				templateUrl:
					'views/entity-viewer/complex-transaction-add-dialog-view.html',
				parent: angular.element(document.body),
				locals: {
					entityType: vm.entityType,
					entity: entity,
					data: {
						originalComplexTransaction: vm.originalComplexTransaction,
						isCopy: true,
					},
				},
			})

			metaHelper.closeComponent(vm.openedIn, $mdDialog, $bigDrawer, {
				status: 'copy',
			})
		}

		//$mdDialog.hide({status: 'disagree'});
	}

	vm.editAsJson = function (ev) {
		$mdDialog
			.show({
				controller: 'EntityAsJsonEditorDialogController as vm',
				templateUrl: 'views/dialogs/entity-as-json-editor-dialog-view.html',
				targetEvent: ev,
				multiple: true,
				locals: {
					data: {
						item: vm.originalComplexTransaction,
						entityType: vm.entityType,
					},
				},
			})
			.then(function (res) {
				if (res.status === 'agree') {
					vm.getItem().then(function () {
						$scope.$apply()
					})
				}
			})
	}

	vm.fillUserFields = function () {
		uiService.getTransactionFieldList({ pageSize: 1000 }).then(function (data) {
			var fieldMap = {}

			data.results.forEach(function (field) {
				fieldMap[field.key] = field.name
			})

			vm.textFields = []
			vm.numberFields = []
			vm.dateFields = []

			for (var i = 1; i < 21; i = i + 1) {
				if (vm.entity['user_text_' + i]) {
					vm.textFields.push({
						key: 'user_text_' + i,
						name: 'User Text ' + i,
						value: vm.entity['user_text_' + i],
					})
				}
			}

			for (var i = 1; i < 21; i = i + 1) {
				if (
					vm.entity['user_number_' + i] ||
					vm.entity['user_number_' + i] === 0
				) {
					vm.numberFields.push({
						key: 'user_number_' + i,
						name: 'User Number ' + i,
						value: vm.entity['user_number_' + i],
					})
				}
			}

			for (var i = 1; i < 6; i = i + 1) {
				if (vm.entity['user_date_' + i]) {
					vm.dateFields.push({
						key: 'user_date_' + i,
						name: 'User Date ' + i,
						value: vm.entity['user_date_' + i],
					})
				}
			}

			vm.textFields = vm.textFields.map(function (item) {
				item.name = fieldMap[item.key]
				return item
			})

			vm.numberFields = vm.numberFields.map(function (item) {
				item.name = fieldMap[item.key]
				return item
			})

			vm.dateFields = vm.dateFields.map(function (item) {
				item.name = fieldMap[item.key]
				return item
			})
		})
	}

	vm.viewBaseTransaction = function ($event, item) {


		$mdDialog.show({
			controller: 'EntityViewerEditDialogController as vm',
			templateUrl: 'views/entity-viewer/entity-viewer-edit-dialog-view.html',
			parent: angular.element(document.body),
			targetEvent: $event,
			preserveScope: true,
			autoWrap: true,
			skipHide: true,
			multiple: true,
			locals: {
				entityType: 'transaction',
				entityId: item.id,
				data: {},
			},
		})
	}

	vm.fillTransactionInputs = function () {
		vm.transactionInputs = []

		Object.keys(vm.complexTransactionData.values).forEach(function (key) {
			var input = {}

			var exists_in_ttype = false

			if (vm.transactionType.inputs) {
				vm.transactionType.inputs.forEach(function (ttypeInput) {
					if (ttypeInput.name === key) {
						exists_in_ttype = true

						input.name = key
						input.verbose_name = ttypeInput.verbose_name
						input.value_type = ttypeInput.value_type

						if (input.value_type === 10) {
							input.verbose_value_type = 'Text'
						}

						if (input.value_type === 20) {
							input.verbose_value_type = 'Number'
						}

						if (input.value_type === 40) {
							input.verbose_value_type = 'Date'
						}

						if (input.value_type === 100) {
							input.verbose_value_type = 'Relation'

							/*if (vm.complexTransactionData.values[key + '_object'].name) {
                                    input.value = vm.complexTransactionData.values[key + '_object'].name
                                } else {
                                    input.value = vm.complexTransactionData.values[key + '_object'].public_name
                                }*/

							if (vm.complexTransactionData.values[key + '_object']) {
								if (vm.complexTransactionData.values[key + '_object'].name) {
									input.value =
										vm.complexTransactionData.values[key + '_object'].name
								} else {
									input.value =
										vm.complexTransactionData.values[
											key + '_object'
										].public_name
								}
							}
						}
					}
				})
			}

			if (exists_in_ttype) {
				input.value = vm.complexTransactionData.values[key]

				vm.transactionInputs.push(input)
			}
		})
	}

	vm.getItem = function () {
		vm.readyStatus.layout = false

		return new Promise(function (resolve, reject) {
			complexTransactionService
				.viewComplexTransaction(vm.entityId)
				.then(async function (cTransactionData) {
					vm.originalComplexTransaction = JSON.parse(
						JSON.stringify(cTransactionData)
					)

					vm.complexTransactionData = cTransactionData

					vm.transactionTypeId = cTransactionData.transaction_type
					vm.transactionType = cTransactionData.transaction_type_object
					vm.editLayoutEntityInstanceId =
						cTransactionData.complex_transaction.id
					vm.entity = cTransactionData.complex_transaction

					vm.baseTransactions = vm.entity.transactions_object
					vm.reconFields = vm.entity.recon_fields

					vm.fillUserFields()
					vm.fillTransactionInputs()

					postRebookComplexTransactionActions(cTransactionData) // vm.tabs changed here

					vm.dataConstructorData = {
						entityType: vm.entityType,
						from: vm.entityType,
						instanceId: vm.transactionTypeId,
					}

					vm.readyStatus.entity = true
					vm.readyStatus.layout = true
					vm.readyStatus.userFields = true

					vm.oldValues = {}

					vm.userInputs.forEach(function (item) {
						vm.oldValues[item.name] = vm.entity[item.name]
					})

					vm.loadPermissions()

					resolve()

					$scope.$apply()
				})
		})
	}

	vm.getAttributeTypes = function () {
		return new Promise(function (resolve, reject) {
			attributeTypeService
				.getList(vm.entityType)
				.then(function (data) {
					vm.attrs = data.results
					vm.readyStatus.attrs = true
					resolve(vm.attrs)
				})
				.catch(function (error) {
					console.error(error)
					resolve([])
				})
		})
	}

	vm.checkReadyStatus = function () {
		return (
			vm.readyStatus.attrs &&
			vm.readyStatus.entity &&
			vm.readyStatus.permissions &&
			vm.readyStatus.layout &&
			vm.readyStatus.userFields
		)
	}

	vm.bindFlex = sharedLogicHelper.bindFlex

	vm.checkFieldRender = function (tab, row, field) {
		if (field.row === row) {
			if (field.type !== 'empty') {
				return true
			} else {
				var spannedCols = []
				var itemsInRow = tab.layout.fields.filter(function (item) {
					return item.row === row
				})

				itemsInRow.forEach(function (item) {
					if (item.type !== 'empty' && item.colspan > 1) {
						var columnsToSpan = item.column + item.colspan - 1

						for (var i = item.column; i <= columnsToSpan; i = i + 1) {
							spannedCols.push(i)
						}
					}
				})

				if (spannedCols.indexOf(field.column) !== -1) {
					return false
				}

				return true
			}
		}

		return false
	}

	vm.checkViewState = function (tab) {
		if (tab.hasOwnProperty('enabled')) {
			if (tab.enabled.indexOf(vm.evAction) === -1) {
				return false
			}
		}

		return true
	}

	vm.toggleLockStatus = function ($event) {
		vm.entity.is_locked = !vm.entity.is_locked

		complexTransactionService
			.updateProperties(vm.entity.id, { is_locked: vm.entity.is_locked })
			.then(function () {
				// ;
				vm.updateTableOnClose.lockedStatusChanged =
					!vm.updateTableOnClose.lockedStatusChanged

				$scope.$apply()
			})
	}

	vm.toggleCancelStatus = function ($event) {
		vm.entity.is_canceled = !vm.entity.is_canceled

		var status = 1
		// Can't return to Pending state in that case
		if (vm.entity.is_canceled) {
			status = 3
		} else {
			status = 1
		}

		complexTransactionService
			.updateProperties(vm.entity.id, {
				is_canceled: vm.entity.is_canceled,
				status: status,
			})
			.then(function () {
				// ;
				vm.updateTableOnClose.cancelStatusChanged =
					!vm.updateTableOnClose.cancelStatusChanged

				$scope.$apply()
			})
	}

	vm.delete = function ($event) {
		$mdDialog
			.show({
				controller: 'EntityViewerDeleteDialogController as vm',
				templateUrl:
					'views/entity-viewer/entity-viewer-entity-delete-dialog-view.html',
				parent: angular.element(document.body),
				targetEvent: $event,
				//clickOutsideToClose: false,
				multiple: true,
				preserveScope: true,
				autoWrap: true,
				skipHide: true,
				locals: {
					entity: vm.entity,
					entityType: vm.entityType,
				},
			})
			.then(function (res) {


				if (res.status === 'agree') {
					var responseObj = { status: 'delete' }
					metaHelper.closeComponent(
						vm.openedIn,
						$mdDialog,
						$bigDrawer,
						responseObj
					)
				}
			})
	}

	vm.updatePermissions = function ($event) {
		var permissions = []

		if (vm.groups) {
			vm.groups.forEach(function (group) {
				if (
					group.objectPermissions &&
					group.objectPermissions.manage === true
				) {
					permissions.push({
						member: null,
						group: group.id,
						permission: 'manage_' + vm.entityType.split('-').join(''),
					})
				}

				if (
					group.objectPermissions &&
					group.objectPermissions.change === true
				) {
					permissions.push({
						member: null,
						group: group.id,
						permission: 'change_' + vm.entityType.split('-').join(''),
					})
				}
			})
		}



		complexTransactionService
			.updateProperties(vm.entity.id, { object_permissions: permissions })
			.then(function () {
				// ;

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
							description: 'Permissions successfully updated',
						},
					},
				})

				$scope.$apply()
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
					vm.readyStatus.attrs = false
					vm.readyStatus.entity = false
					vm.readyStatus.layout = false

					vm.layoutAttrs = layoutService.getLayoutAttrs()
					vm.entityAttrs = metaService.getEntityAttrs(vm.entityType)

					var entityState = JSON.parse(JSON.stringify(vm.entity))

					vm.getItem().then(function () {
						setTimeout(function () {
							vm.entity = entityState
							$scope.$apply()
						}, 0)
					})
				}
			})
	}

	vm.mapValuesOnTransactionTypeChange = function (newBookData) {
		Object.keys(newBookData.values).forEach(function (key) {
			Object.keys(vm.originalComplexTransaction.values).forEach(function (
				ctKey
			) {
				if (key === ctKey) {
					newBookData.values[key] = vm.originalComplexTransaction.values[key]
				}
			})
		})

		return newBookData
	}

	vm.copyUserFieldContent = function (content) {
		metaHelper.copyToBuffer(content)
	}

	vm.init = function () {
		/*
            setTimeout(function () {
                vm.dialogElemToResize = document.querySelector('.cTransactionEditorDialogElemToResize');
            }, 100);
            */

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

		vm.getAttributeTypes().then(function () {
			vm.getItem()
		})
	}

	vm.init()

	// Special case for split-panel
	$scope.splitPanelInit = function (entityType, entityId) {
		vm.entityType = entityType
		vm.entityId = entityId
	}

	vm.openRebookDrawer = function () {
		metaHelper.closeComponent(vm.openedIn, $mdDialog, $bigDrawer, {
			status: 'rebook_transaction',
		})
	}

	vm.onEntityChange = sharedLogicHelper.onFieldChange
}
