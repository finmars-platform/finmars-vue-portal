<template>
	<div class="g-ev-left-panel-holder gEvLeftPanelHolder">
		<div
			class="ev-left-panel-inner-container"
			:class="`state-${sliderButtonState}`"
		>
			<div
				class="ev-left-panel-grouping-menu-button"
				@click="groupSectionState = !groupSectionState"
			>
				<span class="material-icons">menu</span>
			</div>

			<div class="flex-column height-100">
				<AngularFmGridTableTreeElem
					v-if="groupTypes.length"
					:item="tree"
					:evContentElement="evContentElement"
				/>

				<div v-else class="ev-left-panel-drag-msg">
					<span class="material-icons">file_download</span>
					<span class="text">Drag a column here to group by</span>
				</div>

				<div class="footer-content">
					<FmCheckbox
						v-model="multiselectIsActive"
						tabindex="0"
						label="Multiselect"
						@update:model-value="toggleMultiselect(multiselectIsActive)"
					/>
				</div>
			</div>

			<div class="ev-left-panel-slider evLeftPanelSlider"></div>
		</div>

		<div
			class="ev-left-panel-grouping-section evLeftPanelGroupingSection"
			:class="{ active: groupSectionState }"
		>
			<div
				v-for="(item, $index) in groupTypes"
				class="ev-left-panel-grouping-section-item {{'p-l-' + $index * 2}}"
				:data-key="item.key"
			>
				<span class="material-icons">drag_indicator</span>
				<span class="ev-left-panel-grouping-section-item-name"
					>{{ item.name }}

					<md-tooltip md-direction="top">{{ item.name }}</md-tooltip></span
				>

				<!-- <md-menu
					class="float-right"
					style="margin-right: 4px; margin-top: -2px"
				>
					<md-button class="signed-button" @click="$mdOpenMenu($event)">
						<div class="flex-column flex-i-center" style="margin-top: -11px">
							<span class="material-icons">more_vert</span>
						</div>
					</md-button>

					<md-menu-content width="4">
						<md-menu-item>
							<md-button
								@click="sortGroupType($event, item, $index, 'DESC')"
								class="g-settings-option-btn"
							>
								<span>Sort Descending</span>
							</md-button>
						</md-menu-item>

						<md-menu-item>
							<md-button
								@click="sortGroupType($event, item, $index, 'ASC')"
								class="g-settings-option-btn"
							>
								<span>Sort Ascending</span>
							</md-button>
						</md-menu-item>

						<md-menu-item>
							<md-button
								@click="deleteGroupType($event, item, $index)"
								class="g-settings-option-btn"
							>
								<span>Delete</span>
							</md-button>
						</md-menu-item>
					</md-menu-content>
				</md-menu> -->
				<FmMenu>
					<template #btn>
						<FmIcon
							class="g-filter-settings-big-left-btn primary-button rounded"
							btn-primary
							icon="more_vert"
							@click="$mdOpenMenu($event)"
							v-fm-tooltip="'ADD ' + evGetEntityNameByState()"
						/>
					</template>

					<template #default="{ close }">
						<div class="fm_list">
							<div
								class="g-settings-option-btn fm_list_item"
								@click="sortGroupType($event, item, $index, 'DESC')"
							>
								Sort Descending
							</div>

							<div
								@click="sortGroupType($event, item, $index, 'ASC')"
								class="g-settings-option-btn fm_list_item"
							>
								Sort Ascending
							</div>
						</div>
					</template>
				</FmMenu>
			</div>

			<div class="add-group-type-button" @click="addGroupType($event)">
				<div><span class="material-icons">add_circle</span> Add Grouping</div>
			</div>
		</div>

		<div class="ev-left-panel-slider-button evLeftPanelSliderButton">
			<span class="material-icons" v-if="sliderButtonState == 'unfolded'"
				>chevron_left</span
			>
			<span class="material-icons" v-if="sliderButtonState == 'folded'"
				>chevron_right</span
			>
		</div>

		<div
			class="drop-area-wrap left-side-groups-drop-area display-none gLeftSideGroupsHolder"
		>
			<div class="g-drop-area gDropArea"></div>

			<div class="drop-area-content">
				<span>Drop here to add grouping</span>
			</div>
		</div>
	</div>
</template>

<script setup>
	import evEvents from '@/angular/services/entityViewerEvents'
	import evDataHelper from '@/angular/helpers/ev-data.helper'
	import evRvCommonHelper from '@/angular/helpers/ev-rv-common.helper'
	import evFilterService from '@/angular/services/ev-data-provider/filter.service'
	import jquery from 'jquery'

	const props = defineProps([
		'attributeDataService',
		'spExchangeService',
		'contentWrapElement',
	])
	// export default function ($mdDialog, $state) {
	const scope = {
		...props,
	}

	const multiselectIsActive = ref(false)
	const groupTypes = ref([])
	const sliderButtonState = ref('unfolded')
	const groupSectionState = ref(false)
	const evContentElement = ref(null)
	const tree = ref(null)

	let finishRenderIndex

	onMounted(() => {
		scope.drake = {
			init: function () {
				this.eventListeners()
			},

			eventListeners: function () {
				document
					.querySelector('.evLeftPanelGroupingSection')
					.addEventListener('drop', (elem, target, source, nextSibling) => {
						console.log('scope.elem', elem)

						var elemKey = elem.dataset.key
						var nextSiblingKey

						if (nextSibling) {
							nextSiblingKey = nextSibling.dataset.key
						}

						var elemItem
						var elemNextSiblingIndex

						groupTypes.value.forEach(function (item, index) {
							if (item.key === elemKey) {
								elemItem = item
							}
						})

						groupTypes.value = groupTypes.value.filter(function (item) {
							return item.key !== elemKey
						})

						groupTypes.value.forEach(function (item, index) {
							if (item.key === nextSiblingKey) {
								elemNextSiblingIndex = index
							}
						})

						console.log(
							'dragPanelLeft.elemNextSiblingIndex',
							elemNextSiblingIndex
						)

						if (
							elemNextSiblingIndex !== null &&
							elemNextSiblingIndex !== undefined
						) {
							groupTypes.value.splice(elemNextSiblingIndex, 0, elemItem)
						} else {
							groupTypes.value.push(elemItem)
						}

						evDataService.setSelectedGroups([])
						evDataService.setGroups(groupTypes.value)

						evDataService.resetData()
						evDataService.resetRequestParameters()

						var rootGroup = evDataService.getRootGroupData()

						evDataService.setActiveRequestParametersId(rootGroup.___id)

						evEventService.dispatchEvent(evEvents.GROUPS_CHANGE)
					})
			},
		}

		init()
	})

	const recursiveMarkHasSelected = function (tree, selectedGroups) {
		tree.___has_selected_child = false

		selectedGroups.forEach(function (item) {
			var parents = evRvCommonHelper.getParents(item.___parentId, evDataService)

			parents.forEach(function (parent) {
				if (parent.___id === tree.___id) {
					tree.___has_selected_child = true
				}
			})
		})

		if (tree.results.length) {
			tree.results.forEach(function (branch) {
				recursiveMarkHasSelected(branch, selectedGroups)
			})
		}
	}

	const generateGroupsTree = function () {
		var result = evDataHelper.getGroupsAsTree(evDataService)

		var selectedGroups = evDataService.getSelectedGroups()

		recursiveMarkHasSelected(result, selectedGroups)

		// result = evFilterService.filterTableTree(result, evDataService);

		return result
	}

	const toggleMultiselect = function (val) {
		evDataService.setSelectedGroupsMultiselectState(val)
	}

	const handleSlider = function () {
		var slider = document.querySelector('.evLeftPanelSlider')

		var leftPanel = document.querySelector('.g-ev-left-panel-holder')
		var parentSection = leftPanel.parentElement
		// var tableSection = document.querySelector('.g-table-section')

		var interfaceLayout = evDataService.getInterfaceLayout()
		var resultWidth

		var evLeftPanelSliderButton = document.querySelector(
			'.evLeftPanelSliderButton'
		)
		console.log('evLeftPanelSliderButton:', evLeftPanelSliderButton)

		slider.addEventListener('mousedown', function (event) {
			console.log('mousedown event', event)

			var clientX = event.clientX
			var clientY = event.clientY

			var originalWidth = interfaceLayout.evLeftPanel.width

			jquery(window).bind('mousemove', function sliderMouseMove(event) {
				var diffX = event.clientX - clientX
				// var diffY = clientY + event.clientY
				resultWidth = Math.max(230, originalWidth + diffX)

				interfaceLayout.evLeftPanel.width = resultWidth
				// leftPanel.style.width = resultWidth + 'px';
				// tableSection.style.width = parentSection.clientWidth - (resultWidth +1) + 'px'
				leftPanel.style['flex-basis'] = resultWidth + 'px'
				leftPanel.style.width = resultWidth + 'px'

				evDataService.setInterfaceLayout(interfaceLayout)

				evEventService.dispatchEvent(evEvents.UPDATE_TABLE_VIEWPORT)
			})
		})

		jquery(window).bind('mouseup', function () {
			jquery(window).unbind('mousemove')
			// apply sliderButtonState.value change right away
		})

		evLeftPanelSliderButton.addEventListener('click', function (event) {
			if (sliderButtonState.value === 'unfolded') {
				resultWidth = 33
				sliderButtonState.value = 'folded'
				slider.classList.add('display-none')

				groupSectionState.value = false
			} else {
				resultWidth = 230
				sliderButtonState.value = 'unfolded'
				slider.classList.remove('display-none')
			}

			interfaceLayout.evLeftPanel.width = resultWidth
			// leftPanel.style.width = resultWidth + 'px';
			// tableSection.style.width = parentSection.clientWidth - (resultWidth +1) + 'px'
			leftPanel.style['flex-basis'] = resultWidth + 'px'
			leftPanel.style.width = resultWidth + 'px'

			evDataService.setInterfaceLayout(interfaceLayout)

			evEventService.dispatchEvent(evEvents.UPDATE_TABLE_VIEWPORT)
		})
	}

	const initEventListeners = function () {
		evEventService.addEventListener(evEvents.DATA_LOAD_END, function () {
			setTimeout(function () {
				tree.value = JSON.parse(JSON.stringify(generateGroupsTree()))
			}, 0)
		})

		evEventService.addEventListener(evEvents.REDRAW_TABLE, function () {
			// scope.resize();
			setTimeout(function () {
				tree.value = JSON.parse(JSON.stringify(generateGroupsTree()))
			}, 0)
		})

		evEventService.addEventListener(evEvents.UPDATE_TABLE, function () {
			// scope.resize();

			setTimeout(function () {
				tree.value = JSON.parse(JSON.stringify(generateGroupsTree()))
			}, 0)
		})
	}

	const sortGroupType = function ($event, item, $index, type) {
		// reset sorting for other groups
		var i
		for (i = 0; i < groupTypes.value.length; i = i + 1) {
			if (!groupTypes.value[i].options) {
				groupTypes.value[i].options = {}
			}
		}

		var group = groupTypes.value[$index]
		console.log('groups sorting group', group)
		item.options.sort = type

		groupTypes.value.forEach(function (item) {
			if (group.key === item.key || group.id === item.id) {
				item = group
			}
		})

		evDataService.setGroups(groupTypes.value)
		evDataService.setActiveGroupTypeSort(group)

		evEventService.dispatchEvent(evEvents.GROUP_TYPE_SORT_CHANGE)
	}

	const deleteGroupType = function ($event, item, $index) {
		groupTypes.value = groupTypes.value.filter(function (item, index) {
			return index !== $index
		})

		evDataService.setSelectedGroups([])
		evDataService.setGroups(groupTypes.value)

		evDataService.resetData()
		evDataService.resetRequestParameters()

		var rootGroup = evDataService.getRootGroupData()

		evDataService.setActiveRequestParametersId(rootGroup.___id)

		evEventService.dispatchEvent(evEvents.GROUPS_CHANGE)
	}

	const getAttributes = () => {
		var allAttrsList

		var entityType = evDataService.getEntityType()

		if (scope.viewContext === 'reconciliation_viewer') {
			allAttrsList = scope.attributeDataService.getReconciliationAttributes()
		} else {
			switch (entityType) {
				case 'balance-report':
					allAttrsList = scope.attributeDataService.getBalanceReportAttributes()
					break

				case 'pl-report':
					allAttrsList = scope.attributeDataService.getPlReportAttributes()
					break

				case 'transaction-report':
					allAttrsList =
						scope.attributeDataService.getTransactionReportAttributes()
					break

				default:
					var entityAttrs = []
					var dynamicAttrs = []
					allAttrsList = []

					entityAttrs =
						scope.attributeDataService.getEntityAttributesByEntityType(
							entityType
						)

					entityAttrs.forEach(function (item) {
						if (
							item.key === 'subgroup' &&
							item.value_entity.indexOf('strategy') !== -1
						) {
							item.name = 'Group'
						}
						item.entity = entityType
					})

					let instrumentUserFields =
						scope.attributeDataService.getInstrumentUserFields()
					let transactionUserFields =
						scope.attributeDataService.getTransactionUserFields()

					instrumentUserFields.forEach(function (field) {
						entityAttrs.forEach(function (entityAttr) {
							if (entityAttr.key === field.key) {
								entityAttr.name = field.name
							}
						})
					})

					transactionUserFields.forEach(function (field) {
						entityAttrs.forEach(function (entityAttr) {
							if (entityAttr.key === field.key) {
								entityAttr.name = field.name
							}
						})
					})

					dynamicAttrs =
						scope.attributeDataService.getDynamicAttributesByEntityType(
							entityType
						)

					dynamicAttrs = dynamicAttrs.map(function (attribute) {
						let result = {}

						result.attribute_type = Object.assign({}, attribute)
						result.value_type = attribute.value_type
						result.content_type = scope.contentType
						result.key = 'attributes.' + attribute.user_code
						result.name = attribute.name

						return result
					})

					allAttrsList = allAttrsList.concat(entityAttrs)
					allAttrsList = allAttrsList.concat(dynamicAttrs)

					break
			}
		}

		return allAttrsList
	}

	const addGroupType = function ($event) {
		var allAttrsList = getAttributes()

		var availableAttrs

		availableAttrs = allAttrsList.filter(function (attr) {
			if (attr.value_type === 'mc_field' || attr.key === 'notes') return false

			for (var i = 0; i < groupTypes.value.length; i++) {
				if (groupTypes.value[i].key === attr.key) {
					return false
				}
			}

			return true
		})

		$mdDialog
			.show({
				controller: 'TableAttributeSelectorDialogController as vm',
				templateUrl: 'views/dialogs/table-attribute-selector-dialog-view.html',
				targetEvent: $event,
				multiple: true,
				locals: {
					data: {
						availableAttrs: availableAttrs,
						title: 'Choose group to add',
						isReport: false,
						multiselector: true,
					},
				},
			})
			.then(function (res) {
				if (res && res.status === 'agree') {
					for (var i = 0; i < res.data.items.length; i = i + 1) {
						groupTypes.value.push(res.data.items[i])
					}

					evDataService.setSelectedGroups([])
					evDataService.setGroups(groupTypes.value)

					evDataService.resetData()
					evDataService.resetRequestParameters()

					var rootGroup = evDataService.getRootGroupData()

					evDataService.setActiveRequestParametersId(rootGroup.___id)

					evEventService.dispatchEvent(evEvents.GROUPS_CHANGE)
				}
			})
	}

	async function init() {
		multiselectIsActive.value =
			evDataService.getSelectedGroupsMultiselectState()

		initEventListeners()

		groupTypes.value = evDataService.getGroups()

		tree.value = JSON.parse(JSON.stringify(generateGroupsTree()))

		handleSlider()

		finishRenderIndex = evEventService.addEventListener(
			evEvents.FINISH_RENDER,
			function () {
				evContentElement.value = document.querySelector('.ev-viewport')
				evEventService.removeEventListener(
					evEvents.FINISH_RENDER,
					finishRenderIndex
				)
			}
		)
	}

	onBeforeUnmount(() => {
		jquery(window).unbind('mouseup')
	})
</script>
