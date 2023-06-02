import metaService from '../services/metaService'

import entityEditorHelper from './entity-editor.helper'

var isUserInputUsedInTTypeExpr = function (userInput, transactionsTypeActions) {
	var i, a, b
	for (i = 0; i < transactionsTypeActions.length; i++) {
		var action = transactionsTypeActions[i]
		var actionKeys = Object.keys(action)

		for (a = 0; a < actionKeys.length; a++) {
			var aKey = actionKeys[a]

			if (action[aKey] && typeof action[aKey] === 'object') {
				var actionItem = action[aKey]
				var actionItemKeys = Object.keys(actionItem)

				for (b = 0; b < actionItemKeys.length; b++) {
					var aItemKey = actionItemKeys[b]

					if (
						aItemKey.indexOf('_input') &&
						actionItem[aItemKey] === userInput.name
					) {
						return true
					} else if (
						aItemKey.indexOf('_object') < 0 &&
						aItemKey !== 'action_notes'
					) {
						if (
							(aItemKey === 'notes' ||
								!actionItem.hasOwnProperty(aItemKey + '_input')) &&
							actionItem[aItemKey] &&
							typeof actionItem[aItemKey] === 'string'
						) {
							var middleOfExpr =
								'[^A-Za-z_.]' + userInput.name + '(?![A-Za-z1-9_])'
							var beginningOfExpr = '^' + userInput.name + '(?![A-Za-z1-9_])'

							var inputRegExpObj = new RegExp(
								beginningOfExpr + '|' + middleOfExpr,
								'g'
							)

							if (actionItem[aItemKey].match(inputRegExpObj)) {
								return true
							}
						}
					}
				}
			}
		}
	}

	return false
}

var removeUserInputsInvalidForRecalculation = function (
	inputsList,
	actualUserInputs
) {
	inputsList.forEach(function (inputName, index) {
		// remove deleted inputs from list for recalculation

		let inputInvalid = true

		for (let i = 0; i < actualUserInputs.length; i++) {
			if (inputName === actualUserInputs[i].name) {
				// whether input actually exist

				if (actualUserInputs[i].value_expr) {
					// whether input has expression for recalculation

					inputInvalid = false
				}

				break
			}
		}

		if (inputInvalid) {
			inputsList.splice(index, 1)
		}
	})

	// return inputsList;
}

var updateEntityBeforeSave = function (viewModel) {
	if (
		metaService.getEntitiesWithoutDynAttrsList().includes(viewModel.entityType)
	) {
		viewModel.entity.attributes = []
	}

	/* if (viewModel.entity.attributes) {

			var i, a, c;
			var keys = Object.keys(viewModel.entity),
				attrExist;

			for (i = 0; i < viewModel.attrs.length; i = i + 1) {

				for (a = 0; a < keys.length; a = a + 1) {

					if (viewModel.attrs[i].name === keys[a]) {

						attrExist = false;

						for (c = 0; c < viewModel.entity.attributes.length; c = c + 1) {

							if (viewModel.entity.attributes[c]['attribute_type'] === viewModel.attrs[i].id) {
								attrExist = true;
								viewModel.entity.attributes[c] = entityEditorHelper.updateValue(viewModel.entity.attributes[c], viewModel.attrs[i], viewModel.entity[keys[a]]);
							}

						}

						if (!attrExist) {
							viewModel.entity.attributes.push(entityEditorHelper.appendAttribute(viewModel.attrs[i], viewModel.entity[keys[a]]));
						}

					}

				}

			}

		} */

	if (viewModel.entity.attributes) {
		viewModel.entity = entityEditorHelper.checkEntityAttrTypes(
			viewModel.entity,
			viewModel.entityAttrs
		)
		viewModel.entity.attributes = entityEditorHelper.clearUnusedAttributeValues(
			viewModel.entity.attributes
		)
	}

	viewModel.entity.object_permissions = []

	if (viewModel.groups) {
		viewModel.groups.forEach(function (group) {
			if (group.objectPermissions && group.objectPermissions.manage === true) {
				viewModel.entity.object_permissions.push({
					member: null,
					group: group.id,
					permission: 'manage_' + viewModel.entityType.split('-').join(''),
				})
			}

			if (group.objectPermissions && group.objectPermissions.change === true) {
				viewModel.entity.object_permissions.push({
					member: null,
					group: group.id,
					permission: 'change_' + viewModel.entityType.split('-').join(''),
				})
			}
		})
	}
}

// updating user inputs from input form editor layout using user inputs inside transaction type
var updateTransactionUserInputs = function (
	userInputs,
	tabs,
	fixedArea,
	ttype
) {
	userInputs = []

	tabs.forEach(function (tab) {
		tab.layout.fields.forEach(function (field) {
			if (field.attribute_class === 'userInput') {
				var res = field.attribute

				if (!res.frontOptions) {
					res.frontOptions = {}
				}

				res.frontOptions.required = field.required

				userInputs.push(res)
			}
		})
	})

	if (fixedArea && fixedArea.isActive) {
		fixedArea.layout.fields.forEach(function (field) {
			if (field.attribute_class === 'userInput') {
				userInputs.push(field.attribute)
			}
		})
	}

	if (tabs.length && !tabs[0].hasOwnProperty('tabOrder')) {
		tabs.forEach(function (tab, index) {
			tab.tabOrder = index
		})
	}

	userInputs.forEach(function (userInput) {
		if (!userInput.frontOptions) {
			userInput.frontOptions = {}
		}

		if (ttype.actions && isUserInputUsedInTTypeExpr(userInput, ttype.actions)) {
			userInput.frontOptions.usedInExpr = true
		}

		for (var i = 0; i < ttype.inputs.length; i++) {
			if (ttype.inputs[i].name === userInput.name) {
				userInput.key = ttype.inputs[i].name // needed for work of add / edit entity viewer
				userInput.tooltip = ttype.inputs[i].tooltip
				userInput.verbose_name = ttype.inputs[i].verbose_name
				userInput.reference_table = ttype.inputs[i].reference_table
			}
		}
	})

	return userInputs
}
// < updating user inputs from input form editor layout using user inputs inside transaction type >

export default {
	isUserInputUsedInTTypeExpr: isUserInputUsedInTTypeExpr,
	updateTransactionUserInputs: updateTransactionUserInputs,
	updateEntityBeforeSave: updateEntityBeforeSave,

	removeUserInputsInvalidForRecalculation:
		removeUserInputsInvalidForRecalculation,
}
