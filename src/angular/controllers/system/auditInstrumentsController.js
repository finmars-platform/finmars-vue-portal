import logService from '@/angular/core/services/logService'
import auditService from '../../services/auditService'

export default function ($scope) {
	logService.controller('AuditController', 'initialized')

	var vm = this

	vm.entityType = 'audit-instrument'
	vm.contentType = 'audit.objecthistory4entry'
	vm.entityRaw = []

	vm.readyStatus = { content: false }

	vm.entityViewer = { extraFeatures: [] }

	vm.getList = function (options) {
		if (options.hasOwnProperty('filters')) {
			options['filters'] = {}
		}

		if (options['filters'].hasOwnProperty('content_type')) {
			options['filters']['content_type'] = {}
		}

		options['filters']['content_type'] = 'instruments.instrument'

		return auditService.getList(options).then(function (data) {
			return data
		})
	}

	vm.init = function () {
		vm.readyStatus.content = true
	}

	vm.init()
}
