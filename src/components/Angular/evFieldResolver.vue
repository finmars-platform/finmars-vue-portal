<template>
	<div v-if="scope.readyStatus.content">
		<div v-if="scope.type === 'id'">
			<div v-if="isSpecialSearchRelation()">
				<div v-if="scope.valueEntity == 'instrument'">
					<instrument-select
						label="{{getName()}}"
						model="modelObj.model"
						item-object="entity[fieldKey + '_object']"
						on-change-callback="changeHandler()"
						item-name="inputTextObj.value"
						custom-buttons="item.buttons"
						custom-styles="customStyles"
						event-signal="ciEventObj.event"
						small-options="{notNull: options.notNull, tooltipText: tooltipText, dialogParent: '.dialog-containers-wrap'}"
					></instrument-select>
				</div>

				<div
					v-if="
						scope.valueEntity == 'counterparty' ||
						scope.valueEntity == 'currency'
					"
				>
					<unified-data-select
						label="{{getName()}}"
						model="modelObj.model"
						item-object="entity[fieldKey + '_object']"
						item-name="inputTextObj.value"
						custom-buttons="item.buttons"
						custom-styles="customStyles"
						event-signal="ciEventObj.event"
						small-options="{notNull: options.notNull, tooltipText: tooltipText, dialogParent: '.dialog-containers-wrap'}"
						entity-type="valueEntity"
						on-change-callback="changeHandler()"
					></unified-data-select>
				</div>

				<div
					v-if="
						scope.valueEntity !== 'instrument' &&
						scope.valueEntity !== 'counterparty' &&
						scope.valueEntity !== 'currency'
					"
				>
					<entity-search-select
						item="modelObj.model"
						label="getName()"
						item-name="inputTextObj.value"
						item-object="entity[fieldKey + '_object']"
						on-change-callback="changeHandler()"
						custom-buttons="item.buttons"
						custom-styles="customStyles"
						event-signal="ciEventObj.event"
						small-options="{
																		notNull: options.notNull,
																		tooltipText: tooltipText,
																		dialogParent: '.dialog-containers-wrap'
																	}"
						entity-type="valueEntity"
					></entity-search-select>
				</div>
			</div>

			<div v-if="!scope.isSpecialSearchRelation()">
				<div v-if="scope.checkComplexEntityType()">
					<md-input-container
						class="md-block no-error-spacer"
						aria-label="select with search"
					>
						<label data-ng-bind="getName()"></label>

						<md-select
							md-on-close="searchTerm = ''"
							data-ng-model="modelObj.model"
							data-ng-change="changeHandler()"
							md-on-open="getDataApply()"
							md-selected-text="bindFormFields()"
							md-container-class="common-select-container"
							style="{{inputBackgroundColor()}}"
						>
							<md-select-header>
								<input
									data-ng-model="searchTerm"
									type="search"
									placeholder="Search for a ..."
									class="md-text md-select-search-pattern select-input-filter"
									ng-keydown="$event.stopPropagation()"
								/>
							</md-select-header>

							<div v-if="groups" class="select-options-holder">
								<md-optgroup
									data-ng-repeat="group in groups | orderBy:'-'+group.name track by group.id"
									v-if="group.fields.length"
									label="{{scope.group.name}}"
								>
									<md-option
										data-ng-repeat="field in group.fields | orderBy:resolveSort(field) | filter:{name: searchTerm} track by $index"
										ng-value="field.id"
									>
										{{ scope.bindListFields(field) }}
									</md-option>
								</md-optgroup>
							</div>

							<div
								v-if="!groups && field && field[0]"
								class="select-options-holder"
							>
								<md-option data-ng-value="fields[0].id"
									>{{ scope.bindListFields(fields[0]) }}
								</md-option>
							</div>
						</md-select>
					</md-input-container>
				</div>

				<div v-if="!scope.checkComplexEntityType()">
					<div v-if="scope.fieldKey !== 'price_download_scheme'">
						<div v-if="!scope.checkForCrudSelects()">
							<dropdown-select
								label="{{scope.getName()}}"
								model="modelObj.model"
								placeholder-text="{{scope.getName()}}"
								event-signal="ciEventObj.event"
								menu-options="selectorOptions"
								small-options="{
																				notNull: options.notNull,
																				tooltipText: '{{scope.getName()}}',
																				dialogParent: '.dialog-containers-wrap'
																		 }"
								custom-styles="customStyles"
								sorted="sorted"
								on-change-callback="changeHandler()"
							>
							</dropdown-select>
						</div>

						<div v-if="checkForCrudSelects()">
							<div v-if="scope.readyStatus.content">
								<crud-select
									data-label="getName()"
									data-item="modelObj.model"
									data-entity-type="crudEntityType"
									data-options="fields"
									data-ng-click="getDataApply()"
									event-signal="ciEventObj.event"
									small-options="{notNull: options.notNull}"
								></crud-select>
							</div>
						</div>
					</div>

					<div v-if="scope.fieldKey == 'price_download_scheme'">
						<dropdown-select
							label="{{getName()}}"
							model="modelObj.model"
							placeholder-text="{{getName()}}"
							event-signal="ciEventObj.event"
							menu-options="schemeSortedFields"
							small-options="{notNull: options.notNull, tooltipText: '{{getName()}}', dialogParent: '.dialog-containers-wrap'}"
							custom-styles="customStyles"
							sorted="sorted"
							on-change-callback="changeHandler()"
						>
						</dropdown-select>
					</div>
				</div>
			</div>
		</div>

		<template v-if="scope.type === 'multiple-ids'">
			<BaseMultiSelectInput
				v-if="scope.checkComplexEntityType()"
				v-model="scope.modelObj.model"
				:title="scope.getName()"
				model="modelObj.model"
				:items="scope.selectorOptions"
				name-property="bindFieldsName"
				@update:model-value="scope.changeHandler()"
			/>

			<template v-else>
				<BaseMultiSelectInput
					v-if="scope.fieldKey !== 'content_types'"
					v-model="scope.modelObj.model"
					:title="scope.getName()"
					model="modelObj.model"
					:items="scope.selectorOptions"
					name-property="bindFieldsName"
					@update:model-value="scope.changeHandler()"
				/>

				<dropdown-select
					v-else
					label="{{getName()}}"
					model="modelObj.model"
					placeholder-text="{{getName()}}"
					event-signal="ciEventObj.event"
					menu-options="selectorOptions"
					small-options="{
																notNull: options.notNull,
																tooltipText: '{{getName()}}',
																dialogParent: '.dialog-containers-wrap'
														 }"
					custom-styles="customStyles"
					sorted="sorted"
					on-change-callback="changeHandler()"
				>
				</dropdown-select>
			</template>
		</template>
	</div>
</template>

<script setup>
	/**
	 * Created by szhitenev on 17.06.2016.
	 */

	import evEditorEvents from '@/angular/services/ev-editor/entityViewerEditorEvents'

	import metaService from '@/angular/services/metaService'
	import metaHelper from '@/angular/helpers/meta.helper'
	import fieldResolverServiceI from '~~/src/angular/services/fieldResolverService'

	const fieldResolverService = new fieldResolverServiceI()

	// export default function (metaContentTypesService) {
	// link: function ( elem, attrs, bfcVm) {
	const props = defineProps([
		'item',
		'entity',
		'content_type',
		'options',
		'entityType',
		'evEditorDataService',
		'evEditorEventService',
		'fieldsDataStore',
		'bfcVm',
	])

	const bfcVm = props.bfcVm
	const scope = reactive({ ...props })

	scope.readyStatus = bfcVm.readyStatus
	scope.readyStatus.content = false
	/** Used to differentiate between selector and multiselector **/
	scope.type = 'id'
	scope.fields = [] // list of menu options
	scope.sortedFields = []
	scope.schemeSortedFields = []

	scope.sorted = true
	scope.customStyles = null

	scope.modelObj = {
		model: null,
	}

	scope.ciEventObj = {
		event: {},
	}

	scope.inputTextObj = {
		value: null,
	}

	var fieldsDataIsLoaded = false
	var elIndexesData = {}

	if (
		['counterparties', 'accounts', 'responsibles', 'transaction_types'].indexOf(
			scope.item.key
		) !== -1
	) {
		scope.type = 'multiple-ids'
	}

	// ;

	scope.isSpecialSearchRelation = function () {
		return (
			[
				'instrument',
				'portfolio',
				'account',
				'responsible',
				'counterparty',
				'strategy-1',
				'strategy-2',
				'strategy-3',
				'currency',
			].indexOf(scope.getValueEntity()) !== -1
		)
	}

	scope.getValueEntity = function () {
		var valueEntity = scope.item.key

		if (scope.entityType === 'complex-transaction') {
			valueEntity = metaContentTypesService.findEntityByContentType(
				scope.item.content_type
			)

			// ;
		} else {
			if (
				scope.item.key &&
				['linked_instrument', 'allocation_balance', 'allocation_pl'].indexOf(
					scope.item.key
				) !== -1
			) {
				valueEntity = 'instrument'
			} else {
				switch (scope.item.name) {
					case 'account_interim':
					case 'account_cash':
					case 'account_position':
						valueEntity = 'account'
						break
				}
			}
		}

		return valueEntity
	}

	scope.searchTerm = ''

	scope.resolveSort = function (field) {
		if (field) {
			if (field.hasOwnProperty('name')) {
				return '-' + field.name
			}
			if (field.hasOwnProperty('user_code')) {
				return '-' + field.user_code
			}
			if (field.hasOwnProperty('public_name')) {
				return '-' + field.public_name
			}
		}
	}

	scope.checkComplexEntityType = function () {
		if (metaService.getFieldsWithTagGrouping().indexOf(scope.item.key) !== -1) {
			return true
		}
		return false
	}

	scope.inputBackgroundColor = bfcVm.inputBackgroundColor

	scope.getName = function () {
		if (scope.item.options && scope.item.options.fieldName) {
			return scope.item.options.fieldName
		} else if (scope.item.hasOwnProperty('verbose_name')) {
			return scope.item.verbose_name
		}

		return scope.item.name
	}

	scope.bindFormFields = function () {
		var result = ''

		var id = scope.modelObj.model

		if (id) {
			var i
			var attr

			for (i = 0; i < scope.fields.length; i = i + 1) {
				if (id === scope.fields[i].id) {
					attr = scope.fields[i]
				}
			}

			if (attr) {
				result = attr.name
			}

			if (scope.item.options && scope.item.options.fieldsForm) {
				var resultCaption = ''

				scope.item.options.fieldsForm.forEach(function (item, index) {
					if (index + 1 === scope.item.options.fieldsForm.length) {
						resultCaption = resultCaption + attr[item]
					} else {
						resultCaption = resultCaption + attr[item] + ' / '
					}
				})

				result = resultCaption
			}
		} else {
			result = scope.getName()
		}

		return result
	}

	scope.bindListFields = function (field) {
		if (scope.item.options && scope.item.options.fieldsList) {
			var resultCaption = ''

			scope.item.options.fieldsList.forEach(function (item, index) {
				if (index + 1 === scope.item.options.fieldsList.length) {
					resultCaption = resultCaption + field[item]
				} else {
					resultCaption = resultCaption + field[item] + ' / '
				}
			})

			return resultCaption
		}

		return field.name
	}

	var getListWithBindFields = function (items) {
		return items.map(function (item) {
			item.bindFieldsName = scope.bindListFields(item)
			return item
		})
	}

	var exposureTabAttrs = [
		'co_directional_exposure_currency',
		'counter_directional_exposure_currency',
		'long_underlying_instrument',
		'short_underlying_instrument',
		'exposure_calculation_model',
		'long_underlying_exposure',
		'short_underlying_exposure',
		'position_reporting',
	]

	var getSelectorOptions = function (items) {
		var nameField

		if (exposureTabAttrs.includes(scope.fieldKey) && items.length) {
			nameField = 'name'

			if (items[0].hasOwnProperty('short_name')) {
				nameField = 'short_name'
			}

			if (scope.entityType === 'instrument') {
				items = items.map(function (item) {
					item.name = item[nameField]
					return item
				})
			} else if (scope.entityType === 'instrument-type') {
				items = items.map(function (item) {
					item.id = item.user_code
					item.name = item[nameField]

					return item
				})
			}
		}

		items = metaHelper.textWithDashSort(items, nameField)

		return items.map(function (item) {
			item.bindFieldsName = scope.bindListFields(item)
			return item
		})
	}

	scope.getListWithSchemeName = function (items) {
		return items.map(function (item) {
			return {
				...item,
				name: item.user_code,
			}
		})
	}

	scope.bindMCField = function (model) {
		if (scope.modelObj.model && scope.modelObj.model.length > 0) {
			return '[' + scope.modelObj.model.length + '] selected'
		} else {
			return scope.getName()
		}
	}

	scope.getInputTextForEntitySearch = function () {
		var result = ''

		// var id = scope.entity[scope.fieldKey];
		var id = scope.modelObj.model

		if (scope.fields && scope.fields.length) {
			for (var i = 0; i < scope.fields.length; i = i + 1) {
				if (scope.fields[i].id === id) {
					if (scope.fields[i].short_name) {
						result = scope.fields[i].short_name
					} else if (scope.fields[i].name) {
						result = scope.fields[i].name
					} else {
						result = scope.fields[i].public_name
					}
				}

				if (result) {
					break
				}
			}
		}

		return result
	}

	scope.fieldKey = bfcVm.fieldKey

	if (scope.item.value_entity) {
		scope.crudEntityType = scope.item.value_entity
	} else {
		scope.crudEntityType = scope.item.entity
	}

	scope.checkForCrudSelects = function () {
		if (['group', 'subgroup'].indexOf(scope.fieldKey) !== -1) {
			return true
		}

		return false
	}

	scope.getData = function () {
		return new Promise(function (resolve, reject) {
			if (!fieldsDataIsLoaded) {
				var options = {}

				if (scope.options.entityType) {
					options.entityType = scope.options.entityType
				}

				if (scope.options.key) {
					options.key = scope.options.key
				}

				if (scope.entityType === 'complex-transaction') {
					if (scope.fieldsDataStore['fieldKeys']) {
						delete scope.fieldsDataStore['fieldKeys']['currencies.currency']
						delete scope.fieldsDataStore['fieldKeys']['instruments.instrument']
					}

					fieldResolverService
						.getFieldsByContentType(
							scope.item.content_type,
							options,
							scope.fieldsDataStore
						)
						.then(function (res) {
							scope.type = res.type
							scope.fields = res.data
							// scope.sortedFields = scope.getListWithBindFields(metaHelper.textWithDashSort(res.data));

							if (scope.fieldKey === 'price_download_scheme') {
								scope.schemeSortedFields = scope.getListWithSchemeName(
									metaHelper.textWithDashSort(res.data, 'user_code')
								)
							} else {
								scope.selectorOptions = getSelectorOptions(res.data)
							}

							scope.readyStatus.content = true
							fieldsDataIsLoaded = true

							resolve()
							// scope.$apply();
						})
				} else {
					fieldResolverService
						.getFields(scope.item.key, options, scope.fieldsDataStore)
						.then(function (res) {
							scope.type = res.type
							scope.fields = res.data
							// scope.sortedFields = scope.getListWithBindFields(metaHelper.textWithDashSort(res.data));

							if (scope.fieldKey === 'price_download_scheme') {
								scope.schemeSortedFields = scope.getListWithSchemeName(
									metaHelper.textWithDashSort(res.data, 'user_code')
								)
							} else {
								scope.selectorOptions = getSelectorOptions(res.data)
							}

							scope.readyStatus.content = true
							fieldsDataIsLoaded = true

							resolve()
						})
				}
			} else {
				resolve()
			}
		})
	}

	scope.getDataApply = function () {
		scope.getData()
	}

	scope.inputTextObj.value = scope.getInputTextForEntitySearch()

	watch(
		() => props.item,
		function () {
			fieldsDataIsLoaded = false

			// prepareDataForSelector();
			scope.inputTextObj.value = scope.getInputTextForEntitySearch()
		}
	)

	watch(
		() => props.modelObj,
		function () {
			fieldsDataIsLoaded = false

			// prepareDataForSelector();
			scope.inputTextObj.value = scope.getInputTextForEntitySearch()
		}
	)

	scope.changeHandler = function () {
		bfcVm.model = scope.modelObj.model

		if (bfcVm.itemChange) {
			bfcVm.itemChange()
		}
	}

	var setItemSpecificSettings = function () {
		var setSettingsResult = bfcVm.setItemSettings()

		scope.tooltipText = setSettingsResult.tooltipText
		scope.customStyles = setSettingsResult.customStyles
		scope.ciEventObj.event = setSettingsResult.event
	}

	var initEventListeners = function () {
		elIndexesData['MARK_FIELDS_WITH_ERRORS'] =
			scope.evEditorEventService.addEventListener(
				evEditorEvents.MARK_FIELDS_WITH_ERRORS,
				function () {
					scope.ciEventObj.event = { key: 'mark_not_valid_fields' }
				}
			)

		elIndexesData['ENTITY_UPDATED'] =
			scope.evEditorEventService.addEventListener(
				evEditorEvents.ENTITY_UPDATED,
				function () {
					scope.modelObj.model = bfcVm.getValueFromEntity()
				}
			)

		if (scope.entityType === 'complex-transaction') {
			elIndexesData['FIELDS_RECALCULATION_END'] =
				scope.evEditorEventService.addEventListener(
					evEditorEvents.FIELDS_RECALCULATION_END,
					function () {
						scope.modelObj.model = bfcVm.getValueFromEntity()

						if (
							scope.item &&
							scope.item.frontOptions &&
							scope.item.frontOptions.recalculated &&
							(scope.modelObj.model || scope.modelObj.model === 0)
						) {
							fieldsDataIsLoaded = false

							scope.getData().then(function () {
								setItemSpecificSettings()
								// prepareDataForSelector();
								scope.inputTextObj.value = scope.getInputTextForEntitySearch()

								scope.$apply()
							})
						}
					}
				)
		}
	}

	var init = function () {
		var tooltipsList = []

		if (scope.evEditorDataService) {
			tooltipsList = scope.evEditorDataService.getTooltipsData()
		}

		for (var i = 0; i < tooltipsList.length; i++) {
			if (tooltipsList[i].key === scope.fieldKey) {
				scope.tooltipText = tooltipsList[i].text
				break
			}
		}

		if (scope.item) {
			setItemSpecificSettings()
		}

		if (bfcVm.fieldType) {
			// should be called after setItemSpecificSettings()

			scope.getData()

			var item_object

			if (
				scope.entityType === 'complex-transaction' &&
				bfcVm.fieldType.type === 'userInput'
			) {
				item_object = scope.entity.values[scope.item.name + '_object']
			} else {
				item_object = scope.entity[scope.item.key + '_object']
			}

			if (item_object) {
				if (Array.isArray(item_object)) {
					scope.fields = item_object
				} else {
					scope.fields.push(item_object)
				}
			}

			scope.modelObj.model = bfcVm.getValueFromEntity()
			scope.inputTextObj.value = scope.getInputTextForEntitySearch()

			scope.valueEntity = scope.getValueEntity()

			if (scope.evEditorEventService) {
				initEventListeners()
			}
		}

		scope.options = bfcVm.checkForNotNull(scope.options)
	}

	init()

	onUnmounted(() => {
		Object.keys(elIndexesData).forEach(function (eventName) {
			var eventIndex = elIndexesData[eventName]
			scope.evEditorEventService.removeEventListener(eventName, eventIndex)
		})
	})
</script>

<style lang="scss" scoped></style>
