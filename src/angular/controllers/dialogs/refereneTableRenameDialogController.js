/**
 * Created by szhitenev on 08.06.2016.
 */

import referenceTablesService from '../../services/referenceTablesService'

export default function ($scope, $mdDialog, data) {
	console.log('data', data)

	var vm = this

	vm.referenceTable = data.referenceTable

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.agree = function () {
		referenceTablesService
			.update(vm.referenceTable.id, vm.referenceTable)
			.then(function () {
				$mdDialog.hide({ status: 'agree' })
			})
	}
}
