/**
 * Created by szhitenev on 01.02.2023.
 */

export default function ($scope, globalDataService, systemMessageService) {
	var vm = this

	vm.alerts = []

	vm.processing = false

	vm.alphabets = [
		'#357EC7', // A
		'#C11B17', // B
		'#008080', // C
		'#728C00', // D
		'#0020C2', // E
		'#347C17', // F
		'#D4A017', // G
		'#7D0552', // H
		'#9F000F', // I
		'#E42217', // J
		'#F52887', // K
		'#571B7E', // L
		'#1F45FC', // M
		'#C35817', // N
		'#F87217', // O
		'#41A317', // P
		'#4C4646', // Q
		'#4CC417', // R
		'#C12869', // S
		'#15317E', // T
		'#AF7817', // U
		'#F75D59', // V
		'#FF0000', // W
		'#000000', // X
		'#E9AB17', // Y
		'#8D38C9', // Z
	]

	vm.getAvatar = function (char) {
		let charCode = char.charCodeAt(0)
		let charIndex = charCode - 65

		let colorIndex = charIndex % vm.alphabets.length

		return vm.alphabets[colorIndex]
	}

	vm.close = function ($event) {
		document.body.dispatchEvent(new Event('click'))
	}

	vm.getToday = function () {
		const date = new Date()

		let day = date.getDate()
		let month = date.getMonth() + 1
		let year = date.getFullYear()

		if (month < 10) {
			month = '0' + month
		}

		if (day < 10) {
			day = '0' + day
		}

		let currentDate = `${year}-${month}-${day}`

		return currentDate
	}

	vm.getAlerts = function () {
		vm.processing = true

		systemMessageService.getAlerts().then(function (data) {
			vm.alerts = data.results
			vm.processing = false
			$scope.$apply()
		})
	}

	vm.solve = function ($event, alert) {
		$event.stopPropagation()

		if (!alert.comment) {
			alert.comment = 'I am going to solve it'
		}

		systemMessageService
			.solve(alert.id, {
				comment: alert.comment,
			})
			.then(function (data) {
				vm.getAlerts()
			})
	}

	vm.comment = function ($event, alert) {
		$event.stopPropagation()

		systemMessageService
			.comment(alert.id, {
				comment: alert.comment,
			})
			.then(function (data) {
				vm.getAlerts()
			})
	}

	vm.init = function () {
		vm.getAlerts()
		vm.member = globalDataService.getMember()

		vm.today = vm.getToday()
	}

	vm.init()
}
