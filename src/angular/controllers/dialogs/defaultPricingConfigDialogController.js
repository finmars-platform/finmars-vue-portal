/**
 * Created by mevstratov on 21.02.2019.
 */

import instrumentDailyPricingModelService from '../../services/instrument/instrumentDailyPricingModelService'

export default function ($scope, $mdDialog) {
	var vm = this

	instrumentDailyPricingModelService.getList().then(function (data) {
		vm.dailyPricingModels = data
		$scope.$apply(function () {
			setTimeout(function () {
				$('body')
					.find('.md-select-search-pattern')
					.on('keydown', function (ev) {
						ev.stopPropagation()
					})
			}, 100)
		})
	})

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}
}
