import instrumentEventService from '@/angular/services/instrumentEventService'

export default function ($scope, $mdDialog, data) {
	var vm = this

	vm.event = data.event



	vm.skip = function () {
		$mdDialog.hide()
	}

	vm.skipAll = function () {
		$mdDialog.hide({ status: 'skip_all' })
	}

	vm.informed = function () {
		instrumentEventService.informedEventAction(vm.event.id).then(function () {
			$mdDialog.hide({ status: 'agree' })
		})
	}
}
