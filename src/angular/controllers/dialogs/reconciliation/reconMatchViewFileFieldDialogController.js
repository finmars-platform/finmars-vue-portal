/**
 * Created by szhitenev on 17.12.2019.
 */

import reconciliationBankFieldService from '@/angular/services/reconciliation/reconciliationBankFieldService'
import reconciliationNewBankFieldService from '@/angular/services/reconciliation/reconciliationNewBankFieldService'
import reconciliationComplexTransactionFieldService from '@/angular/services/reconciliation/reconciliationComplexTransactionFieldService'

import reconMatchHelper from '@/angularlpers/reconMatchHelper'
import objectComparisonHelper from '@/angularlpers/objectsComparisonHelper'

export default function ($scope, $mdDialog, data) {
	var vm = this

	var originalField = JSON.parse(angular.toJson(data.field))
	delete originalField.active

	vm.item = data.item
	vm.field = data.field

	vm.linkedComplexTransactionField
	vm.hasLinkedComplexTransaction = false

	vm.lockSelect = true




	vm.updateField = function () {
		return new Promise(function (resolve, reject) {
			if (vm.field.hasOwnProperty('status') && vm.field.status === undefined) {
				// if we are turning existing field into new field (drag card into 'New' column)

				var newField = Object.assign({}, vm.field)

				delete newField.id
				delete newField.linked_complex_transaction_field
				delete newField.status

				reconciliationNewBankFieldService
					.create(newField)
					.then(function (data) {
						reconciliationBankFieldService
							.deleteByKey(vm.field.id)
							.then(function (value) {
								// deleting field from existing field list
								resolve(data)
							})
					})
			} else {
				if (vm.field.type === 'new') {
					if (vm.field.id) {
						reconciliationNewBankFieldService
							.update(vm.field.id, vm.field)
							.then(function (data) {
								resolve(data)
							})
					} else {
						reconciliationBankFieldService
							.create(vm.field)
							.then(function (data) {
								resolve(data)
							})
					}
				} else {
					reconciliationBankFieldService
						.update(vm.field.id, vm.field)
						.then(function (data) {
							resolve(data)
						})
				}
			}
		})
	}

	vm.getLinkedComplexTransactionField = function () {
		reconciliationComplexTransactionFieldService
			.getByKey(vm.field.linked_complex_transaction_field)
			.then(function (data) {
				vm.linkedComplexTransactionField = data
				vm.hasLinkedComplexTransaction = true

				$scope.$apply()
			})
	}

	vm.dismiss = function () {
		vm.lockSelect = false
		vm.linkedComplexTransactionField = null
		vm.field.status = undefined
	}

	vm.dismissAndUnmatch = function () {
		vm.field.linked_complex_transaction_field = null

		vm.linkedComplexTransactionField.status =
			reconMatchHelper.getComplexTransactionFieldStatusIdByName('unmatched')

		reconciliationComplexTransactionFieldService
			.update(
				vm.linkedComplexTransactionField.id,
				vm.linkedComplexTransactionField
			)
			.then(function (data) {
				vm.lockSelect = false
				vm.linkedComplexTransactionField = null
				vm.field.status = undefined

				$scope.$apply()
			})
	}

	vm.clear = function () {
		var newField = Object.assign({}, vm.field)

		delete newField.id
		delete newField.linked_complex_transaction_field
		delete newField.status

		reconciliationNewBankFieldService.create(newField).then(function (data) {
			reconciliationBankFieldService
				.deleteByKey(vm.field.id)
				.then(function (value) {
					vm.field = data
					vm.field.status = undefined
					vm.linkedComplexTransactionField = null
					vm.lockSelect = false

					$scope.$apply()
				})
		})
	}

	vm.agree = function () {
		var fieldData = JSON.parse(angular.toJson(vm.field))
		delete fieldData.active

		if (objectComparisonHelper.areObjectsTheSame(originalField, fieldData)) {
			$mdDialog.hide({ status: 'disagree' })
		} else {
			vm.updateField().then(function (fieldData) {
				$mdDialog.hide({
					status: 'agree',
					data: {
						field: fieldData,
					},
				})
			})
		}
	}

	vm.init = function () {


		if (vm.field.linked_complex_transaction_field) {
			vm.getLinkedComplexTransactionField()
		}
	}

	vm.init()
}
