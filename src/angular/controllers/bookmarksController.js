/**
 * Created by mevstratov on 29.01.2019.
 */

// import toastNotificationService from '@/angular/core/services/toastNotificationService';
import uiService from '../services/uiService'

import bookmarkService from '../services/bookmarkService'

export default function ($scope, $mdDialog, $state, toastNotificationService) {
	const vm = this

	vm.entityUpdating = false

	let notPortalStatesNamesList = []

	vm.getBookmarks = function () {
		bookmarkService.getList().then(function (data) {
			vm.items = data.results
			$scope.$apply()
		})
	}

	vm.getBookmarks()

	const fixStateToGo = (state) => {
		// needed for existing bookmarks to work, after creation of 'app.portal' abstract state

		if (notPortalStatesNamesList.includes(state)) return state

		let substringsList = state.split('.')

		substringsList.splice(1, 0, 'portal')

		return substringsList.join('.')
	}

	vm.goToState = function (layoutInfo) {
		const layoutId = layoutInfo.list_layout
		const stateToGo = fixStateToGo(layoutInfo.data.state)

		let layoutExist = false

		if (!vm.entityUpdating) {
			vm.entityUpdating = true

			uiService.getListLayoutByKey(layoutId).then(function (layoutData) {
				var layout = layoutData

				if (layout && layout.hasOwnProperty('id')) {
					layoutExist = true
				}

				const openActiveLayout = function () {
					/*$state.transitionTo(stateToGo, {layoutName: layout.name});

                        vm.entityUpdating = false;*/
					if (layout.user_code) {
						$state.transitionTo(stateToGo, {
							layoutUserCode: layout.user_code,
						})
						vm.entityUpdating = false
					} else {
						const errorText = 'Layout "' + layout.name + '" has no user code.'
						toastNotificationService.error(errorText)
					}
				}

				if (layoutExist) {
					openActiveLayout()
				} else {
					$state.go('app.portal.not-found')
					vm.entityUpdating = false
				}
			})
		}
	}

	vm.openSettings = function ($event) {
		$mdDialog
			.show({
				controller: 'BookmarksWizardDialogController as vm',
				templateUrl: 'views/dialogs/bookmarks-wizard-dialog-view.html',
				parent: angular.element(document.body),
				targetEvent: $event,
				preserveScope: true,
				multiple: true,
				autoWrap: true,
				skipHide: true,
			})
			.then(function (res) {
				if (res.status === 'agree') {
					vm.getBookmarks()
				}
			})
	}

	const init = function () {
		const registeredStatesList = $state.get()

		notPortalStatesNamesList = registeredStatesList
			.map((stateDeclObj) => stateDeclObj.name)
			.filter((stateName) => {
				return (
					stateName &&
					stateName !== 'app' &&
					!stateName.startsWith('app.portal.')
				)
			})
	}

	init()
}
