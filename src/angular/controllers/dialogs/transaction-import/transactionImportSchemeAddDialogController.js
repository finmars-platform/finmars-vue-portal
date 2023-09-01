/**
 * Created by szhitenev on 17.08.2016.
 */

import transactionImportSchemeService from '@/angular/services/import/transactionImportSchemeService'

export default function transactionImportSchemeAddDialogController(
	$scope,
	$mdDialog,
	toastNotificationService,
	ecosystemDefaultService,
	transactionTypeService,
	data,
	importSchemesMethodsService
) {
	var vm = this

	vm.processing = false

	vm.dataProviders = []

	vm.readyStatus = {
		dataProviders: false,
		scheme: true,
		transactionTypes: false,
	}

	vm.defaultRuleScenario = {
		name: '-',
		is_default_rule_scenario: true,
		fields: [],
	}

	vm.inputsGroup = {
		name: '<b>Imported</b>',
		key: 'input',
	}

	vm.inputsFunctions = []
	vm.selector_values_projection = []

	vm.scheme = {
		selector_values: [],
	}

	vm.mapFields = [
		// {
		//     value: '',
		//     transaction_type: null,
		//     fields: []
		// }
	]

	vm.providerFields = [
		{
			name: '',
			column: 1,
			name_expr: '',
		},
	]

	vm.calculatedFields = [
		// {
		//     name: '',
		//     column: '',
		//     name_expr: ''
		// }
	]

	vm.reconFields = [
		// {
		//     name: '',
		//     selector_values: [],
		//     line_reference_id: '',
		//     reference_date: '',
		//     fields: []
		// }
	]

	var ecosystemDefaultData

	vm.openSelectorManager = function ($event) {
		// Open Selector Dialog Here

		$mdDialog
			.show({
				controller:
					'TransactionImportSchemeSelectorValuesDialogController as vm',
				templateUrl:
					'views/dialogs/transaction-import/transaction-import-scheme-selector-values-dialog-view.html',
				parent: angular.element(document.body),
				targetEvent: $event,
				preserveScope: true,
				autoWrap: true,
				skipHide: true,
				multiple: true,
				locals: {
					data: {
						scheme: vm.scheme,
					},
				},
			})
			.then(function (res) {
				if (res.status === 'agree') {
					vm.scheme.selector_values = res.data

					vm.selector_values_projection = vm.scheme.selector_values.map(
						function (item) {
							return {
								id: item.value,
								value: item.value,
							}
						}
					)
				}
			})
	}

	vm.openScenarioFieldsManager = function ($event, item) {
		$mdDialog.show({
			controller: 'TransactionImportSchemeScenarioFieldsDialogController as vm',
			templateUrl:
				'views/dialogs/transaction-import/transaction-import-scheme-scenario-fields-dialog-view.html',
			parent: angular.element(document.body),
			targetEvent: $event,
			preserveScope: true,
			autoWrap: true,
			skipHide: true,
			multiple: true,
			locals: {
				data: {
					item: item,
				},
			},
		})
	}

	vm.addScenario = function ($event) {
		vm.reconFields.push({
			scenario_name: '',
			selector_values: [],
			line_reference_id: '',
			reference_date: '',
			fields: [],
		})
	}

	vm.deleteScenario = function (item, $index) {
		vm.reconFields.splice($index, 1)
	}

	vm.getFunctions = function () {
		return vm.providerFields.map(function (input) {
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
	}

	/* vm.getTransactionTypes = function () {

            transactionTypeService.getListLight({
                pageSize: 1000
            }).then(function (data) {
                vm.transactionTypes = data.results;
                vm.readyStatus.transactionTypes = true;
                $scope.$apply();
            });

        }; */
	vm.getTransactionTypes = function () {
		return new Promise(function (resolve) {
			transactionTypeService
				.getListLight({
					pageSize: 1000,
				})
				.then(function (data) {
					vm.transactionTypes = data.results
					vm.readyStatus.transactionTypes = true
					// $scope.$apply();

					resolve()
				})
				.catch(function (error) {
					resolve()
				})
		})
	}

	var loadEcosystemDefaults = function () {
		return new Promise(function (resolve, reject) {
			ecosystemDefaultService
				.getList()
				.then(function (data) {
					ecosystemDefaultData = data.results[0]

					resolve(ecosystemDefaultData)
				})
				.catch(function (error) {
					reject(error)
				})
		})
	}

	vm.openInputs = function (item, $event) {
		if (!item.fields) {
			item.fields = []
		}

		$mdDialog
			.show({
				controller: 'TransactionImportSchemeInputsDialogController as vm',
				templateUrl:
					'views/dialogs/transaction-import/transaction-import-scheme-inputs-dialog-view.html',
				parent: angular.element(document.body),
				targetEvent: $event,
				preserveScope: true,
				autoWrap: true,
				skipHide: true,
				multiple: true,
				locals: {
					data: {
						fields: vm.providerFields,
						item: item,
					},
				},
			})
			.then(function (res) {
				if (res.status === 'agree') {
					item.fields = res.data.item.fields
				}
			})
	}

	vm.checkReadyStatus = function () {
		return vm.readyStatus.scheme && vm.readyStatus.transactionTypes
	}

	vm.createEmptyScheme = function () {
		vm.scheme.inputs = []
		vm.scheme.rules = []
		vm.scheme.rule_expr = 'a + b'
		vm.scheme.user_code = ''
	}

	vm.addProviderField = function () {
		var fieldsLength = vm.providerFields.length
		var lastFieldNumber
		var nextFieldNumber
		if (fieldsLength === 0) {
			nextFieldNumber = 1
		} else {
			lastFieldNumber = parseInt(vm.providerFields[fieldsLength - 1].column)
			if (isNaN(lastFieldNumber) || lastFieldNumber === null) {
				lastFieldNumber = 0
			}
			nextFieldNumber = lastFieldNumber + 1
		}

		vm.providerFields.push({
			name: '',
			column: nextFieldNumber,
			name_expr: '',
		})
	}

	vm.addCalculatedField = function () {
		var fieldsLength = vm.calculatedFields.length
		var lastFieldNumber
		var nextFieldNumber
		if (fieldsLength === 0) {
			nextFieldNumber = 1
		} else {
			lastFieldNumber = parseInt(vm.calculatedFields[fieldsLength - 1].column)
			if (isNaN(lastFieldNumber) || lastFieldNumber === null) {
				lastFieldNumber = 0
			}
			nextFieldNumber = lastFieldNumber + 1
		}

		vm.calculatedFields.push({
			name: '',
			column: nextFieldNumber,
		})
	}

	vm.addMapField = function () {
		vm.mapFields.push({
			value: '',
			transaction_type: null,
			is_default_rule_scenario: false,
			fields: [],
		})
	}

	/*vm.setProviderFieldExpression = function (item) {

            if (!item.name_expr || item.name_expr === '') {
                item.name_expr = item.name;
                vm.inputsFunctions = vm.getFunctions();
            }

        };*/
	vm.setProviderFieldExpression = function (item) {
		importSchemesMethodsService.setProviderFieldExpression(vm, item)
	}

	vm.onCalculatedFieldNameBlur = function (item) {
		importSchemesMethodsService.onTTypeCalcFielNamedBlur(item)
	}

	vm.setCalculatedFieldExpression = function (item) {
		importSchemesMethodsService.setCalculatedFieldExpression(vm, item)
	}

	/*vm.openProviderFieldExpressionBuilder = function (item, $event) {

            $mdDialog.show({
                controller: 'ExpressionEditorDialogController as vm',
                templateUrl: 'views/dialogs/expression-editor-dialog-view.html',
                targetEvent: $event,
                multiple: true,
                autoWrap: true,
                skipHide: true,
                locals: {
                    item: {expression: item.name_expr},
                    data: {
                        groups: [vm.inputsGroup],
                        functions: [vm.inputsFunctions]
                    }
                }
            }).then(function (res) {

                if (res.status === 'agree') {

                    item.name_expr = res.data.item.expression;
                    vm.inputsFunctions = vm.getFunctions();

                }

            });

        };*/
	vm.openProviderFieldExpressionBuilder = function (item, $event) {
		importSchemesMethodsService.openFxBtnExprBuilder(item, vm, $event)
	}

	/*vm.openCalculatedFieldExpressionBuilder = function (item, $event) {

            $mdDialog.show({
                controller: 'ExpressionEditorDialogController as vm',
                templateUrl: 'views/dialogs/expression-editor-dialog-view.html',
                targetEvent: $event,
                multiple: true,
                autoWrap: true,
                skipHide: true,
                locals: {
                    item: {expression: item.name_expr},
                    data: {
                        groups: [vm.inputsGroup],
                        functions: [vm.inputsFunctions]
                    }
                }
            }).then(function (res) {

                if (res.status === 'agree') {

                    item.name_expr = res.data.item.expression;
                    vm.inputsFunctions = vm.getFunctions();

                }

            });

        };*/
	vm.openCalcFieldFxBtnExprBuilder = function (item, $event) {
		importSchemesMethodsService.openCalcFieldFxBtnExprBuilder(item, vm, $event)
	}

	/*vm.checkForUserExpr = function (item) {
            if (item.name_expr) {
                if (item.name && item.name === item.name_expr) {
                    return false;
                }

                return 'md-primary';
            }

            return false;
        };*/
	vm.checkForUserExpr = function (item) {
		return importSchemesMethodsService.checkForUserExpr(item)
	}

	vm.getCalcFieldFxBtnClasses = function (item) {
		return importSchemesMethodsService.getCalcFieldFxBtnClasses(item)
	}

	vm.removeProviderField = function (item, $index) {
		vm.providerFields.splice($index, 1)
	}

	vm.removeCalculatedField = function (item, $index) {
		vm.calculatedFields.splice($index, 1)
	}

	vm.removeMappingField = function (item, $index) {
		vm.mapFields.splice($index, 1)
	}

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.agree = function ($event) {
		vm.scheme.calculated_inputs = vm.calculatedFields
		vm.scheme.inputs = vm.providerFields
		vm.scheme.rule_scenarios = vm.mapFields

		vm.scheme.rule_scenarios.push(vm.defaultRuleScenario)

		vm.scheme.recon_scenarios = vm.reconFields

		var warningMessage = ''
		var warningTitle = ''

		var importedColumnsNumberZero = false
		var importedColumnsNumberEmpty = false

		for (var i = 0; i < vm.providerFields.length; i++) {
			var field = vm.providerFields[i]

			if (field.column === 0 && !importedColumnsNumberZero) {
				warningMessage =
					"should not have value 0 (column's count starts from 1)"
				importedColumnsNumberZero = true
			}

			if (field.column === null && !importedColumnsNumberEmpty) {
				if (importedColumnsNumberZero) {
					warningMessage = warningMessage + ', should not be empty'
				} else {
					warningMessage = 'should not be empty'
				}

				importedColumnsNumberEmpty = true
			}

			if (
				!importedColumnsNumberZero &&
				!importedColumnsNumberEmpty &&
				!field.name_expr
			) {
				warningMessage +=
					'<p>Imported Columns Field # ' +
					field.column +
					' has no F(X) expression</p>'
			}
		}

		if (warningMessage) {
			if (importedColumnsNumberZero || importedColumnsNumberEmpty) {
				warningTitle = 'Incorrect Imported Columns field #'
				warningMessage = 'Imported Columns Field #: ' + warningMessage + '.'
			} else {
				// if number of column correct but F(X) expression not
				warningTitle = 'Incorrect Imported Columns F(X)'
			}

			$mdDialog.show({
				controller: 'WarningDialogController as vm',
				templateUrl: 'views/dialogs/warning-dialog-view.html',
				targetEvent: $event,
				clickOutsideToClose: false,
				locals: {
					warning: {
						title: warningTitle,
						description: warningMessage,
						actionsButtons: [
							{
								name: 'CLOSE',
								response: false,
							},
						],
					},
				},
				multiple: true,
			})
		} else {
			vm.processing = true

			transactionImportSchemeService
				.create(vm.scheme)
				.then(function (data) {
					toastNotificationService.success(
						'Transaction Import Scheme ' +
							vm.scheme.user_code +
							' was successfully created'
					)

					vm.processing = false

					$mdDialog.hide({ status: 'agree' })
				})
				.catch(function (reason) {
					vm.processing = false

					$mdDialog.show({
						controller: 'ValidationDialogController as vm',
						templateUrl: 'views/dialogs/validation-dialog-view.html',
						targetEvent: $event,
						locals: {
							validationData: {
								errorData: {
									message: reason.message,
								},
							},
						},
						preserveScope: true,
						autoWrap: true,
						multiple: true,
						skipHide: true,
					})
				})
		}
	}

	/*vm.openMapping = function ($event, item) {

            $mdDialog.show({
                controller: 'EntityTypeMappingDialogController as vm',
                templateUrl: 'views/dialogs/entity-type-mapping-dialog-view.html',
                parent: angular.element(document.body),
                targetEvent: $event,
                preserveScope: true,
                autoWrap: true,
                skipHide: true,
                multiple: true,
                locals: {
                    mapItem: item
                }
            }).then(function (res) {
                if (res.status === 'agree') {
                    ;
                }
            });
        };*/

	vm.editTransactionType = function (ttypeId, $event) {
		$mdDialog.show({
			controller: 'TransactionTypeEditDialogController as vm',
			templateUrl: 'views/entity-viewer/transaction-type-edit-dialog-view.html',
			parent: angular.element(document.body),
			targetEvent: $event,
			multiple: true,
			locals: {
				entityType: 'transaction-type',
				entityId: ttypeId,
				data: {
					openedIn: 'dialog',
				},
			},
		})
	}

	vm.init = function () {
		vm.createEmptyScheme()
		// vm.getTransactionTypes();

		Promise.all([vm.getTransactionTypes(), loadEcosystemDefaults()]).then(
			function () {
				if (data && data.hasOwnProperty('scheme')) {
					vm.scheme = data.scheme

					if (vm.scheme.inputs.length) {
						vm.providerFields = []

						vm.scheme.inputs.forEach(function (input) {
							delete input.id
							vm.providerFields.push(input)
						})

						vm.providerFields = vm.providerFields.sort(function (a, b) {
							if (a.column > b.column) {
								return 1
							}
							if (a.column < b.column) {
								return -1
							}

							return 0
						})

						vm.inputsFunctions = vm.getFunctions()
					}

					if (
						vm.scheme.calculated_inputs &&
						vm.scheme.calculated_inputs.length
					) {
						vm.calculatedFields = []

						vm.scheme.calculated_inputs.forEach(function (input) {
							delete input.id
							vm.calculatedFields.push(input)
						})

						vm.calculatedFields = vm.calculatedFields.sort(function (a, b) {
							if (a.column > b.column) {
								return 1
							}
							if (a.column < b.column) {
								return -1
							}

							return 0
						})

						vm.inputsFunctions = vm.getFunctions()
					}

					if (vm.scheme.rule_scenarios.length) {
						vm.mapFields = []

						vm.scheme.rule_scenarios.forEach(function (item) {
							delete item.id

							if (item.is_default_rule_scenario) {
								vm.defaultRuleScenario = item
							} else {
								vm.mapFields.push(item)
							}
						})
					}

					if (vm.scheme.recon_scenarios.length) {
						vm.reconFields = []

						vm.scheme.recon_scenarios.forEach(function (item) {
							vm.reconFields.push(item)
						})
					}

					vm.selector_values_projection = vm.scheme.selector_values.map(
						function (item) {
							return {
								id: item.value,
								value: item.value,
							}
						}
					)
				}

				// this line should be after data from copied scheme applied
				vm.defaultRuleScenario.transaction_type =
					ecosystemDefaultData.transaction_type

				$scope.$apply()
			}
		)
	}

	vm.init()
}
