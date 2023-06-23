/**
 * Created by szhitenev on 25.09.2022.
 */

import cookieService from '@/angular/core/services/cookieService'
import baseUrlService from '../../services/baseUrlService'

var baseUrl = baseUrlService.resolve()
var apiVersion = baseUrlService.getApiVersion()

export default function ($scope, $mdDialog, globalDataService, data) {
	var vm = this

	vm.position = 0
	vm.textData = ''

	vm.requesting = false
	vm.autoPoll = true
	vm.autoScroll = true

	vm.updateInterval = 2000

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.poll = function () {
		vm.requesting = false

		if (vm.interval) {
			clearInterval(vm.interval)
		}

		document.querySelector('.log-content').innerHTML = ''

		vm.interval = setInterval(function () {
			vm.makeRequest()
		}, vm.updateInterval)

		// Make a request now to avoid waiting
		vm.makeRequest()
	}

	vm.stop = function () {
		clearInterval(vm.interval)
		vm.interval = null
	}

	vm.makeRequest = function () {
		if (!vm.requesting && vm.autoPoll) {
			vm.requesting = true

			var currentMasterUser = globalDataService.getMasterUser()

			var prefix = currentMasterUser.base_api_url

			var url =
				baseUrl +
				'/' +
				prefix +
				'/' +
				apiVersion +
				'/debug/logs/?seek_to=' +
				vm.position

			fetch(url, {
				method: 'GET',
				credentials: 'include',
				headers: {
					'X-CSRFToken': cookieService.getCookie('csrftoken'),
					Authorization: 'Token ' + cookieService.getCookie('access_token'),
					Accept: 'application/json',
					'Content-type': 'application/json',
				},
			})
				.then(function (data) {
					return data.json()
				})
				.then(function (data) {
					vm.handleResponse(data)
				})
		}
	}

	function escapeHtml(unsafe) {
		return unsafe
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#039;')
	}

	vm.handleResponse = function (data) {
		if (vm.requesting) {
			vm.position = data['ends']

			vm.textData = vm.textData + data['data']

			vm.render()

			if (vm.autoScroll) {
				vm.scrollBottom()
			}
		}

		vm.requesting = false
	}

	vm.scrollBottom = function () {
		const element = document.querySelector('.log-content')
		element.scroll({ top: element.scrollHeight, behavior: 'smooth' })
	}

	vm.render = function () {
		var lines = vm.textData.split(/\[0m?/)

		if (vm.search) {
			lines = lines.filter(function (line) {
				return line.indexOf(vm.search) !== -1
			})
		}

		lines = lines.map(function (item) {
			var log_class = 'log-item-info'

			if (item.indexOf('[DEBUG]') !== -1) {
				log_class = 'log-item-debug'
			}

			if (item.indexOf('[ERROR]') !== -1) {
				log_class = 'log-item-error'
			}

			var result = '<span class="' + log_class + '">'

			result = result + escapeHtml(item)

			return result + '</span>'
		})

		document.querySelector('.log-content').innerHTML = lines.join('\n')
	}

	vm.toggleWork = function () {
		if (vm.interval) {
			vm.stop()
		} else {
			vm.poll()
		}
	}

	vm.init = function () {
		vm.position = 0

		$('body').addClass('drag-dialog') // hide backdrop

		setTimeout(function () {
			vm.poll()
		}, 300)

		setTimeout(function () {
			vm.dialogElemToResize = document.querySelector('.logDialog')
			$scope.$apply()
		}, 1000)
	}

	vm.init()
}
