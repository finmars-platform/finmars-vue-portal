/**
 * Created by mevstratov on 24.06.2019.
 */
import websocketService from '@/angular/shell/scripts/app/services/websocketService.js'
import importTransactionService from '../../services/import/importTransactionService'

import transactionImportSchemeService from '../../services/import/transactionImportSchemeService'
import importTransactionService from '../../services/import/importTransactionService'
import processesService from '../../services/processesService'

import baseUrlService from '../../services/baseUrlService'
import downloadFileHelper from '../../helpers/downloadFileHelper'
// import usersService from '../../services/usersService';

// import websocketService from '@/angular/shell/scripts/app/services/websocketService.js';

var baseUrl = baseUrlService.resolve()

export default function transactionImportController(
	$scope,
	$mdDialog,
	usersService,
	systemMessageService
) {
	var vm = this

	vm.fileLocal = null

	vm.readyStatus = {
		schemes: false,
		processing: false,
	}
	vm.importIsFinished = false

	vm.config = {}
	vm.validateConfig = {}

	// vm.processing = false;
	vm.loaderData = {}

	vm.hasSchemeEditPermission = false

	vm.subTasksInfo = {}

	vm.currenTaskId = null

	vm.poolingInterval = null

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

	// TODO DEPRECATED LOGIC
	vm.validateImport = function ($event) {
		new Promise(function (resolve, reject) {
			vm.validateConfig = Object.assign({}, vm.config)

			// vm.processing = true;
			vm.readyStatus.processing = true

			vm.loaderData = {
				current: vm.validateConfig.processed_rows,
				total: vm.validateConfig.total_rows,
				text: 'Validation Progress:',
				status: vm.validateConfig.task_status,
			}

			vm.validate(resolve, reject, $event)
		})
			.then(function (data) {
				vm.validateConfig = {}

				// vm.processing = false;
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
			.catch(function (e) {
				vm.readyStatus.processing = false
				$scope.$apply()
			})
	}

	vm.startImport = function ($event) {
		new Promise(function (resolve, reject) {
			delete vm.config.task_id
			delete vm.config.task_status

			// vm.processing = true
			vm.readyStatus.processing = true

			vm.loaderData = {
				current: vm.config.processed_rows,
				total: vm.config.total_rows,
				text: 'Import Progress:',
				status: vm.config.task_status,
			}

			vm.import(resolve, $event)
		}).then(function (data) {
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

			// vm.processing = false;
			vm.readyStatus.processing = false
		})
	}

	// TODO DEPRECATED LOGIC
	vm.startImportWithValidation = function ($event) {
		console.log('startImportWithValidation starting validation')
		return new Promise(function (resolve, reject) {
			// vm.processing = true;
			vm.readyStatus.processing = true

			vm.validateConfig = Object.assign({}, vm.config)

			vm.loaderData = {
				current: vm.validateConfig.processed_rows,
				total: vm.validateConfig.total_rows,
				text: 'Validation Progress:',
				status: vm.validateConfig.task_status,
			}

			vm.validate(resolve, reject, $event)
		})
			.then(function (data) {
				console.log('startImportWithValidation validation finished')
				console.log('startImportWithValidation validation finished data', data)

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
							}
						})

					vm.readyStatus.processing = false
				} else {
					vm.loaderData = {
						current: vm.config.processed_rows,
						total: vm.config.total_rows,
						text: 'Import Progress:',
						status: vm.config.task_status,
					}

					console.log('startImportWithValidation starting import')

					vm.startImport($event)
				}
			})
			.catch(function (e) {
				vm.readyStatus.processing = false
				$scope.$apply()
			})
	}
	// TODO DEPRECATED LOGIC
	vm.validate = function (resolve, reject, $event) {
		console.log('Validate')

		vm.readyStatus.processing = true

		var formData = new FormData()

		if (vm.validateConfig.task_id) {
			formData.append('task_id', vm.validateConfig.task_id)
		} else {
			formData.append('file', vm.config.file)
			formData.append('scheme', vm.config.scheme)

			vm.fileLocal = vm.config.file
		}

		importTransactionService
			.validateImport(formData)
			.then(function (data) {
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
					console.log('Websocket Online. Fetching status')

					websocketService.addEventListener(
						'transaction_import_status',
						function (data) {
							console.log('transaction_import_status.data', data)

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
					console.log('Websocket is Offline. Falling back to polling')

					if (vm.validateConfig.task_status === 'SUCCESS') {
						resolve(data)
					} else {
						setTimeout(function () {
							vm.validate(resolve, reject, $event)
						}, 1000)
					}
				}
			})
			.catch(function (e) {
				reject(e)
			})
	}

	vm.getTask = function () {
		processesService.getByKey(vm.currentTaskId).then(function (data) {
			vm.task = data
			console.log('vm.task', vm.task)

			if (vm.task.status === 'D' || vm.task.status === 'E') {
				clearInterval(vm.poolingInterval)
				vm.poolingInterval = null
				// vm.processing = false;
				vm.readyStatus.processing = false
				vm.importIsFinished = true
			}

			$scope.$apply()
		})
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

	vm.import = function (resolve, $event) {
		// vm.processing = true;
		vm.readyStatus.processing = true

		clearInterval(vm.poolingInterval)
		vm.poolingInterval = null
		vm.importIsFinished = false

		var formData = new FormData()

		if (vm.config.json_data) {
			console.log('vm.config.json_data', vm.config.json_data)

			let blob = new Blob([JSON.stringify(JSON.parse(vm.config.json_data))], {
				type: 'application/json;',
			})

			if (vm.config.task_id) {
				formData.append('task_id', vm.config.task_id)
			} else {
				formData.append('file', blob, 'input.json')
				formData.append('scheme', vm.config.scheme)
				formData.append('preprocess_file', vm.config.preprocess_file)

				vm.fileLocal = vm.config.local
			}
		} else {
			if (vm.config.task_id) {
				formData.append('task_id', vm.config.task_id)
			} else {
				formData.append('file', vm.config.file)
				formData.append('scheme', vm.config.scheme)
				formData.append('preprocess_file', vm.config.preprocess_file)

				vm.fileLocal = vm.config.local
			}
		}

		importTransactionService
			.startImport(formData)
			.then(function (data) {
				vm.config = data
				vm.subTasksInfo = {}

				vm.currentTaskId = data.task_id

				$scope.$apply()

				vm.getTask()

				vm.poolingInterval = setInterval(function () {
					vm.getTask()
				}, 1000)
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

				// vm.processing = false;
				vm.readyStatus.processing = false
				$scope.$apply()
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

	vm.editSchemeV2 = function ($event) {
		$mdDialog
			.show({
				controller: 'TransactionImportSchemeV2EditDialogController as vm',
				templateUrl:
					'views/dialogs/transaction-import/transaction-import-scheme-v2-dialog-view.html',
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

			console.log('hasSchemeEditPermission', vm.hasSchemeEditPermission)

			$scope.$apply()
		})
	}

	vm.getSchemeList = function () {
		transactionImportSchemeService.getListLight().then(function (data) {
			vm.transactionSchemes = data.results
			vm.readyStatus.schemes = true

			console.log('transactionSchemes', vm.transactionSchemes)
			$scope.$apply()
		})
	}

	vm.togglePreprocessFile = function () {
		vm.config.preprocess_file = !vm.config.preprocess_file
	}

	vm.preprocessFile = function () {
		// vm.processing = true;
		vm.readyStatus.processing = true

		var formData = new FormData()

		if (vm.config.json_data) {
			console.log('vm.config.json_data', vm.config.json_data)

			let blob = new Blob([JSON.stringify(JSON.parse(vm.config.json_data))], {
				type: 'application/json;',
			})

			if (vm.config.task_id) {
				formData.append('task_id', vm.config.task_id)
			} else {
				formData.append('file', blob, 'input.json')
				formData.append('scheme', vm.config.scheme)
				formData.append('preprocess_file', vm.config.preprocess_file)

				vm.fileLocal = vm.config.local
			}
		} else {
			if (vm.config.task_id) {
				formData.append('task_id', vm.config.task_id)
			} else {
				formData.append('file', vm.config.file)
				formData.append('scheme', vm.config.scheme)
				formData.append('preprocess_file', vm.config.preprocess_file)

				vm.fileLocal = vm.config.local
			}
		}

		var transactionScheme

		vm.transactionSchemes.forEach(function (scheme) {
			if (scheme.id === vm.config.scheme) {
				transactionScheme = scheme
			}
		})

		importTransactionService.preprocessFile(formData).then(function (data) {
			downloadFileHelper.downloadFile(
				data,
				'application/pdf',
				'preprocessed.json'
			)

			// vm.processing = false;
			vm.readyStatus.processing = false
			$scope.$apply()
		})
	}

	vm.init = function () {
		vm.getSchemeList()
		vm.getMember()
	}

	vm.init()
}
