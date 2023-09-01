/**
 * Created by szhitenev on 18.11.2021.
 */

import instrumentEventService from '../../services/instrumentEventService'

export default function ($scope) {
	var vm = this

	vm.entityType = 'generated-event'
	vm.contentType = 'instruments.generatedevent'
	vm.entityRaw = []

	vm.readyStatus = { content: false }

	vm.entityViewer = { extraFeatures: [] }

	vm.getList = function (options) {
		return instrumentEventService.getList(options).then(function (data) {
			return data
		})
	}

	vm.init = function () {
		vm.readyStatus.content = true
	}

	vm.init()
}
