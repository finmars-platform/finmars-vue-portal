/**
 * Created by szhitenev on 14.03.2018.
 */

import complexImportSchemeService from '@/angular/services/import/complexImportSchemeService'

import complexImportService from '@/angular/services/complex-import/complexImportService'
import complexImportValidateService from '@/angular/services/complex-import/complexImportValidateService'

// import usersService from '@/angular/services/usersService';

export default function complexImportDialogController(
	$scope,
	$mdDialog,
	data,
	usersService
) {
	var vm = this

	vm.config = {
		delimiter: ',',
	}

	vm.readyStatus = {
		scheme: false,
		processing: false,
	}

	vm.state = null // validate or import
	vm.counter = 0
	vm.activeItemTotal = 0
	vm.skippedItemTotal = 0

	vm.processing = false
	vm.loaderData = {}
	vm.schemeIsValid = true

	vm.hasSchemeEditPermission = false

	vm.loadIsAvailable = function () {
		if (
			vm.config.scheme != null &&
			vm.config.file !== null &&
			vm.config.file !== undefined &&
			vm.schemeIsValid
		) {
			return true
		}
		return false
	}

	vm.getSchemeList = function () {
		complexImportSchemeService.getList().then(function (data) {
			vm.schemes = data.results
			vm.readyStatus.scheme = true

			if (vm.config.scheme) {
				vm.validateScheme()
			}

			$scope.$apply()
		})
	}

	vm.updateEntitySchemes = function () {
		vm.getSchemeList()
	}

	vm.createScheme = function ($event) {
		$mdDialog
			.show({
				controller: 'ComplexImportSchemeCreateDialogController as vm',
				templateUrl:
					'views/dialogs/complex-import/complex-import-scheme-create-dialog-view.html',
				targetEvent: $event,
				preserveScope: true,
				multiple: true,
				autoWrap: true,
				skipHide: true,
				locals: {
					data: {},
				},
			})
			.then(function () {
				vm.getSchemeList()
			})
	}

	vm.editScheme = function ($event) {
		$mdDialog
			.show({
				controller: 'ComplexImportSchemeEditDialogController as vm',
				templateUrl:
					'views/dialogs/complex-import/complex-import-scheme-edit-dialog-view.html',
				targetEvent: $event,
				preserveScope: true,
				multiple: true,
				autoWrap: true,
				skipHide: true,
				locals: {
					schemeId: vm.config.scheme,
				},
			})
			.then(function (res) {
				if (res && res.status === 'agree') {
					vm.getSchemeList()
				}
			})
	}

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.counterData = {}

	function updateCounter(index, config) {
		vm.counterData[index] = config

		vm.counter = Object.keys(vm.counterData).length

		vm.loaderData.current = vm.counter
		vm.loaderData.total = vm.activeItemTotal
		vm.loaderData.skippedTotal = vm.skippedItemTotal
		vm.loaderData.status = vm.status

		vm.loaderData.additional = [
			vm.getTransactionImportProgress(),
			vm.getSimpleImportProgress(),
		]

		$scope.$apply()
	}

	vm.getSimpleImportProgress = function () {
		var result = {}

		var keys = Object.keys(vm.counterData)

		var currentAction
		var currentActionIndex

		var schemeObject

		vm.schemes.forEach(function (scheme) {
			if (scheme.id === vm.config.scheme) {
				schemeObject = scheme
			}
		})

		keys.forEach(function (key) {
			if (
				vm.counterData[key].hasOwnProperty('error_handler') &&
				vm.counterData[key].hasOwnProperty('task_status')
			) {
				if (vm.counterData[key].task_status !== 'SUCCESS') {
					currentAction = vm.counterData[key]
					currentActionIndex = key
				}
			}
		})

		if (currentAction && currentActionIndex && schemeObject) {
			// console.log('currentActionIndex', currentActionIndex);

			result.text =
				'Processing ' +
				schemeObject.actions[currentActionIndex].action_notes +
				':'
			result.current = currentAction.processed_rows
			result.total = currentAction.total_rows
		}

		// console.log('getTransactionImportProgress.result', result);

		return result
	}

	vm.getTransactionImportProgress = function () {
		var result = {}

		var keys = Object.keys(vm.counterData)

		var currentAction
		var currentActionIndex

		var schemeObject

		vm.schemes.forEach(function (scheme) {
			if (scheme.id === vm.config.scheme) {
				schemeObject = scheme
			}
		})

		keys.forEach(function (key) {
			if (
				vm.counterData[key].hasOwnProperty('error_handling') &&
				vm.counterData[key].hasOwnProperty('task_status')
			) {
				if (vm.counterData[key].task_status !== 'SUCCESS') {
					currentAction = vm.counterData[key]
					currentActionIndex = key
				}
			}
		})

		if (currentAction && currentActionIndex && schemeObject) {
			// console.log('currentActionIndex', currentActionIndex);

			result.text =
				'Processing ' +
				schemeObject.actions[currentActionIndex].action_notes +
				':'
			result.current = currentAction.processed_rows
			result.total = currentAction.total_rows
		}

		// console.log('getTransactionImportProgress.result', result);

		return result
	}

	vm.validate = function ($event) {
		vm.counterData = {}

		vm.processing = true

		var formData = new FormData()

		formData.append('file', vm.config.file)
		formData.append('scheme', vm.config.scheme)

		// console.log('vm.config', vm.config);

		var schemeObject

		vm.schemes.forEach(function (scheme) {
			if (scheme.id === vm.config.scheme) {
				schemeObject = scheme
			}
		})

		vm.status = 'PROGRESS'
		vm.state = 'validate'
		vm.counter = 0

		vm.activeItemTotal = schemeObject.actions.length

		vm.skippedItemTotal = schemeObject.actions.filter(function (item) {
			return item.skip
		}).length

		var schemeErrorsInActions = []

		schemeObject.actions.forEach(function (action) {
			var actionFields = {}
			var actionKeys = []
			var actionFieldsErrors = {
				action_notes: action.action_notes,
				action_number: action.order + 1,
				empty_fields: '',
			}

			if (action.csv_import_scheme) {
				actionFields = action.csv_import_scheme
			} else if (action.complex_transaction_import_scheme) {
				actionFields = action.complex_transaction_import_scheme
			}

			actionKeys = Object.keys(actionFields)

			actionKeys.forEach(function (actionField, index) {
				if (
					actionField !== 'csv_import_scheme' &&
					actionField !== 'complex_transaction_import_scheme'
				) {
					if (actionFields[actionField] === null) {
						actionFieldsErrors.empty_fields += actionField

						if (index !== actionKeys.length - 1) {
							// add comma and space if it is not the last empty field

							actionFieldsErrors.empty_fields += ', '
						}
					}
				}
			})

			if (actionFieldsErrors.empty_fields) {
				schemeErrorsInActions.push(actionFieldsErrors)
			}
		})

		if (schemeErrorsInActions.length > 0) {
			$mdDialog.show({
				controller: 'ComplexImportSchemeErrorsDialogController as vm',
				templateUrl:
					'views/dialogs/complex-import/complex-import-scheme-error-dialog-view.html',
				targetEvent: $event,
				skipHide: false,
				locals: {
					data: {
						errorsInScheme: schemeErrorsInActions,
					},
				},
			})
		} else {
			vm.loaderData = {
				current: vm.counter,
				total: vm.activeItemTotal,
				skippedTotal: vm.skippedItemTotal,
				text: 'Validation Progress: Step',
				status: vm.status,
				additional: [
					vm.getTransactionImportProgress(),
					vm.getSimpleImportProgress(),
				],
			}

			complexImportValidateService
				.validateImport(
					vm.config.file,
					vm.config.delimiter,
					schemeObject,
					updateCounter
				)
				.then(function (data) {
					// console.log('data', data);

					vm.processing = false

					vm.status = 'SUCCESS'

					vm.processing = false

					if (data.errors.length === 0) {
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
									title: 'Success validation',
									description: '<p>File is valid.</p>',
								},
							},
						})
					} else {
						$mdDialog.show({
							controller: 'ComplexImportValidationErrorsDialogController as vm',
							templateUrl:
								'views/dialogs/complex-import/complex-import-validation-errors-dialog-view.html',
							targetEvent: $event,
							preserveScope: true,
							multiple: true,
							autoWrap: true,
							skipHide: true,
							locals: {
								data: {
									complexImportScheme: schemeObject,
									validationResults: data,
								},
							},
						})
					}
				})
		}
	}

	vm.import = function ($event) {
		vm.processing = true

		var formData = new FormData()

		formData.append('file', vm.config.file)
		formData.append('scheme', vm.config.scheme)

		// console.log('vm.config', vm.config);

		var schemeObject

		vm.schemes.forEach(function (scheme) {
			if (scheme.id === vm.config.scheme) {
				schemeObject = scheme
			}
		})

		vm.counterData = {}
		vm.status = 'PROGRESS'
		vm.state = 'validate'
		vm.counter = 0
		vm.activeItemTotal = schemeObject.actions.length

		vm.skippedItemTotal = schemeObject.actions.filter(function (item) {
			return item.skip
		}).length

		var schemeErrorsInActions = []

		schemeObject.actions.forEach(function (action) {
			var actionFields = {}
			var actionKeys = []
			var actionFieldsErrors = {
				action_notes: action.action_notes,
				action_number: action.order + 1,
				empty_fields: '',
			}

			if (action.csv_import_scheme) {
				actionFields = action.csv_import_scheme
			} else if (action.complex_transaction_import_scheme) {
				actionFields = action.complex_transaction_import_scheme
			}

			actionKeys = Object.keys(actionFields)

			actionKeys.forEach(function (actionField, index) {
				if (
					actionField !== 'csv_import_scheme' &&
					actionField !== 'complex_transaction_import_scheme'
				) {
					if (actionFields[actionField] === null) {
						actionFieldsErrors.empty_fields += actionField

						if (index !== actionKeys.length - 1) {
							// add comma and space if it is not the last empty field

							actionFieldsErrors.empty_fields += ', '
						}
					}
				}
			})

			if (actionFieldsErrors.empty_fields) {
				schemeErrorsInActions.push(actionFieldsErrors)
			}
		})

		if (schemeErrorsInActions.length > 0) {
			$mdDialog.show({
				controller: 'ComplexImportSchemeErrorsDialogController as vm',
				templateUrl:
					'views/dialogs/complex-import/complex-import-scheme-error-dialog-view.html',
				targetEvent: $event,
				skipHide: false,
				locals: {
					data: {
						errorsInScheme: schemeErrorsInActions,
					},
				},
			})
		} else {
			vm.loaderData = {
				current: vm.counter,
				total: vm.activeItemTotal,
				skippedTotal: vm.skippedItemTotal,
				text: 'Validation Progress: Step',
				status: vm.status,
				additional: [
					vm.getTransactionImportProgress(),
					vm.getSimpleImportProgress(),
				],
			}

			complexImportValidateService
				.validateImport(
					vm.config.file,
					vm.config.delimiter,
					schemeObject,
					updateCounter
				)
				.then(function (data) {
					// console.log('validation data', data);

					vm.processing = false

					vm.status = 'SUCCESS'

					var errorsCount = 0

					data.errors.forEach(function (error) {
						errorsCount = errorsCount + error.length
					})

					if (errorsCount === 0) {
						vm.state = 'import'
						vm.counter = 0

						vm.activeItemTotal = schemeObject.actions.length

						vm.skippedItemTotal = schemeObject.actions.filter(function (item) {
							return item.skip
						}).length

						setTimeout(function () {
							vm.processing = true

							vm.status = 'PROGRESS'

							vm.loaderData = {
								current: vm.counter,
								total: vm.activeItemTotal,
								skippedTotal: vm.skippedItemTotal,
								text: 'Import Progress: Step',
								status: vm.status,
								additional: [
									vm.getTransactionImportProgress(),
									vm.getSimpleImportProgress(),
								],
							}

							vm.counterData = {}

							complexImportService
								.startImport(
									vm.config.file,
									vm.config.delimiter,
									schemeObject,
									updateCounter
								)
								.then(function (data) {
									// console.log('data', data);

									vm.status = 'SUCCESS'
									vm.processing = false

									errorsCount = 0

									data.errors.forEach(function (error) {
										errorsCount = errorsCount + error.length
									})

									if (errorsCount === 0) {
										$mdDialog.hide()

										var description = ''

										description =
											'<div>' +
											'<div>Imports in total: ' +
											schemeObject.actions.length +
											'</div>' +
											'</div><br/>'

										// console.log('description', description);

										description =
											description +
											'<div> You have successfully imported file </div>'

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
													title: 'Success',
													description: description,
												},
											},
										})
									} else {
										$mdDialog.show({
											controller:
												'ComplexImportValidationErrorsDialogController as vm',
											templateUrl:
												'views/dialogs/complex-import/complex-import-validation-errors-dialog-view.html',
											targetEvent: $event,
											preserveScope: true,
											multiple: true,
											autoWrap: true,
											skipHide: true,
											locals: {
												data: {
													complexImportScheme: schemeObject,
													validationResults: data,
												},
											},
										})
									}
								})
								.catch(function (reason) {
									// console.log('here? ', reason);

									vm.processing = false

									vm.status = 'SUCCESS'

									$mdDialog.show({
										controller: 'ValidationDialogController as vm',
										templateUrl: 'views/dialogs/validation-dialog-view.html',
										targetEvent: $event,
										preserveScope: true,
										multiple: true,
										autoWrap: true,
										skipHide: true,
										locals: {
											validationData: {
												message: 'An error occurred. Please try again later',
											},
										},
									})

									$scope.$apply()
								})
						}, 500)
					} else {
						vm.processing = false
						vm.status = 'SUCCESS'

						$mdDialog.show({
							controller: 'ComplexImportValidationErrorsDialogController as vm',
							templateUrl:
								'views/dialogs/complex-import/complex-import-validation-errors-dialog-view.html',
							targetEvent: $event,
							preserveScope: true,
							multiple: true,
							autoWrap: true,
							skipHide: true,
							locals: {
								data: {
									complexImportScheme: schemeObject,
									validationResults: data,
								},
							},
						})
					}
				})
		}
	}

	vm.getMember = function () {
		usersService.getMyCurrentMember().then(function (data) {
			vm.currentMember = data

			if (vm.currentMember.is_admin) {
				vm.hasSchemeEditPermission = true
			}

			vm.currentMember.groups_object.forEach(function (group) {
				if (group.permission_table) {
					group.permission_table.configuration.forEach(function (item) {
						if (item.content_type === 'complex_import.compleximportscheme') {
							if (item.data.creator_change) {
								vm.hasSchemeEditPermission = true
							}
						}
					})
				}
			})

			console.log('hasSchemeEditPermission', vm.hasSchemeEditPermission)

			$scope.$apply()
		})
	}

	vm.validateScheme = function () {
		vm.schemeIsValid = true

		var schemeObject

		vm.schemes.forEach(function (scheme) {
			if (scheme.id === vm.config.scheme) {
				schemeObject = scheme
			}
		})

		if (schemeObject.actions && schemeObject.actions.length) {
			schemeObject.actions.forEach(function (action) {
				if (action.complex_transaction_import_scheme) {
					if (
						!action.complex_transaction_import_scheme
							.complex_transaction_import_scheme &&
						!action.skip
					) {
						vm.schemeIsValid = false

						vm.schemeValidationErrorMessage =
							'Action #' + action.order + ' has wrong configuration.'
					}
				}

				if (action.csv_import_scheme) {
					if (!action.csv_import_scheme.csv_import_scheme && !action.skip) {
						vm.schemeIsValid = false

						vm.schemeValidationErrorMessage =
							'Action #' + action.order + ' has wrong configuration.'
					}
				}
			})
		} else {
			vm.schemeIsValid = false

			vm.schemeValidationErrorMessage = 'Scheme has no actions to process.'
		}

		if (vm.schemeIsValid) {
			vm.schemeValidationErrorMessage = ''
		}

		console.log('vm.validateScheme.scheme', schemeObject)
	}

	vm.init = function () {
		vm.getSchemeList()
		vm.getMember()

		if (data && data.scheme) {
			vm.config.scheme = data.scheme.id
		}
	}

	vm.init()

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}
}
