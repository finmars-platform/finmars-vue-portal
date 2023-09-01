/**
 * Created by szhitenev on 28.06.2016.
 */

export default function ($scope, $mdDialog, instrumentService) {
	var vm = this

	vm.search = {
		user_code: '',
		name: '',
		short_name: '',
		user_text_1: '',
		user_text_2: '',
		user_text_3: '',
	}

	vm.instruments = []
	vm.selectedItem = {}

	vm.agree = function () {
		$mdDialog.hide({ status: 'agree', data: { item: vm.selectedItem } })
	}

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.selectRow = function (item) {
		vm.instruments.forEach(function (item) {
			item.active = false
		})
		vm.selectedItem = item
		item.active = true
	}

	vm.selectAndSave = function (item) {
		$mdDialog.hide({ status: 'agree', data: { item: item } })
	}

	instrumentService.getList({ filters: vm.search }).then(function (data) {
		vm.instruments = data.results
		$scope.$apply()
	})

	vm.updateTable = function () {
		instrumentService.getList({ filters: vm.search }).then(function (data) {
			vm.instruments = data.results
			$scope.$apply()
		})
	}
}
