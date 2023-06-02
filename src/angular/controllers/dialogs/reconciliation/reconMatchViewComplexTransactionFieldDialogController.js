/**
 * Created by szhitenev on 17.12.2019.
 */

import reconciliationComplexTransactionFieldService from '@/angular/services/reconciliation/reconciliationComplexTransactionFieldService'
import reconciliationNewBankFieldService from '@/angular/services/reconciliation/reconciliationNewBankFieldService'
import reconciliationBankFieldService from '@/angular/services/reconciliation/reconciliationBankFieldService'
import reconMatchHelper from '@/angularlpers/reconMatchHelper'

export default function ($scope, $mdDialog, data) {
	var vm = this

	vm.item = data.item
	vm.field = data.field

	vm.linkedBankFields = []

	console.log('Complex Transaction line', vm.item)
	console.log('Complex Transaction field', vm.field)

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.agree = function () {
		reconciliationComplexTransactionFieldService
			.update(vm.field.id, vm.field)
			.then(function (data) {
				$mdDialog.hide({ status: 'agree' })
			})
	}

	vm.getLinkedBankFields = function () {
		reconciliationBankFieldService
			.getList({
				filters: {
					linked_complex_transaction_field: vm.field.id,
				},
			})
			.then(function (data) {
				vm.linkedBankFields = data.results

				$scope.$apply()
			})
	}

	vm.clearLinkedField = function ($event, item, $index) {
		vm.linkedBankFields.splice($index, 1)

		var newField = Object.assign({}, item)

		delete newField.id

		reconciliationNewBankFieldService.create(newField).then(function (data) {
			reconciliationBankFieldService.deleteByKey(item.id)
		})
	}

	vm.conflictLinkedField = function ($event, item, $index) {
		vm.linkedBankFields.splice($index, 1)

		item.status =
			reconMatchHelper.getComplexTransactionFieldStatusIdByName('conflict')
		delete item.linked_complex_transaction_field

		reconciliationBankFieldService.update(item.id, item)
	}

	vm.ignoreLinkedField = function ($event, item, $index) {
		vm.linkedBankFields.splice($index, 1)

		item.status =
			reconMatchHelper.getComplexTransactionFieldStatusIdByName('ignore')
		delete item.linked_complex_transaction_field

		reconciliationBankFieldService.update(item.id, item)
	}

	vm.showDetailsLinkedField = function ($event, field) {
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
					item: {},
					field: field,
				},
			},
		})
	}

	vm.init = function () {
		vm.getLinkedBankFields()

		console.log('vm', vm)
	}

	vm.init()
}
