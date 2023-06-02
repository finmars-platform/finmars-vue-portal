/**
 * Created by mevstratov on 20.06.2019.
 */

import evEvents from '../../services/entityViewerEvents'

import metaService from '../../services/metaService'
import evHelperService from '../../services/entityViewerHelperService'

import GcfAreasDndSharedLogicHelper from '../../helpers/entityViewer/sharedLogic/gcfAreasDndSharedLogicHelper'

export default function ($mdDialog) {
	return {
		restrict: 'A',
		scope: {
			evDataService: '=',
			evEventService: '=',
			contentWrapElement: '=',
			hiddenDndAreas: '=',
		},
		link: function (scope, elem, attrs) {
			const sharedLogic = new GcfAreasDndSharedLogicHelper(
				scope,
				$mdDialog,
				true
			)

			scope.viewContext = scope.evDataService.getViewContext()

			scope.dndAreas = {}
			scope.hiddenDnDAreas =
				scope.viewContext !== 'dashboard'
					? sharedLogic.defaultHiddenDnDAreas
					: []

			//region Dragstart

			const initItemListeners = function (sameHolderType, anotherHolderType) {
				scope.dndAreas[sameHolderType].addEventListener(
					'dragenter',
					sharedLogic.onSameHolderDragenter
				)
				scope.dndAreas[anotherHolderType].addEventListener(
					'dragover',
					onAnotherHolderDragover
				)

				scope.dndAreas[sameHolderType].addEventListener(
					'dragleave',
					sharedLogic.removeDraggedOverClasses
				)
				scope.dndAreas[anotherHolderType].addEventListener(
					'dragleave',
					onAnotherHolderDragleave
				)

				scope.dndAreas.groups.addEventListener('drop', onDropToGroups, {
					once: true,
				})
				scope.dndAreas.columns.addEventListener('drop', onDropToColumns, {
					once: true,
				})

				scope.dndAreas.filtersHolder.addEventListener(
					'drop',
					sharedLogic.onDropToFilters
				)
				scope.dndAreas.deletionAreaHolder.addEventListener(
					'drop',
					sharedLogic.onDropToDeletionArea
				)
				scope.dndAreas.leftSideGroupsHolder.addEventListener(
					'drop',
					onDropToGroups
				)
				scope.dndAreas.rightSideColumnsHolder.addEventListener(
					'drop',
					onDropToColumns
				)

				scope.hiddenDnDAreas.forEach((hiddenAreaProp) => {
					scope.dndAreas[hiddenAreaProp].addEventListener(
						'dragenter',
						sharedLogic.onDropAreaDragenter
					)
					scope.dndAreas[hiddenAreaProp].addEventListener(
						'dragleave',
						sharedLogic.onDropAreaDragleave
					)
				})

				let gcElems =
					sameHolderType === 'groups' ? scope.groupsElems : scope.colsElems

				gcElems.forEach((gcElem) => {
					const draggableArea = gcElem.querySelector('.gDraggableHeadArea')
					draggableArea.addEventListener(
						'dragleave',
						sharedLogic.removeDraggedOverClasses
					)
				})
			}

			const onColumnDragstartListeners = function () {
				if (
					scope.draggableItem.error_data &&
					scope.draggableItem.error_data.code === 10
				) {
					sharedLogic.initErroredItemListeners()
				} else {
					initItemListeners('columns', 'groups')
				}
			}

			const onColumnDragstartListenersInsideDashboard = function () {
				if (
					!scope.draggableItem.error_data ||
					scope.draggableItem.error_data.code !== 10
				) {
					// Columns with errors do not need separate listeners for dashboard. Only order of columns change allowed for report viewer inside dashboard.
					scope.dndAreas.columns.addEventListener(
						'dragenter',
						sharedLogic.onSameHolderDragenter
					)
					scope.dndAreas.columns.addEventListener('drop', onDropToColumns, {
						once: true,
					})

					scope.colsElems.forEach((gcElem) => {
						const draggableArea = gcElem.querySelector('.gDraggableHeadArea')
						draggableArea.addEventListener(
							'dragleave',
							sharedLogic.removeDraggedOverClasses
						)
					})
				}
			}

			const onGroupDragstartListeners = function () {
				if (
					scope.draggableItem.error_data &&
					scope.draggableItem.error_data.code === 10
				) {
					sharedLogic.initErroredItemListeners()
				} else {
					initItemListeners('groups', 'columns')
				}
			}

			//endregion Dragstart

			const onAnotherHolderDragover = function (ev) {
				const anotherHolderType = ev.dataTransfer.types.includes('columns')
					? 'groups'
					: 'columns'
				scope.dndAreas[anotherHolderType].classList.add(
					'container-shadowed',
					'draggedOver'
				)
			}

			const onAnotherHolderDragleave = function (ev) {
				const anotherHolder = ev.dataTransfer.types.includes('columns')
					? 'groups'
					: 'columns'
				scope.dndAreas[anotherHolder].classList.remove(
					'container-shadowed',
					'draggedOver'
				)
			}

			const onGroupDragstart = function (ev) {
				sharedLogic.onDragstart(ev, 'groups')
				onGroupDragstartListeners()
			}

			//region Dragend

			const removeListenersOnDragend = function () {
				scope.dndAreas.filtersHolder.removeEventListener(
					'drop',
					sharedLogic.onDropToFilters
				)
				scope.dndAreas.deletionAreaHolder.removeEventListener(
					'drop',
					sharedLogic.onDropToDeletionArea
				)
				scope.dndAreas.leftSideGroupsHolder.removeEventListener(
					'drop',
					onDropToGroups
				)
				scope.dndAreas.rightSideColumnsHolder.removeEventListener(
					'drop',
					onDropToColumns
				)

				let elemsToRemoveListeners = [scope.dndAreas.columns]

				const removeElemDragListeners = function (gcElem) {
					const draggableArea = gcElem.querySelector('.gDraggableHeadArea')
					draggableArea.removeEventListener(
						'dragleave',
						sharedLogic.removeDraggedOverClasses
					)
				}

				if (scope.viewContext !== 'dashboard') {
					elemsToRemoveListeners.push(scope.dndAreas.groups)
					scope.groupsElems.forEach(removeElemDragListeners)
				}

				elemsToRemoveListeners.forEach((holder) => {
					holder.removeEventListener(
						'dragenter',
						sharedLogic.onSameHolderDragenter
					)
					holder.removeEventListener(
						'dragleave',
						sharedLogic.removeDraggedOverClasses
					)
					holder.removeEventListener('dragover', onAnotherHolderDragover)

					holder.removeEventListener('drop', onDropToColumns)
					holder.removeEventListener('drop', onDropToGroups)
				})

				scope.colsElems.forEach(removeElemDragListeners)
			}

			const removeListenersOnDragendInsideDashboard = function () {
				scope.dndAreas.columns.removeEventListener(
					'dragenter',
					sharedLogic.onSameHolderDragenter
				)
				scope.dndAreas.columns.removeEventListener('drop', onDropToColumns)

				scope.colsElems.forEach((cElem) => {
					const draggableArea = cElem.querySelector('.gDraggableHeadArea')
					draggableArea.removeEventListener(
						'dragleave',
						sharedLogic.removeDraggedOverClasses
					)
				})
			}
			//endregion Dragend

			const onDropToGroups = function (ev) {
				ev.preventDefault()

				let droppedItemData = ev.dataTransfer.getData('attributeData')
				droppedItemData = JSON.parse(droppedItemData)

				if (droppedItemData.itemOrigin === 'groups') {
					const nextSibling = ev.target.closest('.gDraggableHead')
					// changeOrder('groups', nextSibling);
					sharedLogic.changeOrder('groups', nextSibling)
				} else if (droppedItemData.itemOrigin === 'columns') {
					const groups = scope.evDataService.getGroups()
					const groupToAdd = evHelperService.getTableAttrInFormOf(
						'groups',
						scope.draggableItem
					)

					if (!groupToAdd.frontOptions) {
						groupToAdd.frontOptions = {}
					}

					groupToAdd.frontOptions.lastDragged = true
					groups.push(groupToAdd)

					scope.evDataService.setGroups(groups)

					scope.evEventService.dispatchEvent(evEvents.GROUPS_CHANGE)
					scope.evEventService.dispatchEvent(evEvents.REDRAW_TABLE)
				}
			}

			const onDropToColumns = function (ev) {
				ev.preventDefault()

				let droppedItemData = ev.dataTransfer.getData('attributeData')
				droppedItemData = JSON.parse(droppedItemData)

				if (droppedItemData.itemOrigin === 'groups') {
					const groups = scope.evDataService.getGroups()
					// const groupToDeleteIndex = groups.findIndex(group => group.key === droppedItemData.attrKey);
					groups.splice(scope.draggableItemIndex, 1)
					let groupColumn = scope.columns[scope.draggableItemIndex]

					if (!groupColumn.frontOptions) {
						groupColumn.frontOptions = {}
					}

					groupColumn.frontOptions.lastDragged = true
					scope.evDataService.setColumns(scope.columns)

					scope.evDataService.setGroups(groups)

					scope.evEventService.dispatchEvent(evEvents.GROUPS_CHANGE)
					scope.evEventService.dispatchEvent(evEvents.REDRAW_TABLE)
				} else if (droppedItemData.itemOrigin === 'columns') {
					const nextSibling = ev.target.closest('.gDraggableHead')
					// changeOrder('columns', nextSibling);
					sharedLogic.changeOrder('columns', nextSibling)
				}
			}

			const initDnDFromGroups = function () {
				scope.groupsElems =
					scope.dndAreas.groups.querySelectorAll('.gDraggableHead')

				scope.groupsElems.forEach((groupElem) => {
					groupElem.addEventListener('dragstart', onGroupDragstart)
					groupElem.addEventListener('dragend', sharedLogic.onDragend)
				})
			}

			const init = function () {
				if (scope.viewContext === 'dashboard') {
					sharedLogic.setInitListenersOnColumnDragStart(
						onColumnDragstartListenersInsideDashboard
					)

					sharedLogic.setRemoveListenersOnDragend(
						removeListenersOnDragendInsideDashboard
					)
				} else {
					sharedLogic.setInitListenersOnColumnDragStart(
						onColumnDragstartListeners
					)
					sharedLogic.setInitListenersOnGroupDragStart(
						onGroupDragstartListeners
					)

					sharedLogic.setRemoveListenersOnDragend(removeListenersOnDragend)
				}

				setTimeout(function () {
					// wait for table elements to render

					scope.dndAreas = sharedLogic.getDndAreas()
					scope.columns = scope.evDataService.getColumns()
					scope.colsElems = sharedLogic.initDnDFromColumns()

					scope.evEventService.addEventListener(
						evEvents.COLUMNS_CHANGE,
						function () {
							scope.columns = scope.evDataService.getColumns()

							// wait for columns ngRepeat inside gColumnsComponent
							setTimeout(() => {
								scope.colsElems = sharedLogic.initDnDFromColumns()
							}, 500)
						}
					)

					if (scope.viewContext !== 'dashboard') {
						scope.groups = scope.evDataService.getGroups()

						initDnDFromGroups()

						scope.evEventService.addEventListener(
							evEvents.GROUPS_CHANGE,
							function () {
								scope.groups = scope.evDataService.getGroups()
								// wait for groups ngRepeat inside gColumnsComponent
								setTimeout(() => {
									initDnDFromGroups()

									scope.colsElems = sharedLogic.initDnDFromColumns()
								}, 500)
							}
						)
					}
				}, 500)
			}

			init()
		},
	}
}
