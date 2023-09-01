/**
 * Created by szhitenev on 05.05.2016.
 */

// import usersGroupService from '../../services/usersGroupService';
// import usersService from '../../services/usersService';

import layoutService from '../../services/entity-data-constructor/layoutService'
import metaService from '../../services/metaService'
import evEditorEvents from '../../services/ev-editor/entityViewerEditorEvents'

import gridHelperService from '../../services/gridHelperService'
import complexTransactionService from '../../services/transaction/complexTransactionService'

import EntityViewerEditorDataService from '../../services/ev-editor/entityViewerEditorDataService'
import EntityViewerEditorEventService from '../../services/eventService'

import tooltipsService from '../../services/tooltipsService'
import colorPalettesService from '../../services/colorPalettesService'

import metaHelper from '../../helpers/meta.helper'
import entityEditorHelper from '../../helpers/entity-editor.helper'
import ComplexTransactionEditorSharedLogicHelper from '../../helpers/entityViewer/sharedLogic/complexTransactionEditorSahredLogicHelper'
import transactionHelper from '../../helpers/transaction.helper'
import transactionTypeService from '../../services/transactionTypeService'

import uiService from '../../services/uiService'

export default function complexTransactionEditDialogController(
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
	vm.previewMode = !!data.previewMode

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
		vm.entity.values = cTransactionData.values

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

	vm.loadTransactionTypes = function () {
		var options = {
			pageSize: 1000,
		}

		// transactionTypeService.getList(options).then(function (data) {
		transactionTypeService.getListLight(options).then(function (data) {
			ttypesList = data.results
			vm.transactionGroups = getTransactionGroups(ttypesList)

			vm.favTTypeOpts = getFavoriteTTypeOptions(vm.transactionGroups)

			vm.readyStatus.transactionTypes = true

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

	// let recalculateTimeoutID;

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

			book.id = vm.entityId
			book.complex_transaction = vm.entity

			var recalcProm = complexTransactionService.recalculateComplexTransaction(
				book.id,
				book
			)
			sharedLogicHelper.processRecalculationResolve(
				recalcProm,
				inputs,
				paramsObj.recalculationData
			)
		}
	}

	/*vm.recalculateInputs = function (paramsObj) {

            var inputs = paramsObj.inputs;

            rebookComplexTransaction(inputs);

        };*/

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
			let cTransactionDataProm

			if (vm.previewMode) {
				cTransactionDataProm = complexTransactionService.viewComplexTransaction(
					vm.entityId
				)
			} else {
				cTransactionDataProm =
					complexTransactionService.initRebookComplexTransaction(vm.entityId)
			}

			cTransactionDataProm.then(async function (cTransactionData) {
				vm.originalComplexTransaction = JSON.parse(
					JSON.stringify(cTransactionData)
				)

				vm.complexTransactionData = cTransactionData

				vm.transactionTypeId = cTransactionData.transaction_type
				vm.transactionType = cTransactionData.transaction_type_object
				vm.editLayoutEntityInstanceId = cTransactionData.complex_transaction.id
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

	vm.handleComplexTransactionErrors = function ($event, data) {
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

	vm.rebook = async function ($event) {
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
			/* vm.tabsWithErrors = {};

                errors.forEach(function (errorObj) {

                    if (errorObj.locationData &&
                        errorObj.locationData.type === 'tab') {

                        var tabName = errorObj.locationData.name.toLowerCase();

                        var selectorString = ".tab-name-elem[data-tab-name='" + tabName + "']";

                        var tabNameElem = document.querySelector(selectorString);
                        tabNameElem.classList.add('error-tab');

                        if (!vm.tabsWithErrors.hasOwnProperty(tabName)) {
                            vm.tabsWithErrors[tabName] = [errorObj.key];

                        } else if (vm.tabsWithErrors[tabName].indexOf(errorObj.key) < 0) {
                            vm.tabsWithErrors[tabName].push(errorObj.key);

                        }

                        vm.errorFieldsList.push(errorObj.key);

                    }

                }); */
			// sharedLogicHelper.processTabsErrors(errors);
			entityEditorHelper.processTabsErrors(
				errors,
				vm.evEditorDataService,
				vm.evEditorEventService,
				$mdDialog,
				$event
			)

			/* vm.evEditorEventService.dispatchEvent(evEditorEvents.MARK_FIELDS_WITH_ERRORS);

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
		} else {
			var result = entityEditorHelper.removeNullFields(vm.entity, vm.entityType)

			result.values = {}

			result.values = sharedLogicHelper.mapUserInputsOnEntityValues(
				result.values
			)
			/* vm.userInputs.forEach(function (userInput) {

                    if (userInput !== null) {
                        var keys = Object.keys(vm.entity);

                        keys.forEach(function (key) {
                            if (key === userInput.name) {
                                result.values[userInput.name] = vm.entity[userInput.name];
                            }
                        });
                    }
                }); */

			result.store = true
			result.calculate = true

			vm.processing = true

			new Promise(function (resolve, reject) {
				complexTransactionService
					.initRebookComplexTransaction(result.id)
					.then(function (data) {
						var originValues = JSON.parse(JSON.stringify(result.values))

						result.values = data.values
						result.complex_transaction = data.complex_transaction // ?
						result.complex_transaction.is_locked = result.is_locked // ?
						result.complex_transaction.is_canceled = result.is_canceled // ?

						var originValuesKeys = Object.keys(originValues)
						var defaultValuesKeys = Object.keys(result.values)

						originValuesKeys.forEach(function (originVal) {
							defaultValuesKeys.forEach(function (defaultVal) {
								if (originVal === defaultVal) {
									result.values[defaultVal] = originValues[originVal]
								}
							})
						})

						result.process_mode = 'rebook'
						result.complex_transaction_status = 1 // status PRODUCTION

						if (dcLayoutHasBeenFixed) {
							vm.transactionType.book_transaction_layout = dataConstructorLayout

							transactionTypeService.update(
								vm.transactionType.id,
								vm.transactionType
							)
						}

						complexTransactionService
							.rebookComplexTransaction(result.id, result)
							.then(function (data) {
								toastNotificationService.success(
									'Transaction was successfully rebooked'
								)

								vm.processing = false

								resolve(data)
							})
							.catch(function (data) {
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
											/* if (response.reaction === 'cancel') {
                                            // do nothing
                                        } */

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
											} else if (
												response.reaction === 'book_without_unique_code'
											) {
												// TODO refactor here
												// 2 (BOOK_WITHOUT_UNIQUE_CODE, ugettext_lazy('Book without Unique Code ')),

												result.uniqueness_reaction = 2

												vm.processing = true

												transactionTypeService
													.bookComplexTransaction(
														result.transaction_type,
														result
													)
													.then(function (data) {
														vm.processing = false

														toastNotificationService.success(
															'Transaction was successfully booked'
														)

														resolve(data)
													})
											} else if (response.reaction === 'overwrite') {
												// TODO refactor here
												//  3 (OVERWRITE, ugettext_lazy('Overwrite')),

												result.uniqueness_reaction = 3

												vm.processing = true

												transactionTypeService
													.bookComplexTransaction(
														result.transaction_type,
														result
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
											},
										},
									})

									reject(data)
								}
							})
					})
			})
				.then(function (data) {
					if (data.hasOwnProperty('has_errors') && data.has_errors === true) {
						vm.handleComplexTransactionErrors($event, data)
					} else {
						metaHelper.closeComponent(vm.openedIn, $mdDialog, $bigDrawer, {
							status: 'agree',
							data: data,
						})
					}
				})
				.catch(function (reason) {
					vm.processing = false
					$scope.$apply()
				})
		}
	}

	vm.rebookAsIgnored = async function ($event) {
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
			/* vm.tabsWithErrors = {};

                errors.forEach(function (errorObj) {

                    if (errorObj.locationData &&
                        errorObj.locationData.type === 'tab') {

                        var tabName = errorObj.locationData.name.toLowerCase();

                        var selectorString = ".tab-name-elem[data-tab-name='" + tabName + "']";

                        var tabNameElem = document.querySelector(selectorString);
                        tabNameElem.classList.add('error-tab');

                        if (!vm.tabsWithErrors.hasOwnProperty(tabName)) {
                            vm.tabsWithErrors[tabName] = [errorObj.key];

                        } else if (vm.tabsWithErrors[tabName].indexOf(errorObj.key) < 0) {
                            vm.tabsWithErrors[tabName].push(errorObj.key);

                        }

                        vm.errorFieldsList.push(errorObj.key);

                    }

                }); */
			// sharedLogicHelper.processTabsErrors(errors);
			entityEditorHelper.processTabsErrors(
				errors,
				vm.evEditorDataService,
				vm.evEditorEventService,
				$mdDialog,
				$event
			)

			/* vm.evEditorEventService.dispatchEvent(evEditorEvents.MARK_FIELDS_WITH_ERRORS);

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
		} else {
			var result = entityEditorHelper.removeNullFields(vm.entity, vm.entityType)

			result.values = {}

			result.values = sharedLogicHelper.mapUserInputsOnEntityValues(
				result.values
			)
			/* vm.userInputs.forEach(function (userInput) {

                    if (userInput !== null) {
                        var keys = Object.keys(vm.entity);

                        keys.forEach(function (key) {
                            if (key === userInput.name) {
                                result.values[userInput.name] = vm.entity[userInput.name];
                            }
                        });
                    }
                }); */

			result.store = true
			result.calculate = true

			vm.processing = true

			new Promise(function (resolve, reject) {
				complexTransactionService
					.initRebookComplexTransaction(result.id)
					.then(function (data) {
						var originValues = JSON.parse(JSON.stringify(result.values))

						result.values = data.values
						result.complex_transaction = data.complex_transaction // ?
						result.complex_transaction.is_locked = result.is_locked // ?
						result.complex_transaction.is_canceled = result.is_canceled // ?

						var originValuesKeys = Object.keys(originValues)
						var defaultValuesKeys = Object.keys(result.values)

						originValuesKeys.forEach(function (originVal) {
							defaultValuesKeys.forEach(function (defaultVal) {
								if (originVal === defaultVal) {
									result.values[defaultVal] = originValues[originVal]
								}
							})
						})

						result.process_mode = 'rebook'
						result.complex_transaction_status = 3 // status IGNORED

						if (dcLayoutHasBeenFixed) {
							vm.transactionType.book_transaction_layout = dataConstructorLayout

							transactionTypeService.update(
								vm.transactionType.id,
								vm.transactionType
							)
						}

						complexTransactionService
							.rebookComplexTransaction(result.id, result)
							.then(function (data) {
								toastNotificationService.success(
									'Transaction was successfully rebooked'
								)

								vm.processing = false

								resolve(data)
							})
							.catch(function (data) {
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
											if (response.reaction === 'cancel') {
												resolve(data)
											} else if (response.reaction === 'skip') {
												metaHelper.closeComponent(
													vm.openedIn,
													$mdDialog,
													$bigDrawer,
													{
														status: 'agree',
														data: null,
													}
												)
											} else if (
												response.reaction === 'book_without_unique_code'
											) {
												// TODO refactor here
												// 2 (BOOK_WITHOUT_UNIQUE_CODE, ugettext_lazy('Book without Unique Code ')),

												result.uniqueness_reaction = 2

												vm.processing = true

												transactionTypeService
													.bookComplexTransaction(
														result.transaction_type,
														result
													)
													.then(function (data) {
														vm.processing = false

														toastNotificationService.success(
															'Transaction was successfully booked'
														)

														resolve(data)
													})
											} else if (response.reaction === 'overwrite') {
												// TODO refactor here
												//  3 (OVERWRITE, ugettext_lazy('Overwrite')),

												result.uniqueness_reaction = 3

												vm.processing = true

												transactionTypeService
													.bookComplexTransaction(
														result.transaction_type,
														result
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
											},
										},
									})

									reject(data)
								}
							})
					})
			})
				.then(function (data) {
					if (data.hasOwnProperty('has_errors') && data.has_errors === true) {
						vm.handleComplexTransactionErrors($event, data)
					} else {
						metaHelper.closeComponent(vm.openedIn, $mdDialog, $bigDrawer, {
							status: 'agree',
							data: data,
						})
					}
				})
				.catch(function (reason) {
					vm.processing = false
					$scope.$apply()
				})
		}
	}

	vm.rebookAsPending = async function ($event) {


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
			// if (hasProhibitNegNums.length === 0) {

			var result = entityEditorHelper.removeNullFields(vm.entity, vm.entityType)

			/*result.values = {};

                 vm.userInputs.forEach(function (userInput) {

                    if (userInput !== null) {
                        var keys = Object.keys(vm.entity);
                        keys.forEach(function (key) {
                            if (key === userInput.name) {
                                result.values[userInput.name] = vm.entity[userInput.name];
                            }
                        });
                    }
                }); */
			result.values = sharedLogicHelper.mapUserInputsOnEntityValues(
				result.values
			)

			vm.processing = true

			result.store = true
			result.calculate = true

			new Promise(function (resolve, reject) {
				complexTransactionService
					.initRebookPendingComplexTransaction(result.id)
					.then(function (data) {
						var originValues = JSON.parse(JSON.stringify(result.values))

						// entity.transactions = data.transactions;
						result.values = data.values
						result.complex_transaction = data.complex_transaction // ?

						var originValuesKeys = Object.keys(originValues)
						var defaultValuesKeys = Object.keys(result.values)

						originValuesKeys.forEach(function (originVal) {
							defaultValuesKeys.forEach(function (defaultVal) {
								if (originVal === defaultVal) {
									result.values[defaultVal] = originValues[originVal]
								}
							})
						})

						complexTransactionService
							.rebookPendingComplexTransaction(result.id, result)
							.then(function (data) {
								toastNotificationService.success(
									'Transaction was successfully rebooked'
								)

								vm.processing = false

								resolve(data)
							})
					})
			})
				.then(function (data) {
					if (data.hasOwnProperty('has_errors') && data.has_errors === true) {
						vm.handleComplexTransactionErrors($event, data)
					} else {
						metaHelper.closeComponent(vm.openedIn, $mdDialog, $bigDrawer, {
							status: 'agree',
						})
					}
				})
				.catch(function (reason) {
					vm.processing = false

					$scope.$apply()
				})

			// } else {
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

	vm.viewHistory = function ($event) {
		var content_type = 'transactions.complextransaction'

		var user_code = null

		if (vm.entity.transaction_unique_code) {
			user_code = vm.entity.transaction_unique_code
		} else if (vm.entity.code) {
			user_code = vm.entity.code
		}

		$mdDialog.show({
			controller: 'HistoryDialogController as vm',
			templateUrl: 'views/dialogs/history-dialog-view.html',
			// targetEvent: ev,
			multiple: true,
			locals: {
				data: {
					id: vm.entity.id,
					user_code: user_code,
					content_type: content_type,
					entityType: vm.entityType,
				},
			},
		})
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

		if (!vm.previewMode) vm.loadTransactionTypes()
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
