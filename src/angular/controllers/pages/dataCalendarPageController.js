/**
 * Created by szhitenev on 19.10.2022.
 */

import baseUrlService from '../../services/baseUrlService'
import calendarEventsService from '../../services/calendarEventsService'
import processesService from '../../services/processesService'
import workflowService from '../../services/workflowService'
import pricingProcedureInstanceService from '../../services/procedures/pricingProcedureInstanceService'
import dataProcedureInstanceService from '../../services/procedures/dataProcedureInstanceService'
import expressionProcedureInstanceService from '../../services/procedures/expressionProcedureInstanceService'
import downloadFileHelper from '../../helpers/downloadFileHelper'
import toastNotificationService from '@/angular/core/services/toastNotificationService'
var baseUrl = baseUrlService.resolve()

export default function dataCalendarController(
	$scope,
	authorizerService,
	globalDataService,
	$mdDialog,
	systemMessageService
) {
	var vm = this

	vm.calendarEvent = null
	vm.calendarEventPayload = null
	vm.calendarEventPayloadLoading = false

	vm.readyStatus = { content: true }

	vm.bigPicture = false

	// vm.filter = ['system_message', 'system_schedule', 'schedule']
	vm.filter = [
		'data_procedure',
		'expression_procedure',
		'pricing_procedure',
		'celery_task',
		'workflow',
	]

	vm.toggleFilter = function (name) {
		var index = vm.filter.indexOf(name)

		if (index === -1) {
			vm.filter.push(name)
		} else {
			vm.filter.splice(index, 1)
		}

		vm.renderCalendar()
	}

	vm.refresh = function () {
		vm.renderCalendar()
	}

	vm.deleteCeleryTask = function ($event) {
		$mdDialog
			.show({
				controller: 'WarningDialogController as vm',
				templateUrl: 'views/dialogs/warning-dialog-view.html',
				parent: angular.element(document.body),
				targetEvent: $event,
				preserveScope: true,
				autoWrap: true,
				multiple: true,
				skipHide: true,
				locals: {
					warning: {
						title: 'Warning',
						description:
							'Are you sure you want to delete task  ' +
							vm.calendarEvent.extendedProps.id +
							'?',
					},
				},
			})
			.then(function (res) {
				if (res.status === 'agree') {
					processesService
						.deleteByKey(vm.calendarEvent.extendedProps.id)
						.then(function () {
							toastNotificationService.success(
								'Task ' +
									vm.calendarEvent.extendedProps.id +
									' deleted successfuly'
							)

							vm.calendarEvent = null
							vm.calendarEventPayload = null
							$scope.$apply()

							vm.renderCalendar()
						})
				}
			})
	}

	vm.loadCalendarEvent = function () {
		if (vm.calendarEvent.extendedProps.type === 'celery_task') {
			vm.calendarEventPayloadLoading = true

			vm.calendarEventPayload = null

			processesService
				.getByKey(vm.calendarEvent.extendedProps.id)
				.then(function (data) {
					vm.calendarEventPayloadLoading = false

					vm.calendarEventPayload = data

					try {
						vm.calendarEventPayload.options_object = JSON.stringify(
							vm.calendarEventPayload.options_object,
							null,
							4
						)
						vm.calendarEventPayload.result_object = JSON.stringify(
							vm.calendarEventPayload.result_object,
							null,
							4
						)
						vm.calendarEventPayload.progress_object = JSON.stringify(
							vm.calendarEventPayload.progress_object,
							null,
							4
						)
					} catch (error) {}

					$scope.$apply()
				})
		}

		if (vm.calendarEvent.extendedProps.type === 'pricing_procedure') {
			vm.calendarEventPayloadLoading = true

			vm.calendarEventPayload = null

			pricingProcedureInstanceService
				.getByKey(vm.calendarEvent.extendedProps.id)
				.then(function (data) {
					vm.calendarEventPayloadLoading = false

					vm.calendarEventPayload = data

					try {
						vm.calendarEventPayload.request_data = JSON.stringify(
							vm.calendarEventPayload.request_data,
							null,
							4
						)
					} catch (e) {}

					try {
						vm.calendarEventPayload.response_data = JSON.stringify(
							vm.calendarEventPayload.response_data,
							null,
							4
						)
					} catch (e) {}

					$scope.$apply()
				})
		}

		if (vm.calendarEvent.extendedProps.type === 'data_procedure') {
			vm.calendarEventPayloadLoading = true

			vm.calendarEventPayload = null

			dataProcedureInstanceService
				.getByKey(vm.calendarEvent.extendedProps.id)
				.then(function (data) {
					vm.calendarEventPayloadLoading = false

					vm.calendarEventPayload = data

					try {
						vm.calendarEventPayload.request_data = JSON.stringify(
							vm.calendarEventPayload.request_data,
							null,
							4
						)
					} catch (e) {}

					$scope.$apply()
				})
		}

		if (vm.calendarEvent.extendedProps.type === 'expression_procedure') {
			vm.calendarEventPayloadLoading = true

			vm.calendarEventPayload = null

			expressionProcedureInstanceService
				.getByKey(vm.calendarEvent.extendedProps.id)
				.then(function (data) {
					vm.calendarEventPayloadLoading = false

					vm.calendarEventPayload = data

					$scope.$apply()
				})
		}

		if (vm.calendarEvent.extendedProps.type === 'workflow') {
			vm.calendarEventPayloadLoading = true

			vm.calendarEventPayload = null

			workflowService
				.getByKey(vm.calendarEvent.extendedProps.id)
				.then(function (data) {
					vm.calendarEventPayloadLoading = false

					vm.calendarEventPayload = data

					try {
						vm.calendarEventPayload.payload = JSON.stringify(
							vm.calendarEventPayload.payload,
							null,
							4
						)
					} catch (error) {}

					if (vm.calendarEventPayload.tasks) {
						vm.calendarEventPayload.tasks = vm.calendarEventPayload.tasks.map(
							function (task) {
								try {
									task.result = JSON.stringify(task.result, null, 4)
								} catch (error) {}

								return task
							}
						)
					}

					$scope.$apply()
				})
		}
	}

	vm.renderCalendar = function () {
		var calendarEl = document.getElementById('calendar')
		calendarEl.innerHTML = ''

		var calendar = new FullCalendar.Calendar(calendarEl, {
			timeZone: 'UTC',
			initialView: 'listDay',
			headerToolbar: {
				center: 'listDay,listMonth,dayGridMonth',
				end: 'prev,next',
			},
			buttonText: {
				listDay: 'Today (list)',
				listMonth: 'Month (list)',
				dayGridMonth: 'Month (grid)',
			},
			eventDisplay: {
				timeFormat: 'hh:mm',
			},
			eventTimeFormat: {
				hour: '2-digit',
				minute: '2-digit',
				meridiem: false,
				hour12: false,
			},
			eventMouseEnter: function (info) {
				// var tooltip = new Tooltip(info.el, {
				//     title: info.event.extendedProps.description,
				//     placement: 'top',
				//     trigger: 'hover',
				//     container: 'body'
				// });
				// console.log('here?', info)
				info.el.setAttribute('title', info.event.title)
			},
			eventClick: function (info) {
				vm.calendarEvent = info.event

				$('.fc-event').removeClass('active')

				console.log('vm.calendarEvent', vm.calendarEvent)

				info.el.classList.add('active')

				vm.loadCalendarEvent()

				setTimeout(function () {
					$scope.$apply()
				}, 0)
			},
			events: function (info, callback) {
				console.log('start, end', info)

				var date_from = info.startStr.split('T')[0]
				var date_to = info.endStr.split('T')[0]
				var filter_query = vm.filter.join(',')

				if (!filter_query) {
					filter_query = 'empty'
				}

				calendarEventsService
					.getList(date_from, date_to, filter_query)
					.then(function (data) {
						console.log('get data', data)

						var items = data.results.map(function (item) {
							item.allDay = false

							return item
						})

						callback(items)
					})
			},
		})
		calendar.render()
	}

	vm.downloadFile = function ($event, item) {
		// TODO WTF why systemMessage Service, replace with FilePreview Service later
		systemMessageService.viewFile(item.file_report).then(function (data) {
			console.log('data', data)

			$mdDialog.show({
				controller: 'FilePreviewDialogController as vm',
				templateUrl: 'views/dialogs/file-preview-dialog-view.html',
				parent: angular.element(document.body),
				targetEvent: $event,
				clickOutsideToClose: false,
				preserveScope: true,
				autoWrap: true,
				skipHide: true,
				multiple: true,
				locals: {
					data: {
						content: data,
						info: item,
					},
				},
			})
		})
	}

	vm.generateWorkflowUrl = function () {
		return (
			'/' +
			window.base_api_url +
			'/workflow/#/item/' +
			vm.calendarEvent.extendedProps.id
		)
	}

	vm.init = function () {
		setTimeout(function () {
			vm.renderCalendar()
		}, 0)
	}

	vm.init()
}
