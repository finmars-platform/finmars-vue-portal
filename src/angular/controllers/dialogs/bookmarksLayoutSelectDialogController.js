/**
 * Created by szhitenev on 06.02.2017.
 */

import logService from '@/angular/core/services/logService'

import metaService from '../../services/metaService'

export default function (
	$scope,
	$mdDialog,
	metaContentTypesService,
	uiService
) {
	logService.controller('BookmarksLayoutSelectDialogController', 'initialized')

	var vm = this

	function contentTypeToState(contentType) {
		var result = ''

		metaContentTypesService.getListForUi().forEach(function (item) {
			if (item.key == contentType) {
				if (contentType.indexOf('reports') == 0) {
					result = 'app.portal.reports.' + item.entity
				} else {
					result = 'app.portal.data.' + item.entity
				}
			}
		})

		return result
	}

	metaService.getContentGroups('entityLayoutsGroups').then(function (data) {
		vm.groups = data
	})

	vm.readyStatus = { content: false }

	var sortLayoutsBy = {
		sort: {
			key: 'content_type',
			direction: 'DSC',
		},
	}

	uiService.getListLayout('all', sortLayoutsBy).then(function (data) {
		vm.items = data.results

		vm.items.forEach(function (item) {
			var i
			for (i = 0; i < vm.groups.length; i++) {
				if (item.content_type === vm.groups[i].key) {
					vm.groups[i].content.push(item)
					break
				}
			}
		})

		vm.readyStatus.content = true
		$scope.$apply()
	})

	vm.selectedLayoutId = null

	vm.selectLayout = function (item) {
		vm.selectedLayoutId = item.id
		vm.selectedContentType = item.content_type
		vm.selectedLayoutName = item.name
	}

	vm.isSelectedLayout = function (layoutId) {
		if (vm.selectedLayoutId === layoutId) {
			return true
		}

		return false
	}

	vm.agree = function () {
		$mdDialog.hide({
			status: 'agree',
			data: {
				listLayoutId: vm.selectedLayoutId,
				state: contentTypeToState(vm.selectedContentType),
				name: vm.selectedLayoutName,
				content_type: vm.selectedContentType,
			},
		})
	}

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}
}
