import metaService from '../services/metaService'
import evHelperService from '../services/entityViewerHelperService'
import evEditorEvents from '../services/ev-editor/entityViewerEditorEvents'
import directivesEvents from '../services/events/directivesEvents'

import metaHelper from '../helpers/meta.helper'
;('use strict')

var clearFrontProperties = function (entity, entityType) {
	switch (entityType) {
		case 'instrument':
			if (entity.accrual_calculation_schedules) {
				entity.accrual_calculation_schedules.forEach(function (schedule) {
					delete schedule.frontOptions
				})
			}

			if (entity.event_schedules) {
				// TODO Victor: may be make a deepClearFrontOptions?

				entity.event_schedules.forEach(function (event) {
					delete event.frontOptions
					if (event.actions) {
						event.actions.forEach(function (action) {
							delete action.frontOptions
						})
					}
				})
			}

			break

		case 'instrument-type':
			if (entity.accruals && entity.accruals.length) {
				entity.accruals.forEach((accrual) => {
					delete accrual.frontOptions
				})
			}

			if (entity.events && entity.events.length) {
				entity.events.forEach((event) => {
					delete event.frontOptions

					event.data.actions.forEach((action) => {
						delete action.frontOptions
					})
				})
			}

			break
	}
}

var fieldsThatCanBeNullData = {
	instrument: ['maturity_date'],
	'instrument-type': ['maturity_date'],
}

var removeNullFields = function (item, entityType) {
	var i
	var keys = Object.keys(item)
	var result = {}
	var fieldsThatCanBeNullList = fieldsThatCanBeNullData[entityType] || []

	for (i = 0; i < keys.length; i = i + 1) {
		/* if (item[keys[i]] && item[keys[i]].length) {
                result[keys[i]] = item[keys[i]];
            } else {
                if (item[keys[i]] != null && !isNaN(item[keys[i]])) {
                    result[keys[i]] = item[keys[i]];
                }
            } */

		var fieldCanBeNull = fieldsThatCanBeNullList.indexOf(keys[i]) > -1

		if (
			(item[keys[i]] && item[keys[i]].length) ||
			(item[keys[i]] != null && !isNaN(item[keys[i]])) ||
			fieldCanBeNull
		) {
			result[keys[i]] = item[keys[i]]
		}
	}

	return result
}

var clearUnusedAttributeValues = function (attributes) {
	var i
	for (i = 0; i < attributes.length; i = i + 1) {
		if (attributes[i].classifier == null) {
			delete attributes[i].classifier
		}
		if (attributes[i].value_date == null) {
			delete attributes[i].value_date
		}
		if (attributes[i].value_float == null) {
			delete attributes[i].value_float
		}
		if (attributes[i].value_string == null) {
			delete attributes[i].value_string
		}
	}

	return attributes
}

var clearEntityBeforeSave = function (entity, entityType) {
	let clearedEntity = JSON.parse(JSON.stringify(entity))

	clearedEntity = removeNullFields(clearedEntity, entityType)

	// clearFrontProperties(clearedEntity, entityType);
	metaHelper.clearFrontendOptions(clearedEntity)

	return clearedEntity
}

var checkEntityAttrTypes = function (entity, entityAttrs) {
	var i
	for (i = 0; i < entityAttrs.length; i = i + 1) {
		if (entityAttrs[i]['value_type'] === 40) {
			entity[entityAttrs[i].key] = moment(
				new Date(entity[entityAttrs[i].key])
			).format('YYYY-MM-DD')
		}

		if (
			entityAttrs[i]['value_type'] === 20 ||
			entityAttrs[i]['value_type'] === 'float'
		) {
			var withoutSpaces = (entity[entityAttrs[i].key] + '').replace(' ', '')
			var res
			if (withoutSpaces.indexOf(',') !== -1) {
				res = withoutSpaces.replace(',', '.')
			} else {
				res = withoutSpaces
			}
			entity[entityAttrs[i].key] = parseFloat(res)
		}
	}

	entity.attributes.forEach(function (item) {
		if (item['value_date'] !== null) {
			item['value_date'] = moment(new Date(item['value_date'])).format(
				'YYYY-MM-DD'
			)
		}
	})

	return entity
}

var appendAttribute = function (attr, value) {
	value = value || null

	var attribute = {
		attribute_name: attr.name,
		attribute_type: attr.id,
		classifier: null,
		value_date: null,
		value_float: null,
		value_string: null,
		attribute_type_object: attr,
	}

	if (attr['value_type'] === 10) {
		attribute['value_string'] = value
	} else if (attr['value_type'] === 20) {
		attribute['value_float'] = value
	} else if (attr['value_type'] === 30) {
		attribute['classifier'] = value
	} else if (attr['value_type'] === 40) {
		attribute['value_date'] = value
	}

	return attribute
}

var updateAttribute = function (attributesList, attributeType) {
	var attrIndex = attributesList.findIndex(
		(attr) => attr.attribute_type_object.user_code === attributeType.user_code
	)

	if (attrIndex < 0) {
		attributesList.push(appendAttribute(attributeType))
	} else if (
		attributesList[attrIndex].attribute_type_object.id !== attributeType.id
	) {
		// properties user_code match but attribute types are different
		const valueTypesAreDifferent =
			attributesList[attrIndex].attribute_type_object.value_type !==
			attributeType.value_type

		attributesList[attrIndex].attribute_type_object = attributeType
		attributesList[attrIndex].attribute_type = attributeType

		if (valueTypesAreDifferent) {
			attributesList[attrIndex].value_string = null
			attributesList[attrIndex].value_float = null
			attributesList[attrIndex].classifier = null
			attributesList[attrIndex].value_date = null
		}
	}

	return attributesList
}

var updateValue = function (entityAttr, attr, value) {
	if (attr['value_type'] === 10) {
		entityAttr['value_string'] = value
	}

	if (attr['value_type'] === 20) {
		entityAttr['value_float'] = value
	}

	if (attr['value_type'] === 30) {
		entityAttr['classifier'] = value
	}

	if (attr['value_type'] === 40) {
		entityAttr['value_date'] = value
	}

	return entityAttr
}

var findAttributeByKey = function (
	fieldKey,
	entityAttrs,
	attrsTypes,
	userInputs
) {
	var i, a, b
	for (i = 0; i < entityAttrs.length; i++) {
		if (entityAttrs[i].key === fieldKey) {
			return entityAttrs[i]
		}
	}

	for (a = 0; a < attrsTypes.length; a++) {
		if (attrsTypes[a].user_code === fieldKey) {
			return attrsTypes[a]
		}
	}

	for (b = 0; b < userInputs.length; b++) {
		if (userInputs[b].key === fieldKey) {
			return userInputs[b]
		}
	}

	return null
}

/**
 * Returns property name for fixed area popup object based on field property
 *
 * @param fieldKey {string} - property name
 * @param entityType {string}
 * @returns {string}
 */
const getFieldKeyForFAPopup = function (fieldKey, entityType) {
	if (fieldKey === 'instrument_type' || fieldKey === 'instrument_class') {
		return 'type'
	} else if (
		['strategy-1', 'strategy-2', 'strategy-3'].includes(entityType) &&
		fieldKey === 'subgroup'
	) {
		return 'group'
	}

	return fieldKey
}

var systemTabLocationOfAttribute = {
	instrument: {
		maturity_date: {
			type: 'system_tab',
			name: 'Events',
			validatorText: 'tab: EVENTS',
		},
		pricing_currency: {
			type: 'system_tab',
			name: 'Pricing',
			validatorText: 'tab: PRICING',
		},
	},
	'instrument-type': {
		accrued_currency: {
			type: 'system_tab',
			name: 'Accruals',
			validatorText: 'tab: ACCRUALS',
		},
		payment_size_detail: {
			type: 'system_tab',
			name: 'Accruals',
			validatorText: 'tab: ACCRUALS',
		},
		accrued_multiplier: {
			type: 'system_tab',
			name: 'Accruals',
			validatorText: 'tab: ACCRUALS',
		},
		default_accrued: {
			type: 'system_tab',
			name: 'Accruals',
			validatorText: 'tab: ACCRUALS',
		},
	},
}

var getLocationOfAttributeInsideUserTabs = function (attrKey, tabs) {
	var i, a
	for (i = 0; i < tabs.length; i++) {
		var tab = tabs[i]

		for (a = 0; a < tab.layout.fields.length; a++) {
			var socket = tab.layout.fields[a]

			if (socket.type !== 'empty') {
				if (socket.attribute_class === 'userInput') {
					if (socket.attribute.name === attrKey) {
						var locationMessage = 'tab: ' + tab.name.toUpperCase()
						return {
							type: 'user_tab',
							name: tab.name,
							validatorText: locationMessage,
						}
					}
				} else if (socket.attribute.hasOwnProperty('key')) {
					if (socket.attribute.key === attrKey) {
						var locationMessage = 'tab: ' + tab.name.toUpperCase()
						return {
							type: 'user_tab',
							name: tab.name,
							validatorText: locationMessage,
						}
					}
				} else if (socket.attribute.hasOwnProperty('user_code')) {
					if (socket.attribute.user_code === attrKey) {
						var locationMessage = 'tab: ' + tab.name.toUpperCase()
						return {
							type: 'user_tab',
							name: tab.name,
							validatorText: locationMessage,
						}
					}
				}
			}
		}
	}

	return null
}

var getLocationOfAttribute = function (
	attrKey,
	tabs,
	fixedFieldsAttrs,
	entityType
) {
	if (
		fixedFieldsAttrs.length &&
		attrKey &&
		fixedFieldsAttrs.includes(attrKey)
	) {
		return { type: 'fixed_area', validatorText: 'Top of dialog window.' }
	} else {
		if (
			systemTabLocationOfAttribute.hasOwnProperty(entityType) &&
			systemTabLocationOfAttribute[entityType].hasOwnProperty(attrKey)
		) {
			// attributes inside system tabs

			return systemTabLocationOfAttribute[entityType][attrKey] || null
		} else {
			return getLocationOfAttributeInsideUserTabs(attrKey, tabs)
		}
	}

	// return null;
}

/*var checkForNotNullRestriction = function (key, value, entityAttrs, attrsTypes) {

        var fieldAttr = null;
        /!*var i, e, b, a;
        var keys = Object.keys(item);
        var isValid = true;

        for (i = 0; i < keys.length; i = i + 1) {

            for (e = 0; e < entityAttrs.length; e = e + 1) {
                if (keys[i] === entityAttrs[e].key) {
                    if (entityAttrs[e].options && entityAttrs[e].options.notNull === true) {
                        if (item[keys[i]] === '' || item[keys[i]] == null || item[keys[i]] === undefined) {
                            isValid = false;
                        }
                    }
                }
            }

            for (a = 0; a < attrsTypes.length; a = a + 1) {
                if (keys[i] === attrsTypes[a].name) {
                    if (attrsTypes[a].options && attrsTypes[a].options.notNull === true) {
                        if (item[keys[i]] === '' || item[keys[i]] == null || item[keys[i]] === undefined) {
                            isValid = false;
                        }
                    }
                }
            }
        }*!/

        var a, e;

        for (e = 0; e < entityAttrs.length; e = e + 1) {
            if (key === entityAttrs[e].key) {
                fieldAttr = entityAttrs[e];
                /!*if (entityAttrs[e].options && entityAttrs[e].options.notNull === true) {
                    if (value !== 0 && !value) {

                        return {
                            fieldName: entityAttrs[e].options.fieldName || entityAttrs[e].verbose_name || entityAttrs[e].name,
                            message: 'Field should not be empty'
                        }

                    }
                }*!/
            }
        }

        if (!fieldAttr) {
            for (a = 0; a < attrsTypes.length; a = a + 1) {
                if (key === attrsTypes[a].user_code || key === attrsTypes[a].key) {
                    fieldAttr = attrsTypes[a];
                    /!*if (attrsTypes[a].options && attrsTypes[a].options.notNull === true) {
                        if (value !== 0 && !value) {

                            return {
                                fieldName: attrsTypes[a].options.fieldName || attrsTypes[a].verbose_name || attrsTypes[a].name,
                                message: 'Field should not be empty'
                            }

                        }
                    }*!/
                }
            }
        }

        if (fieldAttr) {

            if (fieldAttr.options && fieldAttr.options.notNull === true) {

                if (value !== 0 && !value) {

                    return {
                        fieldName: fieldAttr.options.fieldName || fieldAttr.verbose_name || fieldAttr.name,
                        message: 'Field should not be empty'
                    }

                }

            }

        }

        return false;

    };*/

var checkForNotNullRestriction = function (
	key,
	value,
	attrData,
	tabs,
	fixedFieldsAttrs,
	entityType,
	errorsList
) {
	if (attrData.options && attrData.options.notNull === true) {
		if (value !== 0 && !value) {
			errorsList.push({
				key: key,
				locationData: getLocationOfAttribute(
					key,
					tabs,
					fixedFieldsAttrs,
					entityType
				),
				fieldName:
					attrData.options.fieldName || attrData.verbose_name || attrData.name,
				message: 'Field should not be empty.',
			})
		}
	}
}

var validateFieldWithString = function (value, fieldAttr) {
	if (!value && fieldAttr.options && fieldAttr.options.notNull === true) {
		return {
			fieldName:
				fieldAttr.options.fieldName || fieldAttr.verbose_name || fieldAttr.name,
			message: 'Field should not be empty.',
		}
	}

	return null
}

var validateNumberField = function (value, fieldAttr) {
	if (fieldAttr.options && fieldAttr.options.onlyPositive === true) {
		if (value === null || value === undefined) {
			return {
				fieldName:
					fieldAttr.options.fieldName ||
					fieldAttr.verbose_name ||
					fieldAttr.name,
				message: 'Field should contain positive number.',
			}
			/*errorsList.push({
                    key: key,
                    locationData: getLocationOfAttribute(key, tabs, fixedFieldsAttrs, entityType),
                    fieldName: attrData.options.fieldName || attrData.verbose_name || attrData.name,
                    message: 'Field should have positive number'
                })*/
		}
	}
}

var validateDateField = function (value, fieldAttr) {
	if (!value) {
		value = null

		return {
			fieldName: fieldAttr.verbose_name || fieldAttr.name,
			message: 'Field should contain date in YYYY-MM-DD format.',
		}
	} else if (!moment(value, 'YYYY-MM-DD', true).isValid()) {
		var errorObj = {
			fieldName: fieldAttr.verbose_name || fieldAttr.name,
			message: 'Date has wrong format. Use this formats instead: YYYY-MM-DD.',
		}

		if (fieldAttr.options && fieldAttr.options.fieldName) {
			return {
				fieldName:
					fieldAttr.options.fieldName ||
					fieldAttr.verbose_name ||
					fieldAttr.name,
				message: 'Date has wrong format. Use this formats instead: YYYY-MM-DD.',
			}
		}

		return errorObj
	}

	return false
}

/*var checkForNegNumsRestriction = function (key, value, entityAttrs, attrsTypes, userInputs, layoutAttrs) {

        /!*var fieldsWithNegVal = [];

        var i, e, a, b;
        var keys = Object.keys(item);
        for (i = 0; i < keys.length; i = i + 1) {
            var attrWithNegVal = null;
            var foundAttr = false;

            for (e = 0; e < entityAttrs.length; e = e + 1) {
                if (keys[i] === entityAttrs[e].key) {
                    if (entityAttrs[e].options && entityAttrs[e].options.onlyPositive === true) {
                        if (item[keys[i]] == null || item[keys[i]] === undefined) {
                            attrWithNegVal = entityAttrs[e];
                            foundAttr = true;
                            break;
                        }
                    }
                }
            }

            if (!foundAttr) {
                for (a = 0; a < userInputs.length; a = a + 1) {
                    if (keys[i] === userInputs[a].name) {
                        if (userInputs[a].options && userInputs[a].options.onlyPositive === true) {
                            if (item[keys[i]] == null || item[keys[i]] === undefined) {
                                attrWithNegVal = userInputs[a];
                                foundAttr = true;
                                break;
                            }
                        }
                    }
                }
            }

            if (!foundAttr) {
                for (b = 0; b < layoutAttrs.length; b = b + 1) {
                    if (keys[i] === layoutAttrs[b].name) {
                        if (layoutAttrs[b].options && layoutAttrs[b].options.onlyPositive === true) {
                            if (item[keys[i]] == null || item[keys[i]] === undefined) {
                                attrWithNegVal = layoutAttrs[b];
                                break;
                            }
                        }
                    }
                }
            }

            if (attrWithNegVal) {
                if (attrWithNegVal.options && attrWithNegVal.options.fieldName) {
                    fieldsWithNegVal.push(attrWithNegVal.options.fieldName);
                } else if (attrWithNegVal.hasOwnProperty('verbose_name')) {
                    fieldsWithNegVal.push(attrWithNegVal.verbose_name);
                } else {
                    fieldsWithNegVal.push(attrWithNegVal.name);
                }
            }

        }*!/
        var i, a;

        for (i = 0; i < entityAttrs.length; i++) {
            if (key === entityAttrs[i].key) {
                if (entityAttrs[i].options && entityAttrs[i].options.onlyPositive === true) {
                    if (value === null || value === undefined) {

                        return {
                            fieldName: entityAttrs[i].options.fieldName || entityAttrs[i].verbose_name || entityAttrs[i].name,
                            message: 'Field should have positive number'
                        }

                    }
                }
            }
        }

        for (a = 0; a < userInputs.length; a = a + 1) {
            if (key === userInputs[a].name) {
                if (userInputs[a].options && userInputs[a].options.onlyPositive === true) {
                    if (value === null || value === undefined) {

                        return {
                            fieldName: userInputs[a].options.fieldName || userInputs[a].verbose_name || userInputs[a].name,
                            message: 'Field should have positive number'
                        }

                    }
                }
            }
        }

        /!*for (b = 0; b < layoutAttrs.length; b = b + 1) {
            if (key === layoutAttrs[b].name) {
                if (layoutAttrs[b].options && layoutAttrs[b].options.onlyPositive === true) {
                    if (value === null || value === undefined) {

                        return {
                            fieldName: layoutAttrs[b].options.fieldName || layoutAttrs[b].verbose_name || layoutAttrs[b].name,
                            message: 'Field should have positive number'
                        }

                    }
                }
            }
        }*!/

        return false;
    };*/

var checkForNegNumsRestriction = function (
	key,
	value,
	attrData,
	tabs,
	fixedFieldsAttrs,
	entityType,
	errorsList
) {
	if (attrData.options && attrData.options.onlyPositive === true) {
		if (value === null || value === undefined) {
			errorsList.push({
				key: key,
				locationData: getLocationOfAttribute(
					key,
					tabs,
					fixedFieldsAttrs,
					entityType
				),
				fieldName:
					attrData.options.fieldName || attrData.verbose_name || attrData.name,
				message: 'Field should have positive number',
			})
		}
	}
	//return false;
}

var getErrorMessageByValueType = function (value, valueType) {
	if (value && valueType === 40) {
		if (!moment(value, 'YYYY-MM-DD', true).isValid()) {
			return 'Date has wrong format. Use one of these formats instead: YYYY-MM-DD.'
		}
	} else {
		switch (valueType) {
			case 20:
				return 'Field should contain positive number.'

			case 40:
				return 'Field should contain date in YYYY-MM-DD format.'

			default:
				return 'Field should not be empty.'
		}
	}
}

var validateRequiredEntityField = function (key, value, entityAttrs) {
	for (var i = 0; i < entityAttrs.length; i++) {
		if (key === entityAttrs[i].key) {
			var errorObj = null

			if (entityAttrs[i].value_type === 40) {
				errorObj = validateDateField(value, entityAttrs[i])
			} else if (!value && value !== 0) {
				errorObj = {}
				errorObj.message = getErrorMessageByValueType(
					value,
					entityAttrs[i].value_type
				)
			}

			if (errorObj) {
				if (entityAttrs[i].options && entityAttrs[i].options.fieldName) {
					errorObj.fieldName = entityAttrs[i].options.fieldName
				} else if (entityAttrs[i].verbose_name) {
					errorObj.fieldName = entityAttrs[i].verbose_name
				} else {
					errorObj.fieldName = entityAttrs[i].name
				}

				return errorObj
			}
		}
	}

	return false
}

var getAttributeValueType = function (attribute) {
	/* if ((attribute.attribute_type_object && attribute.attribute_type_object.value_type === 10) ||
            attribute.value_type === 10) {
            return 10;
        } else if ((attribute.attribute_type_object && attribute.attribute_type_object.value_type === 20) ||
            attribute.value_type === 20) {
            return 20;
        } else if ((attribute.attribute_type_object && attribute.attribute_type_object.value_type === 30) ||
            attribute.value_type === 30) {
            return 30;
        } else if ((attribute.attribute_type_object && attribute.attribute_type_object.value_type === 40) ||
            attribute.value_type === 40) {
            return 40;
        } */

	if (attribute.attribute_type_object) {
		return attribute.attribute_type_object.value_type
	}

	return attribute.value_type
}

/**
 * If attribute with error from system tab also inside user tab. Add it second time.
 *
 * @param attrKey {string} - key of entity attribute
 * @param tabs {Object} - tabs from edit layout
 * @param error {Object} - object of error inside entity type
 * @param errorsList {Array.<Object>}
 */
var copySystemTabErrorForUserTab = function (attrKey, tabs, error, errorsList) {
	var locationInsideUserTab = getLocationOfAttributeInsideUserTabs(
		attrKey,
		tabs
	)

	if (locationInsideUserTab) {
		var errorCopy = JSON.parse(JSON.stringify(error))
		errorCopy.locationData = locationInsideUserTab
		errorsList.push(errorCopy)
	}
}

var validateEvField = function (
	key,
	fieldValue,
	attr,
	tabs,
	fixedFieldsAttrs,
	entityType,
	errorsList
) {
	var valueType = getAttributeValueType(attr)
	var errorObj = null

	switch (valueType) {
		case 10:
		case 30:

		case 100:
		case 'field':
		case 110:
			errorObj = validateFieldWithString(fieldValue, attr) // also fits for validation of selectors
			break

		case 20:
			errorObj = validateNumberField(fieldValue, attr)
			break

		case 40:
			errorObj = validateDateField(fieldValue, attr)
			break
	}

	if (errorObj) {
		errorObj.key = key
		errorObj.locationData = getLocationOfAttribute(
			key,
			tabs,
			fixedFieldsAttrs,
			entityType
		)

		errorsList.push(errorObj)

		if (errorObj.locationData && errorObj.locationData.type === 'system_tab') {
			copySystemTabErrorForUserTab(key, tabs, errorObj, errorsList)
		}
	}
}

/**
 *
 * @param entity {Object}
 * @param entityType {string}
 * @param tabs {Object} - tabs from edit layout
 * @param fixedFieldsAttrs {Array}
 * @param entityAttrs {Array.<Object>} - entity attributes
 * @param attrsTypes {Array.<Object>} - attribute types created by user
 * @returns {Array.<Object>} - list of errors
 */
var validateEntityFields = (
	entity,
	entityType,
	tabs,
	fixedFieldsAttrs,
	entityAttrs,
	attrsTypes
) => {
	var dynamicAttrs = entity.attributes
	var requiredAttrs = metaService.getRequiredEntityAttrs(entityType) // for attributes outside of user tabs
	var errors = []

	entityAttrs.forEach(function (entityAttr) {
		var key = entityAttr.key
		var fieldValue = entity[key]

		if (requiredAttrs.indexOf(key) > -1) {
			var reqFieldError = validateRequiredEntityField(
				key,
				fieldValue,
				entityAttrs
			)

			if (reqFieldError) {
				reqFieldError.key = key

				reqFieldError.locationData = getLocationOfAttribute(
					key,
					tabs,
					fixedFieldsAttrs,
					entityType
				)
				errors.push(reqFieldError)

				if (!reqFieldError.locationData)
					console.error("location for field '" + key + "' was not found")

				if (
					reqFieldError.locationData &&
					reqFieldError.locationData.type === 'system_tab'
				) {
					copySystemTabErrorForUserTab(key, tabs, reqFieldError, errors)
				}
			}
		} else {
			if (
				['procedure_modified_datetime', 'maturity_date'].indexOf(key) === -1
			) {
				validateEvField(
					key,
					fieldValue,
					entityAttr,
					tabs,
					fixedFieldsAttrs,
					entityType,
					errors
				)
			}
		}
	})

	if (dynamicAttrs && dynamicAttrs.length) {
		dynamicAttrs.forEach(function (dAttrData) {
			var key = dAttrData.attribute_type_object.user_code
			var fieldValue = evHelperService.getDynamicAttrValue(dAttrData)

			/*if (!fieldValue && entity[key]) {
                    fieldValue = entity[key];
                }*/
			if (dAttrData.attribute_type_object.value_type === 30 && fieldValue) {
				fieldValue = fieldValue.classifier
			}

			var attrType

			for (var i = 0; i < attrsTypes.length; i++) {
				if (attrsTypes[i].user_code === key) {
					attrType = attrsTypes[i]
					break
				}
			}

			if (attrType) {
				validateEvField(
					key,
					fieldValue,
					attrType,
					tabs,
					fixedFieldsAttrs,
					entityType,
					errors
				)
			}
		})
	}

	return errors
}

var validateInstrumentTypeAccruals = function (entity, errorsList) {
	if (entity.accruals && entity.accruals.length) {
		/* const accrualRequiredProperties = {
                "name": "not_empty",
                "data": {
                    "form_message": "not_empty",
                    "items": [
                        {
                            "override_name": "",
                        }
                    ]
                }
            }; */

		entity.accruals.forEach((accrual) => {
			var accrualName = accrual.name || ''
			var accrualNumber = accrual.order + 1

			if (!accrual.name) {
				errorsList.push({
					key: 'accruals',
					locationData: {
						type: 'system_tab',
						name: 'Accruals',
						validatorText: 'ACCRUAL #' + accrualNumber + ' ' + accrualName,
						accordionIndex: accrual.order,
					},
					fieldName: 'Accrual name',
					message: 'Accrual #' + accrualNumber + ' should be named',
				})
			}

			if (!accrual.data.form_message) {
				errorsList.push({
					key: 'accruals',
					locationData: {
						type: 'system_tab',
						name: 'Accruals',
						validatorText: 'ACCRUAL #' + accrualNumber + ' ' + accrualName,
						accordionIndex: accrual.order,
					},
					fieldName: 'Message on the form',
					message: 'Field should not be empty.',
				})
			}

			accrual.data.items.forEach((item) => {
				if (item.to_show) {
					if (!item.default_value && item.default_value !== 0) {
						errorsList.push({
							key: 'accruals',
							locationData: {
								type: 'system_tab',
								name: 'Accruals',
								validatorText: 'ACCRUAL #' + accrualNumber + ' ' + accrualName,
								accordionIndex: accrual.order,
							},
							tableName: '',
							rowName: item.name,
							columnName: 'Default Value',
							message: 'Cell should not be empty.',
						})
					}
				}
			})
		})
	}
}

var validateInstrumentTypeEvents = function (entity, errorsList) {
	if (entity.events && entity.events.length) {
		entity.events.forEach((event) => {
			var eventName = event.name || ''
			var eventNumber = event.order + 1

			if (!event.name) {
				errorsList.push({
					key: 'events',
					locationData: {
						type: 'system_tab',
						name: 'Events',
						validatorText: 'EVENT #' + eventNumber + ' ' + eventName,
						accordionIndex: event.order,
					},
					fieldName: 'Event name',
					message: 'Event #' + eventNumber + ' should be named',
				})
			}

			if (!event.data.form_message) {
				errorsList.push({
					key: 'events',
					locationData: {
						type: 'system_tab',
						name: 'Events',
						validatorText: 'EVENT #' + eventNumber + ' ' + eventName,
						accordionIndex: event.order,
					},
					fieldName: 'Message on the form',
					message: 'Field should not be empty.',
				})
			}

			if (!event.data.event_class) {
				errorsList.push({
					key: 'events',
					locationData: {
						type: 'system_tab',
						name: 'Events',
						validatorText: 'EVENT #' + eventNumber + ' ' + eventName,
						accordionIndex: event.order,
					},
					fieldName: 'Event class',
					message: 'Field should not be empty.',
				})
			}

			var validateEventRow = function (item) {
				if (item.to_show) {
					if (!item.default_value && item.default_value !== 0) {
						errorsList.push({
							key: 'events',
							locationData: {
								type: 'system_tab',
								name: 'Events',
								validatorText: 'EVENT #' + eventNumber + ' ' + eventName,
								accordionIndex: event.order,
							},
							tableName: '',
							rowName: item.name,
							columnName: 'Default Value',
							message: 'Cell should not be empty.',
						})
					}
				}
			}

			event.data.items.forEach(validateEventRow)
			// if (!event.data.items_blocked) event.data.blockableItems.forEach(validateEventRow);
			event.data.items2.forEach(validateEventRow)

			if (event.data.actions.length) {
				event.data.actions.forEach((action, index) => {
					if (!action.transaction_type) {
						errorsList.push({
							key: 'events',
							locationData: {
								type: 'system_tab',
								name: 'Events',
								validatorText: 'EVENT #' + eventNumber + ' ' + eventName,
								accordionIndex: event.order,
							},
							// tableName: "Actions",
							tableName: '',
							rowName: 'Action # ' + (index + 1),
							columnName: 'Transaction type',
							message: 'Cell should not be empty.',
						})
					}

					if (!action.text) {
						errorsList.push({
							key: 'events',
							locationData: {
								type: 'system_tab',
								name: 'Events',
								validatorText: 'EVENT #' + eventNumber + ' ' + eventName,
								accordionIndex: event.order,
							},
							// tableName: "Actions",
							tableName: '',
							rowName: 'Action # ' + (index + 1),
							columnName: 'Text',
							message: 'Cell should not be empty.',
						})
					}
				})
			}
		})
	}
}

var validateComplexTransactionUserInput = function (
	userInput,
	fieldValue,
	transactionsTypeActions,
	tabs,
	errorsList
) {
	validateEvField(
		userInput.name,
		fieldValue,
		userInput,
		tabs,
		[],
		'complex-transaction',
		errorsList
	)

	var uInputIsNotParsed = true
	if (
		errorsList.length &&
		errorsList[errorsList.length - 1].key === userInput.name
	) {
		uInputIsNotParsed = false
	}

	if ((!userInput.options || !userInput.options.notNull) && uInputIsNotParsed) {
		// fields of user inputs that are used inside of actions should be filled

		if (userInput.frontOptions && userInput.frontOptions.usedInExpr) {
			if (
				(typeof fieldValue === 'number' && isNaN(fieldValue)) ||
				fieldValue === undefined ||
				fieldValue === null ||
				fieldValue === ''
			) {
				var errorObj = {
					key: userInput.name,
					locationData: getLocationOfAttribute(userInput.name, tabs, []),
					fieldName: userInput.verbose_name || userInput.name,
				}

				var uInputValueType = getAttributeValueType(userInput)
				errorObj.message = getErrorMessageByValueType(
					fieldValue,
					uInputValueType
				)

				if (userInput.options && userInput.options.fieldName) {
					errorObj.fieldName = userInput.options.fieldName
				}

				errorsList.push(errorObj)
			}
		}
		/*var i, a;
            for (i = 0; i < transactionsTypeActions.length; i++) {

                var action = transactionsTypeActions[i];
                var actionKeys = Object.keys(action);

                for (a = 0; a < actionKeys.length; a++) {

                    var aKey = actionKeys[a];

                    if (action[aKey] && typeof action[aKey] === 'object') {

                        var actionItem = action[aKey];
                        var actionItemKeys = Object.keys(actionItem);

                        actionItemKeys.forEach(function (aItemKey) {

                            if (aItemKey.indexOf('_object') < 0 &&
                                aItemKey.indexOf('_input') < 0 &&
                                aItemKey.indexOf('_phantom') && aItemKey !== 'action_notes') {

                                if ((aItemKey === 'notes' || !actionItem.hasOwnProperty(aItemKey + '_input')) &&
                                    actionItem[aItemKey] && typeof actionItem[aItemKey] === 'string') {

                                    var middleOfExpr = '[^A-Za-z_.]' + userInput.name + '(?![A-Za-z1-9_])';
                                    var beginningOfExpr = '^' + userInput.name + '(?![A-Za-z1-9_])';

                                    var inputRegExpObj = new RegExp(beginningOfExpr + '|' + middleOfExpr, 'g');

                                    if (actionItem[aItemKey].match(inputRegExpObj)) {

                                        if ((typeof fieldValue === 'number' && isNaN(fieldValue)) ||
                                            fieldValue === undefined ||
                                            fieldValue === null ||
                                            fieldValue === '') {

                                            console.log('fieldValue', fieldValue);

                                            var errorObj = {
                                                locationData: getLocationOfAttribute(userInput.name, tabs, []),
                                                fieldName: userInput.verbose_name || userInput.name,
                                                message: 'Field should not be empty.'
                                            };

                                            if (userInput.options && userInput.options.fieldName) {
                                                errorObj.fieldName = userInput.options.fieldName;
                                            }

                                            errorsList.push(errorObj);

                                        }

                                    }

                                }

                            }

                        });

                    }

                }

            }*/
	}
}

/**
 *
 * @param entity {Object}
 * @param transactionsTypeActions
 * @param tabs {Object} - tabs from edit layout
 * @param entityAttrs {Array.<Object>} - array of entity attributes
 * @param attrsTypes {Array.<Object>} - array of attribute types created by user
 * @param userInputs {Array.<Object>} - array of user inputs from transaction type
 * @returns {Array.<Object>} - array of errors
 */
var validateComplexTransaction = function (
	entity,
	transactionsTypeActions,
	tabs,
	entityAttrs,
	attrsTypes,
	userInputs
) {
	var errors = validateEntityFields(
		entity,
		'complex-transaction',
		tabs,
		[],
		entityAttrs,
		attrsTypes
	)

	if (userInputs && userInputs.length) {
		userInputs.forEach(function (uInput) {
			var iName = uInput.name
			var fieldValue = entity.values[iName]

			validateComplexTransactionUserInput(
				uInput,
				fieldValue,
				transactionsTypeActions,
				tabs,
				errors
			)
		})
	}

	return errors
}

/**
 * If field inside popup has an error, mark it.
 *
 * @param fixedAreaPopup {Object} - popup data
 * @param faFieldProp {string} - property name by which field stored inside fixedAreaPopup
 * @param errorMessage {string}
 * @returns {boolean} - whether field has and error
 */
const markErrorInsideFAPopup = function (
	fixedAreaPopup,
	faFieldProp,
	errorMessage
) {
	var popupFieldsKeysList = []
	if (fixedAreaPopup) {
		popupFieldsKeysList = Object.keys(fixedAreaPopup.fields)
	}

	var errorIsInsidePopup =
		popupFieldsKeysList.length && popupFieldsKeysList.includes(faFieldProp)

	if (errorIsInsidePopup) {
		// fixedAreaPopupChanged = true;
		// Trigger error mode of the field inside popup of fixed area
		fixedAreaPopup.fields[faFieldProp].event = {
			key: 'error',
			error: errorMessage,
		}
		fixedAreaPopup.fields[faFieldProp].error = errorMessage

		fixedAreaPopup.event = {
			key: 'error',
			error: 'There are fields with errors inside',
		}
		fixedAreaPopup.error = 'There are fields with errors inside'

		return true
	}

	return false
}

/**
 * Highlight errors on the form
 *
 * @param errors {Array.<Object>} - data for dialog with validator results
 * @param evEditorDataService {Object} - entityViewerEditorDataService
 * @param evEditorEventService {Object} - entityViewerEditorEventService
 * @param $mdDialog {Object}
 * @param $event {Object} - event object
 * @param entityType {string}
 * @param entityNamesFieldEventService {Object}
 * @returns {Object|null} - changed fixedAreaPopup or null
 */
const processTabsErrors = function (
	errors,
	evEditorDataService,
	evEditorEventService,
	$mdDialog,
	$event,
	entityType,
	entityNamesFieldEventService
) {
	const entityTabsMenuBtn = document.querySelector('.entityTabsMenu')

	let locsWithErrors = evEditorDataService.getLocationsWithErrors()
	let formErrorsList = evEditorDataService.getFormErrorsList()

	// let fixedAreaPopupChanged = false;
	let fixedAreaErrorsData = {}

	errors.forEach(function (errorObj) {
		if (errorObj.locationData) {
			if (['user_tab', 'system_tab'].includes(errorObj.locationData.type)) {
				const tabName = errorObj.locationData.name.toLowerCase()
				const tabType = errorObj.locationData.type // system_tab || user_tab

				let tabIsNotMarked = false

				if (!locsWithErrors[tabType].hasOwnProperty(tabName)) {
					locsWithErrors[tabType][tabName] = [errorObj.key]
					tabIsNotMarked = true
				} else if (!locsWithErrors[tabType][tabName].includes(errorObj.key)) {
					locsWithErrors[tabType][tabName].push(errorObj.key)
					tabIsNotMarked = true
				}

				if (tabIsNotMarked) {
					if (!formErrorsList.includes(errorObj.key)) {
						// component can be in multiple tabs (e.g. maturity_date) but formErrorsList should contain only one key

						formErrorsList.push(errorObj.key)
					}

					if (tabType === 'user_tab') {
						const selectorString =
							".evFormUserTabName[data-tab-name='" + tabName + "']"
						const tabNameElem = document.querySelector(selectorString)

						if (tabNameElem) tabNameElem.classList.add('error-tab')
					} else if (tabType === 'system_tab') {
						entityTabsMenuBtn.classList.add('error-tab')
					}
				}
			} else if (errorObj.locationData.type === 'fixed_area') {
				var fieldProp = errorObj.key
				var fixedAreaFieldProp = getFieldKeyForFAPopup(fieldProp, entityType)

				var errorIsNotRegistered =
					!locsWithErrors.fixed_area.fields.includes(fieldProp)

				if (errorIsNotRegistered) {
					locsWithErrors.fixed_area.fields.push(fieldProp)

					// fixedAreaEventObject.event = {key: 'mark_not_valid_fields'};

					// fixedAreaErrorsData = markErrorInsideFAPopup(fixedAreaErrorsData, fixedAreaFieldProp, errorObj.message);
					fixedAreaErrorsData[fixedAreaFieldProp] = {
						key: 'error',
						error: errorObj.message,
					}
				}

				if (!formErrorsList.includes(fieldProp)) formErrorsList.push(fieldProp)
			}
		}
	})

	evEditorDataService.setLocationsWithErrors(locsWithErrors)
	evEditorDataService.setFormErrorsList(formErrorsList)

	if (Object.keys(fixedAreaErrorsData).length) {
		entityNamesFieldEventService.dispatchEvent(
			directivesEvents.TURN_ON_ERROR_MODE,
			fixedAreaErrorsData
		)
	}

	evEditorEventService.dispatchEvent(evEditorEvents.MARK_FIELDS_WITH_ERRORS)

	$mdDialog.show({
		controller: 'EvAddEditValidationDialogController as vm',
		templateUrl: 'views/dialogs/ev-add-edit-validation-dialog-view.html',
		targetEvent: $event,
		multiple: true,
		locals: {
			data: {
				errorsList: errors,
			},
		},
	})

	// if (fixedAreaPopupChanged) return fixedAreaPopup;

	// return null;
}

/**
 * Highlight errors on the form
 *
 * @param errors {Array.<Object>} - data for dialog with validator results
 * @param evEditorDataService {Object} - entityViewerEditorDataService
 * @param evEditorEventService {Object} - entityViewerEditorEventService
 * @param $mdDialog {Object}
 * @param $event {Object} - event object
 * @returns {Object|null} - changed fixedAreaPopup or null
 */
const processTabsErrorsInstrumentType = function (
	errors,
	evEditorDataService,
	evEditorEventService,
	$mdDialog,
	$event
) {
	let locsWithErrors = evEditorDataService.getLocationsWithErrors()
	let formErrorsList = evEditorDataService.getFormErrorsList()

	let fixedAreaPopupChanged = false

	errors.forEach(function (errorObj) {
		if (errorObj.locationData) {
			if (['user_tab', 'system_tab'].includes(errorObj.locationData.type)) {
				const tabName = errorObj.locationData.name.toLowerCase()
				const tabType = errorObj.locationData.type // system_tab || user_tab

				let tabIsNotMarked = false

				if (!locsWithErrors[tabType].hasOwnProperty(tabName)) {
					locsWithErrors[tabType][tabName] = [errorObj.key]
					tabIsNotMarked = true
				} else if (!locsWithErrors[tabType][tabName].includes(errorObj.key)) {
					locsWithErrors[tabType][tabName].push(errorObj.key)
					tabIsNotMarked = true
				}

				if (tabIsNotMarked) {
					if (!formErrorsList.includes(errorObj.key)) {
						// component can be in multiple tabs (e.g. maturity_date) but formErrorsList should contain only one key

						formErrorsList.push(errorObj.key)
					}

					if (tabType === 'user_tab') {
						const selectorString =
							".evFormUserTabName[data-tab-name='" + tabName + "']"
						const tabNameElem = document.querySelector(selectorString)

						if (tabNameElem) tabNameElem.classList.add('error-tab')
					} else if (tabType === 'system_tab') {
						const selectorString =
							".evFormSystemTabName[data-tab-name='" + tabName + "']"
						const tabNameElem = document.querySelector(selectorString)

						if (tabNameElem) tabNameElem.classList.add('error-tab')
					}
				}
			}
		}
	})

	evEditorDataService.setLocationsWithErrors(locsWithErrors)
	evEditorDataService.setFormErrorsList(formErrorsList)

	evEditorEventService.dispatchEvent(evEditorEvents.MARK_FIELDS_WITH_ERRORS)

	$mdDialog.show({
		controller: 'EvAddEditValidationDialogController as vm',
		templateUrl: 'views/dialogs/ev-add-edit-validation-dialog-view.html',
		targetEvent: $event,
		multiple: true,
		locals: {
			data: {
				errorsList: errors,
			},
		},
	})

	if (fixedAreaPopupChanged) return fixedAreaPopup

	return null
}

/**
 *
 * @param errorKey {string} - name of property inside entity object
 * @param formErrorsList {Array.<string>} - list of error keys
 * @param locationsWithErrors {{system_tab: Object, user_tab: Object}} - map of tabs with errors
 */
var clearFormTabError = function (
	errorKey,
	formErrorsList,
	locationsWithErrors
) {
	var errorIndex = formErrorsList.indexOf(errorKey)
	formErrorsList.splice(errorIndex, 1)

	//<editor-fold desc="Remove error mark from fixed area popup">
	/* var i;
        for (i = 0; i < locationsWithErrors['fixed_area'].fields.length; i++) {

            var fieldKey = locationsWithErrors['fixed_area'].fields[i];

            if (fieldKey === errorKey) {

                locationsWithErrors['fixed_area'].fields.splice(i, 1);

                if (!locationsWithErrors['fixed_area'].fields.length) {

                    var fixedAreaPopupElem = document.querySelector('.entityEditorFixedAreaPopup');
                    fixedAreaPopupElem.classList.remove("error");

                }

                break;

            }

        } */
	//</editor-fold>

	var removeErrorMarkFromTabs = function (tabType) {
		var tabs = locationsWithErrors[tabType]
		var tabKeys = Object.keys(tabs)

		var t
		for (t = 0; t < tabKeys.length; t++) {
			var tKey = tabKeys[t]
			var tabErrorsList = tabs[tKey] // list of errors inside tab

			var tabErrorIndex = tabErrorsList.indexOf(errorKey)

			if (tabErrorIndex > -1) {
				tabErrorsList.splice(tabErrorIndex, 1)

				if (!tabErrorsList.length) {
					// if there is no more errors inside tab, remove error mark

					delete tabs[tKey]

					if (tabType === 'user_tab') {
						var selectorString =
							".evFormUserTabName[data-tab-name='" + tKey + "']"
						var tabNameElem = document.querySelector(selectorString)

						if (tabNameElem) tabNameElem.classList.remove('error-tab')
					} else if (tabType === 'system_tab' && !Object.keys(tabs).length) {
						var entityTabsMenuBtn = document.querySelector('.entityTabsMenu')

						entityTabsMenuBtn.classList.remove('error-tab')
					}
				}

				break
			}
		}
	}

	removeErrorMarkFromTabs('system_tab')
	removeErrorMarkFromTabs('user_tab')
}

/**
 * Validate single property of entity.
 *
 * @param errorKey {string} - name of property inside entity object
 * @param attributes {{entityAttrs: Array, attrsTypes: Array, [userInputs]: Array}} - userInputs for complex transactions only
 * @param entity {Object}
 * @param entityType {string}
 * @param tabs {Object} - tabs from edit layout
 */
var validateEntityProperty = function (
	errorKey,
	attributes,
	entity,
	entityType,
	tabs
) {
	var errors = []

	if (entityType === 'instrument-type' && errorKey === 'accruals') {
		validateInstrumentTypeAccruals(entity, errors)
	} else if (entityType === 'instrument-type' && errorKey === 'events') {
		validateInstrumentTypeEvents(entity, errors)
	} else {
		// validate fields inside system or dynamic tabs

		var eAttrsToCheck = []
		var attrTypesToCheck = []
		var uInputsToCheck = []

		var entityAttrs = attributes.entityAttrs
		var attrsTypes = attributes.attrsTypes
		var userInputs = attributes.userInputs

		var attrNotFound = true
		var i, a, b

		for (i = 0; i < entityAttrs.length; i++) {
			if (entityAttrs[i].key === errorKey) {
				eAttrsToCheck.push(entityAttrs[i])
				attrNotFound = false
				break
			}
		}

		if (attrNotFound && attrsTypes) {
			for (a = 0; a < attrsTypes.length; a++) {
				if (attrsTypes[a].user_code === errorKey) {
					attrTypesToCheck.push(attrsTypes[a])
					attrNotFound = false
					break
				}
			}
		}

		if (attrNotFound && userInputs) {
			for (b = 0; b < userInputs.length; b++) {
				if (userInputs[b].user_code === errorKey) {
					uInputsToCheck.push(attrsTypes[b])
					break
				}
			}
		}

		errors = validateEntityFields(
			entity,
			entityType,
			tabs,
			[],
			eAttrsToCheck,
			attrTypesToCheck
		)
	}

	return errors
}

/**
 * Deregister field error inside fixed area.
 *
 * @param errorKey {string} - name of property inside entity object
 * @param evEditorDataService {Object}
 * @param entityAttrs {Array}
 * @param entity {Object}
 */
var checkFixedAreaForErrorFields = function (
	errorKey,
	evEditorDataService,
	entityAttrs,
	entity
) {
	var formErrorsList = evEditorDataService.getFormErrorsList()
	var locsWithErrors = evEditorDataService.getLocationsWithErrors()

	if (formErrorsList.length) {
		var fieldValue = entity[errorKey]
		var error = validateRequiredEntityField(errorKey, fieldValue, entityAttrs)

		if (locsWithErrors.fixed_area.fields.includes(errorKey)) {
			if (!error) {
				// if no errors left, remove marking from field

				var felIndex = formErrorsList.indexOf(errorKey)
				formErrorsList.splice(felIndex, 1)

				var lweIndex = locsWithErrors.fixed_area.fields.indexOf(errorKey)
				locsWithErrors.fixed_area.fields.splice(lweIndex, 1)
			}
		} else if (error.length) {
			// check for new error inside tab of errors

			formErrorsList.push(errorKey)
			locsWithErrors.fixed_area.fields.push(errorKey)
		}
	}

	evEditorDataService.setFormErrorsList(formErrorsList)
	evEditorDataService.setLocationsWithErrors(locsWithErrors)
}

/**
 * Deregister field error inside tabs. Remove error mark from tab if all it's errors has been fixed.
 *
 * @param errorKey {string} - name of property inside entity object
 * @param evEditorDataService {Object}
 * @param attributes {{entityAttrs: Array, attrsTypes: Array, [userInputs]: Array}} - userInputs for complex transactions only
 * @param entity {Object}
 * @param entityType {string}
 * @param tabs {Object} - tabs from edit layout
 */
var checkTabsForErrorFields = function (
	errorKey,
	evEditorDataService,
	attributes,
	entity,
	entityType,
	tabs
) {
	var formErrorsList = evEditorDataService.getFormErrorsList()
	var locsWithErrors = evEditorDataService.getLocationsWithErrors()

	if (formErrorsList.length) {
		// var fieldIndex = formErrorsList.indexOf(fieldKey);
		// var errorData = formErrorsList[fieldIndex];
		// var location = locsWithErrors[errorData.location.type]; // system_tab || user_tab

		if (formErrorsList.includes(errorKey)) {
			/* var errors = [];

                if (entityType === 'instrument-type' && errorKey === 'accruals') {
                    validateInstrumentTypeAccruals(entity, errors);

                } else if (entityType === 'instrument-type' && errorKey === 'events') {
                    validateInstrumentTypeEvents(entity, errors);

                }
                else { // validate fields inside system or dynamic tabs

                    var eAttrsToCheck = [];
                    var attrTypesToCheck = [];
                    var uInputsToCheck = [];

                    var entityAttrs = attributes.entityAttrs;
                    var attrsTypes = attributes.attrsTypes;
                    var userInputs = attributes.userInputs;

                    var attrNotFound = true;
                    var i,a,b;

                    for (i = 0; i < entityAttrs.length; i++) {
                        if (entityAttrs[i].key === errorKey) {

                            eAttrsToCheck.push(entityAttrs[i]);
                            attrNotFound = false;
                            break;

                        }
                    }

                    if (attrNotFound && attrsTypes) {

                        for (a = 0; a < attrsTypes.length; a++) {
                            if (attrsTypes[a].user_code === errorKey) {

                                attrTypesToCheck.push(attrsTypes[a]);
                                attrNotFound = false;
                                break;

                            }
                        }

                    }

                    if (attrNotFound && userInputs) {

                        for (b = 0; b < userInputs.length; b++) {
                            if (userInputs[b].user_code === errorKey) {

                                uInputsToCheck.push(attrsTypes[b]);
                                break;

                            }
                        }

                    }

                    errors = validateEntityFields(entity, entityType, tabs, [], eAttrsToCheck, attrTypesToCheck, uInputsToCheck);

                } */

			var errors = validateEntityProperty(
				errorKey,
				attributes,
				entity,
				entityType,
				tabs
			)

			if (!errors.length) {
				// if no errors left, remove marking from tab
				clearFormTabError(errorKey, formErrorsList, locsWithErrors)
			}
		} else {
			// check for new error inside tab of errors

			var fieldLocation = getLocationOfAttribute(errorKey, tabs, [], entityType)

			if (fieldLocation) {
				// register error when it appears inside of tab with errors

				var tabName = fieldLocation.name.toLowerCase()
				var fieldInsideTabWithError =
					locsWithErrors[fieldLocation.type] &&
					locsWithErrors[fieldLocation.type][tabName] &&
					locsWithErrors[fieldLocation.type][tabName].length

				if (fieldInsideTabWithError) {
					var errors = validateEntityProperty(
						errorKey,
						attributes,
						entity,
						entityType,
						tabs
					)

					if (errors.length) {
						formErrorsList.push(errorKey)

						locsWithErrors[fieldLocation.type][tabName].push(errorKey)
						/* if (fieldLocation.type === 'system_tab') { // same field can be inside system and dynamic tabs at once (i.e. maturity_date)

                                var fieldLocationInsideUserTab = getLocationOfAttributeInsideUserTabs(errorKey, tabs);
                                var userTabName = fieldLocationInsideUserTab.name.toLowerCase();

                                if (fieldLocationInsideUserTab) {

                                    if (locsWithErrors['user_tab'] &&
                                        locsWithErrors['user_tab'][userTabName]) {

                                        locsWithErrors['user_tab'][userTabName].push(errorKey);

                                    }

                                }

                            } */
					}
				}
				/* if (fieldLocation.type === 'system_tab') { // same field can be inside user and dynamic tabs at once (i.e. maturity_date)

                        var fieldLocationInsideUserTab = getLocationOfAttributeInsideUserTabs(errorKey, tabs);
                        tabName = fieldLocationInsideUserTab.name.toLowerCase();

                        if (fieldLocationInsideUserTab) {

                            if (locsWithErrors['system_tab'] &&
                                locsWithErrors['system_tab'][tabName]) {

                                locsWithErrors['system_tab'][tabName].push(errorKey);

                            }

                        }

                    } */
			}
		}
	}

	evEditorDataService.setFormErrorsList(formErrorsList)
	evEditorDataService.setLocationsWithErrors(locsWithErrors)
}

var validateEntity = function (
	item,
	entityType,
	tabs,
	fixedFieldsAttrs,
	entityAttrs,
	attrsTypes
) {
	var errors = validateEntityFields(
		item,
		entityType,
		tabs,
		fixedFieldsAttrs,
		entityAttrs,
		attrsTypes
	)

	if (entityType === 'instrument-type') {
		validateInstrumentTypeAccruals(item, errors)
		validateInstrumentTypeEvents(item, errors)
	}

	return errors
}

var createFieldsTree = function (tabs) {
	var tabsCopy = JSON.parse(JSON.stringify(tabs))

	var fieldsTree = {}

	tabsCopy.forEach(function (tab) {
		fieldsTree[tab.tabOrder] = {}
		var f
		for (f = 0; f < tab.layout.fields.length; f++) {
			var treeTab = fieldsTree[tab.tabOrder]

			var field = tab.layout.fields[f]
			var fRow = field.row
			var fCol = field.column

			if (!treeTab[fRow]) {
				treeTab[fRow] = {}
			}

			treeTab[fRow][fCol] = field
		}
	})

	return fieldsTree
}

var createFixedAreaFieldsTree = function (fixedAreaFields) {
	var fixedAreaFieldsCopy = JSON.parse(JSON.stringify(fixedAreaFields))
	var fixedAreaFieldsTree = {}

	var i
	for (i = 0; i < fixedAreaFieldsCopy.length; i++) {
		var field = fixedAreaFields.fields[i]
		var fRow = field.row
		var fCol = field.column

		if (!fixedAreaFieldsTree[fRow]) {
			fixedAreaFieldsTree[fRow] = {}
		}

		fixedAreaFieldsTree[fRow][fCol] = field
	}

	return fixedAreaFieldsTree
}

var getMatchForLayoutFields = function (
	tab,
	tabIndex,
	attributes,
	tabResult,
	fieldsToEmptyList,
	forComplexTransaction
) {
	var i, l, e, u, a

	tab.layout.fields.forEach(function (field, fieldIndex) {
		var fieldResult = {}

		var dynamicAttrs = attributes.dynamicAttrs
		var entityAttrs = attributes.entityAttrs
		var layoutAttrs = attributes.layoutAttrs

		if (field) {
			if (field.type !== 'empty') {
				var attrFound = false

				if (field.attribute_class === 'attr') {
					for (i = 0; i < dynamicAttrs.length; i = i + 1) {
						if (field.key) {
							// for legacy input form editor layouts

							if (field.key === dynamicAttrs[i].user_code) {
								dynamicAttrs[i].options = field.options
								//fieldResult = dynamicAttrs[i];
								tabResult[field.row][field.column] = dynamicAttrs[i]
								attrFound = true
								break
							}
						} else {
							if (field.attribute.user_code) {
								if (field.attribute.user_code === dynamicAttrs[i].user_code) {
									dynamicAttrs[i].options = field.options
									fieldResult = dynamicAttrs[i]
									attrFound = true
									break
								}
							}
						}
					}

					if (!attrFound) {
						var fieldPath = {
							tabIndex: tabIndex,
							fieldIndex: fieldIndex,
						}

						fieldsToEmptyList.push(fieldPath)
					}
				} else if (field.attribute_class === 'decorationAttr') {
					for (l = 0; l < layoutAttrs.length; l = l + 1) {
						if (field.name === layoutAttrs[l].name) {
							var layoutAttr = { ...{}, ...layoutAttrs[l] } // removing mutation because the same object may be used for another decoration

							layoutAttr.options = field.options
							fieldResult = layoutAttr

							attrFound = true
							break
						}
					}
				} else {
					for (e = 0; e < entityAttrs.length; e = e + 1) {
						if (field.attribute.key === entityAttrs[e].key) {
							entityAttrs[e].options = field.options
							fieldResult = entityAttrs[e]

							attrFound = true
							break
						}
					}
				}

				if (forComplexTransaction) {
					var userInputs = attributes.userInputs

					if (field.attribute_class === 'userInput') {
						for (u = 0; u < userInputs.length; u = u + 1) {
							if (field.name === userInputs[u].name) {
								userInputs[u].options = field.options
								fieldResult = userInputs[u]

								attrFound = true

								break
							}
						}

						if (!attrFound) {
							var fieldPath = {
								tabIndex: tabIndex,
								fieldIndex: fieldIndex,
							}

							fieldsToEmptyList.push(fieldPath)
						}
					}

					fieldResult.editable = field.editable
				}

				if (field.backgroundColor) {
					fieldResult.backgroundColor = field.backgroundColor
				}
			}
		}
		//tabResult.push(fieldResult);
		tabResult[field.row][field.column] = fieldResult
	})
}

var removeFieldsWithoutMatchingAttrs = function (
	tabs,
	fieldsToEmptyList,
	dataConstructorLayout
) {
	fieldsToEmptyList.forEach(function (fieldPath) {
		if (fieldPath.tabIndex === 'fixedArea') {
			var dcLayoutFields = tabs.layout.fields
			var layoutFieldsToSave =
				dataConstructorLayout.data.fixedArea.layout.fields
		} else {
			var dcLayoutFields = tabs[fieldPath.tabIndex].layout.fields

			if (Array.isArray(dataConstructorLayout.data)) {
				// for old layouts
				var layoutFieldsToSave =
					dataConstructorLayout.data[fieldPath.tabIndex].layout.fields
			} else {
				var layoutFieldsToSave =
					dataConstructorLayout.data.tabs[fieldPath.tabIndex].layout.fields
			}
		}

		var fieldToEmptyColumn = dcLayoutFields[fieldPath.fieldIndex].column
		var fieldToEmptyRow = dcLayoutFields[fieldPath.fieldIndex].row

		dcLayoutFields[fieldPath.fieldIndex] = {
			// removing from view
			colspan: 1,
			column: fieldToEmptyColumn,
			editMode: false,
			row: fieldToEmptyRow,
			type: 'empty',
		}

		layoutFieldsToSave[fieldPath.fieldIndex] = {
			// removing from layout copy for saving
			colspan: 1,
			column: fieldToEmptyColumn,
			editMode: false,
			row: fieldToEmptyRow,
			type: 'empty',
		}
	})
}

var generateAttributesFromLayoutFields = function (
	tabs,
	attributes,
	dataConstructorLayout,
	forComplexTransaction
) {
	var result = {
		attributesLayout: {},
		dcLayoutHasBeenFixed: false,
	}

	var fieldsToEmptyList = []
	var tabResult

	if (Array.isArray(tabs)) {
		// for tabs

		result.attributesLayout = createFieldsTree(tabs)

		tabs.forEach(function (tab, tabIndex) {
			tabResult = []

			getMatchForLayoutFields(
				tab,
				tabIndex,
				attributes,
				result.attributesLayout[tab.tabOrder],
				fieldsToEmptyList,
				forComplexTransaction
			)

			//result.attributesLayout.push(tabResult);
		})
	} else {
		// for fixed area

		result.attributesLayout = createFixedAreaFieldsTree(tabs)

		getMatchForLayoutFields(
			tabs,
			'fixedArea',
			fieldsToEmptyList,
			result.attributesLayout,
			attributes,
			forComplexTransaction
		)
	}

	if (fieldsToEmptyList.length) {
		removeFieldsWithoutMatchingAttrs(
			tabs,
			fieldsToEmptyList,
			dataConstructorLayout
		)
		result.dcLayoutHasBeenFixed = true
	}

	return result
}

var fixCustomTabs = function (tabs, dataConstructorLayout) {
	var dcLayoutHasBeenFixed = false

	var fixTab = function (
		tab,
		numberOfRows,
		numberOfCols,
		viewFieldsList,
		fieldsListToSave
	) {
		var i, c
		for (i = 1; i <= numberOfRows; i++) {
			var row = tab[i]

			for (c = 1; c <= numberOfCols; c++) {
				if (!row[c]) {
					var missingSocket = {
						colspan: 1,
						column: c,
						editMode: false,
						row: i,
						type: 'empty',
					}

					viewFieldsList.push(missingSocket)
					fieldsListToSave.push(missingSocket)
					dcLayoutHasBeenFixed = true
				}
			}
		}
	}

	var tabsFieldsTree = createFieldsTree(tabs)

	if (Object.keys(tabsFieldsTree).length) {
		Object.keys(tabsFieldsTree).forEach(function (tabNumber, tabIndex) {
			var tab = tabsFieldsTree[tabIndex]
			var numberOfRows = tabs[tabIndex].layout.rows
			var numberOfCols = tabs[tabIndex].layout.columns

			var dataConstructorTabs = dataConstructorLayout.data
			if (!Array.isArray(dataConstructorTabs)) {
				dataConstructorTabs = dataConstructorLayout.data.tabs
			}

			fixTab(
				tab,
				numberOfRows,
				numberOfCols,
				tabs[tabIndex].layout.fields,
				dataConstructorTabs[tabIndex].layout.fields
			)
		})
	}

	if (tabs.isActive) {
		// for fixed area
		var fixedAreaFieldsTree = createFixedAreaFieldsTree(tabs.layout.fields)

		if (Object.keys(fixedAreaFieldsTree).length) {
			var numberOfRows = tabs.layout.rows
			var numberOfCols = tabs.layout.columns

			fixTab(
				fixedAreaFieldsTree,
				numberOfRows,
				numberOfCols,
				tabs.layout.fields,
				dataConstructorLayout.layout.fields
			)
		}
	}

	return dcLayoutHasBeenFixed
}

const instrumentTypeAttrValueMapper = (entityAttr) => {
	switch (entityAttr.value_type) {
		case 10:
			return entityAttr.value_string
		case 20:
			return entityAttr.value_float
		case 30:
			return entityAttr.value_classifier // The string comes from the server. Must be number/
		case 40:
			return entityAttr.value_date
		default:
			return null
	}
}

/** @module entityEditorHelper */
export default {
	checkEntityAttrTypes: checkEntityAttrTypes,
	removeNullFields: removeNullFields,
	clearEntityBeforeSave: clearEntityBeforeSave,
	clearUnusedAttributeValues: clearUnusedAttributeValues,
	appendAttribute: appendAttribute,
	updateAttribute: updateAttribute,
	updateValue: updateValue,

	findAttributeByKey: findAttributeByKey,
	getLocationOfAttributeInsideUserTabs: getLocationOfAttributeInsideUserTabs,
	getFieldKeyForFAPopup: getFieldKeyForFAPopup,

	checkForNotNullRestriction: checkForNotNullRestriction,
	checkForNegNumsRestriction: checkForNegNumsRestriction,
	validateEntityFields: validateEntityFields,
	validateComplexTransaction: validateComplexTransaction,
	validateEntity: validateEntity,
	processTabsErrors: processTabsErrors,
	processTabsErrorsInstrumentType: processTabsErrorsInstrumentType,

	checkFixedAreaForErrorFields: checkFixedAreaForErrorFields,
	checkTabsForErrorFields: checkTabsForErrorFields,

	generateAttributesFromLayoutFields: generateAttributesFromLayoutFields,
	fixCustomTabs: fixCustomTabs,

	instrumentTypeAttrValueMapper: instrumentTypeAttrValueMapper,
}
