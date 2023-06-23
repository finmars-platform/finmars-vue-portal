/**
 * Created by szhitenev on 12.09.2016.
 */

import importEntityService from '../import/importEntityService'
import importTransactionService from '../../services/import/importTransactionService'

var importSimple = function (resolve, reject, config, index, updateCounter) {
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

	// console.log('action', action);

	importEntityService
		.validateImport(formData)
		.then(function (data) {
			config = data

			updateCounter(index, config)

			if (config.task_status === 'SUCCESS') {
				resolve({
					config: config,
					data: data,
				})
			} else {
				setTimeout(function () {
					importSimple(resolve, reject, config, index, updateCounter)
				}, 1000)
			}
		})
		.catch(function (e) {
			reject(e)
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

		// console.log('handleComplexTransactionImportAction.config', config)

		importSimple(resolve, reject, config, index, updateCounter)
	})
}

var importComplexTransactions = function (
	resolve,
	reject,
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

	importTransactionService
		.validateImport(formData)
		.then(function (data) {
			config = data

			updateCounter(index, config)

			if (config.task_status === 'SUCCESS') {
				resolve({
					config: config,
					data: data,
				})
			} else {
				setTimeout(function () {
					importComplexTransactions(
						resolve,
						reject,
						config,
						index,
						updateCounter
					)
				}, 1000)
			}
		})
		.catch(function (e) {
			reject(e)
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

		// console.log('handleComplexTransactionImportAction.config', config)

		importComplexTransactions(resolve, reject, config, index, updateCounter)
	})
}

var processAction = function (action, file, delimiter, index, updateCounter) {
	return new Promise(function (resolve) {
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
	reject,
	result,
	actions,
	file,
	delimiter,
	index,
	updateCounter
) {
	processAction(actions[index], file, delimiter, index, updateCounter)
		.then(function (res) {
			// console.log('processAction.res', res);
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
					reject,
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
		})
		.catch(function (e) {
			reject(e)
		})
}

var validateImport = function (file, delimiter, scheme, updateCounter) {
	return new Promise(function (resolve, reject) {
		// console.log('file', file);
		// console.log('config', scheme);

		var result = {
			import_results: [],
			errors: [],
			configs: [],
		}

		if (scheme.actions.length) {
			var index = 0

			processActionOneByOne(
				resolve,
				reject,
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
	validateImport: validateImport,
}
