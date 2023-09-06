<template>
	<BaseModal :title="`Add ${vm.entityTypeSlug()}`">
		<div v-if="vm.readyStatus.permissions && vm.readyStatus.entity">
			<div
				v-if="vm.fixedFieldsAttributes.length > 0"
				class="entity-editor-fixed-area"
			>
				<div class="entity-editor-fa-row">
					<div class="fa-field1" :class="vm.getFaField1Classes()">
						<FmInputEntityNames
							v-model:name="vm.entity.name"
							v-model:short_name="vm.entity.short_name"
							v-model:user_code="vm.entity.user_code"
							v-model:public_name="vm.entity.public_name"
							:label="vm.entityTypeSlug()"
						/>
					</div>

					<div class="fa-field3" :class="vm.getFaField2Classes()">
						<FmSelect
							v-if="
								vm.entityType === 'instrument' ||
								vm.entityType === 'account' ||
								vm.entityType === 'instrument-type'
							"
							class="ev-editor-field"
							:label="vm.typeFieldLabel"
							model="vm.entity[vm.typeFieldName]"
							:items="vm.typeSelectorOptions"
							small-options="{tooltipText: 'Type', indicatorBtnIcon: 'type1', dialogParent: '.dialog-containers-wrap'}"
							on-change-callback="vm.typeSelectorChange()"
						/>

						<crud-select
							v-if="
								vm.entityType === 'responsible' ||
								vm.entityType === 'counterparty'
							"
							data-label="vm.groupSelectorLabel"
							data-item="vm.entity.group"
							data-entity-type="vm.groupSelectorEntityType"
							data-options="vm.groupSelectorOptions"
							event-signal="vm.fixedAreaEventObj.event"
							small-options="{notNull: true, dialogParent: '.dialog-containers-wrap'}"
							class="ev-editor-field"
						></crud-select>

						<crud-select
							v-if="
								vm.entityType === 'strategy-1' ||
								vm.entityType === 'strategy-2' ||
								vm.entityType === 'strategy-3'
							"
							data-label="vm.groupSelectorLabel"
							data-item="vm.entity.subgroup"
							data-entity-type="vm.groupSelectorEntityType"
							data-options="vm.groupSelectorOptions"
							event-signal="vm.fixedAreaEventObj.event"
							small-options="{notNull: true, dialogParent: '.dialog-containers-wrap'}"
							class="ev-editor-field"
						></crud-select>
					</div>
				</div>
			</div>

			<div v-if="vm.readyStatus.layout" class="position-relative">
				<FmTabs v-model="vm.activeTab" :tabs="vm.tabs.map((t) => t.name)" />

				<div class="md-padding p-t-26" v-for="tab in vm.tabs">
					<div
						class="entity-editor-row"
						v-for="row in vm.range(tab.layout.rows)"
						:style="{
							display: 'grid',
							gridTemplateColumns: `repeat(${tab.layout.columns}, 1fr)`,
							gap: '15px',
						}"
					>
						<AngularBindFieldControl
							v-for="field in tab.layout.fields"
							:entityType="vm.entityType"
							:entity="vm.entity"
							:evEditorDataService="vm.evEditorDataService"
							:evEditorEventService="vm.evEditorEventService"
							:item="vm.attributesLayout[tab.tabOrder][field.row][field.column]"
							:entity-change="vm.onEntityChange(fieldKey, fieldType)"
							:style="{ gridColumn: `span ${field.colspan}` }"
							:class="[
								'ev-data-field',
								field.attribute?.value_type == 'decoration'
									? 'decoration-label-line'
									: '',
							]"
						/>
					</div>
				</div>

				<md-tab v-for="tab in vm.entityTabs">
					<md-tab-body v-if="vm.checkViewState(tab)">
						<md-content class="md-padding p-t-26">
							<div data-ng-include="tab.templateUrl"></div>
						</md-content>
					</md-tab-body>
				</md-tab>

				<md-tab
					v-if="vm.canManagePermissions"
					md-active="vm.activeTab === 'permissions'"
				>
					<md-tab-body>
						<md-content class="md-padding p-t-26">
							<md-content class="md-padding permissions-table">
								<div
									v-if="vm.readyStatus.permissions"
									class="permissions-table"
									style="min-width: 410px"
								>
									<h3>Group permissions</h3>

									<div>
										<div class="flex-column">
											<div
												class="flex-row fc-space-between fi-end permissions-table-header"
											>
												<div class="flex-0-1-100">
													<div class="permissions-columns">Group name</div>
												</div>

												<div
													class="flex-row fc-space-between fi-center permissions-checkbox-holder"
													style="flex: 0 0 295px"
												>
													<div class="flex-33 flex-center permissions-columns">
														Delegate
														<ng-md-icon
															class="tooltip-inline-block"
															icon="info"
															size="20"
															style="fill: #777777"
														>
															<md-tooltip class="tooltip_2" md-direction="top">
																tooltip text
															</md-tooltip>
														</ng-md-icon>
													</div>

													<div class="flex-33 flex-center permissions-columns">
														Write
														<ng-md-icon
															class="tooltip-inline-block"
															icon="info"
															size="20"
															style="fill: #777777"
														>
															<md-tooltip class="tooltip_2" md-direction="top">
																tooltip text
															</md-tooltip>
														</ng-md-icon>
													</div>

													<div
														class="flex-33 flex-center permissions-columns"
														v-if="vm.entityType !== 'currency'"
													>
														Read
														<ng-md-icon
															class="tooltip-inline-block"
															icon="info"
															size="20"
															style="fill: #777777"
														>
															<md-tooltip class="tooltip_2" md-direction="top">
																tooltip text
															</md-tooltip>
														</ng-md-icon>
													</div>
												</div>
											</div>
											<md-divider></md-divider>
										</div>

										<div v-for="group in vm.groups" class="flex-column">
											<div
												class="flex-row fc-space-between permissions-table-row"
											>
												<div class="flex-0-1-100">
													<p>{{ group.name }}</p>
												</div>

												<div
													class="flex-row fc-space-between fi-center permissions-checkbox-holder"
													style="flex: 0 0 295px"
												>
													<div class="flex-33 flex-center permissions-columns">
														<md-checkbox
															class="md-secondary"
															:class="{
																'disabled-btn':
																	(vm.isInheritRights ||
																		!group.objectPermissions.manage) &&
																	!vm.currentMember.is_admin,
															}"
															ng-model="group.objectPermissions.manage"
														></md-checkbox>
													</div>
													<div class="flex-33 flex-center permissions-columns">
														<md-checkbox
															class="md-secondary"
															:class="{
																'disabled-btn':
																	(vm.isInheritRights ||
																		!group.objectPermissions.manage) &&
																	!vm.currentMember.is_admin,
															}"
															ng-model="group.objectPermissions.change"
														></md-checkbox>
													</div>
													<div
														v-if="vm.entityType !== 'currency'"
														class="flex-33 flex-center permissions-columns"
													>
														<md-checkbox
															class="md-secondary"
															:class="{
																'disabled-btn':
																	(vm.isInheritRights ||
																		!group.objectPermissions.manage) &&
																	!vm.currentMember.is_admin,
															}"
															ng-model="group.objectPermissions.view"
														></md-checkbox>
													</div>
												</div>
											</div>
											<md-divider></md-divider>
										</div>
									</div>
								</div>
								<div v-if="!vm.readyStatus.permissions">
									<div
										layout="row"
										layout-sm="column"
										layout-align="space-around"
										class="m-large"
									>
										<!--<md-progress-circular md-mode="indeterminate"-->
										<!--md-diameter="96"></md-progress-circular>-->
										<progress-circular diameter="100"></progress-circular>
									</div>
								</div>
							</md-content>
						</md-content>
					</md-tab-body>
				</md-tab>

				<div
					class="entity-tabs-menu entityTabsMenu"
					:class="{ active: vm.isEntityTabActive() }"
					custom-popup
					popup-template="{{vm.entityTabsMenuTplt}}"
					popup-data="vm.entityTabsMenuPopupData"
					position-relative-to="element"
					relative-popup-x="left"
					open-on="click"
					close-on-click-outside="true"
					popup-classes="{{vm.entityTablePopupClasses}}"
				>
					<md-button
						v-if="vm.entityType !== 'price-history'"
						aria-label="open entity tabs"
						class="md-icon-button entity-tabs-menu-btn"
					>
						<ng-md-icon icon="arrow_drop_down"></ng-md-icon>
					</md-button>

					<div class="tabs-menu-error-icon">
						<span class="material-icons">info</span>
						<md-tooltip class="error-tooltip" md-direction="top"
							>Tabs with error</md-tooltip
						>
					</div>
				</div>
			</div>
		</div>

		<div v-if="!vm.checkReadyStatus()">
			<div class="flex-row fc-space-around m-large">
				<progress-circular diameter="100"></progress-circular>
			</div>
		</div>

		<template #controls>
			<div class="flex sb">
				<div
					class="dialog-footer flex-row fc-space-between"
					data-ng-include="'views/entity-viewer/entity-viewer-universal-add-footer-view.html'"
				></div>
			</div>
		</template>
	</BaseModal>
</template>

<script setup>
	import layoutService from '@/angular/services/entity-data-constructor/layoutService'
	import metaService from '@/angular/services/metaService'
	import evEditorEvents from '@/angular/services/ev-editor/entityViewerEditorEvents'

	import gridHelperService from '@/angular/services/gridHelperService'
	import evHelperService from '@/angular/services/entityViewerHelperService'

	import EntityViewerEditorDataService from '@/angular/services/ev-editor/entityViewerEditorDataService'
	import EventService from '@/angular/services/eventService'

	import instrumentTypeService from '@/angular/services/instrumentTypeService'
	import metaPermissionsService from '@/angular/services/metaPermissionsService'
	import tooltipsService from '@/angular/services/tooltipsService'
	import colorPalettesService from '@/angular/services/colorPalettesService'

	import metaHelper from '@/angular/helpers/meta.helper'
	import entityEditorHelper from '@/angular/helpers/entity-editor.helper'
	import EntityViewerEditorSharedLogicHelper from '@/angular/helpers/entityViewer/sharedLogic/entityViewerEditorSharedLogicHelper'

	import currencyPricingSchemeService from '@/angular/services/pricing/currencyPricingSchemeService'
	import instrumentPricingSchemeService from '@/angular/services/pricing/instrumentPricingSchemeService'
	import bigDrawerService from '~~/src/angular/services/bigDrawerService'
	import instrumentServiceI from '~~/src/angular/services/instrumentService'
	import entityResolverService from '~~/src/angular/services/entityResolverService'
	import fieldResolverServiceI from '~~/src/angular/services/fieldResolverService'
	import attributeTypeService from '~~/src/angular/services/attributeTypeService'
	import uiService from '~~/src/angular/services/uiService'
	import usersGroupServiceI from '~~/src/angular/shell/scripts/app/services/usersGroupService'

	const instrumentService = new instrumentServiceI()
	const fieldResolverService = new fieldResolverServiceI()
	const usersGroupService = new usersGroupServiceI()

	// export default function entityViewerAddDialogController(
	// 	$bigDrawer,
	// 	$state,
	// 	toastNotificationService,
	// 	authorizerService,
	// 	usersService,
	// 	usersGroupService,
	// 	globalDataService,
	// 	metaContentTypesService,

	const props = defineProps({
		payload: Object,
	})
	console.log('props:', props)

	const vm = reactive({})

	const { entityType, entity, data } = props.payload
	const $mdDialog = inject('$mdDialog')
	// const {  attributeTypeService } = inject('ngDependace')

	const $bigDrawer = bigDrawerService()

	let $scope = {}

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
	vm.isEntityTabActive = function () {
		return (
			vm.activeTab &&
			(vm.activeTab === 'permissions' || vm.entityTabs.includes(vm.activeTab))
		)
	}
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
			})
	}

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
		})
	}

	vm.getCurrentMasterUser = function () {
		vm.currentMasterUser = globalDataService.getMasterUser()
		vm.system_currency = vm.currentMasterUser.system_currency

		vm.systemCurrencies = []

		if (vm.currentMasterUser.system_currency_object) {
			vm.systemCurrencies.push(vm.currentMasterUser.system_currency_object)
		}
	}

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

		// ;
		// ;

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

					if (table.inherit_rights) {
						vm.isInheritRights = true
					}
				}
			}
		})
	}

	vm.setInheritedPricing = function () {
		return new Promise(function (resolve, reject) {
			if (vm.entityType === 'instrument' && vm.entity.instrument_type) {
				entityResolverService
					.getByKey('instrument-type', vm.entity.instrument_type)
					.then(function (data) {
						vm.entity.pricing_policies = data.pricing_policies.map(function (
							policy
						) {
							var item = Object.assign({}, policy)

							delete item.id
							delete item.overwrite_default_parameters

							return item
						})
					})
			}
		})
	}

	vm.entityTypeSlug = function () {
		let title = vm.entityType.split('-').join(' ')
		return title.charAt(0).toUpperCase() + title.slice(1)
	}

	vm.onNameInputBlur = function () {
		if (vm.entity.name && !vm.entity.short_name) {
			var entityName = vm.entity.name
			vm.entity.short_name = entityName
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
		vm.entity.object_permissions = []

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

	vm.save = async function ($event, isAutoExitAfterSave) {
		if (vm.entityType === 'instrument') {
			vm.entity = await setValuesFromInstrumentType(vm.entity)
		}

		vm.updateEntityBeforeSave()

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
	}

	vm.getCurrencyPricingSchemes = function () {
		currencyPricingSchemeService.getList().then(function (data) {
			vm.currencyPricingSchemes = data.results

			vm.generateCurrencyAttributeTypesByValueTypes()
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
	}

	vm.getInstrumentPricingSchemes = function () {
		instrumentPricingSchemeService.getList().then(function (data) {
			vm.instrumentPricingSchemes = data.results

			vm.generateInstrumentAttributeTypesByValueTypes()
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

		vm.sharedLogic.getFormLayout(formLayoutFromAbove).then((formLayoutData) => {
			vm.typeSelectorOptions = formLayoutData.typeSelectorOptions
			vm.groupSelectorOptions = formLayoutData.groupSelectorOptions
			console.log('tab.layout.columns:', formLayoutData)

			if (['responsible', 'counterparty'].indexOf(vm.entityType) !== -1) {
				vm.entity.group = vm.groupSelectorOptions[0].id
			} else if (
				['strategy-1', 'strategy-2', 'strategy-3'].indexOf(vm.entityType) !== -1
			) {
				vm.entity.subgroup = vm.groupSelectorOptions[0].id
			}

			vm.attributeTypes = formLayoutData.attributeTypes
			vm.entity.attributes = formLayoutData.attributes

			vm.tabs = formLayoutData.tabs
			vm.activeTab = formLayoutData.tabs[0].name
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
							}
						)
					})
				}
			} else {
				vm.typeSelectorChange =
					vm.sharedLogic.typeSelectorChangeFns[vm.entityType]
			}

			vm.readyStatus.layout = true
			vm.readyStatus.entity = true
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
	}

	vm.init()
</script>

<style lang="scss" scoped></style>
