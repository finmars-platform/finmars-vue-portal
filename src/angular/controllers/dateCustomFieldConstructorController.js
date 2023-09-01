/**
 * Created by szhitenev on 20.02.2017.
 */

import logService from '@/angular/core/services/logService'

export default function ($scope) {
	logService.controller('DateCustomFieldConstructorController', 'initialized')

	var vm = this

	vm.rangeItems = $scope.$parent.vm.rangeItems
	vm.dateRange = $scope.$parent.vm.dateRange

	$scope.$parent.vm.rangeType = 40

	if (!vm.rangeItems) {
		vm.rangeItems = []
	}

	if (!vm.rangeItems.length) {
		vm.rangeItems.push({})
	}
}
