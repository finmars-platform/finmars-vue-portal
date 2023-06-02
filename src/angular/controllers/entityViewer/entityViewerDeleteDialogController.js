/**
 * Created by szhitenev on 16.05.2016.
 */

import logService from '@/angular/core/services/logService'

import entityResolverService from '../../services/entityResolverService'

export default function ($scope, $mdDialog, entity, entityType) {
	logService.controller('EntityViewerDeleteDialogController', 'initialized')

	var vm = this
	console.log('vm.entity', entity)
	vm.entity = entity
	vm.entityType = entityType

	vm.displayCaption = function () {
		if (vm.entity.name) {
			return vm.entity.name
		}
		return 'item'
	}

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.delete = function () {
		entityResolverService
			.deleteByKey(vm.entityType, vm.entity.id)
			.then(function (data) {
				console.log('deleted!', data)

				$mdDialog.hide({ status: 'agree', data: { id: vm.entity.id } })
			})
	}
}
