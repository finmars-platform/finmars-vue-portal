import instrumentEventService from '@/angular/services/instrumentEventService'

export default function ($scope, $mdDialog, data) {
	console.log('id for event buttons', data)

	var vm = this

	vm.event = data.event

	vm.actionButtons = vm.event.event_schedule_object.actions

	vm.availableForApplyDefault = false

	vm.event.event_schedule_object.actions.forEach(function (item) {
		if (item.is_book_automatic) {
			vm.availableForApplyDefault = true
		}
	})

	console.log('vm.event', vm.event)

	vm.eventAction = function ($event, action) {
		instrumentEventService
			.getEventAction(vm.event.id, action.id)
			.then(function (event) {
				var status = 4 // Booked (user, actions)

				if (action.is_sent_to_pending) {
					status = 7 // 'Booked, pending (user, actions)';
				}

				instrumentEventService
					.putEventAction(vm.event.id, action.id, event, status)
					.then(function () {
						$mdDialog.hide({ status: 'agree' })
					})
					.catch(function (reason) {
						console.log('reason', reason)

						var description = "<p>Can't process event</p>"

						if (reason.hasOwnProperty('message')) {
							if (reason.message.hasOwnProperty('values')) {
								description = description + '<p>Errors: </p>'

								description = description + '<table>'

								Object.keys(reason.message.values).forEach(function (key) {
									var tr = '<tr>'

									tr = tr + '<td><b>' + key + '</b></td>'
									tr = tr + '<td>' + reason.message.values[key] + '</td>'

									tr = tr + '</tr>'

									description = description + tr
								})

								description = description + '</table>'
							}
						}

						$mdDialog
							.show({
								controller: 'InfoDialogController as vm',
								templateUrl: 'views/info-dialog-view.html',
								parent: angular.element(document.body),
								targetEvent: $event,
								clickOutsideToClose: false,
								locals: {
									info: {
										title: 'Error',
										description: description,
									},
								},
								preserveScope: true,
								autoWrap: true,
								skipHide: true,
								multiple: true,
							})
							.then(function (value) {
								instrumentEventService
									.errorEventAction(vm.event.id, action.id, event)
									.then(function () {
										$mdDialog.hide({ status: 'agree' })
									})
							})
					})
			})
	}

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

	vm.applyDefault = function ($event) {
		return $mdDialog
			.show({
				controller: 'EventWithReactApplyDefaultConfirmDialogController as vm',
				templateUrl:
					'views/dialogs/events/event-with-react-apply-default-confirm-dialog-view.html',
				parent: angular.element(document.body),
				targetEvent: $event,
				locals: {
					data: {
						event: vm.event,
					},
				},
				preserveScope: true,
				autoWrap: true,
				skipHide: true,
				multiple: true,
			})
			.then(function (res) {
				if (res.status === 'agree') {
					$mdDialog.hide({ status: 'agree' })
				}
			})
	}
}
