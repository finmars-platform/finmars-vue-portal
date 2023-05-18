/**
 * Created by szhitenev on 18.10.2021.
 */

export default function ($scope, $mdDialog, globalDataService, data) {
	var vm = this

	vm.errors = window.system_errors.map(function (item) {
		if (item.data.hasOwnProperty('message')) {
			if (item.data.message && item.data.message.hasOwnProperty('url')) {
				// structured 500 error here
			} else {
				// other error with various structure
				item.textMessage = JSON.stringify(item.data.message, null, 2)
			}
		}

		return item
	})

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.setDownloadLink = function () {
		var link = document.querySelector('.download-system-error-log')

		var currentMasterUser = globalDataService.getMasterUser()
		var user = globalDataService.getUser()

		var data = {
			master_user: currentMasterUser.name,
			username: user.username,
			date: new Date().toISOString(),
			errors: window.system_errors,
		}

		var text = JSON.stringify(data)

		var file = new Blob([text], { type: 'text/plain' })

		link.href = URL.createObjectURL(file)

		link.addEventListener('click', function () {
			link.download = 'System Error Log ' + new Date().toISOString() + '.json'
			$mdDialog.hide()
		})
	}

	vm.init = function () {
		setTimeout(function () {
			vm.setDownloadLink()
		}, 200)
	}

	vm.init()
}
