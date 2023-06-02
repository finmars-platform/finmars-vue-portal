/**
 * Created by szhitenev on 17.08.2016.
 */

import uiService from '@/angular/services/uiService'

export default function ($scope, $mdDialog) {
	var vm = this

	var defaultTextFields = [
		{
			key: 'user_text_1',
			name: 'User Text 1',
		},
		{
			key: 'user_text_2',
			name: 'User Text 2',
		},
		{
			key: 'user_text_3',
			name: 'User Text 3',
		},
	]

	vm.textFields = defaultTextFields.concat()

	vm.readyStatus = { content: false, processing: false }

	vm.getData = function () {
		uiService.getInstrumentFieldList().then(function (data) {
			data.results.forEach(function (field) {
				vm.textFields.forEach(function (textField) {
					if (textField.key === field.key) {
						textField.name = field.name
						textField.id = field.id
					}
				})
			})

			vm.readyStatus.content = true
			$scope.$apply()
		})
	}

	vm.createOrUpdate = function (item) {
		return new Promise(function (resolve, reject) {
			if (item.id) {
				uiService.updateInstrumentField(item.id, item).then(function (data) {
					resolve(data)
				})
			} else {
				uiService.createInstrumentField(item).then(function (data) {
					resolve(data)
				})
			}
		})
	}

	vm.save = function () {
		vm.readyStatus.processing = true

		var promises = []

		vm.textFields.forEach(function (field) {
			promises.push(vm.createOrUpdate(field))
		})

		Promise.all(promises)
			.then(function (data) {
				vm.readyStatus.processing = false

				vm.getData()

				$mdDialog.show({
					controller: 'SuccessDialogController as vm',
					templateUrl: 'views/dialogs/success-dialog-view.html',
					locals: {
						success: {
							title: 'Success',
							description: 'Changes have been saved',
						},
					},
					autoWrap: true,
					skipHide: true,
				})
			})
			.catch(function (error) {
				$mdDialog({
					controller: 'WarningDialogController as vm',
					templateUrl: 'views/dialogs/warning-dialog-view.html',
					clickOutsideToClose: false,
					locals: {
						warning: {
							title: 'Error',
							description: 'Error occurred while trying to save fields',
						},
					},
				})
			})
	}

	vm.init = function () {
		vm.readyStatus.content = false

		vm.getData()
	}

	vm.init()
}
