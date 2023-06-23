/**
 * Created by szhitenev on 04.05.2016.
 */

import instrumentEventService from './instrumentEventService'

var openDoNotReactDialog = function ($mdDialog, $event, item) {
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

var openApplyDefaultDialog = function ($mdDialog, $event, item) {
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

var openWithReactDialog = function ($mdDialog, $event, item) {
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

var recursiveOpenDialogs = function (
	$mdDialog,
	resolve,
	events,
	index,
	$event
) {
	var doNotReactActionsIds = [6, 9, 14]
	var withReactActionsIds = [4, 7, 10, 11]
	var applyDefaultActionsIds = [5, 8, 12, 13]

	var event = events[index]

	if (event && event.status === 1 && event.event_schedule_object) {
		var notification_class = event.event_schedule_object.notification_class

		if (withReactActionsIds.indexOf(notification_class) !== -1) {
			openWithReactDialog($mdDialog, $event, event).then(function (res) {
				if (res && res.status === 'skip_all') {
					resolve()
				} else {
					index = index + 1
					if (index < events.length) {
						recursiveOpenDialogs($mdDialog, resolve, events, index, $event)
					} else {
						resolve()
					}
				}
			})
		}

		if (doNotReactActionsIds.indexOf(notification_class) !== -1) {
			openDoNotReactDialog($mdDialog, $event, event).then(function (res) {
				if (res && res.status === 'skip_all') {
					resolve()
				} else {
					index = index + 1
					if (index < events.length) {
						recursiveOpenDialogs($mdDialog, resolve, events, index, $event)
					} else {
						resolve()
					}
				}
			})
		}

		if (applyDefaultActionsIds.indexOf(notification_class) !== -1) {
			openApplyDefaultDialog($mdDialog, $event, event).then(function (res) {
				if (res && res.status === 'skip_all') {
					resolve()
				} else {
					index = index + 1
					if (index < events.length) {
						recursiveOpenDialogs($mdDialog, resolve, events, index, $event)
					} else {
						resolve()
					}
				}
			})
		}
	} else {
		index = index + 1
		if (index < events.length) {
			recursiveOpenDialogs($mdDialog, resolve, events, index, $event)
		} else {
			resolve()
		}
	}
}

var showEvents = function ($mdDialog, events) {
	return new Promise(function (resolveMain) {
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

		var notificationDateIds = [4, 5, 6, 10, 11, 12, 13, 14]
		var effectiveDateIds = [7, 8, 9, 10, 11, 12, 13, 14]

		var newEvents = events.filter(function (event) {
			return event.status === 1
		})

		var notificationDateEvents = newEvents.filter(function (event) {
			if (event.event_schedule_object) {
				return (
					notificationDateIds.indexOf(
						event.event_schedule_object.notification_class
					) !== -1
				)
			}
			return false
		})

		var effectiveDateEvents = newEvents.filter(function (event) {
			if (event.event_schedule_object) {
				return (
					effectiveDateIds.indexOf(
						event.event_schedule_object.notification_class
					) !== -1
				)
			}
			return false
		})

		var $event = new Event('click')

		var index = 0

		var resultEvents = effectiveDateEvents.slice()

		notificationDateEvents.forEach(function (notificationEvent) {
			var exists = false

			effectiveDateEvents.forEach(function (effectiveDateEvent) {
				if (notificationEvent.id === effectiveDateEvent.id) {
					exists = true
				}
			})

			if (exists === false) {
				resultEvents.push(notificationEvent)
			}
		})

		console.log('resultEvents', resultEvents)

		if (resultEvents.length) {
			index = 0
			recursiveOpenDialogs($mdDialog, resolveMain, resultEvents, index, $event)
		} else {
			resolveMain()
		}
	})
}

var getAndShowEvents = function ($mdDialog) {
	return new Promise(function (resolve, reject) {
		var effective_date_from = moment(new Date()).format('YYYY-MM-DD')
		var effective_date_to = moment(new Date()).format('YYYY-MM-DD')

		var options = {}

		options.filters = {}
		options.filters.effective_date_0 = effective_date_from
		options.filters.effective_date_1 = effective_date_to

		instrumentEventService.getList(options).then(function (effectiveData) {
			var effective_date_events = effectiveData.results

			var notification_date_from = moment(new Date()).format('YYYY-MM-DD')
			var notification_date_to = moment(new Date()).format('YYYY-MM-DD')

			console.log('showing events here')

			var options = {}

			options.filters = {}
			options.filters.notification_date_0 = notification_date_from
			options.filters.notification_date_1 = notification_date_to

			instrumentEventService.getList(options).then(function (notificationData) {
				var notification_date_events = notificationData.results

				var result_events = effective_date_events.concat(
					notification_date_events
				)

				if (result_events.length) {
					resolve(showEvents($mdDialog, result_events))
				} else {
					resolve([])
				}
			})
		})
	})
}

export default {
	getAndShowEvents: getAndShowEvents,
	showEvents: showEvents,
	openDoNotReactDialog: openDoNotReactDialog,
	openApplyDefaultDialog: openApplyDefaultDialog,
	openWithReactDialog: openWithReactDialog,
}
