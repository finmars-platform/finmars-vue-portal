/**
 * Created by mevstratov on 25.06.2019.
 */
// TO DELETE: commented 2020-11-04

import uiService from '../../services/uiService'

export default function ($scope, $mdDialog, $state, data) {
	var vm = this

	var entityType = data.entityType

	uiService.getListLayout(entityType).then(function (data) {
		vm.layouts = data.results
		vm.readyStatus = true
		$scope.$apply()
	})

	vm.openLayout = function (layoutToOpen) {
		if (!layoutToOpen.is_default) {
			uiService.getDefaultListLayout(entityType).then(function (data) {
				var promises = []
				var activeLayout = data.results[0]
				activeLayout.is_default = false
				promises.push(uiService.updateListLayout(activeLayout.id, activeLayout))

				layoutToOpen.is_default = true
				promises.push(uiService.updateListLayout(layoutToOpen.id, layoutToOpen))
				Promise.all(promises).then(function () {
					var state = 'app.portal.data.' + entityType
					$state.go(state)
				})
			})
		} else {
			var state = 'app.portal.data.' + entityType
			$state.go(state)
		}
	}

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}
}
