/**
 * Created by mevstratov on 11.07.2019.
 */

import evEvents from '../../services/entityViewerEvents'

export default function (
	$scope,
	$mdDialog,
	entityViewerDataService,
	entityViewerEventService
) {
	var vm = this

	vm.entityType = entityViewerDataService.getEntityType()
	vm.multiselectorOptions = []

	var pagePagination = entityViewerDataService.getPagination()

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	var getMultiselectorData = function () {
		var result = {
			optionsList: [],
			selectedByDefault: [],
		}

		switch (vm.entityType) {
			case 'instrument':
				result.optionsList = [
					{ value: 'active', name: 'Active', activeByDefault: '' },
					{ value: 'inactive', name: 'Inactive', activeByDefault: '' },
					{ value: 'disabled', name: 'Disabled', activeByDefault: '' },
					{ value: 'deleted', name: 'Deleted', activeByDefault: '' },
				]

				result.selectedByDefault = ['active', 'inactive', 'disabled']

				break

			case 'complex-transaction':
				result.optionsList = [
					{ value: 'locked', name: 'Locked' },
					{ value: 'unlocked', name: 'Unlocked' },
					{ value: 'ignored', name: 'Ignored' },
					{ value: 'partially_visible', name: 'Partially Visible' },
				]

				result.selectedByDefault = ['locked', 'unlocked']

				break

			default:
				result.optionsList = [
					{ value: 'enabled', name: 'Enabled' },
					{ value: 'disabled', name: 'Disabled' },
					{ value: 'deleted', name: 'Deleted' },
				]

				result.selectedByDefault = ['enabled', 'disabled']

				break
		}

		return result
	}

	vm.saveSettings = function () {
		if (pagePagination.page_size !== vm.itemsToLoad) {
			pagePagination = entityViewerDataService.getPagination()
			pagePagination.page_size = vm.itemsToLoad

			entityViewerDataService.setPagination(pagePagination)

			entityViewerEventService.dispatchEvent(
				evEvents.ENTITY_VIEWER_PAGINATION_CHANGED
			)
		}

		var entityViewerOptions = {}
		//entityViewerOptions.complex_transaction_filters = vm.complexTransactionFilters;
		entityViewerOptions.entity_filters = vm.entityFilters
		if (vm.entityType === 'complex-transaction') {
			entityViewerOptions.complex_transaction_filters =
				vm.complexTransactionFilters
		}

		entityViewerDataService.setEntityViewerOptions(entityViewerOptions)

		$mdDialog.hide({ status: 'agree' })
	}

	var init = function () {
		var entityViewerOptions = entityViewerDataService.getEntityViewerOptions()



		var multselData = getMultiselectorData()
		vm.multiselectorOptions = multselData.optionsList
		//vm.complexTransactionFilters = entityViewerOptions.complex_transaction_filters;
		vm.entityFilters = entityViewerOptions.entity_filters
		if (vm.entityType === 'complex-transaction') {
			vm.complexTransactionFilters =
				entityViewerOptions.complex_transaction_filters
		} else {
			vm.complexTransactionFilters = ['booked']
		}



		// DEPRECATED
		// if (vm.entityType === "complex-transaction" && entityViewerOptions.complex_transaction_filters) {
		// 	vm.entityFilters = entityViewerOptions.complex_transaction_filters;
		// }

		if (!vm.entityFilters) {
			vm.entityFilters = multselData.selectedByDefault
		}


		vm.itemsToLoad = pagePagination.page_size
	}

	init()
}
