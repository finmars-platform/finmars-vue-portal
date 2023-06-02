/**
 * Created by szhitenev on 08.06.2016.
 */

import logService from '@/angular/core/services/logService'

export default function ($scope, $mdDialog, info) {
	logService.controller('WarningDialogController', 'initialized')

	var vm = this

	vm.info = info

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.agree = function () {
		$mdDialog.hide({ status: 'agree' })
	}
}
