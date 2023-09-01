/**
 * Created by szhitenev on 08.06.2016.
 */

import helpExpressionsService from '../../services/helpExpressionsService'
import expressionService from '../../services/expression.service'

export default function ($scope, $mdDialog, item, data) {
	var vm = this

	vm.item = item

	vm.showValidation = false

	vm.insideReport = false

	if (data) {
		vm.data = data

		if (vm.data.returnExpressionResult) {
			// check if expression editor should return expression result
			vm.item.is_eval = true
		}

		if (vm.data.entityType) {
			vm.insideReport = true
			vm.attributeDataService = vm.data.attributeDataService
			var availableAttrs = vm.attributeDataService.getAllAttributesByEntityType(
				vm.data.entityType
			)
		}
	}

	vm.readyStatus = { expressions: false, groups: false }

	vm.expressionsHistory = []

	vm.searchExpr = ''

	var dialogParent = document.querySelector('.dialog-containers-wrap')

	vm.getFilters = function () {
		var result = {}

		result.search_index = vm.searchExpr
		// result.formula = vm.searchExpr;

		if (vm.selectedHelpGroup && vm.selectedHelpGroup.key !== 'all') {
			result.groups = vm.selectedHelpGroup.key
		}

		return result
	}

	vm.insertAttrKey = function ($event) {
		$mdDialog
			.show({
				controller: 'TableAttributeSelectorDialogController as vm',
				templateUrl: 'views/dialogs/table-attribute-selector-dialog-view.html',
				parent: dialogParent,
				targetEvent: $event,
				multiple: true,
				locals: {
					data: {
						availableAttrs: availableAttrs,
						title: "Choose column's key to add it at the end of the expression",
						isReport: vm.insideReport,
					},
				},
			})
			.then(function (res) {
				if (res && res.status === 'agree') {
					if (!vm.item.expression) {
						vm.item.expression = ''
					}

					vm.item.expression += res.data.items[0].key
				}
			})
	}

	vm.selectHelpItem = function (item) {
		vm.expressions.forEach(function (expr) {
			expr.isSelected = false
		})

		item.isSelected = true

		vm.selectedHelpItem = item
	}

	vm.selectHelpGroup = function (item) {
		vm.groups.forEach(function (expr) {
			expr.isSelected = false
		})

		item.isSelected = true

		vm.selectedHelpGroup = item


	}

	vm.undo = function () {
		var result = vm.expressionsHistory.pop()

		if (result !== undefined && result !== null) {
			vm.item.expression = result
		}
	}

	vm.appendFunction = function (item) {
		if (vm.editor) {
			// vm.item.expression = vm.editor.getValue();
			// vm.item.expression = vm.item.expression + item.func;

			vm.editor.insert(item.func)

			// vm.editor.setValue(vm.item.expression)
		} else {
			vm.expressionsHistory.push(vm.item.expression)


			var val = $('#editorExpressionInput')[0].value
			var cursorPosition = val.slice(
				0,
				$('#editorExpressionInput')[0].selectionStart + ''
			).length

			if (!vm.item.expression) {
				vm.item.expression = ''
			}

			if (cursorPosition == 0) {
				vm.item.expression = vm.item.expression + item.func
			} else {
				vm.item.expression =
					vm.item.expression.slice(0, cursorPosition) +
					item.func +
					vm.item.expression.slice(cursorPosition)
			}
		}
	}

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	/*var isBracketsValid = function (expression, leftBracket, rightBracket) {

            var result = true;
            var container = [];
            var indexContainer = [];

            for (var i = 0; i < expression.length; i = i + 1) {

                if (expression[i] === leftBracket) {
                    container.push(leftBracket);
                    indexContainer.push(i)
                } else {

                    if (expression[i] === rightBracket) {

                        if (container.length && container[container.length - 1] === leftBracket) {

                            container.pop();
                            indexContainer.pop()

                        } else {

                            container.push(rightBracket);
                            indexContainer.push(i);

                            result = false;

                            break;

                        }

                    }
                }

            }

            ;
            ;

            if (container.length > 0) {
                result = false;
            }

            var resultObj = {
                status: result
            };

            if (result === false) {
                resultObj.errorIndex = indexContainer[container.length - 1]
            }

            return resultObj;

        };

        function insert(str, index, value) {
            return str.substr(0, index) + value + str.substr(index);
        }

        function getFunctionWords() {
            return vm.expressions
                .filter(function (item) {
                    return item.func.indexOf('(') !== -1;
                })
                .map(function (item) {
                    return item.func.split('(')[0]
                });
        }

        function getInputWords() {

            var result = [];

            if (vm.data) {
                vm.data.functions.forEach(function (funcGroup) {

                    funcGroup.map(function (item) {

                        if (item.func.indexOf('[') !== -1) {

                            var func = item.func.split('[').join('').split(']').join('')

                            result.push(func)

                        } else {
                            result.push(item.func)
                        }


                    });

                });
            }

            result.push('transactions');
            result.push('custom_fields');
            result.push('this');

            return result;
        }

        function getPropertiesWords() {

            var propertiesWords = [];

            var propertiesWordsTmp = vm.expressions
                .filter(function (item) {
                    return item.func.indexOf(']') !== -1;
                })
                .map(function (item) {
                    return item.func.split('].')[1];
                });


            propertiesWordsTmp.forEach(function (word) {

                if (word) {

                    var pieces = word.split('.');

                    pieces.forEach(function (pieceWord) {

                        if (propertiesWords.indexOf(pieceWord) === -1) {
                            propertiesWords.push(pieceWord)
                        }

                    })

                }

            });

            vm.expressions.forEach(function (item) {

                if (item.groups === 'custom_field') {

                    var pieces = item.func.split('custom_fields.');

                    if (pieces.length > 1) {
                        propertiesWords.push(pieces[1])
                    }


                }

            });

            return propertiesWords;

        }

        function lookupForFunction(expression, currentIndex) {

            var i;

            var result = false;
            var count = 0;

            for (i = currentIndex; i < expression.length; i = i + 1) {

                if (expression[i].match(new RegExp(/^[a-zA-Z0-9_]*$/))) {

                    count = count + 1;

                } else {

                    if (expression[i] === '(') {
                        result = true
                    }

                    break
                }

            }

            return result

        }

        function lookupForInput(expression, currentIndex) {

            var i;

            var result = false;
            var count = 0;

            for (i = currentIndex; i < expression.length; i = i + 1) {

                if (expression[i].match(new RegExp(/^[a-zA-Z0-9_]*$/))) {

                    count = count + 1;

                } else {

                    if (expression[i] === '(') {
                        count = 0; // we found a function
                    }

                    break
                }

            }

            ;


            if (count > 0) {
                result = true
            }

            return result

        }

        function eatNumber(expression, index) {

            var token = {
                value: '',
                type: 'number'
            };

            for (; index < expression.length; index = index + 1) {

                if (/^\d+$/.test(expression[index])) {
                    token.value = token.value + expression[index]
                } else {
                    break;
                }

            }

            return token;

        }

        function eatInput(expression, index) {

            var token = {
                value: '',
                type: 'input'
            };

            for (; index < expression.length; index = index + 1) {

                if (expression[index].match(new RegExp(/^[a-zA-Z0-9_]*$/))) {
                    token.value = token.value + expression[index]
                } else {
                    break;
                }

            }

            return token;

        }

        function eatFunction(expression, index) {

            var token = {
                value: '',
                type: 'function'
            };

            for (; index < expression.length; index = index + 1) {

                if (expression[index].match(new RegExp(/^[a-zA-Z0-9_]*$/))) {
                    token.value = token.value + expression[index]
                } else {
                    break;
                }

            }

            return token;

        }

        function eatProperty(expression, index) {

            var token = {
                value: '',
                type: 'property'
            };

            index = index + 1;

            for (; index < expression.length; index = index + 1) {

                if (expression[index].match(new RegExp(/^[a-zA-Z0-9_]*$/))) {
                    token.value = token.value + expression[index]
                } else {
                    break;
                }

            }

            return token;

        }

        function eatSpecialSymbol(expression, index) {

            var token = {
                value: '',
                type: 'special'
            };

            if (['+', '-', '/', '*'].indexOf(expression[index]) !== -1) {
                token.value = token.value + expression[index]
            }

            return token

        }

        function eatEmptySpace(expression, index) {

            var token = {
                value: '',
                type: 'empty'
            };

            for (; index < expression.length; index = index + 1) {

                if (/^\s+$/.test(expression[index])) {
                    token.value = token.value + expression[index]
                } else {
                    break;
                }

            }

            return token;

        }

        function eatSingleQuoteString(expression, index) {

            var token = {
                value: "'",
                type: 'single_quote_string'
            };

            index = index + 1

            for (; index < expression.length; index = index + 1) {

                if (expression[index] !== "'") {
                    token.value = token.value + expression[index]
                } else {
                    token.value = token.value + "'";
                    break;
                }

            }

            return token;

        }

        function eatDoubleQuoteString(expression, index) {

            var token = {
                value: '"',
                type: 'double_quote_string'
            };

            index = index + 1

            for (; index < expression.length; index = index + 1) {

                if (expression[index] !== '"') {
                    token.value = token.value + expression[index]
                } else {
                    token.value = token.value + '"';
                    break;
                }

            }

            return token;

        }

        vm.getHtmlExpression = function (expression) {

            var result = '';

            var functionWords = getFunctionWords();
            var propertiesWords = getPropertiesWords();
            var inputWords = getInputWords();

            var reservedWords = ['decimal_pos', 'thousand_sep', 'use_grouping', 'True', 'False']

            var processing = true;
            var currentIndex = 0;
            var previousIndex = null;

            var token = {
                value: '',
                type: ''
            };

            var previous_token = null;

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
                    currentIndex = currentIndex + token.value.length
                } else if (expression[currentIndex] === '"') {
                    token = eatDoubleQuoteString(expression, currentIndex);
                    currentIndex = currentIndex + token.value.length
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


                if (token) {

                    ;

                    if (token.type === 'property') {

                        if (propertiesWords.indexOf(token.value) !== -1 ||
                            token.value === 'attributes' ||
                            (previous_token && previous_token.value === 'attributes')) {

                            result = result + '.' + '<span class="eb-highlight-property">' + token.value + '</span>';
                        } else {
                            result = result + '.' + '<span class="eb-highlight-error">' + token.value + '</span>';
                            vm.status = 'error';
                        }

                    } else if (token.type === 'input') {

                        if (inputWords.indexOf(token.value) !== -1) {

                            result = result + '<span class="eb-highlight-input">' + token.value + '</span>';

                        } else {

                            if (reservedWords.indexOf(token.value) === -1) {

                                result = result + '<span class="eb-highlight-error">' + token.value + '</span>';
                                vm.status = 'inputs-error';

                            } else {
                                result = result + token.value
                            }

                        }

                    } else if (token.type === 'function') {

                        if (functionWords.indexOf(token.value) !== -1) {

                            result = result + '<span class="eb-highlight-func">' + token.value + '</span>' + '(';

                        } else {
                            result = result + '<span class="eb-highlight-error">' + token.value + '</span>' + '(';

                            vm.status = 'inputs-error';
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

                previousIndex = currentIndex;

                if (currentIndex >= expression.length) {
                    processing = false;
                }


            }

            var parenthesisStatus = isBracketsValid(result, '(', ')');
            var squareBracketsStatus = isBracketsValid(result, '[', ']');

            if (parenthesisStatus.status === false && parenthesisStatus.errorIndex !== undefined) {

                result = insert(result, parenthesisStatus.errorIndex + 1, '</span>');
                result = insert(result, parenthesisStatus.errorIndex, '<span class="eb-error-bracket">')

                vm.status = 'bracket-error';

            } else {

                if (squareBracketsStatus.status === false && squareBracketsStatus.errorIndex !== undefined) {

                    result = insert(result, squareBracketsStatus.errorIndex + 1, '</span>');
                    result = insert(result, squareBracketsStatus.errorIndex, '<span class="eb-error-bracket">')

                    vm.status = 'bracket-error';
                }
            }

            // ;

            // if (result.length > 0 && inputsCounts === 0) {
            //
            //     vm.status = 'inputs-error';
            //
            // }

            return result

        };


        vm.validate = function () {

            return expressionService.validate(vm.item).then(function (data) { // may be useless

                // ;

                vm.status = 'success';

                vm.htmlExpression = vm.getHtmlExpression(vm.item.expression);

                vm.showValidation = true;

                $scope.$apply();

            }).catch(function (reason) {

                // ;

                vm.status = 'error';

                if (vm.item.expression) {
                    vm.htmlExpression = vm.getHtmlExpression(vm.item.expression);
                }

                vm.showValidation = true;

                $scope.$apply();

            })

        };*/

	vm.validate = function () {
		helpExpressionsService
			.validateExpression(vm.item, vm.data)
			.then(function (data) {
				vm.status = 'success'

				vm.htmlExpression = data.result

				if (data.status) {
					vm.status = data.status
				}

				vm.showValidation = true

				$scope.$apply()
			})
			.catch(function (res) {


				vm.status = 'error'

				if (res.htmlExpressionData) {
					vm.htmlExpression = res.htmlExpressionData.result

					if (res.htmlExpressionData.status) {
						vm.status = res.htmlExpressionData.status
					}
				}

				vm.showValidation = true

				$scope.$apply()
			})
	}

	/*var getFunctionItems = new Promise(function (resolve, reject) {

                helpExpressionsService.getFunctionsItems().then(function (data) {

                    vm.expressions = data;

                    vm.readyStatus.expressions = true;

                    if (vm.data && vm.data.functions) {

                        ;

                        vm.data.functions.forEach(function (items) {

                            if (items) {
                                vm.expressions = vm.expressions.concat(items)
                            }

                        })

                    }

                    vm.expressions = vm.expressions.map(function (item) {

                        item.search_index = item.name + ' ' + item.func;

                        return item;

                    });

                    ;

                    vm.selectedHelpItem = vm.expressions[0];

                    resolve();

                });

            });*/

	var getFunctionItems = function () {
		vm.expressions = helpExpressionsService.getFunctionsItems()

		vm.readyStatus.expressions = true

		/*if (vm.data && vm.data.functions) {

                ;

                vm.data.functions.forEach(function (items) {

                    if (items) {
                        vm.expressions = vm.expressions.concat(items)
                    }

                })

            }

            vm.expressions = vm.expressions.map(function (item) {

                item.search_index = item.name + ' ' + item.func;

                return item;

            });*/

		vm.expressions = helpExpressionsService.filterExpressions(
			vm.expressions,
			vm.data
		)



		vm.selectedHelpItem = vm.expressions[0]
	}

	/*var getFunctionsGroups = new Promise(function (resolve, reject) {

                helpExpressionsService.getFunctionsGroups().then(function (data) {

                    vm.groups = data;

                    vm.readyStatus.groups = true;

                    vm.selectedHelpGroup = vm.groups[0];

                    if (vm.data && vm.data.groups) {

                        vm.groups.shift();

                        var result = [];

                        vm.data.groups.forEach(function (group) {

                            if (group) {
                                result = result.concat(group)
                            }

                        });

                        result = result.concat(vm.groups);

                        result.unshift({
                            "name": "All",
                            "key": "all"
                        });

                        vm.groups = result;

                    }

                    resolve();

                });

            });*/

	var getFunctionsGroups = function () {
		vm.groups = helpExpressionsService.getFunctionsGroups()

		vm.readyStatus.groups = true

		vm.selectedHelpGroup = vm.groups[0]

		if (vm.data && vm.data.groups) {
			vm.groups.shift()

			var result = []

			vm.data.groups.forEach(function (group) {
				if (group) {
					result = result.concat(group)
				}
			})

			result = result.concat(vm.groups)

			result.unshift({
				name: 'All',
				key: 'all',
			})

			vm.groups = result
		}
	}

	vm.initAceEditor = function () {
		setTimeout(function () {
			vm.editor = ace.edit('aceEditor')
			vm.editor.setTheme('ace/theme/monokai')
			vm.editor.getSession().setMode('ace/mode/python')
			vm.editor.getSession().setUseWorker(false)
			vm.editor.setHighlightActiveLine(false)
			vm.editor.setShowPrintMargin(false)
			ace.require('ace/ext/language_tools')
			vm.editor.setOptions({
				enableBasicAutocompletion: true,
				enableSnippets: true,
			})
			vm.editor.setFontSize(14)
			vm.editor.setBehavioursEnabled(true)
			vm.editor.setValue(vm.item.expression)

			vm.editor.focus()
			vm.editor.navigateFileStart()
		}, 100)
	}

	var init = function () {
		vm.codeEditorInExpressionBuilder = localStorage.getItem(
			'codeEditorInExpressionBuilder'
		)

		if (vm.codeEditorInExpressionBuilder) {
			vm.initAceEditor()
		}

		//var promises = [getFunctionItems, getFunctionsGroups];
		getFunctionItems()
		getFunctionsGroups()

		//Promise.all(promises).then(function () {

		//$scope.$apply();

		setTimeout(function () {
			var resizerElem = document.querySelector('.exprEditorColsResizer')
			var leftColToResize = document.querySelector('.exprEditorExprsCol')
			var rightColToResize = document.querySelector('.exprEditorDescriptionCol')

			resizerElem.addEventListener('mousedown', function (event) {
				event.preventDefault()
				event.stopPropagation()

				var mouseDownLeft = event.clientX
				var cursorDistance
				var newLeftColWidth
				var newRightColWidth

				var leftColWidth = leftColToResize.clientWidth
				var rightColWidth = rightColToResize.clientWidth

				var resizeColsOnMousemove = function (event) {
					var eventClientX = event.clientX
					cursorDistance = eventClientX - mouseDownLeft

					newLeftColWidth = leftColWidth + cursorDistance
					newRightColWidth = rightColWidth - cursorDistance

					if (newLeftColWidth > 150 && newRightColWidth > 150) {
						leftColToResize.style.width = newLeftColWidth + 'px'
						rightColToResize.style.width = newRightColWidth + 'px'
					}
				}

				window.addEventListener('mousemove', resizeColsOnMousemove)

				window.addEventListener(
					'mouseup',
					function () {
						window.removeEventListener('mousemove', resizeColsOnMousemove)
					},
					{ once: true }
				)
			})
		}, 50)

		//});
	}

	init()

	vm.agree = function () {
		if (vm.editor) {
			vm.item.expression = vm.editor.getValue()
		}

		$mdDialog.hide({ status: 'agree', data: { item: vm.item } })
	}

	vm.openHelp = function ($event) {
		$mdDialog.show({
			controller: 'HelpDialogController as vm',
			templateUrl: 'views/dialogs/help-dialog-view.html',
			parent: dialogParent,
			targetEvent: $event,
			locals: {
				data: {},
			},
			multiple: true,
		})
	}
}
