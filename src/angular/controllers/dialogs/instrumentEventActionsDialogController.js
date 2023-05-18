/**
 * Created by szhitenev on 30.05.2016.
 */

import logService from '@/angular/core/services/logService'

import transactionTypeService from '../../services/transactionTypeService'

export default function ($scope, $mdDialog, eventActions) {
	logService.controller('InstrumentEventActionDialogController', 'initialized')

	var vm = this

	vm.readyStatus = { transactionTypes: false }

	vm.eventActions = eventActions || []

	vm.toggleQuery = function () {
		vm.queryStatus = !vm.queryStatus
		vm.query = {}
	}

	vm.setSort = function (propertyName) {
		vm.direction = vm.sort === propertyName ? !vm.direction : false
		vm.sort = propertyName
	}

	vm.checkReadyStatus = function () {
		if (vm.readyStatus.transactionTypes == true) {
			return true
		}
		return false
	}

	vm.getTransactionTypes = function () {
		transactionTypeService.getListLight().then(function (data) {
			console.log('data', data)
			vm.transactionTypes = data.results
			vm.readyStatus.transactionTypes = true

			$scope.$apply()
		})
	}

	vm.newItem = {
		id: vm.eventActions.length,
		transaction_type: '',
		text: '',
		is_sent_to_pending: false,
		is_book_automatic: false,
		button_position: '',
	}

	vm.bindTransactionType = function (row) {
		var name
		vm.transactionTypes.forEach(function (item) {
			if (row.transaction_type == item.id) {
				row.transaction_type_name = item.name
				name = item.name
			}
		})
		return name
	}

	vm.editItem = function (item) {
		item.editStatus = true
	}

	vm.saveItem = function (item, $event) {
		var buttonPositionWithSamaValue = false
		for (var i = 0; i < vm.eventActions.length; i++) {
			if (
				vm.eventActions[i].id !== item.id &&
				vm.eventActions[i].button_position === item.button_position
			) {
				buttonPositionWithSamaValue = true
				break
			}
		}

		if (!buttonPositionWithSamaValue) {
			item.editStatus = false
		} else {
			$mdDialog.show({
				controller: 'WarningDialogController as vm',
				templateUrl: 'views/dialogs/warning-dialog-view.html',
				parent: angular.element(document.body),
				targetEvent: $event,
				clickOutsideToClose: false,
				multiple: true,
				locals: {
					warning: {
						title: 'Warning',
						description: 'Button position should contain unique value.',
					},
				},
			})
		}
	}

	vm.deleteItem = function (item, index) {
		vm.eventActions.splice(index, 1)
	}

	vm.addRow = function ($event) {
		var buttonPositionWithSamaValue = false
		for (var i = 0; i < vm.eventActions.length; i++) {
			if (vm.eventActions[i].button_position == vm.newItem.button_position) {
				buttonPositionWithSamaValue = true
				break
			}
		}

		if (!buttonPositionWithSamaValue || !vm.newItem.button_position) {
			vm.eventActions.push({
				id: vm.newItem.id,
				transaction_type: vm.newItem.transaction_type,
				text: vm.newItem.text,
				is_sent_to_pending: vm.newItem.is_sent_to_pending,
				is_book_automatic: vm.newItem.is_book_automatic,
				button_position: vm.newItem.button_position,
			})

			vm.newItem = {
				id: vm.eventActions.length,
				transaction_type: '',
				text: '',
				is_sent_to_pending: false,
				is_book_automatic: false,
				button_position: '',
			}
		} else {
			$mdDialog.show({
				controller: 'WarningDialogController as vm',
				templateUrl: 'views/dialogs/warning-dialog-view.html',
				parent: angular.element(document.body),
				targetEvent: $event,
				clickOutsideToClose: false,
				multiple: true,
				locals: {
					warning: {
						title: 'Warning',
						description: 'Button position should contain unique value.',
					},
				},
			})
		}
	}

	vm.getRangeOfNumbers = function (number) {
		var buttonPositions = [1]

		for (var i = 2; i <= number; i++) {
			buttonPositions.push(i)
		}

		return buttonPositions
	}

	vm.agree = function ($event) {
		var notSavedEventsExist = false
		for (var i = 0; i < vm.eventActions.length; i++) {
			if (vm.eventActions[i].editStatus) {
				notSavedEventsExist = true
				break
			}
		}
		//console.log('vm.attr', vm.attribute);
		if (!notSavedEventsExist) {
			eventActions = vm.eventActions
			$mdDialog.hide({ status: 'agree', eventActions: eventActions })
		} else {
			$mdDialog.show({
				controller: 'WarningDialogController as vm',
				templateUrl: 'views/dialogs/warning-dialog-view.html',
				parent: angular.element(document.body),
				targetEvent: $event,
				clickOutsideToClose: false,
				multiple: true,
				locals: {
					warning: {
						title: 'Warning',
						description:
							'Please finish editing actions (press "OK" button) before saving',
						actionsButtons: [
							{
								name: 'CLOSE',
								response: false,
							},
						],
					},
				},
			})
		}
	}

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.init = function () {
		if (vm.eventActions.length && !vm.eventActions[0].hasOwnProperty('id')) {
			vm.eventActions.forEach(function (event, index) {
				event.id = index
			})
		}

		vm.getTransactionTypes()
	}

	vm.init()
}
