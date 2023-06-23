/**
 * Created by szhitenev on 23.11.2021.
 */

import dataProcedureInstanceService from '../../services/procedures/dataProcedureInstanceService'

export default function ($scope, $mdDialog) {
	var vm = this

	vm.procedures = []

	vm.readyStatus = { procedures: false }

	vm.getList = function () {
		dataProcedureInstanceService.getList().then(function (data) {
			vm.procedures = data.results
			console.log(vm.procedures)

			vm.readyStatus.procedures = true

			$scope.$apply()
		})
	}

	vm.refreshItem = function ($index, item) {
		dataProcedureInstanceService.getByKey(item.id).then(function (data) {
			data.opened = item.opened

			vm.procedures.splice($index, 1, data)

			console.log('data', data)

			$scope.$apply()
		})
	}

	vm.showErrorDetails = function ($event, procedure) {
		var description

		description = '<div>'

		description =
			description + '<p> <b>Status Code:</b> ' + procedure.error_code + '</p>'
		description =
			description +
			'<p> <b>Description:</b> <br/><br/> ' +
			procedure.error_message +
			'</p>'

		description = description + '</div>'

		$mdDialog.show({
			controller: 'InfoDialogController as vm',
			templateUrl: 'views/info-dialog-view.html',
			parent: angular.element(document.body),
			targetEvent: $event,
			clickOutsideToClose: false,
			preserveScope: true,
			autoWrap: true,
			skipHide: true,
			multiple: true,
			locals: {
				info: {
					title: 'Procedure Error Details',
					description: description,
				},
			},
		})
	}

	vm.init = function () {
		vm.getList()
	}

	vm.init()
}
