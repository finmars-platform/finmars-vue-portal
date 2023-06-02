/**
 * Created by szhitenev on 17.08.2016.
 */

import timeZonesService from '@/angular/services/timeZonesService'

// import usersService from '@/angular/services/usersService';

export default function ($scope, $state, usersService, globalDataService) {
	var vm = this

	vm.readyStatus = { member: false }

	vm.timeZones = timeZonesService.getList()

	/*usersService.getOwnMemberSettings().then(function (data) {
            vm.member = data.results[0];
            vm.readyStatus.member = true;
            $scope.$apply();
        });*/
	vm.member = globalDataService.getMember()
	vm.readyStatus.member = true

	vm.save = function () {
		usersService
			.updateOwnMemberSettings(vm.member.id, vm.member)
			.then(function () {
				$state.go('app.portal.settings.interface-access', null, {
					reload: 'app',
				})

				$scope.$apply()
			})
	}
}
