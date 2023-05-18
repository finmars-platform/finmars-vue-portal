/**
 * Created by szhitenev on 28.07.2020.
 */

import healthcheckService from '../../services/healthcheckService'

export default function HealthcheckController($scope) {
	var vm = this

	vm.readyStatus = { data: false }

	vm.dataBaseConnectionInfo = null
	vm.updateInfo = null
	vm.memoryInfo = null

	vm.noInfo = false

	vm.getData = function () {
		return new Promise(function (resolve, reject) {
			healthcheckService
				.getData()
				.then(function (data) {
					vm.healthcheckData = data

					vm.healthcheckData = vm.healthcheckData.map(function (service) {
						if (service.status === 200) {
							Object.keys(service.data.checks).forEach(function (key) {
								if (key === 'database:responseTime') {
									if (Array.isArray(service.data.checks[key])) {
										service.dataBaseConnectionInfo = service.data.checks[key][0]
									} else {
										service.dataBaseConnectionInfo = service.data.checks[key]
									}
								}

								// if (key === 'disk:utilization') {
								//
								//     service.dataBaseConnectionInfo = service.data.checks[key]
								//
								// }

								if (key === 'memory:utilization') {
									if (Array.isArray(service.data.checks[key])) {
										service.memoryInfo = service.data.checks[key][0]
									} else {
										service.memoryInfo = service.data.checks[key]
									}
								}

								if (key === 'uptime') {
									if (Array.isArray(service.data.checks[key])) {
										service.uptimeInfo = service.data.checks[key][0]
									} else {
										service.uptimeInfo = service.data.checks[key]
									}

									service.uptimeInfo.hours = Math.floor(
										service.uptimeInfo.observedValue / 60 / 60
									)
								}
							})
						}

						return service
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
		// if ('__HEALTHCHECK_HOST__') {
		if (window.HEALTHCHECK_HOST) {
			vm.getData()
		} else {
			vm.noInfo = true
		}
	}

	vm.init()
}
