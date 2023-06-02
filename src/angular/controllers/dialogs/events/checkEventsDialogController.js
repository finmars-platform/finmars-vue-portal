/**
 * Created by szhitenev on 28.06.2016.
 */

import instrumentEventService from '@/angular/services/instrumentEventService'

export default function ($scope, $mdDialog) {
	var vm = this

	vm.effective_date_from = moment(new Date()).format('YYYY-MM-DD')
	vm.effective_date_to = moment(new Date()).format('YYYY-MM-DD')
	vm.loading = false
	vm.filters = {}

	vm.events = []

	vm.recursiveOpenDialogs = function (resolve, events, index, $event) {
		var doNotReactActionsIds = [6, 9, 14]
		var withReactActionsIds = [4, 7, 10, 11]
		var applyDefaultActionsIds = [5, 8, 12, 13]

		var event = events[index]

		if (event.selected && event.status === 1 && event.event_schedule_object) {
			var notification_class = event.event_schedule_object.notification_class

			if (withReactActionsIds.indexOf(notification_class) !== -1) {
				vm.openWithReactDialog($event, event).then(function (res) {
					if (res && res.status === 'skip_all') {
						resolve()
					} else {
						index = index + 1
						if (index < events.length) {
							vm.recursiveOpenDialogs(resolve, events, index, $event)
						} else {
							resolve()
						}
					}
				})
			}

			if (doNotReactActionsIds.indexOf(notification_class) !== -1) {
				vm.openDoNotReactDialog($event, event).then(function (res) {
					if (res && res.status === 'skip_all') {
						resolve()
					} else {
						index = index + 1
						if (index < events.length) {
							vm.recursiveOpenDialogs(resolve, events, index, $event)
						} else {
							resolve()
						}
					}
				})
			}

			if (applyDefaultActionsIds.indexOf(notification_class) !== -1) {
				vm.openApplyDefaultDialog($event, event).then(function (res) {
					if (res && res.status === 'skip_all') {
						resolve()
					} else {
						index = index + 1
						if (index < events.length) {
							vm.recursiveOpenDialogs(resolve, events, index, $event)
						} else {
							resolve()
						}
					}
				})
			}
		} else {
			index = index + 1
			if (index < events.length) {
				vm.recursiveOpenDialogs(resolve, events, index, $event)
			} else {
				resolve()
			}
		}
	}

	vm.agree = function ($event) {
		// DONT_REACT = 1
		// APPLY_DEF_ON_EDATE = 2
		// APPLY_DEF_ON_NDATE = 3
		//
		// INFORM_ON_NDATE_WITH_REACT = 4
		// INFORM_ON_NDATE_APPLY_DEF = 5
		// INFORM_ON_NDATE_DONT_REACT = 6
		// INFORM_ON_EDATE_WITH_REACT = 7
		// INFORM_ON_EDATE_APPLY_DEF = 8
		// INFORM_ON_EDATE_DONT_REACT = 9
		//
		// INFORM_ON_NDATE_AND_EDATE_WITH_REACT_ON_EDATE = 10
		// INFORM_ON_NDATE_AND_EDATE_WITH_REACT_ON_NDATE = 11
		// INFORM_ON_NDATE_AND_EDATE_APPLY_DEF_ON_EDATE = 12
		// INFORM_ON_NDATE_AND_EDATE_APPLY_DEF_ON_NDATE = 13
		// INFORM_ON_NDATE_AND_EDATE_DONT_REACT = 14

		var index = 0

		new Promise(function (resolve, reject) {
			vm.recursiveOpenDialogs(resolve, vm.events, index, $event)
		}).then(function () {
			$mdDialog.hide()

			$mdDialog.show({
				controller: 'SuccessDialogController as vm',
				templateUrl: 'views/dialogs/success-dialog-view.html',
				targetEvent: $event,
				preserveScope: true,
				multiple: true,
				autoWrap: true,
				skipHide: true,
				locals: {
					success: {
						title: '',
						description: 'Events were successfully processed',
					},
				},
			})
		})
	}

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.isAllChecked = function () {
		var result = true

		for (var i = 0; i < vm.events.length; i = i + 1) {
			if (!vm.events[i].selected) {
				result = false
				break
			}
		}

		return result
	}

	vm.toggleAll = function () {
		var state = !vm.isAllChecked()

		for (var i = 0; i < vm.events.length; i = i + 1) {
			vm.events[i].selected = state
		}
	}

	vm.sort
	vm.direction = true
	vm.sortBy = function (sortParameter) {
		vm.loading = true

		var sortOrder = 'DSC'
		if (vm.sort === sortParameter) {
			vm.direction = !vm.direction
			if (vm.direction) {
				sortOrder = 'DSC'
			} else {
				sortOrder = 'ASC'
			}
		} else {
			vm.sort = sortParameter
			vm.direction = true
		}

		var sortingOptions = {
			sort: {
				key: sortParameter,
				direction: sortOrder,
			},
		}

		vm.requestEvents(sortingOptions)
	}

	vm.requestEvents = function (sortingOptions) {
		vm.loading = true

		var options = {}
		if (sortingOptions && sortingOptions.hasOwnProperty('sort')) {
			options.sort = {}
			options.sort = sortingOptions.sort
		}

		// var filters = {};
		options.filters = {}
		options.filters.effective_date_0 = vm.effective_date_from
		options.filters.effective_date_1 = vm.effective_date_to

		// options.filters = filters;
		instrumentEventService.getList(options).then(function (data) {
			vm.events = data.results

			vm.loading = false

			$scope.$apply()
		})
	}

	vm.generateEvents = function ($event) {
		var promise = new Promise(function (resolve, reject) {
			if (vm.effective_date_from !== vm.effective_date_to) {
				$mdDialog
					.show({
						controller: 'WarningDialogController as vm',
						templateUrl: 'views/dialogs/warning-dialog-view.html',
						targetEvent: $event,
						locals: {
							warning: {
								title: 'Warning!',
								description: 'It can take a long time, confirm?',
							},
						},
						preserveScope: true,
						autoWrap: true,
						skipHid: true,
						multiple: true,
					})
					.then(function (res) {
						if (res.status === 'agree') {
							resolve()
						} else {
							reject()
						}
					})
			} else {
				resolve()
			}
		})

		promise
			.then(function (value) {
				vm.loading = true

				var options = {}

				options.effective_date_0 = vm.effective_date_from
				options.effective_date_1 = vm.effective_date_to

				instrumentEventService
					.generateEventsRange(options)
					.then(function (eventsData) {
						var len = eventsData.tasks_ids.length
						var time = 2000

						setTimeout(function () {
							vm.requestEvents()
						}, len * time)
					})
			})
			.catch(function (reason) {
				console.log(reason)
			})
	}

	vm.getStatus = function (status) {
		switch (status) {
			case 1:
				return 'New'
			case 2:
				return 'Informed'

			case 3:
				return 'Booked (system, default)'
			case 4:
				return 'Booked (user, actions)'
			case 5:
				return 'Booked (user, default)'

			case 6:
				return 'Booked, pending (system, default)'
			case 7:
				return 'Booked, pending (user, actions)'
			case 8:
				return 'Booked, pending (user, default)'
		}
	}

	vm.openDoNotReactDialog = function ($event, item) {
		return $mdDialog.show({
			controller: 'EventDoNotReactDialogController as vm',
			templateUrl: 'views/dialogs/events/event-do-not-react-dialog-view.html',
			parent: angular.element(document.body),
			targetEvent: $event,
			locals: {
				data: {
					event: item,
				},
			},
			preserveScope: true,
			autoWrap: true,
			skipHide: true,
			multiple: true,
		})
	}

	vm.openApplyDefaultDialog = function ($event, item) {
		return $mdDialog.show({
			controller: 'EventApplyDefaultDialogController as vm',
			templateUrl: 'views/dialogs/events/event-apply-default-dialog-view.html',
			parent: angular.element(document.body),
			targetEvent: $event,
			locals: {
				data: {
					event: item,
				},
			},
			preserveScope: true,
			autoWrap: true,
			skipHide: true,
			multiple: true,
		})
	}

	vm.openWithReactDialog = function ($event, item) {
		return $mdDialog.show({
			controller: 'EventWithReactDialogController as vm',
			templateUrl: 'views/dialogs/events/event-with-react-dialog-view.html',
			parent: angular.element(document.body),
			targetEvent: $event,
			locals: {
				data: {
					event: item,
				},
			},
			preserveScope: true,
			autoWrap: true,
			skipHide: true,
			multiple: true,
		})
	}
}
