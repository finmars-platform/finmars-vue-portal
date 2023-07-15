/**
 * Created by szhitenev on 13.03.2020.
 */

import pricingParentProcedureService from '../../services/procedures/pricingParentProcedureService'

export default function ($scope, $mdDialog) {
	var vm = this

	vm.procedures = []

	vm.readyStatus = { procedures: false }

	vm.getList = function () {
		pricingParentProcedureService.getList().then(function (data) {
			vm.procedures = data.results.map(function (item) {
				item.processed_procedures = item.procedures.filter(function (
					procedure
				) {
					return procedure.status !== 'P'
				}).length

				if (item.processed_procedures) {
					item.progress_percent = Math.floor(
						(item.processed_procedures / item.procedures.length) * 100
					)
				} else {
					item.progress_percent = 0
				}

				return item
			})



			vm.readyStatus.procedures = true

			$scope.$apply()
		})
	}

	vm.refreshItem = function ($index, item) {
		pricingParentProcedureService.getByKey(item.id).then(function (data) {
			data.opened = item.opened

			data.processed_procedures = data.procedures.filter(function (procedure) {
				return procedure.status !== 'P'
			}).length

			if (data.processed_procedures) {
				data.progress_percent = Math.floor(
					(data.processed_procedures / data.procedures.length) * 100
				)
			} else {
				data.progress_percent = 0
			}

			vm.procedures.splice($index, 1, data)



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

	vm.showRequestDetails = function ($event, procedure) {
		var text

		if (procedure.request_data) {
			text = JSON.stringify(procedure.request_data, null, 4)
		} else {
			text = 'No request data found'
		}

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
					title: 'Procedure Request',
					description: text,
				},
			},
		})
	}

	vm.init = function () {
		vm.getList()
	}

	vm.init()
}
