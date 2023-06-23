export default function ($scope, $mdDialog, item, data) {
	var vm = this

	vm.item = JSON.parse(JSON.stringify(item))

	if (!vm.item.user_settings) {
		vm.item.user_settings = {}
	}

	vm.linkedToComps = []
	vm.linkedByComps = []

	var linkedToCompsIds = vm.item.settings.linked_components.active_object
	var dashboardComponents = data.dashboardComponents

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

	// getAttributes();
}
