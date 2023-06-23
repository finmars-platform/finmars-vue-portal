/**
 * Created by szhitenev on 02.02.2023.
 */

'use strict'

import downloadFileHelper from '../../helpers/downloadFileHelper'

export default function (
	$scope,
	$mdDialog,
	toastNotificationService,
	masterUserService,
	utilsService
) {
	const vm = this

	vm.processing = false

	vm.readyStatus = {
		stats: false,
		logs: false,
		master_user: false,
	}

	vm.getStats = function () {
		vm.readyStatus.stats = false

		utilsService
			.getSystemInfo()
			.then(function (data) {
				vm.systemInfoItems = data.results
				vm.readyStatus.stats = true
				$scope.$apply()
			})
			.catch(function (error) {
				vm.readyStatus.stats = true
				$scope.$apply()
			})
	}

	vm.getLogs = function () {
		vm.readyStatus.logs = false

		utilsService
			.getSystemLogs()
			.then(function (data) {
				vm.logFiles = data.results

				vm.readyStatus.logs = true
				$scope.$apply()
			})
			.catch(function (error) {
				vm.readyStatus.logs = true
				$scope.$apply()
			})
	}

	vm.previewLog = function ($event, log_file_name) {
		utilsService.getSystemLog(log_file_name).then(function (data) {
			$mdDialog.show({
				controller: 'FilePreviewDialogController as vm',
				templateUrl: 'views/dialogs/file-preview-dialog-view.html',
				parent: angular.element(document.body),
				targetEvent: $event,
				clickOutsideToClose: false,
				preserveScope: true,
				autoWrap: true,
				skipHide: true,
				multiple: true,
				locals: {
					data: {
						content: data,
						file_descriptor: {
							name: log_file_name,
						},
					},
				},
			})
		})
	}

	vm.getTablesSize = function () {
		vm.readyStatus.tablesSize = false

		utilsService
			.getTablesSize()
			.then(function (data) {
				vm.tablesSizes = data.results

				vm.readyStatus.tablesSize = true
				$scope.$apply()
			})
			.catch(function (error) {
				vm.readyStatus.tablesSize = true
				$scope.$apply()
			})
	}

	vm.downloadLog = function ($event, log_file_name) {
		utilsService.getSystemLog(log_file_name).then(function (data) {
			downloadFileHelper.downloadFile(data, 'plain/text', log_file_name)
		})
	}

	vm.checkReadyStatus = function () {
		return (
			vm.readyStatus.tablesSize &&
			vm.readyStatus.stats &&
			vm.readyStatus.logs &&
			vm.readyStatus.master_user
		)
	}

	vm.getMasterUser = function () {
		vm.readyStatus.master_user = false

		masterUserService.getMasterUser().then(function (data) {
			vm.master_user = data

			vm.readyStatus.master_user = true
			$scope.$apply()
		})
	}

	vm.saveMasterUser = function ($event) {
		vm.masterUserProcessing = true

		masterUserService.updateMasterUser(vm.master_user).then(function () {
			toastNotificationService.success('Space Updated')

			vm.masterUserProcessing = false
			$scope.$apply()

			vm.getMasterUser()
		})
	}

	vm.init = function () {
		vm.getStats()
		vm.getLogs()

		vm.getTablesSize()
		vm.getMasterUser()
	}

	vm.init()
}
