import cloneDeep from 'lodash/cloneDeep';
import get from 'lodash/get';
import useApi from '@/composables/useApi';
import {
	CONTEXT_VARIABLES_WORDS,
	FUNCTIONS_GROUPS,
	FUNCTIONS_ITEMS
} from './express-editor-constants';

export function prepareExpressionsData(data) {
	let items = cloneDeep(FUNCTIONS_ITEMS);
	(data?.functions || []).forEach((f) => {
		if (f) {
			items = [...items, ...f];
		}
	});

	return items.map((i) => ({
		...i,
		search_index: `${i.name} ${i.func}`
	}));
}

export function prepareGroupsData(data) {
	let items = [];
	if (data && data.groups) {
		data.groups.forEach((g) => {
			if (g) {
				Array.isArray(g) ? (items = [...items, ...g]) : items.push(g);
			}
		});
	}
	items = [...items, ...cloneDeep(FUNCTIONS_GROUPS.slice(1))];
	items.unshift(FUNCTIONS_GROUPS[0]);
	return items;
}

export async function validateExpression(ruleExpr, data) {
	const expressionsList = prepareExpressionsData(data);
	try {
		await useApi('expression.post', {
			body: {
				expression: ruleExpr,
				is_eval: false
			}
		});
		return getHtmlExpression(ruleExpr, data, expressionsList);
	} catch (e) {
		console.error('The expression validation error. ', e);
		if (ruleExpr) {
			return {
				error: e,
				htmlExpressionData: getHtmlExpression(ruleExpr, data, expressionsList)
			};
		}
	}
}

/* auxiliary functions */
function getHtmlExpression(expression, data, expressionsList) {
	let result = '';
	let status = 'success';
	const faultyParts = [];

	const functionWords = getFunctionWords(expressionsList);
	const propertiesWords = getPropertiesWords(expressionsList);
	const inputWords = getInputWords(data);
	const reservedWords = [
		'decimal_pos',
		'thousand_sep',
		'use_grouping',
		'True',
		'False',
		'None',
		'format'
	]; // TODO remove 'format' if allowed to make validation of function arguments

	let processing = true;
	let currentIndex = 0;
	let previousIndex = null;
	let token = {
		value: '',
		type: ''
	};
	let previousToken = null;

	while (processing) {
		if (/^\d+$/.test(expression[currentIndex])) {
			token = eatNumber(expression, currentIndex);
			currentIndex = currentIndex + token.value.length;
		} else if (/^\s+$/.test(expression[currentIndex])) {
			token = eatEmptySpace(expression, currentIndex);
			currentIndex = currentIndex + token.value.length;
		} else if (['+', '-', '/', '*'].indexOf(expression[currentIndex]) !== -1) {
			token = eatSpecialSymbol(expression, currentIndex);
			currentIndex = currentIndex + token.value.length;
		} else if (expression[currentIndex] === "'") {
			token = eatSingleQuoteString(expression, currentIndex);
			currentIndex = currentIndex + token.value.length;
		} else if (expression[currentIndex] === '"') {
			token = eatDoubleQuoteString(expression, currentIndex);
			currentIndex = currentIndex + token.value.length;
		} else if (lookupForInput(expression, currentIndex)) {
			token = eatInput(expression, currentIndex);
			currentIndex = currentIndex + token.value.length;
		} else if (lookupForFunction(expression, currentIndex)) {
			token = eatFunction(expression, currentIndex);
			currentIndex = currentIndex + token.value.length + 1; // for bracket
		} else if (expression[currentIndex] === '.') {
			token = eatProperty(expression, currentIndex);
			currentIndex = currentIndex + token.value.length + 1; // for dot
		} else if (expression[currentIndex] === ')') {
			token = {
				type: 'close_bracket',
				value: ')'
			};
			currentIndex = currentIndex + token.value.length;
		} else if (expression[currentIndex] === '(') {
			token = {
				type: 'open_bracket',
				value: '('
			};
			currentIndex = currentIndex + token.value.length;
		} else if (expression[currentIndex] === ']') {
			token = {
				type: 'close_square_bracket',
				value: ']'
			};
			currentIndex = currentIndex + token.value.length;
		} else if (expression[currentIndex] === '[') {
			token = {
				type: 'open_square_bracket',
				value: '['
			};
			currentIndex = currentIndex + token.value.length;
		} else {
			token = {
				type: 'unknown',
				value: expression[currentIndex]
			};
			currentIndex = currentIndex + token.value.length;
		}

		switch (token?.type) {
			case 'property':
				if (
					propertiesWords.includes(token.value) ||
					token.value === 'attributes' ||
					previousToken?.value === 'attributes'
				) {
					result += `.<span class="expression-editor--highlight-property">${token.value}</span>`;
				} else {
					result += `.<span class="expression-editor--highlight-error">${token.value}</span>`;
					status = 'error';
					faultyParts.push(token.value);
				}
				break;
			case 'input':
				if (inputWords.includes(token.value)) {
					result += `<span class="expression-editor--highlight-input">${token.value}</span>`;
					break;
				}

				if (
					!reservedWords.includes(token.value) &&
					!CONTEXT_VARIABLES_WORDS.includes(token.value)
				) {
					result += `<span class="expression-editor--highlight-error">${token.value}</span>`;
					status = 'inputs-error';
					faultyParts.push(token.value);
					break;
				}

				result += token.value;
				break;
			case 'function':
				if (functionWords.includes(token.value)) {
					result += `<span class="expression-editor--highlight-func">${token.value}</span>(`;
				} else {
					result += `<span class="expression-editor--highlight-error">${token.value}</span>(`;
					status = 'functions-error';
					faultyParts.push(token.value);
				}
				break;
			default:
				result = token.value ? result + token.value : result;
				break;
		}

		previousToken = token;
		processing = previousIndex !== currentIndex;
		previousIndex = currentIndex;
		processing = currentIndex < expression.length;
	}

	const parenthesisStatus = isBracketsValid(result, '(', ')');
	const squareBracketsStatus = isBracketsValid(result, '[', ']');

	if (!parenthesisStatus.status && !!parenthesisStatus.errorIndex) {
		result = insert(result, parenthesisStatus.errorIndex + 1, '</span>');
		result = insert(
			result,
			parenthesisStatus.errorIndex,
			'<span class="expression-editor--error-bracket">'
		);
		status = 'bracket-error';
		const faultyPart = expression.slice(squareBracketsStatus.errorIndex, 1);
		faultyParts.push(faultyPart);
	} else if (
		!squareBracketsStatus.status &&
		!!squareBracketsStatus.errorIndex
	) {
		result = insert(result, squareBracketsStatus.errorIndex + 1, '</span>');
		result = insert(
			result,
			squareBracketsStatus.errorIndex,
			'<span class="expression-editor--error-bracket">'
		);
		status = 'bracket-error';
		const faultyPart = expression.slice(squareBracketsStatus.errorIndex, 1);
		faultyParts.push(faultyPart);
	}

	return {
		status,
		result,
		...(faultyParts.length && {
			faultyPart: faultyParts.pop()
		})
	};
}

function getFunctionWords(expressionsList) {
	return expressionsList
		.filter((expression) => expression?.validation?.func?.includes('('))
		.map(
			(expression) => get(expression, ['validation', 'func'], '').split('(')[0]
		);
}

function getPropertiesWords(expressionsList) {
	const propertiesWordsTmp = expressionsList
		.filter((expression) => expression.validation?.func?.includes(']'))
		.map(
			(expression) => get(expression, ['validation', 'func'], '').split(']')[1]
		);
	const propertiesWords = propertiesWordsTmp.reduce((res, word) => {
		if (word) {
			const pieces = word.split('.');
			pieces.forEach((pieceWord) => {
				if (!res.includes(pieceWord)) {
					res.push(pieceWord);
				}
			});
		}

		return res;
	}, []);
	return expressionsList.reduce((res, expression) => {
		if (expression.groups === 'custom_field') {
			const pieces = expression.validation?.func?.split('custom_fields.');
			if (pieces.length > 1) {
				res.push(pieces[1]);
			}
		}
		return res;
	}, propertiesWords);
}

function getInputWords(data) {
	const result = (data.functions || []).reduce((res, funcGroup) => {
		funcGroup.forEach((item) => {
			const itemFunc = item.validation?.func || item.func;
			itemFunc.includes('[')
				? res.push(itemFunc.split('[').join('').split(']').join(''))
				: res.push(itemFunc);
		});

		return res;
	}, []);
	result.push('transactions');
	result.push('custom_fields');
	result.push('this');
	return result;
}

function eatNumber(expression, index) {
	const token = {
		value: '',
		type: 'number'
	};

	for (let i = index; i < expression.length; i++) {
		if (/^\d+$/.test(expression[i])) {
			token.value += expression[i];
			continue;
		}

		if (
			expression[i] === '.' &&
			/^\d+$/.test(expression[i + 1]) &&
			token.type === 'number'
		) {
			token.type = 'float_number';
			token.value += expression[i];
			continue;
		}

		break;
	}

	return token;
}

function eatEmptySpace(expression, index) {
	const token = {
		value: '',
		type: 'empty'
	};

	for (let i = index; i < expression.length; i++) {
		if (/^\s+$/.test(expression[i])) {
			token.value += expression[i];
			continue;
		}

		break;
	}

	return token;
}

function eatSpecialSymbol(expression, index) {
	const token = {
		value: '',
		type: 'special'
	};

	if (['+', '-', '/', '*'].includes(expression[index])) {
		token.value += expression[index];
	}

	return token;
}

function eatSingleQuoteString(expression, index) {
	const token = {
		value: "'",
		type: 'single_quote_string'
	};

	for (let i = index + 1; i < expression.length; i++) {
		if (expression[i] !== "'") {
			token.value += expression[i];
			continue;
		}

		token.value += "'";
		break;
	}

	return token;
}

function eatDoubleQuoteString(expression, index) {
	const token = {
		value: '"',
		type: 'double_quote_string'
	};

	for (let i = index + 1; i < expression.length; i++) {
		if (expression[i] !== "'") {
			token.value += expression[i];
			continue;
		}

		token.value += '"';
		break;
	}

	return token;
}

function eatInput(expression, index) {
	const token = {
		value: '',
		type: 'input'
	};

	for (let i = index; i < expression.length; i++) {
		if (expression[i].match(/^[a-zA-Z0-9_]*$/)) {
			token.value += expression[i];
			continue;
		}

		break;
	}

	return token;
}

function eatFunction(expression, index) {
	const token = {
		value: '',
		type: 'function'
	};

	for (let i = index; i < expression.length; i++) {
		if (expression[i].match(/^[a-zA-Z0-9_]*$/)) {
			token.value += expression[i];
			continue;
		}

		break;
	}

	return token;
}

function eatProperty(expression, index) {
	const token = {
		value: '',
		type: 'property'
	};

	for (let i = index + 1; i < expression.length; i++) {
		if (expression[i].match(/^[a-zA-Z0-9_]*$/)) {
			token.value += expression[i];
			continue;
		}

		break;
	}

	return token;
}

function lookupForInput(expression, index) {
	let count = 0;
	for (let i = index; i < expression.length; i++) {
		if (expression[i].match(/^[a-zA-Z0-9_]*$/)) {
			count++;
			continue;
		}

		if (expression[i] === '(') {
			count = 0;
		}
		break;
	}

	return count > 0;
}

function lookupForFunction(expression, index) {
	let functionName = '';

	for (let i = index; i < expression.length; i++) {
		if (expression[i].match(/^[a-zA-Z0-9_]*$/)) {
			functionName += expression[i];
			continue;
		}

		if (functionName && expression[i] === '(') {
			return true;
		}

		break;
	}

	return false;
}

function isBracketsValid(expression, leftBracket, rightBracket) {
	let result = true;

	const { container, indexContainer } = expression.split('').reduce(
		(res, exp, index) => {
			if (!result) {
				return res;
			}

			if (exp === leftBracket) {
				res.container.push(leftBracket);
				res.indexContainer.push(index);
				return res;
			}

			if (exp !== rightBracket) {
				return res;
			}

			if (
				res.container.length &&
				res.container[res.container.length - 1] === leftBracket
			) {
				res.container.pop();
				res.indexContainer.pop();
				return res;
			}

			res.container.push(rightBracket);
			res.indexContainer.push(index);
			result = false;
			return res;
		},
		{ container: [], indexContainer: [] }
	);

	result = container.length <= 0;
	return {
		status: result,
		...(!result && {
			errorIndex: indexContainer[container.length - 1]
		})
	};
}

function insert(str, index, value) {
	return `${str.slice(0, index)}${value}${str.slice(index)}`;
}
