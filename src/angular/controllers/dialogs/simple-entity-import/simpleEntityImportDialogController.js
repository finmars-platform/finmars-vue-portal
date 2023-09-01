import websocketService from '@/angular/../shell/scripts/app/services/websocketService'

/**
 * Created by szhitenev on 14.03.2018.
 */

import csvImportSchemeService from '@/angular/services/import/csvImportSchemeService'

import importEntityService from '@/angular/services/import/importEntityService'

import baseUrlService from '@/angular/services/baseUrlService'
// import usersService from '@/angular/services/usersService';

var baseUrl = baseUrlService.resolve()

export default function simpleEntityImportDialogController(
	$scope,
	$mdDialog,
	usersService,
	metaContentTypesService,
	data
) {
	var vm = this

	vm.readyStatus = {
		schemes: false,
		processing: false,
	}

	vm.dataIsImported = false
	vm.activeContentType = null

	vm.config = {
		scheme: null,
	}
	vm.validateConfig = {}

	vm.processing = false
	vm.loaderData = {}

	vm.hasSchemeEditPermission = false

	vm.loadIsAvailable = function () {
		if (
			vm.config.scheme != null &&
			vm.config.file !== null &&
			vm.config.file !== undefined &&
			vm.processing === false
		) {
			return true
		}
		return false
	}

	vm.contentTypes = metaContentTypesService
		.getListForSimpleEntityImport()
		.map(function (item) {
			item.id = item.key

			return item
		})

	vm.getSchemeList = function () {
		var options = { filters: { content_type: vm.activeContentType } }

		csvImportSchemeService.getListLight(options).then(function (data) {
			vm.entitySchemes = data.results
			vm.readyStatus.schemes = true
			$scope.$apply()
		})
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

	vm.updateEntitySchemes = function () {
		vm.getSchemeList()
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

	vm.createScheme = function ($event) {
		$mdDialog
			.show({
				controller: 'SimpleEntityImportSchemeCreateDialogController as vm',
				templateUrl:
					'views/dialogs/simple-entity-import/simple-entity-import-scheme-dialog-view.html',
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
				controller: 'SimpleEntityImportSchemeEditDialogController as vm',
				templateUrl:
					'views/dialogs/simple-entity-import/simple-entity-import-scheme-dialog-view.html',
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

	vm.validate = function (resolve, $event) {
		vm.readyStatus.processing = true

		var formData = new FormData()

		if (vm.validateConfig.task_id) {
			formData.append('task_id', vm.validateConfig.task_id)
		} else {
			formData.append('file', vm.config.file)
			formData.append('scheme', vm.config.scheme)
		}

		importEntityService.validateImport(formData).then(function (data) {
			vm.validateConfig = data

			vm.loaderData = {
				current: vm.validateConfig.processed_rows,
				total: vm.validateConfig.total_rows,
				text: 'Validation Progress:',
				status: vm.validateConfig.task_status,
			}

			$scope.$apply()

			if (websocketService.isOnline()) {
				websocketService.addEventListener(
					'simple_import_status',
					function (data) {


						if (vm.validateConfig.task_id === data.task_id) {
							vm.loaderData = {
								current: data.processed_rows,
								total: data.total_rows,
								text: 'Validation Progress:',
								status: data.state,
							}

							$scope.$apply()

							if (data.state === 'D') {
								websocketService.removeEventListener('simple_import_status')
								resolve(data)
							} else {
								if (data.state !== 'D' && data.state !== 'P') {
									websocketService.removeEventListener('simple_import_status')
									resolve(data)
								}
							}
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

	vm.validateImport = function ($event) {
		new Promise(function (resolve, reject) {
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
			vm.processing = false



			var hasErrors = false

			vm.readyStatus.processing = false
			vm.dataIsImported = true

			$scope.$apply()

			data.stats.forEach(function (item) {
				if (item.level === 'error') {
					hasErrors = true
				}
			})



			if (!hasErrors) {
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
							description: 'File is Valid',
						},
					},
				})
			} else {
				var schemeObject

				vm.entitySchemes.forEach(function (scheme) {
					if (scheme.id == vm.config.scheme) {
						schemeObject = scheme
					}
				})



				$mdDialog.show({
					controller: 'SimpleEntityImportErrorsDialogController as vm',
					templateUrl:
						'views/dialogs/simple-entity-import/simple-entity-import-errors-dialog-view.html',
					targetEvent: $event,
					preserveScope: true,
					multiple: true,
					autoWrap: true,
					skipHide: true,
					locals: {
						data: {
							validationResult: data,
							scheme: schemeObject,
							config: vm.config,
						},
					},
				})
			}
		})
	}

	vm.import = function (resolve, $event) {
		vm.readyStatus.processing = true

		var formData = new FormData()

		if (vm.config.task_id) {
			formData.append('task_id', vm.config.task_id)
		} else {
			formData.append('file', vm.config.file)
			formData.append('scheme', vm.config.scheme)
		}

		importEntityService.startImport(formData).then(function (data) {
			vm.config = data

			vm.loaderData = {
				current: vm.config.processed_rows,
				total: vm.config.total_rows,
				text: 'Import Progress:',
				status: vm.config.task_status,
			}

			$scope.$apply()

			if (websocketService.isOnline()) {
				websocketService.addEventListener(
					'simple_import_status',
					function (data) {
						if (vm.config.task_id === data.task_id) {
							vm.loaderData = {
								current: data.processed_rows,
								total: data.total_rows,
								text: 'Import Progress:',
								status: data.state,
							}

							$scope.$apply()

							if (data.state === 'D') {
								websocketService.removeEventListener('simple_import_status')
								resolve(data)
							} else {
								if (data.state !== 'D' && data.state !== 'P') {
									websocketService.removeEventListener('simple_import_status')
									resolve(data)
								}
							}
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
		}).then(function (data) {
			vm.config = {}

			vm.processing = false



			vm.readyStatus.processing = false
			vm.dataIsImported = true

			$scope.$apply()

			var errors = data.stats.filter(function (item) {
				return item.level === 'error'
			})



			var description

			if (data.scheme_object.error_handler === 'continue') {
				description =
					'<div>' +
					'<div>Rows total: ' +
					data.total_rows +
					'</div>' +
					'<div>Rows success import: ' +
					(data.stats.length - errors.length) +
					'</div>' +
					'<div>Rows fail import: ' +
					errors.length +
					'</div>' +
					'</div><br/>'
			}

			if (data.scheme_object.error_handler === 'break') {
				description =
					'<div>' +
					'<div>Rows total: ' +
					data.total_rows +
					'</div>' +
					'<div>Rows success import: ' +
					(data.stats.length - errors.length) +
					'</div>' +
					'<div>Rows fail import: ' +
					errors.length +
					'</div>' +
					'</div><br/>'
			}

			description =
				description + '<div> You have successfully imported csv file </div>'

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
			vm.validateConfig = {}

			vm.processing = false



			var hasErrors = false

			vm.readyStatus.processing = false
			vm.dataIsImported = true

			$scope.$apply()

			data.stats.forEach(function (item) {
				if (item.level === 'error') {
					hasErrors = true
				}
			})



			if (!hasErrors) {
				vm.startImport($event)
			} else {
				var schemeObject

				vm.entitySchemes.forEach(function (scheme) {
					if (scheme.id == vm.config.scheme) {
						schemeObject = scheme
					}
				})



				$mdDialog
					.show({
						controller: 'SimpleEntityImportErrorsDialogController as vm',
						templateUrl:
							'views/dialogs/simple-entity-import/simple-entity-import-errors-dialog-view.html',
						targetEvent: $event,
						preserveScope: true,
						multiple: true,
						autoWrap: true,
						skipHide: true,
						locals: {
							data: {
								validationResult: data,
								config: vm.config,
							},
						},
					})
					.then(function (res) {
						if (res && res.status === 'agree') {
							vm.startImport($event)
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
						if (item.content_type === 'csv_import.csvimportscheme') {
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
