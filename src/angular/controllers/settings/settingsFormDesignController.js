/**
 * Created by szhitenev on 02.08.2016.
 */

import logService from '@/angular/core/services/logService'

export default function ($scope, $state) {
	logService.controller('SettingsFormDesignController', 'initialized')

	var vm = this

	vm.goToState = function (entity) {
		$state.go('app.portal.data-constructor', { entityType: entity })
	}
}
