/**
 * Created by mevstratov on 15.01.2019.
 */

export default function ($scope, $mdDialog, tabs, data) {
	var vm = this

	vm.tabs = tabs
	vm.tabUniqueProp = data.trackByProp

	vm.tabsDragAndDrop = {
		init: function () {
			this.dragula()
			this.eventListeners()
		},

		eventListeners: function () {
			var drake = this.dragula

			drake.on('drop', function (elem, target) {
				var tabsCardsElems = document.querySelectorAll(
					'.tab-editor-dialog .tab-editor-tab-card'
				)
				var tabsAfterDrag = []

				tabsCardsElems.forEach(function (tab, index) {
					var tabIdentifier = tab.dataset.tabId

					for (var i = 0; i < vm.tabs.length; i++) {
						if (tabIdentifier === vm.tabs[i][vm.tabUniqueProp]) {
							vm.tabs[i].tab_number = index
							tabsAfterDrag.push(vm.tabs[i])
							break
						}
					}
				})

				vm.tabs = tabsAfterDrag
			})
		},

		dragula: function () {
			var items = [
				document.querySelector('.tab-editor-dialog .tabs-dnd-container'),
			]

			this.dragula = dragula(items, {
				revertOnSpill: true,
			})
		},

		destroy: function () {
			this.dragula.destroy()
		},
	}

	vm.cancel = function () {
		vm.tabsDragAndDrop.destroy()
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.agree = function () {
		vm.tabsDragAndDrop.destroy()

		var tabs = JSON.parse(angular.toJson(vm.tabs))

		$mdDialog.hide({ status: 'agree', data: { tabs: tabs } })
	}
}
