/**
 * Created by szhitenev on 04.02.2023.
 */

import historyService from '../../services/historyService'
import entityResolverService from '../../services/entityResolverService'
import complexTransactionService from '../../services/transaction/complexTransactionService'
;('use strict')

export default function ($scope, $mdDialog, globalDataService, data) {
	var vm = this

	vm.readyStatus = {
		historyRecords: false,
		entity: false,
		activeHistoryRecord: false,
	}

	vm.items = []

	vm.activeHistoryRecord = null
	vm.showJsons = false

	vm.updateSelected = function (record) {
		setTimeout(function () {
			vm.activeHistoryRecord = record
			vm.activeHistoryRecord.data_pretty = JSON.stringify(
				vm.activeHistoryRecord.data,
				null,
				4
			)

			vm.delta = jsondiffpatch.diff(vm.entity, vm.activeHistoryRecord.data)

			vm.delta_pretty = JSON.stringify(vm.delta, null, 4)

			document.querySelector('.history-dialog-delta-visual').innerHTML =
				jsondiffpatch.formatters.html.format(vm.delta, vm.entity)
		}, 100)
	}

	vm.getData = function () {
		vm.readyStatus.historyRecords = false

		historyService.getList(vm.content_type, vm.user_code).then(function (data) {
			vm.items = data.results

			if (vm.items.length) {
				vm.activeHistoryRecordId = vm.items[0].id

				vm.updateSelected(vm.items[0])
			}

			vm.readyStatus.historyRecords = true
			$scope.$apply()
		})
	}

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.agree = function () {
		$mdDialog.hide({ status: 'agree' })
	}

	vm.getEntity = function () {
		vm.readyStatus.entity = false

		if (vm.content_type === 'transactions.complextransaction') {
			complexTransactionService.getByKey(vm.id).then(function (data) {
				vm.entity = data
				vm.entity_pretty = JSON.stringify(vm.entity, null, 4)
				vm.readyStatus.entity = true

				vm.getData()
			})
		} else {
			entityResolverService
				.getByKey(vm.entityType, vm.id)
				.then(function (data) {
					vm.entity = data
					vm.entity_pretty = JSON.stringify(vm.entity, null, 4)
					vm.readyStatus.entity = true

					vm.getData()
				})
		}
	}

	vm.init = function () {
		console.log('data', data)

		vm.content_type = data.content_type
		vm.entityType = data.entityType
		vm.user_code = data.user_code
		vm.id = data.id

		if (vm.user_code) {
			vm.getEntity()
		}
	}

	vm.init()
}
