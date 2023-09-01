/**
 * Created by mevstratov on 31.01.2022.
 */

import metaHelper from '../../helpers/meta.helper'

;('use strict')

export default function ($scope, $mdDialog, data) {
	let vm = this

	vm.title = data.title
	vm.inputLabel = data.inputLabel ? data.inputLabel : ''

	vm.occupiedUserCodesList = Array.isArray(data.occupiedUserCodesList)
		? data.occupiedUserCodesList
		: []
	const userCodeName = data.userCodeName ? data.userCodeName : 'User code'

	vm.userCode = ''
	vm.eventObj = {
		event: {},
	}

	vm.userCodeIsValid = false

	vm.validateUserCode = function () {
		var errorText = metaHelper.validateTextForUserCode(
			vm.userCode,
			vm.occupiedUserCodesList,
			userCodeName
		)

		if (errorText) {
			vm.eventObj.event = { key: 'error', error: errorText }
			vm.userCodeIsValid = false

			// return false;
		}

		vm.userCodeIsValid = true

		setTimeout(function () {
			// enables "OK' button faster
			$scope.$apply()
		}, 0)
		// return true;
		return vm.userCodeIsValid
	}

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.agree = function () {
		const isValid = vm.validateUserCode()

		if (isValid) {
			$mdDialog.hide({ status: 'agree', data: vm.userCode })
		}
	}
}
