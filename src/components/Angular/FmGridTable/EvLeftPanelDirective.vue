<template>
	<div class="height-100 position-relative">

		<div class="ev-left-panel-inner-container state-{{sliderButtonState}}">

			<div class="ev-left-panel-grouping-menu-button" @click="groupSectionState = !groupSectionState">
				<span class="material-icons">menu</span>
			</div>

			<div class="flex-column height-100">

				<div class="flex-1-1-auto overflow-auto">

					<g-ev-left-panel-tree-elem v-if="groupTypes.length"
																		 item="tree"
																		 ev-data-service="evDataService"
																		 @click="evEventService"
																		 ev-content-element="evContentElement"></g-ev-left-panel-tree-elem>

					<div v-if="!groupTypes.length" class="ev-left-panel-drag-msg">
						<span class="material-icons">file_download</span>
						<span class="text">Drag a column here to group by</span>
					</div>

				</div>


				<div class="ev-left-panel-footer-section">

					<div class="footer-content">
						<md-checkbox @click="toggleMultiselect($event)"
												 :checked="multiselectIsActive"
												 tabindex="0"
												 type="checkbox"
												 role="checkbox" aria-checked="false" class="m-b-0">
							Multiselect
						</md-checkbox>
					</div>

				</div>

			</div>

			<div class="ev-left-panel-slider evLeftPanelSlider"></div>

		</div>

		<div class="ev-left-panel-grouping-section evLeftPanelGroupingSection"
				 :class="{'active': groupSectionState}">

			<div v-for="item in groupTypes"
					 class="ev-left-panel-grouping-section-item {{'p-l-' + $index * 2}}"
					 data-key="{{item.key}}">

				<span class="material-icons">drag_indicator</span> <span
				class="ev-left-panel-grouping-section-item-name">{{item.name}}

         <md-tooltip md-direction="top">{{item.name}}</md-tooltip></span>

				<md-menu class="float-right" style="    margin-right: 4px;
    margin-top: -2px;">
					<md-button class="signed-button" @click="$mdOpenMenu($event)">
						<div class="flex-column flex-i-center" style="margin-top: -11px;">
							<span class="material-icons">more_vert</span>
						</div>
					</md-button>

					<md-menu-content width="4">

						<md-menu-item>
							<md-button @click="sortGroupType($event, item, $index, 'DESC')"
												 class="g-settings-option-btn">
								<span>Sort Descending</span>
							</md-button>
						</md-menu-item>

						<md-menu-item>
							<md-button @click="sortGroupType($event, item, $index, 'ASC')"
												 class="g-settings-option-btn">
								<span>Sort Ascending</span>
							</md-button>
						</md-menu-item>

						<md-menu-item>
							<md-button @click="deleteGroupType($event, item, $index)" class="g-settings-option-btn">
								<span>Delete</span>
							</md-button>
						</md-menu-item>

					</md-menu-content>
				</md-menu>


			</div>


			<div class="add-group-type-button" @click="addGroupType($event)">
				<div>  <span class="material-icons">add_circle</span>  Add Grouping</div>
			</div>


		</div>

		<div class="ev-left-panel-slider-button evLeftPanelSliderButton">
			<span class="material-icons" v-if="sliderButtonState == 'unfolded'">chevron_left</span>
			<span class="material-icons" v-if="sliderButtonState == 'folded'">chevron_right</span>
		</div>

	</div>
</template>

<script>
/**
 * Created by szhitenev on 25.05.2021.
 * */

import evEvents from '../../services/entityViewerEvents'
import evDataHelper from '../../helpers/ev-data.helper'
import evRvCommonHelper from '../../helpers/ev-rv-common.helper'
import evFilterService from '../../services/ev-data-provider/filter.service'
const props = defineProps([
	'evDataService',
	'evEventService',
	'attributeDataService',
	'spExchangeService',
	'contentWrapElement',
])
// export default function ($mdDialog, $state) {

		// templateUrl: 'views/directives/groupTable/g-ev-left-panel-view.html',

		// link: function (scope) {
			scope.multiselectIsActive = false
			scope.groupTypes = []

			scope.sliderButtonState = 'unfolded'

			let finishRenderIndex

			scope.recursiveMarkHasSelected = function (tree, selectedGroups) {
				tree.___has_selected_child = false

				selectedGroups.forEach(function (item) {
					var parents = evRvCommonHelper.getParents(
						item.___parentId,
						scope.evDataService
					)

					parents.forEach(function (parent) {
						if (parent.___id === tree.___id) {
							tree.___has_selected_child = true
						}
					})
				})

				if (tree.results.length) {
					tree.results.forEach(function (branch) {
						scope.recursiveMarkHasSelected(branch, selectedGroups)
					})
				}
			}

			scope.generateGroupsTree = function () {
				var result = evDataHelper.getGroupsAsTree(scope.evDataService)

				console.log('generateGroupsTree.result', result)
				var selectedGroups = scope.evDataService.getSelectedGroups()

				scope.recursiveMarkHasSelected(result, selectedGroups)

				// result = evFilterService.filterTableTree(result, scope.evDataService);

				return result
			}

			scope.toggleMultiselect = function () {
				scope.multiselectIsActive = !scope.multiselectIsActive

				scope.evDataService.setSelectedGroupsMultiselectState(
					scope.multiselectIsActive
				)
			}

			/* scope.resize = function () {
                    var table = document.querySelector('.g-table-section')

                    var leftPanel = document.querySelector('.g-ev-left-panel-holder')

                    leftPanel.style.height = (table.clientHeight - 15) + 'px'; // todo 10?
                } */

			scope.handleSlider = function () {
				var slider = document.querySelector('.evLeftPanelSlider')

				var leftPanel = document.querySelector('.g-ev-left-panel-holder')
				var parentSection = leftPanel.parentElement
				// var tableSection = document.querySelector('.g-table-section')

				var interfaceLayout = scope.evDataService.getInterfaceLayout()
				var resultWidth

				var evLeftPanelSliderButton = document.querySelector(
					'.evLeftPanelSliderButton'
				)

				slider.addEventListener('mousedown', function (event) {
					console.log('mousedown event', event)

					var clientX = event.clientX
					var clientY = event.clientY

					var originalWidth = interfaceLayout.evLeftPanel.width

					$(window).bind('mousemove', function sliderMouseMove(event) {
						var diffX = event.clientX - clientX
						// var diffY = clientY + event.clientY
						resultWidth = Math.max(230, originalWidth + diffX)

						interfaceLayout.evLeftPanel.width = resultWidth
						// leftPanel.style.width = resultWidth + 'px';
						// tableSection.style.width = parentSection.clientWidth - (resultWidth +1) + 'px'
						leftPanel.style['flex-basis'] = resultWidth + 'px'
						leftPanel.style.width = resultWidth + 'px'

						scope.evDataService.setInterfaceLayout(interfaceLayout)

						scope.evEventService.dispatchEvent(evEvents.UPDATE_TABLE_VIEWPORT)
					})
				})

				$(window).bind('mouseup', function () {
					$(window).unbind('mousemove')
					setTimeout(function () {
						scope.$apply() // apply scope.sliderButtonState change right away
					}, 100)
				})

				evLeftPanelSliderButton.addEventListener('click', function (event) {
					if (scope.sliderButtonState === 'unfolded') {
						resultWidth = 33
						scope.sliderButtonState = 'folded'
						slider.classList.add('display-none')

						scope.groupSectionState = false
					} else {
						resultWidth = 230
						scope.sliderButtonState = 'unfolded'
						slider.classList.remove('display-none')
					}

					interfaceLayout.evLeftPanel.width = resultWidth
					// leftPanel.style.width = resultWidth + 'px';
					// tableSection.style.width = parentSection.clientWidth - (resultWidth +1) + 'px'
					leftPanel.style['flex-basis'] = resultWidth + 'px'
					leftPanel.style.width = resultWidth + 'px'

					scope.evDataService.setInterfaceLayout(interfaceLayout)

					scope.$apply()

					scope.evEventService.dispatchEvent(evEvents.UPDATE_TABLE_VIEWPORT)
				})
			}

			scope.initEventListeners = function () {
				scope.evEventService.addEventListener(
					evEvents.DATA_LOAD_END,
					function () {
						// scope.resize();

						setTimeout(function () {
							scope.tree = JSON.parse(
								JSON.stringify(scope.generateGroupsTree())
							)
							scope.$apply()
						}, 0)
					}
				)

				scope.evEventService.addEventListener(
					evEvents.REDRAW_TABLE,
					function () {
						// scope.resize();

						setTimeout(function () {
							scope.tree = JSON.parse(
								JSON.stringify(scope.generateGroupsTree())
							)
							scope.$apply()
						}, 0)
					}
				)

				scope.evEventService.addEventListener(
					evEvents.UPDATE_TABLE,
					function () {
						// scope.resize();

						setTimeout(function () {
							scope.tree = JSON.parse(
								JSON.stringify(scope.generateGroupsTree())
							)
							scope.$apply()
						}, 0)
					}
				)

				/* scope.evEventService.addEventListener(evEvents.COLUMNS_CHANGE, function () {


                        setTimeout(function () {
                            scope.tree = scope.generateGroupsTree();
                            scope.$apply();
                        }, 0)

                    }); */

				/* In one of GROUPS_CHANGE listeners, update table called
                    scope.evEventService.addEventListener(evEvents.GROUPS_CHANGE, function () {

                        scope.groupTypes = scope.evDataService.getGroups()

                        setTimeout(function () {
                            scope.tree = scope.generateGroupsTree();
                            scope.$apply();
                        }, 0)

                    }); */

				/* REDRAW_TABLE called after entity viewer's front filters changed
                    scope.evEventService.addEventListener(evEvents.FILTERS_CHANGE, function () {


                        setTimeout(function () {
                            scope.tree = scope.generateGroupsTree();
                            scope.$apply();
                        }, 0)

                    }); */
			}

			scope.drake = {
				init: function () {
					this.dragulaInit()
					this.eventListeners()
				},

				eventListeners: function () {
					var drake = this.dragula

					drake.on('drop', function (elem, target, source, nextSibling) {
						console.log('scope.elem', elem)

						var elemKey = elem.dataset.key
						var nextSiblingKey

						if (nextSibling) {
							nextSiblingKey = nextSibling.dataset.key
						}

						var elemItem
						var elemNextSiblingIndex

						scope.groupTypes.forEach(function (item, index) {
							if (item.key === elemKey) {
								elemItem = item
							}
						})

						scope.groupTypes = scope.groupTypes.filter(function (item) {
							return item.key !== elemKey
						})

						scope.groupTypes.forEach(function (item, index) {
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
							scope.groupTypes.splice(elemNextSiblingIndex, 0, elemItem)
						} else {
							scope.groupTypes.push(elemItem)
						}

						scope.evDataService.setSelectedGroups([])
						scope.evDataService.setGroups(scope.groupTypes)

						scope.evDataService.resetData()
						scope.evDataService.resetRequestParameters()

						var rootGroup = scope.evDataService.getRootGroupData()

						scope.evDataService.setActiveRequestParametersId(rootGroup.___id)

						scope.evEventService.dispatchEvent(evEvents.GROUPS_CHANGE)

						console.log('dragPanelLeft.nextSibling', nextSibling)
						console.log('dragPanelLeft.groupTypes', scope.groupTypes)
					})
				},

				dragulaInit: function () {
					const items = [document.querySelector('.evLeftPanelGroupingSection')]

					this.dragula = dragula(items, {
						revertOnSpill: true,
					})
				},

				destroy: function () {
					if (this.dragula) {
						this.dragula.destroy()
					}
				},
			}

			scope.sortGroupType = function ($event, item, $index, type) {
				// reset sorting for other groups
				var i
				for (i = 0; i < scope.groupTypes.length; i = i + 1) {
					if (!scope.groupTypes[i].options) {
						scope.groupTypes[i].options = {}
					}
				}

				var group = scope.groupTypes[$index]
				console.log('groups sorting group', group)
				item.options.sort = type

				scope.groupTypes.forEach(function (item) {
					if (group.key === item.key || group.id === item.id) {
						item = group
					}
				})

				scope.evDataService.setGroups(scope.groupTypes)
				scope.evDataService.setActiveGroupTypeSort(group)

				scope.evEventService.dispatchEvent(evEvents.GROUP_TYPE_SORT_CHANGE)
			}

			scope.deleteGroupType = function ($event, item, $index) {
				scope.groupTypes = scope.groupTypes.filter(function (item, index) {
					return index !== $index
				})

				scope.evDataService.setSelectedGroups([])
				scope.evDataService.setGroups(scope.groupTypes)

				scope.evDataService.resetData()
				scope.evDataService.resetRequestParameters()

				var rootGroup = scope.evDataService.getRootGroupData()

				scope.evDataService.setActiveRequestParametersId(rootGroup.___id)

				scope.evEventService.dispatchEvent(evEvents.GROUPS_CHANGE)
			}

			const getAttributes = () => {
				var allAttrsList

				var entityType = scope.evDataService.getEntityType()

				if (scope.viewContext === 'reconciliation_viewer') {
					allAttrsList =
						scope.attributeDataService.getReconciliationAttributes()
				} else {
					switch (entityType) {
						case 'balance-report':
							allAttrsList =
								scope.attributeDataService.getBalanceReportAttributes()
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

			scope.addGroupType = function ($event) {
				var allAttrsList = getAttributes()

				var availableAttrs

				availableAttrs = allAttrsList.filter(function (attr) {
					if (attr.value_type === 'mc_field' || attr.key === 'notes')
						return false

					for (var i = 0; i < scope.groupTypes.length; i++) {
						if (scope.groupTypes[i].key === attr.key) {
							return false
						}
					}

					return true
				})

				$mdDialog
					.show({
						controller: 'TableAttributeSelectorDialogController as vm',
						templateUrl:
							'views/dialogs/table-attribute-selector-dialog-view.html',
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
								scope.groupTypes.push(res.data.items[i])
							}

							scope.evDataService.setSelectedGroups([])
							scope.evDataService.setGroups(scope.groupTypes)

							scope.evDataService.resetData()
							scope.evDataService.resetRequestParameters()

							var rootGroup = scope.evDataService.getRootGroupData()

							scope.evDataService.setActiveRequestParametersId(rootGroup.___id)

							scope.evEventService.dispatchEvent(evEvents.GROUPS_CHANGE)
						}
					})
			}

			var init = async function () {
				scope.multiselectIsActive =
					scope.evDataService.getSelectedGroupsMultiselectState()

				scope.initEventListeners()

				scope.groupTypes = scope.evDataService.getGroups()

				console.log('scope.groupTypes', scope.groupTypes)

				scope.tree = JSON.parse(JSON.stringify(scope.generateGroupsTree()))

				/* setTimeout(function () {

                        scope.resize();

                    }, 100)

                    window.addEventListener('resize', function () {
                        scope.resize();
                    }); */

				scope.handleSlider()
				scope.drake.init()

				finishRenderIndex = scope.evEventService.addEventListener(
					evEvents.FINISH_RENDER,
					function () {
						scope.evContentElement =
							scope.contentWrapElement.querySelector('.ev-viewport')
						scope.evEventService.removeEventListener(
							evEvents.FINISH_RENDER,
							finishRenderIndex
						)
					}
				)
			}

			init()

			scope.$on('$destroy', function () {
				$(window).unbind('mouseup')
			})
// 		},
// 	}
// }

</script>

<style lang="scss" scoped>

</style>
