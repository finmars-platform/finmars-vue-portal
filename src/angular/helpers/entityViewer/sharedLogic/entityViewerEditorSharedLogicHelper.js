import metaService from '@/angular/services/metaService'
import evHelperService from '@/angular/services/entityViewerHelperService'

import instrumentTypeService from '@/angular/services/instrumentTypeService'

import entityEditorHelper from '@/angular/helpers/entity-editor.helper'

import evEditorEvents from '@/angular/services/ev-editor/entityViewerEditorEvents'

import metaHelper from '@/angular/helpers/meta.helper'

export default function (
    viewModel,
    $scope,
    $mdDialog,
    $bigDrawer,
    instrumentService,
    entityResolverService,
    fieldResolverService,
    attributeTypeService,
    uiService
) {
    let bigDrawerResizeButton

    let readyStatusObj = { permissions: false, entity: false, layout: false }

    if (viewModel.entityType === 'instrument') readyStatusObj.exposureTab = false

    const typeSelectorValueEntities = {
        instrument: 'instrument-type',
        account: 'account-type',
        'instrument-type': 'instrument-class',
    }

    const groupSelectorValueEntities = {
        'strategy-1': 'strategy-1-subgroup',
        'strategy-2': 'strategy-2-subgroup',
        'strategy-3': 'strategy-3-subgroup',
        responsible: 'responsible-group',
        counterparty: 'counterparty-group',
    }

    // let instrumentTypesList = [];
    const reqSysAttrs = metaService.getRequiredEntityAttrs(viewModel.entityType)
    const noEntityTabs = ['']
    const dialogParent = document.querySelector('.dialog-containers-wrap')

    //region entityTabsMenuTplt
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
        '<md-button ng-if="popupData.viewModel.canManagePermissions" class="entity-tabs-menu-option popup-menu-option" ng-class="{\'active-tab-button\': popupData.viewModel.activeTab === \'permissions\'}" ng-click="popupData.viewModel.activeTab = \'permissions\'">' +
        '<span>Permissions</span>' +
        '</md-button>' +
        '</div>'
    //endregion

    //region Fixed area
    /*const getFixedAreaPopup = function () {
            return {
                fields: {
                    showByDefault: {
                        value: viewModel.showByDefault
                    }
                },
                entityType: viewModel.entityType,
                tabColumns: null,
                event: {}
            };
        };*/

    const getEditFormFieldsInFixedArea = function () {
        const fieldsInFixedArea = []

        if (viewModel.fixedAreaPopup.tabColumns > 2) {
            if (
                viewModel.entityType === 'instrument' ||
                viewModel.entityType === 'account' ||
                viewModel.entityType === 'instrument-type'
            ) {
                fieldsInFixedArea.push(viewModel.typeFieldName)
            } else {
                fieldsInFixedArea.push('short_name')
            }
        }

        return fieldsInFixedArea
    }

    const getAddFormFieldsInFixedArea = function () {
        const fieldsInFixedArea = []

        if (viewModel.fixedAreaPopup.tabColumns > 2) {
            switch (viewModel.entityType) {
                case 'instrument':
                case 'account':
                case 'instrument-type':
                    fieldsInFixedArea.push(viewModel.typeFieldName)
                    break

                case 'counterparty':
                case 'responsible':
                    fieldsInFixedArea.push('group')
                    break

                case 'strategy-1':
                case 'strategy-2':
                case 'strategy-3':
                    fieldsInFixedArea.push('subgroup')
                    break

                default:
                    fieldsInFixedArea.push('short_name')
                    break
            }
        }

        if (viewModel.fixedAreaPopup.tabColumns > 5) {
            if (
                viewModel.entityType === 'instrument' ||
                viewModel.entityType === 'account' ||
                viewModel.entityType === 'instrument-type'
            ) {
                fieldsInFixedArea.push('short_name')
            } else {
                fieldsInFixedArea.push('user_code')
            }
        }

        return fieldsInFixedArea
    }

    const getFieldsOutsideOfPopup = function () {
        if (viewModel.action === 'edit') {
            return getEditFormFieldsInFixedArea()
        } else {
            return getAddFormFieldsInFixedArea()
        }
    }

    /* FIXED AREA POPUP

        const onPopupSaveCallback = async function () {

            const fieldsOutsideOfPopup = getFieldsOutsideOfPopup();
            // Fixating showByDefault because viewModel.fixedAreaPopup.fields.showByDefault.value can be changed by getAndFormatUserTabs();
            const showByDefaultAfterSave = viewModel.fixedAreaPopup.fields.showByDefault.value;

            if (viewModel.entityType === 'instrument') {

                // On change of instrument type for instrument
                if (viewModel.fixedAreaPopup.tabColumns < 3 &&
                    viewModel.fixedAreaPopup.fields.type.value !== viewModel.entity.instrument_type) {

                    viewModel.entity.instrument_type = viewModel.fixedAreaPopup.fields.type.value;
                    // const showByDefaultValue = viewModel.showByDefault;
                    const formLayoutData = await getAndFormatUserTabs();

                    viewModel.tabs = formLayoutData.tabs;
                    viewModel.attributesLayout = formLayoutData.attributesLayout;
                    $scope.$apply();
                    // set 'show by default' that user saved in popup after it was changed by getAndFormatUserTabs()
                    // viewModel.showByDefault = showByDefaultValue;
                }

            }

            viewModel.keysOfFixedFieldsAttrs.forEach(key => { // transfer changes from popup to entity

                if (!key || fieldsOutsideOfPopup.includes(key)) {
                    return;
                }

                // const fieldKey = (key === 'instrument_type' || key === 'instrument_class') ? 'type' : key
                const fieldKey = entityEditorHelper.getFieldKeyForFAPopup(key, viewModel.entityType);
                viewModel.entity[key] = viewModel.fixedAreaPopup.fields[fieldKey].value;

            });

            if (viewModel.fixedAreaPopup.tabColumns <= 5) { // if status selector inside popup

                if (viewModel.entityStatus !== viewModel.fixedAreaPopup.fields.status.value) {
                    viewModel.entityStatus = viewModel.fixedAreaPopup.fields.status.value;
                    viewModel.entityStatusChanged();
                }

            }

            if (viewModel.showByDefault !== showByDefaultAfterSave) {

                viewModel.nameToShow = showByDefaultAfterSave;
                // viewModel.fixedAreaPopup.fields.showByDefault.value = viewModel.nameToShow;
                // save layout settings
                viewModel.dataConstructorLayout.data.fixedArea.showByDefault = viewModel.nameToShow;
                uiService.updateEditLayout(viewModel.dataConstructorLayout.id, viewModel.dataConstructorLayout).then(layoutData => {
                    viewModel.dataConstructorLayout = JSON.parse(JSON.stringify(layoutData));
                });

            }

            if (viewModel.fixedAreaPopup.error) {

                let popupHasNoErrors = true;

                /!* const attributes = {
                    entityAttrs: viewModel.entityAttrs,
                    attrsTypes: viewModel.attributeTypes
                } *!/

                for (const popupFieldKey in viewModel.originalFixedAreaPopupFields) {

                    const fieldError = viewModel.originalFixedAreaPopupFields[popupFieldKey].error;
                    const efKey = viewModel.originalFixedAreaPopupFields[popupFieldKey].entityFieldKey;

                    if (fieldError) {

                        // entityEditorHelper.checkTabsForErrorFields(efKey, viewModel.evEditorDataService, attributes, viewModel.entity, viewModel.entityType, viewModel.tabs);
                        entityEditorHelper.checkFixedAreaForErrorFields(efKey, viewModel.evEditorDataService, viewModel.entityAttrs, viewModel.entity);
                        const formErrorsList = viewModel.evEditorDataService.getFormErrorsList();
                        const fieldErrorNotCorrected = formErrorsList.includes(efKey);

                        if (fieldErrorNotCorrected) {

                            viewModel.fixedAreaPopup.fields[popupFieldKey].event = {key: 'error', error: fieldError};
                            popupHasNoErrors = false;

                        } else {

                            delete viewModel.fixedAreaPopup.fields[popupFieldKey].event;

                            // remove error mode from Group crud selector in case of expanding drawer
                            if (efKey === 'group') viewModel.groupSelectorEventObj.event = {key: 'reset'};

                        }

                    }

                }

                if (popupHasNoErrors) {
                    delete viewModel.fixedAreaPopup.error;
                    viewModel.fixedAreaPopup.event = {key: 'reset'};

                } else { // resending signal about error, in case of error mode was disabled inside textInputDirective
                    viewModel.fixedAreaPopup.event = {key: "error", error: viewModel.fixedAreaPopup.error};
                }

            }

            viewModel.originalFixedAreaPopupFields = JSON.parse(JSON.stringify(viewModel.fixedAreaPopup.fields));

        };

        const onFixedAreaPopupCancel = function () {

            viewModel.fixedAreaPopup.fields = JSON.parse(JSON.stringify(viewModel.originalFixedAreaPopupFields));

            for (const fieldKey in viewModel.fixedAreaPopup.fields) { // turn on error mode of fields when popup opens

                const fieldData = viewModel.fixedAreaPopup.fields[fieldKey];

                if (fieldData.error) {
                    viewModel.fixedAreaPopup.fields[fieldKey].event = {key: 'error', error: fieldData.error};
                }

            }

        }; */
    const onNameToShowChange = function () {
        if (
            viewModel.nameToShow !==
            viewModel.dataConstructorLayout.data.fixedArea.showByDefault
        ) {
            // save layout settings
            viewModel.dataConstructorLayout.data.fixedArea.showByDefault =
                viewModel.nameToShow

            uiService
                .updateEditLayout(
                    viewModel.dataConstructorLayout.id,
                    viewModel.dataConstructorLayout
                )
                .then((layoutData) => {
                    viewModel.dataConstructorLayout = JSON.parse(
                        JSON.stringify(layoutData)
    				)
				})
		}
	}

	const getFaField1Classes = function () {
		if (viewModel.tabColumns > 3) {
			return 'flex-basis-33 width-33 max-width-50'
		} else if (viewModel.tabColumns === 3) {
			return 'flex-basis-66 width-66 m-b-13 max-width-66'
		} else {
			return 'flex-basis-100 m-b-13'
		}
	}

	const getFaField2Classes = function () {
		if (viewModel.tabColumns > 3) {
			return 'flex-basis-33 width-33'
		} else if (viewModel.tabColumns === 3) {
			return 'flex-basis-33 width-33'
		} else {
			return 'flex-basis-100 m-b-13'
		}
	}

	const getFaField3Classes = function () {
		if (viewModel.tabColumns > 3) {
			return 'flex-basis-33 width-33 max-width-50'
		} else if (viewModel.tabColumns === 3) {
			return 'flex-basis-33 width-33 max-width-66'
		} else {
			return 'flex-basis-100'
		}
	}

	const isNotNullInput = function (inputKey) {
		return reqSysAttrs.includes(inputKey)
	}
	//endregion Fixed area

	const fixFieldsLayoutWithMissingSockets = function (tabs) {
		let socketsHasBeenAddedToTabs = entityEditorHelper.fixCustomTabs(
			tabs,
			viewModel.dataConstructorLayout
		)

		/* CODE FOR FIXED AREA INSIDE INPUT FORM EDITOR
            if (viewModel.fixedArea && viewModel.fixedArea.isActive) {
                var socketsHasBeenAddedToFixedArea = entityEditorHelper.fixCustomTabs(viewModel.fixedArea, viewModel.dataConstructorLayout);
            }
            < CODE FOR FIXED AREA INSIDE INPUT FORM EDITOR >
            */

		if (socketsHasBeenAddedToTabs) {
			viewModel.dcLayoutHasBeenFixed = true
		}
	}

	const mapAttributesToLayoutFields = (tabs) => {
		const entityAttrs = JSON.parse(JSON.stringify(viewModel.entityAttrs))

		if (viewModel.entityType === 'instrument') {
			var accrualsTableData = {
				name: 'Accruals schedules table',
				key: 'accrual_calculation_schedules',
				value_type: 'table',
			}

			var eventsTableData = {
				name: 'Events schedules table',
				key: 'event_schedules',
				value_type: 'table',
			}

			entityAttrs.push(accrualsTableData, eventsTableData)
		}

		const attributes = {
			entityAttrs: entityAttrs,
			dynamicAttrs: viewModel.attributeTypes,
			layoutAttrs: viewModel.layoutAttrs,
		}

		const attributesLayoutData =
			entityEditorHelper.generateAttributesFromLayoutFields(
				tabs,
				attributes,
				viewModel.dataConstructorLayout,
				true
			)

		// viewModel.attributesLayout = attributesLayoutData.attributesLayout;
		const attributesLayout = attributesLayoutData.attributesLayout

		/* CODE FOR FIXED AREA INSIDE INPUT FORM EDITOR
			if (viewModel.fixedArea && viewModel.fixedArea.isActive) {
				var fixedAreaAttributesLayoutData = entityEditorHelper.generateAttributesFromLayoutFields(viewModel.fixedArea, attributes, viewModel.dataConstructorLayout, true);

				viewModel.fixedAreaAttributesLayout = fixedAreaAttributesLayoutData.attributesLayout;
			}
            < CODE FOR FIXED AREA INSIDE INPUT FORM EDITOR >
            */

		if (attributesLayoutData.dcLayoutHasBeenFixed) {
			viewModel.dcLayoutHasBeenFixed = true
		}

		return attributesLayout
	}

	const mapAttributesAndFixFieldsLayout = function (tabs) {
		viewModel.dcLayoutHasBeenFixed = false

		fixFieldsLayoutWithMissingSockets(tabs)
		return mapAttributesToLayoutFields(tabs)
	}

	const getAttributeTypes = function () {
		// dynamic attributes

		return new Promise((res, rej) => {
			const options = { page: 1, pageSize: 1000 }

			metaService
				.loadDataFromAllPages(attributeTypeService.getList, [
					viewModel.entityType,
					options,
				])
				.then((attrTypeData) => {
					viewModel.attributeTypes = attrTypeData
					res()
				})
				.catch((error) => rej(error))
		})

		/* return attributeTypeService.getList(viewModel.entityType, {pageSize: 1000}).then(data => {
                viewModel.attributeTypes = data.results;
            }); */
	}

	const checkReadyStatus = () => {
		let readyStatus = true

		Object.keys(viewModel.readyStatus).forEach((key) => {
			// checking that all properties of viewModel.readyStatus have value set to true
			readyStatus = readyStatus && viewModel.readyStatus[key]
		})

		return readyStatus
	}

	const bindFlex = (tab, field) => {
		if (field.occupiesWholeRow) {
			return 100
		}

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

	const applyInstrumentUserFieldsAliases = function (tabs) {
		return new Promise((resolve, reject) => {
			uiService
				.getInstrumentFieldList()
				.then(function (data) {
					data.results.forEach(function (userField) {
						tabs.forEach(function (tab) {
							tab.layout.fields.forEach(function (field) {
								if (
									field.attribute &&
									field.attribute.key &&
									field.attribute.key === userField.key
								) {
									if (!field.options) {
										field.options = {}
									}

									field.options.fieldName = userField.name
								}
							})
						})
					})

					resolve()
				})
				.catch(() => resolve())
		})
	}

	const onBigDrawerResizeButtonClick = function () {
		/* FIXED AREA POPUP

        	viewModel.fixedAreaPopup.tabColumns = 6;
			viewModel.fixedAreaPopup.fields = getFieldsForFixedAreaPopup(); */
		viewModel.tabColumns = 6

		$scope.$apply()
		const bigDrawerWidth = evHelperService.getBigDrawerWidth(6)

		$bigDrawer.setWidth(bigDrawerWidth)

		bigDrawerResizeButton.classList.add('display-none')
		bigDrawerResizeButton.classList.remove('display-block')
	}

	const onEditorStart = function () {
		if (viewModel.openedIn === 'big-drawer') {
			bigDrawerResizeButton = document.querySelector('.onResizeButtonClick')

			if (bigDrawerResizeButton) {
				bigDrawerResizeButton.addEventListener(
					'click',
					onBigDrawerResizeButtonClick
				)
			}

			return false
		} else {
			return document.querySelector('.evEditorDialogElemToResize')
		}
	}

	const getShowByDefaultOptions = function (columns, entityType) {
		let result = viewModel.showByDefaultOptions

		if (
			columns > 2 &&
			entityType !== 'instrument' &&
			entityType !== 'account' &&
			entityType !== 'instrument-type'
		) {
			result = result.filter((option) => option.id !== 'short_name')
		}

		if (columns > 5) {
			if (
				viewModel.entityType === 'instrument' ||
				viewModel.entityType === 'account' ||
				viewModel.entityType === 'instrument-type'
			) {
				// result = result.filter(option => option.id !== 'short_name');
				result = result
			} else {
				result = result.filter((option) => option.id !== 'user_code')
			}
		}

		return result
	}

	/**
	 *
	 * @param entityType - entitType of relation selector (e.g. instrument type selector for instrument)
	 * @returns {Promise<unknown>} - returns array of entities on resolve and error object on reject
	 */
	const getTypeSelectorOptions = function (entityType) {
		let selectorOptions = []
		let options = { pageSize: 1000, page: 1 }
		let getOptionsPromise

		if (viewModel.groupSelectorEntityType) {
			getOptionsPromise = entityResolverService.getList(entityType, options)
		} else {
			getOptionsPromise = entityResolverService.getListLight(
				entityType,
				options
			)
		}

		/* const loadAllPages = (resolve, reject) => {

				getOptionsPromise.then(function (typesData) {

					// viewModel.typeSelectorOptions = viewModel.typeSelectorOptions.concat(typesData.results);
					selectorOptions = selectorOptions.concat(typesData.results);

					if (typesData.next) {

						options.page = options.page + 1;
						loadAllPages(resolve, reject);

					} else {
						resolve(selectorOptions);
					}

				}).catch(error => {
					console.error("getFieldsForFixedAreaPopup error", error);
					resolve([]);
					// reject(error)
				});

			}; */

		return new Promise((res, rej) => {
			getOptionsPromise
				.then((typesData) => {
					// const options = Array.isArray(typesData) ? typesData : typesData.results;
					if (Array.isArray(typesData)) {
						// viewModel.typeSelectorOptions = typesData;
						selectorOptions = typesData
						res(selectorOptions)
					} else {
						// viewModel.typeSelectorOptions = typesData.results;
						selectorOptions = typesData.results

						if (typesData.next) {
							options.page = options.page + 1
							// loadAllPages(res, rej);
							metaService
								.loadDataFromAllPages(
									getOptionsPromise,
									[options],
									selectorOptions
								)
								.then((selectorOptions) => {
									res(selectorOptions)
								})
						} else {
							res(selectorOptions)
						}
					}
				})
				.catch((error) => {
					console.error('getFieldsForFixedAreaPopup error', error)
					// rej(error);
					res(selectorOptions)
				})
		})
	}

	/**
	 *
	 * @param entityType - entitType of relation selector (e.g. instrument type selector for instrument)
	 * @returns {Promise<unknown>} - returns array of entities on resolve and error object on reject
	 */
	/* const getGroupSelectorOptions = function (entityType) {

			let resData = {};
			let options = {pageSize: 1000, page: 1};

			const loadAllPages = (resolve, reject) => {

				entityResolverService.getList(entityType, options).then(function (typesData) {

					viewModel.groupSelectorOptions = viewModel.groupSelectorOptions.concat(typesData.results);
					resData.groupSelectorOptions = viewModel.groupSelectorOptions;

					if (typesData.next) {

						options.page = options.page + 1;
						loadAllPages(resolve, reject);

					} else {
						resolve(resData);
					}

				}).catch(error => reject(error));

			};

			return new Promise((res, rej) => {

				entityResolverService.getList(entityType, options).then(typesData => {

					// const options = Array.isArray(typesData) ? typesData : typesData.results;
					if (Array.isArray(typesData)) {

						viewModel.typeSelectorOptions = typesData;
						resData.typeSelectorOptions = viewModel.typeSelectorOptions;

						res(resData);

					} else {

						viewModel.groupSelectorOptions = typesData.results;
						resData.groupSelectorOptions = viewModel.groupSelectorOptions;

						if (typesData.next) {
							options.page = options.page + 1;
							loadAllPages(res, rej);

						} else {
							res(resData);
						}

					}

				}).catch(error => {
					console.error("getFieldsForFixedAreaPopup error", error);
					rej(error);
				});

			});

		}; */

	const resolveEditLayout = function () {
		if (
			(viewModel.entityType === 'instrument' &&
				viewModel.entity.instrument_type) ||
			viewModel.entity.instrument_type === 0
		) {
			const activeInstrType = viewModel.typeSelectorOptions.find(
				(instrType) => {
					return instrType.id === viewModel.entity.instrument_type
				}
			)

			if (activeInstrType) {
				// if instrument type exist

				return new Promise(async (resolve, reject) => {
					let fullInstrType = viewModel.instrumentTypesList.find(
						(instrType) => instrType.id === activeInstrType.id
					)

					if (fullInstrType) {
						// full instrument type was loaded

						const editLayout = instrumentService.getEditLayoutBasedOnUserCodes(
							fullInstrType.instrument_form_layouts
						)
						resolve(editLayout)
					} else {
						instrumentTypeService
							.getByKey(activeInstrType.id)
							.then((instrTypeData) => {
								fullInstrType = instrTypeData
								viewModel.instrumentTypesList.push(fullInstrType)

								const editLayout =
									instrumentService.getEditLayoutBasedOnUserCodes(
										fullInstrType.instrument_form_layouts
									)
								resolve(editLayout)
							})
					}
				})
			}

			/* if (viewModel.entity.instrument_type) {

					 return instrumentTypeService.getByKey(viewModel.entity.instrument_type).then(function (data) {

						if (data.instrument_form_layouts) {

							return new Promise(function (resolve, reject) {

								var layouts = data.instrument_form_layouts.split(',');



								uiService.getListEditLayout(viewModel.entityType).then(function (data) {

									var result;
									var lastMatchedIndex;

									data.results.forEach(function (item) {

										if (layouts.indexOf(item.user_code) !== -1) {

											if (!lastMatchedIndex && lastMatchedIndex !== 0) {
												lastMatchedIndex = layouts.indexOf(item.user_code)
												result = item
											}

											if (layouts.indexOf(item.user_code) < lastMatchedIndex) {
												lastMatchedIndex = layouts.indexOf(item.user_code)
												result = item
											}

										}

									})

									;

									if (result) {
										resolve({ // Array?
											results: [
												result
											]
										})
									} else {
										resolve(uiService.getDefaultEditLayout(viewModel.entityType))
									}

								})

							});

						} else {
							return uiService.getDefaultEditLayout(viewModel.entityType);
						}
					})

				} else {
					return uiService.getDefaultEditLayout(viewModel.entityType);
				} */
		}

		return uiService.getDefaultEditLayout(viewModel.entityType)
	}

	const getUserTabsAndFixedAreaData = (formLayout) => {
		return new Promise(async (resolve) => {
			let editLayout
			let gotEditLayout = true
			let tabs = []

			if (formLayout) {
				editLayout = formLayout
			} else {
				try {
					editLayout = await resolveEditLayout()
				} catch (error) {
					console.error('resolveEditLayout error', error)
					gotEditLayout = false
				}
			}

			if (
				gotEditLayout &&
				editLayout.results.length &&
				editLayout.results[0].data
			) {
				viewModel.dataConstructorLayout = JSON.parse(
					JSON.stringify(editLayout.results[0])
				)

				if (Array.isArray(editLayout.results[0].data)) {
					tabs = editLayout.results[0].data
				} else {
					tabs = editLayout.results[0].data.tabs
					// viewModel.showByDefault = editLayout.results[0].data.fixedArea.showByDefault || viewModel.showByDefaultOptions[0].id;
					viewModel.nameToShow =
						editLayout.results[0].data.fixedArea.showByDefault
				}
			}

			if (tabs.length && !tabs[0].hasOwnProperty('tabOrder')) {
				// for old layouts

				tabs.forEach((tab, index) => (tab.tabOrder = index))
			}

			resolve(tabs)
		})
	}

	const getAndFormatUserTabs = async function () {
		viewModel.readyStatus.layout = false

		const tabs = await getUserTabsAndFixedAreaData()

		if (viewModel.entityType === 'instrument')
			await applyInstrumentUserFieldsAliases(tabs)

		// evHelperService.transformItem(viewModel.entity, viewModel.attributeTypes);

		/* FIXED AREA POPUP
			if (viewModel.showByDefault) {
				viewModel.fixedAreaPopup.fields.showByDefault.value = viewModel.showByDefault;
			}*/

		const attributesLayout = mapAttributesAndFixFieldsLayout(tabs)

		viewModel.readyStatus.layout = true

		// $scope.$apply();
		return { tabs: tabs, attributesLayout: attributesLayout }
	}

	const onAccountTypeChange = function () {
		if (viewModel.isInheritRights && viewModel.entity.type) {
			viewModel.setInheritedPermissions()
		}
	}

	const typeSelectorChangeFns = {
		instrument: getAndFormatUserTabs,
		account: onAccountTypeChange,
	}

	/**
	 * Map permissions from instrument type to instrument
	 *
	 * @param {Array} iTypePermissions
	 */
	const mapPermissionsToInstrument = (iTypePermissions) => {
		viewModel.entity.object_permissions = iTypePermissions.map(function (item) {
			var result = Object.assign({}, item)

			result.permission = item.permission.split('_')[0] + '_instrument'

			return result
		})

		if (viewModel.entity.object_permissions) {
			viewModel.groups.forEach(function (group) {
				if (!group.hasOwnProperty('objectPermissions')) {
					group.objectPermissions = {}
				}

				group.objectPermissions.manage = false
				group.objectPermissions.change = false
				group.objectPermissions.view = false

				viewModel.entity.object_permissions.forEach(function (permission) {
					if (permission.group === group.id) {
						if (
							permission.permission ===
							'manage_' + viewModel.entityType.split('-').join('')
						) {
							group.objectPermissions.manage = true
						}
						if (
							permission.permission ===
							'change_' + viewModel.entityType.split('-').join('')
						) {
							group.objectPermissions.change = true
						}
						if (
							permission.permission ===
							'view_' + viewModel.entityType.split('-').join('')
						) {
							group.objectPermissions.view = true
						}
					}
				})
			})
		}

		return {
			objectPermissions: viewModel.entity.object_permissions,
			groups: viewModel.groups,
		}
	}

	// const manageAttributeTypes = function (ev) {
	const manageAttributeTypes = function (option, _$popup) {
		_$popup.cancel()

		$mdDialog
			.show({
				controller: 'AttributesManagerDialogController as vm',
				templateUrl: 'views/dialogs/attributes-manager-dialog-view.html',
				parent: dialogParent,
				// targetEvent: ev,
				multiple: true,
				locals: {
					data: {
						entityType: viewModel.entityType,
					},
				},
			})
			.then((res) => {
				if (res.status === 'agree') {
					viewModel.attributeTypes = res.attributeTypes
					viewModel.evEditorDataService.setEntityAttributeTypes(
						viewModel.attributeTypes
					)

					viewModel.evEditorEventService.dispatchEvent(
						evEditorEvents.DYNAMIC_ATTRIBUTES_CHANGE
					)
				}
			})
	}

	const updateAttributesInsideEntity = function () {
		if (
			metaService
				.getEntitiesWithoutDynAttrsList()
				.indexOf(viewModel.entityType) === -1
		) {
			if (!viewModel.entity.attributes) viewModel.entity.attributes = []

			viewModel.attributeTypes.forEach(function (attrType) {
				viewModel.entity.attributes = entityEditorHelper.updateAttribute(
					viewModel.entity.attributes,
					attrType
				)
			})
		}

		return viewModel.entity.attributes
	}

	const editAsJsonDialog = function () {
		return $mdDialog.show({
			controller: 'EntityAsJsonEditorDialogController as vm',
			templateUrl: 'views/dialogs/entity-as-json-editor-dialog-view.html',
			multiple: true,
			locals: {
				data: {
					item: viewModel.entity,
					entityType: viewModel.entityType,
				},
			},
		})
	}

	const deleteEntity = function (options, _$popup) {
		_$popup.cancel()

		$mdDialog
			.show({
				controller: 'EntityViewerDeleteDialogController as vm',
				templateUrl:
					'views/entity-viewer/entity-viewer-entity-delete-dialog-view.html',
				parent: dialogParent,
				multiple: true,
				locals: {
					entity: viewModel.entity,
					entityType: viewModel.entityType,
				},
			})
			.then(function (res) {
				if (res.status === 'agree') {
					metaHelper.closeComponent(viewModel.openedIn, $mdDialog, $bigDrawer, {
						status: 'delete',
					})
				}
			})
	}

	const copy = function (windowType, addEvController) {
		if (!addEvController) addEvController = 'EntityViewerAddDialogController'

		const entity = JSON.parse(JSON.stringify(viewModel.entity))

		entity['user_code'] = viewModel.entity['user_code'] + '_copy'
		entity['name'] = viewModel.entity['name'] + '_copy'

		if (windowType === 'big-drawer') {
			const responseObj = {
				status: 'copy',
				data: {
					entity: entity,
					entityType: viewModel.entityType,
				},
			}

			return metaHelper.closeComponent(
				viewModel.openedIn,
				$mdDialog,
				$bigDrawer,
				responseObj
			)
		} else {
			$mdDialog.show({
				controller: addEvController + ' as vm',
				templateUrl: 'views/entity-viewer/entity-viewer-add-dialog-view.html',
				parent: angular.element(document.body),
				locals: {
					entityType: viewModel.entityType,
					entity: entity,
					data: {},
				},
			})

			metaHelper.closeComponent(viewModel.openedIn, $mdDialog, $bigDrawer, {
				status: 'copy',
			})
		}
	}

	const getFormLayout = async (formLayout) => {
		const hasRelationSelectorInFixedArea =
			typeSelectorValueEntities.hasOwnProperty(viewModel.entityType)

		if (hasRelationSelectorInFixedArea) {
			const valueEntity = typeSelectorValueEntities[viewModel.entityType]
			viewModel.typeSelectorOptions = await getTypeSelectorOptions(valueEntity)
		} else if (viewModel.groupSelectorEntityType) {
			viewModel.groupSelectorOptions = await getTypeSelectorOptions(
				viewModel.groupSelectorEntityType
			)
		}

		const tabs = await getUserTabsAndFixedAreaData(formLayout)

		if (viewModel.openedIn === 'big-drawer') {
			/* FIXED AREA POPUP

				if (viewModel.showByDefault) {

					viewModel.fixedAreaPopup.fields.showByDefault.value = viewModel.showByDefault;
				}

                // Instrument-type always open in max big drawer window
                let columns = evHelperService.getEditLayoutMaxColumns(entityType, tabs);

                if (viewModel.entityType === 'instrument-type') columns = 6;

                if (viewModel.fixedAreaPopup.tabColumns !== columns) {

                    viewModel.fixedAreaPopup.tabColumns = columns;
                    viewModel.fixedAreaPopup.fields.showByDefault.options = getShowByDefaultOptions(viewModel.fixedAreaPopup.tabColumns, viewModel.entityType);

                    const bigDrawerWidth = evHelperService.getBigDrawerWidth(viewModel.fixedAreaPopup.tabColumns);
                    $bigDrawer.setWidth(bigDrawerWidth);

                    if (viewModel.fixedAreaPopup.tabColumns !== 6) {

                        bigDrawerResizeButton && bigDrawerResizeButton.classList.remove('display-none');
                        bigDrawerResizeButton && bigDrawerResizeButton.classList.add('display-block');

                    } else {

                        bigDrawerResizeButton && bigDrawerResizeButton.classList.remove('display-block');
                        bigDrawerResizeButton && bigDrawerResizeButton.classList.add('display-none');

                    }

                }
                // <Victor 2020.11.20 #59 Fixed area popup>

				viewModel.originalFixedAreaPopupFields = JSON.parse(JSON.stringify(viewModel.fixedAreaPopup.fields));*/

			const columns = evHelperService.getEditLayoutMaxColumns(
				viewModel.entityType,
				tabs
			)

			if (viewModel.tabColumns !== columns) {
				// e.g. when tab's columns number have been changed inside EntityDataConstructorDialogController

				viewModel.tabColumns = columns

				const bigDrawerWidth = evHelperService.getBigDrawerWidth(
					viewModel.tabColumns
				)
				$bigDrawer.setWidth(bigDrawerWidth)
			}

			if (bigDrawerResizeButton) {
				if (viewModel.tabColumns === 6) {
					bigDrawerResizeButton.classList.remove('display-block')
					bigDrawerResizeButton.classList.add('display-none')
				} else {
					bigDrawerResizeButton.classList.remove('display-none')
					bigDrawerResizeButton.classList.add('display-block')
				}
			}
		} else {
			/*  FIXED AREA POPUP

             else if (viewModel.fixedAreaPopup) { // inside entityViewerFormsPreviewDialogController.js there is no pricing fixed area
                viewModel.fixedAreaPopup.tabColumns = 6; // inside dialog window there are always 2 fields outside popup
            } */
			// inside dialog window
			viewModel.tabColumns = 6
		}

		const promises = [getAttributeTypes()]

		if (viewModel.entityType === 'instrument')
			promises.push(applyInstrumentUserFieldsAliases(tabs))

		return new Promise((resolve) => {
			Promise.allSettled(promises).then(function () {
				// evHelperService.transformItem(viewModel.entity, viewModel.attributeTypes); // needed to go after synchronous getAttributeTypes()

				if (viewModel.getEntityPricingSchemes)
					viewModel.getEntityPricingSchemes() // in entityViewerFormsPreviewDialogController.js there is no pricing tab

				viewModel.entity.attributes = updateAttributesInsideEntity()

				const attributesLayout = mapAttributesAndFixFieldsLayout(tabs)

				let resolveData = {
					typeSelectorOptions: viewModel.typeSelectorOptions,
					groupSelectorOptions: viewModel.groupSelectorOptions,
					tabs: tabs,
					tabColumns: viewModel.tabColumns,
					attributeTypes: viewModel.attributeTypes,
					attributes: viewModel.entity.attributes,
					attributesLayout: attributesLayout,
				}

				/*  FIXED AREA POPUP

					if (viewModel.fixedAreaPopup) resolveData.fixedAreaData = getFieldsForFixedAreaPopup();  // in entityViewerFormsPreviewDialogController.js there is no pricing fixed area */

				resolve(resolveData)
			})
		})
	}

	const entityTypeForGroupSelectorsData = {
		responsible: 'responsible-group',
		counterparty: 'counterparty-group',
		'strategy-1': 'strategy-1-subgroup',
		'strategy-2': 'strategy-2-subgroup',
		'strategy-3': 'strategy-3-subgroup',
	}

	const getFieldsForFixedAreaPopup = function () {
		// return new Promise(function (resolve, reject) {
		const fieldsOutside = getFieldsOutsideOfPopup()

		const fields = viewModel.keysOfFixedFieldsAttrs.reduce((acc, key) => {
			const attr = viewModel.entityAttrs.find(
				(entityAttr) => entityAttr.key === key
			)

			if (!attr || fieldsOutside.includes(key)) {
				return acc
			}

			// let fieldKey = (key === 'instrument_type' || key === 'instrument_class') ? 'type' : key;
			const popupFieldKey = entityEditorHelper.getFieldKeyForFAPopup(
				key,
				viewModel.entityType
			)

			const field = {
				[popupFieldKey]: {
					name: attr.name,
					value: viewModel.entity[key],
					entityFieldKey: key,
				},
			}

			if (attr.hasOwnProperty('value_entity')) {
				// this props need for getting field options
				field[popupFieldKey].value_entity = attr.value_entity
			}

			return { ...acc, ...field }
		}, {})

		fields.status = {
			key: 'Status',
			value: viewModel.entityStatus,
			options: viewModel.statusSelectorOptions,
		}
		fields.showByDefault = {
			key: 'Show by default',
			value: viewModel.showByDefault,
			options: viewModel.showByDefaultOptions,
		}

		if (fields.hasOwnProperty('type')) {
			fields.type.options = viewModel.typeSelectorOptions
		} else if (fields.hasOwnProperty('group')) {
			fields.group.options = viewModel.groupSelectorOptions // set by getGroupSelectorOptions()
			fields.group.entityType =
				entityTypeForGroupSelectorsData[viewModel.entityType]
		}

		// });
		return fields
	}

	/* const onSuccessfulEntitySave = function (responseData, isAutoExitAfterSave) {

            viewModel.processing = false;

            if (responseData.status === 400) {
                viewModel.handleErrors(responseData);

            } else {

                var entityTypeVerbose = viewModel.entityType.split('-').join(' ').capitalizeFirstLetter();
                toastNotificationService.success(entityTypeVerbose + " " + viewModel.entity.name + ' was successfully saved');

                if (isAutoExitAfterSave) {

                    let responseObj = {res: 'agree', data: responseData};
                    metaHelper.closeComponent(viewModel.openedIn, $mdDialog, $bigDrawer, responseObj);

                } else {
                    viewModel.entity = {...viewModel.entity, ...responseData};
                    viewModel.entity.$_isValid = true;
                }


            }

        }; */

	const getDailyPricingModelFields = async function () {
		const { data } = await fieldResolverService.getFields(
			'payment_size_detail',
			{
				entityType: 'instrument',
				key: 'payment_size_detail',
			}
		)
		const dailyPricingModelFields = metaHelper.textWithDashSort(data)

		return dailyPricingModelFields
	}

	const getCurrencyFields = async function () {
		const { data } = await fieldResolverService.getFields('accrued_currency', {
			entityType: 'instrument',
			key: 'accrued_currency',
		})
		const currencyFields = metaHelper.textWithDashSort(data)

		return currencyFields
	}

	const isTabWithErrors = (tab) => {
		const tabName = tab.label.toLowerCase()
		const locsWithErrors =
			viewModel.evEditorDataService.getLocationsWithErrors()

		return locsWithErrors[tab.type].hasOwnProperty(tabName)
	}

	const getTabBtnClasses = function (tab) {
		var result = []

		if (viewModel.activeTab.label === tab.label) {
			result.push('active-tab-button')
		}

		if (isTabWithErrors(tab)) {
			result.push('error-menu-option')
		}

		return result
	}

	/* const injectUserAttributesFromInstrumentType = async function (instrumentTypeId) {

			return await instrumentTypeService.getByKey(instrumentTypeId).then(data => {
				const attrs = data.instrument_attributes;
				attrs.forEach(attr => {
					const key = attr.attribute_type_user_code;
					const value = entityEditorHelper.instrumentTypeAttrValueMapper(attr);
					if (typeof viewModel.entity[key] === 'undefined' || viewModel.entity[key] === null) {
						viewModel.entity[key] = value;
					}
				});

			})
		}; */

	/*const exposureCalculationModelSelectorOptions = [
			{id: 1, name: "Market Value"},
			{id: 2, name: "Price exposure"},
			{id: 3, name: "Delta adjusted price exposure"},
			{id: 4, name: "Underlying long short exposure net"},
			{id: 5, name: "Underlying long short exposure split"},
		];

		const longUnderlyingExposureSelectorOptions = [
			{id: 1, name: "Zero"},
			{id: 2, name: "Long Underlying Instrument Price Exposure"},
			{id: 3, name: "Long Underlying Instrument Price Delta"},
			{id: 4, name: "Long Underlying Currency FX Rate Exposure"},
			{id: 5, name: "Long Underlying Currency FX Rate Delta-adjusted Exposure"},
		]

		const shortUnderlyingExposureSelectorOptions = [
			{id: 1, name: "Zero"},
			{id: 2, name: "Short Underlying Instrument Price Exposure"},
			{id: 3, name: "Short Underlying Instrument Price Delta"},
			{id: 4, name: "Short Underlying Currency FX Rate Exposure"},
			{id: 5, name: "Short Underlying Currency FX Rate Delta-adjusted Exposure"},
		]

		const positionReportingSelectorOptions = [
			{
				id: 1,
				name: 'Direct Position'
			},
			{
				id: 2,
				name: 'Factor-adjusted Position'
			},
			{
				id: 3,
				name: 'Do not show'
			}
		];*/

	const getDataForInstrumentExposureTab = function () {
		let mapOption

		if (viewModel.entityType === 'instrument') {
			mapOption = (item) => {
				return {
					id: item.id,
					user_code: item.user_code,
					name: item.short_name,
				}
			}
		} else {
			// instrument type

			mapOption = (item) => {
				return {
					id: item.user_code,
					name: item.short_name,
				}
			}
		}
		// let result = {};
		const instrSelOpts = new Promise(function (resolve) {
			entityResolverService
				.getListLight('instrument', { pageSize: 1000 })
				.then(function (data) {
					const options = data.results.map(mapOption)
					resolve(options)
				})
		})

		const currSelOpts = new Promise(function (resolve) {
			entityResolverService
				.getListLight('currency', { pageSize: 1000 })
				.then(function (data) {
					const options = data.results.map(mapOption)

					resolve(options)
				})
		})

		return Promise.all([instrSelOpts, currSelOpts])
	}

	const switchPricingPolicyParameter = function ($event, item) {
		if (item.switchState === 'default_value') {
			item.switchState = 'attribute_key'
		} else {
			item.switchState = 'default_value'
		}

		item.default_value = null
		item.attribute_key = null
	}

	//region Instrument type

	const getInstrFormLayoutsOptions = () => {
		return viewModel.instrumentFormLayouts
			.filter((ifLayout) => {
				const notInsideInstrType = !!!viewModel.instrLayoutsFromItype.find(
					(fLayout) => fLayout.user_code === ifLayout.user_code
				)
				return notInsideInstrType
			})
			.map((ifLayout) => {
				return {
					id: ifLayout.user_code,
					name: ifLayout.user_code,
				}
			})
	}

	const getInstrumentFormLayouts = function () {
		return new Promise((resolve, reject) => {
			uiService
				.getListEditLayout('instrument')
				.then(function (data) {
					viewModel.instrumentFormLayouts = data.results

					viewModel.instrumentFormLayoutsOptions = getInstrFormLayoutsOptions()

					resolve()
				})
				.catch((error) => reject(error))
		})
	}

	const instrumentTypeMoveLayoutUp = function ($event, item, index) {
		viewModel.instrLayoutsFromItype.splice(index, 1) // remove old one

		var newIndex = index - 1

		if (newIndex < 0) {
			newIndex = 0
		}

		viewModel.instrLayoutsFromItype.splice(newIndex, 0, item)

		viewModel.entity.instrument_form_layouts = viewModel.instrLayoutsFromItype
			.map((layout) => layout.user_code)
			.join(',')
	}

	const instrumentTypeMoveLayoutDown = function ($event, item) {
		var index = viewModel.instrLayoutsFromItype.indexOf(item)

		viewModel.instrLayoutsFromItype.splice(index, 1) // remove old one

		var newIndex = index + 1

		viewModel.instrLayoutsFromItype.splice(newIndex, 0, item)

		viewModel.entity.instrument_form_layouts = viewModel.instrLayoutsFromItype
			.map((layout) => layout.user_code)
			.join(',')
	}

	const instrumentTypeDeleteInstrLayout = function ($event, item, index) {
		// var index = viewModel.instrLayoutsFromItype.indexOf(item)

		viewModel.instrLayoutsFromItype.splice(index, 1)

		viewModel.entity.instrument_form_layouts = viewModel.instrLayoutsFromItype
			.map((layout) => layout.user_code)
			.join(',')

		viewModel.instrumentFormLayoutsOptions.push({
			id: item.user_code,
			name: item.user_code,
		})
	}

	const addInstrLayoutToInstrumentType = function () {
		const newInstrFormLayout = viewModel.instrumentFormLayouts.find(
			(ifLayout) => ifLayout.user_code === viewModel.newInstrFormLayoutUserCode
		)
		viewModel.instrLayoutsFromItype.unshift(newInstrFormLayout)

		const index = viewModel.instrumentFormLayoutsOptions.findIndex(
			(lOption) => lOption.id === viewModel.newInstrFormLayoutUserCode
		)
		viewModel.instrumentFormLayoutsOptions.splice(index, 1)

		viewModel.newInstrFormLayoutUserCode = ''

		viewModel.entity.instrument_form_layouts = viewModel.instrLayoutsFromItype
			.map((layout) => layout.user_code)
			.join(',')
	}

	const editInstrFormLayout = function (ev, layout) {
		$mdDialog
			.show({
				controller: 'EntityDataConstructorDialogController as vm',
				templateUrl: 'views/dialogs/entity-data-constructor-dialog-view.html',
				targetEvent: ev,
				multiple: true,
				locals: {
					data: {
						entityType: 'instrument',
						layoutId: layout.id,
					},
				},
			})
			.then(function (res) {
				if (res.status === 'agree') {
					layout.user_code = res.data.user_code
					layout.name = res.data.name
					layout.is_default = res.data.is_default
				}
			})
	}

	const createInstrFormLayout = function (ev) {
		$mdDialog
			.show({
				controller: 'EntityDataConstructorDialogController as vm',
				templateUrl: 'views/dialogs/entity-data-constructor-dialog-view.html',
				targetEvent: ev,
				multiple: true,
				locals: {
					data: {
						entityType: 'instrument',
						isCreateNew: true,
					},
				},
			})
			.then(function (res) {
				if (res.status === 'agree') {
					viewModel.instrumentFormLayouts.push(res.data)
					viewModel.instrumentFormLayoutsOptions = getInstrFormLayoutsOptions()
				}
			})
	}

	const saveAndApplyPermissionsToInstrumentsByGroup = function ($event, group) {
		viewModel.updateItem().then(function (value) {
			entityResolverService
				.getList('instrument', { pageSize: 1000 })
				.then(function (data) {
					var has_view = group.objectPermissions.view
					var has_change = group.objectPermissions.change
					var has_manage = group.objectPermissions.manage

					var instrumentsWithPermissions = data.results.map(function (item) {
						var permissions = item.object_permissions.filter(function (perm) {
							return perm.group !== group.id
						})

						if (has_view) {
							permissions.push({
								group: group.id,
								member: null,
								permission: 'view_instrument',
							})
						}

						if (has_change) {
							permissions.push({
								group: group.id,
								member: null,
								permission: 'change_instrument',
							})
						}

						if (has_manage) {
							permissions.push({
								group: group.id,
								member: null,
								permission: 'manage_instrument',
							})
						}

						return {
							id: item.id,
							object_permissions: permissions,
						}
					})

					entityResolverService
						.updateBulk('instrument', instrumentsWithPermissions)
						.then(function () {
							$mdDialog.show({
								controller: 'InfoDialogController as vm',
								templateUrl: 'views/info-dialog-view.html',
								parent: dialogParent,
								targetEvent: $event,
								clickOutsideToClose: false,
								preserveScope: true,
								autoWrap: true,
								skipHide: true,
								multiple: true,
								locals: {
									info: {
										title: 'Success',
										description: 'Instrument Permissions successfully updated',
									},
								},
							})
						})
				})
		})
	}
	//endregion

	return {
		readyStatusObj: readyStatusObj,

		groupSelectorValueEntities: groupSelectorValueEntities,
		// getFixedAreaPopup: getFixedAreaPopup,
		entityTabsMenuTplt: entityTabsMenuTplt,
		// onPopupSaveCallback: onPopupSaveCallback,
		// onFixedAreaPopupCancel: onFixedAreaPopupCancel,
		onNameToShowChange: onNameToShowChange,
		getFaField1Classes: getFaField1Classes,
		getFaField2Classes: getFaField2Classes,
		getFaField3Classes: getFaField3Classes,
		isNotNullInput: isNotNullInput,
		typeSelectorChangeFns: typeSelectorChangeFns,
		entityTypeForGroupSelectorsData: entityTypeForGroupSelectorsData,

		mapPermissionsToInstrument: mapPermissionsToInstrument,

		checkReadyStatus: checkReadyStatus,
		bindFlex: bindFlex,
		checkFieldRender: checkFieldRender,
		manageAttributeTypes: manageAttributeTypes,
		editAsJsonDialog: editAsJsonDialog,
		deleteEntity: deleteEntity,
		copy: copy,
		getFormLayout: getFormLayout,
		updateAttributesInsideEntity: updateAttributesInsideEntity,
		// getFieldsForFixedAreaPopup: getFieldsForFixedAreaPopup,
		onEditorStart: onEditorStart,

		// processTabsErrors: processTabsErrors,

		getDailyPricingModelFields: getDailyPricingModelFields,
		getCurrencyFields: getCurrencyFields,

		isTabWithErrors: isTabWithErrors,
		getTabBtnClasses: getTabBtnClasses,

		exposureCalculationModelSelectorOptions:
			instrumentService.exposureCalculationModelsList,
		longUnderlyingExposureSelectorOptions:
			instrumentService.longUnderlyingExposureList,
		shortUnderlyingExposureSelectorOptions:
			instrumentService.shortUnderlyingExposureList,
		positionReportingSelectorOptions: instrumentService.positionReportingList,
		getDataForInstrumentExposureTab: getDataForInstrumentExposureTab,

		switchPricingPolicyParameter: switchPricingPolicyParameter,

		//region Instrument type
		getInstrumentFormLayouts: getInstrumentFormLayouts,
		instrumentTypeMoveLayoutUp: instrumentTypeMoveLayoutUp,
		instrumentTypeMoveLayoutDown: instrumentTypeMoveLayoutDown,
		instrumentTypeDeleteInstrLayout: instrumentTypeDeleteInstrLayout,
		addInstrLayoutToInstrumentType: addInstrLayoutToInstrumentType,
		editInstrFormLayout: editInstrFormLayout,
		createInstrFormLayout: createInstrFormLayout,
		saveAndApplyPermissionsToInstrumentsByGroup:
			saveAndApplyPermissionsToInstrumentsByGroup,
		//endregion

		// injectUserAttributesFromInstrumentType: injectUserAttributesFromInstrumentType
	}
}
