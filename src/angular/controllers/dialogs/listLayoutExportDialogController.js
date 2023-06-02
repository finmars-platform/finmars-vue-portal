/**
 * Created by szhitenev on 08.06.2016.
 */

import uiService from '../../services/uiService'

export default function ($scope, $mdDialog, data) {
	var vm = this

	vm.isReport = data.isReport
	vm.layout = JSON.parse(JSON.stringify(data.layout))

	delete vm.layout.id
	delete vm.layout.is_default
	delete vm.layout.is_active
	delete vm.layout.sourced_from_global_layout
	delete vm.layout.origin_for_global_layout

	vm.filename = vm.layout.name

	vm.readyStatus = { content: false }

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

	vm.getSplitPanelLayoutsFromLayout = function (rootLayout) {
		return new Promise(function (resolve, reject) {
			vm.getAllReportLayouts().then(function (data) {
				var layouts = data

				var result = []
				var addedLayouts = {}

				if (rootLayout.data.additions && rootLayout.data.additions.layoutData) {
					layouts.forEach(function (layout) {
						if (
							rootLayout.data.additions.layoutData.name === layout.name &&
							rootLayout.data.additions.layoutData.content_type ===
								layout.content_type
						) {
							delete layout.id
							delete layout.is_default
							delete layout.is_active
							delete layout.sourced_from_global_layout
							delete layout.origin_for_global_layout

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

				resolve(result)
			})
		})
	}

	vm.setDownloadLink = function () {
		var link = document.querySelector('.export-classifier-link')

		var date = new Date().toISOString().slice(0, 10) // yyyy-mm-dd

		vm.getSplitPanelLayoutsFromLayout(vm.layout).then(function (data) {
			var reportLayouts = data
			var listLayouts = []

			if (vm.isReport) {
				reportLayouts.push(vm.layout)
			} else {
				listLayouts.push(vm.layout)
			}

			console.log('reportLayouts', reportLayouts)

			var configuration = {
				head: {
					date: date,
				},
				body: [
					{
						section_name: 'configuration',
						items: [
							{
								entity: 'ui.reportlayout',
								content: reportLayouts,
								count: reportLayouts.length,
							},
						],
					},
				],
			}

			if (listLayouts.length) {
				configuration['body'][0]['items'].push({
					entity: 'ui.listlayout',
					content: listLayouts,
					count: listLayouts.length,
				})
			}

			var text = JSON.stringify(configuration)

			var file = new Blob([text], { type: 'text/plain' })

			link.href = URL.createObjectURL(file)

			link.addEventListener('click', function () {
				if (vm.filename) {
					link.download = vm.filename + '.fcfg'
				} else {
					link.download = 'layout.fcfg'
				}

				$mdDialog.hide()
			})
		})
	}

	vm.init = function () {
		setTimeout(function () {
			vm.setDownloadLink()
		}, 0)
	}

	vm.init()
}
