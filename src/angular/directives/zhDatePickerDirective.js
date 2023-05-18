/**
 * Created by szhitenev on 01.07.2016.
 */

export default function (pickmeup) {
	return {
		restrict: 'AE',
		scope: {
			position: '@',
			defaultDate: '=',
			dateValue: '=',
			callbackMethod: '&?',
		},
		// require: '?ngModel',
		template:
			'<div class="pick-me-up overflow-hidden"><input type="text" ng-model="dateValue" ng-blur="delayCallbackMethod()"></div>',
		link: function (scope, elem, attrs) {
			var input = elem[0].querySelector('input')
			var settedDate = scope.dateValue

			var position = 'right'

			if (scope.position) {
				position = scope.position
			}

			var defaultDate = false
			if (scope.defaultDate) {
				defaultDate = true
			}

			/*scope.$watch(function () {

                    return ngModel.$modelValue;

                }, function (newValue) {
                    if (ngModel.$modelValue) {
                        input.val(newValue);
                    }
                });*/

			scope.delayCallbackMethod = function () {
				if (scope.callbackMethod && scope.dateValue !== settedDate) {
					settedDate = scope.dateValue
					scope.callbackMethod()
				}
			}

			if (scope.dateValue) {
				$(elem).parent().addClass('md-input-has-value')
				pickmeup(input, {
					date: new Date(scope.dateValue),
					current: new Date(scope.dateValue),
					position: position,
					default_date: defaultDate,
					hide_on_select: true,
					format: 'Y-m-d',
				})
			} else {
				pickmeup(input, {
					position: position,
					default_date: defaultDate,
					hide_on_select: true,
					format: 'Y-m-d',
				})
			}

			input.addEventListener('pickmeup-change', function (event) {
				scope.dateValue = event.detail.formatted_date
				scope.$apply()
			})
		},
	}
}
