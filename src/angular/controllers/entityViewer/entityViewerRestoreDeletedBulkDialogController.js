/**
 * Created by szhitenev on 16.05.2016.
 */

import entityResolverService from '../../services/entityResolverService'

export default function EntityViewerRestoreDeletedBulkDialogController(
	$scope,
	$mdDialog,
	data
) {
	var vm = this

	// vm.entityType = evDataService.getEntityType();
	var entityType = data.entityType
	var restoredItems = data.items

	vm.isDeleted = false

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.delete = function ($event) {
		/* var objects = evDataService.getObjects();

            var restoredItems  = objects
                .filter(function (item) {
                    return item.___is_activated && item.is_deleted;
                }).map(function (item) {

                    var name = item.name.split('(del) ')[1];
                    var short_name = item.short_name.split('(del) ')[1];

                    return {
                        id: item.id,
                        name: name,
                        short_name: short_name,
                        user_code: item.deleted_user_code,
                        is_deleted: false,
                        is_enabled: true,
                        is_active: true
                    }
                });*/

		var itemsIds = []

		restoredItems = restoredItems.map(function (item) {
			var name = item.name.split('(del) ')[1]
			var short_name = item.short_name.split('(del) ')[1]

			itemsIds.push(item.id)

			return {
				id: item.id,
				name: name,
				short_name: short_name,
				user_code: item.deleted_user_code,
				is_deleted: false,
				is_enabled: true,
				is_active: true,
			}
		})

		console.log('restoredItems', restoredItems)

		vm.processing = true
		vm.isDeleted = true

		entityResolverService
			.updateBulk(entityType, restoredItems)
			.then(function (data) {
				vm.processing = false

				$mdDialog.hide({ status: 'agree', data: { itemsIds: itemsIds } })
			})
			.catch(function (reason) {
				$mdDialog
					.show({
						controller: 'InfoDialogController as vm',
						templateUrl: 'views/info-dialog-view.html',
						parent: angular.element(document.body),
						targetEvent: $event,
						clickOutsideToClose: false,
						preserveScope: true,
						autoWrap: true,
						skipHide: true,
						multiple: true,
						locals: {
							info: {
								title: 'Warning',
								description: 'Something wrong. Please, try again later.',
							},
						},
					})
					.then(function (value) {
						$mdDialog.hide({ status: 'agree', data: {} })
					})
			})
	}
}
