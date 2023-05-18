/**
 * Created by szhitenev on 28.06.2016.
 */

export default function ($mdDialog) {
	return {
		restrict: 'A',
		require: '?ngModel',
		link: function (scope, elem, attrs, ngModelCtrl) {
			$(elem).on('click', function (event) {
				event.preventDefault()
				event.stopPropagation()

				setTimeout(function () {
					$('.md-select-backdrop')[0].dispatchEvent(new Event('click'))
				}, 400)

				$mdDialog.show({
					controller: 'InstrumentEventActionsDialogController as vm',
					templateUrl:
						'views/dialogs/instrument-event-actions-dialog-view.html',
					parent: angular.element(document.body),
					targetEvent: event,
					preserveScope: true,
					autoWrap: true,
					skipHide: true,
					multiple: true,
					clickOutsideToClose: false,
					locals: {
						eventActions: ngModelCtrl,
					},
				})
			})
		},
	}
}
