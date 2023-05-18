/**
 * Created by szhitenev on 08.06.2016.
 */

import logService from '@/angular/core/services/logService'
import attributeTypeService from '../../services/attributeTypeService'
import entityTypeClassifierMappingResolveService from '../../services/entityTypeClassifierMappingResolveService'

export default function ($scope, $mdDialog, options) {
	logService.controller(
		'EntityTypeClassifierMappingDialogController',
		'initialized'
	)

	var vm = this

	vm.init = function () {
		vm.readyStatus = { content: false }
		vm.items = []
		vm.options = options

		vm.getClassifier()
	}

	vm.getClassifier = function () {
		attributeTypeService
			.getByKey(vm.options.entityType, vm.options.id)
			.then(function (data) {
				vm.classifier = data

				vm.items = data.classifiers_flat

				entityTypeClassifierMappingResolveService
					.getList(vm.options.entityType, vm.options.id)
					.then(function (data) {
						var mappingItems = data.results

						vm.items = vm.items.map(function (item) {
							item.mapping = []

							mappingItems.forEach(function (mapItem) {
								if (mapItem.content_object === item.id) {
									item.mapping.push(mapItem)
								}
							})

							return item
						})

						vm.items = vm.items.map(function (item) {
							if (!item.mapping.length) {
								item.mapping = [{ value: '' }]
							}

							return item
						})

						vm.readyStatus.content = true

						$scope.$apply()
					})
			})
	}

	vm.toggleQuery = function () {
		vm.queryStatus = !vm.queryStatus
		vm.query = {}
	}

	vm.setSort = function (propertyName) {
		vm.direction = vm.sort === propertyName ? !vm.direction : false
		vm.sort = propertyName
	}

	vm.addMapping = function (item, index) {
		item.mapping.splice(index, 0, { value: '' })
	}

	vm.removeMapping = function (item, mappingItem, index) {
		if (mappingItem.hasOwnProperty('id')) {
			mappingItem.isDeleted = true
		} else {
			item.mapping.splice(index, 1)
		}
	}

	vm.fancyEntity = function () {
		return vm.options.entityType
	}

	vm.getAction = function (mapItem) {
		if (!mapItem.hasOwnProperty('id')) {
			return 'create'
		}

		if (mapItem.isDeleted === true) {
			return 'delete'
		}

		return 'update'
	}

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.agree = function () {
		vm.items.forEach(function (item) {
			item.mapping.forEach(function (mapItem) {
				var action = vm.getAction(mapItem)

				mapItem.provider = 1 //TODO fix it later?
				mapItem.content_object = item.id
				mapItem.attribute_type = vm.classifier.id

				if (action === 'create' && mapItem.value) {
					entityTypeClassifierMappingResolveService.create(
						vm.options.entityType,
						mapItem
					)
				}

				if (action === 'update') {
					if (mapItem.value) {
						entityTypeClassifierMappingResolveService.update(
							vm.options.entityType,
							mapItem.id,
							mapItem
						)
					} else {
						entityTypeClassifierMappingResolveService.deleteByKey(
							vm.options.entityType,
							mapItem.id
						)
					}
				}

				if (action === 'delete') {
					entityTypeClassifierMappingResolveService.deleteByKey(
						vm.options.entityType,
						mapItem.id
					)
				}
			})
		})

		$mdDialog.hide({ status: 'agree' })
	}

	vm.init()
}
