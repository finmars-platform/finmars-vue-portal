/**
 * Created by szhitenev on 02.02.2022.
 */

import helpExpressionsService from '../../services/helpExpressionsService'
import expressionService from '../../services/expression.service'

import unifiedDataService from '../../services/unifiedDataService'

export default function (
	$scope,
	$mdDialog,
	backendConfigurationImportService,
	data
) {
	var vm = this

	vm.readyStatus = { packages: false, groups: false }

	vm.expressionsHistory = []

	vm.searchExpr = ''

	vm.getFilters = function () {
		var result = {}

		result.name = vm.searchExpr

		if (vm.selectedGroup && vm.selectedGroup.key !== 'all') {
			result.group = vm.selectedGroup.id
		}

		return result
	}

	vm.selectItem = function (item) {
		vm.packages.forEach(function (expr) {
			expr.isSelected = false
		})

		item.isSelected = true

		vm.selectedItem = item
	}

	vm.selectGroup = function (item) {
		vm.groups.forEach(function (expr) {
			expr.isSelected = false
		})

		item.isSelected = true

		vm.selectedGroup = item


	}

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	var getPackages = function () {
		vm.readyStatus.packages = true

		var filters = {}

		if (data.contentType) {
			filters.content_type = data.contentType
		}

		if (data.targetContentType) {
			filters.target_content_type = data.targetContentType
		}

		unifiedDataService
			.getConfigurationPackageList({
				filters: filters,
			})
			.then(function (data) {
				vm.packages = data.results

				vm.readyStatus.packages = true



				vm.selectedItem = vm.packages[0]
				$scope.$apply()
			})
	}

	var getGroups = function () {
		unifiedDataService.getConfigurationPackageGroupList().then(function (data) {
			vm.groups = data.results

			vm.readyStatus.groups = true

			vm.selectedGroup = vm.groups[0]

			var result = []

			result = result.concat(vm.groups)

			result.unshift({
				name: 'All',
				key: 'all',
			})

			vm.groups = result
		})
	}

	vm.importConfiguration = function (resolve) {
		backendConfigurationImportService
			.importConfigurationAsJson(vm.importConfig)
			.then(function (data) {
				vm.importConfig = data

				vm.counter = data.processed_rows
				vm.activeItemTotal = data.total_rows

				$scope.$apply()

				if (vm.importConfig.task_status === 'SUCCESS') {
					resolve()
				} else {
					setTimeout(function () {
						vm.importConfiguration(resolve)
					}, 1000)
				}
			})
	}

	vm.agree = function ($event) {
		unifiedDataService
			.getConfigurationPackageFile(vm.selectedItem.id)
			.then(function (data) {


				vm.importConfig = {
					data: data,
					mode: 'overwrite',
				}

				var blob = new Blob([JSON.stringify(data)], {
					type: 'application/json',
				})
				var fileOfBlob = new File([blob], 'configuration.fcfg')

				$mdDialog.show({
					controller: 'ConfigurationImportDialogController as vm',
					templateUrl:
						'views/dialogs/configuration-import/configuration-import-dialog-view.html',
					parent: angular.element(document.body),
					targetEvent: $event,
					preserveScope: true,
					autoWrap: true,
					skipHide: true,
					locals: {
						data: {
							file: data,
							rawFile: fileOfBlob,
							selectAll: true,
						},
					},
				})

				$mdDialog.hide({ status: 'agree', data: {} })
			})
	}

	var init = function () {
		//var promises = [getFunctionItems, getFunctionsGroups];
		getPackages()
		getGroups()

		//Promise.all(promises).then(function () {

		//$scope.$apply();

		setTimeout(function () {
			var resizerElem = document.querySelector('.exprEditorColsResizer')
			var leftColToResize = document.querySelector('.exprEditorExprsCol')
			var rightColToResize = document.querySelector('.exprEditorDescriptionCol')

			resizerElem.addEventListener('mousedown', function (event) {
				event.preventDefault()
				event.stopPropagation()

				var mouseDownLeft = event.clientX
				var cursorDistance
				var newLeftColWidth
				var newRightColWidth

				var leftColWidth = leftColToResize.clientWidth
				var rightColWidth = rightColToResize.clientWidth

				var resizeColsOnMousemove = function (event) {
					var eventClientX = event.clientX
					cursorDistance = eventClientX - mouseDownLeft

					newLeftColWidth = leftColWidth + cursorDistance
					newRightColWidth = rightColWidth - cursorDistance

					if (newLeftColWidth > 150 && newRightColWidth > 150) {
						leftColToResize.style.width = newLeftColWidth + 'px'
						rightColToResize.style.width = newRightColWidth + 'px'
					}
				}

				window.addEventListener('mousemove', resizeColsOnMousemove)

				window.addEventListener(
					'mouseup',
					function () {
						window.removeEventListener('mousemove', resizeColsOnMousemove)
					},
					{ once: true }
				)
			})
		}, 50)

		//});
	}

	init()
}
