/**
 * Created by szhitenev on 08.06.2016.
 */

import logService from '@/angular/core/services/logService'

export default function ($scope, $mdDialog, success) {
	logService.controller('SuccessDialogController', 'initialized')

	var vm = this

	vm.success = success

	vm.agree = function () {
		$mdDialog.hide({ status: 'agree' })
	}
}
