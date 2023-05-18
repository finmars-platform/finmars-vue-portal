/**
 * Created by szhitenev on 17.01.2020.
 */

import evEvents from '@/angular/services/entityViewerEvents'

import uiService from '@/angular/services/uiService'
import memberService from '@/angular/services/membersAndGroupsService'

import shareConfigurationFileService from '@/angular/services/shareConfigurationFileService'
import inviteToSharedConfigurationFileService from '@/angular/services/inviteToSharedConfigurationFileService'

export default function ($scope, $mdDialog, options) {
	var vm = this

	vm.layout = options.layout

	vm.readyStatus = { members: false, configurationFile: false }

	vm.globalConfigurationFile = {}

	vm.assignedMembersList = []
	vm.inviteNotes = ''

	vm.getMemberList = function () {
		memberService.getMembersList().then(function (data) {
			vm.members = data.results

			console.log('vm.members', vm.members)

			vm.readyStatus.members = true

			// vm.getSentInvites();

			$scope.$apply()
		})
	}

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.getAllReportLayouts = function () {
		return new Promise(function (resolve, reject) {
			var promises = []

			/* promises.push(uiService.getListLayoutDefault(
                    {
                        filters: {
                            content_type: 'reports.balancereport'
                        }
                    }
                )); */
			promises.push(
				uiService.getListLayout(null, {
					pageSize: 1000,
					filters: {
						content_type: 'reports.balancereport',
					},
				})
			)

			/* promises.push(uiService.getListLayoutDefault(
                    {
                        filters: {
                            content_type: 'reports.plreport'
                        }
                    }
                )); */
			promises.push(
				uiService.getListLayout(null, {
					pageSize: 1000,
					filters: {
						content_type: 'reports.plreport',
					},
				})
			)

			/* promises.push(uiService.getListLayoutDefault(
                    {
                        filters: {
                            content_type: 'reports.transactionreport'
                        }
                    }
                )); */
			promises.push(
				uiService.getListLayout(null, {
					pageSize: 1000,
					filters: {
						content_type: 'reports.transactionreport',
					},
				})
			)

			Promise.all(promises).then(function (data) {
				console.log('data', data)

				var result = []

				data.forEach(function (dataItem) {
					dataItem.results.forEach(function (layout) {
						result.push(layout)
					})
				})

				console.log('result', result)

				resolve(result)
			})
		})
	}

	vm.getReportLayoutsFromDashboardLayout = function (dashboardLayout) {
		return new Promise(function (resolve, reject) {
			vm.getAllReportLayouts().then(function (data) {
				var layouts = data

				var result = []
				var addedLayouts = {}

				dashboardLayout.data.components_types.forEach(function (component) {
					if (
						[
							'report_viewer',
							'report_viewer_matrix',
							'report_viewer_split_panel',
							'report_viewer_bars_chart',
						].indexOf(component.type) !== -1
					) {
						layouts.forEach(function (layout) {
							if (
								component.settings.layout_name === layout.name &&
								component.settings.content_type === layout.content_type
							) {
								delete layout.id
								delete layout.is_default
								delete layout.is_active

								if (!addedLayouts.hasOwnProperty(layout.content_type)) {
									addedLayouts[layout.content_type] = []
								}

								if (
									addedLayouts[layout.content_type].indexOf(layout.name) === -1
								) {
									addedLayouts[layout.content_type].push(layout.name)

									result.push(layout)
								}
							}
						})
					}
				})

				resolve(result)
			})
		})
	}

	vm.createConfigurationFile = function () {
		return new Promise(function (resolve, reject) {
			var configuration

			var date = new Date().toISOString().slice(0, 10) // yyyy-mm-dd

			var layout = JSON.parse(JSON.stringify(vm.layout))

			delete layout.origin_for_global_layout
			delete layout.sourced_from_global_layout

			if (options.type === 'dashboard_viewer') {
				vm.getReportLayoutsFromDashboardLayout(layout).then(function (data) {
					var reportLayouts = data

					configuration = {
						head: {
							date: date,
						},
						body: [
							{
								section_name: 'configuration',
								items: [
									{
										entity: 'ui.dashboardlayout',
										content: [layout],
										count: 1,
									},
									{
										entity: 'ui.reportlayout',
										content: reportLayouts,
										count: reportLayouts.length,
									},
								],
							},
						],
					}

					resolve(configuration)
				})
			} else {
				var contentType = 'ui.listlayout'

				if (options.type === 'report_viewer') {
					contentType = 'ui.reportlayout'
				}

				configuration = {
					head: {
						date: date,
					},
					body: [
						{
							section_name: 'configuration',
							items: [
								{
									entity: contentType,
									content: [layout],
									count: 1,
								},
							],
						},
					],
				}

				resolve(configuration)
			}
		})
	}

	vm.sendInvite = function (member) {
		return new Promise(function (resolve, reject) {
			inviteToSharedConfigurationFileService
				.create({
					shared_configuration_file: vm.globalConfigurationFile.id,
					notes: vm.inviteNotes,
					member_to: member.id,
				})
				.then(function (data) {
					resolve(data)
				})
		})
	}

	vm.getSentInvites = function () {
		inviteToSharedConfigurationFileService
			.getList({
				filters: {
					status: 1,
				},
			})
			.then(function (data) {
				vm.sentInvites = data.results

				console.log('vm.sentInvites', vm.sentInvites)

				vm.members = vm.members.filter(function (member) {
					var isSent = false

					vm.sentInvites.forEach(function (invite) {
						if (invite.member_to === member.id) {
							isSent = true
						}
					})

					return !isSent
				})

				console.log('Members left: ', vm.members)

				$scope.$apply()
			})
	}

	vm.createOrUpdateGlobalConfigurationFile = function (force) {
		return new Promise(function (resolve, reject) {
			if (vm.globalConfigurationFile.id) {
				shareConfigurationFileService
					.update(
						vm.globalConfigurationFile.id,
						vm.globalConfigurationFile,
						force
					)
					.then(function (data) {
						resolve(data)
					})
			} else {
				shareConfigurationFileService
					.create(vm.globalConfigurationFile)
					.then(function (data) {
						resolve(data)
					})
			}
		})
	}

	vm.updateLayout = function (id, item) {
		return new Promise(function (resolve, reject) {
			if (options.type === 'dashboard_viewer') {
				uiService.updateDashboardLayout(item.id, item).then(function (data) {
					resolve(data)
				})
			} else {
				uiService.updateListLayout(item.id, item).then(function (data) {
					resolve(data)
				})
			}
		})
	}

	vm.agree = function () {
		console.log('vm.globalConfigurationFile', vm.globalConfigurationFile)
		console.log('vm.layout', vm.layout)
		console.log('vm.assignedMembersList', vm.assignedMembersList)

		vm.createConfigurationFile().then(function (configuration) {
			vm.globalConfigurationFile.data = configuration

			vm.createOrUpdateGlobalConfigurationFile().then(function (
				globalConfigurationFile
			) {
				vm.layout.origin_for_global_layout = globalConfigurationFile.id
				vm.layout.sourced_from_global_layout = globalConfigurationFile.id

				vm.updateLayout(vm.layout.id, vm.layout).then(function (data) {
					vm.layout = data

					vm.globalConfigurationFile = globalConfigurationFile

					var promises = []

					vm.assignedMembersList.forEach(function (member) {
						promises.push(vm.sendInvite(member))
					})

					Promise.all(promises).then(function (data) {
						console.log('Sent Invites data', data)

						console.log('Saved Configuration File', vm.globalConfigurationFile)

						$mdDialog.hide({ status: 'agree', data: { layout: vm.layout } })
					})
				})
			})
		})
	}

	vm.agreeForce = function () {
		console.log('vm.globalConfigurationFile', vm.globalConfigurationFile)
		console.log('vm.layout', vm.layout)
		console.log('vm.assignedMembersList', vm.assignedMembersList)

		vm.createConfigurationFile().then(function (configuration) {
			vm.globalConfigurationFile.data = configuration

			var force = true

			vm.createOrUpdateGlobalConfigurationFile(force).then(function (
				globalConfigurationFile
			) {
				vm.layout.origin_for_global_layout = globalConfigurationFile.id
				vm.layout.sourced_from_global_layout = globalConfigurationFile.id

				vm.updateLayout(vm.layout.id, vm.layout).then(function (data) {
					vm.layout = data

					vm.globalConfigurationFile = globalConfigurationFile

					var promises = []

					vm.assignedMembersList.forEach(function (member) {
						promises.push(vm.sendInvite(member))
					})

					Promise.all(promises).then(function (data) {
						console.log('Sent Invites data', data)

						console.log('Saved Configuration File', vm.globalConfigurationFile)

						$mdDialog.hide({ status: 'agree', data: { layout: vm.layout } })
					})
				})
			})
		})
	}

	vm.init = function () {
		console.log('vm.layout', vm.layout)

		if (vm.layout) {
			if (vm.layout.origin_for_global_layout) {
				shareConfigurationFileService
					.getByKey(vm.layout.origin_for_global_layout)
					.then(function (data) {
						vm.globalConfigurationFile = data

						vm.readyStatus.configurationFile = true

						$scope.$apply()
					})
			} else {
				vm.globalConfigurationFile.name = vm.layout.name

				vm.readyStatus.configurationFile = true
			}
		}

		vm.getMemberList()
	}

	vm.init()
}
