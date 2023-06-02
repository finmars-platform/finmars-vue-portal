/**
 * Created by mevstratov on 06.05.2019.
 */

export default function ($scope, $mdDialog, data) {
	var vm = this

	vm.numberToShow = 0
	vm.calculationsHistory = ''
	vm.smallFontForCurrentNumber = false
	vm.calculatorTitle = 'Calculator'
	vm.calculatorIsBroken = false

	if (data.calculatorTitle) {
		vm.calculatorTitle = data.calculatorTitle
	}

	var calcResultNumber = '' // used to decide whether add a character to existing string or start new string with number
	var prevNumber = '' // should stay string
	var currentNumber = '' // should stay string
	var operatorType

	if (data.numberValue && data.numberValue !== 0) {
		vm.numberToShow = data.numberValue
		currentNumber = data.numberValue.toString()
	}

	vm.showCalculatorBlock = false

	vm.setNumber = function (number) {
		if (calcResultNumber) {
			// If a result was displayed, reset number

			vm.smallFontForCurrentNumber = false

			currentNumber = number.toString()
			calcResultNumber = ''
		} else {
			// Otherwise, add digit to previous number

			if (currentNumber) {
				if (currentNumber === '0') {
					currentNumber = number.toString()
				} else if (number !== '.' || currentNumber.indexOf('.') === -1) {
					// prevent adding more than one "." to a number
					currentNumber += number
				}
			} else {
				currentNumber += number
			}
		}

		if (currentNumber === '.') {
			currentNumber = '0.'
		}

		vm.numberToShow = currentNumber // Display current number
	}

	// When operator is clicked. Pass currentNumber to prevNumber and save operator
	vm.applyOperator = function (operator) {
		if (currentNumber) {
			if (prevNumber) {
				// if operator was added when there is already data to perform calculation (prevNumber, operatorType and currentNumber)

				calcResultNumber = calculateNumber(prevNumber, currentNumber)

				if (!isFinite(calcResultNumber)) {
					if (isNaN(calcResultNumber)) {
						vm.clearAll()
						vm.smallFontForCurrentNumber = true
						vm.numberToShow = 'Error occurred'
						vm.calculatorIsBroken = true
					} else {
						// If result is infinity, set off by dividing by zero

						vm.clearAll()
						vm.smallFontForCurrentNumber = true
						vm.numberToShow = "Can't divide by zero"
						vm.calculatorIsBroken = true
					}
				} else {
					vm.numberToShow = Number(calcResultNumber) // Number() needed to remove tailing zeros from float number
					vm.calculationsHistory += currentNumber + ' ' + operator + ' '

					currentNumber = calcResultNumber.toString()
					prevNumber = currentNumber
					operatorType = operator
					currentNumber = ''
				}
			} else {
				prevNumber = currentNumber
				operatorType = operator
				vm.calculationsHistory += prevNumber + ' ' + operator + ' '
				calcResultNumber = currentNumber
				currentNumber = ''
			}
		} else {
			if (vm.calculationsHistory) {
				// change operator if second number for operation is not set yet

				operatorType = operator
				var indexOfOperator = vm.calculationsHistory.length - 3
				vm.calculationsHistory =
					vm.calculationsHistory.slice(0, indexOfOperator) +
					' ' +
					operator +
					' '
			} else {
				operatorType = operator
				prevNumber = '0'
				vm.calculationsHistory = '0' + ' ' + operator + ' '
			}
		}
	}

	var getNumberOfFractionDigits = function (numX, numY) {
		var digitsQuantity

		var numXDigitsQuantity = 0
		var numYDigitsQuantity = 0

		if (numX && numX.split('.').length === 2) {
			var numXFDigits = numX.split('.')[1]
			numXDigitsQuantity = numXFDigits.length
		}

		if (numY && numY.split('.').length === 2) {
			var numYFDigits = numY.split('.')[1]
			numYDigitsQuantity = numYFDigits.length
		}

		switch (operatorType) {
			case '+':
			case '-':
				digitsQuantity = Math.max(numXDigitsQuantity, numYDigitsQuantity)
				break
			case '*':
				digitsQuantity = numXDigitsQuantity + numYDigitsQuantity
				break
			case '/':
				digitsQuantity = numXDigitsQuantity - numYDigitsQuantity
				break
		}

		return digitsQuantity
	}

	var calculateNumber = function (num1, num2) {
		var allowedDigitsNumber = getNumberOfFractionDigits(num1, num2)

		num1 = parseFloat(num1)
		num2 = parseFloat(num2)

		var calculationResultNum

		switch (operatorType) {
			case '+':
				calculationResultNum = num1 + num2
				if (allowedDigitsNumber > 0) {
					calculationResultNum =
						calculationResultNum.toFixed(allowedDigitsNumber)
				}
				break

			case '-':
				calculationResultNum = num1 - num2
				if (allowedDigitsNumber > 0) {
					calculationResultNum =
						calculationResultNum.toFixed(allowedDigitsNumber)
				}
				break

			case '*':
				calculationResultNum = num1 * num2
				if (allowedDigitsNumber > 0) {
					calculationResultNum =
						calculationResultNum.toFixed(allowedDigitsNumber)
				}
				break

			case '/':
				calculationResultNum = num1 / num2
				if (allowedDigitsNumber > 0) {
					calculationResultNum =
						calculationResultNum.toFixed(allowedDigitsNumber)
				}
				break
			// If equal is pressed without an operator, keep number and continue
			default:
				calculationResultNum = num2
		}

		return calculationResultNum
	}

	// When: Equals is clicked. Calculate result
	vm.calculateResult = function () {
		if (currentNumber) {
			calcResultNumber = calculateNumber(prevNumber, currentNumber)

			// If NaN or Infinity returned
			if (!isFinite(calcResultNumber)) {
				if (isNaN(calcResultNumber)) {
					// If result is not a number; set off by, eg, double-clicking operators

					vm.clearAll()
					vm.smallFontForCurrentNumber = true
					vm.numberToShow = "Can't divide by zero"
					vm.calculatorIsBroken = true
				} else {
					// If result is infinity, set off by dividing by zero

					vm.clearAll()
					vm.smallFontForCurrentNumber = true
					vm.numberToShow = "Can't divide by zero"
					vm.calculatorIsBroken = true
				}
			} else {
				vm.numberToShow = Number(calcResultNumber) // Number() needed to remove tailing zeros from float number
			}

			prevNumber = ''
			vm.calculationsHistory = ''
			currentNumber = Number(calcResultNumber).toString() // Number() needed to remove tailing zeros from float number
		}
	}

	vm.toggleNumberPosNeg = function () {
		if (currentNumber && currentNumber !== '0') {
			if (currentNumber.indexOf('-') === 0) {
				currentNumber = currentNumber.slice(1)
			} else {
				currentNumber = '-' + currentNumber
			}

			vm.numberToShow = currentNumber
		}
	}

	vm.clearAll = function () {
		prevNumber = ''
		currentNumber = ''
		operatorType = null
		vm.smallFontForCurrentNumber = false
		vm.calculationsHistory = ''
		vm.numberToShow = 0
		vm.calculatorIsBroken = false
		// equals.setAttribute("data-result", calcResultNumber);
	}

	vm.deleteLastChar = function () {
		if (currentNumber) {
			var indexOfLastChar = currentNumber.length - 1
			currentNumber = currentNumber.slice(0, indexOfLastChar)

			if (currentNumber.length === 0) {
				vm.numberToShow = 0
			} else {
				vm.numberToShow = currentNumber
			}
		}
	}

	var operatorSymbols = ['+', '-', '*', '/']

	function inputDataFromKeyboard(event) {
		if (!vm.calculatorIsBroken) {
			var pressedKey = event.key

			if (!isNaN(pressedKey) || pressedKey === '.' || pressedKey === ',') {
				event.preventDefault()
				if (pressedKey === ',') {
					pressedKey = '.'
				}
				vm.setNumber(pressedKey)
				$scope.$apply()
			} else if (operatorSymbols.indexOf(pressedKey) !== -1) {
				event.preventDefault()
				vm.applyOperator(pressedKey)
				$scope.$apply()
			} else {
				switch (pressedKey) {
					case 'Enter':
						event.preventDefault()
						vm.calculateResult()
						$scope.$apply()
						break
					case 'Backspace':
						event.preventDefault()
						vm.deleteLastChar()
						$scope.$apply()
						break
				}
			}
		}
	}

	document.addEventListener('keydown', inputDataFromKeyboard)

	vm.close = function () {
		document.removeEventListener('keydown', inputDataFromKeyboard)
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.returnNumber = function () {
		document.removeEventListener('keydown', inputDataFromKeyboard)
		var numberToReturn = ''

		if (!isNaN(vm.numberToShow)) {
			numberToReturn = Number(vm.numberToShow)
		}

		$mdDialog.hide({ status: 'agree', numberValue: numberToReturn })
	}
}
