/**
 * Created by szhitenev on 16.05.2016.
 */

import entityResolverService from '../../services/entityResolverService'

export default function EntityViewerDeleteBulkDialogController(
	$scope,
	$mdDialog,
	evDataService,
	evEventService,
	data
) {
	var vm = this

	vm.entityType = evDataService.getEntityType()

	vm.isDeleted = false

	var idsToDelete = []

	if (data) {
		idsToDelete = data.idsToDelete || []
	}

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.delete = function ($event) {
		var objects = evDataService.getObjects()

		var ids = objects
			.filter(function (item) {
				return item.___is_activated
			})
			.map(function (item) {
				return item.id
			})

		idsToDelete.forEach(function (id) {
			if (ids.indexOf(id) === -1) {
				ids.push(id)
			}
		})



		vm.processing = true
		vm.isDeleted = true

		var deleteProm

		if (ids.length > 1) {
			deleteProm = entityResolverService.deleteBulk(vm.entityType, {
				ids: ids,
			})
		} else {
			deleteProm = entityResolverService.deleteByKey(vm.entityType, ids[0])
		}

		deleteProm
			.then(function (data) {
				vm.processing = false

				$mdDialog.hide({ status: 'agree', data: { ids: ids } })
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
						$mdDialog.hide({ status: 'agree', data: { ids: [] } })
					})
			})
	}
}
