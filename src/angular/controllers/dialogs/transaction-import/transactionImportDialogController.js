import websocketService from '@/angular/../shell/scripts/app/services/websocketService'

/**
 * Created by szhitenev on 17.08.2016.
 */

import transactionImportSchemeService from '@/angular/services/import/transactionImportSchemeService'
import importTransactionService from '@/angular/services/import/importTransactionService'

import baseUrlService from '@/angular/services/baseUrlService'
// import usersService from '@/angular/services/usersService';

var baseUrl = baseUrlService.resolve()

export default function transactionImportDialogController(
	$scope,
	$mdDialog,
	data,
	usersService
) {
	var vm = this

	vm.fileLocal = null

	vm.readyStatus = {
		schemes: false,
		processing: false,
	}
	vm.dataIsImported = false

	vm.config = {}
	vm.validateConfig = {}

	vm.processing = false
	vm.loaderData = {}

	vm.hasSchemeEditPermission = false

	vm.subTasksInfo = {}

	vm.loadIsAvailable = function () {
		return !vm.readyStatus.processing && vm.config.scheme
	}

	vm.checkExtension = function (file, extension, $event) {
		if (file) {
			var ext = file.name.split('.')[1]

			if (ext !== 'csv' && ext !== 'xlsx') {
				$mdDialog
					.show({
						controller: 'SuccessDialogController as vm',
						templateUrl: 'views/dialogs/success-dialog-view.html',
						targetEvent: $event,
						locals: {
							success: {
								title: 'Warning!',
								description: 'You are trying to load incorrect file',
							},
						},
						multiple: true,
						preserveScope: true,
						autoWrap: true,
						skipHide: true,
					})
					.then(function () {
						vm.config.file = null
					})
			}
		}
	}

	vm.validateImport = function ($event) {
		new Promise(function (resolve, reject) {
			vm.validateConfig = Object.assign({}, vm.config)

			vm.processing = true

			vm.loaderData = {
				current: vm.validateConfig.processed_rows,
				total: vm.validateConfig.total_rows,
				text: 'Validation Progress:',
				status: vm.validateConfig.task_status,
			}

			vm.validate(resolve, $event)
		}).then(function (data) {
			vm.validateConfig = {}

			vm.processing = false
			vm.readyStatus.processing = false

			var errorsCount = 0

			data.error_rows.forEach(function (item) {
				if (item.level === 'error') {
					errorsCount = errorsCount + 1
				}
			})

			if (errorsCount) {
				data.process_mode = 'validate'

				var transactionScheme

				vm.transactionSchemes.forEach(function (scheme) {
					if (scheme.id === vm.config.scheme) {
						transactionScheme = scheme
					}
				})

				// vm.validateConfig.file = {};
				// vm.validateConfig.file.name = vm.fileLocal.name;

				$mdDialog.show({
					controller: 'TransactionImportErrorsDialogController as vm',
					templateUrl:
						'views/dialogs/transaction-import/transaction-import-errors-dialog-view.html',
					locals: {
						data: {
							validationResult: data,
							scheme: transactionScheme,
							config: vm.validateConfig,
						},
					},
					targetEvent: $event,
					preserveScope: true,
					multiple: true,
					autoWrap: true,
					skipHide: true,
				})
			} else {
				vm.readyStatus.processing = false

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
							description: 'Validation successful',
						},
					},
				})
			}
		})
	}

	vm.startImport = function ($event) {
		new Promise(function (resolve, reject) {
			delete vm.config.task_id
			delete vm.config.task_status

			vm.processing = true

			vm.loaderData = {
				current: vm.config.processed_rows,
				total: vm.config.total_rows,
				text: 'Import Progress:',
				status: vm.config.task_status,
			}

			vm.import(resolve, $event)
		})
			.then(function (data) {
				var error_rows = data.error_rows.filter(function (item) {
					return item.level === 'error'
				})

				var description = ''

				if (!data.total_rows && error_rows.length === 0) {
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
								title: 'Warning',
								description: 'Nothing to import, check file format!',
							},
						},
					})
				} else {
					if (data.scheme_object.error_handler === 'break') {
						if (data.error_row_index) {
							description =
								'<div>' +
								'<div>Rows total: ' +
								data.total_rows +
								'</div>' +
								'<div>Rows success import: ' +
								(data.error_row_index - 1) +
								'</div>' +
								'<div>Rows fail import: ' +
								error_rows.length +
								'</div>' +
								'</div><br/>'
						} else {
							description =
								'<div>' +
								'<div>Rows total: ' +
								data.total_rows +
								'</div>' +
								'<div>Rows success import: ' +
								data.total_rows +
								'</div>' +
								'<div>Rows fail import: ' +
								error_rows.length +
								'</div>' +
								'</div><br/>'
						}
					}

					if (data.scheme_object.error_handler === 'continue') {
						description =
							'<div>' +
							'<div>Rows total: ' +
							data.total_rows +
							'</div>' +
							'<div>Rows success import: ' +
							(data.total_rows - error_rows.length) +
							'</div>' +
							'<div>Rows fail import: ' +
							error_rows.length +
							'</div>' +
							'</div><br/>'
					}

					description =
						description +
						'<div> You have successfully imported transactions file </div>'

					description =
						description +
						'<div><a href="' +
						vm.getFileUrl(data.stats_file_report) +
						'" download>Download Report File</a></div>'

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
				}

				vm.processing = false
				vm.dataIsImported = true
			})
			.catch(function (error) {

			})
	}

	vm.startImportWithValidation = function ($event) {


		return new Promise(function (resolve, reject) {
			vm.processing = true

			vm.validateConfig = Object.assign({}, vm.config)

			vm.loaderData = {
				current: vm.validateConfig.processed_rows,
				total: vm.validateConfig.total_rows,
				text: 'Validation Progress:',
				status: vm.validateConfig.task_status,
			}

			vm.validate(resolve, $event)
		}).then(function (data) {



			var errorsCount = 0

			data.error_rows.forEach(function (item) {
				if (item.level === 'error') {
					errorsCount = errorsCount + 1
				}
			})

			console.log(
				'startImportWithValidation validation errorsCount',
				errorsCount
			)

			if (errorsCount) {
				var transactionScheme

				vm.transactionSchemes.forEach(function (scheme) {
					if (scheme.id === vm.config.scheme) {
						transactionScheme = scheme
					}
				})

				var config = Object.assign({}, vm.config)

				config.file = {}
				config.file.name = vm.fileLocal.name

				$mdDialog
					.show({
						controller: 'TransactionImportErrorsDialogController as vm',
						templateUrl:
							'views/dialogs/transaction-import/transaction-import-errors-dialog-view.html',
						locals: {
							data: {
								validationResult: data,
								config: config,
							},
						},
						targetEvent: $event,
						preserveScope: true,
						multiple: true,
						autoWrap: true,
						skipHide: true,
					})
					.then(function (res) {
						if (res.status === 'agree') {
							vm.startImport($event)
						} else {
							vm.validateConfig = {}
							vm.readyStatus.processing = false
						}
					})
			} else {
				vm.loaderData = {
					current: vm.config.processed_rows,
					total: vm.config.total_rows,
					text: 'Import Progress:',
					status: vm.config.task_status,
				}



				vm.startImport($event)
			}
		})
	}

	vm.validate = function (resolve, $event) {


		vm.readyStatus.processing = true

		var formData = new FormData()

		if (vm.validateConfig.task_id) {
			formData.append('task_id', vm.validateConfig.task_id)
		} else {
			formData.append('file', vm.config.file)
			formData.append('scheme', vm.config.scheme)

			vm.fileLocal = vm.config.file
		}

		importTransactionService.validateImport(formData).then(function (data) {
			vm.validateConfig = data
			vm.subTasksInfo = {}

			vm.loaderData = {
				current: vm.validateConfig.processed_rows,
				total: vm.validateConfig.total_rows,
				text: 'Validation Progress:',
				status: vm.validateConfig.task_status,
			}

			$scope.$apply()

			if (websocketService.isOnline()) {


				websocketService.addEventListener(
					'transaction_import_status',
					function (data) {


						// If parent task is finished
						if (vm.validateConfig.task_id === data.task_id) {
							if (data.state === 'D') {
								websocketService.removeEventListener(
									'transaction_import_status'
								)
								resolve(data)
							} else {
								if (data.state !== 'D' && data.state !== 'P') {
									websocketService.removeEventListener(
										'transaction_import_status'
									)
									resolve(data)
								}
							}
						}

						// Update subtask status
						if (vm.validateConfig.task_id === data.parent_task_id) {
							vm.subTasksInfo[data.task_id] = data

							var keys = Object.keys(vm.subTasksInfo)

							var processedRows = 0
							var processed

							keys.forEach(function (task_id) {
								processed = 0

								if (vm.subTasksInfo[task_id].processed_rows) {
									processed = vm.subTasksInfo[task_id].processed_rows - 1
								}

								processedRows = processedRows + processed
							})

							vm.loaderData = {
								current: processedRows,
								total: data.parent_total_rows,
								text: 'Validation Progress:',
								status: vm.validateConfig.state,
							}

							$scope.$apply()
						}
					}
				)
			} else {


				if (vm.validateConfig.task_status === 'SUCCESS') {
					resolve(data)
				} else {
					setTimeout(function () {
						vm.validate(resolve, $event)
					}, 1000)
				}
			}
		})
	}

	vm.import = function (resolve, $event) {
		vm.processing = true

		var formData = new FormData()

		if (vm.config.task_id) {
			formData.append('task_id', vm.config.task_id)
		} else {
			formData.append('file', vm.config.file)
			formData.append('scheme', vm.config.scheme)

			vm.fileLocal = vm.config.local
		}

		var transactionScheme

		vm.transactionSchemes.forEach(function (scheme) {
			if (scheme.id === vm.config.scheme) {
				transactionScheme = scheme
			}
		})

		importTransactionService
			.startImport(formData)
			.then(function (data) {
				vm.config = data
				vm.subTasksInfo = {}

				vm.loaderData = {
					current: vm.config.processed_rows,
					total: vm.config.total_rows,
					text: 'Import Progress:',
					status: vm.config.task_status,
				}

				$scope.$apply()

				if (websocketService.isOnline()) {
					websocketService.addEventListener(
						'transaction_import_status',
						function (data) {
							if (vm.config.task_id === data.task_id) {
								if (data.state === 'D') {
									websocketService.removeEventListener(
										'transaction_import_status'
									)
									resolve(data)
								} else {
									if (data.state !== 'D' && data.state !== 'P') {
										websocketService.removeEventListener(
											'transaction_import_status'
										)
										resolve(data)
									}
								}
							}

							if (vm.config.task_id === data.parent_task_id) {
								vm.subTasksInfo[data.task_id] = data

								var keys = Object.keys(vm.subTasksInfo)

								var processedRows = 0
								var processed

								keys.forEach(function (task_id) {
									processed = 0

									if (vm.subTasksInfo[task_id].processed_rows) {
										processed = vm.subTasksInfo[task_id].processed_rows - 1
									}

									processedRows = processedRows + processed
								})

								vm.loaderData = {
									current: processedRows,
									total: data.parent_total_rows,
									text: 'Import Progress:',
									status: data.state,
								}

								$scope.$apply()
							}
						}
					)
				} else {
					if (vm.config.task_status === 'SUCCESS') {
						resolve(data)
					} else {
						setTimeout(function () {
							vm.import(resolve, $event)
						}, 1000)
					}
				}
			})
			.catch(function (reason) {
				$mdDialog.show({
					controller: 'ValidationDialogController as vm',
					templateUrl: 'views/dialogs/validation-dialog-view.html',
					locals: {
						validationData: 'An error occurred. Please try again later',
					},
					targetEvent: $event,
					preserveScope: true,
					multiple: true,
					autoWrap: true,
					skipHide: true,
				})

				vm.processing = false
			})
	}

	vm.getFileUrl = function (id) {
		var prefix = baseUrlService.getMasterUserPrefix()
		var apiVersion = baseUrlService.getApiVersion()

		return (
			baseUrl +
			'/' +
			prefix +
			'/' +
			apiVersion +
			'/' +
			'file-reports/file-report/' +
			id +
			'/view/'
		)
	}

	vm.editScheme = function ($event) {
		$mdDialog
			.show({
				controller: 'TransactionImportSchemeEditDialogController as vm',
				templateUrl:
					'views/dialogs/transaction-import/transaction-import-scheme-dialog-view.html',
				locals: {
					schemeId: vm.config.scheme,
				},
				targetEvent: $event,
				preserveScope: true,
				multiple: true,
				autoWrap: true,
				skipHide: true,
			})
			.then(function (res) {
				if (res.status === 'agree') {
					vm.getSchemeList()
				} else if (res.status === 'copy') {
					res.dialogPromise.then(function (copyRes) {
						if (copyRes.status === 'agree') {
							vm.getSchemeList()
						}
					})
				}
			})
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
						if (
							item.content_type ===
							'integrations.complextransactionimportscheme'
						) {
							if (item.data.creator_change) {
								vm.hasSchemeEditPermission = true
							}
						}
					})
				}
			})



			$scope.$apply()
		})
	}

	vm.getSchemeList = function () {
		transactionImportSchemeService.getListLight().then(function (data) {
			vm.transactionSchemes = data.results
			vm.readyStatus.schemes = true
			$scope.$apply()
		})
	}

	vm.init = function () {
		vm.getSchemeList()
		vm.getMember()



		if (data.scheme) {
			vm.config.scheme = data.scheme.id
		}


	}

	vm.init()

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}
}
