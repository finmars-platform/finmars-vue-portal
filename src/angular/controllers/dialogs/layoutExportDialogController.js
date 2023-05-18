/**
 * Created by szhitenev on 08.06.2016.
 */

export default function ($scope, $mdDialog, data) {
	var vm = this

	vm.isReport = data.isReport
	vm.layout = JSON.parse(JSON.stringify(data.layout))

	delete vm.layout.id
	delete vm.layout.is_default
	delete vm.layout.is_active

	vm.filename = vm.layout.name

	vm.readyStatus = { content: false }

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.setDownloadLink = function () {
		var link = document.querySelector('.export-classifier-link')

		var contentType = 'ui.listlayout'

		if (vm.isReport) {
			contentType = 'ui.reportlayout'
		}

		var date = new Date().toISOString().slice(0, 10) // yyyy-mm-dd

		var configuration = {
			head: {
				date: date,
			},
			body: [
				{
					section_name: 'configuration',
					items: [
						{
							entity: contentType,
							content: [vm.layout],
							count: 1,
						},
					],
				},
			],
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
	}

	vm.init = function () {
		setTimeout(function () {
			vm.setDownloadLink()
		}, 0)
	}

	vm.init()
}
