/**
 * Created by szhitenev on 08.06.2016.
 */

import referenceTablesService from '../../services/referenceTablesService'

export default function ($scope, $mdDialog, data) {
	var vm = this

	vm.item = data.item

	vm.filename = ''

	console.log('vm.item', vm.item)

	vm.readyStatus = { content: false }

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.setDownloadLink = function () {
		var link = document.querySelector('.export-reference-table-link')

		var text = 'Reference Table: ' + vm.item.name + '\n'

		vm.referenceTable.rows.forEach(function (item) {
			text = text + item.key + ',' + item.value + '\n'
		})

		var file = new Blob([text], { type: 'text/plain' })

		link.href = URL.createObjectURL(file)

		link.addEventListener('click', function () {
			if (vm.filename) {
				link.download = vm.filename + '.csv'
			} else {
				link.download = 'Reference Table ' + vm.item.name + '.csv'
			}

			$mdDialog.hide()
		})
	}

	vm.getReferenceTable = function () {
		vm.readyStatus.content = false

		referenceTablesService.getByKey(vm.item.id).then(function (data) {
			vm.referenceTable = data

			vm.readyStatus.content = true

			$scope.$apply()

			vm.setDownloadLink()
		})
	}

	vm.init = function () {
		vm.getReferenceTable()
	}

	vm.init()
}
