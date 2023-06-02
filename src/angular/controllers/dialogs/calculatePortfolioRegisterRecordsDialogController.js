/**
 * Created by szhitenev on 26.07.2021.
 */

import portfolioRegisterService from '../../services/portfolioRegisterService'

export default function ($scope, $mdDialog, data) {
	var vm = this

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.agree = function () {
		var ids = []

		vm.portfolioRegisters.forEach(function (item) {
			if (item.checked) {
				ids.push(item.id)
			}
		})

		if (ids) {
			portfolioRegisterService
				.calculateRecords({ portfolio_register_ids: ids })
				.then(function (data) {
					$mdDialog.hide({ status: 'agree' })
				})
		} else {
			$mdDialog.hide({ status: 'agree' })
		}
	}

	vm.getPortfolioRegisters = function () {
		portfolioRegisterService.getList().then(function (data) {
			vm.portfolioRegisters = data.results
			$scope.$apply()
		})
	}

	vm.init = function () {
		vm.getPortfolioRegisters()
	}

	vm.init()
}
