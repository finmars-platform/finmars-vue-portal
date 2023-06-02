/**
 * Created by szhitenev on 19.03.2018.
 */

/**
 * Simple Entity Import Edit Dialog Controller.
 * @module SimpleEntityImportEitDialogController
 */

import csvImportSchemeService from '@/angular/services/import/csvImportSchemeService'

import modelService from '@/angular/services/modelService'

import toastNotificationService from '@/angular/../core/services/toastNotificationService'

export default function simpleEntityImportSchemeEditDialogController(
	$scope,
	$mdDialog,
	metaContentTypesService,
	attributeTypeService,
	schemeId,
	importSchemesMethodsService
) {
	var vm = this

	vm.entityType = undefined

	vm.processing = false

	vm.scheme = {}
	vm.readyStatus = { scheme: false, entitySchemeAttributes: false }

	vm.dynamicAttributes = []

	//TODO really bad implementation, dialog renders too long
	vm.instrumentGeneralAttributes = [
		'instrument_type',
		'maturity_date',
		'maturity_price',
		'name',
		'user_code',
		'short_name',
		'public_name',
		'notes',
		'pricing_condition',
	]

	vm.instrumentPricingAttributes = [
		'pricing_currency',
		'price_multiplier',
		'default_price',
		'reference_for_pricing',
	]

	vm.instrumentAccrualsAttributes = [
		'accrued_currency',
		'accrued_multiplier',
		'default_accrued',
	]

	vm.instrumentExposureAttributes = [
		'position_reporting',
		'exposure_calculation_model',
		'long_underlying_instrument',
		'underlying_long_multiplier',
		'short_underlying_instrument',
		'underlying_short_multiplier',
		'long_underlying_exposure',
		'short_underlying_exposure',

		'co_directional_exposure_currency',
		'counter_directional_exposure_currency',
	]

	vm.isInsideTab = function (tab, key) {
		return tab.indexOf(key) !== -1
	}

	vm.inputsGroup = {
		name: '<b>Imported</b>',
		key: 'input',
	}

	vm.dynamicAttrPicked = true

	var pickedDynamicAttrs = []

	vm.inputsFunctions = []

	/**
	 * Get list of expressions for Expression Builder.
	 * @return {Object[]} Array of Expressions.
	 * @memberof module:SimpleEntityImportEitDialogController
	 */
	vm.getFunctions = function () {
		return vm.scheme.csv_fields.map(function (input) {
			return {
				name: 'Imported: ' + input.name + ' (column # ' + input.column + ')',
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

	var findPickedDynamicAttrs = function () {
		if (vm.dynamicAttrPicked) {
			pickedDynamicAttrs = []

			vm.scheme.entity_fields.map(function (field) {
				if (field.dynamic_attribute_id) {
					pickedDynamicAttrs.push(field.dynamic_attribute_id)
				}
			})

			vm.dynamicAttrPicked = false
		}
	}

	vm.getItem = function () {
		csvImportSchemeService.getByKey(schemeId).then(function (data) {
			vm.scheme = data

			vm.readyStatus.scheme = true

			if (
				vm.scheme.content_type !== 'instruments.pricehistory' &&
				vm.scheme.content_type !== 'currencyhistorys.currencyhistory'
			) {
				vm.getAttrs()
			}

			vm.scheme.csv_fields = vm.scheme.csv_fields.sort(function (a, b) {
				if (a.column > b.column) {
					return 1
				}
				if (a.column < b.column) {
					return -1
				}

				return 0
			})

			var modelAttributes = modelService.getAttributesByContentType(
				vm.scheme.content_type
			)

			var deprecated_fields = {
				'instruments.instrument': ['price_download_scheme'],
			}

			if (deprecated_fields.hasOwnProperty(vm.scheme.content_type)) {
				vm.scheme.entity_fields = vm.scheme.entity_fields.filter(function (
					field
				) {
					return (
						deprecated_fields[vm.scheme.content_type].indexOf(
							field.system_property_key
						) === -1
					)
				})
			}

			vm.scheme.entity_fields.map(function (entityField, entityFieldIndex) {
				if (entityField.system_property_key) {
					modelAttributes.forEach(function (attribute) {
						if (attribute.key === entityField.system_property_key) {
							if (attribute.value_type === 'mc_field') {
								// remove multiple relation attributes

								vm.scheme.entity_fields.splice(entityFieldIndex, 1)
							} else {
								// console.log('entityField', entityField);
								// console.log('attribute', attribute);

								entityField.value_type = attribute.value_type
								entityField.entity = attribute.value_entity
								entityField.content_type = attribute.content_type
								entityField.code = attribute.code
							}
						}
					})
				}
			})

			vm.inputsFunctions = vm.getFunctions()

			findPickedDynamicAttrs()

			$scope.$apply()
		})
	}

	/**
	 * Get list of dynamic attributes .
	 *
	 * @memberof module:SimpleEntityImportEitDialogController
	 */
	vm.getAttrs = function () {
		var entity = metaContentTypesService.findEntityByContentType(
			vm.scheme.content_type
		)
		vm.entityType = entity

		attributeTypeService
			.getList(entity, {
				pageSize: 1000,
			})
			.then(function (data) {
				vm.dynamicAttributes = data.results

				vm.extendEntityFields()

				$scope.$apply()
			})
	}

	vm.extendEntityFields = function () {
		vm.scheme.entity_fields.forEach(function (item) {
			if (item.dynamic_attribute_id !== null) {
				vm.dynamicAttributes.forEach(function (attribute) {
					if (item.dynamic_attribute_id === attribute.id) {
						item.value_type = attribute.value_type
					}
				})
			}
		})
	}

	vm.getContentTypeName = function (valueType) {
		var valueTypeName = ''
		switch (valueType) {
			case 10:
				valueTypeName = 'Text'
				break
			case 20:
				valueTypeName = 'Number'
				break
			case 30:
			case 'field':
			case 'mc_field':
				valueTypeName = 'Classificator'
				break
			case 40:
				valueTypeName = 'Date'
				break
		}

		return valueTypeName
	}

	vm.checkReadyStatus = function () {
		return vm.readyStatus.scheme
	}

	vm.onDynamicAttributePick = function () {
		findPickedDynamicAttrs()
		vm.extendEntityFields()
	}

	vm.checkForUsedDynamicAttr = function (attrId) {
		if (pickedDynamicAttrs.indexOf(attrId) !== -1) {
			return true
		}

		return false
	}

	vm.addCsvField = function () {
		var fieldsLength = vm.scheme.csv_fields.length
		var lastFieldNumber
		var nextFieldNumber
		if (fieldsLength === 0) {
			nextFieldNumber = 1
		} else {
			lastFieldNumber = parseInt(vm.scheme.csv_fields[fieldsLength - 1].column)
			if (isNaN(lastFieldNumber) || lastFieldNumber === null) {
				lastFieldNumber = 0
			}
			nextFieldNumber = lastFieldNumber + 1
		}

		vm.scheme.csv_fields.push({
			name: '',
			column: nextFieldNumber,
		})

		vm.inputsFunctions = vm.getFunctions()
	}

	vm.addDynamicAttribute = function () {
		var lastAttributeIndex = vm.scheme.entity_fields.length - 1

		vm.scheme.entity_fields.push({
			expression: '',
			name: '',
			order: lastAttributeIndex,
		})

		console.log('scheme order', vm.scheme.entity_fields)
	}

	vm.removeCsvField = function (item, $index) {
		vm.scheme.csv_fields.splice($index, 1)

		vm.inputsFunctions = vm.getFunctions()
	}

	vm.removeDynamicAttribute = function (item, $index) {
		var i
		for (i = 0; i < pickedDynamicAttrs.length; i++) {
			if (
				vm.scheme.entity_fields[$index].dynamic_attribute_id ===
				pickedDynamicAttrs[i]
			) {
				pickedDynamicAttrs.splice(i, 1)
				break
			}
		}

		vm.scheme.entity_fields.splice($index, 1)
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

	vm.makeCopy = function ($event) {
		var scheme = JSON.parse(JSON.stringify(vm.scheme))

		delete scheme.id
		scheme['user_code'] = scheme['user_code'] + '_copy'

		$mdDialog.show({
			controller: 'SimpleEntityImportSchemeCreateDialogController as vm',
			templateUrl:
				'views/dialogs/simple-entity-import/simple-entity-import-scheme-dialog-view.html',
			parent: angular.element(document.body),
			targetEvent: $event,
			locals: {
				data: {
					scheme: scheme,
				},
			},
		})

		$mdDialog.hide({ status: 'disagree' })
	}

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.agree = function ($event) {
		vm.scheme.entity_fields.forEach(function (item) {
			vm.dynamicAttributes.forEach(function (attr) {
				if (item.dynamic_attribute_id === attr.id) {
					item.name = attr.name
				}
			})
		})

		var warningMessage = ''
		var warningTitle = ''

		var importedColumnsNumberZero = false
		var importedColumnsNumberEmpty = false

		for (var i = 0; i < vm.scheme.csv_fields.length; i++) {
			var field = vm.scheme.csv_fields[i]

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

			csvImportSchemeService
				.update(vm.scheme.id, vm.scheme)
				.then(function (data) {
					toastNotificationService.success(
						'Simple Import Scheme ' +
							vm.scheme.user_code +
							' was successfully saved'
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
							validationData: reason.message,
						},
						multiple: true,
						preserveScope: true,
						autoWrap: true,
						skipHide: true,
					})
				})
		}
	}

	/*vm.openMapping = function ($event, item) {

            console.log('item', item);

            $mdDialog.show({
                controller: 'EntityTypeMappingDialogController as vm',
                templateUrl: 'views/dialogs/entity-type-mapping-dialog-view.html',
                parent: angular.element(document.body),
                targetEvent: $event,
                preserveScope: true,
                multiple: true,
                autoWrap: true,
                skipHide: true,
                locals: {
                    mapItem: {complexExpressionEntity: item.entity}
                }
            })

        };*/
	vm.openMapping = function ($event, item) {
		var locals = { mapItem: { complexExpressionEntity: item.entity } }
		importSchemesMethodsService.openMappingDialog(locals, $event)
	}

	/*vm.checkForClassifierMapping = function (classifierId) {

            if (classifierId) {

                var i;
                for (i = 0; i < vm.dynamicAttributes.length; i++) {

                    if (vm.dynamicAttributes[i].id === classifierId) {

                        if (vm.dynamicAttributes[i].value_type === 30) {
                            return true;
                        }

                    }

                }

            }

            return false;

        };*/
	vm.checkForClassifierMapping = function (classifierId) {
		importSchemesMethodsService.checkForClassifierMapping(
			vm.dynamicAttributes,
			classifierId
		)
	}

	/*vm.openClassifierMapping = function (classifierId, $event) {

            $mdDialog.show({
                controller: 'EntityTypeClassifierMappingDialogController as vm',
                templateUrl: 'views/dialogs/entity-type-classifier-mapping-dialog-view.html',
                parent: angular.element(document.body),
                targetEvent: $event,
                preserveScope: true,
                autoWrap: true,
                skipHide: true,
                multiple: true,
                locals: {
                    options: {
                        entityType: vm.entityType,
                        id: classifierId
                    }
                }
            })

        };*/
	vm.openClassifierMapping = function (classifierId, $event) {
		var localsObj = {
			options: {
				entityType: vm.entityType,
				id: classifierId,
			},
		}

		importSchemesMethodsService.openClassifierMapping(localsObj, $event)
	}

	function setName(item) {
		item.name = item.text
		if (item.id.indexOf('j') !== -1) {
			delete item['li_attr']
			delete item['state']
			delete item['icon']
			delete item['a_attr']
			delete item['data']
			delete item['text']
			delete item['type']
			delete item.id
		}
		item.children = item.children.map(setName)
		return item
	}

	vm.editTreeAttr = function (attrId, ev) {
		var classifierObject = {}

		for (var i = 0; i < vm.dynamicAttributes.length; i++) {
			if (vm.dynamicAttributes[i].id === attrId) {
				classifierObject = Object.assign({}, vm.dynamicAttributes[i])
				break
			}
		}

		/*classifierObject.id = classifierObject.dynamic_attribute_id;
            delete classifierObject.dynamic_attribute_id;*/

		$mdDialog
			.show({
				controller: 'ClassificationEditorDialogController as vm',
				templateUrl: 'views/classification-editor-dialog-view.html',
				parent: angular.element(document.body),
				targetEvent: ev,
				multiple: true,
				locals: {
					data: {
						entityType: vm.entityType,
						classifier: classifierObject,
					},
				},
			})
			.then(function (res) {
				if (res.status === 'agree') {
					console.log('res', res.data)

					res.data.classifier.classifiers =
						res.data.classifier.children.map(setName)

					attributeTypeService.update(
						vm.entityType,
						res.data.classifier.id,
						res.data.classifier
					)
				}
			})
	}

	vm.openCalcFieldFxBtnExprBuilder = function (item, $event) {
		importSchemesMethodsService.openCalcFieldFxBtnExprBuilder(item, vm, $event)
	}

	vm.onCalculatedFieldNameBlur = function (item) {
		importSchemesMethodsService.onTTypeCalcFielNamedBlur(item)
	}

	vm.getCalcFieldFxBtnClasses = function (item) {
		return importSchemesMethodsService.getCalcFieldFxBtnClasses(item)
	}

	vm.removeCalculatedField = function (item, $index) {
		vm.scheme.calculated_inputs.splice($index, 1)
	}

	vm.addCalculatedField = function () {
		var fieldsLength = vm.scheme.calculated_inputs.length
		var lastFieldNumber
		var nextFieldNumber
		if (fieldsLength === 0) {
			nextFieldNumber = 1
		} else {
			lastFieldNumber = parseInt(
				vm.scheme.calculated_inputs[fieldsLength - 1].column
			)
			if (isNaN(lastFieldNumber) || lastFieldNumber === null) {
				lastFieldNumber = 0
			}
			nextFieldNumber = lastFieldNumber + 1
		}

		vm.scheme.calculated_inputs.push({
			name: '',
			column: nextFieldNumber,
		})
	}

	vm.editAsJson = function (ev) {
		$mdDialog
			.show({
				controller: 'EntityAsJsonEditorDialogController as vm',
				templateUrl: 'views/dialogs/entity-as-json-editor-dialog-view.html',
				targetEvent: ev,
				multiple: true,
				locals: {
					data: {
						item: vm.scheme,
						entityType: 'csv-import-scheme',
					},
				},
			})
			.then(function (res) {
				if (res.status === 'agree') {
					vm.getItem()
				}
			})
	}

	vm.init = function () {
		vm.getItem()
	}

	vm.init()
}
