/**
 * Created by szhitenev on 17.08.2016.
 */

import timeZonesService from '@/angular/services/timeZonesService'

// import usersService from '@/angular/services/usersService';

export default function ($scope, $mdDialog, authorizerService) {
	var vm = this

	vm.readyStatus = { processing: false, finished: false }

	vm.timeZones = timeZonesService.getList()

	vm.save = function ($event) {
		vm.readyStatus.processing = true
		vm.readyStatus.finished = false
		authorizerService
			.changePassword(0, vm.data)
			.then(function (data) {
				vm.readyStatus.processing = false

				vm.data = {}
				vm.readyStatus.finished = true
				$scope.$apply()
			})
			.catch(function (reason) {
				$mdDialog.show({
					controller: 'ValidationDialogController as vm',
					templateUrl: 'views/dialogs/validation-dialog-view.html',
					targetEvent: $event,
					locals: {
						validationData: reason,
					},
					preserveScope: true,
					autoWrap: true,
					skipHide: true,
				})
			})
	}
}
