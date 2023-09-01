/**
 * Created by mevstratov on 28.05.2021.
 */

'use strict';

export default function($scope, $mdDialog, warning) {

	let vm = this;

	vm.warning = warning;

	vm.actionsButtons = undefined;

	if (warning.actionsButtons && warning.actionsButtons.length) {

		vm.actionsButtons = warning.actionsButtons;

	}

	vm.cancel = function () {
		$mdDialog.hide({status: 'disagree'});
	};

	vm.agree = function (responseData) {

		if (responseData !== undefined) {
			$mdDialog.hide(responseData);
		} else {
			$mdDialog.hide({status: 'agree'});
		}

	};

}