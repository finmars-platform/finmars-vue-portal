/**
 * Created by szhitenev on 08.06.2016.
 */

// import transactionTypeService from '@/angular/services/transactionTypeService';

export default function transactionImportSchemeInputsDialogController(
	$scope,
	$mdDialog,
	metaContentTypesService,
	transactionTypeService,
	data
) {
	var vm = this

	vm.readyStatus = { transactionType: false }

	vm.data = data

	vm.item = JSON.parse(JSON.stringify(vm.data.item))

	vm.inputs = []

	vm.inputsGroup = {
		name: '<b>Imported</b>',
		key: 'input',
	}

	vm.inputsFunctions = vm.data.fields.map(function (input) {
		return {
			name: 'Imported: ' + input.name + ' (column #' + input.column + ')',
			description:
				'Imported: ' +
				input.name +
				' (column #' +
				input.column +
				') ' +
				'-> ' +
				input.name_expr,
			groups: 'input',
			func: input.name,
			validation: {
				func: input.name,
			},
		}
	})

	transactionTypeService
		.getByKey(vm.item.transaction_type)
		.then(function (data) {
			vm.transactionType = data

			vm.inputIds = []

			vm.transactionType.inputs.forEach(function (input) {
				if (input.value_type === 120) {
					return
				}

				var inputObject = Object.assign({}, input)

				if (!inputObject.hasOwnProperty('mapping')) {
					inputObject.mapping = { expression: '' }
				}

				vm.inputs.push(inputObject)
				vm.inputIds.push(inputObject.id)
			})

			vm.item.fields = vm.item.fields.filter(function (field) {
				return vm.inputIds.indexOf(field.transaction_type_input) !== -1
			})

			vm.item.fields.forEach(function (field) {
				vm.inputs.forEach(function (input) {
					if (input.id === field.transaction_type_input) {
						input.mapping.expression = field.value_expr
					}
				})
			})
			console.log('transaction import vm.inputs', vm.inputs)

			vm.readyStatus.transactionType = true
			$scope.$apply()
		})

	vm.bindType = function (item) {
		switch (item.value_type) {
			case 100:
				return 'Relation'
				break
			case 10:
				return 'String'
			case 20:
				return 'Number'
			case 30:
				return 'Classifier'
			case 40:
				return 'Date'
			default:
				return 'N/A'
		}
	}

	vm.openMapping = function (item, $event) {
		$mdDialog
			.show({
				controller: 'EntityTypeMappingDialogController as vm',
				templateUrl: 'views/dialogs/entity-type-mapping-dialog-view.html',
				parent: angular.element(document.body),
				targetEvent: $event,
				preserveScope: true,
				autoWrap: true,
				skipHide: true,
				multiple: true,
				locals: {
					mapItem: {
						complexExpressionEntity:
							metaContentTypesService.findEntityByContentType(
								item.content_type,
								'ui'
							),
					},
				},
			})
			.then(function (res) {
				if (res.status === 'agree') {
					console.log('res', res.data)
				}
			})
	}

	vm.checkReadyStatus = function () {
		return vm.readyStatus.transactionType
	}

	vm.createFieldsIfNotExist = function () {
		vm.inputs.forEach(function (input) {
			var exist = false

			vm.item.fields.forEach(function (field) {
				if (input.id === field.transaction_type_input) {
					exist = true
				}
			})

			if (!exist) {
				if (input.mapping && input.mapping.expression) {
					vm.item.fields.push({
						transaction_type_input: input.id,
						value_expr: input.mapping.expression,
					})
				}
			}
		})
	}

	vm.updateFields = function () {
		vm.inputs.forEach(function (input) {
			vm.item.fields.forEach(function (field) {
				if (input.id === field.transaction_type_input) {
					if (input.hasOwnProperty('mapping')) {
						field.value_expr = input.mapping.expression
					}
				}
			})
		})
	}

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.agree = function () {
		vm.createFieldsIfNotExist()

		vm.updateFields()

		$mdDialog.hide({
			status: 'agree',
			data: {
				item: vm.item,
			},
		})
	}
}
