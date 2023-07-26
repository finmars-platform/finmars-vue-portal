/**
 * Created by szhitenev on 08.06.2016.
 */

import logService from '@/angular/../core/services/logService'

export default function ($scope, $mdDialog, metaContentTypesService, data) {
	logService.controller(
		'SimpleEntityImportErrorsDialogController',
		'initialized'
	)

	var vm = this

	vm.data = data

	vm.records = []

	vm.createFile = function () {
		var result = []

		var columns = ['Object', 'Issue', 'Reaction']

		var columnRow = columns
			.map(function (item) {
				return '"' + item + '"'
			})
			.join(',')

		result.push(columnRow)

		vm.records.forEach(function (errorItem) {
			var content = []

			content.push(vm.getName(errorItem))

			if (errorItem.error) {
				if (errorItem.error.message) {
					content.push('"' + errorItem.error.message + '"')
				} else {
					content.push('""')
				}
			} else {
				content.push('""')
			}

			content.push(errorItem.mode)

			result.push(content.join(','))
		})

		result = result.join('\n')

		return result
	}

	vm.setDownloadLink = function () {
		var link = document.querySelector('.download-error-link')

		var text = vm.createFile()

		var file = new Blob([text], { type: 'text/plain' })

		link.href = URL.createObjectURL(file)
		link.download = 'configuration_import_error_file.csv'
	}

	vm.getName = function (item) {
		var result = ''

		if (item.content_type) {
			result =
				result +
				metaContentTypesService.getEntityNameByContentType(item.content_type)
		}

		if (item.item) {
			result = result + ': '

			if (item.item.user_code) {
				result = result + item.item.user_code
			} else {
				if (item.item.short_name) {
					result =
						result + item.item.short_name + ' (' + item.item.user_code + ')'
				} else {
					if (item.item.user_code) {
						result = result + item.item.user_code
					} else {
						if (item.item.name) {
							result = result + item.item.name
						}
					}
				}
			}
		}

		return result
	}

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.agree = function () {
		$mdDialog.hide({ status: 'agree' })
	}

	vm.init = function () {


		Object.keys(vm.data.stats).forEach(function (sectionKey) {
			Object.keys(vm.data.stats[sectionKey]).forEach(function (entityKey) {
				vm.data.stats[sectionKey][entityKey].forEach(function (item) {
					vm.records.push(item)
				})
			})
		})



		setTimeout(function () {
			vm.setDownloadLink()
		}, 100)
	}

	vm.init()
}
