/**
 * Created by szhitenev on 08.06.2016.
 */

export default function ($scope, $mdDialog, data) {
	var vm = this

	vm.validationResult = data.validationResult
	vm.scheme = data.validationResult.scheme_object
	vm.config = data.config

	vm.errors = []

	vm.imported_columns = []
	vm.converted_imported_columns = []
	vm.data_matching = []

	vm.cancelButtonText = 'Ok'

	vm.createCsvContentSimpleEntityImport = function (validationResult, config) {
		var columns = ['Row number']

		columns = columns.concat(
			validationResult.stats[0].error_data.columns.imported_columns
		)
		columns = columns.concat(
			validationResult.stats[0].error_data.columns.data_matching
		)

		columns.push('Error Message')
		columns.push('Reaction')

		var content = []

		validationResult.stats.forEach(function (errorRow) {
			var result = []

			result.push(errorRow.original_row_index)

			result = result.concat(errorRow.error_data.data.imported_columns)
			result = result.concat(errorRow.error_data.data.data_matching)

			result.push('"' + errorRow.error_message + '"')
			result.push(errorRow.error_reaction)

			content.push(result)
		})

		var columnRow = columns.join(',')

		var result = []

		result.push('Type, ' + 'Transaction Import')
		result.push('Error handle, ' + config.error_handler)
		result.push('Filename, ' + config.file.name)
		result.push('Mode, ' + config.mode)
		result.push(
			'Import Rules - if object is not found, ' + config.missing_data_handler
		)
		// result.push('Entity, ' + vm.scheme.content_type);

		result.push('Rows total, ' + (validationResult.total_rows - 1))

		var rowsSuccessTotal

		var rowsSkippedCount = validationResult.stats.filter(function (item) {
			return item.error_reaction === 'Skipped'
		}).length

		var rowsFailedCount = validationResult.stats.filter(function (item) {
			return item.error_reaction !== 'Skipped'
		}).length

		if (config.error_handler === 'break') {
			var index = validationResult.stats[0].original_row_index

			rowsSuccessTotal = index - 1 // get row before error
			rowsSuccessTotal = vm.rowsSuccessTotal - 1 // exclude headers
		} else {
			rowsSuccessTotal =
				validationResult.total_rows - 1 - rowsFailedCount - rowsSkippedCount
		}

		if (rowsSuccessTotal < 0) {
			rowsSuccessTotal = 0
		}

		result.push('Rows success import, ' + rowsSuccessTotal)
		result.push('Rows omitted, ' + rowsSkippedCount)
		result.push('Rows fail import, ' + rowsFailedCount)

		result.push('\n')
		result.push(columnRow)

		content.forEach(function (contentRow) {
			result.push(contentRow.join(','))
		})

		result = result.join('\n')

		return result
	}

	vm.setDownloadLink = function () {
		var link = document.querySelector('.download-error-link')

		var text = vm.createCsvContentSimpleEntityImport(
			vm.validationResult,
			vm.config
		)

		var file = new Blob([text], { type: 'text/plain' })

		link.href = URL.createObjectURL(file)
		link.download = vm.scheme.user_code + ' error file.csv'
	}

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.agree = function ($event) {
		if (vm.scheme.process_mode !== 'validate') {
			if (vm.scheme.error_handler === 'break') {
				$mdDialog
					.show({
						controller: 'WarningDialogController as vm',
						templateUrl: 'views/dialogs/warning-dialog-view.html',
						parent: angular.element(document.body),
						targetEvent: $event,
						clickOutsideToClose: false,
						locals: {
							warning: {
								title: 'Warning',
								description:
									'Please note that only valid rows until the first invalid row will be imported. The invalid row and the further rows, whether valid or not, will be excluded from the imported data',
								actionsButtons: [
									{
										name: 'CANCEL',
										response: {},
									},
									{
										name: 'OK, PROCEED',
										response: { status: 'agree' },
									},
								],
							},
						},
						preserveScope: true,
						autoWrap: true,
						skipHide: true,
						multiple: true,
					})
					.then(function (res) {
						if (res.status === 'agree') {
							$mdDialog.hide({ status: 'agree' })
						}
					})
			}

			if (vm.scheme.error_handler === 'continue') {
				$mdDialog
					.show({
						controller: 'WarningDialogController as vm',
						templateUrl: 'views/dialogs/warning-dialog-view.html',
						parent: angular.element(document.body),
						targetEvent: $event,
						clickOutsideToClose: false,
						locals: {
							warning: {
								title: 'Warning',
								description:
									'Please note that only valid rows will be imported. The invalid rows will be excluded from the imported data.',
								actionsButtons: [
									{
										name: 'CANCEL',
										response: {},
									},
									{
										name: 'OK, PROCEED',
										response: { status: 'agree' },
									},
								],
							},
						},
						preserveScope: true,
						autoWrap: true,
						skipHide: true,
						multiple: true,
					})
					.then(function (res) {
						if (res.status === 'agree') {
							$mdDialog.hide({ status: 'agree' })
						}
					})
			}
		} else {
			$mdDialog.hide({ status: 'agree' })
		}
	}

	vm.init = function () {
		console.log('vm.scheme ', vm.scheme)

		vm.errors = vm.validationResult.stats.filter(function (item) {
			return item.level === 'error'
		})

		vm.errors = vm.errors.map(function (item) {
			item.original_row_pretty = item.original_row.join(' ')

			return item
		})

		vm.rowsSkippedCount = vm.validationResult.stats.filter(function (item) {
			return item.error_reaction === 'Skipped'
		}).length

		vm.rowsFailedCount = vm.validationResult.stats.filter(function (item) {
			return item.error_reaction !== 'Skipped'
		}).length

		console.log(
			'vm.validationResult.error_handler',
			vm.validationResult.error_handler
		)

		if (vm.config.error_handler === 'break') {
			var index = vm.validationResult.stats[0].original_row_index

			vm.rowsSuccessTotal = index - 1 // get row before error
			vm.rowsSuccessTotal = vm.rowsSuccessTotal - 1 // exclude headers
		} else {
			vm.rowsSuccessTotal =
				vm.validationResult.total_rows -
				1 -
				vm.rowsFailedCount -
				vm.rowsSkippedCount
		}

		if (vm.rowsSuccessTotal < 0) {
			vm.rowsSuccessTotal = 0
		}

		setTimeout(function () {
			vm.setDownloadLink()
		}, 100)
	}

	vm.init()
}
