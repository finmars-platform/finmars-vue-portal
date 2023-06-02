import referenceTableService from '@/angular/services/referenceTablesService'

import metaHelper from '../../meta.helper'

import gridTableEvents from '@/angular/services/gridTableEvents'
import directiveEvents from '@/angular/services/events/directivesEvents'

import helpExpressionsService from '@/angular/services/helpExpressionsService'
;('use strict')

export default function (
	viewModel,
	$scope,
	$mdDialog,
	ecosystemDefaultService,
	uiService,
	fieldResolverService,
	gridTableHelperService
) {
	// const gridTableHelperService = new GridTableHelperService();
	const loadedRelationsList = []

	const valueTypes = [
		{
			name: 'Number',
			id: 20,
		},
		{
			name: 'String',
			id: 10,
		},
		{
			name: 'Date',
			id: 40,
		},
		{
			name: 'Relation',
			id: 100,
		},
		{
			name: 'Selector',
			id: 110,
		},
		{
			name: 'Button',
			id: 120,
		},
	]
	let ecosystemDefaultData = {}

	const getValueTypes = function () {
		return valueTypes
	}

	const contextProperties = {
		'instruments.instrument': [
			{
				id: 'context_instrument',
				name: 'Context Instrument',
			},

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
				id: 'context_pricing_currency',
				name: 'Context Pricing Currency',
			},
			{
				id: 'context_accrued_currency',
				name: 'Context Accrued Currency',
			},
			{
				id: 'context_currency',
				name: 'Context Currency',
			},
		],
		'portfolios.portfolio': [
			{
				id: 'context_portfolio',
				name: 'Context Portfolio',
			},
		],
		'accounts.account': [
			{
				id: 'context_account',
				name: 'Context Account',
			},
		],
		'strategies.strategy1': [
			{
				id: 'context_strategy1',
				name: 'Context Strategy 1',
			},
		],
		'strategies.strategy2': [
			{
				id: 'context_strategy2',
				name: 'Context Strategy 2',
			},
		],
		'strategies.strategy3': [
			{
				id: 'context_strategy3',
				name: 'Context Strategy 3',
			},
		],
	}

	const getContextProperties = function () {
		return contextProperties
	}

	const onActionAccordionCollapse = function (index, id) {
		removeEmptySpaceFromAction(id)
	}

	const toggleItem = function (pane, item, $index, $event) {
		$event.stopPropagation()

		if (!$event.target.classList.contains('ttype-action-notes-input')) {
			pane.toggle()
			item.isPaneExpanded = !item.isPaneExpanded
		}
	}

	const updateInputFunctions = function () {
		viewModel.expressionData.groups[0] = {
			name: '<b>Inputs</b>',
			key: 'input',
		}

		if (viewModel.entity.inputs.length) {
			viewModel.expressionData.functions[0] = viewModel.entity.inputs.map(
				function (input) {
					return {
						name: 'Input: ' + input.verbose_name + ' (' + input.name + ')',
						description:
							'Transaction Type Input: ' +
							input.verbose_name +
							' (' +
							input.name +
							') ',
						groups: 'input',
						func: input.name,
						validation: {
							func: input.name,
						},
					}
				}
			)
		} else {
			viewModel.expressionData.functions[0] = []
		}

		return viewModel.expressionData
	}

	const updateContextParametersFunctions = function () {
		viewModel.expressionData.groups[1] = {
			name: '<b>Context Parameters</b>',
			key: 'context_parameters',
		}

		if (viewModel.entity.context_parameters.length) {
			viewModel.expressionData.functions[1] =
				viewModel.entity.context_parameters.map(function (cParam) {
					return {
						name:
							'Context Parameter: ' +
							cParam.name +
							' (' +
							cParam.user_code +
							')',
						description:
							'Transaction Type Context Parameter: ' +
							cParam.name +
							' (' +
							cParam.user_code +
							')',
						groups: 'context_parameters',
						func: cParam.user_code,
						validation: {
							func: cParam.user_code,
						},
					}
				})
		} else {
			viewModel.expressionData.functions[1] = []
		}
	}

	// const useIdForRelList = ['pricing_condition', 'payment_size_detail', 'accrual_calculation_model', 'notification_class', 'event_class', 'periodicity'];

	const formatRelationForSelector = function (key, relationsList) {
		if (key === 'transaction_class') {
			// relations with specific properties to use as 'id' or (and) 'name'

			return relationsList.map((rItem) => {
				return { id: rItem.id, name: rItem.name }
			})
		}

		// const propForId = useIdForRelList.includes(key) ? 'id' : 'user_code';

		return relationsList.map((rItem) => {
			return {
				id: rItem.user_code,
				name: rItem.hasOwnProperty('short_name')
					? rItem.short_name
					: rItem.name,
			}
		})
	}
	// needed because back does not send _object for selected transaction_class

	const loadRelation = function (field, noScopeUpdate) {
		field = field.replace(/-/g, '_') // replace all '_' with '-'
		/* if (!loadedRelationsList.includes(field)) {

				return new Promise(function (resolve, reject) {

					fieldResolverService.getFields(field).then(function (data) {

						viewModel.relationItems[field] = formatRelationForSelector(field, data.data);

						loadedRelationsList.push(field);

						if (noScopeUpdate) {
							$scope.$apply();
						}

						resolve(viewModel.relationItems[field]);
					})

				});

			}

			return {status: 'item_exist', field: field}; */
		return new Promise(function (resolve, reject) {
			if (loadedRelationsList.includes(field)) {
				resolve(viewModel.relationItems[field])
			} else {
				fieldResolverService
					.getFields(field)
					.then(function (data) {
						viewModel.relationItems[field] = formatRelationForSelector(
							field,
							data.data
						)

						loadedRelationsList.push(field)

						if (noScopeUpdate) {
							$scope.$apply()
						}

						resolve(viewModel.relationItems[field])
					})
					.catch((error) => reject(error))
			}
		})
	}

	const resolveRelation = function (contentType) {
		var entityKey

		for (var i = 0; i < viewModel.contentTypes.length; i++) {
			if (viewModel.contentTypes[i].key === contentType) {
				entityKey = viewModel.contentTypes[i].entity

				if (entityKey === 'strategy-1') {
					return 'strategy1'
				} else if (entityKey === 'strategy-2') {
					return 'strategy2'
				} else if (entityKey === 'strategy-3') {
					return 'strategy3'
				} else {
					entityKey = entityKey.replace(/-/g, '_')

					return entityKey
				}
			}
		}
	}

	const getReferenceTables = function () {
		return referenceTableService.getList().then(function (data) {
			viewModel.referenceTables = data.results.map(function (rTable) {
				return { id: rTable.name, name: rTable.name }
			})
		})
	}

	const getInputTemplates = function () {
		viewModel.readyStatus.input_templates = false

		return uiService
			.getTemplateLayoutList({ filters: { type: 'input_template' } })
			.then(function (data) {
				viewModel.inputTemplates = data.results

				viewModel.readyStatus.input_templates = true

				$scope.$apply()
			})
	}

	/**
	 *
	 * @param actions {Array|Object} - list of actions or a single action
	 */
	const insertActions = function (actions) {
		const insertAction = function (action) {
			viewModel.entity.actions.push(action)
			/*const multitypeFieldsData = getMultitypeFieldsDataForAction(action);

                viewModel.actionsMultitypeFieldsList.push(multitypeFieldsData);*/
		}

		if (Array.isArray(actions)) {
			// add multiple actions

			actions.forEach(function (action) {
				insertAction(action)
			})
		} else {
			// add single action
			insertAction(actions)
		}

		// viewModel.findPhantoms();
		viewModel.actionsMultitypeFieldsList = createDataForMultitypeFieldsList(
			viewModel.entity.actions
		)

		viewModel.eventPhantomsOpts = findPhantoms('instrument_event_schedule')

		viewModel.paneActionsMenuPopups = createSelectorPopupDataForActions() // update selectors with options-phantoms

		setTimeout(function () {
			$scope.$apply()
			viewModel.actionsMFEventService.dispatchEvent(
				directiveEvents.FIELD_TYPES_DATA_CHANGED
			)
		}, 0)
	}

	var actionFieldsByType = {
		transaction: [
			'account_cash',
			'account_cash_input',
			'account_interim',
			'account_interim_input',
			'account_position',
			'account_position_input',
			'accounting_date',
			'allocation_balance',
			'allocation_balance_input',
			'allocation_balance_phantom',
			'allocation_pl',
			'allocation_pl_input',
			'allocation_pl_phantom',
			'carry_with_sign',
			'cash_consideration',
			'cash_date',
			'counterparty',
			'counterparty_input',
			'factor',
			'instrument',
			'instrument_input',
			'instrument_phantom',
			'linked_instrument',
			'linked_instrument_input',
			'linked_instrument_phantom',
			'notes',
			'overheads_with_sign',
			'portfolio',
			'portfolio_input',
			'position_size_with_sign',
			'principal_with_sign',
			'reference_fx_rate',
			'responsible',
			'responsible_input',
			'settlement_currency',
			'settlement_currency_input',
			'strategy1_cash',
			'strategy1_cash_input',
			'strategy1_position',
			'strategy1_position_input',
			'strategy2_cash',
			'strategy2_cash_input',
			'strategy2_position',
			'strategy2_position_input',
			'strategy3_cash',
			'strategy3_cash_input',
			'strategy3_position',
			'strategy3_position_input',
			'trade_price',
			'transaction_class',
			'transaction_currency',
			'transaction_currency_input',
		],
		instrument: [
			'accrued_currency',
			'accrued_currency_input',
			'accrued_multiplier',
			'pricing_condition',
			'pricing_condition_input',
			'default_accrued',
			'default_price',
			'instrument_type',
			'instrument_type_input',
			'maturity_date',
			'maturity_price',
			'name',
			'notes',
			'payment_size_detail',
			'payment_size_detail_input',
			'price_multiplier',
			'pricing_currency',
			'pricing_currency_input',
			'public_name',
			'reference_for_pricing',
			'short_name',
			'user_code',
			'user_text_1',
			'user_text_2',
			'user_text_3',
		],
		instrument_accrual_calculation_schedules: [
			'accrual_calculation_model',
			'accrual_calculation_model_input',
			'accrual_size',
			'accrual_start_date',
			'first_payment_date',
			'instrument',
			'instrument_input',
			'instrument_phantom',
			'notes',
			'periodicity',
			'periodicity_input',
			'periodicity_n',
		],
		instrument_event_schedule: [
			'description',
			'effective_date',
			'event_class',
			'event_class_input',
			'final_date',
			'instrument',
			'instrument_input',
			'instrument_phantom',
			'is_auto_generated',
			'name',
			'notification_class',
			'notification_class_input',
			'notify_in_n_days',
			'periodicity',
			'periodicity_input',
			'periodicity_input',
		],
		instrument_event_schedule_action: [
			'button_position',
			'event_schedule',
			'event_schedule_input',
			'event_schedule_phantom',
			'is_book_automatic',
			'is_sent_to_pending',
			'text',
			'transaction_type_from_instrument_type',
		],
		/* 'instrument_manual_pricing_formula': [
				'expr', 'instrument', 'instrument_input', 'instrument_phantom', 'notes', 'pricing_policy', 'pricing_policy_input'
			], */
		instrument_factor_schedule: [
			'instrument',
			'instrument_input',
			'instrument_phantom',
			'effective_date',
			'factor_value',
		],
		execute_command: ['expr'],
	}

	const createNewAction = (actionType) => {
		var actionToAdd = {
			isPaneExpanded: true,
			frontOptions: {
				id: metaHelper.generateUniqueId(viewModel.entity.user_code),
			},
		}

		actionToAdd[actionType] = {}

		actionFieldsByType[actionType].forEach(function (key) {
			actionToAdd[actionType][key] = ''

			if (
				actionType === 'instrument_event_schedule_action' &&
				(key === 'event_schedule' || key === 'event_schedule_input')
			) {
				actionToAdd[actionType][key] = null
			}
		})

		return actionToAdd
	}

	const addAction = function (actionType) {
		viewModel.accordion.collapseAll()

		var result = createNewAction(actionType)

		insertActions(result)

		// findPhantoms('instrument');
	}

	const getActionPaneId = function (action) {
		const actionId = action.id ? action.id : action.frontOptions.id

		return 'ttype-action-' + actionId
	}

	const generateOperationPopupData = {
		options: [
			{
				key: 'transaction',
				name: 'Create base transaction',
			},
			{
				key: 'instrument',
				name: 'Create instrument',
			},
			{
				key: 'execute_command',
				name: 'Execute command',
			},
		],
		selectOption: function (option, _$popup) {
			_$popup.cancel()
			addAction(option.key)
		},
	}

	const generateInstrumentOperationPopupData = {
		options: [
			{
				key: 'instrument_factor_schedule',
				name: 'Create factor',
			},
			/* {
					key: "instrument_manual_pricing_formula",
					name: "Create pricing"
				}, */
			{
				key: 'instrument_accrual_calculation_schedules',
				name: 'Create accrual',
			},
			{
				key: 'instrument_event_schedule',
				name: 'Create event',
			},
			{
				key: 'instrument_event_schedule_action',
				name: 'Create Event Action',
			},
		],
		selectOption: function (option, _$popup) {
			_$popup.cancel()

			addAction(option.key)
		},
	}

	const getActionTemplates = function () {
		return new Promise((resolve, reject) => {
			uiService
				.getTemplateLayoutList({ filters: { type: 'action_template' } })
				.then(function (data) {
					let actionTemplatesPopupData = {}
					const actionTemplates = data.results

					actionTemplatesPopupData = {
						selectOption: function (option, _$popup, $event) {
							_$popup.cancel()

							const templateToAppend = actionTemplates.find(
								(template) => template.id === option.key
							)

							appendFromTemplate($event, templateToAppend)
						},
					}

					actionTemplatesPopupData.options = actionTemplates.map(function (
						template
					) {
						return { key: template.id, name: template.name }
					})

					resolve(actionTemplatesPopupData)
				})
				.catch((error) => reject(error))
		})
	}

	const removeInputFromActions = function (deletedInputName) {
		viewModel.inputsToDelete.push(deletedInputName)

		viewModel.entity.actions.forEach(function (action) {
			var actionKeys = Object.keys(action)

			actionKeys.forEach(function (actionKey) {
				if (typeof action[actionKey] === 'object' && action[actionKey]) {
					// check if it is property that contains actions field data

					var actionType = action[actionKey]
					var actionTypeKeys = Object.keys(actionType)

					var i
					for (i = 0; i < actionTypeKeys.length; i++) {
						var key = actionTypeKeys[i]
						var actionFieldValue = actionType[key]

						if (
							key.length > 7 &&
							key.indexOf('_input') === key.length - 6 &&
							actionFieldValue === deletedInputName
						) {
							// if field is input fields

							actionType[key] = null
						}
					}
				}
			})
		})
	}

	const updateEntityBeforeSave = function (entity) {
		if (viewModel.groups) {
			viewModel.groups.forEach(function (group) {
				if (
					group.objectPermissions &&
					group.objectPermissions.manage === true
				) {
					entity.object_permissions.push({
						member: null,
						group: group.id,
						permission: 'manage_' + viewModel.entityType.split('-').join(''),
					})
				}

				if (
					group.objectPermissions &&
					group.objectPermissions.change === true
				) {
					entity.object_permissions.push({
						member: null,
						group: group.id,
						permission: 'change_' + viewModel.entityType.split('-').join(''),
					})
				}

				if (group.objectPermissions && group.objectPermissions.view === true) {
					entity.object_permissions.push({
						member: null,
						group: group.id,
						permission: 'view_' + viewModel.entityType.split('-').join(''),
					})
				}
			})
		}

		entity.inputs.forEach(function (input) {
			if (input.settings) {
				if (input.settings.linked_inputs_names) {
					input.settings.linked_inputs_names =
						input.settings.linked_inputs_names.join(',')
				}

				if (input.settings.recalc_on_change_linked_inputs) {
					input.settings.recalc_on_change_linked_inputs =
						input.settings.recalc_on_change_linked_inputs.join(',')
				}
			}
		})

		entity.actions = entity.actions.map((action) =>
			replacePhantomsValues(action, 'index')
		)

		entity = metaHelper.clearFrontendOptions(entity)

		return entity
	}

	//region desc="TRANSACTION VALIDATION"
	const hasInputInExprs = function (inputs, expr, namesOnly) {
		var inputsList = []
		/* var middleOfExpr = '[^A-Za-z_.]' + dInputName + '(?![A-Za-z1-9_])';
                    var beginningOfExpr = '^' + dInputName + '(?![A-Za-z1-9_])'; */
		for (var i = 0; i < inputs.length; i++) {
			var inputName = inputs[i]

			if (!namesOnly) {
				inputName = inputs[i].name
			}

			var inputRegExp = new RegExp(
				'(?:^|[^A-Za-z_.])' + inputName + '(?![A-Za-z1-9_])',
				'g'
			)

			if (expr.match(inputRegExp)) {
				inputsList.push(inputs[i])
			}
		}

		if (inputsList.length) {
			return inputsList
		}

		return false
	}

	const checkFieldExpr = function (
		inputsToDelete,
		fieldValue,
		itemKey,
		location
	) {
		var actionFieldLocation = {
			action_notes: location,
			key: itemKey, // for actions errors
			name: itemKey, // for entity errors
		}

		var validationResult = helpExpressionsService.validateExpressionOnFrontend(
			{ expression: fieldValue },
			viewModel.expressionData
		)

		if (validationResult.status) {
			var dInputsNames = hasInputInExprs(inputsToDelete, fieldValue, true)

			if (dInputsNames) {
				var dInputsNames = dInputsNames.join(', ')
				var stringStart = 'The deleted input'

				if (dInputsNames.length > 1) {
					stringStart += 's'
				}

				actionFieldLocation.message =
					stringStart + ' ' + dInputsNames + ' is used in the Expression.'
			} else {
				switch (validationResult.status) {
					case 'error':
						actionFieldLocation.message =
							'Invalid expression.\n Expression: ' + validationResult.result
						break

					case 'functions-error':
						actionFieldLocation.message =
							'Not all variables are identified expression.\n Expression: ' +
							validationResult.result
						break

					case 'inputs-error':
						actionFieldLocation.message =
							'Not all variables are identified inputs.\n Expression: ' +
							validationResult.result
						break

					case 'bracket-error':
						actionFieldLocation.message =
							'Mismatch in the opening and closing braces.\n Expression: ' +
							validationResult.result
						break
				}
			}

			return actionFieldLocation
		}
	}

	const actionsFieldsMap = {
		instrument_event_schedule_action: {
			transaction_type_from_instrument_type: {
				field_type: 'selector',
				value_type: 10,
			},
			event_schedule_phantom: {
				field_type: 'selector',
				value_type: 20,
			},
		},
	}

	const checkActionsForEmptyFields = function (actions) {
		var result = []

		actions.forEach(function (action) {
			var actionKeys = Object.keys(action)

			actionKeys.forEach(function (actionKey) {
				if (typeof action[actionKey] === 'object' && action[actionKey]) {
					// check if it is property that contains actions field data

					var actionItem = action[actionKey]
					var actionItemKeys = Object.keys(actionItem)

					actionItemKeys = actionItemKeys.filter(function (key) {
						return (
							key.indexOf('_object') === -1 &&
							key.indexOf('_input') === -1 &&
							key.indexOf('_phantom') === -1 &&
							key !== 'action_notes' &&
							key !== 'price_download_scheme'
						)
					})

					actionItemKeys.forEach(function (actionItemKey) {
						var fieldWithInvalidExpr

						if (actionItemKey === 'notes') {
							if (actionItem[actionItemKey]) {
								fieldWithInvalidExpr = checkFieldExpr(
									viewModel.inputsToDelete,
									actionItem[actionItemKey],
									actionItemKey,
									action.action_notes
								)
							}
						} else {
							if (actionItem.hasOwnProperty(actionItemKey + '_input')) {
								var inputValue = actionItem[actionItemKey + '_input']
								var relationValue = actionItem[actionItemKey]

								var valueIsEmpty = false

								if (actionItem.hasOwnProperty(actionItemKey + '_phantom')) {
									var phantomValue = actionItem[actionItemKey + '_phantom']

									if (
										!inputValue &&
										!relationValue &&
										(phantomValue === null || phantomValue === undefined)
									) {
										valueIsEmpty = true
									}
								} else {
									if (!inputValue && !relationValue) {
										valueIsEmpty = true
									}
								}

								if (valueIsEmpty) {
									result.push({
										action_notes: action.action_notes,
										key: actionItemKey,
										value: actionItem[actionItemKey],
									})
								}
							} else {
								if (
									actionItem[actionItemKey] === null ||
									actionItem[actionItemKey] === undefined ||
									actionItem[actionItemKey] === ''
								) {
									result.push({
										action_notes: action.action_notes,
										key: actionItemKey,
										value: actionItem[actionItemKey],
									})
								} else if (
									actionItem[actionItemKey] &&
									typeof actionItem[actionItemKey] === 'string'
								) {
									// field with expression

									var actionFieldsMap = actionsFieldsMap[actionKey]
									if (actionFieldsMap)
										var actionFieldData = actionFieldsMap[actionItemKey]

									if (
										!actionFieldData ||
										actionFieldData.field_type === 'expression'
									) {
										fieldWithInvalidExpr = checkFieldExpr(
											viewModel.inputsToDelete,
											actionItem[actionItemKey],
											actionItemKey,
											action.action_notes
										)
									}
								}
							}
						}

						if (fieldWithInvalidExpr) {
							result.push(fieldWithInvalidExpr)
						}
					})
				}
			})

			if (!action.action_notes) {
				result.push({
					action_notes: action.action_notes,
					key: 'action_notes',
					value: '',
				})
			}
		})

		return result
	}

	const validateUserFields = function (entity, inputsToDelete, result) {
		var entityKeys = Object.keys(entity)

		entityKeys.forEach(function (entityKey) {
			if (
				(entityKey.indexOf('user_text_') === 0 ||
					entityKey.indexOf('user_number_') === 0 ||
					entityKey.indexOf('user_date_') === 0) &&
				entity[entityKey]
			) {
				const userFieldName = viewModel.transactionUserFields[entityKey]

				var fieldWithInvalidExpr = checkFieldExpr(
					inputsToDelete,
					entity[entityKey],
					userFieldName,
					'FIELDS'
				)

				if (fieldWithInvalidExpr) {
					result.push(fieldWithInvalidExpr)
				}
			}
		})
	}

	const checkEntityForEmptyFields = function (entity) {
		var result = []

		if (
			entity.name === null ||
			entity.name === undefined ||
			entity.name === ''
		) {
			result.push({
				action_notes: 'General',
				key: 'name',
				name: 'Name',
				value: entity.name,
			})
		}

		if (
			entity.user_code === null ||
			entity.user_code === undefined ||
			entity.user_code === ''
		) {
			result.push({
				action_notes: 'General',
				key: 'user_code',
				name: 'User code',
				value: entity.user_code,
			})
		}

		if (
			entity.display_expr === null ||
			entity.display_expr === undefined ||
			entity.display_expr === ''
		) {
			result.push({
				action_notes: 'General',
				key: 'display_expr',
				name: 'Display Expression',
				value: entity.display_expr,
			})
		}

		if (
			entity.date_expr === null ||
			entity.date_expr === undefined ||
			entity.date_expr === ''
		) {
			result.push({
				action_notes: 'General',
				key: 'date_expr',
				name: 'Complex Transaction Date',
				value: entity.date_expr,
			})
		}

		if (entity.group === null || entity.group === undefined) {
			result.push({
				action_notes: 'General',
				key: 'group',
				name: 'Group',
				value: entity.group,
			})
		}

		validateUserFields(entity, viewModel.inputsToDelete, result)

		return result
	}

	const validateInputs = function (inputs) {
		var errors = []

		inputs.forEach(function (input) {
			var location

			if (input.value_type !== 100 && input.value) {
				// Default value

				var defaultExprError

				var inputsList = hasInputInExprs(viewModel.entity.inputs, input.value)

				inputsList = [] // why forbbiden?

				if (inputsList.length) {
					defaultExprError = {
						action_notes: 'INPUTS: ' + input.name,
						key: 'Default value',
						name: 'Default value',
					}

					defaultExprError.message =
						'Using Inputs in expression for the default value is forbidden. Please use the formula which you are using in the Input (to which you are referring) instead.'
				} else {
					location = 'INPUTS: ' + input.name
					defaultExprError = checkFieldExpr(
						viewModel.inputsToDelete,
						input.value,
						'Default value',
						location
					)
				}

				if (defaultExprError) {
					errors.push(defaultExprError)
				}
			}

			if (input.value_expr) {
				location = 'INPUTS: ' + input.name
				var inputExprError = checkFieldExpr(
					viewModel.inputsToDelete,
					input.value_expr,
					'Input expr',
					location
				)

				if (inputExprError) {
					errors.push(inputExprError)
				}
			}
		})

		return errors
	}
	//endregion

	//region desc="INPUTS GRID TABLE"
	const onInputsGridTableRowAddition = function () {
		var newRow = viewModel.inputsGridTableData.body[0]

		var newInput = {
			name: null,
			verbose_name: null,
			value_type: null,
			content_type: null,
			is_fill_from_context: false,
			reference_table: null,
			account: null,
			instrument_type: null,
			instrument: null,
			currency: null,
			counterparty: null,
			responsible: null,
			portfolio: null,
			strategy1: null,
			strategy2: null,
			strategy3: null,
			pricing_condition: null,
			payment_size_detail: null,
			pricing_policy: null,
			value: null,
			value_expr: null,
			settings: {},
		}

		newInput.name = newRow.key

		// if there is is_fill_from_context, enable it
		var fillFromContext = gridTableHelperService.getCellFromRowByKey(
			newRow,
			'is_fill_from_context'
		)
		if (fillFromContext.settings.value) {
			newInput.is_fill_from_context = true
		}

		viewModel.entity.inputs.unshift(newInput)

		viewModel.entity.inputs.forEach(function (input, iIndex) {
			viewModel.inputsGridTableData.body[iIndex].order = iIndex
		})

		onInputsGridTableCellChange(newRow.key)

		getInputsForLinking()
		updateLinkedInputsOptionsInsideGridTable()
		viewModel.expressionData = updateInputFunctions()

		viewModel.actionsMultitypeFieldsList = createDataForMultitypeFieldsList(
			viewModel.entity.actions
		) // update options for selectors of instrument inputs
		setTimeout(function () {
			$scope.$apply()
			viewModel.actionsMFEventService.dispatchEvent(
				directiveEvents.FIELD_TYPES_DATA_CHANGED
			)
		}, 0)
	}

	const onInputsGridTableCellChange = function (rowKey) {
		// updating whole row because 'value_type' change causes other cells to change
		var gtRow = viewModel.inputsGridTableDataService.getRowByKey(rowKey)
		var input = viewModel.entity.inputs[gtRow.order]

		gtRow.columns.forEach(function (gtColumn) {
			if (gtColumn.objPath) {
				if (gtColumn.key === 'linked_inputs_names' && gtColumn.settings.value) {
					let linkedInputsNames = []
					let recalculateOnChange = []
					let recalculateOnChangePath = [
						'settings',
						'recalc_on_change_linked_inputs',
					]

					gtColumn.settings.value.forEach(function (multiselItem) {
						linkedInputsNames.push(multiselItem.id)

						if (multiselItem.isChecked) {
							recalculateOnChange.push(multiselItem.id)
						}
					})

					metaHelper.setObjectNestedPropVal(
						input,
						gtColumn.objPath,
						linkedInputsNames
					)
					metaHelper.setObjectNestedPropVal(
						input,
						recalculateOnChangePath,
						recalculateOnChange
					)
				} else {
					metaHelper.setObjectNestedPropVal(
						input,
						gtColumn.objPath,
						gtColumn.settings.value
					)
				}
			} else if (gtColumn.objPaths) {
				gtColumn.objPaths.forEach(function (objPath, index) {
					metaHelper.setObjectNestedPropVal(
						input,
						objPath,
						gtColumn.settings.value[index]
					)
				})
			}

			if (gtColumn.key === 'content_type' && gtColumn.cellType === 'empty') {
				input.content_type = null
				input.reference_table = null
			}
		})
	}

	const relationItemsResolver = function (contentType) {
		// Victor: This function I introduce in child dialog to resolve default value items
		return loadRelation(resolveRelation(contentType), true)
	}

	const onRelationDefaultValueSelInit = function (
		rowData,
		colData,
		gtDataService
	) {
		let changedCell = gtDataService.getCell(rowData.order, colData.order)

		const contentTypeCell = viewModel.inputsGridTableDataService.getCellByKey(
			rowData.order,
			'content_type'
		)

		/* var loadRelationRes = relationItemsResolver(contentTypeCell.settings.value);

            console.log('contentTypeCell.settings.value', contentTypeCell.settings.value);

            if (loadRelationRes && loadRelationRes.status === 'item_exist') {
                changedCell.settings.selectorOptions = viewModel.relationItems[loadRelationRes.field].map(function (item) {

                    // contentTypeCell.settings.value = 'portfolios.portfolio'
                    item.id = "get_relation_by_user_code('" + contentTypeCell.settings.value + "', '" + item.id + "').user_code"

                    return item
                });

            } else {

                loadRelationRes.then(function (relItem) {

                    changedCell.settings.selectorOptions = relItem.map(function (item) {

                        // contentTypeCell.settings.value = 'portfolios.portfolio'
                        item.id = "get_relation_by_user_code('" + contentTypeCell.settings.value + "', '" + item.id + "').user_code"

                        return item
                    });
                    $scope.$apply();

                });

            } */
		let fieldKey = resolveRelation(contentTypeCell.settings.value)
		fieldKey = fieldKey.replace(/-/g, '_')

		if (loadedRelationsList.includes(fieldKey)) {
			changedCell.settings.selectorOptions = viewModel.relationItems[fieldKey]
		} else {
			loadRelation(fieldKey).then(function (relItem) {
				changedCell.settings.selectorOptions = relItem
				$scope.$apply()
			})
		}
	}

	const changeCellsBasedOnValueType = function (row) {
		var valueType = gridTableHelperService.getCellFromRowByKey(
				row,
				'value_type'
			),
			contentType = gridTableHelperService.getCellFromRowByKey(
				row,
				'content_type'
			),
			fillFromContext = gridTableHelperService.getCellFromRowByKey(
				row,
				'is_fill_from_context'
			),
			defaultValue = gridTableHelperService.getCellFromRowByKey(
				row,
				'default_value'
			)

		switch (valueType.settings.value) {
			case 110:
				contentType.objPath = ['reference_table']
				contentType.cellType = 'selector'
				contentType.settings.isDisabled = true
				contentType.settings.selectorOptions = viewModel.referenceTables

				if (defaultValue.cellType === 'selector') {
					defaultValue.cellType = 'expression'
					defaultValue.settings = {
						value: '',
						exprData: viewModel.expressionData,
					}
				}

				// fillFromContext.settings.value = null
				// fillFromContext.cellType = 'empty'

				if (fillFromContext.cellType === 'selector') {
					fillFromContext.cellType = 'expression'
					fillFromContext.settings = {
						value: '',
						exprData: viewModel.expressionData,
					}
				}

				break

			case 100:
				contentType.objPath = ['content_type']
				contentType.cellType = 'selector'
				contentType.settings.isDisabled = true
				contentType.settings.selectorOptions = viewModel.selectorContentTypes
				//
				// var contextProps = contextProperties[contentType.settings.value];
				// if (contextProps) {
				//     fillFromContext.cellType = 'selector'
				//     fillFromContext.settings.selectorOptions = contextProperties[contentType.settings.value]
				// }
				//
				// defaultValue.cellType = 'selector'
				//
				// defaultValue.methods = {
				//     // onOpen: onRelationDefaultValueSelOpen
				//     onInit: onRelationDefaultValueSelInit
				// }

				// defaultValue.settings.selectorOptions = viewModel.relationItems[resolveRelation(viewModel.newItem)] // TODO Victor: this is bug. viewModel.newItem always undefined

				if (defaultValue.cellType === 'selector') {
					defaultValue.cellType = 'expression'
					defaultValue.settings = {
						value: '',
						exprData: viewModel.expressionData,
					}
				}

				// fillFromContext.settings.value = null

				if (fillFromContext.cellType === 'selector') {
					fillFromContext.cellType = 'expression'
					fillFromContext.settings = {
						value: '',
						exprData: viewModel.expressionData,
					}
				}

				break

			default:
				delete contentType.objPath
				contentType.settings.isDisabled = true

				if (defaultValue.cellType === 'selector') {
					defaultValue.cellType = 'expression'
					defaultValue.settings = {
						value: '',
						exprData: viewModel.expressionData,
					}
				}

				if (fillFromContext.cellType === 'selector') {
					fillFromContext.cellType = 'expression'
					fillFromContext.settings = {
						value: '',
						exprData: viewModel.expressionData,
					}
				}

				// fillFromContext.settings.value = null
				// fillFromContext.cellType = 'empty'

				break
		}
	}

	const getInputsForLinking = function () {
		viewModel.inputsForMultiselector = viewModel.entity.inputs.map(function (
			input
		) {
			return {
				id: input.name,
				name: input.name,
				checked: false,
			}
		})
	}

	const updateLinkedInputsOptionsInsideGridTable = function () {
		var linkedInputsNames = viewModel.inputsGridTableDataService.getCellByKey(
			'templateRow',
			'linked_inputs_names'
		)
		linkedInputsNames.settings.selectorOptions =
			viewModel.inputsForMultiselector

		for (var i = 0; i < viewModel.inputsGridTableData.body.length; i++) {
			linkedInputsNames = viewModel.inputsGridTableDataService.getCellByKey(
				i,
				'linked_inputs_names'
			)

			linkedInputsNames.settings.selectorOptions =
				viewModel.inputsForMultiselector
		}
	}

	const deleteInputsRows = function (gtDataService, gtEventService) {
		var selectedRows = gtDataService.getSelectedRows()

		$mdDialog
			.show({
				controller: 'WarningDialogController as vm',
				templateUrl: 'views/dialogs/warning-dialog-view.html',
				parent: angular.element(document.body),
				preserveScope: true,
				autoWrap: true,
				multiple: true,
				skipHide: true,
				locals: {
					warning: {
						title: 'Warning',
						description:
							'Please note that in Action all links to this input will be deleted. Expressions will not be affected, so you would need to amend them manually.',
						actionsButtons: [
							{
								name: 'OK, PROCEED',
								response: { status: 'agree' },
							},
							{
								name: 'CANCEL',
								response: { status: 'disagree' },
							},
						],
					},
				},
			})
			.then(function (res) {
				if (res.status === 'agree') {
					selectedRows.forEach(function (sRow) {
						var nameCell = gtDataService.getCellByKey(sRow.order, 'name')
						var inputName = nameCell.settings.value

						viewModel.entity.inputs.splice(sRow.order, 1)
						viewModel.expressionData = updateInputFunctions()

						gtDataService.deleteRows(sRow)

						removeInputFromActions(inputName)
					})
					console.log(
						'inputsDeletion.deleteInputsRows selectedRows',
						selectedRows
					)
					getInputsForLinking()
					updateLinkedInputsOptionsInsideGridTable()

					viewModel.actionsMultitypeFieldsList =
						createDataForMultitypeFieldsList(viewModel.entity.actions) // update options for selectors of instrument inputs

					setTimeout(function () {
						$scope.$apply()
						viewModel.actionsMFEventService.dispatchEvent(
							directiveEvents.FIELD_TYPES_DATA_CHANGED
						)
					}, 0)

					// removeInputsFromLinkedInputs();
					gtEventService.dispatchEvent(gridTableEvents.ROW_SELECTION_TOGGLED)
					console.log(
						'inputsDeletion.deleteInputsRows entity',
						viewModel.entity
					)
					// $scope.$apply();
				}
			})
	}

	const addInputRow = function (gtDataService, gtEventService) {
		$mdDialog
			.show({
				controller: 'TransactionTypeAddInputDialogController as vm',
				templateUrl:
					'views/dialogs/transaction-type-add-input-dialog-view.html',
				parent: angular.element(document.body),
				multiple: true,
				locals: {
					data: {
						inputs: viewModel.entity.inputs,
						valueTypeOptions: valueTypes,
						contentTypeOptions: {
							relation: viewModel.selectorContentTypes,
							selector: viewModel.referenceTables,
						},
						contextProperties: contextProperties,
						relationItems: viewModel.relationItems,
						inputsForMultiselector: viewModel.inputsForMultiselector,
						loadedRelationsList: loadedRelationsList,
						expressionData: viewModel.expressionData,

						resolveRelationCallback: resolveRelation,
						loadRelationCallback: loadRelation,
					},
				},
			})
			.then(function (res) {
				if (res.status === 'agree') {
					var newRow = metaHelper.recursiveDeepCopy(
						viewModel.inputsGridTableData.templateRow,
						true
					)
					newRow.key = res.data.name

					var name = gridTableHelperService.getCellFromRowByKey(newRow, 'name'),
						verboseName = gridTableHelperService.getCellFromRowByKey(
							newRow,
							'verbose_name'
						),
						tooltip = gridTableHelperService.getCellFromRowByKey(
							newRow,
							'tooltip'
						),
						valueType = gridTableHelperService.getCellFromRowByKey(
							newRow,
							'value_type'
						),
						contentType = gridTableHelperService.getCellFromRowByKey(
							newRow,
							'content_type'
						),
						fillFromContext = gridTableHelperService.getCellFromRowByKey(
							newRow,
							'is_fill_from_context'
						),
						defaultValue = gridTableHelperService.getCellFromRowByKey(
							newRow,
							'default_value'
						),
						inputCalcExpression = gridTableHelperService.getCellFromRowByKey(
							newRow,
							'input_calc_expr'
						),
						linkedInputs = gridTableHelperService.getCellFromRowByKey(
							newRow,
							'linked_inputs_names'
						)

					name.settings.value = res.data.name
					verboseName.settings.value = res.data.verbose_name
					tooltip.settings.value = res.data.tooltip
					valueType.settings.value = res.data.valueType
					contentType.settings.value = res.data.contentType
					fillFromContext.settings.value = res.data.context_property

					defaultValue.settings.value = res.data.value
					defaultValue.settings.exprData = viewModel.expressionData

					inputCalcExpression.settings.value = res.data.value_expr
					inputCalcExpression.settings.exprData = viewModel.expressionData

					linkedInputs.settings.value = res.data.linked_inputs_names

					if (valueType.settings.value === 120) {
						// Button

						newRow.columns[8].settings.optionsCheckboxes.selectedOptions = false // linked inputs for Button have no checkboxes
					}

					changeCellsBasedOnValueType(newRow)
					viewModel.inputsGridTableData.body.unshift(newRow)

					gtEventService.dispatchEvent(gridTableEvents.ROW_ADDED)
				}
			})
	}

	const initGridTableEvents = function () {
		viewModel.inputsGridTableEventService.addEventListener(
			gridTableEvents.CELL_VALUE_CHANGED,
			function (argumentsObj) {
				onInputsGridTableCellChange(argumentsObj.row.key)
			}
		)

		viewModel.inputsGridTableEventService.addEventListener(
			gridTableEvents.ROW_ADDED,
			onInputsGridTableRowAddition
		)
	}

	viewModel.inputsGridTableData = {
		header: {
			order: 'header',
			columns: [],
		},
		body: [],
		templateRow: {
			order: 'newRow',
			isActive: false,
			columns: [
				{
					key: 'name',
					objPath: ['name'],
					columnName: 'Name',
					order: 0,
					cellType: 'text',
					settings: {
						value: null,
						closeOnMouseOut: false,
						isDisabled: true,
					},
					styles: {
						'grid-table-cell': { width: '165px' },
					},
				},
				{
					key: 'verbose_name',
					objPath: ['verbose_name'],
					columnName: 'Verbose name',
					order: 1,
					cellType: 'text',
					settings: {
						value: null,
						closeOnMouseOut: false,
					},
					styles: {
						'grid-table-cell': { width: '140px' },
					},
				},
				{
					key: 'tooltip',
					objPath: ['tooltip'],
					columnName: 'Tooltip',
					order: 2,
					cellType: 'text',
					settings: {
						value: null,
						closeOnMouseOut: false,
					},
					styles: {
						'grid-table-cell': { width: '145px' },
					},
				},
				{
					key: 'value_type',
					objPath: ['value_type'],
					columnName: 'Value type',
					order: 3,
					cellType: 'selector',
					settings: {
						value: null,
						selectorOptions: valueTypes,
						closeOnMouseOut: false,
						isDisabled: true,
					},
					styles: {
						'grid-table-cell': { width: '110px' },
					},
					methods: {},
				},
				{
					key: 'content_type',
					columnName: 'Content type',
					order: 4,
					cellType: 'empty',
					settings: {
						value: null,
						closeOnMouseOut: false,
					},
					styles: {
						'grid-table-cell': { width: '130px' },
					},
				},
				/*{
                        key: 'is_fill_from_context',
                        objPath: ['is_fill_from_context'],
                        columnName: 'Use Default Value from Context',
                        order: 5,
                        cellType: 'checkbox',
                        settings: {
                            value: false
                        },
                        styles: {
                            'grid-table-cell': {'width': '180px'}
                        },
                        methods: {
                            onChange: onRelationFillFromContextChange
                        }
                    },*/
				{
					key: 'is_fill_from_context',
					objPath: ['context_property'],
					columnName: 'Use Default Value from Context',
					order: 5,
					cellType: 'expression',
					settings: {
						value: '',
						exprData: null,
						closeOnMouseOut: false,
					},
					styles: {
						'grid-table-cell': { width: '180px' },
					},
				},
				{
					key: 'default_value',
					objPath: ['value'],
					columnName: 'Default value',
					order: 6,
					cellType: 'expression',
					settings: {
						value: '',
						exprData: null,
						closeOnMouseOut: false,
					},
					styles: {
						'grid-table-cell': { width: '230px' },
					},
				},
				{
					key: 'input_calc_expr',
					objPath: ['value_expr'],
					columnName: 'Input expr',
					order: 7,
					cellType: 'expression',
					settings: {
						value: '',
						exprData: null,
						closeOnMouseOut: false,
					},
					styles: {
						'grid-table-cell': { width: '160px' },
					},
				},
				{
					key: 'linked_inputs_names',
					objPath: ['settings', 'linked_inputs_names'],
					columnName: 'Linked Inputs',
					order: 8,
					cellType: 'multiselector',
					settings: {
						value: [],
						selectorOptions: null,
						strictOrder: true,
						closeOnMouseOut: false,
						optionsCheckboxes: {
							selectedOptions: true,
						},
					},
					styles: {
						'grid-table-cell': { width: '140px' },
					},
				},
			],
		},
		tableMethods: {
			deleteRows: deleteInputsRows,
			addRow: addInputRow,
		},
		components: {
			topPanel: {
				addButton: true,
				filters: false,
				columns: false,
				search: false,
			},
			rowCheckboxes: true,
		},
	}

	const createDataForInputsGridTable = function () {
		viewModel.inputsGridTableData.body = []

		var rowObj = metaHelper.recursiveDeepCopy(
			viewModel.inputsGridTableData.templateRow,
			true
		)

		//region desc="Assemble header columns">
		var rowsWithSorting = [
			'name',
			'verbose_name',
			'tooltip',
			'value_type',
			'content_type',
		]

		viewModel.inputsGridTableData.header.columns = rowObj.columns.map(function (
			column
		) {
			return {
				key: column.key,
				columnName: column.columnName,
				order: column.order,
				sorting: rowsWithSorting.indexOf(column.key) > -1,
				styles: {
					'grid-table-cell': {
						width: column.styles['grid-table-cell'].width,
					},
				},
			}
		})
		//endregion

		//region assemble body rows
		viewModel.entity.inputs.forEach(function (input, index) {
			rowObj = metaHelper.recursiveDeepCopy(
				viewModel.inputsGridTableData.templateRow,
				true
			)

			rowObj.order = index
			rowObj.key = input.name
			rowObj.newRow = !!(rowObj.frontOptions && rowObj.frontOptions.newRow)

			// name
			rowObj.columns[0].settings.value = input.name
			rowObj.columns[0].settings.isDisabled = true
			// verbose_name
			rowObj.columns[1].settings.value = input.verbose_name
			// tooltip
			rowObj.columns[2].settings.value = input.tooltip
			// value_type
			rowObj.columns[3].settings.value = input.value_type
			rowObj.columns[3].settings.isDisabled = true
			// content_type
			rowObj.columns[4].settings.value = input.content_type

			if (input.value_type === 110) {
				rowObj.columns[4].settings.value = input.reference_table
			}

			rowObj.columns[4].settings.isDisabled = true
			// is_fill_from_context
			rowObj.columns[5].settings.value = input.context_property
			// default_value
			rowObj.columns[6].settings.value = input.value
			rowObj.columns[6].settings.exprData = viewModel.expressionData

			changeCellsBasedOnValueType(rowObj)

			// input_calc_expr
			rowObj.columns[7].settings.value = input.value_expr
			rowObj.columns[7].settings.exprData = viewModel.expressionData
			// linked_inputs_names
			rowObj.columns[8].settings.value = []

			if (input.settings && input.settings.linked_inputs_names) {
				rowObj.columns[8].settings.value =
					input.settings.linked_inputs_names.map(function (linkedInputName) {
						var linkedInput = {
							id: linkedInputName,
							isChecked: false,
						}

						if (
							input.settings.recalc_on_change_linked_inputs.includes(
								linkedInputName
							)
						) {
							linkedInput.isChecked = true
						}

						return linkedInput
					})

				if (input.value_type === 120) {
					// Button

					rowObj.columns[8].settings.optionsCheckboxes.selectedOptions = false // linked inputs for Button have not checkboxes
				}
			}

			rowObj.columns[8].settings.selectorOptions =
				viewModel.inputsForMultiselector
			// rowObj.columns[8].settings.getDataMethod = getInputsForLinking;

			viewModel.inputsGridTableData.body.push(rowObj)
		})
		//endregion assemble body rows >
		viewModel.inputsGridTableDataService.setTableData(
			viewModel.inputsGridTableData
		)
	}
	//endregion

	const loadEcosystemDefaults = function () {
		return new Promise((resolve, reject) => {
			ecosystemDefaultService
				.getList()
				.then(function (data) {
					ecosystemDefaultData = data.results[0]
					resolve()
				})
				.catch((error) => reject(error))
		})
	}

	const getTransactionUserFields = function () {
		return new Promise(async (resolve) => {
			/* return uiService.getTransactionFieldList({pageSize: 1000}).then(function (data) {

                    data.results.forEach(function (field) {

                        viewModel.transactionUserFields[field.key] = field.name;

                    })

                })*/

			uiService
				.getTransactionFieldList({ pageSize: 1000 })
				.then(function (data) {
					data.results.forEach(function (field) {
						viewModel.transactionUserFields[field.key] = field.name
						viewModel.transactionUserFieldsState[field.key] = field.is_active

						console.log(
							'transactionUserFieldsState',
							viewModel.transactionUserFieldsState
						)
					})

					resolve()
				})
				.catch((error) => resolve())
		})
	}

	const findInputs = function (entity) {
		if (!viewModel.entity) {
			// if this method was fired outside of add / edit ttype
			return []
		}

		var content_type = ''
		var result

		for (var i = 0; i < viewModel.contentTypes.length; i++) {
			if (viewModel.contentTypes[i].entity === entity) {
				content_type = viewModel.contentTypes[i].key
				break
			}
		}

		result = viewModel.entity.inputs.filter(function (input) {
			if (input.content_type === content_type) {
				return true
			}

			return false
		})

		result = result.map(function (input) {
			return { id: input.name, name: input.name }
		})

		return result
	}

	const findPhantoms = function (actionType) {
		let result = []

		viewModel.entity.actions.forEach(function (action, $index) {
			action.positionOrder = $index

			if (action[actionType]) {
				result.push({
					// id: $index, // position order of phantom
					id: action.id || '_$phantom$_@' + action.frontOptions.id,
					name: action.action_notes || 'Unnamed action',
				})
			}
		})

		return result
	}

	/* const findEventSchedulePhantoms = () => {

            let result = [];

            viewModel.entity.actions.forEach(function (action, $index) {

                action.positionOrder = $index;

                if (action.instrument_event_schedule) {
                    result.push({
                        // id: $index,
                        id: action.frontOptions.id,
                        name: action.action_notes || ''
                    });
                }

            });

            return result;

		}; */

	const findInputsAndPhantoms = function (entityType, phantomsList) {
		if (!phantomsList) {
			// check bellow needed in case of this method was fired outside of add / edit ttype
			phantomsList =
				viewModel.entity && viewModel.entity.actions
					? findPhantoms('instrument')
					: []
		}

		return [
			{
				name: 'Inputs',
				content: findInputs(entityType),
			},
			{
				name: 'Phantoms',
				content: phantomsList,
			},
		]
	}

	const deletePane = function ($index, $event) {
		$event.stopPropagation()
		var description = 'Are you sure to delete this action?'

		$mdDialog
			.show({
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
						description: description,
					},
				},
			})
			.then(function (res) {
				if (res.status === 'agree') {
					viewModel.entity.actions.splice($index, 1)
					// viewModel.actionsMultitypeFieldsList.splice($index, 1);

					viewModel.clearPhantoms()
					viewModel.eventPhantomsOpts = findPhantoms(
						'instrument_event_schedule'
					)

					viewModel.actionsMultitypeFieldsList =
						createDataForMultitypeFieldsList(viewModel.entity.actions)
					createSelectorPopupDataForActions()

					// update references for objects inside multitypeFieldDirectives
					setTimeout(function () {
						$scope.$apply()
						viewModel.actionsMFEventService.dispatchEvent(
							directiveEvents.FIELD_TYPES_DATA_CHANGED
						)
					}, 0)
				}
			})
	}

	const makeCopyOfAction = function (actionToCopy, index, $event) {
		$event.stopPropagation()
		var actionCopy = JSON.parse(JSON.stringify(actionToCopy))

		delete actionCopy.$$hashKey
		delete actionCopy.id
		delete actionCopy.order

		if (!actionCopy.frontOptions) {
			actionCopy.frontOptions = {}
		}

		actionCopy.frontOptions.id = metaHelper.generateUniqueId(
			viewModel.entity.user_code
		)

		var actionName = actionCopy.action_notes + ' (Copy)'
		var actionNameOccupied = true

		var c = 1
		while (actionNameOccupied) {
			// check that copy name is unique

			actionNameOccupied = false

			for (var a = 0; a < viewModel.entity.actions.length; a++) {
				if (viewModel.entity.actions[a].action_notes === actionName) {
					c = c + 1
					actionName = actionCopy.action_notes + ' (Copy ' + c + ')'
					actionNameOccupied = true

					break
				}
			}

			if (!actionNameOccupied) {
				actionCopy.action_notes = actionName

				if (
					actionCopy.transaction &&
					actionCopy.transaction.hasOwnProperty('action_notes')
				) {
					actionCopy.transaction.action_notes = actionName
				}

				if (actionCopy.instrument) {
					actionCopy.instrument.action_notes = actionName
				}
			}
		}

		viewModel.accordion.collapseAll()

		actionCopy.isPaneExpanded = true

		viewModel.entity.actions.splice(index + 1, 0, actionCopy)

		/* const coppiedActionIndex = index + 1;
			const multitypeFieldsData = getMultitypeFieldsDataForAction(actionCopy, coppiedActionIndex);
			viewModel.actionsMultitypeFieldsList.splice(coppiedActionIndex, 0, multitypeFieldsData); */
		viewModel.actionsMultitypeFieldsList = createDataForMultitypeFieldsList(
			viewModel.entity.actions
		)

		// viewModel.findPhantoms();
		viewModel.eventPhantomsOpts = findPhantoms('instrument_event_schedule')

		viewModel.paneActionsMenuPopups = createSelectorPopupDataForActions()

		setTimeout(function () {
			$scope.$apply()
			viewModel.actionsMFEventService.dispatchEvent(
				directiveEvents.FIELD_TYPES_DATA_CHANGED
			)
		}, 0)
	}

	const createSelectorPopupDataForActions = function () {
		viewModel.paneActionsMenuPopups = []

		viewModel.entity.actions.forEach(function (action, index) {
			viewModel.paneActionsMenuPopups.push({
				options: [
					{
						key: 'delete',
						name: 'DELETE',
						actionIndex: index,
					},
					{
						key: 'copy',
						name: 'MAKE COPY',
						actionIndex: index,
					},
				],
				selectOption: function (option, _$popup, $event) {
					$event.stopPropagation()
					_$popup.cancel()

					var action = viewModel.entity.actions[option.actionIndex]

					if (option.key === 'delete') {
						deletePane(option.actionIndex, $event)
					} else if (option.key === 'copy') {
						makeCopyOfAction(action, option.actionIndex, $event)
					}
				},
			})
		})

		return viewModel.paneActionsMenuPopups
	}

	const removeEmptySpaceFromAction = function (actionPaneId) {
		// const actionClass = ".ttypeActionsFields" + actionIndex;
		const findById = '#' + actionPaneId

		const actionPaneElem = document.querySelector(findById)

		// if opened pane deleted, its onCollapse still will be triggered
		if (actionPaneElem) {
			const paneContentElem = actionPaneElem.querySelector('v-pane-content')
			paneContentElem.classList.remove('actions-entity-selector-menu-opened')
		}
	}

	const addEmptySpaceToAction = function (actionPaneId) {
		/* const actionClass = ".ttypeActionsFields" + actionIndex;
			const actionOfFieldElem = document.querySelector(actionClass); */
		const findById = '#' + actionPaneId
		const actionPaneElem = document.querySelector(findById)
		const paneContentElem = actionPaneElem.querySelector('v-pane-content')

		paneContentElem.classList.add('actions-entity-selector-menu-opened')
	}

	const createTransactionMFData = function (action, actionPaneId) {
		const loadSettlementCurrency = function () {
			return loadRelation('settlement_currency')
		}

		const loadTransactionCurrency = function () {
			return loadRelation('transaction_currency')
		}

		const onESMenuOpen = function () {
			addEmptySpaceToAction(actionPaneId)
		}

		const onESMenuClose = function () {
			removeEmptySpaceFromAction(actionPaneId)
		}

		let multitypeFieldsData = {}

		multitypeFieldsData.portfolio = [
			{
				key: 'input',
				model: action.transaction.portfolio_input,
				fieldType: 'dropdownSelect',
				isDefault: true,
				isActive: !!!action.transaction.portfolio_toggle,
				sign: '<div class="multitype-field-type-letter">I</div>',
				value_type: 70,
				fieldData: {
					smallOptions: { dialogParent: '.dialog-containers-wrap' },
					menuOptions: findInputs('portfolio'),
				},
			},
			{
				key: 'relation',
				model: action.transaction.portfolio,
				fieldType: 'entitySearchSelect',
				isDefault: false,
				isActive: !!action.transaction.portfolio_toggle,
				sign: '<div class="multitype-field-type-letter highlight">R</div>',
				value_type: 100,
				fieldData: {
					smallOptions: { dialogParent: '.dialog-containers-wrap' },
					entityType: 'portfolio',
					itemName: action.transaction.portfolio_object
						? action.transaction.portfolio_object.name
						: '',
					itemProperty: 'user_code',
				},
			},
		]

		const currencyInputs = findInputs('currency')

		multitypeFieldsData.settlement_currency = [
			{
				key: 'input',
				model: action.transaction.settlement_currency_input,
				fieldType: 'dropdownSelect',
				isDefault: true,
				isActive: !!!action.transaction.settlement_currency_toggle,
				sign: '<div class="multitype-field-type-letter">I</div>',
				value_type: 70,
				fieldData: {
					smallOptions: { dialogParent: '.dialog-containers-wrap' },
					menuOptions: currencyInputs,
				},
			},
			{
				key: 'relation',
				model: action.transaction.settlement_currency,
				fieldType: 'dropdownSelect',
				isDefault: false,
				isActive: !!action.transaction.settlement_currency_toggle,
				sign: '<div class="multitype-field-type-letter highlight">R</div>',
				value_type: 70,
				fieldData: {
					smallOptions: { dialogParent: '.dialog-containers-wrap' },
					menuOptions: [],
					itemName: action.transaction.settlement_currency_object
						? action.transaction.settlement_currency_object.name
						: '',
					loadMenuOptions: loadSettlementCurrency,
				},
			},
		]

		multitypeFieldsData.transaction_currency = [
			{
				key: 'input',
				model: action.transaction.transaction_currency_input,
				fieldType: 'dropdownSelect',
				isDefault: true,
				isActive: !!!action.transaction.transaction_currency_toggle,
				sign: '<div class="multitype-field-type-letter">I</div>',
				value_type: 70,
				fieldData: {
					smallOptions: { dialogParent: '.dialog-containers-wrap' },
					menuOptions: currencyInputs,
				},
			},
			{
				key: 'relation',
				model: action.transaction.transaction_currency,
				fieldType: 'dropdownSelect',
				isDefault: false,
				isActive: !!action.transaction.transaction_currency_toggle,
				sign: '<div class="multitype-field-type-letter highlight">R</div>',
				value_type: 70,
				fieldData: {
					smallOptions: { dialogParent: '.dialog-containers-wrap' },
					menuOptions: [],
					itemName: action.transaction.transaction_currency_object
						? action.transaction.transaction_currency_object.name
						: '',
					loadMenuOptions: loadTransactionCurrency,
				},
			},
		]

		const inputsPhantomsForInstr = findInputsAndPhantoms('instrument')

		multitypeFieldsData.instrument = [
			{
				key: 'input',
				model:
					action.transaction[
						resolveInstrumentProp(action, 'transaction', 'instrument')
					],
				fieldType: 'dropdownSelect',
				isDefault: true,
				isActive: !action.transaction.instrument_toggle,
				sign: '<div class="multitype-field-type-letter">I</div>',
				value_type: 70,
				fieldData: {
					smallOptions: { dialogParent: '.dialog-containers-wrap' },
					menuOptions: inputsPhantomsForInstr,
					groupOptions: true,
				},
			},
			{
				key: 'relation',
				model: action.transaction.instrument,
				fieldType: 'entitySearchSelect',
				isDefault: false,
				isActive: !!action.transaction.instrument_toggle,
				sign: '<div class="multitype-field-type-letter highlight">R</div>',
				value_type: 100,
				fieldData: {
					smallOptions: { dialogParent: '.dialog-containers-wrap' },
					entityType: 'instrument',
					itemName: action.transaction.instrument_object
						? action.transaction.instrument_object.name
						: '',
					itemProperty: 'user_code',
				},
			},
		]

		const accountInputs = findInputs('account')

		multitypeFieldsData.account_position = [
			{
				key: 'input',
				model: action.transaction.account_position_input,
				fieldType: 'dropdownSelect',
				isDefault: true,
				isActive: !action.transaction.account_position_toggle,
				sign: '<div class="multitype-field-type-letter">I</div>',
				value_type: 70,
				fieldData: {
					smallOptions: { dialogParent: '.dialog-containers-wrap' },
					menuOptions: accountInputs,
				},
			},
			{
				key: 'relation',
				model: action.transaction.account_position,
				fieldType: 'entitySearchSelect',
				isDefault: false,
				isActive: !!action.transaction.account_position_toggle,
				sign: '<div class="multitype-field-type-letter highlight">R</div>',
				value_type: 100,
				fieldData: {
					smallOptions: { dialogParent: '.dialog-containers-wrap' },
					entityType: 'account',
					itemName: action.transaction.account_position_object
						? action.transaction.account_position_object.name
						: '',
					itemProperty: 'user_code',
				},
			},
		]

		multitypeFieldsData.account_cash = [
			{
				key: 'input',
				model: action.transaction.account_cash_input,
				fieldType: 'dropdownSelect',
				isDefault: true,
				isActive: !action.transaction.account_cash_toggle,
				sign: '<div class="multitype-field-type-letter">I</div>',
				value_type: 70,
				fieldData: {
					smallOptions: { dialogParent: '.dialog-containers-wrap' },
					menuOptions: accountInputs,
				},
			},
			{
				key: 'relation',
				model: action.transaction.account_cash,
				fieldType: 'entitySearchSelect',
				isDefault: false,
				isActive: !!action.transaction.account_cash_toggle,
				sign: '<div class="multitype-field-type-letter highlight">R</div>',
				value_type: 100,
				fieldData: {
					smallOptions: { dialogParent: '.dialog-containers-wrap' },
					entityType: 'account',
					itemName: action.transaction.account_cash_object
						? action.transaction.account_cash_object.name
						: '',
					itemProperty: 'user_code',
				},
			},
		]

		multitypeFieldsData.account_interim = [
			{
				key: 'input',
				model: action.transaction.account_interim_input,
				fieldType: 'dropdownSelect',
				isDefault: true,
				isActive: !action.transaction.account_interim_toggle,
				sign: '<div class="multitype-field-type-letter">I</div>',
				value_type: 70,
				fieldData: {
					smallOptions: { dialogParent: '.dialog-containers-wrap' },
					menuOptions: accountInputs,
				},
			},
			{
				key: 'relation',
				model: action.transaction.account_interim,
				fieldType: 'entitySearchSelect',
				isDefault: false,
				isActive: !!action.transaction.account_interim_toggle,
				sign: '<div class="multitype-field-type-letter highlight">R</div>',
				value_type: 100,
				fieldData: {
					smallOptions: { dialogParent: '.dialog-containers-wrap' },
					entityType: 'account',
					itemName: action.transaction.account_interim_object
						? action.transaction.account_interim_object.name
						: '',
					itemProperty: 'user_code',
				},
			},
		]

		multitypeFieldsData.linked_instrument = [
			{
				key: 'input',
				model:
					action.transaction[
						resolveInstrumentProp(action, 'transaction', 'linked_instrument')
					],
				fieldType: 'dropdownSelect',
				isDefault: true,
				isActive: !action.transaction.linked_instrument_toggle,
				sign: '<div class="multitype-field-type-letter">I</div>',
				value_type: 70,
				fieldData: {
					smallOptions: { dialogParent: '.dialog-containers-wrap' },
					menuOptions: inputsPhantomsForInstr,
					groupOptions: true,
				},
			},
			{
				key: 'relation',
				model: action.transaction.linked_instrument,
				fieldType: 'entitySearchSelect',
				isDefault: false,
				isActive: !!action.transaction.linked_instrument_toggle,
				sign: '<div class="multitype-field-type-letter highlight">R</div>',
				value_type: 100,
				fieldData: {
					smallOptions: { dialogParent: '.dialog-containers-wrap' },
					entityType: 'instrument',
					itemName: action.transaction.linked_instrument_object
						? action.transaction.linked_instrument_object.name
						: '',
					itemProperty: 'user_code',
					onMenuOpen: onESMenuOpen,
					onMenuClose: onESMenuClose,
				},
			},
		]

		multitypeFieldsData.allocation_pl = [
			{
				key: 'input',
				model:
					action.transaction[
						resolveInstrumentProp(action, 'transaction', 'allocation_pl')
					],
				fieldType: 'dropdownSelect',
				isDefault: true,
				isActive: !!!action.transaction.allocation_pl_toggle,
				sign: '<div class="multitype-field-type-letter">I</div>',
				value_type: 70,
				fieldData: {
					smallOptions: { dialogParent: '.dialog-containers-wrap' },
					menuOptions: inputsPhantomsForInstr,
					groupOptions: true,
				},
			},
			{
				key: 'relation',
				model: action.transaction.allocation_pl,
				fieldType: 'entitySearchSelect',
				isDefault: false,
				isActive: !!action.transaction.allocation_pl_toggle,
				sign: '<div class="multitype-field-type-letter highlight">R</div>',
				value_type: 100,
				fieldData: {
					smallOptions: { dialogParent: '.dialog-containers-wrap' },
					entityType: 'instrument',
					itemName: action.transaction.allocation_pl_object
						? action.transaction.allocation_pl_object.name
						: '',
					itemProperty: 'user_code',
					onMenuOpen: onESMenuOpen,
					onMenuClose: onESMenuClose,
				},
			},
		]

		multitypeFieldsData.allocation_balance = [
			{
				key: 'input',
				model:
					action.transaction[
						resolveInstrumentProp(action, 'transaction', 'allocation_balance')
					],
				fieldType: 'dropdownSelect',
				isDefault: true,
				isActive: !!!action.transaction.allocation_balance_toggle,
				sign: '<div class="multitype-field-type-letter">I</div>',
				value_type: 70,
				fieldData: {
					smallOptions: { dialogParent: '.dialog-containers-wrap' },
					menuOptions: inputsPhantomsForInstr,
					groupOptions: true,
				},
			},
			{
				key: 'relation',
				model: action.transaction.allocation_balance,
				fieldType: 'entitySearchSelect',
				isDefault: false,
				isActive: !!action.transaction.allocation_balance_toggle,
				sign: '<div class="multitype-field-type-letter highlight">R</div>',
				value_type: 100,
				fieldData: {
					smallOptions: { dialogParent: '.dialog-containers-wrap' },
					entityType: 'instrument',
					itemName: action.transaction.allocation_balance_object
						? action.transaction.allocation_balance_object.name
						: '',
					itemProperty: 'user_code',
					onMenuOpen: onESMenuOpen,
					onMenuClose: onESMenuClose,
				},
			},
		]

		const strategy1Inputs = findInputs('strategy-1')
		const strategy2Inputs = findInputs('strategy-2')
		const strategy3Inputs = findInputs('strategy-3')

		multitypeFieldsData.strategy1_position = [
			{
				key: 'input',
				model: action.transaction.strategy1_position_input,
				fieldType: 'dropdownSelect',
				isDefault: true,
				isActive: !!!action.transaction.strategy1_position_toggle,
				sign: '<div class="multitype-field-type-letter">I</div>',
				value_type: 70,
				fieldData: {
					smallOptions: { dialogParent: '.dialog-containers-wrap' },
					menuOptions: strategy1Inputs,
				},
			},
			{
				key: 'relation',
				model: action.transaction.strategy1_position,
				fieldType: 'entitySearchSelect',
				isDefault: false,
				isActive: !!action.transaction.strategy1_position_toggle,
				sign: '<div class="multitype-field-type-letter highlight">R</div>',
				value_type: 100,
				fieldData: {
					smallOptions: { dialogParent: '.dialog-containers-wrap' },
					entityType: 'strategy-1',
					itemName: action.transaction.strategy1_position_object
						? action.transaction.strategy1_position_object.name
						: '',
					itemProperty: 'user_code',
					onMenuOpen: onESMenuOpen,
					onMenuClose: onESMenuClose,
				},
			},
		]

		multitypeFieldsData.strategy2_position = [
			{
				key: 'input',
				model: action.transaction.strategy2_position_input,
				fieldType: 'dropdownSelect',
				isDefault: true,
				isActive: !!!action.transaction.strategy2_position_toggle,
				sign: '<div class="multitype-field-type-letter">I</div>',
				value_type: 70,
				fieldData: {
					smallOptions: { dialogParent: '.dialog-containers-wrap' },
					menuOptions: strategy2Inputs,
				},
			},
			{
				key: 'relation',
				model: action.transaction.strategy2_position,
				fieldType: 'entitySearchSelect',
				isDefault: false,
				isActive: !!action.transaction.strategy2_position_toggle,
				sign: '<div class="multitype-field-type-letter highlight">R</div>',
				value_type: 100,
				fieldData: {
					smallOptions: { dialogParent: '.dialog-containers-wrap' },
					entityType: 'strategy-2',
					itemName: action.transaction.strategy2_position_object
						? action.transaction.strategy2_position_object.name
						: '',
					itemProperty: 'user_code',
					onMenuOpen: onESMenuOpen,
					onMenuClose: onESMenuClose,
				},
			},
		]

		multitypeFieldsData.strategy3_position = [
			{
				key: 'input',
				model: action.transaction.strategy3_position_input,
				fieldType: 'dropdownSelect',
				isDefault: true,
				isActive: !!!action.transaction.strategy3_position_toggle,
				sign: '<div class="multitype-field-type-letter">I</div>',
				value_type: 70,
				fieldData: {
					smallOptions: { dialogParent: '.dialog-containers-wrap' },
					menuOptions: strategy3Inputs,
				},
			},
			{
				key: 'relation',
				model: action.transaction.strategy3_position,
				fieldType: 'entitySearchSelect',
				isDefault: false,
				isActive: !!action.transaction.strategy3_position_toggle,
				sign: '<div class="multitype-field-type-letter highlight">R</div>',
				value_type: 100,
				fieldData: {
					smallOptions: { dialogParent: '.dialog-containers-wrap' },
					entityType: 'strategy-3',
					itemName: action.transaction.strategy3_position_object
						? action.transaction.strategy3_position_object.name
						: '',
					itemProperty: 'user_code',
					onMenuOpen: onESMenuOpen,
					onMenuClose: onESMenuClose,
				},
			},
		]

		multitypeFieldsData.strategy1_cash = [
			{
				key: 'input',
				model: action.transaction.strategy1_cash_input,
				fieldType: 'dropdownSelect',
				isDefault: true,
				isActive: !!!action.transaction.strategy1_cash_toggle,
				sign: '<div class="multitype-field-type-letter">I</div>',
				value_type: 70,
				fieldData: {
					smallOptions: { dialogParent: '.dialog-containers-wrap' },
					menuOptions: strategy1Inputs,
				},
			},
			{
				key: 'relation',
				model: action.transaction.strategy1_cash,
				fieldType: 'entitySearchSelect',
				isDefault: false,
				isActive: !!action.transaction.strategy1_cash_toggle,
				sign: '<div class="multitype-field-type-letter highlight">R</div>',
				value_type: 100,
				fieldData: {
					smallOptions: { dialogParent: '.dialog-containers-wrap' },
					entityType: 'strategy-1',
					itemName: action.transaction.strategy1_cash_object
						? action.transaction.strategy1_cash_object.name
						: '',
					itemProperty: 'user_code',
					onMenuOpen: onESMenuOpen,
					onMenuClose: onESMenuClose,
				},
			},
		]

		multitypeFieldsData.strategy2_cash = [
			{
				key: 'input',
				model: action.transaction.strategy2_cash_input,
				fieldType: 'dropdownSelect',
				isDefault: true,
				isActive: !!!action.transaction.strategy2_cash_toggle,
				sign: '<div class="multitype-field-type-letter">I</div>',
				value_type: 70,
				fieldData: {
					smallOptions: { dialogParent: '.dialog-containers-wrap' },
					menuOptions: strategy2Inputs,
				},
			},
			{
				key: 'relation',
				model: action.transaction.strategy2_cash,
				fieldType: 'entitySearchSelect',
				isDefault: false,
				isActive: !!action.transaction.strategy2_cash_toggle,
				sign: '<div class="multitype-field-type-letter highlight">R</div>',
				value_type: 100,
				fieldData: {
					smallOptions: { dialogParent: '.dialog-containers-wrap' },
					entityType: 'strategy-2',
					itemName: action.transaction.strategy2_cash_object
						? action.transaction.strategy2_cash_object.name
						: '',
					itemProperty: 'user_code',
					onMenuOpen: onESMenuOpen,
					onMenuClose: onESMenuClose,
				},
			},
		]

		multitypeFieldsData.strategy3_cash = [
			{
				key: 'input',
				model: action.transaction.strategy3_cash_input,
				fieldType: 'dropdownSelect',
				isDefault: true,
				isActive: !!!action.transaction.strategy3_cash_toggle,
				sign: '<div class="multitype-field-type-letter">I</div>',
				value_type: 70,
				fieldData: {
					smallOptions: { dialogParent: '.dialog-containers-wrap' },
					menuOptions: strategy3Inputs,
				},
			},
			{
				key: 'relation',
				model: action.transaction.strategy3_cash,
				fieldType: 'entitySearchSelect',
				isDefault: false,
				isActive: !!action.transaction.strategy3_cash_toggle,
				sign: '<div class="multitype-field-type-letter highlight">R</div>',
				value_type: 100,
				fieldData: {
					smallOptions: { dialogParent: '.dialog-containers-wrap' },
					entityType: 'strategy-3',
					itemName: action.transaction.strategy3_cash_object
						? action.transaction.strategy3_cash_object.name
						: '',
					itemProperty: 'user_code',
					onMenuOpen: onESMenuOpen,
					onMenuClose: onESMenuClose,
				},
			},
		]

		multitypeFieldsData.counterparty = [
			{
				key: 'input',
				model: action.transaction.counterparty_input,
				fieldType: 'dropdownSelect',
				isDefault: true,
				isActive: !!!action.transaction.counterparty_toggle,
				sign: '<div class="multitype-field-type-letter">I</div>',
				value_type: 70,
				fieldData: {
					smallOptions: { dialogParent: '.dialog-containers-wrap' },
					menuOptions: findInputs('counterparty'),
				},
			},
			{
				key: 'relation',
				model: action.transaction.counterparty,
				fieldType: 'entitySearchSelect',
				isDefault: false,
				isActive: !!action.transaction.counterparty_toggle,
				sign: '<div class="multitype-field-type-letter highlight">R</div>',
				value_type: 100,
				fieldData: {
					smallOptions: { dialogParent: '.dialog-containers-wrap' },
					entityType: 'counterparty',
					itemName: action.transaction.counterparty_object
						? action.transaction.counterparty_object.name
						: '',
					itemProperty: 'user_code',
					onMenuOpen: onESMenuOpen,
					onMenuClose: onESMenuClose,
				},
			},
		]

		multitypeFieldsData.responsible = [
			{
				key: 'input',
				model: action.transaction.responsible_input,
				fieldType: 'dropdownSelect',
				isDefault: true,
				isActive: !!!action.transaction.responsible_toggle,
				sign: '<div class="multitype-field-type-letter">I</div>',
				value_type: 70,
				fieldData: {
					smallOptions: { dialogParent: '.dialog-containers-wrap' },
					menuOptions: findInputs('responsible'),
				},
			},
			{
				key: 'relation',
				model: action.transaction.responsible,
				fieldType: 'entitySearchSelect',
				isDefault: false,
				isActive: !!action.transaction.responsible_toggle,
				sign: '<div class="multitype-field-type-letter highlight">R</div>',
				value_type: 100,
				fieldData: {
					smallOptions: { dialogParent: '.dialog-containers-wrap' },
					entityType: 'responsible',
					itemName: action.transaction.responsible_object
						? action.transaction.responsible_object.name
						: '',
					itemProperty: 'user_code',
					onMenuOpen: onESMenuOpen,
					onMenuClose: onESMenuClose,
				},
			},
		]

		return multitypeFieldsData
	}

	const createInstrumentMFData = function (action) {
		const loadInstrumentTypes = function () {
			return loadRelation('instrument_type')
		}

		const loadPricingCurrency = function () {
			return loadRelation('pricing_currency')
		}

		const loadAccruedCurrency = function () {
			return loadRelation('accrued_currency')
		}

		const loadPricingConditionModel = function () {
			return loadRelation('pricing_condition')
		}

		/* const loadPriceDownloadScheme = function () {
				return loadRelation('price_download_scheme');
			}; */

		const loadPaymentSizeDetail = function () {
			return loadRelation('payment_size_detail')
		}

		let multitypeFieldsData = {}

		multitypeFieldsData.instrument_type = [
			{
				key: 'input',
				model: action.instrument.instrument_type_input,
				fieldType: 'dropdownSelect',
				isDefault: true,
				isActive: !action.instrument.instrument_type_toggle,
				sign: '<div class="multitype-field-type-letter">I</div>',
				value_type: 70,
				fieldData: {
					smallOptions: { dialogParent: '.dialog-containers-wrap' },
					menuOptions: findInputs('instrument-type'),
				},
			},
			{
				key: 'relation',
				model: action.instrument.instrument_type,
				fieldType: 'dropdownSelect',
				isDefault: false,
				isActive: !!action.instrument.instrument_type_toggle,
				sign: '<div class="multitype-field-type-letter highlight">R</div>',
				value_type: 100,
				fieldData: {
					smallOptions: { dialogParent: '.dialog-containers-wrap' },
					menuOptions: [],
					itemName: action.instrument.instrument_type_object
						? action.instrument.instrument_type_object.name
						: '',
					loadMenuOptions: loadInstrumentTypes,
				},
			},
		]

		const currencyInputs = findInputs('currency')

		multitypeFieldsData.pricing_currency = [
			{
				key: 'input',
				model: action.instrument.pricing_currency_input,
				fieldType: 'dropdownSelect',
				isDefault: true,
				isActive: !!!action.instrument.pricing_currency_toggle,
				sign: '<div class="multitype-field-type-letter">I</div>',
				value_type: 70,
				fieldData: {
					smallOptions: { dialogParent: '.dialog-containers-wrap' },
					menuOptions: currencyInputs,
				},
			},
			{
				key: 'relation',
				model: action.instrument.pricing_currency,
				fieldType: 'dropdownSelect',
				isDefault: false,
				isActive: !!action.instrument.pricing_currency_toggle,
				sign: '<div class="multitype-field-type-letter highlight">R</div>',
				value_type: 100,
				fieldData: {
					smallOptions: { dialogParent: '.dialog-containers-wrap' },
					menuOptions: [],
					itemName: action.instrument.pricing_currency_object
						? action.instrument.pricing_currency_object.name
						: '',
					loadMenuOptions: loadPricingCurrency,
				},
			},
		]

		multitypeFieldsData.accrued_currency = [
			{
				key: 'input',
				model: action.instrument.accrued_currency_input,
				fieldType: 'dropdownSelect',
				isDefault: true,
				isActive: !!!action.instrument.accrued_currency_toggle,
				sign: '<div class="multitype-field-type-letter">I</div>',
				value_type: 70,
				fieldData: {
					smallOptions: { dialogParent: '.dialog-containers-wrap' },
					menuOptions: currencyInputs,
				},
			},
			{
				key: 'relation',
				model: action.instrument.accrued_currency,
				fieldType: 'dropdownSelect',
				isDefault: false,
				isActive: !!action.instrument.accrued_currency_toggle,
				sign: '<div class="multitype-field-type-letter highlight">R</div>',
				value_type: 100,
				fieldData: {
					smallOptions: { dialogParent: '.dialog-containers-wrap' },
					menuOptions: [],
					itemName: action.instrument.accrued_currency_object
						? action.instrument.accrued_currency_object.name
						: '',
					loadMenuOptions: loadAccruedCurrency,
				},
			},
		]

		multitypeFieldsData.pricing_condition = [
			{
				key: 'input',
				model: action.instrument.pricing_condition_input,
				fieldType: 'dropdownSelect',
				isDefault: true,
				isActive: !!!action.instrument.pricing_condition_toggle,
				sign: '<div class="multitype-field-type-letter">I</div>',
				value_type: 70,
				fieldData: {
					smallOptions: { dialogParent: '.dialog-containers-wrap' },
					menuOptions: findInputs('pricing-condition'),
				},
			},
			{
				key: 'relation',
				model: action.instrument.pricing_condition,
				fieldType: 'dropdownSelect',
				isDefault: false,
				isActive: !!action.instrument.pricing_condition_toggle,
				sign: '<div class="multitype-field-type-letter highlight">R</div>',
				value_type: 100,
				fieldData: {
					smallOptions: { dialogParent: '.dialog-containers-wrap' },
					menuOptions: [],
					itemName: action.instrument.pricing_condition_object
						? action.instrument.pricing_condition_object.name
						: '',
					loadMenuOptions: loadPricingConditionModel,
				},
			},
		]

		/* multitypeFieldsData.price_download_scheme = [
				{
					'key': 'input',
					'model': action.instrument.price_download_scheme_input,
					'fieldType': 'dropdownSelect',
					'isDefault': true,
					'isActive': !!!action.instrument.price_download_scheme_toggle,
					'sign': '<div class="multitype-field-type-letter">I</div>',
					'value_type': 70,
					'fieldData': {
						'smallOptions': {'dialogParent': '.dialog-containers-wrap'},
						'menuOptions': findInputs('price-download-scheme')
					}
				},
				{
					'key': 'relation',
					'model': action.instrument.price_download_scheme,
					'fieldType': 'dropdownSelect',
					'isDefault': false,
					'isActive': !!action.instrument.price_download_scheme_toggle,
					'sign': '<div class="multitype-field-type-letter highlight">R</div>',
					'value_type': 100,
					'fieldData': {
						'smallOptions': {'dialogParent': '.dialog-containers-wrap'},
						'menuOptions': [],
						'itemName': action.instrument.price_download_scheme_object ? action.instrument.price_download_scheme_object.name : '',
						'loadMenuOptions': loadPriceDownloadScheme
					}
				}
			]; */

		multitypeFieldsData.payment_size_detail = [
			{
				key: 'input',
				model: action.instrument.payment_size_detail_input,
				fieldType: 'dropdownSelect',
				isDefault: true,
				isActive: !!!action.instrument.payment_size_detail_toggle,
				sign: '<div class="multitype-field-type-letter">I</div>',
				value_type: 70,
				fieldData: {
					smallOptions: { dialogParent: '.dialog-containers-wrap' },
					menuOptions: findInputs('payment-size-detail'),
				},
			},
			{
				key: 'relation',
				model: action.instrument.payment_size_detail,
				fieldType: 'dropdownSelect',
				isDefault: false,
				isActive: !!action.instrument.payment_size_detail_toggle,
				sign: '<div class="multitype-field-type-letter highlight">R</div>',
				value_type: 100,
				fieldData: {
					smallOptions: { dialogParent: '.dialog-containers-wrap' },
					menuOptions: [],
					itemName: action.instrument.payment_size_detail_object
						? action.instrument.payment_size_detail_object.name
						: '',
					loadMenuOptions: loadPaymentSizeDetail,
				},
			},
		]

		return multitypeFieldsData
	}

	const createInstrumentFactorScheduleMFData = function (action, actionPaneId) {
		let multitypeFieldsData = {}

		multitypeFieldsData.instrument = [
			{
				key: 'input',
				model:
					action.instrument_factor_schedule[
						resolveInstrumentProp(
							action,
							'instrument_factor_schedule',
							'instrument'
						)
					],
				fieldType: 'dropdownSelect',
				isDefault: true,
				isActive: !!!action.instrument_factor_schedule.instrument_toggle,
				sign: '<div class="multitype-field-type-letter">I</div>',
				value_type: 70,
				fieldData: {
					smallOptions: { dialogParent: '.dialog-containers-wrap' },
					menuOptions: findInputsAndPhantoms('instrument'),
					groupOptions: true,
				},
			},
			{
				key: 'relation',
				model: action.instrument_factor_schedule.instrument,
				fieldType: 'entitySearchSelect',
				isDefault: false,
				isActive: !!action.instrument_factor_schedule.instrument_toggle,
				sign: '<div class="multitype-field-type-letter highlight">R</div>',
				value_type: 100,
				fieldData: {
					smallOptions: { dialogParent: '.dialog-containers-wrap' },
					entityType: 'instrument',
					itemName: action.instrument_factor_schedule.instrument_object
						? action.instrument_factor_schedule.instrument_object.name
						: '',
					itemProperty: 'user_code',
					onMenuOpen: function () {
						addEmptySpaceToAction(actionPaneId)
					},
					onMenuClose: function () {
						removeEmptySpaceFromAction(actionPaneId)
					},
				},
			},
		]

		return multitypeFieldsData
	}

	/* const createInstrumentManualPricingFormulaMFData = function (action, actionIndex) {

			let multitypeFieldsData = {};

			multitypeFieldsData.instrument = [
				{
					'key': 'input',
					'model': action.instrument_manual_pricing_formula[resolveInstrumentProp(action, 'instrument_manual_pricing_formula', 'instrument')],
					'fieldType': 'dropdownSelect',
					'isDefault': true,
					'isActive': !!!action.instrument_manual_pricing_formula.instrument_toggle,
					'sign': '<div class="multitype-field-type-letter">I</div>',
					'value_type': 70,
					'fieldData': {
						'smallOptions': {'dialogParent': '.dialog-containers-wrap'},
						'menuOptions': findInputsAndPhantoms('instrument'),
						'groupOptions': true
					}
				},
				{
					'key': 'relation',
					'model': action.instrument_manual_pricing_formula.instrument,
					'fieldType': 'entitySearchSelect',
					'isDefault': false,
					'isActive': !!action.instrument_manual_pricing_formula.instrument_toggle,
					'sign': '<div class="multitype-field-type-letter highlight">R</div>',
					'value_type': 100,
					'fieldData': {
						'smallOptions': {'dialogParent': '.dialog-containers-wrap'},
						'entityType': 'instrument',
						'itemName': action.instrument_manual_pricing_formula.instrument_object ? action.instrument_manual_pricing_formula.instrument_object.name : '',
						'itemProperty': 'user_code',
						'onMenuOpen': function () {
							addEmptySpaceToAction(actionIndex);
						},
						'onMenuClose': function () {
							removeEmptySpaceFromAction(actionIndex);
						}
					}
				}
			];

			multitypeFieldsData.pricing_policy = [
				{
					'key': 'input',
					'model': action.instrument_manual_pricing_formula.pricing_policy_input,
					'fieldType': 'dropdownSelect',
					'isDefault': true,
					'isActive': !!!action.instrument_manual_pricing_formula.pricing_policy_toggle,
					'sign': '<div class="multitype-field-type-letter">I</div>',
					'value_type': 70,
					'fieldData': {
						'smallOptions': {'dialogParent': '.dialog-containers-wrap'},
						'menuOptions': findInputs('pricing-policy')
					}
				},
				{
					'key': 'relation',
					'model': action.instrument_manual_pricing_formula.pricing_policy,
					'fieldType': 'dropdownSelect',
					'isDefault': false,
					'isActive': !!action.instrument_manual_pricing_formula.pricing_policy_toggle,
					'sign': '<div class="multitype-field-type-letter highlight">R</div>',
					'value_type': 100,
					'fieldData': {
						'smallOptions': {'dialogParent': '.dialog-containers-wrap'},
						'menuOptions': [],
						'itemName': action.instrument_manual_pricing_formula.pricing_policy_object ? action.instrument_manual_pricing_formula.pricing_policy_object.name : '',
						'loadMenuOptions': function () {
							return loadRelation('pricing_policy');
						}
					}
				}
			];

			return multitypeFieldsData;

		}; */

	const createInstrumentAccrualCalculationSchedulesMFData = function (
		action,
		actionPaneId
	) {
		let multitypeFieldsData = {}

		multitypeFieldsData.instrument = [
			{
				key: 'input',
				model:
					action.instrument_accrual_calculation_schedules[
						resolveInstrumentProp(
							action,
							'instrument_accrual_calculation_schedules',
							'instrument'
						)
					],
				fieldType: 'dropdownSelect',
				isDefault: true,
				isActive:
					!!!action.instrument_accrual_calculation_schedules.instrument_toggle,
				sign: '<div class="multitype-field-type-letter">I</div>',
				value_type: 70,
				fieldData: {
					smallOptions: { dialogParent: '.dialog-containers-wrap' },
					menuOptions: findInputsAndPhantoms('instrument'),
					groupOptions: true,
				},
			},
			{
				key: 'relation',
				model: action.instrument_accrual_calculation_schedules.instrument,
				fieldType: 'entitySearchSelect',
				isDefault: false,
				isActive:
					!!action.instrument_accrual_calculation_schedules.instrument_toggle,
				sign: '<div class="multitype-field-type-letter highlight">R</div>',
				value_type: 100,
				fieldData: {
					smallOptions: { dialogParent: '.dialog-containers-wrap' },
					entityType: 'instrument',
					itemName: action.instrument_accrual_calculation_schedules
						.instrument_object
						? action.instrument_accrual_calculation_schedules.instrument_object
								.name
						: '',
					itemProperty: 'user_code',
					onMenuOpen: function () {
						addEmptySpaceToAction(actionPaneId)
					},
					onMenuClose: function () {
						removeEmptySpaceFromAction(actionPaneId)
					},
				},
			},
		]

		multitypeFieldsData.periodicity = [
			{
				key: 'input',
				model:
					action.instrument_accrual_calculation_schedules.periodicity_input,
				fieldType: 'dropdownSelect',
				isDefault: true,
				isActive:
					!!!action.instrument_accrual_calculation_schedules.periodicity_toggle,
				sign: '<div class="multitype-field-type-letter">I</div>',
				value_type: 70,
				fieldData: {
					smallOptions: { dialogParent: '.dialog-containers-wrap' },
					menuOptions: findInputs('periodicity'),
				},
			},
			{
				key: 'relation',
				model: action.instrument_accrual_calculation_schedules.periodicity,
				fieldType: 'dropdownSelect',
				isDefault: false,
				isActive:
					!!action.instrument_accrual_calculation_schedules.periodicity_toggle,
				sign: '<div class="multitype-field-type-letter highlight">R</div>',
				value_type: 100,
				fieldData: {
					smallOptions: { dialogParent: '.dialog-containers-wrap' },
					menuOptions: [],
					itemName: action.instrument_accrual_calculation_schedules
						.periodicity_object
						? action.instrument_accrual_calculation_schedules.periodicity_object
								.name
						: '',
					loadMenuOptions: function () {
						return loadRelation('periodicity')
					},
				},
			},
		]

		multitypeFieldsData.accrual_calculation_model = [
			{
				key: 'input',
				model:
					action.instrument_accrual_calculation_schedules
						.accrual_calculation_model_input,
				fieldType: 'dropdownSelect',
				isDefault: true,
				isActive:
					!!!action.instrument_accrual_calculation_schedules
						.accrual_calculation_model_toggle,
				sign: '<div class="multitype-field-type-letter">I</div>',
				value_type: 70,
				fieldData: {
					smallOptions: { dialogParent: '.dialog-containers-wrap' },
					menuOptions: findInputs('accrual-calculation-model'),
				},
			},
			{
				key: 'relation',
				model:
					action.instrument_accrual_calculation_schedules
						.accrual_calculation_model,
				fieldType: 'dropdownSelect',
				isDefault: false,
				isActive:
					!!action.instrument_accrual_calculation_schedules
						.accrual_calculation_model_toggle,
				sign: '<div class="multitype-field-type-letter highlight">R</div>',
				value_type: 100,
				fieldData: {
					smallOptions: { dialogParent: '.dialog-containers-wrap' },
					menuOptions: [],
					itemName: action.instrument_accrual_calculation_schedules
						.accrual_calculation_model_object
						? action.instrument_accrual_calculation_schedules
								.accrual_calculation_model_object.name
						: '',
					loadMenuOptions: function () {
						return loadRelation('accrual_calculation_model')
					},
				},
			},
		]

		return multitypeFieldsData
	}

	const createInstrumentEventSchedulesMFData = function (action, actionPaneId) {
		let multitypeFieldsData = {}

		// const toggled = !!!action.instrument_event_schedule.instrument_toggle;

		multitypeFieldsData.instrument = [
			{
				key: 'input',
				model:
					action.instrument_event_schedule[
						resolveInstrumentProp(
							action,
							'instrument_event_schedule',
							'instrument'
						)
					],
				fieldType: 'dropdownSelect',
				isDefault: true,
				isActive: !!!action.instrument_event_schedule.instrument_toggle,
				sign: '<div class="multitype-field-type-letter">I</div>',
				value_type: 70,
				fieldData: {
					smallOptions: { dialogParent: '.dialog-containers-wrap' },
					menuOptions: findInputsAndPhantoms('instrument'),
					groupOptions: true,
				},
			},
			{
				key: 'relation',
				model: action.instrument_event_schedule.instrument,
				fieldType: 'entitySearchSelect',
				isDefault: false,
				isActive: !!action.instrument_event_schedule.instrument_toggle,
				sign: '<div class="multitype-field-type-letter highlight">R</div>',
				value_type: 100,
				fieldData: {
					smallOptions: { dialogParent: '.dialog-containers-wrap' },
					entityType: 'instrument',
					itemName: action.instrument_event_schedule.instrument_object
						? action.instrument_event_schedule.instrument_object.name
						: '',
					itemProperty: 'user_code',
					onMenuOpen: function () {
						addEmptySpaceToAction(actionPaneId)
					},
					onMenuClose: function () {
						removeEmptySpaceFromAction(actionPaneId)
					},
				},
			},
		]

		multitypeFieldsData.notification_class = [
			{
				key: 'input',
				model: action.instrument_event_schedule.notification_class_input,
				fieldType: 'dropdownSelect',
				isDefault: true,
				isActive: !!!action.instrument_event_schedule.notification_class_toggle,
				sign: '<div class="multitype-field-type-letter">I</div>',
				value_type: 70,
				fieldData: {
					smallOptions: { dialogParent: '.dialog-containers-wrap' },
					menuOptions: findInputs('notification-class'),
				},
			},
			{
				key: 'relation',
				model: action.instrument_event_schedule.notification_class,
				fieldType: 'dropdownSelect',
				isDefault: false,
				isActive: !!action.instrument_event_schedule.notification_class_toggle,
				sign: '<div class="multitype-field-type-letter highlight">R</div>',
				value_type: 100,
				fieldData: {
					smallOptions: { dialogParent: '.dialog-containers-wrap' },
					menuOptions: [],
					itemName: action.instrument_event_schedule.notification_class_object
						? action.instrument_event_schedule.notification_class_object.name
						: '',
					loadMenuOptions: function () {
						return loadRelation('notification_class')
					},
				},
			},
		]

		multitypeFieldsData.periodicity = [
			{
				key: 'input',
				model: action.instrument_event_schedule.periodicity_input,
				fieldType: 'dropdownSelect',
				isDefault: true,
				isActive: !!!action.instrument_event_schedule.periodicity_toggle,
				sign: '<div class="multitype-field-type-letter">I</div>',
				value_type: 70,
				fieldData: {
					smallOptions: { dialogParent: '.dialog-containers-wrap' },
					menuOptions: findInputs('periodicity'),
				},
			},
			{
				key: 'relation',
				model: action.instrument_event_schedule.periodicity,
				fieldType: 'dropdownSelect',
				isDefault: false,
				isActive: !!action.instrument_event_schedule.periodicity_toggle,
				sign: '<div class="multitype-field-type-letter highlight">R</div>',
				value_type: 100,
				fieldData: {
					smallOptions: { dialogParent: '.dialog-containers-wrap' },
					menuOptions: [],
					itemName: action.instrument_event_schedule.periodicity_object
						? action.instrument_event_schedule.periodicity_object.name
						: '',
					loadMenuOptions: function () {
						return loadRelation('periodicity')
					},
				},
			},
		]

		multitypeFieldsData.event_class = [
			{
				key: 'input',
				model: action.instrument_event_schedule.event_class_input,
				fieldType: 'dropdownSelect',
				isDefault: true,
				isActive: !!!action.instrument_event_schedule.event_class_toggle,
				sign: '<div class="multitype-field-type-letter">I</div>',
				value_type: 70,
				fieldData: {
					smallOptions: { dialogParent: '.dialog-containers-wrap' },
					menuOptions: findInputs('event-class'),
				},
			},
			{
				key: 'relation',
				model: action.instrument_event_schedule.event_class,
				fieldType: 'dropdownSelect',
				isDefault: false,
				isActive: !!action.instrument_event_schedule.event_class_toggle,
				sign: '<div class="multitype-field-type-letter highlight">R</div>',
				value_type: 100,
				fieldData: {
					smallOptions: { dialogParent: '.dialog-containers-wrap' },
					menuOptions: [],
					itemName: action.instrument_event_schedule.event_class_object
						? action.instrument_event_schedule.event_class_object.name
						: '',
					loadMenuOptions: function () {
						return loadRelation('event_class')
					},
				},
			},
		]

		return multitypeFieldsData
	}

	const getMultitypeFieldsDataForAction = function (action) {
		let multitypeFieldsData = {}

		const actionPaneId = getActionPaneId(action)

		if (action.transaction) {
			multitypeFieldsData = createTransactionMFData(action, actionPaneId)
		} else if (action.instrument) {
			multitypeFieldsData = createInstrumentMFData(action)
		} else if (action.instrument_factor_schedule) {
			multitypeFieldsData = createInstrumentFactorScheduleMFData(
				action,
				actionPaneId
			)
		} else if (action.instrument_accrual_calculation_schedules) {
			/* else if (action.instrument_manual_pricing_formula) {
				multitypeFieldsData = createInstrumentManualPricingFormulaMFData(action, actionIndex);
			} */
			multitypeFieldsData = createInstrumentAccrualCalculationSchedulesMFData(
				action,
				actionPaneId
			)
		} else if (action.instrument_event_schedule) {
			multitypeFieldsData = createInstrumentEventSchedulesMFData(
				action,
				actionPaneId
			)
		}

		return multitypeFieldsData
	}

	/**
	 *
	 * @param actions {Array} - transaction type actions list
	 * @returns {Array<Object>} - list of data's for multitype fields inside actions
	 */
	const createDataForMultitypeFieldsList = function (actions) {
		let actionsMultitypeFieldsList = []

		/* viewModel.entity.actions.forEach(function (action) {

				const multitypeFieldsData = getMultitypeFieldsDataForAction(action);

				actionsMultitypeFieldsList.push(multitypeFieldsData);

			}); */
		actions.forEach(function (action) {
			const multitypeFieldsData = getMultitypeFieldsDataForAction(action)

			actionsMultitypeFieldsList.push(multitypeFieldsData)
		})

		return actionsMultitypeFieldsList
	}

	/* const setTransactionInstrumentInput = function (item, name, prop) {

			if (prop === 'instrument') {
				item.transaction.instrument_input = name;
				item.transaction.instrument_phantom = null;
				item.transaction.instrument = null;
			}

			else if (prop === 'linked_instrument') {
				item.transaction.linked_instrument_input = name;
				item.transaction.linked_instrument_phantom = null;
				item.transaction.linked_instrument = null;
			}

			else if (prop === 'allocation_pl') {
				item.transaction.allocation_pl_input = name;
				item.transaction.allocation_pl_phantom = null;
				item.transaction.allocation_pl = null;
			}

			else if (prop === 'allocation_balance') {
				item.transaction.allocation_balance_input = name;
				item.transaction.allocation_balance_phantom = null;
				item.transaction.allocation_balance = null;
			}
		};

		const setTransactionInstrumentPhantom = function (item, positionOrder, prop) {

			if (prop === 'instrument') {
				item.transaction.instrument_input = null;
				item.transaction.instrument_phantom = positionOrder;
				item.transaction.instrument = null;
			}

			else if (prop === 'linked_instrument') {
				item.transaction.linked_instrument_input = null;
				item.transaction.linked_instrument_phantom = positionOrder;
				item.transaction.linked_instrument = null;
			}

			else if (prop === 'allocation_pl') {
				item.transaction.allocation_pl_input = null;
				item.transaction.allocation_pl_phantom = positionOrder;
				item.transaction.allocation_pl = null;
			}

			else if (prop === 'allocation_balance') {
				item.transaction.allocation_balance_input = null;
				item.transaction.allocation_balance_phantom = positionOrder;
				item.transaction.allocation_balance = null;
			}

		}; */
	/**
	 * Set values inside action for instrument related properties
	 *
	 * @param {Object} action
	 * @param {string} actionType - 'transaction', 'instrument_factor_schedule', etc
	 * @param {string} fieldKey - 'instrument', 'linked_instrument', 'allocation_balance', 'allocation_pl'
	 * @param {string|number} value - name of input or index of instrument's phantom
	 *
	 * @returns {Object}
	 */
	const setInstrumentInputVal = (action, actionType, fieldKey, value) => {
		const inputProp = fieldKey + '_input'
		const phantomProp = fieldKey + '_phantom'

		// instrument phantom selected
		let inputVal = null
		let phantomVal = value
		let notPhantomWithTmpId =
			typeof value !== 'string' || !value.startsWith('_$phantom$_@')

		// instrument input selected
		if (isNaN(value) && notPhantomWithTmpId) {
			inputVal = value
			phantomVal = null
		}

		// object path example: action.transaction.instrument_input
		action[actionType][inputProp] = inputVal
		// object path example: action.transaction.instrument_phantom
		action[actionType][phantomProp] = phantomVal
		// object path example: action.transaction.instrument
		action[actionType][fieldKey] = null

		return action
	}

	const moveDown = function (item, $index, $event) {
		if ($event) $event.stopPropagation()

		var swap = JSON.parse(JSON.stringify(item))

		viewModel.entity.actions[$index] = viewModel.entity.actions[$index + 1]
		viewModel.entity.actions[$index + 1] = swap

		// viewModel.findPhantoms();
		viewModel.eventPhantomsOpts = findPhantoms('instrument_event_schedule')

		viewModel.actionsMultitypeFieldsList = createDataForMultitypeFieldsList(
			viewModel.entity.actions
		)

		// update references for objects inside multitypeFieldDirectives
		setTimeout(function () {
			$scope.$apply()
			viewModel.actionsMFEventService.dispatchEvent(
				directiveEvents.FIELD_TYPES_DATA_CHANGED
			)
		}, 0)
	}

	const moveUp = function (item, $index, $event) {
		if ($event) $event.stopPropagation()

		var swap = JSON.parse(JSON.stringify(item))

		viewModel.entity.actions[$index] = viewModel.entity.actions[$index - 1]
		viewModel.entity.actions[$index - 1] = swap

		// viewModel.findPhantoms();
		viewModel.eventPhantomsOpts = findPhantoms('instrument_event_schedule')

		viewModel.actionsMultitypeFieldsList = createDataForMultitypeFieldsList(
			viewModel.entity.actions
		)

		// update references for objects inside multitypeFieldDirectives
		setTimeout(function () {
			$scope.$apply()
			viewModel.actionsMFEventService.dispatchEvent(
				directiveEvents.FIELD_TYPES_DATA_CHANGED
			)
		}, 0)
	}

	const resolveInstrumentProp = (item, key, prop) => {
		if (prop === 'instrument') {
			if (item[key].instrument_input !== null) {
				return 'instrument_input'
			}
			return 'instrument_phantom'
		}

		if (prop === 'linked_instrument') {
			if (item[key].linked_instrument_input !== null) {
				return 'linked_instrument_input'
			}
			return 'linked_instrument_phantom'
		}
		if (prop === 'allocation_pl') {
			if (item[key].allocation_pl_input !== null) {
				return 'allocation_pl_input'
			}
			return 'allocation_pl_phantom'
		}

		if (prop === 'allocation_balance') {
			if (item[key].allocation_balance_input !== null) {
				return 'allocation_balance_input'
			}
			return 'allocation_balance_phantom'
		}
	}

	/**
	 *
	 * @param fieldKey {string}
	 * @param action {Object} - ttype action
	 * @param actionIndex {number}
	 * @param actionType {string} - can be 'transaction', 'instrument', 'instrument_event_schedule' ...
	 */
	const onMultitypeFieldValChange = function (
		fieldKey,
		action,
		actionIndex,
		actionType
	) {
		let fieldProp = fieldKey
		const multitypeFieldData =
			viewModel.actionsMultitypeFieldsList[actionIndex][fieldKey]

		let activeType = multitypeFieldData.find((data) => data.isActive)
		if (!activeType)
			activeType = multitypeFieldData.find((data) => data.isDefault)

		if (activeType.key === 'input') {
			// input selector changed

			fieldProp = fieldKey + '_input'

			/*if (actionType === 'transaction') {

					const instrFieldChanged = ['instrument', 'linked_instrument', 'allocation_pl', 'allocation_balance'].includes(fieldKey);

					if (instrFieldChanged) {

						fieldProp = null; // value will be set by methods below

						if (isNaN(activeType.model)) { // input selected
							setTransactionInstrumentInput(action, activeType.model, fieldKey);

						} else { // phantom of instrument selected
							setTransactionInstrumentPhantom(action, activeType.model, fieldKey);
						}

					}

				}*/

			const instrFieldChanged = [
				'instrument',
				'linked_instrument',
				'allocation_pl',
				'allocation_balance',
			].includes(fieldKey)

			if (instrFieldChanged) {
				fieldProp = null // value will be set by method below
				action = setInstrumentInputVal(
					action,
					actionType,
					fieldKey,
					activeType.model
				)
			}
		}

		if (fieldProp) action[actionType][fieldProp] = activeType.model
	}

	const initAfterMainDataLoaded = function () {
		let result = {}

		getInputsForLinking()

		viewModel.selectorContentTypes = viewModel.contentTypes.map(function (
			cType
		) {
			return { id: cType.key, name: cType.name }
		})

		createDataForInputsGridTable()

		result.actionsMultitypeFieldsList = createDataForMultitypeFieldsList(
			viewModel.entity.actions
		)
		result.eventPhantomsOpts = findPhantoms('instrument_event_schedule')

		return result
	}

	const setStateInActionControls = function (action) {
		const actionsKeysList = [
			'instrument',
			'transaction',
			'instrument_factor_schedule',
			/* 'instrument_manual_pricing_formula', */ 'instrument_accrual_calculation_schedules',
			'instrument_event_schedule',
			'instrument_event_schedule_action',
		]

		/* viewModel.entity.actions.forEach(function (action) {

                var keys;

                for (const actionKey of actionsKeysList) {

                    if (action[actionKey] !== null) {

                        keys = Object.keys(action[actionKey]);

                        keys.forEach(function (key) {

                            if (action[actionKey].hasOwnProperty(key + '_input')) {

                                const relationSelNotEmpty = !!action[actionKey][key];

                                if (relationSelNotEmpty) {
                                    action[actionKey][key + '_toggle'] = true;
                                }

                            }

                        })

                        break;

                    }

                }

            }); */

		const actionKey = actionsKeysList.find(
			(actionKey) => action[actionKey] !== null
		)

		if (!actionKey) {
			return action
		}

		Object.keys(action[actionKey]).forEach((key) => {
			if (action[actionKey].hasOwnProperty(key + '_input')) {
				const relationSelNotEmpty = !!action[actionKey][key]

				if (relationSelNotEmpty) {
					action[actionKey][key + '_toggle'] = true
				}
			}
		})

		return action
	}

	/**
	 * Set 'id' or 'index' of actions as value for _phantom properties.
	 *
	 * @param {Object} action
	 * @param {String|undefined} replacement - replacement to use as value for _phantom property (e.g. 'id')
	 * @returns {Object} - action with changed _phantom properties
	 */
	const replacePhantomsValues = function (action, replacement) {
		const actionKey = Object.keys(actionFieldsByType).find(
			(actionType) => action[actionType]
		)

		Object.keys(action[actionKey]).forEach((key) => {
			if (
				!action[actionKey][key + '_phantom'] &&
				action[actionKey][key + '_phantom'] !== 0
			) {
				return
			}

			let selPhantom

			if (replacement === 'id') {
				const actionIndex = action[actionKey][key + '_phantom']
				selPhantom =
					viewModel.entity.actions[actionIndex].id ||
					viewModel.entity.actions[actionIndex].frontOptions.id

				if (!selPhantom)
					console.error(
						'Action has no id: ',
						viewModel.entity.actions[actionIndex]
					)
			} else {
				// replace with action index

				let actionId = action[actionKey][key + '_phantom']

				let findActionIndex = function (action, index) {
					// return action.id === actionId;
					if (action.id === actionId) {
						return true
					}

					return false
				}

				if (typeof actionId === 'string') {
					actionId = actionId.slice(12) // slice _$phantom$_@ part

					findActionIndex = function (action, index) {
						// return action.frontOptions && action.frontOptions.id === actionId;
						if (action.frontOptions && action.frontOptions.id === actionId) {
							return true
						}

						return false
					}
				}

				selPhantom = viewModel.entity.actions.findIndex(findActionIndex)

				if (selPhantom < -1) selPhantom = null
			}

			action[actionKey][key + '_phantom'] = selPhantom
		})

		return action
	}

	const formatActionsForFrontend = function () {
		/* viewModel.entity.actions = viewModel.entity.actions.map(action => {

                if (!action.frontOptions) action.frontOptions = {};
                action.frontOptions = metaHelper.generateUniqueId();

                return action;

            }); */

		return viewModel.entity.actions.map(function (action) {
			action = replacePhantomsValues(action, 'id')

			return setStateInActionControls(action)
		})
	}

	/**
	 *
	 * @param {Object} actionData - ttype action
	 * @param {string} actionType - can be 'transaction', 'instrument', 'instrument_event_schedule' ...
	 * @param {string} fieldName
	 * @param {Object=} relationSelData - data for relation selector inside multitype field
	 */
	const setDefaultValueForRelation = function (
		actionData,
		actionType,
		fieldName,
		relationSelData
	) {
		var relationType = ''
		switch (fieldName) {
			case 'linked_instrument':
			case 'allocation_pl':
			case 'allocation_balance':
				relationType = 'instrument'
				break
			default:
				relationType = fieldName
		}

		var defaultValueKey = ''
		switch (relationType) {
			case 'account_position':
			case 'account_cash':
			case 'account_interim':
				defaultValueKey = 'account'
				break
			case 'settlement_currency':
			case 'transaction_currency':
			case 'accrued_currency':
			case 'pricing_currency':
				defaultValueKey = 'currency'
				break
			case 'strategy1_position':
			case 'strategy1_cash':
				defaultValueKey = 'strategy1'
				break
			case 'strategy2_position':
			case 'strategy2_cash':
				defaultValueKey = 'strategy2'
				break
			case 'strategy3_position':
			case 'strategy3_cash':
				defaultValueKey = 'strategy3'
				break
			default:
				defaultValueKey = relationType
		}

		if (ecosystemDefaultData.hasOwnProperty(defaultValueKey)) {
			var nameProperty = 'name'
			/*if (fieldName === 'price_download_scheme') {
					nameProperty = 'user_code';
				}*/

			var defaultName =
				ecosystemDefaultData[defaultValueKey + '_object'][nameProperty]
			var defaultUserCode =
				ecosystemDefaultData[defaultValueKey + '_object']['user_code']

			actionData[actionType][fieldName] = defaultUserCode

			// needed for displaying default value after turning on 'relation' field
			actionData[actionType][fieldName + '_object'] = {}
			actionData[actionType][fieldName + '_object'][nameProperty] = defaultName
			actionData[actionType][fieldName + '_object']['user_code'] =
				defaultUserCode

			if (relationSelData) {
				relationSelData.model = ecosystemDefaultData[defaultValueKey]
				relationSelData.fieldData.itemName = defaultName
			}
			// < needed to display default value name inside selector after toggling 'relation' field >
		}
	}

	const onActionMultitypeFieldToggle = function (
		fieldName,
		item,
		itemIndex,
		actionType
	) {
		item[actionType][fieldName] = null
		item[actionType][fieldName + '_input'] = null
		delete item[actionType][fieldName + '_object']
		if (item[actionType].hasOwnProperty(fieldName + '_phantom')) {
			item[actionType][fieldName + '_phantom'] = null
		}
		item[actionType][fieldName + '_toggle'] =
			!item[actionType][fieldName + '_toggle']

		let multitypeFieldData =
			viewModel.actionsMultitypeFieldsList[itemIndex][fieldName]

		const activeType = multitypeFieldData.find((type) => type.isActive)
		const inactiveType = multitypeFieldData.find((type) => !type.isActive)

		inactiveType.model = null
		if (
			item[actionType][fieldName + '_toggle'] &&
			!item[actionType][fieldName]
		) {
			setDefaultValueForRelation(item, actionType, fieldName, activeType)
		}
	}

	const saveAsTemplate = function ($event, type) {
		$mdDialog
			.show({
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
					data: {},
				},
			})
			.then(function (res) {
				if (res.status === 'agree') {
					var template = {
						name: '',
						type: type,
						data: {},
					}

					template.name = res.data.name

					if (type === 'input_template') {
						template.data.inputs = viewModel.entity.inputs.map(function (item) {
							return {
								name: item.name,
								verbose_name: item.verbose_name,
								value_type: item.value_type,
								content_type: item.content_type,
								value: item.value,
								value_expr: item.value_expr,
							}
						})
					}

					if (type === 'field_template') {
						template.data.fields = {}

						Object.keys(viewModel.entity).forEach(function (key) {
							if (key.indexOf('user_text_') !== -1) {
								template.data.fields[key] = viewModel.entity[key]
							}

							if (key.indexOf('user_number_') !== -1) {
								template.data.fields[key] = viewModel.entity[key]
							}

							if (key.indexOf('user_date_') !== -1) {
								template.data.fields[key] = viewModel.entity[key]
							}
						})
					}

					if (type === 'action_template') {
						template.data.actions = viewModel.entity.actions.map(function (
							action
						) {
							var result = {}

							Object.keys(action).forEach(function (key) {
								if (typeof action[key] === 'object' && action[key] !== null) {
									result[key] = {}

									Object.keys(action[key]).forEach(function (actionItemKey) {
										result[key][actionItemKey] = action[key][actionItemKey]

										if (action[key].hasOwnProperty(actionItemKey + '_input')) {
											result[key][actionItemKey + '_field_type'] = 'input'

											if (action[key][actionItemKey + '_toggle']) {
												result[key][actionItemKey + '_field_type'] = 'relation'
											}

											result[key][actionItemKey] = null // if its relation property
										}

										if (actionItemKey.indexOf('_input') !== -1) {
											result[key][actionItemKey] = null // if its relation_input property
										}

										if (actionItemKey.indexOf('_toggle') !== -1) {
											delete result[key][actionItemKey]
										}

										if (actionItemKey.indexOf('_object') !== -1) {
											delete result[key][actionItemKey]
										}
									})
								} else {
									result[key] = action[key]
								}
							})

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
									description: 'Template successfully created',
								},
							},
						})

						getInputTemplates()
						viewModel.getFieldTemplates()
						viewModel.getActionTemplates()
					})
				}
			})
	}

	const getActionTypeName = function (action) {
		if (action.instrument) {
			return 'Create Instrument'
		} else if (action.transaction) {
			return 'Create Transaction'
		} else if (action.instrument_factor_schedule) {
			return 'Create Factor Schedule'
		} else if (action.instrument_manual_pricing_formula) {
			return 'This action obsolete. Please delete it.'
			// return "Create Manual Pricing Formula";
		} else if (action.instrument_accrual_calculation_schedules) {
			return 'Create Accrual Calculation Schedules'
		} else if (action.instrument_event_schedule) {
			return 'Create Event Schedule'
		} else if (action.instrument_event_schedule_action) {
			return 'Create Event Schedule Action'
		}
	}

	const appendFromTemplate = function ($event, template) {
		console.log('Append from Template', template)

		if (template.type === 'input_template') {
			$mdDialog
				.show({
					controller: 'InputTemplateLayoutViewerDialogController as vm',
					templateUrl:
						'views/dialogs/input-template-layout-viewer-dialog-view.html',
					targetEvent: $event,
					locals: {
						data: {
							template: template,
						},
					},
					preserveScope: true,
					autoWrap: true,
					skipHide: true,
					multiple: true,
				})
				.then(function (res) {
					if (res.status === 'agree') {
						var template = res.data.template

						template.data.inputs.forEach(function (input) {
							if (!input.settings) input.settings = {}
							if (!input.settings.linked_inputs_names)
								input.settings.linked_inputs_names = []
							if (!input.settings.recalc_on_change_linked_inputs)
								input.settings.recalc_on_change_linked_inputs = []

							viewModel.entity.inputs.push(input)
						})

						viewModel.expressionData = updateInputFunctions()
						getInputsForLinking()
						createDataForInputsGridTable()

						viewModel.inputsGridTableEventService.dispatchEvent(
							gridTableEvents.REDRAW_TABLE
						)
					}
				})
		} else if (template.type === 'field_template') {
			Object.keys(viewModel.entity).forEach(function (key) {
				if (key.indexOf('user_text_') !== -1) {
					viewModel.entity[key] = ''
				}

				if (key.indexOf('user_number_') !== -1) {
					viewModel.entity[key] = ''
				}

				if (key.indexOf('user_date_') !== -1) {
					viewModel.entity[key] = ''
				}
			})

			Object.keys(template.data.fields).forEach(function (key) {
				viewModel.entity[key] = template.data.fields[key]
			})
		} else if (template.type === 'action_template') {
			//region Formatting actions from template before adding them
			var actionsToAdd = template.data.actions.map(function (action) {
				Object.keys(action).forEach(function (key) {
					if (typeof action[key] === 'object' && action[key] !== null) {
						Object.keys(action[key]).forEach(function (actionItemKey) {
							if (action[key].hasOwnProperty(actionItemKey + '_input')) {
								if (action[key].hasOwnProperty(actionItemKey + '_field_type')) {
									action[key][actionItemKey + '_toggle'] = true

									setDefaultValueForRelation(action, key, actionItemKey)

									delete action[key][actionItemKey + '_field_type'] // remove template specific properties before adding actions
								}
							}
						})
					}
				})

				return action
			})
			//endregion

			insertActions(actionsToAdd)
			// viewModel.entity.actions = viewModel.entity.actions.concat(actionsToAdd);
		}
	}

	//region Context Parameters tab
	/** Set front end properties for context parameters data */
	const getContextParameters = function () {
		if (!Array.isArray(viewModel.entity.context_parameters)) {
			viewModel.entity.context_parameters = []
		}

		return viewModel.entity.context_parameters
	}

	const deleteContextParameter = function ($event, $index) {
		viewModel.entity.context_parameters.splice($index, 1)
		updateContextParametersFunctions()
	}

	const addContextParameter = function ($event) {
		const contextParamsUserCodesList = viewModel.entity.context_parameters.map(
			(param) => param.user_code
		)

		$mdDialog
			.show({
				controller: 'EnterUserCodeDialogController as vm',
				templateUrl: 'views/dialogs/enter-user-code-dialog-view.html',
				targetEvent: $event,
				locals: {
					data: {
						title: 'Enter user code for new context parameter',
						occupiedUserCodesList: contextParamsUserCodesList,
					},
				},
				multiple: true,
			})
			.then(function (res) {
				if (res.status === 'agree') {
					let order = 1

					if (viewModel.entity.context_parameters.length) {
						order =
							viewModel.entity.context_parameters[
								viewModel.entity.context_parameters.length - 1
							].order + 1
					}

					viewModel.entity.context_parameters.push({
						order: order,
						user_code: res.data,
						name: '',
					})

					updateContextParametersFunctions()
				}
			})
	}
	//endregion Context Parameters tab

	return {
		getValueTypes: getValueTypes,
		getContextProperties: getContextProperties,

		onActionAccordionCollapse: onActionAccordionCollapse,
		toggleItem: toggleItem,

		updateInputFunctions: updateInputFunctions,
		getReferenceTables: getReferenceTables,
		getInputTemplates: getInputTemplates,
		getActionTemplates: getActionTemplates,
		findPhantoms: findPhantoms,

		createNewAction: createNewAction,
		getActionPaneId: getActionPaneId,
		generateOperationPopupData: generateOperationPopupData,
		generateInstrumentOperationPopupData: generateInstrumentOperationPopupData,

		updateEntityBeforeSave: updateEntityBeforeSave,
		loadedRelationsList: loadedRelationsList,
		loadRelation: loadRelation,
		resolveRelation: resolveRelation,
		checkActionsForEmptyFields: checkActionsForEmptyFields,
		checkEntityForEmptyFields: checkEntityForEmptyFields,
		validateInputs: validateInputs,

		initGridTableEvents: initGridTableEvents,

		loadEcosystemDefaults: loadEcosystemDefaults,
		getTransactionUserFields: getTransactionUserFields,

		createSelectorPopupDataForActions: createSelectorPopupDataForActions,
		moveDown: moveDown,
		moveUp: moveUp,
		resolveInstrumentProp: resolveInstrumentProp,

		getMultitypeFieldsDataForAction: getMultitypeFieldsDataForAction,
		createDataForMultitypeFieldsList: createDataForMultitypeFieldsList,
		onActionMultitypeFieldToggle: onActionMultitypeFieldToggle,
		onMultitypeFieldValChange: onMultitypeFieldValChange,

		setStateInActionsControls: setStateInActionControls,
		formatActionsForFrontend: formatActionsForFrontend,
		getActionTypeName: getActionTypeName,
		// resetPropertyBtn: resetPropertyBtn,
		saveAsTemplate: saveAsTemplate,
		appendFromTemplate: appendFromTemplate,
		setDefaultValueForRelation: setDefaultValueForRelation,

		updateContextParametersFunctions: updateContextParametersFunctions,
		getContextParameters: getContextParameters,
		deleteContextParameter: deleteContextParameter,
		addContextParameter: addContextParameter,

		initAfterMainDataLoaded: initAfterMainDataLoaded,
	}
}
