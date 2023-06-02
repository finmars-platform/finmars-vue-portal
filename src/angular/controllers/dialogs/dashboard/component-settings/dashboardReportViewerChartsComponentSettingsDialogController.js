/**
 * Created by mevstratov on 06.01.2020.
 */

export default function ($scope, $mdDialog, item, data) {
	var vm = this

	vm.item = JSON.parse(JSON.stringify(item))
	vm.entityType = vm.item.settings.entity_type

	if (!vm.item.user_settings) {
		vm.item.user_settings = {}
	}

	vm.availableAttrs = vm.item.user_settings.available_attrs_keys
	vm.availableNumericAttrs = vm.item.user_settings.available_numeric_attrs_keys

	vm.linkedToComps = []
	vm.linkedByComps = []

	var linkedToCompsIds = vm.item.settings.linked_components.active_object
	var dashboardComponents = data.dashboardComponents

	vm.chartType = vm.item.type

	vm.valuesSearchTerm = ''
	vm.categoriesSearchTerm = ''

	vm.getSelectName = function (attr) {
		if (attr.layout_name) {
			return attr.layout_name
		}

		return attr.attribute_data.name
	}

	var selectFilterComparator = function (item, searchTerms) {
		if (item && searchTerms) {
			var optionName

			if (item.layout_name) {
				optionName = item.layout_name.toLowerCase()
			} else if (item.attribute_data) {
				optionName = item.attribute_data.name.toLowerCase()
			}

			return optionName.indexOf(searchTerms.toLowerCase()) !== -1
		}

		return true
	}

	vm.valuesFilterExpr = function (item) {
		return selectFilterComparator(item, vm.valuesSearchTerm)
	}

	vm.categoriesFilterExpr = function (item) {
		return selectFilterComparator(item, vm.categoriesSearchTerm)
	}

	/*var getAttributes = function () {

            var attributes = attributeDataService.getAllAttributesByEntityType(vm.entityType);

            var numericAttributes = attributeDataService.getAllAttributesByEntityType(vm.entityType).filter(function (item) {
                return item.value_type === 20;
            });

            if (availableAttrs && availableAttrs.length > 0) {
                vm.availableAttrs = attributes.filter(function (item) {
                    return availableAttrs.indexOf(item.key) !== -1;
                });
            }

            if (availableNumericAttrs && availableNumericAttrs.length > 0) {
                vm.availableNumericAttrs = numericAttributes.filter(function (item) {
                    return availableNumericAttrs.indexOf(item.key) !== -1;
                });
            }

        };*/

	var init = function () {
		// Scripts for LINKING tab
		if (Array.isArray(linkedToCompsIds)) {
			linkedToCompsIds.forEach(function (compId) {
				for (var i = 0; i < dashboardComponents.length; i++) {
					if (dashboardComponents[i].id === compId) {
						vm.linkedToComps.push(dashboardComponents[i].name)
						break
					}
				}
			})
		}

		dashboardComponents.forEach(function (comp) {
			if (
				comp.settings.linked_components &&
				comp.settings.linked_components.active_object
			) {
				var linkedTo = comp.settings.linked_components.active_object

				if (linkedTo.indexOf(vm.item.id) > -1) {
					vm.linkedByComps.push(comp.name)
				}
			}
		})
		// < Scripts for LINKING tab >
	}

	init()

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.agree = function (actionAfterClosing) {
		$mdDialog.hide({
			status: 'agree',
			data: {
				item: vm.item,
			},
			action: actionAfterClosing,
		})
	}

	//getAttributes();
}
