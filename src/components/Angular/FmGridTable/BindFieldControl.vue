<template>
	<div :class="{ 'disabled-field': !isEditableField() }">
		<div :class="{ 'display-none': !vm.readyStatus.content }">
			<div
				v-if="vm.fieldType['display_name'] === 'Number'"
				class="bind-field-number-field-container"
			>
				<number-input
					label="{{getName()}}"
					model="vm.model"
					number-format="item.options.number_format"
					custom-buttons="item.buttons"
					custom-styles="customStyles"
					event-signal="ciEventObj.event"
					small-options="{onlyPositive: item.options.onlyPositive,
                      tooltipText: tooltipText,
                      notNull: options.notNull,
                      dialogParent: '.dialog-containers-wrap'}"
					on-change-callback="vm.itemChange()"
				>
				</number-input>
			</div>

			<div v-if="vm.fieldType['display_name'] === 'String'">
				<text-input
					label="{{getName()}}"
					placeholder-text="text"
					model="vm.model"
					custom-buttons="item.buttons"
					custom-styles="customStyles"
					event-signal="ciEventObj.event"
					small-options="{tooltipText: tooltipText, notNull: options.notNull, dialogParent: '.dialog-containers-wrap'}"
					render-hyperlinks="item.options.isHyperlink"
					on-change-callback="vm.itemChange()"
					on-blur-callback="inputBlur()"
				></text-input>
			</div>

			<div
				v-if="
					vm.fieldType['display_name'] === 'Field' ||
					vm.fieldType['display_name'] === 'Multiple choice field'
				"
			>
				<div>
					<ev-field-resolver
						data-item="item"
						data-entity="entity"
						data-options="options"
						ev-editor-data-service="evEditorDataService"
						ev-editor-event-service="evEditorEventService"
						data-entity-type="vm.entityType"
						fields-data-store="fieldsDataStore"
					>
					</ev-field-resolver>
				</div>
			</div>

			<div
				v-if="vm.fieldType['display_name'] === 'Date'"
				class="field-date-pick"
			>
				<date-input
					label="{{getName()}}"
					model="vm.model"
					custom-buttons="item.buttons"
					custom-styles="customStyles"
					event-signal="ciEventObj.event"
					small-options="{tooltipText: tooltipText, notNull: options.notNull, dialogParent: '.dialog-containers-wrap'}"
					empty-input-button="{{showEmptyInputBtn}}"
					on-change-callback="onDateChange()"
				>
				</date-input>
			</div>

			<div
				v-if="vm.fieldType['display_name'] === 'Datetime'"
				class="field-date-pick"
			>
				<datetime-input
					label="{{getName()}}"
					model="vm.model"
					custom-buttons="item.buttons"
					is-readonly="item.readonly"
					custom-styles="customStyles"
					event-signal="ciEventObj.event"
					small-options="{tooltipText: tooltipText, notNull: options.notNull, dialogParent: '.dialog-containers-wrap'}"
					on-change-callback="onDateChange()"
				>
				</datetime-input>
			</div>

			<div
				v-if="
					vm.fieldType['display_name'] === 'Boolean' &&
					hideIscanceledCheckbox(getName())
				"
			>
				<md-checkbox
					class="checkbox-bind-field"
					v-model="vm.model"
					:change="vm.itemChange()"
					aria-label="checkbox"
				>
					<label v-bind="getName()"></label>
				</md-checkbox>
			</div>

			<div v-if="vm.fieldType['display_name'] === 'Classifier'">
				<div v-if="vm.readyStatus.classifier">
					<!--  Victor 2020.10.23 Change for classifier-select
								<md-input-container class="md-block md-select-pan">
									<label data-ng-bind="getName()"></label>

									<md-select
										data-ng-model="vm.model"
										data-classifier-modal-resolver
										data-classifier-attr="item"
										data-classifier-value="entity[vm.fieldKey]"
										data-ng-change="changeClassifier()"
										md-container-class="h-classifier-select"
										data-entity-type="vm.entityType"
										style="{{vm.inputBackgroundColor()}}"
									>
										<md-option ng-value="node.id" selected="selected">
											{{node.name}}
										</md-option>
									</md-select>
								</md-input-container>-->
					<classifier-select
						label="{{getName()}}"
						placeholder-text="{{getName()}}"
						model="vm.model"
						classifier-attr="item"
						classifier-value="vm.model"
						event-signal="ciEventObj.event"
						entity-type="vm.entityType"
						small-options="{tooltipText: tooltipText, notNull: options.notNull, dialogParent: '.dialog-containers-wrap'}"
						on-change-callback="changeClassifier()"
					></classifier-select>
				</div>
				<!-- ProgressCircular.vue -->
				<div v-if="!vm.readyStatus.classifier">
					<div layout="row" layout-sm="column" layout-align="space-around">
						<progress-circular diameter="20"></progress-circular>
					</div>
				</div>
			</div>

			<div
				v-if="
					vm.fieldType['display_name'] === 'Decoration' &&
					item.key === 'layoutLine'
				"
				class="ec-decoration-container"
			>
				<span
					class="ec-decoration line"
					style="{{vm.inputBackgroundColor()}}"
				></span>
			</div>

			<div
				v-if="
					vm.fieldType['display_name'] === 'Decoration' &&
					item.key === 'layoutLineWithLabel'
				"
				class="ec-decoration-container"
			>
				<span class="ec-decoration labeled" v-if="item.options.labelText">
					<span class="w-rp" v-bind="item.options.labelText"></span>
				</span>
			</div>

			<div
				v-if="
					vm.fieldType['display_name'] === 'Decoration' &&
					item.key === 'layoutPlainText'
				"
				class="ec-decoration-container"
			>
				<span
					class="ec-decoration plain-text"
					v-bind="item.options.plainText"
				></span>
			</div>

			<div
				v-if="
					vm.fieldType['display_name'] === 'Decoration' &&
					item.key === 'layoutCalculatedText'
				"
				class="ec-decoration-container"
			>
				<span
					class="ec-decoration plain-text"
					v-bind="item.options.result"
				></span>
			</div>

			<div v-if="vm.fieldType['display_name'] === 'Selector'">
				<div>
					<ev-selector-resolver
						item="item"
						options="options"
						ev-editor-event-service="evEditorEventService"
						item-change="vm.itemChange()"
					>
					</ev-selector-resolver>
				</div>
			</div>

			<div v-if="vm.fieldType['display_name'] === 'Button'">
				<div class="custom-input-container">
					<md-button class="md-raised md-primary" @click="recalculate()">
						{{ getName() }}
					</md-button>
					<FmBtn
									type="text"
									class="md-raised md-primary"
									@click="recalculate()"
								>
									Add Blank
								</FmBtn>
				</div>
			</div>

			<div
				v-if="vm.fieldType['display_name'] === 'Table'"
				style="padding: 0 10px"
			>
				<bind-field-table item="item" entity="entity"></bind-field-table>
			</div>
		</div>

		<div
			v-if="!vm.readyStatus.content"
			class="bind-field-loader"
			style="height: 42px; margin-bottom: 13px"
		>
			<div
				layout="row"
				layout-sm="column"
				layout-align="space-around space-around"
				class="height-100"
			>
				<progress-circular diameter="30"></progress-circular>
			</div>
		</div>
	</div>
</template>

<script>
	/**
	 * Created by szhitenev on 16.05.2016.
	 */

	// import evEditorEvents from '../services/ev-editor/entityViewerEditorEvents'
	//
	// import metaService from '../services/metaService'
	// import layoutService from '../services/entity-data-constructor/layoutService'
	// import attributeTypeService from '../services/attributeTypeService'
	// import expressionService from '../services/expression.service'
	//
	// import evHelperService from '../services/entityViewerHelperService'
	const props = defineProps([
		'item',
		'entity',
		'entityType',
		'evEditorDataService',
		'evEditorEventService',
		'entityChange',
		'onFieldBlur',
		'fieldsDataStore',
		'entityType',
	])
	export default function () {
		return {
			templateUrl: 'views/directives/bind-field-control-view.html',
			controllerAs: 'vm',
			controller: [
				'$scope',
				function bindFieldControlController($scope) {
					var vm = this

					vm.readyStatus = { classifier: false, content: true }

					vm.entityType = $scope.entityType
					vm.evEditorDataService = $scope.evEditorDataService
					vm.evEditorEventService = $scope.evEditorEventService

					$scope.layoutAttrs = layoutService.getLayoutAttrs()

					$scope.isRecalculate = false
					$scope.numberFormat = null
					$scope.customStyles = null

					$scope.ciEventObj = {
						event: {},
					}

					$scope.recalculateFunction = null
					$scope.showEmptyInputBtn

					// var attrs = $scope.$parent.vm.attrs || []; // dynamic attributes
					var userInputs = $scope.$parent.vm.userInputs || []
					var choices = metaService.getEntityViewerFormComponentsValueTypes()
					var entityAttrs = metaService.getEntityAttrs(vm.entityType) || []

					var palettesList = []

					var eventListenersIndexesData = {}
					//$scope.numericInputValue = {};

					$scope.isEditableField = function () {
						if (vm.entityType === 'complex-transaction' && $scope.item) {
							if (
								$scope.item.can_recalculate ||
								$scope.item.editable === false
							) {
								return false
							}
						}

						return true
					}

					$scope.getName = function () {
						if ($scope.item.name === 'name') {
							return 'Report Name (Name)'
						}

						if ($scope.item.name === 'short_name') {
							return 'System Name (Short Name)'
						}

						if ($scope.item.name === 'user_code') {
							return 'Unique Code (User Code)'
						}

						if ($scope.item.name === 'public_name') {
							return 'Name if Hidden (Public Name)'
						}

						if ($scope.item.options && $scope.item.options.fieldName) {
							return $scope.item.options.fieldName
						} else if ($scope.item.hasOwnProperty('verbose_name')) {
							return $scope.item.verbose_name
						}

						return $scope.item.name
					}

					$scope.hideIscanceledCheckbox = function (checkboxName) {
						if (vm.entityType === 'transaction') {
							if (checkboxName === 'Is canceled') {
								return false
							}

							return true
						}

						return true
					}

					vm.getValueFromEntity = function () {
						var dAttrVal

						if (vm.fieldType.type === 'dynamicAttribute') {
							if (Array.isArray($scope.entity.attributes)) {
								dAttrVal = evHelperService.getValueFromDynamicAttrsByUserCode(
									vm.fieldKey,
									$scope.entity.attributes
								)
							}

							if (vm.fieldType && vm.fieldType.value === 30 && dAttrVal) {
								dAttrVal = dAttrVal.classifier
							}
						} else if (
							vm.entityType === 'complex-transaction' &&
							vm.fieldType.type === 'userInput'
						) {
							// field is a user input
							dAttrVal = $scope.entity.values[vm.fieldKey]
						} else {
							dAttrVal = $scope.entity[vm.fieldKey]
						}

						if (vm.fieldType.value === 'mc_field' && !Array.isArray(dAttrVal)) {
							dAttrVal = []
						}

						return dAttrVal
					}

					vm.setValueInsideEntity = function () {
						if (vm.fieldType.type === 'dynamicAttribute') {
							$scope.entity.attributes =
								evHelperService.setDynamicAttrValueByUserCode(
									vm.fieldKey,
									$scope.entity.attributes,
									vm.model
								)
						} else if (
							vm.entityType === 'complex-transaction' &&
							vm.fieldType.type === 'userInput'
						) {
							//
							$scope.entity.values[vm.fieldKey] = vm.model
						} else {
							$scope.entity[vm.fieldKey] = vm.model
						}

						return $scope.entity
					}

					/* $scope.copyFromField = function (attr) {
                    var attrObj = JSON.parse(attr);

                    if (attrObj.key) {
                        $scope.entity[vm.fieldKey] = $scope.entity[attrObj.key];
                    }

                    if (attrObj.id) {
                        var resAttr = null;
                        attrs.forEach(function (item) {
                            if (item.id === attrObj.id) {
                                resAttr = item;
                            }
                        });
                        $scope.entity[vm.fieldKey] = $scope.entity[resAttr.name];
                    }
                };

                $scope.checkValid = function () {
                    if ($scope.entity.$_isValid === false) {
                        var item = $scope.entity[vm.fieldKey];
                        if (item == null || item === "" || item === undefined) {
                            return true;
                        }
                    }

                    return false;
                }; */

					$scope.getModelKey = function () {
						if ($scope.item) {
							if ($scope.item.value_type === 'table') {
								return $scope.item.key
							} else {
								if (
									$scope.item.hasOwnProperty('id') &&
									$scope.item.id !== null
								) {
									if ($scope.item.attribute_type_object) {
										return $scope.item.attribute_type_object.user_code
									} else {
										return $scope.item.user_code
									}
								} else {
									var l, e, u

									for (e = 0; e < entityAttrs.length; e = e + 1) {
										if ($scope.item.key === entityAttrs[e].key) {
											return entityAttrs[e].key
										}
									}

									for (l = 0; l < $scope.layoutAttrs.length; l = l + 1) {
										if ($scope.item.name === $scope.layoutAttrs[l].name) {
											return $scope.layoutAttrs[l].key
										}
									}

									for (u = 0; u < userInputs.length; u = u + 1) {
										if ($scope.item.name === userInputs[u].name) {
											return userInputs[u].name
										}
									}
								}
							}
						}

						return false
					}

					//region Classifier
					$scope.node = $scope.node || null

					function findNodeInChildren(item) {
						if (vm.model === item.id) {
							$scope.node = item
						} else {
							if (item.children.length) {
								item.children.forEach(findNodeInChildren)
							}
						}
					}

					var classifierTree

					function getNode() {
						return new Promise(function (resolve) {
							attributeTypeService
								.getByKey(vm.entityType, $scope.item.id)
								.then(function (data) {
									classifierTree = data
									classifierTree.classifiers.forEach(findNodeInChildren)

									resolve($scope.node)
								})
						})
					}

					var setSelectedNodeInsideEntity = function () {
						var attrIndex = $scope.entity.attributes.findIndex(function (attr) {
							return (
								attr.attribute_type_object.user_code === $scope.item.user_code
							)
						})

						$scope.entity.attributes[attrIndex].classifier = vm.model

						if ($scope.node) {
							$scope.entity.attributes[attrIndex].classifier_object =
								JSON.parse(JSON.stringify($scope.node))
						}
					}

					$scope.findNodeItem = function () {
						vm.readyStatus.classifier = false

						return new Promise(function (resolve) {
							getNode().then(function () {
								vm.readyStatus.classifier = true
								// $scope.node = data;
								setSelectedNodeInsideEntity()

								// $scope.entity[vm.fieldKey] = $scope.classifierId;
								resolve()
							})
						})
					}

					$scope.changeClassifier = function () {
						if (classifierTree) {
							/* $scope.classifierId = $scope.entity[vm.fieldKey];

                        $scope.findNodeItem().then(function () {
                            classifierTree.classifiers.forEach(findNodeInChildren);
                            $scope.$apply();

                            if ($scope.entityChange) {
                                $scope.entityChange({fieldKey: vm.fieldKey, fieldType: vm.fieldType.type});
                            }
                        }); */

							getNode().then(function (nodeData) {
								setSelectedNodeInsideEntity()

								if ($scope.entityChange) {
									$scope.entityChange({
										fieldKey: vm.fieldKey,
										fieldType: vm.fieldType.type,
									})
								}
							})
						}
					}

					//endregion Classifier

					$scope.styleForInputsWithButtons = function () {
						var styleValue = ''

						// -------------------- Space For Buttons -------------------
						var buttonsCount = 0

						if (
							vm.fieldType['display_name'] === 'Number' ||
							vm.fieldType['display_name'] === 'Float'
						) {
							buttonsCount = 1
						}

						if ($scope.item.options) {
							// for date specific buttons

							var optionsKeys = Object.keys($scope.item.options)

							if (optionsKeys && optionsKeys.length > 0) {
								optionsKeys.forEach(function (key) {
									if ($scope.item.options[key]) {
										buttonsCount = buttonsCount + 1
									}
								})
							}
						}

						if ($scope.item.buttons && $scope.item.buttons.length > 0) {
							buttonsCount = buttonsCount + $scope.item.buttons.length
						}

						if (buttonsCount > 0) {
							styleValue = 'padding-right: ' + buttonsCount * 34 + 'px; '
						}

						// ----------------------- Background Color -----------------

						if ($scope.options.backgroundColor) {
							styleValue =
								styleValue +
								'background-color: ' +
								$scope.options.backgroundColor +
								';'
						}

						return styleValue
					}

					vm.inputBackgroundColor = function () {
						var backgroundColor = ''

						if ($scope.options.backgroundColor) {
							backgroundColor =
								'background-color: ' + $scope.options.backgroundColor + ';'
						}

						return backgroundColor
					}

					/* $scope.openCalculatorDialog = function ($event) {

                                        var fieldModel = $scope.entity[vm.fieldKey];
                                        var calculatorTitle = "Calculator for: " + $scope.getName();

                                        $mdDialog.show({
                                                controller: 'CalculatorDialogController as vm',
                                                templateUrl: 'views/dialogs/calculator-dialog-view.html',
                                                targetEvent: $event,
                                                multiple: true,
                                                locals: {
                                                        data: {
                                                                numberValue: fieldModel,
                                                                calculatorTitle: calculatorTitle
                                                        }
                                                }

                                        }).then(function (res) {

                                                if (res.status === 'agree') {

                                                        $scope.entity[vm.fieldKey] = res.numberValue;
                                                        $scope.numericInputValue.numberVal = formatNumber(res.numberValue);

                                                }

                                        });

                                };

                                var formatNumber = function (numberVal) {

                                        if ($scope.numberFormat) {

                                                return renderHelper.formatValue({
                                                        value: numberVal
                                                }, {
                                                        key: 'value',
                                                        report_settings: $scope.numberFormat
                                                });

                                        } else {
                                                return numberVal
                                        }

                                };

                                $scope.onNumericInputFocus = function () {
                                        if (!numberIsInvalid && fieldHasValue) {
                                                $scope.numericInputValue.numberVal = JSON.parse(JSON.stringify($scope.entity[vm.fieldKey]));
                                        }
                                };

                                var fieldHasValue = true;
                                var numberIsInvalid;

                                $scope.numericItemChange = function () {

                                        numberIsInvalid = false;
                                        fieldHasValue = true;
                                        var changedValue = $scope.numericInputValue.numberVal;

                                        if (changedValue === '') {

                                                $scope.entity[vm.fieldKey] = null;
                                                fieldHasValue = false;

                                        } else if (!isNaN(changedValue) &&
                                                changedValue !== null) {

                                                if (Number.isInteger(changedValue)) {
                                                        changedValue = parseInt(changedValue);
                                                } else {
                                                        changedValue = parseFloat(changedValue);
                                                }

                                                // negative numbers processing
                                                /!*if ($scope.item.options.onlyPositive) {

                                                        if (parseFloat(changedValue) < 0) {
                                                                numberIsInvalid = true;
                                                        } else {
                                                                $scope.entity[vm.fieldKey] = JSON.parse(JSON.stringify(changedValue));
                                                        }

                                                } else {

                                                        $scope.entity[vm.fieldKey] = JSON.parse(JSON.stringify(changedValue));
                                                }*!/

                                                if (parseFloat(changedValue) < 0) {

                                                        if ($scope.numberFormat && $scope.numberFormat.negative_color_format_id === 1) {
                                                                numberInputElem.classList.add('negative-red');
                                                        }

                                                        if ($scope.item.options && $scope.item.options.onlyPositive) {
                                                                numberIsInvalid = true;
                                                        } else {
                                                                $scope.entity[vm.fieldKey] = JSON.parse(JSON.stringify(changedValue));
                                                        }

                                                } else {
                                                        numberInputElem.classList.remove('negative-red');
                                                        $scope.entity[vm.fieldKey] = JSON.parse(JSON.stringify(changedValue));
                                                }
                                                // < negative numbers processing >

                                        } else {

                                                numberIsInvalid = true;

                                        }

                                        if (numberIsInvalid) {

                                                $scope.entity[vm.fieldKey] = null;
                                                numberInputContainerElem.classList.add('md-input-invalid');
                                                numberInputElem.classList.add('ng-invalid', 'ng-invalid-number');

                                        } else {
                                                numberInputContainerElem.classList.remove('md-input-invalid');
                                                numberInputElem.classList.remove('ng-invalid', 'ng-invalid-number');
                                        }

                                        vm.itemChange();

                                };

                                $scope.onNumericInputBlur = function () {
                                        if (!numberIsInvalid && fieldHasValue) {
                                                var itemNumberValue = JSON.parse(JSON.stringify($scope.entity[vm.fieldKey]));
                                                $scope.numericInputValue.numberVal = formatNumber(itemNumberValue);
                                        }
                                };*/
					vm.checkForNotNull = function (options) {
						if ($scope.item.options && $scope.item.options.notNull) {
							options.notNull = true
						} else if (
							$scope.item.frontOptions &&
							($scope.item.frontOptions.notNull ||
								$scope.item.frontOptions.usedInExpr)
						) {
							options.notNull = true
						} else if (
							$scope.item.key &&
							vm.fieldType.type === 'systemAttribute'
						) {
							var requiredAttrs = metaService.getRequiredEntityAttrs(
								vm.entityType
							)

							if (requiredAttrs.indexOf($scope.item.key) > -1) {
								options.notNull = true
							}
						}

						return options
					}

					var getFieldBackgroundColor = function () {
						if ($scope.item.backgroundColor) {
							if (typeof $scope.item.backgroundColor === 'string') {
								$scope.options.backgroundColor = $scope.item.backgroundColor // allows old layouts keep its background color
							} else if (typeof $scope.item.backgroundColor === 'object') {
								var paletteData = $scope.item.backgroundColor
								var paletteNotFound = true

								var i, a
								loop1: for (i = 0; i < palettesList.length; i++) {
									if (
										palettesList[i].user_code === paletteData.paletteUserCode
									) {
										paletteNotFound = false

										for (a = 0; a < palettesList[i].colors.length; a++) {
											if (
												palettesList[i].colors[a].order ===
												paletteData.colorOrder
											) {
												$scope.options.backgroundColor =
													palettesList[i].colors[a].value
												break loop1
											}
										}
									}
								}

								if (paletteNotFound) {
									// if palette was not found, use default palette

									loop1: for (i = 0; i < palettesList.length; i++) {
										if (palettesList[i].user_code === 'Default Palette') {
											for (a = 0; a < palettesList[i].colors.length; a++) {
												if (
													palettesList[i].colors[a].order ===
													paletteData.colorOrder
												) {
													$scope.options.backgroundColor =
														palettesList[i].colors[a].value
													break loop1
												}
											}
										}
									}
								}
							}
						}
					}

					vm.setItemSettings = function () {
						if ($scope.item.options) {
							$scope.tooltipText = vm.getTooltipText()
						}

						if ($scope.options.backgroundColor) {
							$scope.customStyles = {
								customInputBackgroundColor:
									'background-color: ' + $scope.options.backgroundColor + ';',
							}
						}

						if ($scope.item.frontOptions) {
							if ($scope.item.frontOptions.recalculated) {
								$scope.ciEventObj.event = { key: 'set_style_preset1' }
							}
						}

						return {
							tooltipText: $scope.tooltipText,
							customStyles: $scope.customStyles,
							event: $scope.ciEventObj.event,
						}
					}

					/** Also used by entityViewerFieldResolverDirective */
					vm.getTooltipText = function () {
						var tooltipText

						if ($scope.item.options && $scope.item.options.tooltipValue) {
							tooltipText = $scope.item.options.tooltipValue
						} else if ($scope.item.tooltip) {
							tooltipText = $scope.item.tooltip
						} else {
							tooltipText = $scope.getName()
						}

						return tooltipText
					}

					var setItemSpecificSettings = function () {
						if (vm.evEditorDataService) {
							palettesList = vm.evEditorDataService.getColorPalettesList()
						}

						if ($scope.item.can_recalculate) {
							$scope.isRecalculate = true
						}

						//region fieldType
						vm.fieldType = null

						var i
						for (i = 0; i < choices.length; i = i + 1) {
							if (choices[i].value === $scope.item['value_type']) {
								vm.fieldType = choices[i]
								break
							}
						}

						if ($scope.item['value_type'] === 100) {
							vm.fieldType = choices[5] // relation == field, backend&frontend naming conflict
						}

						if (vm.fieldType) {
							var uInputIndex = userInputs.findIndex(function (input) {
								return input.name === vm.fieldKey
							})

							if ($scope.item.hasOwnProperty('id') && $scope.item.id !== null) {
								vm.fieldType.type = 'dynamicAttribute'
							} else if (uInputIndex > -1) {
								vm.fieldType.type = 'userInput'
							} else {
								vm.fieldType.type = 'systemAttribute'
							}
						}
						//endregion

						if (vm.fieldType && vm.fieldType.value === 40) {
							$scope.showEmptyInputBtn = $scope.item.key === 'maturity_date'
						}

						if ($scope.item.options) {
							// prepare data for number field
							if (vm.fieldType && vm.fieldType.value === 20) {
								if ($scope.item.options.number_format) {
									$scope.numberFormat = $scope.item.options.number_format
								}

								if (vm.fieldType.value === 20) {
									$scope.onlyPositive = $scope.item.options.onlyPositive
								}
							}
							// < prepare data for number field >

							//region Prepare data for date field
							if (vm.fieldType.value === 40) {
								if (!$scope.item.buttons) {
									$scope.item.buttons = []
								}

								if ($scope.item.options.dateTodayPlus) {
									$scope.item.buttons.push({
										iconObj: { type: 'angular-material', icon: 'add' },
										tooltip: 'Increase by one day',
										classes: 'date-input-specific-btns',
										action: { callback: $scope.setDatePlus },
									})
								}

								if ($scope.item.options.dateToday) {
									$scope.item.buttons.push({
										iconObj: {
											type: 'angular-material',
											icon: 'radio_button_unchecked',
										},
										tooltip: "Set today's date",
										classes: 'date-input-specific-btns',
										action: { callback: $scope.setDateToday },
									})
								}

								if ($scope.item.options.dateTodayMinus) {
									$scope.item.buttons.push({
										iconObj: { type: 'angular-material', icon: 'remove' },
										tooltip: 'Decrease by one day',
										classes: 'date-input-specific-btns',
										action: { callback: $scope.setDateMinus },
									})
								}
							}
							//endregion Prepare data for date field

							// $scope.tooltipText = vm.getTooltipText();
						}

						getFieldBackgroundColor()

						/* if ($scope.options.backgroundColor) {
                        $scope.customStyles = {
                            "customInputBackgroundColor": "background-color: " + $scope.options.backgroundColor + ";"
                        };
                    }

                    if ($scope.item.frontOptions) {

                        if ($scope.item.frontOptions.recalculated) {

                            $scope.ciEventObj.event = {key: "set_style_preset1"};

                        }

                    } */

						var setSettingsResult = vm.setItemSettings()

						$scope.tooltipText = setSettingsResult.tooltipText
						$scope.customStyles = setSettingsResult.customStyles
						$scope.ciEventObj.event = setSettingsResult.event
					}

					var initListeners = function () {
						eventListenersIndexesData['MARK_FIELDS_WITH_ERRORS'] =
							vm.evEditorEventService.addEventListener(
								evEditorEvents.MARK_FIELDS_WITH_ERRORS,
								function () {
									$scope.ciEventObj.event = { key: 'mark_not_valid_fields' }
								}
							)

						eventListenersIndexesData['ENTITY_UPDATED'] =
							vm.evEditorEventService.addEventListener(
								evEditorEvents.ENTITY_UPDATED,
								function () {
									var modelVal = vm.getValueFromEntity()

									if (vm.fieldType && $scope.entity) {
										if (
											vm.fieldType.value === 30 &&
											(modelVal || modelVal === 0) &&
											modelVal !== vm.model
										) {
											// prevents loader if classifier didn't change

											vm.model = modelVal

											$scope.findNodeItem().then(function () {
												$scope.$apply()
											})
										} else {
											vm.model = modelVal
										}
									}
								}
							)

						if (vm.entityType === 'complex-transaction') {
							eventListenersIndexesData['FIELDS_RECALCULATION_START'] =
								vm.evEditorEventService.addEventListener(
									evEditorEvents.FIELDS_RECALCULATION_START,
									function () {
										var userInputToRecalc =
											vm.evEditorDataService.getUserInputsToRecalculate()

										if (
											userInputToRecalc &&
											userInputToRecalc.includes(vm.fieldKey)
										) {
											vm.readyStatus.content = false
										}
									}
								)

							eventListenersIndexesData['FIELDS_RECALCULATION_END'] =
								vm.evEditorEventService.addEventListener(
									evEditorEvents.FIELDS_RECALCULATION_END,
									function () {
										var userInputToRecalc =
											vm.evEditorDataService.getUserInputsToRecalculate()

										if (
											userInputToRecalc &&
											userInputToRecalc.includes(vm.fieldKey)
										) {
											vm.readyStatus.content = true
										}

										/* if ($scope.item &&
								$scope.item.frontOptions && $scope.item.frontOptions.recalculated &&
								($scope.entity[vm.fieldKey] || $scope.entity[vm.fieldKey] === 0)) {

								setItemSpecificSettings();

							} */

										vm.model = vm.getValueFromEntity()

										if (
											$scope.item &&
											$scope.item.frontOptions &&
											$scope.item.frontOptions.recalculated &&
											(vm.model || vm.model === 0)
										) {
											setItemSpecificSettings()
										}
									}
								)
						}

						/* vm.evEditorEventService.addEventListener(evEditorEvents.FIELD_CHANGED, function () {

                        var changedUserInputData;

                        if (vm.evEditorDataService) {
                            changedUserInputData = vm.evEditorDataService.getChangedUserInputData();
                        }

                        if (changedUserInputData &&
                            changedUserInputData.frontOptions &&
                            changedUserInputData.frontOptions.linked_inputs_names) {

                            if (changedUserInputData.frontOptions.linked_inputs_names.includes(vm.fieldKey)) {
                                $scope.ciEventObj.event = {key: "set_style_preset2"};
                            }

                        }

                    }); */
					}

					/*$scope.$watch('eventSignal', function () {
                                        if ($scope.eventSignal) {
                                                $scope.ciEventObj.event = $scope.eventSignal;
                                        }
                                });*/

					$scope.recalculate = function () {
						if ($scope.recalculateFunction) {
							const paramsObj =
								$scope.item &&
								$scope.item.buttons[0] &&
								$scope.item.buttons[0].action &&
								$scope.item.buttons[0].action.parameters

							if (paramsObj) {
								$scope.recalculateFunction(paramsObj)
							}
						}
					}

					vm.itemChange = function () {
						$scope.entity = vm.setValueInsideEntity(vm.model)
						vm.evEditorEventService.dispatchEvent(evEditorEvents.ENTITY_UPDATED) // update copies of field inside other tabs (e.g. maturity date)

						if ($scope.entityChange) {
							$scope.entityChange({
								fieldKey: vm.fieldKey,
								fieldType: vm.fieldType.type,
							})
						}
					}

					$scope.inputBlur = function () {
						if ($scope.onFieldBlur) {
							$scope.onFieldBlur()
						}
					}

					//region Datepicker
					$scope.setDateToday = function () {
						/* $scope.entity[vm.fieldKey] = moment(new Date()).format(
						"YYYY-MM-DD"
					); */
						const todaysDate = moment(new Date()).format('YYYY-MM-DD')

						if (vm.model !== todaysDate) {
							vm.model = todaysDate
							vm.itemChange()
						}
					}

					$scope.setDatePlus = function () {
						/* const date = $scope.entity[vm.fieldKey] ? new Date($scope.entity[vm.fieldKey]) : new Date();

					$scope.entity[vm.fieldKey] = moment(date)
						.add(1, "days")
						.format("YYYY-MM-DD"); */
						const date = vm.model ? new Date(vm.model) : new Date()
						vm.model = moment(date).add(1, 'days').format('YYYY-MM-DD')

						vm.itemChange()
					}

					$scope.setDateMinus = function () {
						/* let date = $scope.entity[vm.fieldKey] ? new Date($scope.entity[vm.fieldKey]) : new Date();
					$scope.entity[vm.fieldKey] = moment(date)
						.subtract(1, "days")
						.format("YYYY-MM-DD"); */

						const date = vm.model ? new Date(vm.model) : new Date()
						vm.model = moment(date).subtract(1, 'days').format('YYYY-MM-DD')

						vm.itemChange()
					}

					$scope.onDateChange = function () {
						if (vm.model === '') {
							vm.model = null
						}

						vm.itemChange()
					}
					//endregion Datepicker

					vm.calculateDecorationExpression = function () {
						expressionService
							.getResultOfExpression({
								expression: $scope.item.options.expression,
								names1: $scope.entity,
								is_eval: true,
							})
							.then(function (data) {
								if (data.result) {
									$scope.item.options.result = data.result
								} else {
									$scope.item.options.result = data
								}
							})
					}

					var init = function () {
						vm.fieldKey = $scope.getModelKey()

						$scope.options = {}

						if (
							metaService.getEntitiesWithSimpleFields().includes(vm.entityType)
						) {
							$scope.options = {
								entityType: vm.entityType,
								key: vm.fieldKey,
							}
						}

						var tooltipsList = []

						if (vm.evEditorDataService) {
							tooltipsList = vm.evEditorDataService.getTooltipsData()
							$scope.recalculateFunction =
								vm.evEditorDataService.getRecalculationFunction()
						}

						for (var i = 0; i < tooltipsList.length; i++) {
							if (tooltipsList[i].key === vm.fieldKey) {
								$scope.tooltipText = tooltipsList[i].text
								break
							}
						}

						if ($scope.item) {
							setItemSpecificSettings()
						}

						if (vm.fieldType) {
							// should be called after setItemSpecificSettings()

							vm.model = vm.getValueFromEntity()

							if (vm.evEditorEventService) {
								initListeners()
							}

							if (vm.fieldType.value === 30) {
								// For classifier
								if ($scope.entity) {
									// $scope.classifierId = $scope.entity[vm.fieldKey];

									$scope.findNodeItem().then(function () {
										$scope.$apply()
									})
								}
							}

							if (
								vm.fieldType['display_name'] === 'Decoration' &&
								$scope.item.key === 'layoutCalculatedText'
							) {
								vm.calculateDecorationExpression()
							}
						}

						$scope.options = vm.checkForNotNull($scope.options)

						/* if (vm.fieldType && vm.fieldType.value === 20) {

                        $scope.numericInputValue.numberVal = null;
                        setTimeout(function () {
                            numberInputContainerElem = elem[0].querySelector('.bfNumberInputContainer');
                            numberInputElem = elem[0].querySelector('.bfNumberInput');
                        }, 500);

                        if ($scope.entity[vm.fieldKey] || $scope.entity[vm.fieldKey] === 0) {

                            var itemNumberValue = JSON.parse(JSON.stringify($scope.entity[vm.fieldKey]));
                            $scope.numericInputValue.numberVal = formatNumber(itemNumberValue);

                        }

                    } */
					}

					init()

					$scope.$on('$destroy', function () {
						Object.keys(eventListenersIndexesData).forEach(function (
							eventName
						) {
							var eventIndex = eventListenersIndexesData[eventName]
							vm.evEditorEventService.removeEventListener(eventName, eventIndex)
						})
					})
				},
			],
		}
	}
</script>

<style lang="scss" scoped></style>
