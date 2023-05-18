/**
 * Created by mevstratov on 09.04.2019.
 */

export default function () {
	return {
		restriction: 'A',
		scope: {
			menuType: '@',
		},
		link: function (scope, elem, attrs) {
			var dropdownMenuClass = '.' + scope.menuType + '-dropdown-menu-element'
			var menuBtnClass = '.' + scope.menuType + '-sidenav-menu-btn'
			var dropdownMenu = elem.find(dropdownMenuClass)
			var menuBtn = elem.find(menuBtnClass)
			elem.mouseenter(function () {
				$(menuBtn).addClass('active-menu-btn')
				$(dropdownMenu).removeClass('ng-hide')
			})

			elem.mouseleave(function () {
				$(menuBtn).removeClass('active-menu-btn')
				$(dropdownMenu).addClass('ng-hide')
			})
		},
	}
}
