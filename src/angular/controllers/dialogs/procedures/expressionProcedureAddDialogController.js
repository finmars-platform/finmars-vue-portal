/**
 * Created by szhitenev on 23.06.2022.
 */

import expressionProcedureService from '@/angular/services/procedures/expressionProcedureService'

export default function ($scope, $mdDialog, data) {
	var vm = this

	vm.item = {}

	vm.schemes = []
	vm.providers = []

	vm.readyStatus = { procedure: false }

	vm.toggleStatus = {
		date_from: 'datepicker',
		date_to: 'datepicker',
	}

	vm.toggle = function (key) {
		if (vm.toggleStatus[key] === 'datepicker') {
			vm.toggleStatus[key] = 'expr'
		} else {
			vm.toggleStatus[key] = 'datepicker'
		}

		vm.item[key] = null
		vm.item[key + '_expr'] = null
	}

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.agree = function () {
		vm.item.code = vm.editor.getValue()

		expressionProcedureService.create(vm.item).then(function (data) {
			$mdDialog.hide({ status: 'agree', data: { item: data } })
		})
	}

	vm.universalOptionsChange = function () {
		vm.item.data = JSON.parse(vm.item.data_string)
	}

	vm.universalFieldChange = function () {
		vm.item.data_string = JSON.stringify(vm.item.data, 0, 4)
	}

	vm.initExpressionEditor = function () {
		setTimeout(function () {
			vm.editor = ace.edit('aceEditor')
			vm.editor.setTheme('ace/theme/monokai')
			vm.editor.getSession().setMode('ace/mode/python')
			vm.editor.getSession().setUseWorker(false)
			vm.editor.setHighlightActiveLine(false)
			vm.editor.setShowPrintMargin(false)

			ace.require('ace/ext/language_tools')
			vm.editor.setOptions({
				enableBasicAutocompletion: true,
				enableLiveAutocompletion: true,
				enableSnippets: true,
			})
			vm.editor.setFontSize(14)
			vm.editor.setBehavioursEnabled(true)
			vm.editor.setValue(vm.item.code)

			vm.editor.focus()
			vm.editor.navigateFileStart()
		}, 100)
	}

	vm.init = function () {
		vm.initExpressionEditor()

		vm.readyStatus.procedure = true
	}

	vm.init()
}
