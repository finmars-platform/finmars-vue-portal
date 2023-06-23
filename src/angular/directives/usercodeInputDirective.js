/**
 * Created by szhitenev on 19.03.2021.
 */

// import usersService from '../services/usersService';

function uuidv4() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		var r = (Math.random() * 16) | 0,
			v = c == 'x' ? r : (r & 0x3) | 0x8
		return v.toString(16)
	})
}

export default function ($mdDialog, usersService) {
	return {
		restrict: 'E',
		templateUrl: 'views/directives/usercode-input-view.html',
		scope: {
			item: '=',
		},
		link: function (scope, elem, attrs, ngModelCtrl) {
			scope.prefixType = 1
			scope.selectedGroupPrefix = null
			scope.usercode = ''
			scope.groupPrefixes = []

			scope.updateUserCode = function (usercode) {
				scope.usercode = usercode

				if (scope.prefixType === 1) {
					scope.item.user_code = scope.usercode
				}

				if (scope.prefixType === 2) {
					scope.item.user_code = scope.member.username + '@' + scope.usercode
				}

				if (scope.prefixType === 3) {
					scope.usercode = ''
					scope.item.user_code = '@@' + uuidv4()
				}

				if (scope.prefixType === 4) {
					scope.item.user_code =
						scope.selectedGroupPrefix + '@' + scope.usercode
				}

				/* console.log('usercodeInputDirective.updateUserCode.selectedGroupPrefix', scope.selectedGroupPrefix);
                    console.log('usercodeInputDirective.updateUserCode.item', scope.item);
                    console.log('usercodeInputDirective.updateUserCode.usercode', scope.usercode); */
			}

			scope.init = function () {
				usersService.getUsercodePrefixList().then(function (data) {
					scope.groupPrefixes = data.results

					if (scope.groupPrefixes && scope.groupPrefixes.length) {
						scope.selectedGroupPrefix = scope.groupPrefixes[0].value
					}

					scope.$apply()
				})

				usersService.getMyCurrentMember().then(function (data) {
					scope.member = data
					scope.$apply()
				})
			}

			scope.init()
		},
	}
}
