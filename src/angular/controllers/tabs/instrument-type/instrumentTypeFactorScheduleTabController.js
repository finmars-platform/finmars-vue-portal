/**
 * Created by szhitenev on 22.12.2021.
 *
 * TO DELETE: 2021-12-30 instrumentTypeFactorsTabController.js is used instead
 */

import evEditorEvents from '@/angular/services/ev-editor/entityViewerEditorEvents'

export default function ($scope) {
	var vm = this

	vm.entity = $scope.$parent.vm.entity

	vm.evEditorEventService = $scope.$parent.vm.evEditorEventService

	vm.newItem = {}
	vm.newItem.date = moment(new Date()).format('YYYY-MM-DD')

	vm.toggleQuery = function () {
		vm.queryStatus = !vm.queryStatus
		vm.query = {}
	}

	vm.setSort = function (propertyName) {
		vm.direction = vm.sort === propertyName ? !vm.direction : false
		vm.sort = propertyName
	}

	vm.editItem = function (item) {
		item.editStatus = true
	}

	vm.saveItem = function (item) {
		item.editStatus = false
	}

	vm.deleteItem = function (item, index) {
		vm.entity.instrument_factor_schedules.splice(index, 1)
	}

	vm.addRow = function () {
		vm.entity.instrument_factor_schedules.push({
			position_factor_value: vm.newItem.position_factor_value,
			factor_value1: vm.newItem.factor_value1,
			factor_value2: vm.newItem.factor_value2,
			factor_value3: vm.newItem.factor_value3,
			effective_date: moment(new Date(vm.newItem.date)).format('YYYY-MM-DD'),
		})

		vm.newItem.position_factor_value = null
		vm.newItem.factor_value1 = null
		vm.newItem.factor_value2 = null
		vm.newItem.factor_value3 = null
		vm.newItem.date = null
	}

	vm.evEditorEventService.addEventListener(
		evEditorEvents.ENTITY_UPDATED,
		function () {
			vm.entity = $scope.$parent.vm.entity
		}
	)
}
