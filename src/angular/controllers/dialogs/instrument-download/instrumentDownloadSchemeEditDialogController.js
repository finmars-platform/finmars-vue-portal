/**
 * Created by szhitenev on 17.08.2016.
 */

import metaService from '@/angular/services/metaService'
import dataProvidersService from '@/angular/services/import/dataProvidersService'
import instrumentDownloadSchemeService from '@/angular/services/import/instrumentDownloadSchemeService'
import scheduleService from '@/angular/services/import/scheduleService'
import attributeTypeService from '@/angular/services/attributeTypeService'

export default function (
	$scope,
	$mdDialog,
	schemeId,
	importSchemesMethodsService
) {
	var vm = this
	vm.scheme = {}
	vm.readyStatus = { dataProviders: false, scheme: false }

	vm.entityType = 'instrument'

	vm.inputsGroup = {
		name: '<b>Downloaded</b>',
		key: 'input',
	}

	vm.inputsFunctions = []

	vm.modeOptions = instrumentDownloadSchemeService.modeOptions

	var dialogParent = document.querySelector('.dialog-containers-wrap')

	vm.getFunctions = function () {
		return vm.providerFields.map(function (input) {
			return {
				name: 'Downloaded: ' + input.name,
				description: 'Downloaded: ' + input.name + ' -> ' + input.name_expr,
				groups: 'input',
				func: input.name,
				validation: {
					func: input.name,
				},
			}
		})
	}

	instrumentDownloadSchemeService.getByKey(schemeId).then(function (data) {
		vm.scheme = data
		vm.getAttrs()
		$scope.$apply()
	})

	vm.hidedEntityAttrs = [
		'factor_schedule_method',
		'accrual_calculation_schedule_method',
		'provider',
		'url',
		'user_code',
		'id',
		'attributes',
		'inputs',
	]

	vm.baseAttrs = metaService.getBaseAttrs()

	vm.entityAttrs = metaService
		.getEntityAttrs('instrument-scheme')
		.map(function (item) {
			if (
				item.key == 'factor_schedule_method' ||
				item.key == 'accrual_calculation_schedule_method'
			) {
				return null
			}
			return item
		})
		.filter(function (item) {
			return !!item
		})

	vm.attrs = []

	vm.getAttrs = function () {
		attributeTypeService
			.getList('instrument', { pageSize: 1000 })
			.then(function (data) {
				vm.attrs = data.results

				fillArraysWithScheme()

				$scope.$apply()
			})
	}

	vm.dataProviders = []

	dataProvidersService.getList().then(function (data) {
		vm.dataProviders = data
		vm.readyStatus.dataProviders = true
		$scope.$apply()
	})

	vm.mapFields = [
		{
			key: 'instrument_name',
			caption: 'Name',
			required: true,
			hasBackground: true,
			expression: '',
			complexExpressionEntity: false,
		},
		{
			key: 'instrument_user_code',
			caption: 'User code',
			required: true,
			hasBackground: true,
			expression: '',
			complexExpressionEntity: false,
		},
		{
			key: 'instrument_type',
			caption: 'Instrument type',
			required: true,
			hasBackground: true,
			expression: '',
			complexExpressionEntity: 'instrument_type',
		},
		{
			key: 'instrument_short_name',
			caption: 'Short name',
			required: true,
			expression: '',
			complexExpressionEntity: false,
		},
		{
			key: 'instrument_public_name',
			caption: 'Public name',
			required: true,
			expression: '',
			complexExpressionEntity: false,
		},
		{
			key: 'maturity_date',
			caption: 'Maturity',
			required: true,
			expression: '',
			complexExpressionEntity: false,
		},
		{
			key: 'maturity_price',
			caption: 'Maturity Price',
			required: true,
			expression: '',
			complexExpressionEntity: false,
		},
		{
			key: 'daily_pricing_model',
			caption: 'Daily pricing model',
			required: false,
			hasBackground: true,
			value_type: 'field',
			expression: '',
			complexExpressionEntity: 'daily_pricing_model',
		},
		{
			key: 'price_download_scheme',
			caption: 'Price download scheme',
			required: false,
			hasBackground: true,
			value_type: 'field',
			expression: '',
			complexExpressionEntity: 'price_download_scheme',
		},
		{
			key: 'pricing_currency',
			caption: 'Pricing currency',
			value_type: 'field',
			required: true,
			hasBackground: true,
			expression: '',
			complexExpressionEntity: 'currency',
		},
		{
			key: 'price_multiplier',
			caption: 'Price multiplier',
			value_type: 10,
			required: false,
			hasBackground: true,
			expression: '',
			complexExpressionEntity: false,
		},
		{
			key: 'reference_for_pricing',
			caption: 'Reference for pricing',
			required: true,
			value_type: 10,
			expression: '',
			complexExpressionEntity: false,
		},
		{
			key: 'default_price',
			caption: 'Default price',
			value_type: 10,
			required: false,
			expression: '',
			complexExpressionEntity: false,
		},
		{
			key: 'accrued_currency',
			caption: 'Accrued currency',
			//value_type: 10,
			value_type: 'field',
			required: false,
			hasBackground: true,
			expression: '',
			complexExpressionEntity: 'currency',
		},
		{
			key: 'accrued_multiplier',
			caption: 'Accrued multiplier',
			value_type: 10,
			required: false,
			hasBackground: true,
			expression: '',
			complexExpressionEntity: false,
		},
		{
			key: 'default_accrued',
			caption: 'Default accrued',
			value_type: 10,
			required: false,
			expression: '',
			complexExpressionEntity: false,
		},
		{
			key: 'payment_size_detail',
			caption: 'Payment size detail',
			value_type: 'field',
			required: false,
			hasBackground: true,
			expression: '',
			complexExpressionEntity: false,
		},
		{
			key: 'user_text_1',
			caption: 'User text 1',
			required: false,
			expression: '',
			complexExpressionEntity: false,
		},
		{
			key: 'user_text_2',
			caption: 'User text 2',
			required: false,
			expression: '',
			complexExpressionEntity: false,
		},
		{
			key: 'user_text_3',
			caption: 'User text 3',
			required: false,
			expression: '',
			complexExpressionEntity: false,
		},
		{
			key: 'instrument_notes',
			caption: 'Notes',
			required: false,
			expression: '',
			complexExpressionEntity: false,
		},
	]

	vm.mappedFieldsDefaults = []

	vm.mappedFieldsSecond = []

	vm.mappedDynamic = []

	vm.providerFields = [
		{
			name: '',
			field: '',
		},
	]

	var fillArraysWithScheme = function () {
		vm.schemeName = vm.scheme['user_code']
		vm.schemeProvider = vm.scheme['provider']
		vm.factorScheduleMethod = vm.scheme['factor_schedule_method']
		vm.accrualCalculation = vm.scheme['accrual_calculation_schedule_method']

		var findKeyCaption = function (key) {
			var i
			for (i = 0; i < vm.entityAttrs.length; i = i + 1) {
				if (vm.entityAttrs[i].key == key) {
					return vm.entityAttrs[i].caption
				}
			}
		}

		var checkRequired = function (key) {
			var requiredFields = [
				'name',
				'user_code',
				'instrument_type',
				'reference_for_pricing',
				'short_name',
				'public_name',
			]
			if (requiredFields.indexOf(key) !== -1) {
				return true
			}
			return false
		}

		var findEntityWithComplexExpression = function (key) {
			var complexExpressionEntity = false

			switch (key) {
				case 'accrued_currency':
				case 'pricing_currency':
					complexExpressionEntity = 'currency'
					break
				case 'instrument_type':
					complexExpressionEntity = 'instrument_type'
					break
			}

			return complexExpressionEntity
		}

		function syncMapFields() {
			var keys = Object.keys(vm.scheme)
			var i
			var m

			for (i = 0; i < keys.length; i = i + 1) {
				if (vm.hidedEntityAttrs.indexOf(keys[i]) === -1) {
					var caption = findKeyCaption(keys[i])
					var required = checkRequired(keys[i])
					// var complexExpressionEntity = findEntityWithComplexExpression(keys[i]);

					for (m = 0; m < vm.mapFields.length; m = m + 1) {
						if (vm.mapFields[m].key == keys[i]) {
							vm.mapFields[m].caption = caption
							vm.mapFields[m].required = required
							// vm.mapFields[m].complexExpressionEntity = complexExpressionEntity;
							vm.mapFields[m].expression = vm.scheme[keys[i]]
						}
					}
				}
			}
		}

		function syncMappedFieldsDefaults() {
			var keys = Object.keys(vm.scheme)
			var i
			var m
			//vm.mapFields = [];
			for (i = 0; i < keys.length; i = i + 1) {
				if (vm.hidedEntityAttrs.indexOf(keys[i]) === -1) {
					var caption = findKeyCaption(keys[i])
					var required = checkRequired(keys[i])
					var complexExpressionEntity = findEntityWithComplexExpression(keys[i])

					for (m = 0; m < vm.mappedFieldsDefaults.length; m = m + 1) {
						if (vm.mappedFieldsDefaults[m].key == keys[i]) {
							vm.mappedFieldsDefaults[m].caption = caption
							vm.mappedFieldsDefaults[m].required = required
							vm.mappedFieldsDefaults[m].complexExpressionEntity =
								complexExpressionEntity
							vm.mappedFieldsDefaults[m].expression = vm.scheme[keys[i]]
						}
					}
				}
			}
		}

		function syncMappedFieldsSecond() {
			var keys = Object.keys(vm.scheme)
			var i
			var m
			//vm.mapFields = [];
			for (i = 0; i < keys.length; i = i + 1) {
				if (vm.hidedEntityAttrs.indexOf(keys[i]) === -1) {
					var caption = findKeyCaption(keys[i])
					var required = checkRequired(keys[i])
					var complexExpressionEntity = findEntityWithComplexExpression(keys[i])

					for (m = 0; m < vm.mappedFieldsSecond.length; m = m + 1) {
						if (vm.mappedFieldsSecond[m].key == keys[i]) {
							vm.mappedFieldsSecond[m].caption = caption
							vm.mappedFieldsSecond[m].required = required
							vm.mappedFieldsSecond[m].complexExpressionEntity =
								complexExpressionEntity
							vm.mappedFieldsSecond[m].expression = vm.scheme[keys[i]]
						}
					}
				}
			}
		}

		function syncMappedDynamic() {
			var a, x, b, i, e
			//
			//for (b = 0; b < vm.baseAttrs.length; b = b + 1) {
			//    if (vm.baseAttrs[b].key == 'notes') {
			//        if (vm.scheme.notes != null || vm.scheme.notes != '') {
			//            vm.mappedDynamic.push({
			//                key: 'notes',
			//                caption: 'Notes',
			//                required: false,
			//                value: vm.baseAttrs[b],
			//                complexExpressionEntity: false,
			//                expression: vm.scheme.notes
			//            })
			//        }
			//    }
			//}

			var keys = Object.keys(vm.scheme)

			var usedEntityAttrs = [
				'user_code',
				'instrument_type',
				'reference_for_pricing',
				'daily_pricing_model',
				'price_download_scheme',
				'default_price',
				'default_accrued',
				'payment_size_detail',
				'public_name',
			]

			//for (i = 0; i < keys.length; i = i + 1) {
			//    if (vm.hidedEntityAttrs.indexOf(keys[i]) === -1) {
			//
			//        if (usedEntityAttrs.indexOf(keys[i]) === -1) {
			//
			//            for (e = 0; e < vm.entityAttrs.length; e = e + 1) {
			//                if (vm.entityAttrs[e].key == keys[i]) {
			//                    if (vm.scheme[keys[i]] != "" && vm.scheme[keys[i]] != null && vm.scheme[keys[i]] != undefined) {
			//                        var complexExpressionEntity = false;
			//                        if (keys[i] == 'accrued_currency' || keys[i] == 'pricing_currency') {
			//                            complexExpressionEntity = 'currency';
			//                        }
			//                        vm.mappedDynamic.push({
			//                            key: keys[i],
			//                            required: false,
			//                            value: vm.entityAttrs[e],
			//                            complexExpressionEntity: complexExpressionEntity,
			//                            expression: vm.scheme[keys[i]]
			//                        })
			//                    }
			//                }
			//            }
			//        }
			//
			//
			//    }
			//}

			for (a = 0; a < vm.scheme.attributes.length; a = a + 1) {



				for (x = 0; x < vm.attrs.length; x = x + 1) {
					if (vm.attrs[x].id == vm.scheme.attributes[a].attribute_type) {
						var hasComplexExpression = false

						if (vm.attrs[x].value_type == 30) {
							hasComplexExpression = 'classifier'
						}

						vm.mappedDynamic.push({
							id: vm.scheme.attributes[a]['id'],
							complexExpressionEntity: hasComplexExpression,
							expression: vm.scheme.attributes[a].value,
							attribute_name: vm.scheme.attributes[a]['name'],
							attribute_type: vm.scheme.attributes[a]['attribute_type'],
							value: vm.attrs[x],
							attr: vm.scheme.attributes[a],
						})
					}
				}
			}
		}

		syncMapFields()
		syncMappedFieldsDefaults()
		syncMappedFieldsSecond()
		syncMappedDynamic()

		vm.providerFields = vm.scheme.inputs

		vm.inputsFunctions = vm.getFunctions()
		vm.readyStatus.scheme = true
	}

	vm.resolveFieldType = function (field) {


		field.complexExpressionEntity = false

		if (field.value.hasOwnProperty('key')) {
			field.key = field.value.key

			if (field.key == 'accrued_currency' || field.key == 'pricing_currency') {
				field.complexExpressionEntity = 'currency'
			}
		}

		if (
			field.value.hasOwnProperty('value_type') &&
			field.value.hasOwnProperty('id')
		) {
			field.attribute_type = field.value.id

			if (field.value.value_type == 30) {
				field.complexExpressionEntity = 'classifier'
			}
		}
	}

	vm.getModelKey = function (item) {
		if (item.hasOwnProperty('key')) {
			return 'key'
		}

		return 'attribute_type'
	}

	vm.addProviderField = function () {
		vm.providerFields.push({
			name: '',
			field: '',
		})

		vm.inputsFunctions = vm.getFunctions()
	}

	vm.beatufier = function (key) {
		if (key !== undefined) {
			var str = key.split('_').join(' ')
			return str
		}
		return key
	}

	vm.addMapField = function () {
		vm.mappedDynamic.push({
			expression: '',
			required: false,
			complexExpressionEntity: false,
		})
	}

	vm.removeProviderField = function (item, $index) {
		vm.providerFields.splice($index, 1)

		vm.inputsFunctions = vm.getFunctions()
	}

	vm.removeMappingField = function (item, $index) {
		vm.mappedDynamic.splice($index, 1)
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

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.agree = function ($event) {
		vm.schemeUpdated = {}
		vm.schemeUpdated['user_code'] = vm.scheme.user_code
		vm.schemeUpdated['name'] = vm.scheme.name
		vm.schemeUpdated['short_name'] = vm.scheme.short_name
		vm.schemeUpdated['mode'] = vm.scheme.mode
		vm.schemeUpdated['provider'] = vm.schemeProvider
		vm.schemeUpdated['factor_schedule_method'] = vm.factorScheduleMethod
		vm.schemeUpdated['accrual_calculation_schedule_method'] =
			vm.accrualCalculation

		vm.schemeUpdated.attributes = []






		var i, x, y, z
		for (i = 0; i < vm.mapFields.length; i = i + 1) {
			if (vm.mapFields[i].hasOwnProperty('attribute_type')) {
				vm.schemeUpdated.attributes.push({
					id: vm.mapFields[i].id,
					attribute_type: vm.mapFields[i]['attribute_type'],
					value: vm.mapFields[i].expression,
				})
			} else {
				vm.schemeUpdated[vm.mapFields[i].key] = vm.mapFields[i].expression
			}
		}

		for (x = 0; x < vm.mappedFieldsDefaults.length; x = x + 1) {
			if (vm.mappedFieldsDefaults[x].hasOwnProperty('attribute_type')) {
				vm.schemeUpdated.attributes.push({
					id: vm.mappedFieldsDefaults[x].id,
					attribute_type: vm.mappedFieldsDefaults[x]['attribute_type'],
					value: vm.mappedFieldsDefaults[x].expression,
				})
			} else {
				vm.schemeUpdated[vm.mappedFieldsDefaults[x].key] =
					vm.mappedFieldsDefaults[x].expression
			}
		}

		for (y = 0; y < vm.mappedFieldsSecond.length; y = y + 1) {
			if (vm.mappedFieldsSecond[y].hasOwnProperty('attribute_type')) {
				vm.schemeUpdated.attributes.push({
					id: vm.mappedFieldsSecond[y].id,
					attribute_type: vm.mappedFieldsSecond[y]['attribute_type'],
					value: vm.mappedFieldsSecond[y].expression,
				})
			} else {
				vm.schemeUpdated[vm.mappedFieldsSecond[y].key] =
					vm.mappedFieldsSecond[y].expression
			}
		}

		for (z = 0; z < vm.mappedDynamic.length; z = z + 1) {
			if (vm.mappedDynamic[z].hasOwnProperty('attribute_type')) {
				vm.schemeUpdated.attributes.push({
					id: vm.mappedDynamic[z].id,
					attribute_type: vm.mappedDynamic[z]['attribute_type'],
					value: vm.mappedDynamic[z].expression,
				})
			} else {
				vm.schemeUpdated[vm.mappedDynamic[z].key] =
					vm.mappedDynamic[z].expression
			}
		}

		vm.schemeUpdated.inputs = vm.providerFields
		vm.schemeUpdated.inputs.forEach(function (item) {
			item.field = item.name
		})

		instrumentDownloadSchemeService
			.update(vm.scheme.id, vm.schemeUpdated)
			.then(function (data) {
				$mdDialog.hide({ status: 'agree' })
			})
			.catch(function (reason) {
				$mdDialog.show({
					controller: 'ValidationDialogController as vm',
					templateUrl: 'views/dialogs/validation-dialog-view.html',
					targetEvent: $event,
					parent: dialogParent,
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

	/*vm.openMapping = function ($event, item) {

            $mdDialog.show({
                controller: 'EntityTypeMappingDialogController as vm',
                templateUrl: 'views/dialogs/entity-type-mapping-dialog-view.html',
                parent: angular.element(document.body),
                targetEvent: $event,
                multiple: true,
                preserveScope: true,
                autoWrap: true,
                skipHide: true,
                locals: {
                    mapItem: item
                }
            })

        };*/
	vm.openMapping = function ($event, item) {
		var locals = { mapItem: item }
		importSchemesMethodsService.openMappingDialog(locals, $event)
	}

	/*vm.checkForClassifierMapping = function (classifierId) {

            var i;
            for (i = 0; i < vm.mappedDynamic.length; i++) {

                if (vm.mappedDynamic[i].id === classifierId) {

                    if (vm.mappedDynamic[i].value_type === 30) {
                        return true;
                    }

                }

            }

            return false;

        };*/
	vm.checkForClassifierMapping = function (classifierId) {
		return importSchemesMethodsService.checkForClassifierMapping(
			vm.mappedDynamic,
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

	vm.getSchedules = function () {
		scheduleService
			.getAccrualScheduleDownloadMethodList()
			.then(function (data) {
				vm.accrualSchedule = data
				vm.readyStatus.accrualSchedule = true
				$scope.$apply()
			})

		scheduleService.getFactorScheduleDownloadMethodList().then(function (data) {
			vm.factorSchedule = data
			vm.readyStatus.factorSchedule = true
			$scope.$apply()
		})
	}

	vm.checkSchedules = function () {
		if (vm.readyStatus.accrualSchedule && vm.readyStatus.factorSchedule) {
			return true
		}
		return false
	}

	vm.getSchedules()

	vm.checkAttrs = function () {


		var b, e, a
		var x, y, z, x1, y1, z1, x2, y2, z2, x3, y3, z3
		for (b = 0; b < vm.baseAttrs.length; b = b + 1) {
			vm.baseAttrs[b].disabled = false
			for (x = 0; x < vm.mapFields.length; x = x + 1) {
				if (vm.mapFields[x].key == vm.baseAttrs[b].key) {
					vm.baseAttrs[b].disabled = true
				}
			}
			for (x1 = 0; x1 < vm.mappedFieldsDefaults.length; x1 = x1 + 1) {
				if (vm.mappedFieldsDefaults[x1].key == vm.baseAttrs[b].key) {
					vm.baseAttrs[b].disabled = true
				}
			}
			for (x2 = 0; x2 < vm.mappedFieldsSecond.length; x2 = x2 + 1) {
				if (vm.mappedFieldsSecond[x2].key == vm.baseAttrs[b].key) {
					vm.baseAttrs[b].disabled = true
				}
			}
			for (x3 = 0; x3 < vm.mappedDynamic.length; x3 = x3 + 1) {
				if (vm.mappedDynamic[x3].key == vm.baseAttrs[b].key) {
					vm.baseAttrs[b].disabled = true
				}
			}
		}

		for (e = 0; e < vm.entityAttrs.length; e = e + 1) {
			vm.entityAttrs[e].disabled = false
			for (y = 0; y < vm.mapFields.length; y = y + 1) {
				if (vm.hidedEntityAttrs.indexOf(vm.entityAttrs[e].key) === -1) {
					if (vm.mapFields[y].key == vm.entityAttrs[e].key) {
						vm.entityAttrs[e].disabled = true
					}
				}
			}
			for (y1 = 0; y1 < vm.mappedFieldsDefaults.length; y1 = y1 + 1) {
				if (vm.hidedEntityAttrs.indexOf(vm.entityAttrs[e].key) === -1) {
					if (vm.mappedFieldsDefaults[y1].key == vm.entityAttrs[e].key) {
						vm.entityAttrs[e].disabled = true
					}
				}
			}
			for (y2 = 0; y2 < vm.mappedFieldsSecond.length; y2 = y2 + 1) {
				if (vm.hidedEntityAttrs.indexOf(vm.entityAttrs[e].key) === -1) {
					if (vm.mappedFieldsSecond[y2].key == vm.entityAttrs[e].key) {
						vm.entityAttrs[e].disabled = true
					}
				}
			}
			for (y3 = 0; y3 < vm.mappedDynamic.length; y3 = y3 + 1) {
				if (vm.hidedEntityAttrs.indexOf(vm.entityAttrs[e].key) === -1) {
					if (vm.mappedDynamic[y3].key == vm.entityAttrs[e].key) {
						vm.entityAttrs[e].disabled = true
					}
				}
			}
		}

		for (a = 0; a < vm.attrs.length; a = a + 1) {
			vm.attrs[a].disabled = false
			for (z = 0; z < vm.mapFields.length; z = z + 1) {
				if (vm.mapFields[z].hasOwnProperty('attribute_type')) {
					if (vm.mapFields[z].attribute_type == vm.attrs[a].id) {
						vm.attrs[a].disabled = true
					}
				}
			}
			for (z1 = 0; z1 < vm.mappedFieldsDefaults.length; z1 = z1 + 1) {
				if (vm.mappedFieldsDefaults[z1].hasOwnProperty('attribute_type')) {
					if (vm.mappedFieldsDefaults[z1].attribute_type == vm.attrs[a].id) {
						vm.attrs[a].disabled = true
					}
				}
			}
			for (z2 = 0; z2 < vm.mappedFieldsSecond.length; z2 = z2 + 1) {
				if (vm.mappedFieldsSecond[z2].hasOwnProperty('attribute_type')) {
					if (vm.mappedFieldsSecond[z2].attribute_type == vm.attrs[a].id) {
						vm.attrs[a].disabled = true
					}
				}
			}
			for (z3 = 0; z3 < vm.mappedDynamic.length; z3 = z3 + 1) {
				if (vm.mappedDynamic[z3].hasOwnProperty('attribute_type')) {
					if (vm.mappedDynamic[z3].attribute_type == vm.attrs[a].id) {
						vm.attrs[a].disabled = true
					}
				}
			}
		}
	}
}
