/**
 * Created by szhitenev on 16.05.2016.
 */

export default function ($mdDialog) {
	return {
		restrict: 'AE',
		templateUrl: 'views/directives/reconciliation/match-recon-card-view.html',
		scope: {
			item: '=',
			field: '=',
			type: '@',
		},
		link: function (scope, elem, attr) {
			scope.statusClass = ''

			scope.resolveStatus = function () {
				// type === 'complex-transaction'
				// MATCHED = 1
				// UNMATCHED = 2
				// AUTO_MATCHED = 3
				// IGNORE = 4

				if (scope.type === 'complex-transaction') {
					if (scope.field.status === 1) {
						scope.statusClass = 'recon-card-matched'
					} else if (scope.field.status === 2) {
						scope.statusClass = 'recon-card-unmatched'
					} else if (scope.field.status === 3) {
						scope.statusClass = 'recon-card-auto-matched'
					}
					if (scope.field.status === 4) {
						scope.statusClass = 'recon-card-ignore'
					}
				}

				// type === 'bank-file'
				// MATCHED = 1
				// CONFLICT = 2
				// RESOLVED = 3
				// IGNORE = 4
				// AUTO_MATCHED = 5

				if (scope.type === 'bank-file') {
					if (scope.field.status === 1) {
						scope.statusClass = 'recon-card-matched'
					} else if (scope.field.status === 2) {
						scope.statusClass = 'recon-card-conflict'
					} else if (scope.field.status === 3) {
						scope.statusClass = 'recon-card-resolved'
					} else if (scope.field.status === 4) {
						scope.statusClass = 'recon-card-ignore'
					} else if (scope.field.status === 5) {
						scope.statusClass = 'recon-card-auto-matched'
					} else {
						scope.statusClass = 'recon-card-new'
					}
				}

				return scope.statusClass
			}

			scope.showDetails = function ($event) {
				if (scope.type === 'complex-transaction') {
					$mdDialog.show({
						controller:
							'ReconMatchViewComplexTransactionFieldDialogController as vm',
						templateUrl:
							'views/dialogs/reconciliation/recon-match-complex-transaction-field-dialog-view.html',
						parent: angular.element(document.body),
						targetEvent: $event,
						preserveScope: true,
						autoWrap: true,
						skipHide: true,
						multiple: true,
						locals: {
							data: {
								item: scope.item,
								field: scope.field,
							},
						},
					})
				}

				if (scope.type === 'bank-file') {
					$mdDialog.show({
						controller: 'ReconMatchViewFileFieldDialogController as vm',
						templateUrl:
							'views/dialogs/reconciliation/recon-match-file-field-dialog-view.html',
						parent: angular.element(document.body),
						targetEvent: $event,
						preserveScope: true,
						autoWrap: true,
						skipHide: true,
						multiple: true,
						locals: {
							data: {
								item: scope.item,
								field: scope.field,
							},
						},
					})
				}
			}

			scope.init = function () {
				scope.resolveStatus()
			}

			scope.init()
		},
	}
}
