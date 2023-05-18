/**
 * Created by szhitenev on 11.07.2022.
 */

import downloadFileHelper from '../../helpers/downloadFileHelper'
import metaHelper from '../../helpers/meta.helper'

export default function ($scope, $mdDialog, data) {
	var vm = this

	console.log('filePreviewDialogController data', data)

	vm.data = data

	vm.contentType = 'json'

	vm.download = function () {
		var content = vm.data.content

		if (typeof vm.data.content === 'object') {
			content = JSON.stringify(vm.data.content, null, 4)
		}

		var name = 'file'

		if (vm.data.file_descriptor) {
			name = vm.data.file_descriptor.name
		}

		if (vm.data.info && vm.data.info.file_report_object) {
			name = vm.data.info.file_report_object.name
		}

		downloadFileHelper.downloadFile(content, 'application/force-download', name)
	}

	vm.agree = function () {
		$mdDialog.hide({ status: 'agree' })
	}

	vm.initJsonEditor = function () {
		setTimeout(function () {
			vm.editor = ace.edit('filePreviewAceEditor')
			vm.editor.setTheme('ace/theme/monokai')
			vm.editor.getSession().setMode('ace/mode/json')
			vm.editor.getSession().setUseWorker(false)
			vm.editor.setHighlightActiveLine(false)
			vm.editor.setShowPrintMargin(false)
			ace.require('ace/ext/language_tools')
			vm.editor.setOptions({
				enableBasicAutocompletion: true,
				enableSnippets: true,
			})
			vm.editor.setFontSize(14)
			vm.editor.setBehavioursEnabled(true)
			vm.editor.setValue(vm.data.content_formatted)

			vm.editor.focus()
			vm.editor.navigateFileStart()
		}, 100)
	}

	vm.initYamlEditor = function () {
		setTimeout(function () {
			vm.editor = ace.edit('filePreviewAceEditor')
			vm.editor.setTheme('ace/theme/monokai')
			vm.editor.getSession().setMode('ace/mode/yaml')
			vm.editor.getSession().setUseWorker(false)
			vm.editor.setHighlightActiveLine(false)
			vm.editor.setShowPrintMargin(false)
			ace.require('ace/ext/language_tools')
			vm.editor.setOptions({
				enableBasicAutocompletion: true,
				enableSnippets: true,
			})
			vm.editor.setFontSize(14)
			vm.editor.setBehavioursEnabled(true)
			vm.editor.setValue(vm.data.content_formatted)

			vm.editor.focus()
			vm.editor.navigateFileStart()
		}, 100)
	}

	vm.initPythonEditor = function () {
		setTimeout(function () {
			vm.editor = ace.edit('filePreviewAceEditor')
			vm.editor.setTheme('ace/theme/monokai')
			vm.editor.getSession().setMode('ace/mode/python')
			vm.editor.getSession().setUseWorker(false)
			vm.editor.setHighlightActiveLine(false)
			vm.editor.setShowPrintMargin(false)
			ace.require('ace/ext/language_tools')
			vm.editor.setOptions({
				enableBasicAutocompletion: true,
				enableSnippets: true,
			})
			vm.editor.setFontSize(14)
			vm.editor.setBehavioursEnabled(true)
			vm.editor.setValue(vm.data.content_formatted)

			vm.editor.focus()
			vm.editor.navigateFileStart()
		}, 100)
	}

	vm.formatCSV = function () {
		var result = ''

		var lines = vm.data.content.split(/\r?\n/)

		result = '<table><tbody>'

		lines.forEach(function (line) {
			var pieces = line.split(',')

			result = result + '<tr>'

			pieces.forEach(function (piece) {
				result = result + '<td>' + piece + '</td>'
			})

			result = result + '</tr>'
		})

		result = result + '</tbody></table>'

		return result
	}

	vm.copyContent = function (content) {
		metaHelper.copyToBuffer(content)
	}

	vm.formatContent = function () {
		var name = ''

		if (vm.data.file_descriptor) {
			name = vm.data.file_descriptor.name
		}

		if (vm.data.info && vm.data.info.file_report_object) {
			name = vm.data.info.file_report_object.name
		}

		if (name.indexOf('.csv') !== -1) {
			vm.contentType = 'csv'

			vm.data.content_formatted = vm.formatCSV()
		} else if (name.indexOf('.json') !== -1) {
			vm.contentType = 'json'

			vm.data.content_formatted = JSON.stringify(vm.data.content, null, 4)

			vm.initJsonEditor()
		} else if (name.indexOf('.py') !== -1) {
			vm.contentType = 'python'

			vm.data.content_formatted = vm.data.content

			vm.initPythonEditor()
		} else if (name.indexOf('.yml') !== -1 || name.indexOf('.yaml') !== -1) {
			vm.contentType = 'yaml'

			vm.data.content_formatted = vm.data.content

			vm.initYamlEditor()
		} else if (name.indexOf('.txt') !== -1) {
			vm.contentType = 'text'

			vm.data.content_formatted = vm.data.content
		} else if (name.indexOf('.log') !== -1) {
			vm.contentType = 'text'

			vm.data.content_formatted = vm.data.content
		} else if (
			name.indexOf('.png') !== -1 ||
			name.indexOf('.jpg') !== -1 ||
			name.indexOf('.gif') !== -1
		) {
			vm.contentType = 'image'

			var urlCreator = window.URL || window.webkitURL
			var imageUrl = urlCreator.createObjectURL(vm.data.blob)
			document.querySelector('#preview-image').src = imageUrl
		}
	}

	vm.readBlob = function () {
		var reader = new FileReader()

		reader.addEventListener('loadend', function (e) {
			vm.data.content = reader.result

			vm.formatContent()

			$scope.$apply()
		})

		reader.readAsText(vm.data.blob)
	}

	vm.init = function () {
		if (vm.data.blob) {
			vm.readBlob()
		} else {
			vm.formatContent()
		}
	}

	vm.init()
}
