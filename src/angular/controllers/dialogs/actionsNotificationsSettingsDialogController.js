/**
 * Created by mevstratov on 27.02.2019.
 */

// import logService from '@/angular/core/services/logService';

import timeZonesService from '../../services/timeZonesService'

// import usersService from '../../services/usersService';

export default function ($scope, $mdDialog, usersService, globalDataService) {
	// logService.controller('ActionsNotificationsSettingsDialogController', 'initialized');

	var vm = this

	vm.readyStatus = { member: false }

	vm.timeZones = timeZonesService.getList()

	/* usersService.getOwnMemberSettings().then(function (data) {
            vm.member = data.results[0];
            vm.readyStatus.member = true;
            $scope.$apply();
        }); */
	vm.member = globalDataService.getMember()
	vm.readyStatus.member = true

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.save = function () {
		usersService.updateOwnMemberSettings(vm.member.id, vm.member).then(
			function (response) {
				$mdDialog.hide({ status: 'success' })
			},
			function (error) {
				console.log('notifications error', error)
				$mdDialog.hide({ status: error })
			}
		)
	}
}
