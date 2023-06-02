/**
 * Created by vzubr on 18.05.2021.
 */

import attributeTypeService from '@/angular/services/attributeTypeService'
import evEditorEvents from '@/angular/services/ev-editor/entityViewerEditorEvents'

import entityEditorHelper from '@/angularlpers/entity-editor.helper'

export default function instrumentTypeUserAttributesTabController(
	$scope,
	$mdDialog
) {
	var vm = this
	vm.entity = $scope.$parent.vm.entity
	vm.entityType = $scope.$parent.vm.entityType

	vm.evEditorDataService = $scope.$parent.vm.evEditorDataService
	vm.evEditorEventService = $scope.$parent.vm.evEditorEventService

	vm.instrumentAttrTypes = []
	vm.instrumentTypeAttrs = []

	if (!vm.entity.instrument_attributes) {
		vm.entity.instrument_attributes = []
	}

	vm.readyStatus = {
		attrs: false,
		instrumentTypeAttrs: false,
	}

	const mapAttrsFromEntity = (attrs, entityAttrs) => {
		attrs.forEach((it) => {
			it.___classifierName = null
		})

		const deletedAttrs = [] // Attrs which deleted in user attributes, but it remained in entity.

		entityAttrs.forEach((entityAttr) => {
			const user_code = entityAttr.attribute_type_user_code
			const attr = attrs.find((attr) => attr.user_code === user_code)
			const value = entityEditorHelper.instrumentTypeAttrValueMapper(entityAttr)

			let additionalProps = {
				value,
			}

			if (entityAttr.value_type === 30)
				additionalProps.___classifierName = attr.value ? attr.value : ''

			if (attr) {
				Object.assign(attr, additionalProps)
			} else {
				deletedAttrs.push({
					user_code,
					name: user_code,
					...entityAttr,
					...additionalProps,
					___isDisabled: true,
				})
			}
		})

		return attrs.concat(deletedAttrs).sort((a, b) => {
			return a.name.toUpperCase() < b.name.toUpperCase() ? -1 : 1
		})
	}

	const getList = () => {
		vm.readyStatus.attrs = false
		vm.readyStatus.instrumentTypeAttrs = false

		attributeTypeService
			.getList('instrument', { pageSize: 1000 })
			.then((data) => {
				const instrumentAttrs = data.results

				vm.instrumentAttrTypes = mapAttrsFromEntity(
					instrumentAttrs,
					vm.entity.instrument_attributes
				)

				vm.readyStatus.attrs = true
			})

		attributeTypeService
			.getList(vm.entityType, { pageSize: 1000 })
			.then((data) => {
				vm.instrumentTypeAttrs = data.results
				vm.readyStatus.instrumentTypeAttrs = true
			})
	}

	vm.deleteAttr = function (ev, item) {
		var description = 'Are you sure to delete attribute ' + item.name + ' ?'

		$mdDialog
			.show({
				controller: 'WarningDialogController as vm',
				templateUrl: 'views/dialogs/warning-dialog-view.html',
				parent: angular.element(document.body),
				targetEvent: ev,
				clickOutsideToClose: false,
				locals: {
					warning: {
						title: 'Warning',
						description: description,
					},
				},
				multiple: true,
			})
			.then(function (res) {
				if (res.status === 'agree') {
					const deletedItemIndex = vm.entity.instrument_attributes.findIndex(
						(attr) => attr.id === item.id
					)
					vm.entity.instrument_attributes.splice(deletedItemIndex, 1)

					getList()
				}
			})
	}

	vm.attrChange = function () {
		vm.entity.instrument_attributes = vm.instrumentAttrTypes
			.filter((attr) => !!attr.value)
			.map((attr) => {
				const result = {
					attribute_type_user_code: attr.user_code,
					value_type: attr.value_type,
					value_string: null,
					value_float: null,
					value_date: null,
					value_classifier: null,
				}

				switch (attr.value_type) {
					case 10:
						result.value_string = attr.value
						break
					case 20:
						result.value_float = attr.value
						break
					case 30:
						result.value_classifier = attr.value
						break
					case 40:
						result.value_date = attr.value
						break
				}

				return result
			})
	}

	vm.clearSelector = function (attr) {
		attr.value = null
		vm.attrChange()
	}

	const init = function () {
		vm.evEditorEventService.addEventListener(
			evEditorEvents.ENTITY_UPDATED,
			function () {
				vm.entity = $scope.$parent.vm.entity
			}
		)

		getList()
	}

	init()
}
