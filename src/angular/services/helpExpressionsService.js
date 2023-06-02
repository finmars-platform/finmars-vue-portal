/**
 * Created by szhitenev on 13.01.2017.
 */
import { contextVariablesWords } from '@/angularntent/services/expressionsData'

import expressionService from '../services/expression.service'

import functionsItemsService from '@/angularntent/services/functionsItems'
import functionsGroupsService from '@/angularntent/services/functionsGroups'
;('use strict')

var getFunctionsItems = function () {
	/*
var prefix = baseUrlService.getMasterUserPrefix();
var apiVersion = baseUrlService.getApiVersion();

return window.fetch('portal/content/json/functions_items.json').then(function (data) {
            return data.json();
        })*/
	return JSON.parse(JSON.stringify(functionsItemsService.functionsItems))
}

var getFunctionsGroups = function () {
	/*
var prefix = baseUrlService.getMasterUserPrefix();
var apiVersion = baseUrlService.getApiVersion();

return window.fetch('portal/content/json/functions_groups.json').then(function (data) {
            return data.json();
        })*/
	return functionsGroupsService.functionsGroups
}

var filterExpressions = function (expressions, data) {
	var result = []

	result = result.concat(expressions)

	if (data && data.functions) {
		data.functions.forEach(function (items) {
			if (items) {
				result = result.concat(items)
			}
		})
	}

	result = result.map(function (item) {
		item.search_index = item.name + ' ' + item.func

		return item
	})

	return result
}

var isBracketsValid = function (expression, leftBracket, rightBracket) {
	var result = true
	var container = []
	var indexContainer = []

	for (var i = 0; i < expression.length; i = i + 1) {
		if (expression[i] === leftBracket) {
			container.push(leftBracket)
			indexContainer.push(i)
		} else {
			if (expression[i] === rightBracket) {
				if (
					container.length &&
					container[container.length - 1] === leftBracket
				) {
					container.pop()
					indexContainer.pop()
				} else {
					container.push(rightBracket)
					indexContainer.push(i)

					result = false

					break
				}
			}
		}
	}

	if (container.length > 0) {
		result = false
	}

	var resultObj = {
		status: result,
	}

	if (result === false) {
		resultObj.errorIndex = indexContainer[container.length - 1]
	}

	return resultObj
}

var insert = function (str, index, value) {
	return str.substr(0, index) + value + str.substr(index)
}

var getFunctionWords = function (expressionsList) {
	return expressionsList
		.filter(function (item) {
			// return item.func.includes('(') || (item.validation_data && item.validation_data.type === "function");
			return item.validation.func.includes('(')
		})
		.map(function (item) {
			/* if (item.validation_data) {
					return item.validation_data.key_words[0];
				} */

			return item.validation.func.split('(')[0]
		})
}

var getPropertiesWords = function (expressionsList) {
	var propertiesWords = []

	var propertiesWordsTmp = expressionsList
		.filter(function (item) {
			return item.validation.func.indexOf(']') !== -1
		})
		.map(function (item) {
			return item.validation.func.split('].')[1]
		})

	propertiesWordsTmp.forEach(function (word) {
		if (word) {
			var pieces = word.split('.')

			pieces.forEach(function (pieceWord) {
				if (propertiesWords.indexOf(pieceWord) === -1) {
					propertiesWords.push(pieceWord)
				}
			})
		}
	})

	expressionsList.forEach(function (item) {
		if (item.groups === 'custom_field') {
			var pieces = item.validation.func.split('custom_fields.')

			if (pieces.length > 1) {
				propertiesWords.push(pieces[1])
			}
		}
	})

	return propertiesWords
}

var getInputWords = function (data) {
	var result = []

	if (data && data.functions) {
		data.functions.forEach(function (funcGroup) {
			funcGroup.forEach(function (item) {
				var itemFunc = item.hasOwnProperty('validation')
					? item.validation.func
					: item.func

				if (itemFunc.indexOf('[') !== -1) {
					var func = itemFunc.split('[').join('').split(']').join('')

					result.push(func)
				} else {
					result.push(itemFunc)
				}
			})
		})
	}

	result.push('transactions')
	result.push('custom_fields')
	result.push('this')

	return result
}

var lookupForInput = function (expression, currentIndex) {
	var i

	var result = false
	var count = 0

	for (i = currentIndex; i < expression.length; i = i + 1) {
		if (expression[i].match(new RegExp(/^[a-zA-Z0-9_]*$/))) {
			count = count + 1
		} else {
			if (expression[i] === '(') {
				count = 0 // we found a function
			}

			break
		}
	}

	if (count > 0) {
		result = true
	}

	return result
}

var lookupForFunction = function (expression, currentIndex) {
	var i

	var result = false
	var count = 0
	var functionName = ''

	for (i = currentIndex; i < expression.length; i = i + 1) {
		if (expression[i].match(new RegExp(/^[a-zA-Z0-9_]*$/))) {
			functionName += expression[i]
			count = count + 1
		} else {
			if (functionName && expression[i] === '(') {
				result = true
			}

			break
		}
	}

	return result
}

var eatNumber = function (expression, index) {
	var token = {
		value: '',
		type: 'number',
	}

	for (; index < expression.length; index = index + 1) {
		if (/^\d+$/.test(expression[index])) {
			token.value = token.value + expression[index]
		} else if (
			// check for dot in float number
			expression[index] === '.' &&
			/^\d+$/.test(expression[index + 1]) &&
			token.type === 'number'
		) {
			token.type = 'float_number'
			token.value = token.value + expression[index]
		} else {
			break
		}
	}

	return token
}

/* var eatFloatNumber = function (expression, index) {

    	var token = {
			value: '',
			type: 'float_number'
		};


    	index++; // skipping '.'

		for (; index < expression.length; index = index + 1) {

			if (/^\d+$/.test(expression[index])) {
				token.value = token.value + expression[index]
			} else {
				break;
			}

		}

		return token;

	} */

var eatInput = function (expression, index) {
	var token = {
		value: '',
		type: 'input',
	}

	for (; index < expression.length; index = index + 1) {
		if (expression[index].match(new RegExp(/^[a-zA-Z0-9_]*$/))) {
			token.value = token.value + expression[index]
		} else {
			break
		}
	}

	return token
}

var eatFunction = function (expression, index) {
	var token = {
		value: '',
		type: 'function',
	}

	for (; index < expression.length; index = index + 1) {
		if (expression[index].match(new RegExp(/^[a-zA-Z0-9_]*$/))) {
			token.value = token.value + expression[index]
		} else {
			break
		}
	}

	return token
}

var eatProperty = function (expression, index) {
	var token = {
		value: '',
		type: 'property',
	}

	index = index + 1

	for (; index < expression.length; index = index + 1) {
		if (expression[index].match(new RegExp(/^[a-zA-Z0-9_]*$/))) {
			token.value = token.value + expression[index]
		} else {
			break
		}
	}

	return token
}

var eatSpecialSymbol = function (expression, index) {
	var token = {
		value: '',
		type: 'special',
	}

	if (['+', '-', '/', '*'].indexOf(expression[index]) !== -1) {
		token.value = token.value + expression[index]
	}

	return token
}

var eatEmptySpace = function (expression, index) {
	var token = {
		value: '',
		type: 'empty',
	}

	for (; index < expression.length; index = index + 1) {
		if (/^\s+$/.test(expression[index])) {
			token.value = token.value + expression[index]
		} else {
			break
		}
	}

	return token
}

var eatSingleQuoteString = function (expression, index) {
	var token = {
		value: "'",
		type: 'single_quote_string',
	}

	index = index + 1

	for (; index < expression.length; index = index + 1) {
		if (expression[index] !== "'") {
			token.value = token.value + expression[index]
		} else {
			token.value = token.value + "'"
			break
		}
	}

	return token
}

var eatDoubleQuoteString = function (expression, index) {
	var token = {
		value: '"',
		type: 'double_quote_string',
	}

	index = index + 1

	for (; index < expression.length; index = index + 1) {
		if (expression[index] !== '"') {
			token.value = token.value + expression[index]
		} else {
			token.value = token.value + '"'
			break
		}
	}

	return token
}

var getHtmlExpression = function (expression, data, expressionsList) {
	var result = ''
	var status
	var faultyParts = []

	var functionWords = getFunctionWords(expressionsList)
	var propertiesWords = getPropertiesWords(expressionsList)
	var inputWords = getInputWords(data)

	var reservedWords = [
		'decimal_pos',
		'thousand_sep',
		'use_grouping',
		'True',
		'False',
		'None',
		'format',
	] // TODO remove 'format' if allowed to make validation of function arguments

	var processing = true
	var currentIndex = 0
	var previousIndex = null

	var token = {
		value: '',
		type: '',
	}

	var previous_token = null

	while (processing) {
		if (/^\d+$/.test(expression[currentIndex])) {
			token = eatNumber(expression, currentIndex)
			currentIndex = currentIndex + token.value.length
		} else if (/^\s+$/.test(expression[currentIndex])) {
			token = eatEmptySpace(expression, currentIndex)
			currentIndex = currentIndex + token.value.length
		} else if (['+', '-', '/', '*'].indexOf(expression[currentIndex]) !== -1) {
			token = eatSpecialSymbol(expression, currentIndex)
			currentIndex = currentIndex + token.value.length
		} else if (expression[currentIndex] === "'") {
			token = eatSingleQuoteString(expression, currentIndex)
			currentIndex = currentIndex + token.value.length
		} else if (expression[currentIndex] === '"') {
			token = eatDoubleQuoteString(expression, currentIndex)
			currentIndex = currentIndex + token.value.length
		} else if (lookupForInput(expression, currentIndex)) {
			token = eatInput(expression, currentIndex)
			currentIndex = currentIndex + token.value.length
		} else if (lookupForFunction(expression, currentIndex)) {
			token = eatFunction(expression, currentIndex)
			currentIndex = currentIndex + token.value.length + 1 // for bracket
		} else if (expression[currentIndex] === '.') {
			token = eatProperty(expression, currentIndex)
			currentIndex = currentIndex + token.value.length + 1 // for dot
		} else if (expression[currentIndex] === ')') {
			token = {
				type: 'close_bracket',
				value: ')',
			}
			currentIndex = currentIndex + token.value.length
		} else if (expression[currentIndex] === '(') {
			token = {
				type: 'open_bracket',
				value: '(',
			}
			currentIndex = currentIndex + token.value.length
		} else if (expression[currentIndex] === ']') {
			token = {
				type: 'close_square_bracket',
				value: ']',
			}
			currentIndex = currentIndex + token.value.length
		} else if (expression[currentIndex] === '[') {
			token = {
				type: 'open_square_bracket',
				value: '[',
			}
			currentIndex = currentIndex + token.value.length
		} else {
			token = {
				type: 'unknown',
				value: expression[currentIndex],
			}
			currentIndex = currentIndex + token.value.length
		}

		if (token) {
			if (token.type === 'property') {
				if (
					propertiesWords.indexOf(token.value) !== -1 ||
					token.value === 'attributes' ||
					(previous_token && previous_token.value === 'attributes')
				) {
					result =
						result +
						'.' +
						'<span class="eb-highlight-property">' +
						token.value +
						'</span>'
				} else {
					result =
						result +
						'.' +
						'<span class="eb-highlight-error">' +
						token.value +
						'</span>'
					status = 'error'
					faultyParts.push(token.value)
				}
			} else if (token.type === 'input') {
				if (inputWords.includes(token.value)) {
					result =
						result +
						'<span class="eb-highlight-input">' +
						token.value +
						'</span>'
				} else {
					if (
						!reservedWords.includes(token.value) &&
						!contextVariablesWords.includes(token.value)
					) {
						result =
							result +
							'<span class="eb-highlight-error">' +
							token.value +
							'</span>'
						status = 'inputs-error'
						faultyParts.push(token.value)
					} else {
						result = result + token.value
					}
				}
			} else if (token.type === 'function') {
				if (functionWords.indexOf(token.value) !== -1) {
					result =
						result +
						'<span class="eb-highlight-func">' +
						token.value +
						'</span>' +
						'('
				} else {
					result =
						result +
						'<span class="eb-highlight-error">' +
						token.value +
						'</span>' +
						'('
					status = 'functions-error'
					faultyParts.push(token.value)
				}
			} else {
				if (token.value) {
					result = result + token.value
				}
			}
		}

		previous_token = token

		if (previousIndex === currentIndex) {
			processing = false
		}

		previousIndex = currentIndex

		if (currentIndex >= expression.length) {
			processing = false
		}
	}

	var parenthesisStatus = isBracketsValid(result, '(', ')')
	var squareBracketsStatus = isBracketsValid(result, '[', ']')

	if (
		parenthesisStatus.status === false &&
		parenthesisStatus.errorIndex !== undefined
	) {
		result = insert(result, parenthesisStatus.errorIndex + 1, '</span>')
		result = insert(
			result,
			parenthesisStatus.errorIndex,
			'<span class="eb-error-bracket">'
		)

		status = 'bracket-error'
		var faultyPart = expression.substr(squareBracketsStatus.errorIndex, 1)
		faultyParts.push(faultyPart)
	} else {
		if (
			squareBracketsStatus.status === false &&
			squareBracketsStatus.errorIndex !== undefined
		) {
			result = insert(result, squareBracketsStatus.errorIndex + 1, '</span>')
			result = insert(
				result,
				squareBracketsStatus.errorIndex,
				'<span class="eb-error-bracket">'
			)

			status = 'bracket-error'
			var faultyPart = expression.substr(squareBracketsStatus.errorIndex, 1)
			faultyParts.push(faultyPart)
		}
	}

	// if (result.length > 0 && inputsCounts === 0) {
	//
	//     status = 'inputs-error';
	//
	// }

	var resultObj = {
		status: status,
		result: result,
	}

	if (faultyParts.length) {
		resultObj.faultyPart = faultyParts.pop()
	}

	return resultObj
}

var validateExpression = function (exprItem, data) {
	return new Promise(function (resolve, reject) {
		var expressionsList = getFunctionsItems()
		expressionsList = filterExpressions(expressionsList, data)

		var htmlExpressionData = null

		expressionService
			.validate(exprItem)
			.then(function (responseData) {
				// may be useless

				htmlExpressionData = getHtmlExpression(
					exprItem.expression,
					data,
					expressionsList
				)

				resolve(htmlExpressionData)
			})
			.catch(function (errorData) {
				if (exprItem.expression) {
					htmlExpressionData = getHtmlExpression(
						exprItem.expression,
						data,
						expressionsList
					)
				}

				reject({ error: errorData, htmlExpressionData: htmlExpressionData })
			})
	})
}

var validateExpressionOnFrontend = function (exprItem, data) {
	var expressionsList = getFunctionsItems()
	expressionsList = filterExpressions(expressionsList, data)

	return getHtmlExpression(exprItem.expression, data, expressionsList)
}

export default {
	getFunctionsItems: getFunctionsItems,
	getFunctionsGroups: getFunctionsGroups,

	filterExpressions: filterExpressions,
	validateExpression: validateExpression,
	validateExpressionOnFrontend: validateExpressionOnFrontend,
}
