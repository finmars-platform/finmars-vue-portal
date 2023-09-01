/**
 * Created by szhitenev on 04.03.2020.
 */

import priceHistoryErrorService from '../../services/pricing/priceHistoryErrorService'

export default function ($scope, $mdDialog, $state, entityId) {
	var vm = this

	vm.entityId = entityId

	vm.readyStatus = {
		entity: false,
	}

	vm.checkReadyStatus = function () {
		return vm.readyStatus.entity
	}

	vm.getItem = function () {
		return new Promise(function (res, rej) {
			priceHistoryErrorService.getByKey(vm.entityId).then(function (data) {
				vm.entity = data

				vm.readyStatus.entity = true

				$scope.$apply()
			})
		})
	}

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.save = function ($event) {
		priceHistoryErrorService
			.update(vm.entityId, vm.entity)
			.then(function (data) {
				$mdDialog.hide({
					status: 'agree',
					data: {
						ids: [vm.entityId],
					},
				})
			})
	}

	vm.init = function () {
		vm.getItem()
	}

	vm.init()
}
