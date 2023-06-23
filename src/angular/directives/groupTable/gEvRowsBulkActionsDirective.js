import evDataHelper from '../../helpers/ev-data.helper'

import evEvents from '../../services/entityViewerEvents'

export default function () {
	return {
		require: '^^gRowsBulkActions',
		restrict: 'E',
		scope: {
			evDataService: '=',
			evEventService: '=',
		},
		templateUrl: 'views/directives/groupTable/g-ev-rows-bulk-actions-view.html',
		link: function (scope, elem, attrs, ctrlVm) {
			const entityType = scope.evDataService.getEntityType()

			let optionsList = [
				{
					actionKey: 'delete',
					name: 'Delete',
				},
			]

			const bulkRestoreDeleted = {
				name: 'Restore',
				actionKey: 'bulk_restore_deleted',
			}

			if (entityType === 'complex-transaction') {
				optionsList = optionsList.concat([
					{
						actionKey: 'lock_transaction',
						name: 'Lock Transaction',
					},
					{
						actionKey: 'unlock_transaction',
						name: 'Unlock Transaction',
					},
					{
						actionKey: 'ignore_transaction',
						name: 'Ignore Transaction',
					},
					{
						actionKey: 'activate_transaction',
						name: 'Activate Transaction',
					},
				])
			} else if (entityType === 'instrument') {
				optionsList = optionsList.concat([
					{
						name: 'Deactivate',
						actionKey: 'deactivate_instrument',
					},
					{
						name: 'Activate',
						actionKey: 'activate_instrument',
					},
				])

				optionsList.push(bulkRestoreDeleted)
			} else if (
				!['complex-transaction', 'price-history', 'currency-history'].includes(
					entityType
				)
			) {
				optionsList.push(bulkRestoreDeleted)
			}

			const selectOption = function (option, _$popup, $event) {
				_$popup.cancel()

				let actionData = { actionKey: option.actionKey }

				actionData.event = $event

				/* ctrlVm.evDataService.setActiveObjectAction(actionData);
					ctrlVm.evDataService.setActiveObjectActionData(actionData); */
				scope.evDataService.setRowsActionData(actionData)

				scope.evEventService.dispatchEvent(evEvents.ROWS_ACTION_FIRED)
			}

			scope.popupData = {
				selectOption: selectOption,
				options: optionsList,
			}
		},
	}
}
