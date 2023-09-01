/**
 * Created by mevstratov on 07.05.2021.
 */

export default function ($scope, $mdDialog, item, data) {
	var vm = this

	vm.item = JSON.parse(JSON.stringify(item))
	vm.entityType = vm.item.settings.entity_type

	if (!vm.item.user_settings) {
		vm.item.user_settings = {}
	}

	vm.abscissaSearchTerm = ''
	vm.ordinateSearchTerm = ''
	vm.abscissaSearchTerm = ''

	vm.availableTitleColumnAttrs =
		vm.item.user_settings.available_title_column_keys
	vm.availableValueColumnAttrs =
		vm.item.user_settings.available_value_column_keys

	vm.linkedToComps = []
	vm.linkedByComps = []

	var linkedToCompsIds = vm.item.settings.linked_components.active_object
	var dashboardComponents = data.dashboardComponents

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

	vm.titleColumnFilterExpr = function (item) {
		return selectFilterComparator(item, vm.titleColumnSearchTerm)
	}

	vm.valueColumnFilterExpr = function (item) {
		return selectFilterComparator(item, vm.valueColumnSearchTerm)
	}

	vm.openNumberFormatSettings = function ($event) {
		$mdDialog
			.show({
				controller: 'NumberFormatSettingsDialogController as vm',
				templateUrl: 'views/dialogs/number-format-settings-dialog-view.html',
				targetEvent: $event,
				multiple: true,
				locals: {
					data: {
						settings: vm.item.settings.number_format,
					},
				},
			})
			.then(function (res) {
				if (res.status === 'agree') {
					vm.item.settings.number_format = res.data
				}
			})
	}

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
}
