/**
 * Created by szhitenev on 15.06.2016.
 */

import logService from '@/angular/core/services/logService'
import auditService from '../../services/auditService'

export default function ($scope) {
	console.log(
		'{"controller": "DataInstrumentController", status: "initialized"}'
	)

	var vm = this

	vm.entityType = 'audit-transaction' // deprecated
	vm.contentType = 'audit.transactionaudit'
	vm.entityRaw = []

	vm.readyStatus = { content: false }

	vm.entityViewer = { extraFeatures: [] }

	vm.components = {
		sidebar: true,
		groupingArea: true,
		columnAreaHeader: true,
		splitPanel: true,
		addEntityBtn: false,
		fieldManagerBtn: true,
		layoutManager: true,
		autoReportRequest: false,
	}

	// auditService.getList({filters: {'content_type': 'transactions.transaction'}}).then(function (data) {
	//     vm.entityRaw = data;
	//     vm.readyStatus.content = true;
	//     $scope.$apply();
	// });

	vm.getList = function (options) {
		return auditService.getList(options).then(function (data) {
			return data
		})
	}

	vm.init = function () {
		vm.readyStatus.content = true
	}

	vm.init()
}
