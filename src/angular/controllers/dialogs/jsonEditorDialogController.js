/**
 * Created by szhitenev on 30.06.2022.
 */

export default function ($scope, $mdDialog, item, data) {
	var vm = this

	vm.item = item
	vm.data = data

	vm.init = function () {
		setTimeout(function () {
			vm.editor = ace.edit('aceEditor')
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
			vm.editor.setValue(vm.item.expression)

			vm.editor.focus()
			vm.editor.navigateFileStart()
		}, 100)
	}

	vm.init()

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.agree = function () {
		vm.item.expression = vm.editor.getValue()

		$mdDialog.hide({ status: 'agree', data: { item: vm.item } })
	}
}
