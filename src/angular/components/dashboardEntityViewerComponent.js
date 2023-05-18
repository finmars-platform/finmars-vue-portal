/**
 * Created by szhitenev on 20.02.2017.
 */

export default {
	bindings: {
		options: '=',
	},
	template:
		'<div class="dashboard-entity-viewer-component"><div data-ng-include="\'views/entity-viewer/entity-viewer-view.html\'" class="min-height"></div></div>',
	controllerAs: 'vm',
	controller: function () {
		var vm = this

		console.log('this', this)

		vm.entityType = vm.options.entityType
		vm.entityRaw = vm.options.entityRaw
		vm.uiLayoutId = vm.options.uiLayoutId

		vm.isReport = vm.options.isReport

		vm.entityViewer = vm.options.entityViewer

		vm.eventsList = vm.options.eventsList
		vm.components = vm.options.components
	},
}
