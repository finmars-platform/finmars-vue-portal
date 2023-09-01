/**
 * Created by szhitenev on 28.04.2020.
 */

export default function () {
	return {
		scope: {
			frontLineColor: '@',
			backLineColor: '@',
		},
		template:
			'<progress class="progress progress-linear front-line-{{frontLineColor}} back-line-{{backLineColor}}"/>',
		link: function (scope, elem) {
			if (!scope.frontLineColor) {
				scope.frontLineColor = 'default'
			}

			if (!scope.backLineColor) {
				scope.backLineColor = 'default'
			}

			if (!scope.diameter) {
				scope.diameter = 10
			}
		},
	}
}
