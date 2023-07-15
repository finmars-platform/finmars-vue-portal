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

				$mdDialog
					.show({
						controller: 'InstrumentSelectDialogController as vm',
						templateUrl: 'views/instrument-select-dialog-view.html',
						parent: angular.element(document.body),
						targetEvent: event,
						preserveScope: true,
						autoWrap: true,
						skipHide: true,
						multiple: true,
						clickOutsideToClose: false,
						locals: {
							ngModelCtrl: ngModelCtrl,
						},
					})
					.then(function (res) {
						if (res.status === 'agree') {
							ngModelCtrl.$setViewValue(res.data.item.id)
							ngModelCtrl.$render()

						}
					})


			})
		},
	}
}
