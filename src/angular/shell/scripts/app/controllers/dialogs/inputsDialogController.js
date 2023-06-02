/**
 * Created by mevstratov on 31.01.2022.
 */

'use strict';

export default function ($scope, $mdDialog, data) {

	let vm = this;

	vm.title = data.title;
	vm.inputsList = data.inputsList;

	vm.cancel = function () {
		$mdDialog.hide({status: 'disagree'});
	};

	vm.agree = function () {

		const resData = vm.inputsList.map(input => input.model);

		$mdDialog.hide({status: 'agree', data: resData});

	};

}