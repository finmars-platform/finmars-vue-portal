/**
 * Created by szhitenev on 29.11.2016.
 */

export default function ($scope, $mdDialog) {
	var vm = this

	vm.transactions = $scope.$parent.vm.entity.transactions_object

	vm.editBaseTransaction = function (ev, entityId) {
		$mdDialog.show({
			controller: 'EntityViewerEditDialogController as vm',
			templateUrl: 'views/entity-viewer/entity-viewer-edit-dialog-view.html',
			parent: angular.element(document.body),
			targetEvent: ev,
			locals: {
				entityType: 'transaction',
				entityId: entityId,
				data: {},
			},
			preserveScope: true,
			autoWrap: true,
			skipHide: true,
			multiple: true,
		})
	}
}
