/**
 * Created by szhitenev on 04.11.16.
 */

import evEvents from '@/angular/services/entityViewerEvents'

import uiService from '@/angular/services/uiService'

import inviteToSharedConfigurationFileService from '@/angular/services/inviteToSharedConfigurationFileService'
import shareConfigurationFileService from '@/angular/services/shareConfigurationFileService'
// import backendConfigurationImportService from '@/angular/services/backendConfigurationImportService';

export default function (
	$scope,
	$mdDialog,
	backendConfigurationImportService,
	options
) {
	var vm = this

	vm.readyStatus = { items: false }

	vm.invites = []

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.acceptInvite = function ($event, invite) {
		console.log('Accept invite: ', $event, invite)

		invite.status = 1

		inviteToSharedConfigurationFileService
			.updateMyInvite(invite.id, invite)
			.then(function (data) {
				var sharedFile = data

				vm.importConfig = {
					data: sharedFile.shared_configuration_file_object.data,
					mode: 'overwrite',
				}

				new Promise(function (resolve, reject) {
					vm.importConfiguration(resolve)
				}).then(function (data) {
					console.log('Import Finished')

					vm.getInvites()

					vm.getList().then(function (data) {
						vm.items.forEach(function (item) {
							if (
								item.name === sharedFile.shared_configuration_file_object.name
							) {
								item.sourced_from_global_layout =
									sharedFile.shared_configuration_file

								uiService
									.updateListLayout(item.id, item)
									.then(function (value) {
										vm.getList().then(function (value1) {
											$mdDialog.show({
												controller: 'InfoDialogController as vm',
												templateUrl: 'views/info-dialog-view.html',
												parent: angular.element(document.body),
												targetEvent: $event,
												clickOutsideToClose: false,
												preserveScope: true,
												autoWrap: true,
												skipHide: true,
												multiple: true,
												locals: {
													info: {
														title: 'Success',
														description: 'Layout is installed',
													},
												},
											})
										})
									})
							}
						})
					})
				})
			})
	}

	vm.declineInvite = function ($event, invite) {
		console.log('Decline invite: ', $event, invite)

		invite.status = 2

		inviteToSharedConfigurationFileService
			.updateMyInvite(invite.id, invite)
			.then(function (value) {
				vm.getInvites()
			})
	}

	vm.importConfiguration = function (resolve) {
		backendConfigurationImportService
			.importConfigurationAsJson(vm.importConfig)
			.then(function (data) {
				vm.importConfig = data

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

	vm.getInvites = function () {
		inviteToSharedConfigurationFileService
			.getListOfMyInvites({
				filters: {
					status: '0',
				},
			})
			.then(function (data) {
				vm.invites = data.results

				vm.readyStatus.items = true

				console.log('vm.invites', vm.invites)

				$scope.$apply()
			})
	}

	vm.init = function () {
		vm.getInvites()
	}

	vm.init()
}
