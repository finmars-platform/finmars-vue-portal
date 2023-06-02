/**
 * Created by szhitenev on 15.09.2021.
 */

import uiService from '../../services/uiService'
// import usersService from '../services/usersService';
// import usersGroupService from '../services/usersGroupService';

// import backendConfigurationImportService from '../services/backendConfigurationImportService';

import toastNotificationService from '@/angular/core/services/toastNotificationService'

export default function (
	$scope,
	$state,
	$mdDialog,
	usersService,
	usersGroupService,
	backendConfigurationImportService,
	authorizerService
) {
	var vm = this

	vm.readyStatus = { content: false, member: false, groups: false }
	vm.processing = false

	vm.setActiveConfig = function ($event, id) {
		var item = vm.items.find(function (item) {
			return item.id === id
		})

		vm.applyItem($event, item)
	}

	/* vm.getMember = function () {

			return usersService.getMyCurrentMember().then(function (data) {

				vm.member = data;


				console.log('vm.member', vm.member);

				vm.readyStatus.member = true;
				$scope.$apply();

			});

        }; */

	vm.getGroupList = function () {
		return usersGroupService.getList().then(function (data) {
			vm.groups = data.results.filter(function (item) {
				return item.role === 2
			})

			vm.readyStatus.groups = true
		})
	}

	vm.getList = function () {
		vm.readyStatus.content = false

		uiService.getConfigurationList().then(function (data) {
			vm.items = data.results

			console.log('vm.items', vm.items)

			vm.readyStatus.content = true

			$scope.$apply()
		})
	}

	vm.importConfiguration = function ($event, resolve) {
		console.log('vm.importConfig', vm.importConfig)

		var blob = new Blob([JSON.stringify(vm.importConfig.data)], {
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
					file: vm.importConfig.data,
					rawFile: fileOfBlob,
				},
			},
		})

		// vm.processing = true;
		//
		// backendConfigurationImportService.importConfigurationAsJson(vm.importConfig).then(function (data) {
		//
		//     vm.importConfig = data;
		//
		//     vm.counter = data.processed_rows;
		//     vm.activeItemTotal = data.total_rows;
		//
		//
		//
		//     if (vm.importConfig.task_status === 'SUCCESS') {
		//
		//         vm.processing = false;
		//
		//         $scope.$apply();
		//
		//         resolve()
		//
		//     } else {
		//
		//         $scope.$apply();
		//
		//         setTimeout(function () {
		//             vm.importConfiguration($event, resolve);
		//         }, 1000)
		//
		//     }
		//
		// })
	}

	vm.applyItem = function ($event, item) {
		vm.importConfig = {
			data: item.data,
			mode: 'overwrite',
		}

		new Promise(function (resolve, reject) {
			vm.importConfiguration($event, resolve)
		}).then(function (value) {
			toastNotificationService.info('Configuration is applied')
		})
	}

	vm.applyInitialConfiguration = function ($event) {
		console.log('applyInitialConfiguration')

		authorizerService.getInitialConfiguration().then(function (data) {
			vm.importConfig = {
				data: data.data,
				mode: 'overwrite',
			}

			new Promise(function (resolve, reject) {
				vm.importConfiguration($event, resolve)
			}).then(function (value) {
				toastNotificationService.info('Configuration is applied')
			})
		})
	}

	vm.init = function () {
		// vm.getMember();
		vm.getGroupList()
		vm.getList()
	}

	vm.init()
}
