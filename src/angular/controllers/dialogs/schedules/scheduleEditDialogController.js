/**
 * Created by szhitenev on 30.01.2020.
 */

import scheduleService from '@/angular/services/scheduleService'
import pricingProcedureService from '@/angular/services/procedures/pricingProcedureService'
import dataProcedureService from '@/angular/services/procedures/dataProcedureService'
import expressionProcedureService from '@/angular/services/procedures/expressionProcedureService'

import schedulesHelper from '@/angularlpers/schedules.helper'

export default function scheduleEditDialogController($scope, $mdDialog, data) {
	var vm = this
	vm.originalItem = null

	vm.entityType = 'schedule'

	vm.itemId = data.item.id

	vm.readyStatus = { schedule: false, pricingProcedures: false }

	vm.days = []
	vm.schedule = {
		procedures: [],
	}

	vm.cron = {
		periodicity: 1,
	}
	vm.cron.time = new Date()

	vm.pricingProcedures = []
	vm.dataProcedures = []
	vm.expressionProcedures = []

	vm.setDay = function (day) {
		if (!vm.cron.day) {
			vm.cron.day = []
		}

		if (vm.cron.day.indexOf(day) === -1) {
			vm.cron.day.push(day)
		} else {
			vm.cron.day = vm.cron.day.filter(function (day_number) {
				return day_number !== day
			})
		}
	}

	vm.resetCronExpr = function () {
		vm.cron.day = []
		vm.cron.month = []
	}

	vm.getRange = function (num) {
		var res = []
		var i
		for (i = 0; i < num; i = i + 1) {
			res.push(i)
		}
		return res
	}

	vm.getItem = function () {
		scheduleService.getByKey(vm.itemId).then(function (data) {


			vm.schedule = data
			vm.originalItem = data
			vm.readyStatus.schedule = true

			var values = vm.schedule.cron_expr.split(' ')



			if (values.length === 5) {
				vm.cron.time = new Date()
				vm.cron.time.setMinutes(values[0])
				vm.cron.time.setHours(values[1])

				if (values[3] === '*' && values[2] === '*') {
					vm.cron.periodicity = 2
					vm.cron.day = values[4].split(',')
					vm.cron.day.forEach(function (day) {
						vm.days[day - 1] = { status: true }
					})
				}
				if (values[4] === '*') {
					vm.cron.periodicity = 3
					vm.cron.day = values[2].split(',')
					if (values[3].length > 1) {
						vm.cron.month = values[3].split(',')
					} else {
						vm.cron.month = [values[3]]
					}
				}

				if (values[4] === '*' && values[3] === '*' && values[2] === '*') {
					vm.cron.periodicity = 1
				}
			}



			$scope.$apply()
		})
	}

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.updateCronExpression = function () {
		var minutes = moment(new Date(vm.cron.time)).format('mm')
		var hours = moment(new Date(vm.cron.time)).format('HH')






		vm.cron.periodicity = parseInt(vm.cron.periodicity, 10)

		if (vm.cron.periodicity === 1) {

			vm.schedule.cron_expr =
				parseInt(minutes) + ' ' + parseInt(hours) + ' * * *'
		}
		if (vm.cron.periodicity === 2) {
			//;
			vm.schedule.cron_expr =
				parseInt(minutes) +
				' ' +
				parseInt(hours) +
				' * * ' +
				vm.cron.day.join(',')
		}
		if (vm.cron.periodicity === 3) {
			//;
			vm.schedule.cron_expr =
				parseInt(minutes) +
				' ' +
				parseInt(hours) +
				' ' +
				vm.cron.day.join(',') +
				' ' +
				vm.cron.month.join(',') +
				' *'
		}
	}

	vm.agree = function ($event) {
		vm.schedule.is_enabled = true



		scheduleService
			.update(vm.schedule.id, vm.schedule)
			.then(function (data) {
				$mdDialog.hide({ status: 'agree', data: 'success' })
				$scope.$apply()
			})
			.catch(function (reason) {
				$mdDialog.show({
					controller: 'ValidationDialogController as vm',
					templateUrl: 'views/dialogs/validation-dialog-view.html',
					targetEvent: $event,
					locals: {
						validationData: reason,
					},
					preserveScope: true,
					autoWrap: true,
					skipHide: true,
				})
			})
	}

	vm.getPricingProcedures = function () {
		pricingProcedureService.getList().then(function (data) {
			vm.pricingProcedures = data.results

			vm.readyStatus.pricingProcedures = true

			$scope.$apply()
		})
	}

	vm.getDataProcedures = function () {
		dataProcedureService.getList().then(function (data) {
			vm.dataProcedures = data.results

			vm.readyStatus.dataProcedures = true

			$scope.$apply()
		})
	}

	vm.getExpressionProcedures = function () {
		expressionProcedureService.getList().then(function (data) {
			vm.expressionProcedures = data.results

			vm.readyStatus.expressionProcedures = true

			$scope.$apply()
		})
	}

	vm.getServerTime = function () {
		return new Date().toISOString().split('T')[1].split('.')[0]
	}

	vm.deleteProcedure = function ($event, item, $index) {
		vm.schedule.procedures.splice($index, 1)

		vm.orderProcedures()
	}

	vm.addProcedure = function ($event) {
		if (!vm.schedule.procedures) {
			vm.schedule.procedures = []
		}

		vm.schedule.procedures.push({})

		vm.orderProcedures()
	}

	vm.orderProcedures = function () {
		vm.schedule.procedures = vm.schedule.procedures.map(function (item, index) {
			item.order = index

			return item
		})
	}

	vm.dragIconGrabbed = false
	vm.dragAndDropInited = false

	const turnOffDragging = function () {
		vm.dragIconGrabbed = false
	}

	vm.turnOnDragging = function () {
		vm.dragIconGrabbed = true
		document.body.addEventListener('mouseup', turnOffDragging, { once: true })
	}

	vm.dragAndDrop = schedulesHelper.createDragAndDropObject($scope, vm)

	vm.editAsJson = function (ev) {
		$mdDialog
			.show({
				controller: 'EntityAsJsonEditorDialogController as vm',
				templateUrl: 'views/dialogs/entity-as-json-editor-dialog-view.html',
				targetEvent: ev,
				multiple: true,
				locals: {
					data: {
						item: vm.originalItem,
						entityType: vm.entityType,
					},
				},
			})
			.then(function (res) {
				if (res.status === 'agree') {
					vm.getItem()
				}
			})
	}

	vm.init = function () {
		vm.getItem()
		vm.getPricingProcedures()
		vm.getDataProcedures()
		vm.getExpressionProcedures()
	}

	vm.init()
}
