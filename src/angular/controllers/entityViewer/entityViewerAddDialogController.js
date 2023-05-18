/**
 * Created by szhitenev on 05.05.2016.
 */

// import usersGroupService from '../../services/usersGroupService';
// import usersService from '../../services/usersService';

import layoutService from '../../services/entity-data-constructor/layoutService'
import metaService from '../../services/metaService'
import evEditorEvents from '../../services/ev-editor/entityViewerEditorEvents'

import gridHelperService from '../../services/gridHelperService'
import evHelperService from '../../services/entityViewerHelperService'

import EntityViewerEditorDataService from '../../services/ev-editor/entityViewerEditorDataService'
import EventService from '../../services/eventService'

import instrumentTypeService from '../../services/instrumentTypeService'
import metaPermissionsService from '../../services/metaPermissionsService'
import tooltipsService from '../../services/tooltipsService'
import colorPalettesService from '../../services/colorPalettesService'

import metaHelper from '../../helpers/meta.helper'
import entityEditorHelper from '../../helpers/entity-editor.helper'
import EntityViewerEditorSharedLogicHelper from '../../helpers/entityViewer/sharedLogic/entityViewerEditorSharedLogicHelper'

import currencyPricingSchemeService from '../../services/pricing/currencyPricingSchemeService'
import instrumentPricingSchemeService from '../../services/pricing/instrumentPricingSchemeService'

export default function entityViewerAddDialogController(
	$scope,
	$mdDialog,
	$bigDrawer,
	$state,
	toastNotificationService,
	authorizerService,
	usersService,
	usersGroupService,
	globalDataService,
	metaContentTypesService,
	instrumentService,
	entityResolverService,
	fieldResolverService,
	attributeTypeService,
	uiService,
	entityType,
	entity,
	data
) {
	var vm = this

	vm.entityType = entityType

	vm.sharedLogic = new EntityViewerEditorSharedLogicHelper(
		vm,
		$scope,
		$mdDialog,
		$bigDrawer,
		instrumentService,
		entityResolverService,
		fieldResolverService,
		attributeTypeService,
		uiService
	)

	vm.processing = false

	vm.readyStatus = { permissions: false, entity: false, layout: false }

	vm.entity = { $_isValid: true }
	vm.dataConstructorLayout = {}
	vm.dcLayoutHasBeenFixed = false

	vm.hasEnabledStatus = true
	vm.entityStatus = ''
	vm.allowFormLayoutEdition = true
	vm.evEditorEvent = null

	if (
		vm.entityType === 'price-history' ||
		vm.entityType === 'currency-history'
	) {
		vm.hasEnabledStatus = false
	}

	if (Object.keys(entity).length) {
		// make copy option
		vm.entity = entity
		delete vm.entity.id // lack of id indicates creation of entity
	}

	vm.entityTabs = metaService.getEntityTabs(vm.entityType)

	if (vm.entityType === 'portfolio') {
		// Don't show performance tab while creating portfolio
		const perfTabIndex = vm.entityTabs.findIndex(
			(tab) =>
				tab.templateUrl === 'views/tabs/portfolio/performance-tab-view.html'
		)
		vm.entityTabs.splice(perfTabIndex, 1)
	}

	vm.attributeTypes = []
	vm.layoutAttrs = layoutService.getLayoutAttrs()
	vm.entityAttrs = []

	vm.formIsValid = true
	vm.range = gridHelperService.range

	vm.fixedFieldsAttributes = []
	vm.attributesLayout = []
	vm.fixedAreaAttributesLayout = []

	vm.isInheritRights = false

	vm.canManagePermissions = false

	vm.attributeTypesByValueTypes = {} // need for pricing;

	vm.currencies = [] // need for instrument pricing tab;

	// Victor 20020.11.20 #59: fields below needs for new design an fixed area popup
	//region Fixed area popup
	vm.action = 'add'
	vm.typeFieldName = 'type'
	vm.typeFieldLabel = 'Type'

	if (vm.entityType === 'instrument') {
		vm.typeFieldName = 'instrument_type'
		vm.typeFieldLabel = 'Instrument type'
	}

	if (vm.entityType === 'instrument-type') {
		vm.typeFieldName = 'instrument_class'
		vm.typeFieldLabel = 'Instrument class'
	}

	/*vm.nameToShowOptions = [
			{id: 'name', name: 'Name', visible_name: 'Report Name (Name)'},
			{id: 'public_name', name: 'Public Name', visible_name: 'System Name (Short Name)'},
			{id: 'short_name', name: 'Short Name', visible_name: 'Unique Code (User Code)'},
			{id: 'user_code', name: 'User Code', visible_name: 'Name if Hidden (Public Name)'},
		];

        if (vm.entityType === 'currency') {
            vm.nameToShowOptions = vm.nameToShowOptions.filter(item => item.id !== 'public_name');
        }

        vm.nameToShow = vm.nameToShowOptions[0].id;

        vm.fixedAreaPopup = vm.sharedLogic.getFixedAreaPopup();
        vm.originalFixedAreaPopupFields; */
	vm.nameToShow

	vm.typeSelectorOptions = []
	vm.groupSelectorLabel = 'Group'
	vm.groupSelectorOptions = []
	vm.groupSelectorEntityType =
		vm.sharedLogic.entityTypeForGroupSelectorsData[vm.entityType]

	vm.pricingConditions = [
		{ id: 1, name: "Don't Run Valuation" },
		{ id: 2, name: 'Run Valuation: if non-zero position' },
		{ id: 3, name: 'Run Valuation: always' },
	]
	//endregion

	vm.activeTab = null

	vm.openedIn = data.openedIn // 'big-drawer', 'dialog'

	if (vm.entityType === 'instrument') {
		vm.instrumentTypesList = [] // modified by method resolveEditLayout() inside entityViewerEditorSharedLogicHelper.js

		vm.exposureCalculationModelSelectorOptions =
			vm.sharedLogic.exposureCalculationModelSelectorOptions
		vm.longUnderlyingExposureSelectorOptions =
			vm.sharedLogic.longUnderlyingExposureSelectorOptions
		vm.shortUnderlyingExposureSelectorOptions =
			vm.sharedLogic.shortUnderlyingExposureSelectorOptions
		vm.positionReportingSelectorOptions =
			vm.sharedLogic.positionReportingSelectorOptions
	}

	vm.typeSelectorChange = null
	/** Tracking fields that have been changed by user */
	var changedEntityProperties = {
		attributes: {},
	}

	var formLayoutFromAbove = data.editLayout

	/* FIXED AREA POPUP

        var getNameToShowOptions = function (columns, entityType) {
            let result = vm.nameToShowOptions;
            if (columns > 2 && entityType !== 'instrument' && entityType !== 'account' && entityType !== 'instrument-type') {
                result = result.filter(option => option.id !== 'short_name')
            }

            if (columns >5) {
                if (vm.entityType === 'instrument' || vm.entityType === 'account' || vm.entityType === 'instrument-type') {
                    result = result.filter(option => option.id !== 'short_name');
                } else {
                    result = result.filter(option => option.id !== 'user_code')
                }
            }

            return result;

        };

        vm.getNameToShowValue = function () {
            return vm.entity[vm.nameToShow];
        };

        vm.getNameToShowAlias = function () {
            return vm.nameToShowOptions.find(option => option.id === vm.nameToShow).visible_name;
        };

        vm.isEntityTabActive = function () {
            return vm.activeTab && (vm.activeTab === 'permissions' || vm.entityTabs.includes(vm.activeTab));
        };

        vm.onPopupSaveCallback = vm.sharedLogic.onPopupSaveCallback;
        vm.onFixedAreaPopupCancel = vm.sharedLogic.onFixedAreaPopupCancel; */
	// < Victor 20020.11.20 #59: fields below needs for new design an fixed area popup >
	vm.entityTabsMenuTplt = vm.sharedLogic.entityTabsMenuTplt
	vm.entityTabsMenuPopupData = { viewModel: vm }
	vm.entityTablePopupClasses = 'border-radius-2'

	vm.onNameToShowChange = vm.sharedLogic.onNameToShowChange

	vm.getFaField1Classes = vm.sharedLogic.getFaField1Classes
	vm.getFaField2Classes = vm.sharedLogic.getFaField2Classes
	vm.getFaField3Classes = vm.sharedLogic.getFaField3Classes

	vm.keysOfFixedFieldsAttrs = metaService.getEntityViewerFixedFieldsAttributes(
		vm.entityType
	)

	vm.isNotNullInput = vm.sharedLogic.isNotNullInput

	/* vm.tabsWithErrors = {"system_tab": {}, "user_tab": {}};
        vm.formErrorsList = []; */
	var contentType = metaContentTypesService.findContentTypeByEntity(
		vm.entityType,
		'ui'
	)

	var getEntityAttrs = function () {
		vm.entityAttrs = metaService.getEntityAttrs(vm.entityType) || []
		vm.fixedFieldsAttributes = []

		var i, a
		for (i = 0; i < vm.keysOfFixedFieldsAttrs.length; i++) {
			var attrKey = vm.keysOfFixedFieldsAttrs[i]

			if (!attrKey) {
				vm.fixedFieldsAttributes.push(null)
			} else {
				for (a = 0; a < vm.entityAttrs.length; a++) {
					if (vm.entityAttrs[a].key === attrKey) {
						if (vm.entityAttrs[a]) {
							var entityAttr = JSON.parse(JSON.stringify(vm.entityAttrs[a]))
						}

						vm.fixedFieldsAttributes.push(entityAttr)

						break
					}
				}
			}
		}
	}

	vm.getCurrencies = function () {
		entityResolverService
			.getListLight('currency', { pageSize: 1000 })
			.then(function (data) {
				vm.currencies = data.results

				$scope.$apply()
			})
	}

	/* var getMatchForLayoutFields = function (tab, tabIndex, fieldsToEmptyList, tabResult) {

            var i, l, e;

            tab.layout.fields.forEach(function (field, fieldIndex) {

                var fieldResult = {};

                if (field && field.type !== 'empty') {

                    if (field.attribute_class === 'attr') {

                        var dAttrFound = false;

                        for (i = 0; i < vm.attributeTypes.length; i = i + 1) {

                            if (field.key) {

                                if (field.key === vm.attributeTypes[i].user_code) {

                                    vm.attributeTypes[i].options = field.options;
                                    fieldResult = vm.attributeTypes[i];
                                    dAttrFound = true;
                                    break;

                                }

                            } else {

                                if (field.attribute.user_code) {

                                    if (field.attribute.user_code === vm.attributeTypes[i].user_code) {

                                        vm.attributeTypes[i].options = field.options;
                                        fieldResult = vm.attributeTypes[i];
                                        dAttrFound = true;
                                        break;

                                    }

                                }

                            }

                        }

                        if (!dAttrFound) {
                            var fieldPath = {
                                tabIndex: tabIndex,
                                fieldIndex: fieldIndex
                            };

                            fieldsToEmptyList.push(fieldPath);
                        }

                    } else {

                        for (e = 0; e < vm.entityAttrs.length; e = e + 1) {
                            if (field.name === vm.entityAttrs[e].name) {
                                vm.entityAttrs[e].options = field.options;
                                fieldResult = vm.entityAttrs[e];
                            }
                        }

                        for (l = 0; l < vm.layoutAttrs.length; l = l + 1) {
                            if (field.name === vm.layoutAttrs[l].name) {
                                vm.layoutAttrs[l].options = field.options;
                                fieldResult = vm.layoutAttrs[l];
                            }
                        }

                    }

                    if (field.backgroundColor) {
                        fieldResult.backgroundColor = field.backgroundColor;
                    }

                }

                tabResult.push(fieldResult)


            });

        };

        vm.generateAttributesFromLayoutFields = function () {

            vm.attributesLayout = [];
            var fieldsToEmptyList = [];

            var tabResult;

            vm.tabs.forEach(function (tab, tabIndex) {

                tabResult = [];

                getMatchForLayoutFields(tab, tabIndex, fieldsToEmptyList, tabResult);

                vm.attributesLayout.push(tabResult);

            });

            if (vm.fixedArea && vm.fixedArea.isActive) {

                vm.fixedAreaAttributesLayout = [];

                getMatchForLayoutFields(vm.fixedArea, 'fixedArea', fieldsToEmptyList, vm.fixedAreaAttributesLayout);

            }


            // Empty sockets that have no attribute that matches them
            fieldsToEmptyList.forEach(function (fieldPath) {

                if (fieldPath.tabIndex === 'fixedArea') {
                    var dcLayoutFields = vm.fixedArea.layout.fields;
                    var layoutFieldsToSave = dataConstructorLayout.data.fixedArea.layout.fields;
                } else {
                    var dcLayoutFields = vm.tabs[fieldPath.tabIndex].layout.fields;

                    // for old layouts compatibility
                    if (Array.isArray(dataConstructorLayout.data)) {
                        var layoutFieldsToSave = dataConstructorLayout.data[fieldPath.tabIndex].layout.fields;
                    } else {
                        var layoutFieldsToSave = dataConstructorLayout.data.tabs[fieldPath.tabIndex].layout.fields;
                    }

                }

                var fieldToEmptyColumn = dcLayoutFields[fieldPath.fieldIndex].column;
                var fieldToEmptyRow = dcLayoutFields[fieldPath.fieldIndex].row;

                dcLayoutFields[fieldPath.fieldIndex] = { // removing from view
                    colspan: 1,
                    column: fieldToEmptyColumn,
                    editMode: false,
                    row: fieldToEmptyRow,
                    type: 'empty'
                };

                layoutFieldsToSave[fieldPath.fieldIndex] = { // removing from layout copy for saving
                    colspan: 1,
                    column: fieldToEmptyColumn,
                    editMode: false,
                    row: fieldToEmptyRow,
                    type: 'empty'
                };

            });

            if (fieldsToEmptyList.length) {
                dcLayoutHasBeenFixed = true;
            }
            // < Empty sockets that have no attribute that matches them >
        };*/

	/* var fixFieldsLayoutWithMissingSockets = function () {

            var socketsHasBeenAddedToTabs = entityEditorHelper.fixCustomTabs(vm.tabs, dataConstructorLayout);

            if (vm.fixedArea && vm.fixedArea.isActive) {
                var socketsHasBeenAddedToFixedArea = entityEditorHelper.fixCustomTabs(vm.fixedArea, dataConstructorLayout);
            }

            if (socketsHasBeenAddedToTabs || socketsHasBeenAddedToFixedArea) {
                dcLayoutHasBeenFixed = true;
            }

        };

        var mapAttributesToLayoutFields = function () {

            var attributes = {
                entityAttrs: vm.entityAttrs,
                dynamicAttrs: vm.attributeTypes,
                layoutAttrs: vm.layoutAttrs
            };

            var attributesLayoutData = entityEditorHelper.generateAttributesFromLayoutFields(vm.tabs, attributes, vm.dataConstructorLayout, true);

            vm.attributesLayout = attributesLayoutData.attributesLayout;

            if (vm.fixedArea && vm.fixedArea.isActive) {
                var fixedAreaAttributesLayoutData = entityEditorHelper.generateAttributesFromLayoutFields(vm.fixedArea, attributes, vm.dataConstructorLayout, true);

                vm.fixedAreaAttributesLayout = fixedAreaAttributesLayoutData.attributesLayout;
            }

            if (attributesLayoutData.dcLayoutHasBeenFixed || (fixedAreaAttributesLayoutData && fixedAreaAttributesLayoutData.dcLayoutHasBeenFixed)) {
                dcLayoutHasBeenFixed = true;
            }

        };

        var mapAttributesAndFixFieldsLayout = function () {
            dcLayoutHasBeenFixed = false;

            fixFieldsLayoutWithMissingSockets();
            mapAttributesToLayoutFields();
        }; */

	vm.loadPermissions = function () {
		vm.currentMember = globalDataService.getMember()
		vm.getCurrentMasterUser()

		/* var promises = [];

            promises.push(vm.getCurrentMember());
            promises.push(vm.getCurrentMasterUser());
            promises.push(vm.getGroupList());

            Promise.all(promises).then(function (data) { */
		vm.getGroupList().then(function (data) {
			vm.readyStatus.permissions = true

			vm.setPermissionsDefaults()

			if (vm.entityType === 'account' || vm.entityType === 'instrument') {
				vm.checkInheritRight()
			}

			if (vm.currentMember && vm.currentMember.is_admin) {
				vm.canManagePermissions = true
			}

			$scope.$apply()
		})
	}

	vm.getCurrentMasterUser = function () {
		/*return authorizerService.getCurrentMasterUser().then(function (data) {

                vm.currentMasterUser = data;
                vm.system_currency = data.system_currency;

                vm.systemCurrencies = [data.system_currency_object];

                $scope.$apply();

            })*/
		vm.currentMasterUser = globalDataService.getMasterUser()
		vm.system_currency = vm.currentMasterUser.system_currency

		vm.systemCurrencies = []

		if (vm.currentMasterUser.system_currency_object) {
			vm.systemCurrencies.push(vm.currentMasterUser.system_currency_object)
		}
	}

	/*vm.getCurrentMember = function () {

            return usersService.getMyCurrentMember().then(function (data) {

                vm.currentMember = data;

                $scope.$apply();

            });
        };*/

	vm.getGroupList = function () {
		return usersGroupService.getList().then(function (data) {
			vm.groups = data.results.filter(function (item) {
				return item.role === 2
			})
		})
	}

	vm.setPermissionsDefaults = function () {
		var table
		var isCreator

		// console.log('vm.groups', vm.groups);
		// console.log('vm.currentMember.groups', vm.currentMember.groups);

		vm.groups.forEach(function (group) {
			if (group.permission_table && group.permission_table.data) {
				table = group.permission_table.data.find(function (item) {
					return item.content_type === contentType
				}).data

				isCreator = vm.currentMember.groups.indexOf(group.id) !== -1

				group.objectPermissions = {}

				if (isCreator) {
					if (table.creator_manage) {
						group.objectPermissions.manage = true

						vm.canManagePermissions = true
					}

					if (table.creator_change) {
						group.objectPermissions.change = true
					}

					if (table.creator_view) {
						group.objectPermissions.view = true
					}
				} else {
					if (table.other_manage) {
						group.objectPermissions.manage = true

						vm.canManagePermissions = true
					}

					if (table.other_change) {
						group.objectPermissions.change = true
					}

					if (table.other_view) {
						group.objectPermissions.view = true
					}
				}
			}
		})
	}

	vm.checkInheritRight = function () {
		var table

		vm.groups.forEach(function (group) {
			if (vm.currentMember.groups.indexOf(group.id) !== -1) {
				if (group.permission_table && group.permission_table.data) {
					table = group.permission_table.data.find(function (item) {
						return item.content_type === contentType
					}).data

					console.log(' checkInheritRight table', table)

					if (table.inherit_rights) {
						vm.isInheritRights = true
					}
				}
			}
		})
	}

	/* vm.setInheritedPermissions = function () {

            return new Promise(function (resolve, reject) {

                if (vm.entityType === 'instrument') {

                    console.log('vm.entity', vm.entity);

                    entityResolverService.getByKey('instrument-type', vm.entity.instrument_type).then(function (data) {

                        //  vm.entity.object_permissions = data.object_permissions.map(function (item) {
						//
                        //     var result = Object.assign({}, item);
						//
                        //     result.permission = item.permission.split('_')[0] + '_instrument';
						//
                        //     return result
						//
                        // });
						//
                        // console.log('vm.entityPermissions', vm.entity.object_permissions);
						//
                        // vm.groups.forEach(function (group) {
						//
                        //     if (vm.entity.object_permissions) {
                        //         vm.entity.object_permissions.forEach(function (permission) {
						//
                        //             if (permission.group === group.id) {
						//
                        //                 if (!group.hasOwnProperty('objectPermissions')) {
                        //                     group.objectPermissions = {};
                        //                 }
						//
                        //                 if (permission.permission === "manage_" + vm.entityType.split('-').join('')) {
                        //                     group.objectPermissions.manage = true;
                        //                 }
                        //                 if (permission.permission === "change_" + vm.entityType.split('-').join('')) {
                        //                     group.objectPermissions.change = true;
                        //                 }
                        //                 if (permission.permission === "view_" + vm.entityType.split('-').join('')) {
                        //                     group.objectPermissions.view = true;
                        //                 }
                        //             }
                        //         })
                        //     }
						//
                        // });
						const result = vm.sharedLogic.mapPermissionsToInstrument(data.object_permissions);
						vm.entity.object_permissions = result.objectPermissions;
						vm.groups = result.groups;

                        console.log('vm.groups', vm.groups);

                        $scope.$apply();

                    })

                }

                if (vm.entityType === 'account') {

                    entityResolverService.getByKey('account-type', vm.entity.type).then(function (data) {

                        vm.entity.object_permissions = data.object_permissions.map(function (item) {

                            var result = Object.assign({}, item);

                            result.permission = item.permission.split('_')[0] + '_account';

                            return result

                        });

                        vm.groups.forEach(function (group) {

                            if (vm.entity.object_permissions) {
                                vm.entity.object_permissions.forEach(function (permission) {

                                    if (permission.group === group.id) {

                                        if (!group.hasOwnProperty('objectPermissions')) {
                                            group.objectPermissions = {};
                                        }

                                        if (permission.permission === "manage_" + vm.entityType.split('-').join('')) {
                                            group.objectPermissions.manage = true;
                                        }
                                        if (permission.permission === "change_" + vm.entityType.split('-').join('')) {
                                            group.objectPermissions.change = true;
                                        }
                                        if (permission.permission === "view_" + vm.entityType.split('-').join('')) {
                                            group.objectPermissions.view = true;
                                        }
                                    }
                                })
                            }

                        });

                        $scope.$apply();

                    })


                }

            })

        }; */

	vm.setInheritedPricing = function () {
		return new Promise(function (resolve, reject) {
			if (vm.entityType === 'instrument' && vm.entity.instrument_type) {
				console.log('vm.entity', vm.entity)

				entityResolverService
					.getByKey('instrument-type', vm.entity.instrument_type)
					.then(function (data) {
						console.log('get instrument type ', data)

						vm.entity.pricing_policies = data.pricing_policies.map(function (
							policy
						) {
							var item = Object.assign({}, policy)

							delete item.id
							delete item.overwrite_default_parameters

							return item
						})

						$scope.$apply()
					})
			}
		})
	}

	vm.entityTypeSlug = function () {
		return vm.entityType.split('-').join(' ').capitalizeFirstLetter()
	}

	vm.onNameInputBlur = function () {
		if (vm.entity.name && !vm.entity.short_name) {
			var entityName = vm.entity.name
			vm.entity.short_name = entityName

			$scope.$apply()
		}
	}

	vm.cancel = function () {
		metaHelper.closeComponent(vm.openedIn, $mdDialog, $bigDrawer, {
			status: 'disagree',
		})
	}

	vm.editLayout = function (option, _$popup) {
		_$popup.cancel()

		$mdDialog
			.show({
				controller: 'EntityDataConstructorDialogController as vm',
				templateUrl: 'views/dialogs/entity-data-constructor-dialog-view.html',
				parent: document.querySelector('.dialog-containers-wrap'),
				multiple: true,
				locals: {
					data: {
						entityType: vm.entityType,
						layoutId: vm.dataConstructorLayout.id,
					},
				},
			})
			.then(function (res) {
				if (res.status === 'agree') {
					vm.readyStatus.entity = false
					vm.readyStatus.layout = false

					formLayoutFromAbove = null // forcing getFormLayout() to download layout from server

					vm.init()

					vm.layoutAttrs = layoutService.getLayoutAttrs()
					getEntityAttrs()
				}
			})
	}

	vm.footerPopupData = {
		options: [
			{
				icon: 'list',
				name: 'Edit Form',
				onClick: vm.editLayout,
			},
			{
				icon: 'edit',
				name: 'Manage Attributes',
				onClick: vm.sharedLogic.manageAttributeTypes,
			},
		],
	}

	// vm.manageAttrs = vm.sharedLogic.manageAttributeTypes;

	vm.checkReadyStatus = vm.sharedLogic.checkReadyStatus
	vm.bindFlex = vm.sharedLogic.bindFlex
	vm.checkFieldRender = vm.sharedLogic.checkFieldRender

	vm.checkReadyStatus = vm.sharedLogic.checkReadyStatus

	vm.bindFlex = function (tab, field) {
		/*var totalColspans = 0;
            var i;
            for (i = 0; i < tab.layout.fields.length; i = i + 1) {
                if (tab.layout.fields[i].row === row) {
                    totalColspans = totalColspans + tab.layout.fields[i].colspan;
                }
            }*/
		var flexUnit = 100 / tab.layout.columns
		return Math.floor(field.colspan * flexUnit)
	}

	vm.checkViewState = function (tab) {
		if (tab.hasOwnProperty('enabled')) {
			if (tab.enabled.indexOf(vm.evAction) == -1) {
				return false
			}
		}

		return true
	}

	vm.updateEntityBeforeSave = function () {
		console.log('updateEntityBeforeSave vm.entity', vm.entity)

		/* if (metaService.getEntitiesWithoutDynAttrsList().indexOf(vm.entityType) === -1) {

                vm.entity.attributes = [];

                vm.attributeTypes.forEach(function (attributeType) {

                    var value = vm.entity[attributeType.user_code];

                    vm.entity.attributes.push(entityEditorHelper.appendAttribute(attributeType, value));

                });
            } */

		vm.entity.object_permissions = []
		console.log('vm.groups', vm.groups)

		if (vm.groups) {
			vm.groups.forEach(function (group) {
				if (
					group.objectPermissions &&
					group.objectPermissions.manage === true
				) {
					vm.entity.object_permissions.push({
						member: null,
						group: group.id,
						permission: 'manage_' + vm.entityType.split('-').join(''),
					})
				}

				if (
					group.objectPermissions &&
					group.objectPermissions.change === true
				) {
					vm.entity.object_permissions.push({
						member: null,
						group: group.id,
						permission: 'change_' + vm.entityType.split('-').join(''),
					})
				}
				if (group.objectPermissions && group.objectPermissions.view === true) {
					vm.entity.object_permissions.push({
						member: null,
						group: group.id,
						permission: 'view_' + vm.entityType.split('-').join(''),
					})
				}
			})
		}
	}

	var setValuesFromInstrumentType = function (entity) {
		return new Promise(async function (resolve) {
			var activeInstrType = vm.typeSelectorOptions.find(
				(instrType) => instrType.id === vm.entity.instrument_type
			)

			if (activeInstrType) {
				// if instrument type exist

				var fullInstrType = vm.instrumentTypesList.find(
					(instrType) => instrType.id === vm.entity.instrument_type
				)

				if (!fullInstrType) {
					fullInstrType = await instrumentTypeService.getByKey(
						activeInstrType.id
					)
				}

				//region Set user attributes

				fullInstrType.instrument_attributes.forEach((attr) => {
					const key = attr.attribute_type_user_code
					const value = entityEditorHelper.instrumentTypeAttrValueMapper(attr)

					if (!entity[key] && entity[key] !== 0) {
						entity[key] = value
					}
				})
				//endregion

				//region Set accruals properties
				var propsToSetList = [
					'accrued_currency',
					'payment_size_detail',
					'accrued_multiplier',
					'default_accrued',
				]

				propsToSetList.forEach(function (prop) {
					if (
						(fullInstrType[prop] || fullInstrType[prop] === 0) &&
						!entity[prop] &&
						entity[prop] !== 0
					) {
						entity[prop] = fullInstrType[prop]
					}
				})
				//endregion
			}

			resolve(entity)
		})
	}

	/*vm.entityStatusChanged = function () {

            entityResolverService.getByKey(vm.entityType, vm.entity.id).then(function (result) {

                switch (vm.entityStatus) {
                    case 'enabled':
                        result.is_enabled = true;
                        result.is_deleted = false;
                        vm.entity.is_enabled = true;
                        vm.entity.is_deleted = false;
                        break;

                    case 'disabled':
                        result.is_enabled = false;
                        result.is_deleted = false;
                        vm.entity.is_enabled = false;
                        vm.entity.is_deleted = false;
                        break;

                    case 'deleted':
                        result.is_deleted = true;
                        vm.entity.is_deleted = true;
                        break;

                    case 'active':
                        break;

                    case 'inactive':
                        break;
                }

                entityResolverService.update(vm.entityType, result.id, result).then(function (data) {

                    $scope.$apply();

                });

            });

        };

        var getEntityStatus = function () {

            vm.entityStatus = 'disabled';

            if (vm.entity.is_enabled) {
                vm.entityStatus = 'enabled';
            }

            if (vm.entity.is_deleted) {
                vm.entityStatus = 'deleted';
            }

        };*/

	vm.save = async function ($event, isAutoExitAfterSave) {
		/* if (vm.entityType === 'instrument') {

                const instrumentTypeId = vm.entity[vm.typeFieldName];
                if (instrumentTypeId) {

                    await vm.sharedLogic.injectUserAttributesFromInstrumentType(instrumentTypeId);

                }
            } */
		if (vm.entityType === 'instrument') {
			vm.entity = await setValuesFromInstrumentType(vm.entity)
		}

		vm.updateEntityBeforeSave()

		/* var errors = entityEditorHelper.validateEntityFields(vm.entity,
                vm.entityType,
                vm.tabs,
                vm.keysOfFixedFieldsAttrs,
                vm.entityAttrs,
                vm.attributeTypes,
                []); */

		var errors = entityEditorHelper.validateEntity(
			vm.entity,
			vm.entityType,
			vm.tabs,
			vm.keysOfFixedFieldsAttrs,
			vm.entityAttrs,
			vm.attributeTypes,
			[]
		)

		if (errors.length) {
			// var processResult = entityEditorHelper.processTabsErrors(errors, vm.evEditorDataService, vm.evEditorEventService, $mdDialog, $event, vm.fixedAreaPopup, vm.entityType, vm.fixedAreaEventObj);
			entityEditorHelper.processTabsErrors(
				errors,
				vm.evEditorDataService,
				vm.evEditorEventService,
				$mdDialog,
				$event,
				vm.entityType,
				vm.enfEventService
			)

			/*if (processResult) {
                    vm.fixedAreaPopup = processResult;
                    vm.originalFixedAreaPopupFields = JSON.parse(JSON.stringify(vm.fixedAreaPopup.fields));
                }*/
		} else {
			// var resultEntity = entityEditorHelper.removeNullFields(vm.entity, vm.entityType);
			var resultEntity = entityEditorHelper.clearEntityBeforeSave(
				vm.entity,
				vm.entityType
			)
			console.log('resultEntity', resultEntity)

			if (vm.dcLayoutHasBeenFixed) {
				uiService.updateEditLayout(
					vm.dataConstructorLayout.id,
					vm.dataConstructorLayout
				)
			}

			vm.processing = true

			entityResolverService
				.create(vm.entityType, resultEntity)
				.then(function (responseData) {
					vm.processing = false

					var entityTypeVerbose = vm.entityType
						.split('-')
						.join(' ')
						.capitalizeFirstLetter()

					toastNotificationService.success(
						entityTypeVerbose +
							' ' +
							vm.entity.name +
							' was successfully created'
					)

					if (isAutoExitAfterSave) {
						let responseObj = { status: 'agree', data: responseData }
						metaHelper.closeComponent(
							vm.openedIn,
							$mdDialog,
							$bigDrawer,
							responseObj
						)
					} else {
						vm.entity = { ...vm.entity, ...responseData }
						vm.entity.$_isValid = true
						vm.evEditorEventService.dispatchEvent(evEditorEvents.ENTITY_UPDATED)

						const responseObj = {
							status: 'edit',
							data: {
								entityType: vm.entityType,
								entity: vm.entity,
							},
						}

						metaHelper.closeComponent(
							vm.openedIn,
							$mdDialog,
							$bigDrawer,
							responseObj
						)
					}
				})
				.catch(function (data) {
					console.log('save.data', data)

					vm.processing = false

					var popupText = ''

					if (data) {
						if (data.message) {
							if (
								data.message.non_field_errors &&
								data.message.non_field_errors.length
							) {
								if (
									data.message.non_field_errors[0].indexOf('unique set') !== -1
								) {
									popupText = vm.entityTypeSlug() + ' is already exist'
								}
							}
						}
					}

					if (popupText) {
						toastNotificationService.info(popupText)
					} else {
						$mdDialog.show({
							controller: 'ValidationDialogController as vm',
							templateUrl: 'views/dialogs/validation-dialog-view.html',
							targetEvent: $event,
							parent: angular.element(document.body),
							multiple: true,
							locals: {
								validationData: {
									errorData: data,
									tableColumnsNames: ['Name of fields', 'Error Cause'],
								},
							},
						})
					}
				})
		}

		vm.entity.$_isValid = entityEditorHelper.checkForNotNullRestriction(
			vm.entity,
			vm.entityAttrs,
			vm.attributeTypes
		)

		var hasProhibitNegNums = entityEditorHelper.checkForNegNumsRestriction(
			vm.entity,
			vm.entityAttrs,
			[],
			vm.layoutAttrs
		)

		if (vm.entity.$_isValid) {
			if (hasProhibitNegNums.length === 0) {
				var resultEntity = entityEditorHelper.removeNullFields(
					vm.entity,
					vm.entityType
				)

				console.log('resultEntity', resultEntity)

				if (dcLayoutHasBeenFixed) {
					uiService.updateEditLayout(
						vm.dataConstructorLayout.id,
						vm.dataConstructorLayout
					)
				}

				entityResolverService
					.create(vm.entityType, resultEntity)
					.then(function (data) {
						var responseObj = { res: 'agree', data: data }
						metaHelper.closeComponent(
							vm.openedIn,
							$mdDialog,
							$bigDrawer,
							responseObj
						)
					})
					.catch(function (data) {
						$mdDialog.show({
							controller: 'ValidationDialogController as vm',
							templateUrl: 'views/dialogs/validation-dialog-view.html',
							targetEvent: $event,
							parent: angular.element(document.body),
							multiple: true,
							locals: {
								validationData: {
									errorData: data,
									tableColumnsNames: ['Name of fields', 'Error Cause'],
								},
							},
						})
					})
			} else {
				var warningDescription =
					'<p>Next fields should have positive number value to proceed:'

				hasProhibitNegNums.forEach(function (field) {
					warningDescription = warningDescription + '<br>' + field
				})

				warningDescription = warningDescription + '</p>'

				$mdDialog.show({
					controller: 'WarningDialogController as vm',
					templateUrl: 'views/dialogs/warning-dialog-view.html',
					multiple: true,
					clickOutsideToClose: false,
					locals: {
						warning: {
							title: 'Warning',
							description: warningDescription,
							actionsButtons: [
								{
									name: 'CLOSE',
									response: { status: 'disagree' },
								},
							],
						},
					},
				})
			}
		}
	}

	/**
	 * Set default value for empty dynamic attributes of instrument from instrument type.
	 *
	 * @param entity {Object}
	 * @param dynamicAttributeData {Object}
	 */
	const setDynamicAttrValue = function (entity, dynamicAttributeData) {
		var dAttrUserCode = dynamicAttributeData.attribute_type_object.user_code
		var dAttrInsideEntity = entity.attributes.find((entityDAttr) => {
			return entityDAttr.attribute_type_object.user_code === dAttrUserCode
		})

		var dAttrValue = evHelperService.getDynamicAttrValue(dynamicAttributeData)
		var dAttrInsideEntityVal =
			evHelperService.getDynamicAttrValue(dAttrInsideEntity)
		var notInsideUserTab =
			!!!entityEditorHelper.getLocationOfAttributeInsideUserTabs(
				dAttrUserCode,
				vm.tabs
			)

		var changedByUser =
			changedEntityProperties.attributes[dAttrUserCode] &&
			changedEntityProperties.attributes[dAttrUserCode].byUser
		var fieldHasNoUserValue = !(
			(dAttrInsideEntityVal || dAttrInsideEntityVal === 0) &&
			changedByUser
		)

		var acceptsInstrTypeVal = notInsideUserTab || fieldHasNoUserValue

		if ((dAttrValue || dAttrValue === 0) && acceptsInstrTypeVal) {
			if (dynamicAttributeData.attribute_type_object.value_type === 30) {
				const EDAIndex = entity.attributes.findIndex((entityDAttr) => {
					return entityDAttr.attribute_type_object.user_code === dAttrUserCode
				})

				entity.attributes[EDAIndex].classifier = dynamicAttributeData.classifier
				entity.attributes[EDAIndex].classifier_object =
					dynamicAttributeData.classifier_object
			} else {
				entity.attributes = evHelperService.setDynamicAttrValueByUserCode(
					dAttrUserCode,
					entity.attributes,
					dAttrValue
				)
			}
		}

		return entity
	}

	// replace user_code with id
	var exposureProperties = [
		'co_directional_exposure_currency',
		'counter_directional_exposure_currency',
		'long_underlying_instrument',
		'short_underlying_instrument',
	]

	var getExposureOptionId = function (exposureProp, userCode) {
		var optionsList = []

		switch (exposureProp) {
			case 'co_directional_exposure_currency':
			case 'counter_directional_exposure_currency':
				optionsList = vm.currenciesSelectorOptions
				break

			case 'long_underlying_instrument':
			case 'short_underlying_instrument':
				optionsList = vm.instrumentsSelectorOptions
				break
		}

		var eOption = optionsList.find(function (option) {
			return option.user_code === userCode
		})

		return eOption.id
	}

	vm.bookInstrument = function () {
		return new Promise(function (resolve, reject) {
			instrumentTypeService
				.bookInstrument(vm.entity.instrument_type)
				.then(function (data) {
					Object.keys(data.instrument).forEach(function (prop) {
						if (prop === 'attributes') {
							data.instrument.attributes.forEach(function (dAttr) {
								vm.entity = setDynamicAttrValue(vm.entity, dAttr)
							})
						} else if (
							['accrual_calculation_schedules', 'event_schedules'].indexOf(
								prop
							) < 0
						) {
							var changedByUser =
								changedEntityProperties[prop] &&
								changedEntityProperties[prop].byUser
							var fieldHasNoUserValue = !(
								!!(vm.entity[prop] || vm.entity[prop] === 0) && changedByUser
							)
							var notInsideUserTab =
								!!!entityEditorHelper.getLocationOfAttributeInsideUserTabs(
									prop,
									vm.tabs
								)

							var acceptsInstrTypeVal = notInsideUserTab || fieldHasNoUserValue

							if (
								(data.instrument[prop] || data.instrument[prop] === 0) &&
								acceptsInstrTypeVal
							) {
								/*if ( exposureProperties.includes(prop) ) {

									vm.entity[prop] = getExposureOptionId(prop, data.instrument[prop]);

								} else {
									vm.entity[prop] = data.instrument[prop];
								}*/
								vm.entity[prop] = data.instrument[prop]
							}
						}
					})

					// vm.entity.object_permissions = data.instrument_type_object.object_permissions;
					const result = vm.sharedLogic.mapPermissionsToInstrument(
						data.instrument_type_object.object_permissions
					)
					vm.entity.object_permissions = result.objectPermissions
					vm.groups = result.groups

					vm.evEditorEventService.dispatchEvent(evEditorEvents.ENTITY_UPDATED)

					resolve()
				})
		})
	}

	var instrumentPricingCurrencyChanged = false // only once

	vm.onEntityChange = function (fieldKey, fieldType) {
		if (fieldKey) {
			var attributes = {
				entityAttrs: vm.entityAttrs,
				attrsTypes: vm.attributeTypes,
			}

			switch (fieldType) {
				case 'systemAttribute':
					if (!changedEntityProperties[fieldKey]) {
						changedEntityProperties[fieldKey] = {}
					}

					changedEntityProperties[fieldKey].byUser = true

					break

				case 'dynamicAttribute':
					if (!changedEntityProperties.attributes) {
						changedEntityProperties.attributes = {}
					}

					if (!changedEntityProperties.attributes[fieldKey]) {
						changedEntityProperties.attributes[fieldKey] = {}
					}

					changedEntityProperties.attributes[fieldKey].byUser = true

					break

				case 'userInput':
					if (!changedEntityProperties.values) {
						changedEntityProperties.values = {}
					}

					if (!changedEntityProperties.values[fieldKey]) {
						changedEntityProperties.values[fieldKey] = {}
					}

					changedEntityProperties.values[fieldKey].byUser = true

					break
			}

			entityEditorHelper.checkTabsForErrorFields(
				fieldKey,
				vm.evEditorDataService,
				attributes,
				vm.entity,
				vm.entityType,
				vm.tabs
			)

			/*var fieldIndex = vm.formErrorsList.indexOf(fieldKey);

                if (fieldIndex > -1) {

                    var entityAttrs = [];
                    var attrsTypes = [];

                    var i;
                    if (fieldType === 'entity-attribute') {
                        for (i = 0; i < vm.entityAttrs.length; i++) {

                            if (vm.entityAttrs[i].key === fieldKey) {

                                entityAttrs.push(vm.entityAttrs[i]);
                                break;

                            }

                        }

                    } else if (fieldType === 'dynamic-attribute') {

                        for (i = 0; i < vm.attributeTypes.length; i++) {
                            if (vm.attributeTypes[i].user_code === fieldKey) {

                                attrsTypes.push(vm.attributeTypes[i]);
                                break;

                            }
                        }

                    }

                    var errors = entityEditorHelper.validateEntityFields(vm.entity,
                        vm.entityType,
                        vm.tabs,
                        [], entityAttrs, attrsTypes, []);

                    if (!errors.length) {
                        vm.formErrorsList.splice(fieldIndex, 1);

                        var tabKeys = Object.keys(vm.tabsWithErrors);

                        for (i = 0; i < tabKeys.length; i++) {
                            var tKey = tabKeys[i];
                            var tabFields = vm.tabsWithErrors[tKey];

                            var tabFieldIndex = tabFields.indexOf(fieldKey);
                            if (tabFields.indexOf(fieldKey) > -1) {

                                vm.tabsWithErrors[tKey].splice(tabFieldIndex, 1);

                                if (!vm.tabsWithErrors[tKey].length) {

                                    var selectorString = ".tab-name-elem[data-tab-name='" + tKey + "']";
                                    var tabNameElem = document.querySelector(selectorString);

                                    tabNameElem.classList.remove('error-tab');

                                }

                                break;

                            }

                        }
                    }
                }*/
		}

		if (vm.entityType === 'instrument') {
			if (vm.entity.pricing_currency && !instrumentPricingCurrencyChanged) {
				instrumentPricingCurrencyChanged = true

				vm.entity.accrued_currency = vm.entity.pricing_currency
				vm.entity.co_directional_exposure_currency = vm.entity.pricing_currency
				vm.entity.counter_directional_exposure_currency =
					vm.entity.pricing_currency
			}
		}
	}

	vm.generateCurrencyAttributeTypesByValueTypes = function () {
		vm.attributeTypesByValueTypes = {
			10: [],
			20: [],
			40: [],
		}

		vm.attributeTypesByValueTypes[10] =
			vm.attributeTypesByValueTypes[10].concat(
				vm.attributeTypes
					.filter(function (item) {
						return item.value_type === 10
					})
					.map(function (item) {
						return {
							name: item.name,
							user_code: 'attributes.' + item.user_code,
						}
					})
			)

		vm.attributeTypesByValueTypes[20] =
			vm.attributeTypesByValueTypes[20].concat(
				vm.attributeTypes
					.filter(function (item) {
						return item.value_type === 20
					})
					.map(function (item) {
						return {
							name: item.name,
							user_code: 'attributes.' + item.user_code,
						}
					})
			)

		vm.attributeTypesByValueTypes[40] =
			vm.attributeTypesByValueTypes[40].concat(
				vm.attributeTypes
					.filter(function (item) {
						return item.value_type === 40
					})
					.map(function (item) {
						return {
							name: item.name,
							user_code: 'attributes.' + item.user_code,
						}
					})
			)

		console.log('vm.attributeTypesByValueTypes', vm.attributeTypesByValueTypes)
	}

	vm.getCurrencyPricingSchemes = function () {
		currencyPricingSchemeService.getList().then(function (data) {
			vm.currencyPricingSchemes = data.results

			vm.generateCurrencyAttributeTypesByValueTypes()

			$scope.$apply()
		})
	}

	vm.generateInstrumentAttributeTypesByValueTypes = function () {
		vm.attributeTypesByValueTypes = {
			10: [
				{
					name: 'Reference For Pricing',
					user_code: 'reference_for_pricing',
				},
			],
			20: [
				{
					name: 'Default Price',
					user_code: 'default_price',
				},
			],
			40: [
				{
					name: 'Maturity Date',
					user_code: 'maturity_date',
				},
			],
		}

		vm.attributeTypesByValueTypes[10] =
			vm.attributeTypesByValueTypes[10].concat(
				vm.attributeTypes
					.filter(function (item) {
						return item.value_type === 10
					})
					.map(function (item) {
						return {
							name: item.name,
							user_code: 'attributes.' + item.user_code,
						}
					})
			)

		vm.attributeTypesByValueTypes[20] =
			vm.attributeTypesByValueTypes[20].concat(
				vm.attributeTypes
					.filter(function (item) {
						return item.value_type === 20
					})
					.map(function (item) {
						return {
							name: item.name,
							user_code: 'attributes.' + item.user_code,
						}
					})
			)

		vm.attributeTypesByValueTypes[40] =
			vm.attributeTypesByValueTypes[40].concat(
				vm.attributeTypes
					.filter(function (item) {
						return item.value_type === 40
					})
					.map(function (item) {
						return {
							name: item.name,
							user_code: 'attributes.' + item.user_code,
						}
					})
			)

		console.log('vm.attributeTypesByValueTypes', vm.attributeTypesByValueTypes)
	}

	vm.getInstrumentPricingSchemes = function () {
		instrumentPricingSchemeService.getList().then(function (data) {
			vm.instrumentPricingSchemes = data.results

			console.log('instrumentPricingSchemes', vm.instrumentPricingSchemes)

			vm.generateInstrumentAttributeTypesByValueTypes()

			$scope.$apply()
		})
	}

	vm.getEntityPricingSchemes = function () {
		if (vm.entityType === 'currency') {
			vm.getCurrencyPricingSchemes()
		}

		if (vm.entityType === 'instrument') {
			vm.getInstrumentPricingSchemes()
		}

		if (vm.entityType === 'instrument-type') {
			vm.getInstrumentPricingSchemes()
		}
	}

	// Instrument tab Exposure start

	/*vm.getDataForInstrumentTabs = function () {

            entityResolverService.getListLight('instrument', {pageSize: 1000}).then(function (data) {
                vm.instrumentInstrumentsSelectorOptions = data.results
            })

            entityResolverService.getListLight('currency', {pageSize: 1000}).then(function (data) {
                vm.instrumentCurrenciesSelectorOptions = data.results
            })

        }*/

	// Instrument tab Exposure end

	/* vm.instrumentTypeChange = function ($event) {

            console.log('instrumentTypeChange', vm.entity)

            vm.sharedLogic.getFormLayout().then(formLayoutData => {

                vm.fixedAreaPopup.fields = formLayoutData.fixedAreaData;
                vm.originalFixedAreaPopupFields = JSON.parse(JSON.stringify(formLayoutData.fixedAreaData));

                vm.attributeTypes = formLayoutData.attributeTypes;

                vm.tabs = formLayoutData.tabs;
                vm.attributesLayout = formLayoutData.attributesLayout;

				vm.readyStatus.layout = true;
				vm.readyStatus.entity = true;

			});

        } */

	vm.openPricingMultipleParametersDialog = function ($event, item) {
		$mdDialog
			.show({
				controller: 'PricingMultipleParametersDialogController as vm',
				templateUrl:
					'views/dialogs/pricing/pricing-multiple-parameter-dialog-view.html',
				parent: angular.element(document.body),
				targetEvent: $event,
				clickOutsideToClose: false,
				preserveScope: true,
				autoWrap: true,
				skipHide: true,
				multiple: true,
				locals: {
					data: {
						item: item,
						entityType: vm.entityType,
						attributeTypes: vm.attributeTypes,
					},
				},
			})
			.then(function (res) {
				if (res.status === 'agree') {
					item.data = res.data.item.data
				}
			})
	}

	vm.init = async function () {
		/* setTimeout(function () {

				if (vm.openedIn === 'big-drawer') {

					vm.bigDrawerResizeButton = document.querySelector('.onResizeButtonClick');

					if (vm.bigDrawerResizeButton) {
						vm.bigDrawerResizeButton.addEventListener('click', onBigDrawerResizeButtonClick);
					}

				} else {
					vm.dialogElemToResize = document.querySelector('.evEditorDialogElemToResize');
				}

            }, 100);*/

		if (vm.entityType === 'instrument') {
			// vm.getDataForInstrumentTabs();
			vm.sharedLogic.getDataForInstrumentExposureTab().then(function (data) {
				vm.instrumentsSelectorOptions = data[0]
				vm.currenciesSelectorOptions = data[1]

				vm.readyStatus.exposureTab = true
			})
		}

		setTimeout(function () {
			vm.dialogElemToResize = vm.sharedLogic.onEditorStart()
		}, 100)

		/*vm.fixedAreaEventObj = { // sending signal to fields that are inside fixed area but outside of popup
                event: {}
            };*/
		vm.enfEventService = new EventService()

		vm.evEditorDataService = new EntityViewerEditorDataService()
		vm.evEditorEventService = new EventService()

		vm.evEditorDataService.setLocationsWithErrors(null)
		vm.evEditorDataService.setFormErrorsList([])

		var tooltipsOptions = {
			pageSize: 1000,
			filters: {
				content_type: contentType,
			},
		}

		tooltipsService.getTooltipsList(tooltipsOptions).then(function (data) {
			var tooltipsList = data.results
			vm.evEditorDataService.setTooltipsData(tooltipsList)
		})

		colorPalettesService.getList({ pageSize: 1000 }).then(function (data) {
			var palettesList = data.results
			vm.evEditorDataService.setColorPalettesList(palettesList)
		})

		getEntityAttrs()
		// vm.getFormLayout();
		// evEditorSharedLogicHelper.getFormLayout('addition', formLayoutFromAbove);
		// vm.sharedLogic.getGroupSelectorOptions(groupValueEntity).then(function () {

		vm.sharedLogic.getFormLayout(formLayoutFromAbove).then((formLayoutData) => {
			vm.typeSelectorOptions = formLayoutData.typeSelectorOptions
			vm.groupSelectorOptions = formLayoutData.groupSelectorOptions

			if (['responsible', 'counterparty'].indexOf(vm.entityType) !== -1) {
				vm.entity.group = vm.groupSelectorOptions[0].id
			} else if (
				['strategy-1', 'strategy-2', 'strategy-3'].indexOf(vm.entityType) !== -1
			) {
				vm.entity.subgroup = vm.groupSelectorOptions[0].id
			}

			/* FIXED AREA POPUP

				vm.fixedAreaPopup.fields = formLayoutData.fixedAreaData;
				vm.originalFixedAreaPopupFields = JSON.parse(JSON.stringify(formLayoutData.fixedAreaData));*/

			vm.attributeTypes = formLayoutData.attributeTypes
			vm.entity.attributes = formLayoutData.attributes

			/*if (metaService.getEntitiesWithoutDynAttrsList().indexOf(vm.entityType) === -1) {

					vm.entity.attributes = [];

					vm.attributeTypes.forEach(function (attributeType) {
						vm.entity.attributes.push(entityEditorHelper.appendAttribute(attributeType, null));
					});

				}*/

			vm.tabs = formLayoutData.tabs
			vm.tabColumns = formLayoutData.tabColumns
			vm.attributesLayout = formLayoutData.attributesLayout

			vm.evEditorDataService.setEntityAttributeTypes(vm.attributeTypes)

			if (vm.entityType === 'instrument') {
				vm.typeSelectorChange = function () {
					vm.bookInstrument().then(function () {
						vm.sharedLogic.typeSelectorChangeFns[vm.entityType]().then(
							(data) => {
								vm.tabs = data.tabs
								vm.attributesLayout = data.attributesLayout

								$scope.$apply()
							}
						)
					})
				}
			} else {
				vm.typeSelectorChange =
					vm.sharedLogic.typeSelectorChangeFns[vm.entityType]
			}

			/*if (['responsible', 'counterparty', 'strategy-1', 'strategy-2', 'strategy-3'].indexOf(vm.entityType) !== -1) {

					vm.entity.group = vm.groupSelectorOptions[0].id

				}*/
			vm.readyStatus.layout = true
			vm.readyStatus.entity = true

			$scope.$apply()

			/* vm.sharedLogic.getFieldsForFixedAreaPopup().then(fieldsData => {

					vm.fixedAreaPopup.fields = fieldsData;
					vm.originalFixedAreaPopupFields = JSON.parse(JSON.stringify(fieldsData));

					$scope.$apply();

				}); */
		})

		vm.getCurrencies()

		if (
			vm.entityType === 'price-history' ||
			vm.entityType === 'currency-history' ||
			vm.entityType === 'portfolio-register' ||
			vm.entityType === 'portfolio-register-record'
		) {
			vm.readyStatus.permissions = true
		} else {
			vm.loadPermissions()
		}

		/* vm.sharedLogic.getFieldsForFixedAreaPopup().then(function (fields) {

                vm.fixedAreaPopup.fields = fields;
                vm.originalFixedAreaPopupFields = JSON.parse(JSON.stringify(fields));

            }); */

		/* if (vm.fixedAreaPopup.fields) {
				originalFixedAreaPopupFields = JSON.parse(JSON.stringify(vm.fixedAreaPopup.fields));
			} */
	}

	vm.init()
}
