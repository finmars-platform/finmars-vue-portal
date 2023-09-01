/**
 * Created by szhitenev on 23.06.2022.
 */

import expressionProcedureService from '@/angular/services/procedures/expressionProcedureService'

export default function ($scope, $mdDialog, data) {
	var vm = this

	vm.itemId = data.item.id

	vm.entityType = 'expression-procedure'

	vm.readyStatus = { procedure: false }

	vm.item = {}

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

		expressionProcedureService
			.update(vm.item.id, vm.item)
			.then(function (data) {
				$mdDialog.hide({ status: 'agree', data: { item: data } })
			})
	}

	vm.getItem = function () {
		expressionProcedureService.getByKey(vm.itemId).then(function (data) {
			vm.originalItem = JSON.parse(JSON.stringify(data))

			vm.item = data

			vm.item.data_string = JSON.stringify(vm.item.data, 0, 4)

			vm.readyStatus.procedure = true

			if (vm.item.date_from_expr) {
				vm.toggleStatus['date_from'] = 'expr'
			} else {
				vm.toggleStatus['date_from'] = 'datepicker'
			}

			if (vm.item.date_to_expr) {
				vm.toggleStatus['date_to'] = 'expr'
			} else {
				vm.toggleStatus['date_to'] = 'datepicker'
			}

			vm.initExpressionEditor()

			$scope.$apply()
		})
	}

	vm.universalOptionsChange = function () {
		vm.item.data = JSON.parse(vm.item.data_string)
	}

	vm.universalFieldChange = function () {
		vm.item.data_string = JSON.stringify(vm.item.data, 0, 4)
	}

	vm.addContextVariable = function () {
		if (!vm.item.context_variables) {
			vm.item.context_variables = []
		}

		vm.item.context_variables.push({
			order: vm.item.context_variables.length,
		})
	}

	vm.deleteContextVariable = function ($event, $index) {
		vm.item.context_variables.splice($index, 1)
	}

	vm.editAsJson = function (ev) {
		$mdDialog
			.show({
				controller: 'EntityAsJsonEditorDialogController as vm',
				templateUrl: 'views/dialogs/entity-as-json-editor-dialog-view.html',
				targetEvent: ev,
				multiple: true,
				locals: {
					data: {
						item: vm.originalItem,
						entityType: vm.entityType,
					},
				},
			})
			.then(function (res) {
				if (res.status === 'agree') {
					vm.getItem()
				}
			})
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
		vm.getItem()
	}

	vm.init()
}
