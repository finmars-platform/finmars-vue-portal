import evEditorEvents from '@/angular/services/ev-editor/entityViewerEditorEvents'

import expressionService from '@/angular/services/expression.service'

import entityEditorHelper from '@/angularlpers/entity-editor.helper'
import transactionHelper from '@/angularlpers/transaction.helper'

export default function (viewModel, $scope, $mdDialog) {
    const entityTabsMenuTplt =
        '<div class="ev-editor-tabs-popup-content popup-menu">' +
        '<md-button ng-repeat="tab in popupData.viewModel.entityTabs" ' +
        'class="entity-tabs-menu-option popup-menu-option" ' +
        'ng-class="popupData.viewModel.sharedLogic.getTabBtnClasses(tab)" ' +
        'ng-click="popupData.viewModel.activeTab = tab">' +
        '<span>{{tab.label}}</span>' +
        '<div ng-if="popupData.viewModel.sharedLogic.isTabWithErrors(tab)" class="tab-option-error-icon">' +
        '<span class="material-icons orange-text">info<md-tooltip class="tooltip_2 error-tooltip" md-direction="top">Tab has errors</md-tooltip></span>' +
        '</div>' +
        '</md-button>' +
        '</div>'

    const getTabBtnClasses = function (tab) {
        var result = []

        if (viewModel.activeTab.label === tab.label) {
            result.push('active-tab-button')
        }

        // if (isTabWithErrors(tab)) {
        //     result.push('error-menu-option');
        // }

        return result
    }

    const removeUserInputsInvalidForRecalculation = function (
        inputsList,
        actualUserInputs
    ) {
        inputsList.forEach(function (inputName, index) {
            // remove deleted inputs from list for recalculation

            let inputInvalid = true

            if (inputName) {
                for (let i = 0; i < actualUserInputs.length; i++) {
                    if (inputName === actualUserInputs[i].name) {
                        // whether input actually exist

                        if (actualUserInputs[i].value_expr) {
                            // whether input has expression for recalculation

                            inputInvalid = false
                        }

                        break
                    }
                }
            }

            if (inputInvalid) {
                inputsList.splice(index, 1)
            }
        })

        // return inputsList;
    }

    const preRecalculationActions = (inputs, updateScope) => {
        let book = {
            transaction_type: viewModel.entity.transaction_type,
            recalculate_inputs: inputs,
            process_mode: 'recalculate',
            values: {},
        }

        // const allUserInputs = viewModel.transactionType.inputs || [];

        /* viewModel.userInputs.forEach(function (item) {
                book.values[item.name] = viewModel.entity[item.name]
            });

            allUserInputs.forEach(function (item) {
                book.values[item.name] = viewModel.entity[item.name]
            }); */
        book.values = mapUserInputsOnEntityValues(book.values)

        viewModel.evEditorDataService.setUserInputsToRecalculate(inputs)
        viewModel.evEditorEventService.dispatchEvent(
            evEditorEvents.FIELDS_RECALCULATION_START
        )

        if (updateScope) $scope.$apply()

        return book
    }

    const processRecalculationResolve = function (
        recalculationPromise,
        inputs,
        recalculationData
    ) {
        recalculationPromise.then(function (data) {



            inputs.forEach((inputName) => {
                viewModel.entity.values[inputName] = data.values[inputName]

                if (data.values[inputName + '_object']) {
                    viewModel.entity.values[inputName + '_object'] =
                        data.values[inputName + '_object']
                }

                let recalculatedUserInput = viewModel.userInputs.find(
                    (input) => input.name === inputName
                )

                if (recalculatedUserInput)
                    recalculatedUserInput.frontOptions.recalculated = recalculationData
            })

            viewModel.evEditorEventService.dispatchEvent(
                evEditorEvents.FIELDS_RECALCULATION_END
            )

            $scope.$apply()
        })
    }

    const mapUserInputsOnEntityValues = function (entityValues) {
        if (!entityValues) entityValues = {}
        const allUserInputs = viewModel.transactionType.inputs || []

        allUserInputs.forEach((uInput) => {
            if (uInput !== null) {
                if (viewModel.entity.values.hasOwnProperty(uInput.name)) {
                    entityValues[uInput.name] = viewModel.entity.values[uInput.name]

                    if (uInput.value_type === 120) entityValues[uInput.name] = true // Required for button user input
                }
            }
        })

        return entityValues
    }

    const updateAttributesInsideEntity = function (attrsList) {
        viewModel.tabs.forEach(function (tab) {
            tab.layout.fields.forEach(function (field) {
                if (field.attribute_class === 'attr') {
                    const attrType = viewModel.attrs.find(
                        (attr) => attr.user_code === field.attribute.user_code
                    )

                    if (attrType) {
                        /* const attrIndex = attrsList.findIndex(attr => attr.attribute_type_object.user_code === field.attribute.user_code);

                            if (attrIndex < 0) {
                                attrsList.push(entityEditorHelper.appendAttribute(attrType));

                            } else if (attrsList[attrIndex].attribute_type_object.id !== attrType.id) {
                                // properties user_code match but attribute types are different
                                const valueTypesAreDifferent = attrsList[attrIndex].attribute_type_object.value_type !== attrType.value_type;

                                attrsList[attrIndex].attribute_type_object = attrType;
                                attrsList[attrIndex].attribute_type = attrType;

                                if (valueTypesAreDifferent) {

                                    attrsList[attrIndex].value_string = null;
                                    attrsList[attrIndex].value_float = null;
                                    attrsList[attrIndex].classifier = null;
                                    attrsList[attrIndex].value_date = null;

                                }

                            } */
                        attrsList = entityEditorHelper.updateAttribute(attrsList, attrType)
                    } /*else {
                            // TODO: process dynamic attributes inside tabs that were deleted or whose user_code changed
                        }*/
                }
            })
        })

        return attrsList
    }

    const postBookRebookActions = function (cTransactionData, recalculateFn) {
        // ng-repeat with bindFieldControlDirective may not update without this
        viewModel.tabs = {}
        viewModel.fixedArea = {}
        // < ng-repeat with bindFieldControlDirective may not update without this >

        if (Array.isArray(cTransactionData.book_transaction_layout.data)) {
            viewModel.tabs = cTransactionData.book_transaction_layout.data
        } else {
            viewModel.tabs = cTransactionData.book_transaction_layout.data.tabs
            viewModel.fixedArea =
                cTransactionData.book_transaction_layout.data.fixedArea
        }

        const dataConstructorLayout = JSON.parse(
            JSON.stringify(cTransactionData.book_transaction_layout)
        ) // unchanged layout that is used to remove fields without attributes

        viewModel.entity.attributes = updateAttributesInsideEntity(
            viewModel.entity.attributes
        )

        viewModel.userInputs = transactionHelper.updateTransactionUserInputs(
            viewModel.userInputs,
            viewModel.tabs,
            viewModel.fixedArea,
            viewModel.transactionType
        )

        viewModel.inputsWithCalculations =
            cTransactionData.transaction_type_object.inputs

        if (viewModel.inputsWithCalculations) {
            viewModel.inputsWithCalculations.forEach(function (inputWithCalc) {
                viewModel.userInputs.forEach(function (userInput) {
                    if (userInput.name === inputWithCalc.name) {
                        if (!userInput.buttons) {
                            userInput.buttons = []
                        }

                        if (inputWithCalc.can_recalculate === true) {
                            userInput.buttons.push({
                                // iconObj: {type: 'fontawesome', icon: 'fas fa-redo'},
                                iconObj: { type: 'angular-material', icon: 'refresh' },
                                tooltip: 'Recalculate this field',
                                caption: '',
                                classes: '',
                                action: {
                                    key: 'input-recalculation',
                                    callback: recalculateFn,
                                    parameters: {
                                        inputs: [inputWithCalc.name],
                                        recalculationData: 'input',
                                    },
                                },
    						})
						}

						if (
							inputWithCalc.settings &&
							inputWithCalc.settings.linked_inputs_names
						) {
							const linkedInputsList =
								inputWithCalc.settings.linked_inputs_names.split(',')

							userInput.buttons.push({
								iconObj: { type: 'angular-material', icon: 'loop' },
								tooltip: 'Recalculate linked fields',
								caption: '',
								classes: '',
								action: {
									key: 'linked-inputs-recalculation',
									callback: recalculateFn,
									parameters: {
										inputs: linkedInputsList,
										recalculationData: 'linked_inputs',
									},
								},
							})
						}
					}
				})
			})
		}

		return {
			attributes: viewModel.entity.attributes,
			tabs: viewModel.tabs,
			fixedArea: viewModel.fixedArea,
			dataConstructorLayout: dataConstructorLayout,
			inputsWithCalculations: viewModel.inputsWithCalculations,
			userInputs: viewModel.userInputs,
		}
	}

	const fillMissingFieldsByDefaultValues = async function (
		entity,
		userInputs,
		ttype
	) {
		const formFieldsNames = userInputs.map((input) => input.name)
		const userInputsNotPlacedInTheForm = ttype.inputs.filter(
			(input) => !formFieldsNames.includes(input.name)
		)

		const missingFieldsPromises = []

		userInputsNotPlacedInTheForm
			.filter((input) => !entity[input.name] && !!input.value) // take inputs if property is empty and input have default value
			.forEach((input) => {
				if (input.value_type === 20) {
					// Expression

					const expressionPromise = expressionService
						.getResultOfExpression({ expression: input.value })
						.then((data) => (entity[input.name] = data.result)) // set property after expression resolved
						.catch((error) => {
							console.error(
								'fillMissingFieldsByDefaultValues expression error',
								error
							)
						})

					missingFieldsPromises.push(expressionPromise)
				} else {
					entity[input.name] = input.value // set property as default value
				}
			})

		return Promise.allSettled(missingFieldsPromises)
	}

	const bindFlex = function (tab, field) {
		var flexUnit = 100 / tab.layout.columns
		return Math.floor(field.colspan * flexUnit)
	}

	const checkFieldRender = function (tab, row, field) {
		if (field.row === row) {
			if (field.type !== 'empty') {
				return true
			} else {
				var spannedCols = []
				var itemsInRow = tab.layout.fields.filter(function (item) {
					return item.row === row
				})

				itemsInRow.forEach(function (item) {
					if (item.type !== 'empty' && item.colspan > 1) {
						var columnsToSpan = item.column + item.colspan - 1

						for (var i = item.column; i <= columnsToSpan; i = i + 1) {
							spannedCols.push(i)
						}
					}
				})

				if (spannedCols.indexOf(field.column) !== -1) {
					return false
				}

				return true
			}
		}

		return false
	}

	let recalculateTimeoutID

	const onFieldChange = function (fieldKey) {
		if (fieldKey) {
			/* Mark linked inputs that are recalculated on parent input change
                if (inputsWithCalculations) {

                    var i, a;
                    for (i = 0; i < viewModel.userInputs.length; i++) {

                        if (viewModel.userInputs[i].key === fieldKey) {

                            var uInputName = viewModel.userInputs[i].name;

                            for (a = 0; a < inputsWithCalculations.length; a++) {

                                var inputWithCalc = inputsWithCalculations[a];

                                if (inputWithCalc.name === uInputName &&
                                    inputWithCalc.settings) {

                                    var changedUserInputData = JSON.parse(JSON.stringify(viewModel.userInputs[i]));

                                    if (inputWithCalc.settings.linked_inputs_names) {

                                        changedUserInputData.frontOptions.linked_inputs_names = JSON.parse(JSON.stringify(
                                            inputWithCalc.settings.linked_inputs_names.split(",")
                                        ));

                                    }

                                    if (inputWithCalc.settings.recalc_on_change_linked_inputs) {

                                        changedUserInputData.frontOptions.recalc_on_change_linked_inputs = JSON.parse(JSON.stringify(
                                            inputWithCalc.settings.recalc_on_change_linked_inputs.split(",")
                                        ));

                                    }

                                    viewModel.evEditorDataService.setChangedUserInputData(changedUserInputData);

                                    viewModel.evEditorEventService.dispatchEvent(evEditorEvents.FIELD_CHANGED);

                                    break;

                                }

                            }

                            break;
                        }

                    }

                } */

			let userInput = viewModel.userInputs.find(
				(input) => input.key === fieldKey
			)

			if (userInput) {
				let calcInput

				if (viewModel.inputsWithCalculations) {
					calcInput = viewModel.inputsWithCalculations.find((input) => {
						return (
							input.name === userInput.name &&
							input.settings &&
							input.settings.recalc_on_change_linked_inputs
						)
					})
				}

				if (calcInput) {
					let linkedInputsNames =
						calcInput.settings.recalc_on_change_linked_inputs.split(',')

					viewModel.evEditorDataService.setUserInputsToRecalculate(
						linkedInputsNames
					)

					clearTimeout(recalculateTimeoutID)

					recalculateTimeoutID = setTimeout(() => {
						viewModel.recalculate({
							inputs: linkedInputsNames,
							recalculationData: 'linked_inputs',
							updateScope: true,
						})
					}, 1200)
				}
			}

			// When all faulty fields corrected, remove tab's error indicator.
			var attributes = {
				entityAttrs: viewModel.entityAttrs,
				attrsTypes: viewModel.attrs,
				userInputs: viewModel.userInputs,
			}

			/* entityEditorHelper.checkTabsForErrorFields(
                    fieldKey,
                    viewModel.errorFieldsList,
                    viewModel.tabsWithErrors,
                    attributes,
                    viewModel.entity,
                    viewModel.entityType,
                    viewModel.tabs
                ); */
			entityEditorHelper.checkTabsForErrorFields(
				fieldKey,
				viewModel.evEditorDataService,
				attributes,
				viewModel.entity,
				viewModel.entityType,
				viewModel.tabs
			)
			// < When all faulty fields corrected, remove tab's error indicator. >
		}
	}

	/* const processTabsErrors = function (errors) {

            const entityTabsMenuBtn = document.querySelector('.entityTabsMenu');

            let formErrorsList = viewModel.evEditorDataService.getFormErrorsList();
            let tabsWithErrors = viewModel.evEditorDataService.getLocationsWithErrors();

            errors.forEach(errorObj => {

                if (errorObj.locationData &&
                    errorObj.locationData.type === 'system_tab' || errorObj.locationData.type === 'user_tab') {

                    var tabName = errorObj.locationData.name.toLowerCase();

                    if (errorObj.locationData.type === 'user_tab') {

                        const selectorString = ".evFormUserTabName[data-tab-name='" + tabName + "']";
                        const tabNameElem = document.querySelector(selectorString);

                        if (tabNameElem) tabNameElem.classList.add('error-tab');

                    }
                    else if (errorObj.locationData.type === 'system_tab') {
                        entityTabsMenuBtn.classList.add('error-tab');
                    }

                    if (!tabsWithErrors.hasOwnProperty(tabName)) { // if it is tab's first error, create property
                        tabsWithErrors[tabName] = [errorObj.key];

                    } else if (!tabsWithErrors[tabName].includes(errorObj.key)) { // if there is no same error, add it
                        tabsWithErrors[tabName].push(errorObj.key);

                    }

                    /!* if (!errorFieldsList.includes(errorObj.key)) {

                        errorFieldsList.push(errorObj.key);
                        viewModel.evEditorDataService.setFormErrorsList(errorFieldsList);

                    } *!/
                    if (!formErrorsList.includes(errorObj.key)) formErrorsList.push(errorObj.key);

                }

            });

            viewModel.evEditorDataService.setTabsWithErrors(tabsWithErrors);
            viewModel.evEditorDataService.setFormErrorsList(formErrorsList);

        }; */

	return {
		preRecalculationActions: preRecalculationActions,
		removeUserInputsInvalidForRecalculation:
			removeUserInputsInvalidForRecalculation,
		processRecalculationResolve: processRecalculationResolve,

		mapUserInputsOnEntityValues: mapUserInputsOnEntityValues,

		postBookRebookActions: postBookRebookActions,
		fillMissingFieldsByDefaultValues: fillMissingFieldsByDefaultValues,

		bindFlex: bindFlex,
		checkFieldRender: checkFieldRender,
		onFieldChange: onFieldChange,

		entityTabsMenuTplt: entityTabsMenuTplt,
		getTabBtnClasses: getTabBtnClasses,
		// processTabsErrors: processTabsErrors
	}
}
