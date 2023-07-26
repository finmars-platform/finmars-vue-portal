/**
 * Created by szhitenev on 17.08.2016.
 */

import uiService from '../../services/uiService'
import toastNotificationService from '@/angular/core/services/toastNotificationService'

export default function ($scope, $mdDialog) {
	var vm = this

	var defaultTransactionTypeTextFields = [
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
		{
			key: 'user_text_4',
			name: 'User Text 4',
		},
		{
			key: 'user_text_5',
			name: 'User Text 5',
		},
		{
			key: 'user_text_6',
			name: 'User Text 6',
		},
		{
			key: 'user_text_7',
			name: 'User Text 7',
		},
		{
			key: 'user_text_8',
			name: 'User Text 8',
		},
		{
			key: 'user_text_9',
			name: 'User Text 9',
		},
		{
			key: 'user_text_10',
			name: 'User Text 10',
		},
		{
			key: 'user_text_11',
			name: 'User Text 11',
		},
		{
			key: 'user_text_12',
			name: 'User Text 12',
		},
		{
			key: 'user_text_13',
			name: 'User Text 13',
		},
		{
			key: 'user_text_14',
			name: 'User Text 14',
		},
		{
			key: 'user_text_15',
			name: 'User Text 15',
		},
		{
			key: 'user_text_16',
			name: 'User Text 16',
		},
		{
			key: 'user_text_17',
			name: 'User Text 17',
		},
		{
			key: 'user_text_18',
			name: 'User Text 18',
		},
		{
			key: 'user_text_19',
			name: 'User Text 19',
		},
		{
			key: 'user_text_20',
			name: 'User Text 20',
		},
		{
			key: 'user_text_21',
			name: 'User Text 21',
		},
		{
			key: 'user_text_22',
			name: 'User Text 22',
		},
		{
			key: 'user_text_23',
			name: 'User Text 23',
		},
		{
			key: 'user_text_24',
			name: 'User Text 24',
		},
		{
			key: 'user_text_25',
			name: 'User Text 25',
		},
		{
			key: 'user_text_26',
			name: 'User Text 26',
		},
		{
			key: 'user_text_27',
			name: 'User Text 27',
		},
		{
			key: 'user_text_28',
			name: 'User Text 28',
		},
		{
			key: 'user_text_29',
			name: 'User Text 29',
		},
		{
			key: 'user_text_30',
			name: 'User Text 30',
		},
	]

	var defaultTransactionTypeNumberFields = [
		{
			key: 'user_number_1',
			name: 'User Number 1',
		},
		{
			key: 'user_number_2',
			name: 'User Number 2',
		},
		{
			key: 'user_number_3',
			name: 'User Number 3',
		},
		{
			key: 'user_number_4',
			name: 'User Number 4',
		},
		{
			key: 'user_number_5',
			name: 'User Number 5',
		},
		{
			key: 'user_number_6',
			name: 'User Number 6',
		},
		{
			key: 'user_number_7',
			name: 'User Number 7',
		},
		{
			key: 'user_number_8',
			name: 'User Number 8',
		},
		{
			key: 'user_number_9',
			name: 'User Number 9',
		},
		{
			key: 'user_number_10',
			name: 'User Number 10',
		},
		{
			key: 'user_number_11',
			name: 'User Number 11',
		},
		{
			key: 'user_number_12',
			name: 'User Number 12',
		},
		{
			key: 'user_number_13',
			name: 'User Number 13',
		},
		{
			key: 'user_number_14',
			name: 'User Number 14',
		},
		{
			key: 'user_number_15',
			name: 'User Number 15',
		},
		{
			key: 'user_number_16',
			name: 'User Number 16',
		},
		{
			key: 'user_number_17',
			name: 'User Number 17',
		},
		{
			key: 'user_number_18',
			name: 'User Number 18',
		},
		{
			key: 'user_number_19',
			name: 'User Number 19',
		},
		{
			key: 'user_number_20',
			name: 'User Number 20',
		},
	]

	var defaultTransactionTypeDateFields = [
		{
			key: 'user_date_1',
			name: 'User Date 1',
		},
		{
			key: 'user_date_2',
			name: 'User Date 2',
		},
		{
			key: 'user_date_3',
			name: 'User Date 3',
		},
		{
			key: 'user_date_4',
			name: 'User Date 4',
		},
		{
			key: 'user_date_5',
			name: 'User Date 5',
		},
	]

	vm.transactionTypeTextFields = defaultTransactionTypeTextFields.concat()
	vm.transactionTypeNumberFields = defaultTransactionTypeNumberFields.concat()
	vm.transactionTypeDateFields = defaultTransactionTypeDateFields.concat()

	var defaultInstrumentTextFields = [
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

	vm.instrumentTextFields = defaultInstrumentTextFields.concat()

	vm.readyStatus = {
		content: false,
		transactionTypeProcessing: false,
		instrumentProcessing: false,
	}

	vm.getData = function () {
		var promises = []

		// var getTransactionTypeFields = function () {
		const getTTypeProm = new Promise((resolve, reject) => {
			uiService
				.getTransactionFieldList({ pageSize: 1000 })
				.then(function (data) {
					data.results.forEach(function (field) {
						vm.transactionTypeTextFields.forEach(function (textField) {
							if (textField.key === field.key) {
								textField.is_active = field.is_active
								textField.name = field.name
								textField.id = field.id
							}
						})

						vm.transactionTypeNumberFields.forEach(function (numberField) {
							if (numberField.key === field.key) {
								numberField.is_active = field.is_active
								numberField.name = field.name
								numberField.id = field.id
							}
						})

						vm.transactionTypeDateFields.forEach(function (dateField) {
							if (dateField.key === field.key) {
								dateField.is_active = field.is_active
								dateField.name = field.name
								dateField.id = field.id
							}
						})
					})


					resolve()
				})
				.catch((error) => reject(error))
		})
		// };

		promises.push(getTTypeProm)

		// var getInstrumentFields = function () {

		const getInstrumentProm = new Promise((resolve, reject) => {
			uiService
				.getInstrumentFieldList()
				.then(function (data) {
					data.results.forEach(function (field) {
						vm.instrumentTextFields.forEach(function (textField) {
							if (textField.key === field.key) {
								// textField.is_active = field.is_active;
								textField.name = field.name
								textField.id = field.id
							}
						})
					})

					resolve()
				})
				.catch((error) => reject(error))
		})

		// };

		promises.push(getInstrumentProm)

		return new Promise((resolve) => {
			Promise.allSettled(promises).then(function () {
				vm.readyStatus.content = true
				$scope.$apply()

				resolve()
			})
		})
	}

	const updateOrCreateField = (item, updateFn, saveFn) => {
		return new Promise(async (resolve, reject) => {
			let promise

			if (item.id) {
				// update field if it is already exist
				promise = updateFn(item.id, item)
			} else {
				// or create new one
				promise = saveFn(item)
			}

			try {
				await promise
				resolve(null)
			} catch (error) {
				reject(error)
			}
		})
	}

	vm.createOrUpdateTransactionTypeFields = (item) => {
		/* return new Promise(async (resolve, reject) => {

                if (item.id) {
                    uiService.updateTransactionField(item.id, item).then(function (data) {
                        resolve(data)
                    })
                } else {
                    uiService.createTransactionField(item).then(function (data) {
                        resolve(data)
                    })
                }

            }) */
		return updateOrCreateField(
			item,
			uiService.updateTransactionField,
			uiService.createTransactionField
		)
	}

	vm.createOrUpdateInstrumentFields = (item) => {
		/* if (item.id) {

                	instrumentPromise = uiService.updateInstrumentField(item.id, item).then(function (data) {
                        resolve(data)
                    })

                } else {
					instrumentPromise = uiService.createInstrumentField(item).then(function (data) {
                        resolve(data)
                    })
                } */
		return updateOrCreateField(
			item,
			uiService.updateInstrumentField,
			uiService.createInstrumentField
		)
	}

	const afterAllFieldsSavePromisesSettled = function (fieldsSavePromisesList) {
		return new Promise((resolve) => {
			// const fieldsSavePromisesList = await
			Promise.allSettled(fieldsSavePromisesList).then(async (promisesList) => {
				const rejectedPromiseIndex = promisesList.findIndex(
					(promise) => promise.status === 'rejected'
				)

				if (rejectedPromiseIndex === -1) {
					await vm.getData()
					toastNotificationService.success('Changes have been saved')
				} else {
					toastNotificationService.error(
						'Error occurred while trying to save fields'
					)
				}

				resolve()
			})
		})
	}

	vm.saveTransactionTypeFields = async function () {
		if (!vm.readyStatus.transactionTypeProcessing) {
			// if there is no unresolved ttype fields promises

			const promises = []

			vm.readyStatus.transactionTypeProcessing = true

			vm.transactionTypeTextFields.forEach(function (field) {
				promises.push(vm.createOrUpdateTransactionTypeFields(field))
			})

			vm.transactionTypeNumberFields.forEach(function (field) {
				promises.push(vm.createOrUpdateTransactionTypeFields(field))
			})

			vm.transactionTypeDateFields.forEach(function (field) {
				promises.push(vm.createOrUpdateTransactionTypeFields(field))
			})

			await afterAllFieldsSavePromisesSettled(promises)

			/* Promise.all(promises).then(function (data) {

					vm.getData();

					$mdDialog.show({
						controller: 'SuccessDialogController as vm',
						templateUrl: 'views/dialogs/success-dialog-view.html',
						locals: {
							success: {
								title: 'Success',
								description: 'Changes have been saved'
							}
						},
						autoWrap: true,
						skipHide: true
					});

				}).catch(function (error) {

					$mdDialog({
						controller: 'WarningDialogController as vm',
						templateUrl: 'views/dialogs/warning-dialog-view.html',
						clickOutsideToClose: false,
						locals: {
							warning: {
								title: 'Error',
								description: 'Error occurred while trying to save fields'
							}
						}
					});

				}); */

			vm.readyStatus.transactionTypeProcessing = false
			$scope.$apply()
		}
	}

	vm.saveInstrumentFields = async function () {
		if (!vm.readyStatus.instrumentProcessing) {
			// if there is no unresolved instrument fields promises

			vm.readyStatus.instrumentProcessing = true

			const promises = []

			vm.instrumentTextFields.forEach(function (field) {
				promises.push(vm.createOrUpdateInstrumentFields(field))
			})

			await afterAllFieldsSavePromisesSettled(promises)

			vm.readyStatus.instrumentProcessing = false

			$scope.$apply()
		}

		/* Promise.all(promises).then(function (data) {

                vm.getData();

                $mdDialog.show({
                    controller: 'SuccessDialogController as vm',
                    templateUrl: 'views/dialogs/success-dialog-view.html',
                    locals: {
                        success: {
                            title: 'Success',
                            description: 'Changes have been saved'
                        }
                    },
                    autoWrap: true,
                    skipHide: true
                });

				vm.readyStatus.instrumentProcessing = false;

            }).catch(function (error) {

                $mdDialog({
                    controller: 'WarningDialogController as vm',
                    templateUrl: 'views/dialogs/warning-dialog-view.html',
                    clickOutsideToClose: false,
                    locals: {
                        warning: {
                            title: 'Error',
                            description: 'Error occurred while trying to save fields'
                        }
                    }
                });

				vm.readyStatus.instrumentProcessing = false;

            }); */
	}

	vm.init = function () {
		vm.readyStatus.content = false

		vm.getData()
	}

	vm.init()
}
