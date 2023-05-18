/**
 * Created by szhitenev on 05.02.2020.
 */

import pricingProcedureService from '../../services/procedures/pricingProcedureService'

import toastNotificationService from '@/angular/core/services/toastNotificationService'
import healthcheckService from '../../services/healthcheckService'

export default function ($scope, $mdDialog) {
	var vm = this

	vm.procedures = []

	vm.readyStatus = { data: false }

	vm.getList = function () {
		pricingProcedureService.getList().then(function (data) {
			vm.procedures = data.results.map(function (item) {
				item.user_price_date_from = item.price_date_from_calculated
				item.user_price_date_to = item.price_date_to_calculated

				return item
			})

			console.log('vm.procedures', vm.procedures)

			vm.readyStatus.data = true

			$scope.$apply()
		})
	}

	vm.mediatorStatus = 'Unknown'
	vm.brokerBloombergStatus = 'Unknown'

	vm.executeProcedure = function ($event, item) {
		console.log('Execute Procedure', item)

		pricingProcedureService.runProcedure(item.id, item).then(function (data) {
			toastNotificationService.success('Success. Procedure is being processed')
		})
	}

	vm.editProcedure = function ($event, item) {
		$mdDialog
			.show({
				controller: 'PricingProcedureEditDialogController as vm',
				templateUrl:
					'views/dialogs/procedures/pricing-procedure-edit-dialog-view.html',
				parent: angular.element(document.body),
				targetEvent: $event,
				clickOutsideToClose: false,
				preserveScope: true,
				autoWrap: true,
				skipHide: true,
				multiple: true,
				locals: {
					data: {
						item: item,
					},
				},
			})
			.then(function (res) {
				if (res.status === 'agree') {
					vm.getList()
				}
			})
	}

	vm.getData = function () {
		vm.mediatorStatus = 'Unknown'
		vm.brokerBloombergStatus = 'Unknown'

		return new Promise(function (resolve, reject) {
			healthcheckService
				.getData()
				.then(function (data) {
					vm.healthcheckData = data

					vm.healthcheckData.forEach(function (service) {
						if (service.name === 'Mediator Service') {
							if (service.status === 200) {
								vm.mediatorStatus = 'Online'
							} else {
								vm.mediatorStatus = 'Offline'
							}
						}

						if (service.name === 'Bloomberg Data Provider Service') {
							if (service.status === 200) {
								vm.brokerBloombergStatus = 'Online'
							} else {
								vm.brokerBloombergStatus = 'Offline'
							}
						}
					})

					vm.noInfo = false

					console.log(
						'HealthcheckController.vm.healthcheckData',
						vm.healthcheckData
					)

					vm.readyStatus.data = true

					resolve()

					$scope.$apply()
				})
				.catch(function (error) {
					console.log('error', error)

					vm.noInfo = true

					$scope.$apply()
				})
		})
	}

	vm.init = function () {
		vm.getList()

		console.log('Run Pricing Procedure')

		// if ('__HEALTHCHECK_HOST__') {
		if (window.HEALTHCHECK_HOST) {
			vm.getData()
		} else {
			vm.noInfo = true
		}
	}

	vm.init()
}
