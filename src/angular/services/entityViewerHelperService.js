/**
 * Created by szhitenev on 06.05.2016.
 */
import uiService from './uiService'
import ReportHelper from '../helpers/reportHelper'

/**
 * Entity viewer helper service.
 * @module entityViewerHelperService
 */

import objectComparisonHelper from '../helpers/objectsComparisonHelper'
// import uiService from '../services/uiService';

import entityResolverService from '../services/entityResolverService'

// import middlewareService from '../services/middlewareService';
import evEvents from '../services/entityViewerEvents'
import evDataHelper from '../helpers/ev-data.helper'
import evRvCommonHelper from '../helpers/ev-rv-common.helper'
import metaHelper from '../helpers/meta.helper'

const reportHelper = new ReportHelper()

/**
 * Insert dynamic attributes' values into entity's root level
 *
 * @param entity {Object}
 * @param attrs {Array}
 */
let transformItem = function (entity, attrs) {
	if (entity.attributes) {
		let key

		attrs.forEach(function (attributeType) {
			entity.attributes.forEach(function (attribute) {
				if (
					attributeType.user_code === attribute.attribute_type_object.user_code
				) {
					key = attributeType.user_code

					if (attributeType.value_type === 10) {
						entity[key] = attribute.value_string
					}

					if (attributeType.value_type === 20) {
						entity[key] = attribute.value_float
					}

					if (attributeType.value_type === 30) {
						entity[key] = attribute.classifier
					}

					if (attributeType.value_type === 40) {
						entity[key] = attribute.value_date
					}
				}
			})
		})
	}
}

/**
 * Check if layout has been changed before changing masteruser
 * @param {object} activeLayoutConfig - Object with configuration of layout saved on server
 * @param {object} layoutCurrentConfig - Object with current
 * @param {boolean} isReport
 * @memberOf module:entityViewerHelperService
 * @return {boolean} Returns true if layout has not been changed, otherwise false
 */
const checkForLayoutConfigurationChanges = function (
	activeLayoutConfig,
	layoutCurrentConfig,
	isReport
) {
	if (isReport) {
		if (activeLayoutConfig.data.reportOptions) {
			/*delete activeLayoutConfig.data.reportOptions.task_id;
                delete activeLayoutConfig.data.reportOptions.recieved_at;
                delete activeLayoutConfig.data.reportOptions.task_status;*/
			activeLayoutConfig.data.reportOptions =
				reportHelper.cleanReportOptionsFromTmpProps(
					activeLayoutConfig.data.reportOptions
				)
		}

		if (
			activeLayoutConfig.data.hasOwnProperty('reportLayoutOptions') &&
			activeLayoutConfig.data.reportLayoutOptions.hasOwnProperty(
				'datepickerOptions'
			)
		) {
			if (
				activeLayoutConfig.data.reportLayoutOptions.datepickerOptions
					.reportFirstDatepicker.datepickerMode !== 'datepicker'
			) {
				delete activeLayoutConfig.data.reportOptions.pl_first_date
				delete activeLayoutConfig.data.reportOptions.begin_date
			}

			if (
				activeLayoutConfig.data.reportLayoutOptions.datepickerOptions
					.reportLastDatepicker.datepickerMode !== 'datepicker'
			) {
				delete activeLayoutConfig.data.reportOptions.report_date
				delete activeLayoutConfig.data.reportOptions.end_date
			}
		}

		if (layoutCurrentConfig.data.reportOptions) {
			/*delete layoutCurrentConfig.data.reportOptions.task_id;
                delete layoutCurrentConfig.data.reportOptions.recieved_at;
                delete layoutCurrentConfig.data.reportOptions.task_status;*/
			layoutCurrentConfig.data.reportOptions =
				reportHelper.cleanReportOptionsFromTmpProps(
					layoutCurrentConfig.data.reportOptions
				)
		}

		if (
			layoutCurrentConfig.data.hasOwnProperty('reportLayoutOptions') &&
			layoutCurrentConfig.data.reportLayoutOptions.hasOwnProperty(
				'datepickerOptions'
			)
		) {
			if (
				layoutCurrentConfig.data.reportLayoutOptions.datepickerOptions
					.reportFirstDatepicker.datepickerMode !== 'datepicker'
			) {
				delete layoutCurrentConfig.data.reportOptions.pl_first_date
				delete layoutCurrentConfig.data.reportOptions.begin_date
			}

			if (
				layoutCurrentConfig.data.reportLayoutOptions.datepickerOptions
					.reportLastDatepicker.datepickerMode !== 'datepicker'
			) {
				delete layoutCurrentConfig.data.reportOptions.report_date
				delete layoutCurrentConfig.data.reportOptions.end_date
			}
		}
	}

	let layoutIsNotChanged = objectComparisonHelper.areObjectsTheSame(
		activeLayoutConfig,
		layoutCurrentConfig
	)

	return layoutIsNotChanged
}

const saveLayoutsChanges = function (
	spChangedLayout,
	layoutHasChanges,
	activeLayoutConfig,
	layoutCurrentConfig,
	layoutNewName,
	isReport
) {
	let layoutsSavePromises = []

	// if split panel layout changed, save it
	if (spChangedLayout) {
		var saveSPLayout = new Promise(function (spLayoutSaveRes) {
			if (spChangedLayout.hasOwnProperty('id')) {
				uiService
					.updateListLayout(spChangedLayout.id, spChangedLayout)
					.then(function () {
						spLayoutSaveRes(true)
					})
			} else {
				uiService
					.createListLayout(vm.entityType, spChangedLayout)
					.then(function () {
						spLayoutSaveRes(true)
					})
			}
		})

		layoutsSavePromises.push(saveSPLayout)
	}

	let saveNeeded = layoutHasChanges

	if (isReport) {
		saveNeeded = activeLayoutConfig && layoutHasChanges
	}

	if (saveNeeded) {
		var saveLayout = new Promise(function (saveLayoutRes) {
			if (layoutCurrentConfig.hasOwnProperty('id')) {
				uiService
					.updateListLayout(layoutCurrentConfig.id, layoutCurrentConfig)
					.then(function () {
						saveLayoutRes(true)
					})
			} else {
				if (layoutNewName) {
					layoutCurrentConfig.name = layoutNewName
				}

				uiService
					.createListLayout(vm.entityType, layoutCurrentConfig)
					.then(function () {
						saveLayoutRes(true)
					})
			}
		})

		layoutsSavePromises.push(saveLayout)
	}

	return Promise.all(layoutsSavePromises)
}

/**
 * @param {Object} evDataService - instance of entity viewer data service
 * @param {boolean} isReport
 * @param {Object=} activeLayoutConfig
 * @param {Object=} layoutCurrentConfig
 *
 * @returns {boolean} 'true' if layout has been changed, 'false' otherwise
 * */
var checkRootLayoutForChanges = function (
	evDataService,
	isReport,
	activeLayoutConfig,
	layoutCurrentConfig
) {
	if (activeLayoutConfig === undefined) {
		activeLayoutConfig = evDataService.getActiveLayoutConfiguration()
	}

	if (activeLayoutConfig && activeLayoutConfig.data) {
		if (layoutCurrentConfig === undefined) {
			layoutCurrentConfig =
				evDataService.getLayoutCurrentConfiguration(isReport)
		}

		return !checkForLayoutConfigurationChanges(
			activeLayoutConfig,
			layoutCurrentConfig,
			true
		)
	}

	return false
}

/** @returns {boolean|Object} Returns a layout for split panel that has been changed, otherwise returns 'false'  */
const checkSplitPanelForChanges = function (
	evDataService,
	splitPanelExchangeService
) {
	const additions = evDataService.getAdditions()

	if (additions.isOpen) {
		return splitPanelExchangeService.getSplitPanelChangedLayout()
	}

	return false
}

/**
 * Check layouts for root and split panel for changes and warn about loosing them.
 *
 * @param {Object} evDataService
 * @param {Object} splitPanelExchangeService
 * @param {Object} $mdDialog
 *
 * @returns {Promise<boolean>}
 */
const warnAboutChangesToLoose = function (
	evDataService,
	splitPanelExchangeService,
	$mdDialog
) {
	const entityType = evDataService.getEntityType()
	const isReport = evDataService.isEntityReport()

	const activeLayoutConfig = evDataService.getActiveLayoutConfiguration()
	let layoutCurrentConfig

	if (activeLayoutConfig && activeLayoutConfig.data) {
		layoutCurrentConfig = evDataService.getLayoutCurrentConfiguration(isReport)
	}
	/** 'false' or object of a layout to update / create **/
	var spChanged = checkSplitPanelForChanges(
		evDataService,
		splitPanelExchangeService
	)
	var layoutChanged = checkRootLayoutForChanges(
		evDataService,
		isReport,
		activeLayoutConfig,
		layoutCurrentConfig
	)

	if (!layoutChanged && !spChanged) {
		return new Promise((resolve) => {
			resolve(true)
		})
	}

	return new Promise(function (resolve, reject) {
		$mdDialog
			.show({
				controller: 'LayoutChangesLossWarningDialogController as vm',
				templateUrl: 'views/dialogs/layout-changes-loss-warning-dialog.html',
				parent: angular.element(document.body),
				preserveScope: true,
				autoWrap: true,
				multiple: true,
				locals: {
					data: {
						evDataService: evDataService,
						entityType: entityType,
					},
				},
			})
			.then(function (res) {
				if (res.status === 'save_layout') {
					const layoutNewName =
						res.data && res.data.layoutName ? res.data.layoutName : ''

					saveLayoutsChanges(
						spChanged,
						layoutChanged,
						activeLayoutConfig,
						layoutCurrentConfig,
						layoutNewName,
						isReport
					)
						.then(function () {
							resolve(true)
						})
						.catch((error) => reject(error))
				} else if (res.status === 'do_not_save_layout') {
					resolve(true)
				} else {
					reject(false)
				}
			})
	})
	/*if (layoutHasChanges || spChangedLayout) {

            $mdDialog.show({
                controller: 'LayoutChangesLossWarningDialogController as vm',
                templateUrl: 'views/dialogs/layout-changes-loss-warning-dialog.html',
                parent: angular.element(document.body),
                preserveScope: true,
                autoWrap: true,
                multiple: true,
                locals: {
                    data: {
                        evDataService: vm.entityViewerDataService,
                        entityType: vm.entityType
                    }
                }
            })
                .then(function (res, rej) {

                    if (res.status === 'save_layout') {

                        var layoutsSavePromises = [];

                        // if split panel layout changed, save it
                        if (spChangedLayout) {

                            var saveSPLayoutChanges = new Promise(function (spLayoutSaveRes, spLayoutSaveRej) {

                                if (spChangedLayout.hasOwnProperty('id')) {
                                    uiService.updateListLayout(spChangedLayout.id, spChangedLayout).then(function () {
                                        spLayoutSaveRes(true);
                                    });
                                } else {
                                    uiService.createListLayout(vm.entityType, spChangedLayout).then(function () {
                                        spLayoutSaveRes(true);
                                    });
                                }

                            });

                            layoutsSavePromises.push(saveSPLayoutChanges);

                        }
                        // < if split panel layout changed, save it >

                        if (activeLayoutConfig && layoutHasChanges) {

                            var saveLayoutChanges = new Promise(function (saveLayoutRes, saveLayoutRej) {

                                if (layoutCurrentConfig.hasOwnProperty('id')) {

                                    uiService.updateListLayout(layoutCurrentConfig.id, layoutCurrentConfig).then(function () {
                                        saveLayoutRes(true);
                                    });

                                } else {

                                    if (res.data && res.data.layoutName) {
                                        layoutCurrentConfig.name = res.data.layoutName;
                                    }

                                    /!* When saving is_default: true layout on backend, others become is_default: false
                                    uiService.getDefaultListLayout(vm.entityType).then(function (data) {

                                        layoutCurrentConfig.is_default = true;

                                        if (data.count > 0 && data.results) {
                                            var activeLayout = data.results[0];
                                            activeLayout.is_default = false;

                                            uiService.updateListLayout(activeLayout.id, activeLayout).then(function () {

                                                uiService.createListLayout(vm.entityType, layoutCurrentConfig).then(function () {
                                                    saveLayoutRes(true);
                                                });

                                            });

                                        } else {
                                            uiService.createListLayout(vm.entityType, layoutCurrentConfig).then(function () {
                                                saveLayoutRes(true);
                                            });
                                        }

                                    });*!/
                                    uiService.createListLayout(vm.entityType, layoutCurrentConfig).then(function () {
                                        saveLayoutRes(true);
                                    });

                                }

                                layoutsSavePromises.push(saveLayoutChanges);

                            });
                        }

                        Promise.all(layoutsSavePromises).then(function () {
                            resolve(true);
                        });

                    } else if (res.status === 'do_not_save_layout') {

                        resolve(true);

                    } else {

                        reject(false);

                    }

                }).catch(function () {
                reject(false);
            });

        } else {
            resolve(true);
        }*/
}

/**
 * Turn table attribute into group, column or filter
 * @param {string} form - In what form get attribute. Can be 'column', 'group', 'filter'.
 * @param {object} attrInstance - Object with attribute data on which attribute form will be based
 * @memberOf module:entityViewerHelperService
 * @return {object} Return attribute in form of group, column or filter
 */
let getTableAttrInFormOf = function (form, attrInstance) {
	let attrTypeToAdd = {}

	attrTypeToAdd.key = attrInstance.key

	if (form === 'group' || form === 'column') {
		if (attrInstance.hasOwnProperty('entity')) {
			attrTypeToAdd.entity = attrInstance.entity
		}

		if (attrInstance.hasOwnProperty('id')) {
			attrTypeToAdd.id = attrInstance.id
		}
	}

	if (attrInstance.hasOwnProperty('groups')) {
		attrTypeToAdd.groups = attrInstance.groups
	}

	if (attrInstance.hasOwnProperty('columns')) {
		attrTypeToAdd.columns = attrInstance.columns
	}

	if (attrInstance.hasOwnProperty('filters')) {
		attrTypeToAdd.filters = attrInstance.filters
	}

	attrTypeToAdd.name = attrInstance.name
	attrTypeToAdd.value_type = attrInstance.value_type

	if (attrInstance.layout_name) {
		attrTypeToAdd.layout_name = attrInstance.layout_name
	}

	if (!attrTypeToAdd.options) {
		attrTypeToAdd.options = {}
	}

	switch (form) {
		case 'group':
			attrTypeToAdd.groups = true

			attrTypeToAdd.options.sort = null
			attrTypeToAdd.options.sort_settings = {}

			break

		case 'column':
			attrTypeToAdd.columns = true

			attrTypeToAdd.options.sort = null
			attrTypeToAdd.options.sort_settings = {}

			break

		case 'filter':
			attrTypeToAdd.filters = true

			if (!attrTypeToAdd.options.filter_type) {
				attrTypeToAdd.options.filter_type = metaHelper.getDefaultFilterType(
					attrTypeToAdd.value_type
				)
			}

			if (!attrTypeToAdd.options.filter_values) {
				attrTypeToAdd.options.filter_values = []
			}

			if (!attrTypeToAdd.options.hasOwnProperty('exclude_empty_cells')) {
				attrTypeToAdd.options.exclude_empty_cells = false
			}

			attrTypeToAdd.options.enabled = true;

			break
	}

	if (form === 'group' || form === 'column') {
		attrTypeToAdd.style = {
			width: evDataHelper.getColumnWidth(attrTypeToAdd),
		}
	}

	return attrTypeToAdd
}

/**
 * Get value of dynamic attribute by it's user_code
 * @param {object} dAttrData - Data of dynamic attribute
 * @memberOf module:entityViewerHelperService
 * @return {*} Return value of dynamic attribute
 */
const getDynamicAttrValue = function (dAttrData) {
	// let attrVal;

	if (dAttrData.attribute_type_object.value_type === 30) {
		/* if (dAttrData.classifier_object) {
                attrVal = dAttrData.classifier_object.name;

            } else {
                attrVal = '';
            } */
		if (dAttrData.classifier_object) {
			return {
				classifier: dAttrData.classifier, // can be changed on a form of entity and be different from dAttrData.classifier_object.id
				classifier_object: dAttrData.classifier_object,
			}
		}

		return null
	} else {
		switch (dAttrData.attribute_type_object.value_type) {
			case 10:
				return dAttrData.value_string

			case 20:
				return dAttrData.value_float

			case 40:
				return dAttrData.value_date
		}
	}
}

const setDynamicAttrValue = function (dAttrData, value) {
	/* if (dAttrData.attribute_type_object.value_type === 30) {

            if (dAttrData.classifier_object) {
                attrVal = dAttrData.classifier_object.name;
            } else {
                attrVal = '';
            }

        } else {

            switch (dAttrData.attribute_type_object.value_type) {
                case 10:
                    attrVal = dAttrData.value_string;
                    break;
                case 20:
                    attrVal = dAttrData.value_float;
                    break;
                case 40:
                    attrVal = dAttrData.value_date;
                    break;
            }

        } */

	switch (dAttrData.attribute_type_object.value_type) {
		case 10:
			dAttrData.value_string = value
			break
		case 20:
			dAttrData.value_float = value
			break
		case 30:
			dAttrData.classifier = value
			break
		case 40:
			dAttrData.value_date = value
			break
	}

	return dAttrData
}

/**
 * Get value of dynamic attribute by it's user_code
 * @param {string} userCode - Dynamic attribute user code
 * @param {array} dAttrsList - Array of objects with data of dynamic attribute
 * @memberOf module:entityViewerHelperService
 * @return {string|float|date} Return value of dynamic attribute
 */
const getValueFromDynamicAttrsByUserCode = function (userCode, dAttrsList) {
	let cellValue

	for (let da = 0; da < dAttrsList.length; da++) {
		let dynamicAttributeData = dAttrsList[da]

		if (dynamicAttributeData.attribute_type_object.user_code === userCode) {
			cellValue = getDynamicAttrValue(dynamicAttributeData)
			break
		}
	}

	return cellValue
}

/**
 * Find dynamic attribute by user_code and set its value
 *
 * @param {string} userCode - Dynamic attribute user code
 * @param {array} dAttrsList - Array of objects with data of dynamic attribute
 * @param {string|number|null|undefined} value - value to set into dynamic attribute
 * @memberOf module:entityViewerHelperService
 * @return {Array} - list of dynamic attributes
 */
const setDynamicAttrValueByUserCode = function (userCode, dAttrsList, value) {
	let da
	for (da = 0; da < dAttrsList.length; da++) {
		let dynamicAttributeData = dAttrsList[da]

		if (dynamicAttributeData.attribute_type_object.user_code === userCode) {
			dAttrsList[da] = setDynamicAttrValue(dynamicAttributeData, value)
			break
		}
	}

	return dAttrsList
}

/**
 * Try to get layout by user code and use it. If no layout with such user code was found, get default layout.
 * @memberOf module:entityViewerHelperService
 *
 * @param {object} viewModel - view model of current reportViewerController or entityViewerController
 * @param {string} userCode
 * @param {obj} $mdDialog
 * @param {string} viewContext
 * @return {Promise<any>}
 */
let getLayoutByUserCode = function (
	viewModel,
	userCode,
	$mdDialog,
	viewContext
) {
	return new Promise(function (resolve) {
		/* uiService.getListLayout(viewModel.entityType, {
                pageSize: 1000,
                filters: {
                    user_code: userCode
                }

            }) */
		uiService
			.getListLayoutByUserCode(viewModel.entityType, userCode)
			.then(async function (activeLayoutData) {
				let activeLayout = null

				if (
					activeLayoutData.hasOwnProperty('results') &&
					activeLayoutData.results[0]
				) {
					activeLayout = activeLayoutData.results[0]
				}

				if (activeLayout) {
					await viewModel.setLayout(activeLayout)
					resolve()
				} else {
					$mdDialog
						.show({
							controller: 'InfoDialogController as vm',
							templateUrl: 'views/info-dialog-view.html',
							parent: angular.element(document.body),
							clickOutsideToClose: false,
							preserveScope: true,
							autoWrap: true,
							skipHide: true,
							multiple: true,
							locals: {
								info: {
									title: 'Warning',
									description:
										'Layout ' +
										name +
										' is not found. Switching back to Default Layout.',
								},
							},
						})
						.then(async function (value) {
							await getDefaultLayout(viewModel, viewContext)

							resolve()
						})
				}
			})
	})
}

/**
 * @param {object} viewModel - view model of current reportViewerController or entityViewerController
 * @param {string} viewContext
 * @memberOf module:entityViewerHelperService
 * @return {promise}
 */
let getDefaultLayout = function (viewModel, viewContext) {
	return new Promise(function (resolve, reject) {
		uiService
			.getDefaultListLayout(viewModel.entityType)
			.then(async function (defaultLayoutData) {
				let defaultLayout = null
				if (defaultLayoutData.results && defaultLayoutData.results.length > 0) {
					defaultLayout = defaultLayoutData.results[0]
					/* if (viewContext === 'split_panel') {
                        middlewareService.setNewSplitPanelLayoutName(defaultLayout.name);
                    } */
				}

				await viewModel.setLayout(defaultLayout)

				resolve()
			})
			.catch(function (error) {
				reject(error)
			})
	})
}

/**
 * Get max columns from tabs of Edit Layout
 * @param {String} entityType
 * @param {Array} editLayoutTabs
 * @memberOf module:entityViewerHelperService
 * @returns {number}
 */
var getEditLayoutMaxColumns = function (entityType, editLayoutTabs) {
	let maxCols = 0
	const alwaysMaxWidth = ['instrument-type', 'transaction-type', 'account-type']

	if (alwaysMaxWidth.includes(entityType)) {
		return 6
	}

	editLayoutTabs.forEach(function (tab) {
		if (tab.layout && tab.layout.columns && tab.layout.columns > maxCols) {
			maxCols = tab.layout.columns
		}
	})

	/* const widths = editLayoutTabs
            .map(tab => tab.layout && tab.layout.columns)
            .filter(num => Boolean(Number(num)));

        const maxWidth = Math.max(...widths) */

	return maxCols ? maxCols : 6
}

/**
 * Get big drawer width percentage by fixed area columns
 * @param {number} columns
 * @returns {string}
 */
var getBigDrawerWidth = function (columns) {
	let viewportWidth = window.innerWidth

	let widthPercent = 75

	switch (columns) {
		case 5:
		case 4:
			widthPercent = 49
			break
		case 3:
			widthPercent = 39
			break
		case 2:
		case 1:
			widthPercent = 27
			break
	}

	let drawerWidth = (viewportWidth * widthPercent) / 100 + 'px'

	return drawerWidth
}

/**
 * Format data for popupDirective in fixed area
 * @param {object} viewModel - of add / edit controller
 * @param {array} keysOfFixedFieldsAttrs - array of strings that are keys of entity attributes
 * @returns {object} object where each property corresponding to field inside popup
 */
var getFieldsForFixedAreaPopup = function (viewModel) {
	return new Promise(function (resolve, reject) {
		const fields = viewModel.keysOfFixedFieldsAttrs.reduce((acc, key) => {
			const attr = viewModel.entityAttrs.find(
				(entityAttr) => entityAttr.key === key
			)

			if (!attr) {
				return acc
			}

			const fieldKey =
				key === 'instrument_type' || key === 'instrument_class' ? 'type' : key
			const field = {
				[fieldKey]: { name: attr.name, value: viewModel.entity[key] },
			}

			if (attr.hasOwnProperty('value_entity')) {
				// this props need for getting field options
				field[fieldKey].value_entity = attr.value_entity
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

		// get options for 'type' or 'instrument type' fields
		if (fields.hasOwnProperty('type')) {
			entityResolverService
				.getListLight(fields.type.value_entity)
				.then((data) => {
					const options = Array.isArray(data) ? data : data.results
					fields.type.options = options
					viewModel.setTypeSelectorOptions(options)

					resolve(fields)
				})
				.catch((error) => reject(error))
		} else {
			resolve(fields)
		}
	})
}

var getBigDrawerOptions = function (layout, entityType) {
	var tabColumns = 6

	if (layout.results.length) {
		var tabs = Array.isArray(layout.results[0].data)
			? layout.results[0].data
			: layout.results[0].data.tabs

		/*if (entityType !== 'instrument-type') {
                fixedAreaColumns = getEditLayoutMaxColumns(entityType, tabs);
            }*/
		tabColumns = getEditLayoutMaxColumns(entityType, tabs)
	}

	var bigDrawerWidth = getBigDrawerWidth(tabColumns)

	return {
		width: bigDrawerWidth,
		tabColumns: tabColumns,
		editLayout: layout,
	}
}

var insertObjectAfterCreateHandler = function (
	evDataService,
	evEventService,
	resultItem
) {
	var groups = evDataService.getDataAsList()
	var requestParameters = evDataService.getAllRequestParameters()
	var requestParametersKeys = Object.keys(requestParameters)

	var matchedRequestParameter

	for (var i = 0; i < requestParametersKeys.length; i = i + 1) {
		var key = requestParametersKeys[i]

		var match = true

		var filter_types = requestParameters[key].body.groups_types.map(function (
			item
		) {
			return item.key
		})

		var filter_values = requestParameters[key].body.groups_values

		if (filter_values.length) {
			filter_values.forEach(function (value, index) {
				if (resultItem[filter_types[index]] !== value) {
					match = false
				}
			})
		} else {
			if (filter_types.length) {
				match = false
			}
		}

		if (match) {
			matchedRequestParameter = requestParameters[key]
			break
		}
	}

	if (matchedRequestParameter) {
		groups.forEach(function (group) {
			if (group.___id === matchedRequestParameter.id) {
				var exampleItem = group.results[0] // copying of ___type, ___parentId and etc fields

				var result = Object.assign({}, exampleItem, resultItem)

				result.___id = evRvCommonHelper.getId(result)
				var beforeControlRowIndex = group.results.length - 1

				group.results.splice(beforeControlRowIndex, 0, result)
			}
		})
	}

	evEventService.dispatchEvent(evEvents.REDRAW_TABLE)
}

var postEditionActions = function (
	evDataService,
	evEventService,
	layout,
	$bigDrawer,
	res,
	entityId
) {
	/* evDataService.setActiveObjectAction(null);
        evDataService.setActiveObjectActionData(null); */
	evDataService.setRowsActionData(null)

	if (res.status === 'agree') {
		updateEntityInsideTable(evDataService, evEventService, res)
	} else if (res.status === 'copy') {
		const entitytype = res.data.entityType
		const entity = res.data.entity

		openEntityViewerAddDrawer(
			evDataService,
			evEventService,
			layout,
			$bigDrawer,
			entitytype,
			entity
		)
	} else if (res.status === 'delete') {
		updateTableAfterEntitiesDeletion(evDataService, evEventService, [entityId])
	}
}

var postAdditionActions = function (
	evDataService,
	evEventService,
	layout,
	$bigDrawer,
	res,
	resultItem
) {
	// resultItem need because complex transaction have different data

	if (res.status === 'agree') {
		insertObjectAfterCreateHandler(evDataService, evEventService, resultItem)
	} else if (res.status === 'edit') {
		insertObjectAfterCreateHandler(evDataService, evEventService, resultItem)
		// open edit window
		const entitytype = resultItem.entityType
		const entityId = resultItem.entity.id
		openEntityViewerEditDrawer(
			evDataService,
			evEventService,
			layout,
			$bigDrawer,
			entitytype,
			entityId
		)
	}
}

var postTTypeEditionActions = function (
	evDataService,
	evEventService,
	layout,
	$bigDrawer,
	res,
	entityId
) {
	/* evDataService.setActiveObjectAction(null);
        evDataService.setActiveObjectActionData(null); */
	evDataService.setRowsActionData(null)

	if (res.status === 'agree') {
		updateEntityInsideTable(evDataService, evEventService, res)
	} else if (res.status === 'delete') {
		var objects = evDataService.getObjects()

		objects.forEach(function (obj) {
			if (entityId === obj.id) {
				var parent = evDataService.getData(obj.___parentId)

				parent.results = parent.results.filter(function (resultItem) {
					return resultItem.id !== entityId
				})

				evDataService.setData(parent)
			}
		})

		evEventService.dispatchEvent(evEvents.REDRAW_TABLE)
		updateTableAfterEntitiesDeletion(evDataService, evEventService, [entityId])
	} else if (res.status === 'copy') {
		const entitytype = res.data.entityType
		const entity = res.data.entity

		openTTypeAddDrawer(
			evDataService,
			evEventService,
			layout,
			$bigDrawer,
			entitytype,
			entity
		)
	}
}

var postTTypeAdditionActions = function (
	evDataService,
	evEventService,
	layout,
	$bigDrawer,
	res
) {
	if (res.status === 'agree') {
		insertObjectAfterCreateHandler(evDataService, evEventService, res.data)
	} else if (res.status === 'edit') {
		insertObjectAfterCreateHandler(evDataService, evEventService, res.data)
		// open edit window
		const entitytype = res.data.entityType
		const entityId = res.data.entity.id
		openTTypeEditDrawer(
			evDataService,
			evEventService,
			layout,
			$bigDrawer,
			entitytype,
			entityId
		)
	}
}

var postInstrumentTypeEditionActions = function (
	evDataService,
	evEventService,
	layout,
	$bigDrawer,
	res,
	entityId
) {
	/* evDataService.setActiveObjectAction(null);
        evDataService.setActiveObjectActionData(null); */
	evDataService.setRowsActionData(null)

	if (res.status === 'agree') {
		updateEntityInsideTable(evDataService, evEventService, res)
	} else if (res.status === 'delete') {
		var objects = evDataService.getObjects()

		objects.forEach(function (obj) {
			if (entityId === obj.id) {
				var parent = evDataService.getData(obj.___parentId)

				parent.results = parent.results.filter(function (resultItem) {
					return resultItem.id !== entityId
				})

				evDataService.setData(parent)
			}
		})

		evEventService.dispatchEvent(evEvents.REDRAW_TABLE)
		updateTableAfterEntitiesDeletion(evDataService, evEventService, [entityId])
	} else if (res.status === 'copy') {
		const entitytype = res.data.entityType
		const entity = res.data.entity

		openInstrumentTypeAddDrawer(
			evDataService,
			evEventService,
			layout,
			$bigDrawer,
			entitytype,
			entity
		)
	}
}

var postInstrumentTypeAdditionActions = function (
	evDataService,
	evEventService,
	layout,
	$bigDrawer,
	res
) {
	if (res.status === 'agree') {
		insertObjectAfterCreateHandler(evDataService, evEventService, res.data)
	} else if (res.status === 'edit') {
		insertObjectAfterCreateHandler(evDataService, evEventService, res.data)
		// open edit window
		const entitytype = res.data.entityType
		const entityId = res.data.entity.id
		openInstrumentTypeEditDrawer(
			evDataService,
			evEventService,
			layout,
			$bigDrawer,
			entitytype,
			entityId
		)
	}
}

var postComplexTransactionEditionAction = function (
	evDataService,
	evEventService,
	layout,
	$bigDrawer,
	res,
	entityId
) {
	/* evDataService.setActiveObjectAction(null);
        evDataService.setActiveObjectActionData(null); */
	evDataService.setRowsActionData(null)

	if (res.status === 'agree') {
		var objects = evDataService.getObjects()

		objects.forEach(function (obj) {
			if (res.data.complex_transaction.id === obj.id) {
				Object.keys(res.data.complex_transaction).forEach(function (key) {
					obj[key] = res.data.complex_transaction[key]
				})

				evDataService.setObject(obj)
			}
		})

		evEventService.dispatchEvent(evEvents.REDRAW_TABLE)
	} else if (res.status === 'delete') {
		updateTableAfterEntitiesDeletion(evDataService, evEventService, [entityId])
	} else if (res.status === 'copy') {
		const entitytype = res.data.entityType
		const entity = res.data.entity
		const isCopy = true

		const originalComplexTransaction = res.data.originalComplexTransaction

		openComplexTransactionAddDrawer(
			evDataService,
			evEventService,
			layout,
			$bigDrawer,
			entitytype,
			entity,
			isCopy,
			originalComplexTransaction
		)
	} else if (res.status === 'disagree' && res.data && res.data.updateRowIcon) {
		var tIsLocked = res.data.updateRowIcon.is_locked
		var tIsCanceled = res.data.updateRowIcon.is_canceled
		var activeObject = evDataService.getActiveObject()
		var transactionObj = evDataService.getObject(
			activeObject.___id,
			activeObject.___parentId
		)

		transactionObj.is_locked = tIsLocked
		transactionObj.is_canceled = tIsCanceled
		evDataService.setObject(transactionObj)

		evEventService.dispatchEvent(evEvents.UPDATE_PROJECTION)
	} else if (res.status === 'rebook_transaction') {
		openComplexTransactionEditDrawer(
			evDataService,
			evEventService,
			$bigDrawer,
			entityId,
			layout
		)
	}
}

var openComplexTransactionAddDrawer = function (
	evDataService,
	evEventService,
	layout,
	$bigDrawer,
	entityType,
	entity,
	isCopy,
	originalComplexTransaction
) {
	/* $mdDialog.show({
            controller: 'ComplexTransactionAddDialogController as vm',
            templateUrl: 'views/entity-viewer/complex-transaction-add-dialog-view.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            locals: {
                entityType: scope.entityType,
                entity: {},
                data: {}
            }
        }).then(function (res) {

            if (res && res.res === 'agree') {
                scope.insertObjectAfterCreateHandler(res.data.complex_transaction);
            }

        }) */
	var bigDrawerWidth = getBigDrawerWidth(6)

	$bigDrawer
		.show({
			controller: 'ComplexTransactionAddDialogController as vm',
			templateUrl:
				'views/entity-viewer/complex-transaction-add-drawer-view.html',
			addResizeButton: false,
			drawerWidth: bigDrawerWidth,
			locals: {
				entityType: entityType,
				entity: entity,
				data: {
					openedIn: 'big-drawer',
					editLayout: layout,
					isCopy: isCopy,
					originalComplexTransaction: originalComplexTransaction,
				},
			},
		})
		.then(function (res) {
			var resultItem = null
			if (res.data) {
				resultItem = res.data.complex_transaction
			}

			postAdditionActions(
				evDataService,
				evEventService,
				layout,
				$bigDrawer,
				res,
				resultItem
			)
		})
}

/**
 *
 * @param evDataService {Object} - entityViewerDataService
 * @param evEventService {Object} - entityViewerEventService
 * @param $bigDrawer {Object} - bigDrawer module
 * @param entityId {number} - complex transaction id
 * @param layout {Object=} - layout of form
 */
var openComplexTransactionEditDrawer = function (
	evDataService,
	evEventService,
	$bigDrawer,
	entityId,
	layout
) {
	/* $mdDialog.show({
                    controller: 'ComplexTransactionEditDialogController as vm',
                    templateUrl: 'views/entity-viewer/complex-transaction-edit-dialog-view.html',
                    parent: angular.element(document.body),
                    targetEvent: activeObject.event,
                    //clickOutsideToClose: false,
                    locals: {
                        entityType: entitytype,
                        entityId: activeObject.id,
                        data: {}
                    }
                }).then(function (res) {

                    vm.entityViewerDataService.setActiveObjectAction(null);
                    vm.entityViewerDataService.setActiveObjectActionData(null);

                    if (res && res.res === 'agree') {

                        if (res.data.action === 'delete') {

                            var objects = vm.entityViewerDataService.getObjects();

                            objects.forEach(function (obj) {

                                if (activeObject.id === obj.id) {

                                    var parent = vm.entityViewerDataService.getData(obj.___parentId);

                                    parent.results = parent.results.filter(function (resultItem) {
                                        return resultItem.id !== activeObject.id
                                    });

                                    vm.entityViewerDataService.setData(parent)

                                }

                            });

                            vm.entityViewerEventService.dispatchEvent(evEvents.REDRAW_TABLE);

                        } else {

                            var objects = vm.entityViewerDataService.getObjects();

                            objects.forEach(function (obj) {

                                if (res.data.complex_transaction.id === obj.id) {

                                    Object.keys(res.data.complex_transaction).forEach(function (key) {

                                        obj[key] = res.data.complex_transaction[key]

                                    });

                                    vm.entityViewerDataService.setObject(obj);

                                }

                            });

                            vm.entityViewerEventService.dispatchEvent(evEvents.REDRAW_TABLE);

                        }

                    } else if (res && res.status === 'disagree' && res.data.updateRowIcon) {

                        var tIsLocked = res.data.updateRowIcon.is_locked;
                        var tIsCanceled = res.data.updateRowIcon.is_canceled;
                        var activeObject = vm.entityViewerDataService.getActiveObject();
                        var transactionObj = vm.entityViewerDataService.getObject(activeObject.___id, activeObject.___parentId);

                        transactionObj.is_locked = tIsLocked;
                        transactionObj.is_canceled = tIsCanceled;
                        vm.entityViewerDataService.setObject(transactionObj);

                        vm.entityViewerEventService.dispatchEvent(evEvents.UPDATE_PROJECTION);
                    }

                });*/

	var bigDrawerWidth = getBigDrawerWidth(6)

	$bigDrawer
		.show({
			controller: 'ComplexTransactionEditDialogController as vm',
			templateUrl:
				'views/entity-viewer/complex-transaction-edit-drawer-view.html',
			addResizeButton: false,
			drawerWidth: bigDrawerWidth,
			locals: {
				entityType: 'complex-transaction',
				entityId: entityId,
				data: {
					openedIn: 'big-drawer',
					editLayout: layout,
				},
			},
		})
		.then(function (res) {
			postComplexTransactionEditionAction(
				evDataService,
				evEventService,
				layout,
				$bigDrawer,
				res,
				entityId
			)
		})
}

var openComplexTransactionPreviewDrawer = function (
	evDataService,
	evEventService,
	$bigDrawer,
	$mdDialog,
	entityId,
	layout
) {
	try {
		metaHelper.closeComponent('big-drawer', $mdDialog, $bigDrawer, {
			status: 'disagree',
		})
	} catch (e) {
		console.warn('nothing to close')
	}
	var bigDrawerWidth = getBigDrawerWidth(4)

	$bigDrawer
		.show({
			controller: 'ComplexTransactionEditDialogController as vm',
			templateUrl:
				'views/entity-viewer/complex-transaction-edit-drawer-view.html',
			addResizeButton: false,
			drawerWidth: bigDrawerWidth,
			showBackdrop: false,
			closeAnimation: false,
			openAnimation: false,
			locals: {
				entityType: 'complex-transaction',
				entityId: entityId,
				data: {
					openedIn: 'big-drawer',
					editLayout: layout,
					previewMode: true,
				},
			},
		})
		.then(function (res) {
			postComplexTransactionEditionAction(
				evDataService,
				evEventService,
				layout,
				$bigDrawer,
				res,
				entityId
			)
		})
}

var openTTypeAddDrawer = function (
	evDataService,
	evEventService,
	layout,
	$bigDrawer,
	entityType,
	entity
) {
	/*							$mdDialog.show({
                                        controller: 'TransactionTypeAddDialogController as vm',
                                        templateUrl: 'views/entity-viewer/transaction-type-add-dialog-view.html',
                                        parent: angular.element(document.body),
                                        targetEvent: ev,
                                        locals: {
                                            entityType: scope.entityType,
                                            entity: {}
                                        }

                                    }).then(postAddEntityFn);*/

	var bigDrawerWidth = getBigDrawerWidth(6)

	$bigDrawer
		.show({
			controller: 'TransactionTypeAddDialogController as vm',
			templateUrl: 'views/entity-viewer/transaction-type-add-drawer-view.html',
			addResizeButton: false, // ttype always have max width without resize button
			drawerWidth: bigDrawerWidth,
			locals: {
				entityType: entityType,
				entity: entity,
				data: {
					openedIn: 'big-drawer',
					editLayout: layout,
				},
			},
		})
		.then(function (res) {
			postTTypeAdditionActions(
				evDataService,
				evEventService,
				layout,
				$bigDrawer,
				res
			)
		})
}

var openTTypeEditDrawer = function (
	evDataService,
	evEventService,
	layout,
	$bigDrawer,
	entitytype,
	entityId
) {
	var bigDrawerWidth = getBigDrawerWidth(6)

	/*						$mdDialog.show({
                                    controller: 'TransactionTypeEditDialogController as vm',
                                    templateUrl: 'views/entity-viewer/transaction-type-edit-dialog-view.html',
                                    parent: angular.element(document.body),
                                    targetEvent: activeObject.event,
                                    //clickOutsideToClose: false,
                                    locals: {
                                        entityType: entitytype,
                                        entityId: activeObject.id,
                                        openedIn: 'dialog'
                                    }
                                })
                                    .then(function (res) {

                                    vm.entityViewerDataService.setActiveObjectAction(null);
                                    vm.entityViewerDataService.setActiveObjectActionData(null);

                                    if (res && res.res === 'agree') {

                                        if (res.data.action === 'delete') {

                                            var objects = vm.entityViewerDataService.getObjects();

                                            objects.forEach(function (obj) {

                                                if (activeObject.id === obj.id) {

                                                    var parent = vm.entityViewerDataService.getData(obj.___parentId);

                                                    parent.results = parent.results.filter(function (resultItem) {
                                                        return resultItem.id !== activeObject.id
                                                    });

                                                    vm.entityViewerDataService.setData(parent)

                                                }

                                            });

                                            vm.entityViewerEventService.dispatchEvent(evEvents.REDRAW_TABLE);
                                            updateTableAfterEntitiesDeletion([activeObject.id]);

                                        } else {

                                            ;

                                            var objects = vm.entityViewerDataService.getObjects();

                                            objects.forEach(function (obj) {

                                                if (res.data.id === obj.id) {

                                                    Object.keys(res.data).forEach(function (key) {

                                                        obj[key] = res.data[key]

                                                    });

                                                    vm.entityViewerDataService.setObject(obj);

                                                }

                                            });

                                            vm.entityViewerEventService.dispatchEvent(evEvents.REDRAW_TABLE);

                                        }

                                    }
                                });*/
	$bigDrawer
		.show({
			controller: 'TransactionTypeEditDialogController as vm',
			templateUrl: 'views/entity-viewer/transaction-type-edit-drawer-view.html',
			addResizeButton: false, // ttype always have max width without resize button
			drawerWidth: bigDrawerWidth,
			locals: {
				entityType: entitytype,
				entityId: entityId,
				data: {
					openedIn: 'big-drawer',
					editLayout: layout,
				},
			},
		})
		.then(function (res) {
			postTTypeEditionActions(
				evDataService,
				evEventService,
				layout,
				$bigDrawer,
				res,
				entityId
			)

			/*                            vm.entityViewerDataService.setActiveObjectAction(null);
                                        vm.entityViewerDataService.setActiveObjectActionData(null);

                                        if (res && res.res === 'agree') {

                                            if (res.data.action === 'delete') {

                                                var objects = vm.entityViewerDataService.getObjects();

                                                objects.forEach(function (obj) {

                                                    if (activeObject.id === obj.id) {

                                                        var parent = vm.entityViewerDataService.getData(obj.___parentId);

                                                        parent.results = parent.results.filter(function (resultItem) {
                                                            return resultItem.id !== activeObject.id
                                                        });

                                                        vm.entityViewerDataService.setData(parent)

                                                    }

                                                });

                                                vm.entityViewerEventService.dispatchEvent(evEvents.REDRAW_TABLE);
                                                evHelperService.updateTableAfterEntitiesDeletion(vm, [activeObject.id]);

                                            } else {

                                                ;

                                                var objects = vm.entityViewerDataService.getObjects();

                                                objects.forEach(function (obj) {

                                                    if (res.data.id === obj.id) {

                                                        Object.keys(res.data).forEach(function (key) {

                                                            obj[key] = res.data[key]

                                                        });

                                                        vm.entityViewerDataService.setObject(obj);

                                                    }

                                                });

                                                vm.entityViewerEventService.dispatchEvent(evEvents.REDRAW_TABLE);

                                            }

                                        }*/
		})
}

var openInstrumentTypeAddDrawer = function (
	evDataService,
	evEventService,
	layout,
	$bigDrawer,
	entityType,
	entity
) {
	var bigDrawerWidth = getBigDrawerWidth(6)

	$bigDrawer
		.show({
			controller: 'InstrumentTypeAddDialogController as vm',
			templateUrl: 'views/entity-viewer/instrument-type-add-drawer-view.html',
			addResizeButton: false, // ttype always have max width without resize button
			drawerWidth: bigDrawerWidth,
			locals: {
				entityType: entityType,
				entity: entity,
				data: {
					openedIn: 'big-drawer',
					editLayout: layout,
				},
			},
		})
		.then(function (res) {
			postInstrumentTypeAdditionActions(
				evDataService,
				evEventService,
				layout,
				$bigDrawer,
				res,
				res.data
			)
		})
}

var openInstrumentTypeEditDrawer = function (
	evDataService,
	evEventService,
	layout,
	$bigDrawer,
	entitytype,
	entityId
) {
	var bigDrawerWidth = getBigDrawerWidth(6)

	$bigDrawer
		.show({
			controller: 'InstrumentTypeEditDialogController as vm',
			templateUrl: 'views/entity-viewer/instrument-type-edit-drawer-view.html',
			addResizeButton: false, // ttype always have max width without resize button
			drawerWidth: bigDrawerWidth,
			locals: {
				entityType: entitytype,
				entityId: entityId,
				data: {
					openedIn: 'big-drawer',
					editLayout: layout,
				},
			},
		})
		.then(function (res) {
			postInstrumentTypeEditionActions(
				evDataService,
				evEventService,
				layout,
				$bigDrawer,
				res,
				entityId
			)
		})
}

var openEntityViewerAddDrawer = function (
	evDataService,
	evEventService,
	layout,
	$bigDrawer,
	entityType,
	entity
) {
	/* $mdDialog.show({
            controller: 'EntityViewerAddDialogController as vm',
            templateUrl: 'views/entity-viewer/entity-viewer-add-dialog-view.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            locals: {
                entityType: scope.entityType,
                entity: {},
                data: {
                    openedIn: 'modal-dialog'
                }
            }

        }).then(postAddEntityFn); */

	var bigDrawerOptions = getBigDrawerOptions(layout, entityType)

	$bigDrawer
		.show({
			controller: 'EntityViewerAddDialogController as vm',
			templateUrl:
				'views/entity-viewer/entity-viewer-universal-add-drawer-view.html',
			addResizeButton: true,
			drawerWidth: bigDrawerOptions.width,
			locals: {
				entityType: entityType,
				entity: entity,
				data: {
					openedIn: 'big-drawer',
					editLayout: bigDrawerOptions.editLayout,
					tabColumns: bigDrawerOptions.tabColumns,
				},
			},
		})
		.then(function (res) {
			postAdditionActions(
				evDataService,
				evEventService,
				layout,
				$bigDrawer,
				res,
				res.data
			)
		})
}

var openEntityViewerEditDrawer = function (
	evDataService,
	evEventService,
	layout,
	$bigDrawer,
	entityType,
	entityId
) {
	var bigDrawerOptions = getBigDrawerOptions(layout, entityType)

	/* $mdDialog.show({
            controller: 'EntityViewerEditDialogController as vm',
            templateUrl: 'views/entity-viewer/entity-viewer-edit-dialog-view.html',
            parent: angular.element(document.body),
            targetEvent: activeObject.event,
            //clickOutsideToClose: false,
            locals: {
                entityType: entityType,
                entityId: activeObject.id,
                data: {}
            }
        }).then(function (res) {

            vm.entityViewerDataService.setActiveObjectAction(null);
            vm.entityViewerDataService.setActiveObjectActionData(null);

            if (res && res.res === 'agree') {

                if (res.data.action === 'delete') {

                    var objects = vm.entityViewerDataService.getObjects();

                    objects.forEach(function (obj) {

                        if (activeObject.id === obj.id) {

                            var parent = vm.entityViewerDataService.getData(obj.___parentId);

                            parent.results = parent.results.filter(function (resultItem) {
                                return resultItem.id !== activeObject.id
                            });

                            vm.entityViewerDataService.setData(parent)

                        }

                    });

                    vm.entityViewerEventService.dispatchEvent(evEvents.REDRAW_TABLE);

                } else {

                    var objects = vm.entityViewerDataService.getObjects();

                    objects.forEach(function (obj) {

                        if (res.data.id === obj.id) {

                            Object.keys(res.data).forEach(function (key) {

                                obj[key] = res.data[key]

                            });

                            vm.entityViewerDataService.setObject(obj);

                        }

                    });

                    vm.entityViewerEventService.dispatchEvent(evEvents.REDRAW_TABLE);
                }

            }

        }); */
	$bigDrawer
		.show({
			controller: 'EntityViewerEditDialogController as vm',
			templateUrl: 'views/entity-viewer/entity-viewer-edit-drawer-view.html',
			addResizeButton: true,
			drawerWidth: bigDrawerOptions.width,
			locals: {
				entityType: entityType,
				entityId: entityId,
				data: {
					openedIn: 'big-drawer',
					editLayout: bigDrawerOptions.editLayout,
					tabColumns: bigDrawerOptions.tabColumns,
				},
			},
		})
		.then(function (res) {
			postEditionActions(
				evDataService,
				evEventService,
				layout,
				$bigDrawer,
				res,
				entityId
			)
		})
}

var updateTableAfterEntitiesDeletion = function (
	evDataService,
	evEventService,
	deletedEntitiesIds
) {
	var evOptions = evDataService.getEntityViewerOptions()
	var objects = evDataService.getObjects()

	objects.forEach(function (obj) {
		if (deletedEntitiesIds.includes(obj.id)) {
			var parent = evDataService.getData(obj.___parentId)

			// if deleted entities shown, mark them
			if (
				evOptions.entity_filters &&
				evOptions.entity_filters.includes('deleted')
			) {
				parent.results.forEach(function (resultItem) {
					if (deletedEntitiesIds.includes(resultItem.id)) {
						resultItem.is_deleted = true
					}
				})
			} else {
				// if deleted entities hidden, remove them

				parent.results = parent.results.filter(function (resultItem) {
					return !deletedEntitiesIds.includes(resultItem.id)
				})
			}

			evDataService.setData(parent)
		}
	})

	evEventService.dispatchEvent(evEvents.REDRAW_TABLE)
}

var updateEntityInsideTable = function (evDataService, evEventService, res) {
	var objects = evDataService.getObjects()

	objects.forEach(function (obj) {
		if (res.data.id === obj.id) {
			Object.keys(res.data).forEach(function (key) {
				obj[key] = res.data[key]
			})

			evDataService.setObject(obj)
		}
	})

	evEventService.dispatchEvent(evEvents.REDRAW_TABLE)
}

/**
 * @param {Object} pricingPolicy
 * @param {Array<Object>} instrumentPricingSchemes
 * @param {Object} entity - data of ev entity
 */
var onPricingSchemeChangeInsidePricingPolicy = function (
	pricingPolicy,
	instrumentPricingSchemes,
	entity
) {
	pricingPolicy.pricing_scheme_object = null
	pricingPolicy.default_value = null
	pricingPolicy.attribute_key = null
	pricingPolicy.data = null

	instrumentPricingSchemes.forEach(function (scheme) {
		if (scheme.id === pricingPolicy.pricing_scheme) {
			pricingPolicy.pricing_scheme_object = scheme
		}
	})

	if (
		pricingPolicy.pricing_scheme_object &&
		pricingPolicy.pricing_scheme_object.type_settings
	) {
		pricingPolicy.data = pricingPolicy.pricing_scheme_object.type_settings.data
		pricingPolicy.attribute_key =
			pricingPolicy.pricing_scheme_object.type_settings.attribute_key
		pricingPolicy.default_value =
			pricingPolicy.pricing_scheme_object.type_settings.default_value
	}

	entity.pricing_policies = entity.pricing_policies.map(function (policy) {
		if (policy.id === pricingPolicy.id) {
			return Object.assign({}, pricingPolicy)
		}

		return policy
	})
}
const getAttributesLayoutNames = function (columns) {
	const result = {}

	columns.forEach((col) => {
		if (col.layout_name) result[col.key] = col.layout_name
	})

	return result
}

export default {
	transformItem: transformItem,
	checkForLayoutConfigurationChanges: checkForLayoutConfigurationChanges,
	checkRootLayoutForChanges: checkRootLayoutForChanges,
	checkSplitPanelForChanges: checkSplitPanelForChanges,
	warnAboutChangesToLoose: warnAboutChangesToLoose,
	getTableAttrInFormOf: getTableAttrInFormOf,
	getAttributesLayoutNames: getAttributesLayoutNames,

	getDynamicAttrValue: getDynamicAttrValue,
	setDynamicAttrValue: setDynamicAttrValue,
	getLayoutByUserCode: getLayoutByUserCode,
	getDefaultLayout: getDefaultLayout,
	getValueFromDynamicAttrsByUserCode: getValueFromDynamicAttrsByUserCode,
	setDynamicAttrValueByUserCode: setDynamicAttrValueByUserCode,

	getEditLayoutMaxColumns: getEditLayoutMaxColumns,
	getBigDrawerWidth: getBigDrawerWidth,

	updateTableAfterEntitiesDeletion: updateTableAfterEntitiesDeletion,

	postEditionActions: postEditionActions,
	openEntityViewerEditDrawer: openEntityViewerEditDrawer,
	openEntityViewerAddDrawer: openEntityViewerAddDrawer,

	openTTypeEditDrawer: openTTypeEditDrawer,
	openTTypeAddDrawer: openTTypeAddDrawer,

	openInstrumentTypeEditDrawer: openInstrumentTypeEditDrawer,
	openInstrumentTypeAddDrawer: openInstrumentTypeAddDrawer,

	openComplexTransactionEditDrawer: openComplexTransactionEditDrawer,
	openComplexTransactionAddDrawer: openComplexTransactionAddDrawer,
	openComplexTransactionViewDrawer: openComplexTransactionPreviewDrawer,

	postAdditionActions: postAdditionActions,

	onPricingSchemeChangeInsidePricingPolicy:
		onPricingSchemeChangeInsidePricingPolicy,
}
