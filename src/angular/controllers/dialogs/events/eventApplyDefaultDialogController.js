import instrumentEventService from '@/angular/services/instrumentEventService'

export default function ($scope, $mdDialog, data) {
	console.log('id for event buttons', data)

	var vm = this

	vm.event = data.event

	vm.actionButtons = vm.event.event_schedule_object.actions

	vm.automatic_actions = []
	vm.automaitc_actions_as_pending = []

	vm.automatic_actions = vm.event.event_schedule_object.actions.filter(
		function (action) {
			return (
				action.is_book_automatic === true && action.is_sent_to_pending === false
			)
		}
	)

	vm.automaitc_actions_as_pending =
		vm.event.event_schedule_object.actions.filter(function (action) {
			return (
				action.is_book_automatic === true && action.is_sent_to_pending === true
			)
		})

	console.log('vm.event', vm.event)

	vm.recursiveHandleEvent = function (index, actions, resolve, $event) {
		var action = actions[index]

		instrumentEventService
			.getEventAction(vm.event.id, action.id)
			.then(function (event) {
				var status = 5 // 'Booked (user, default)';

				if (action.is_sent_to_pending) {
					status = 8 // 'Booked, pending (user, default)';
				}

				instrumentEventService
					.putEventAction(vm.event.id, action.id, event, status)
					.then(function () {
						index = index + 1

						if (index < actions.length) {
							vm.recursiveHandleEvent(index, actions, resolve, $event)
						} else {
							resolve(action)
						}
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
										console.log('Handle Error Event #', vm.event.id, event)

										index = index + 1

										if (index < actions.length) {
											vm.recursiveHandleEvent(index, actions, resolve, $event)
										} else {
											resolve(action)
										}
									})
							})
					})
			})
	}

	vm.applyDefault = function ($event) {
		var actions = vm.event.event_schedule_object.actions.filter(function (
			action
		) {
			return action.is_book_automatic === true
		})

		if (actions.length) {
			new Promise(function (resolve, reject) {
				var index = 0

				vm.recursiveHandleEvent(index, actions, resolve, $event)
			}).then(function (data) {
				console.log('vm.applyDefault.data', data)

				$mdDialog.hide({ status: 'agree' })
			})
		} else {
			vm.informed()
		}
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
}
