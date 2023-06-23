/**
 * Created by szhitenev on 01.06.2016.
 */

export default function ($compile) {
	return {
		scope: {
			tabs: '=',
		},
		link: function (scope, elem) {
			var btnString =
				'<md-button class="ec-tab-add-btn"' +
				'data-ng-click="vm.addTab()" aria-label="tab addition button">' +
				'<ng-md-icon icon="add_circle"></ng-md-icon>' +
				'</md-button>'

			var btn = $compile(btnString)(scope.$parent)

			var wrapper = elem.find('md-pagination-wrapper')

			wrapper.append(btn)
		},
	}
}
