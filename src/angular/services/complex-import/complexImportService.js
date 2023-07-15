/**
 * Created by szhitenev on 12.09.2016.
 */

import importEntityService from '../import/importEntityService'
import importTransactionService from '../../services/import/importTransactionService'

var importSimple = function (resolve, config, index, updateCounter) {
	var formData = new FormData()

	if (config.task_id) {
		formData.append('task_id', config.task_id)
	} else {
		formData.append('file', config.file)
		formData.append('scheme', config.scheme)
		formData.append('error_handler', config.error_handler)
		formData.append('missing_data_handler', config.missing_data_handler)
		formData.append('classifier_handler', config.classifier_handler)
		formData.append('delimiter', config.delimiter)
		formData.append('mode', config.mode)
	}

	// ;

	return importEntityService.startImport(formData).then(function (data) {
		config = data

		updateCounter(index, config)

		if (config.task_status === 'SUCCESS') {
			resolve({
				config: config,
				data: data,
			})
		} else {
			setTimeout(function () {
				importSimple(resolve, config, index, updateCounter)
			}, 1000)
		}
	})
}

var handleCsvImportAction = function (
	action,
	file,
	delimiter,
	index,
	updateCounter
) {
	return new Promise(function (resolve, reject) {
		var config = {
			file: file,
			scheme: action.csv_import_scheme,
			error_handler: action.error_handler,
			missing_data_handler: action.missing_data_handler,
			classifier_handler: action.classifier_handler,
			delimiter: delimiter,
			mode: action.mode,
		}



		importSimple(resolve, config, index, updateCounter)
	})
}

var importComplexTransactions = function (
	resolve,
	config,
	index,
	updateCounter
) {
	var formData = new FormData()

	if (config.task_id) {
		formData.append('task_id', config.task_id)
	} else {
		formData.append('file', config.file)
		formData.append('scheme', config.scheme)
		formData.append('error_handling', config.error_handling)
		formData.append('missing_data_handler', config.missing_data_handler)
		formData.append('delimiter', config.delimiter)
	}

	importTransactionService.startImport(formData).then(function (data) {
		config = data

		updateCounter(index, config)

		if (config.task_status === 'SUCCESS') {
			resolve({
				config: config,
				data: data,
			})
		} else {
			setTimeout(function () {
				importComplexTransactions(resolve, config, index, updateCounter)
			}, 1000)
		}
	})
}

var handleComplexTransactionImportAction = function (
	action,
	file,
	delimiter,
	index,
	updateCounter
) {
	return new Promise(function (resolve, reject) {
		var config = {
			file: file,
			scheme: action.complex_transaction_import_scheme,
			error_handling: action.error_handler,
			missing_data_handler: action.missing_data_handler,
			delimiter: delimiter,
		}



		importComplexTransactions(resolve, config, index, updateCounter)
	})
}

var processAction = function (action, file, delimiter, index, updateCounter) {
	return new Promise(function (resolve, reject) {
		if (action.skip) {
			resolve({
				config: {},
				data: {
					skip: true,
				},
			})
		} else {
			if (action.csv_import_scheme) {
				resolve(
					handleCsvImportAction(
						action.csv_import_scheme,
						file,
						delimiter,
						index,
						updateCounter
					)
				)
			}

			if (action.complex_transaction_import_scheme) {
				resolve(
					handleComplexTransactionImportAction(
						action.complex_transaction_import_scheme,
						file,
						delimiter,
						index,
						updateCounter
					)
				)
			}
		}
	})
}

var processActionOneByOne = function (
	resolve,
	result,
	actions,
	file,
	delimiter,
	index,
	updateCounter
) {
	processAction(actions[index], file, delimiter, index, updateCounter).then(
		function (res) {
			// ;

			result.configs[index] = res.config
			result.errors[index] = []

			if (res.data.hasOwnProperty('error_rows') && res.data.error_rows.length) {
				var errors = res.data.error_rows.filter(function (item) {
					return item.level === 'error'
				})

				if (errors.length) {
					result.errors[index] = errors
				}
			}

			if (res.data.hasOwnProperty('stats')) {
				if (res.data.stats) {
					var errors = res.data.stats.filter(function (item) {
						return item.level === 'error'
					})

					if (errors.length) {
						result.errors[index] = errors
					}
				}
			}

			result.import_results.push(res.data)

			index = index + 1

			updateCounter(index, res.config)

			if (index < actions.length) {
				processActionOneByOne(
					resolve,
					result,
					actions,
					file,
					delimiter,
					index,
					updateCounter
				)
			} else {
				resolve(result)
			}
		}
	)
}

var startImport = function (file, delimiter, scheme, updateCounter) {
	return new Promise(function (resolve, reject) {



		var result = {
			import_results: [],
			errors: [],
			configs: [],
		}

		if (scheme.actions.length) {
			var index = 0

			processActionOneByOne(
				resolve,
				result,
				scheme.actions,
				file,
				delimiter,
				index,
				updateCounter
			)
		} else {
			resolve(result)
		}
	})
}

export default {
	startImport: startImport,
}
