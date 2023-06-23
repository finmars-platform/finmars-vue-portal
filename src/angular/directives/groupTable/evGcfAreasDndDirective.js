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
		},
		link: function (scope, elem, attrs) {
			const sharedLogic = new GcfAreasDndSharedLogicHelper(
				scope,
				$mdDialog,
				false
			)

			scope.shownFiltersType = 'frontend'

			scope.dndAreas = {}

			scope.hiddenDnDAreas = sharedLogic.defaultHiddenDnDAreas

			// value assigned inside gcfAreasDndSharedLogicHelper
			scope.draggableItem
			scope.draggableItemIndex

			//region Dragstart

			const initItemListeners = function () {
				scope.dndAreas.columns.addEventListener(
					'dragenter',
					sharedLogic.onSameHolderDragenter
				)
				scope.dndAreas.columns.addEventListener(
					'dragleave',
					sharedLogic.removeDraggedOverClasses
				)

				// dndAreas.groups.addEventListener('drop', onDropToGroups, {once: true});
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

				scope.colsElems.forEach((gcElem) => {
					const draggableArea = gcElem.querySelector('.gDraggableHeadArea') // gDraggableHeadArea used to prevent call of event "dragleave" by children of gcAreaDnD
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
					initItemListeners()
				}
			}

			//endregion Dragstart

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

				const removeElemDragListeners = function (gcElem) {
					const draggableArea = gcElem.querySelector('.gDraggableHeadArea')
					draggableArea.removeEventListener(
						'dragleave',
						sharedLogic.removeDraggedOverClasses
					)
				}

				scope.dndAreas.columns.removeEventListener(
					'dragenter',
					sharedLogic.onSameHolderDragenter
				)
				scope.dndAreas.columns.removeEventListener(
					'dragleave',
					sharedLogic.removeDraggedOverClasses
				)
				scope.dndAreas.columns.removeEventListener('drop', onDropToColumns)

				scope.colsElems.forEach(removeElemDragListeners)
			}

			//endregion Dragend

			const onDropToGroups = function (ev) {
				ev.preventDefault()

				let groups = scope.evDataService.getGroups()

				const groupToAdd = evHelperService.getTableAttrInFormOf(
					'groups',
					scope.draggableItem
				)
				groups.push(groupToAdd)

				scope.evDataService.setGroups(groups)

				scope.evEventService.dispatchEvent(evEvents.GROUPS_CHANGE)
				scope.evEventService.dispatchEvent(evEvents.REDRAW_TABLE)
			}

			const onDropToColumns = function (ev) {
				ev.preventDefault()

				const nextSibling = ev.target.closest('.gDraggableHead')
				// changeOrder('columns', nextSibling);
				sharedLogic.changeOrder('columns', nextSibling)
			}

			const init = function () {
				sharedLogic.setInitListenersOnColumnDragStart(
					onColumnDragstartListeners
				)
				sharedLogic.setRemoveListenersOnDragend(removeListenersOnDragend)

				setTimeout(() => {
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
				}, 500)

				scope.evEventService.addEventListener(
					evEvents.FILTERS_TO_SHOW_CHANGE,
					function () {
						scope.shownFiltersType =
							scope.shownFiltersType === 'frontend' ? 'backend' : 'frontend'
					}
				)
			}

			init()
		},
	}
}
