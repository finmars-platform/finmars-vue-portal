/**
 * Created by szhitenev on 24.06.2016.
 */

export default function () {
	return {
		restrict: 'A',
		scope: {
			onlyPositive: '@',
		},
		require: '?ngModel',
		link: function (scope, elem, attrs, ngModelCtrl) {
			if (!ngModelCtrl) {
				return
			}

			ngModelCtrl.$parsers.push(function (val) {
				//console.log('val', val);

				var clean = val.replace(/[^-0-9\.]/g, '')
				var negativeCheck = clean.split('-')
				var decimalCheck = clean.split(',')

				if (!angular.isUndefined(negativeCheck[1])) {
					negativeCheck[1] = negativeCheck[1].slice(0, negativeCheck[1].length)
					if (scope.onlyPositive) {
						clean = negativeCheck[1]
					} else {
						clean = negativeCheck[0] + '-' + negativeCheck[1]
					}
					if (negativeCheck[0].length > 0) {
						clean = negativeCheck[0]
					}
				}

				if (!angular.isUndefined(decimalCheck[1])) {
					decimalCheck[1] = decimalCheck[1].slice(0, decimalCheck[1].length)
					clean = decimalCheck[0] + ',' + decimalCheck[1]
				}

				if (val !== clean) {
					ngModelCtrl.$setViewValue(clean)
					ngModelCtrl.$render()
				}
				return clean
			})

			elem.bind('keyup', function (event) {
				if (event.keyCode === 32) {
					event.preventDefault()
				}
			})

			elem.bind('blur', function () {
				function addSpaces(nStr) {
					var remainder = nStr.length % 3
					return (
						nStr.substr(0, remainder) +
						nStr.substr(remainder).replace(/(\d{3})/g, ' $1')
					).trim()
				}

				var val = elem.val()
				var first, second

				if (val.indexOf(',') === 0) {
					first = val.split(',')[0]
					second = val.split(',')[1]
					first = addSpaces(first)
					second = addSpaces(second)
					elem.val(first + ',' + second)
				} else {
					elem.val(addSpaces(val))
				}
			})
		},
	}
}
