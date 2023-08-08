import evEvents from '@/angular/services/entityViewerEvents'
import evHelperService from '@/angular/services/entityViewerHelperService'

export default function (scope, $mdDialog, isReport) {
	const defaultHiddenDnDAreas = [
		'filtersHolder',
		'deletionAreaHolder',
		'leftSideGroupsHolder',
		'rightSideColumnsHolder',
	]

	let draggableAttrKey

	const onDragstart = function (ev, itemOrigin) {
		/* let draggableItemIndex;
			const draggableAttrKey = ev.target.dataset.attrKey;
			const draggableItem = columns.find((col, index) => {

				if (col.key === draggableAttrKey) {
					draggableItemIndex = index;
					return true;
				}

				return false;

			}); */
		draggableAttrKey = ev.target.dataset.attrKey
		const gcItems = itemOrigin === 'groups' ? scope.groups : scope.columns

		scope.draggableItem = gcItems.find((col, index) => {
			if (col.key === draggableAttrKey) {
				scope.draggableItemIndex = index
				return true
			}

			return false
		})

		let dragData = {
			attrKey: draggableAttrKey,
			itemOrigin: itemOrigin,
		}

		dragData = JSON.stringify(dragData)

		ev.dataTransfer.setData('attributeData', dragData)
		ev.dataTransfer.setData(draggableAttrKey, '')
		ev.dataTransfer.setData(itemOrigin, '')

		ev.dataTransfer.dropEffect = 'none'

		if (scope.draggableItem.error_data) {
			scope.dndAreas.deletionAreaHolder.classList.remove('display-none')
		} else {
			scope.hiddenDnDAreas.forEach((areaProp) => {
				if (!scope.dndAreas[areaProp]) return false
				scope.dndAreas[areaProp].classList.remove('display-none')
			})
		}

		scope.contentWrapElement.classList.add('g-groups-columns-dnd')

		// return {draggableAttrKey, draggableItemIndex, draggableItem};
	}

	const initErroredItemListeners = function () {
		scope.dndAreas.deletionAreaHolder.addEventListener(
			'drop',
			onDropToDeletionArea
		)

		scope.dndAreas.deletionAreaHolder.addEventListener(
			'dragover',
			onDropAreaDragenter
		)
		scope.dndAreas.deletionAreaHolder.addEventListener(
			'dragleave',
			onDropAreaDragleave
		)
	}

	let initListenersOnColumnDragStart

	const setInitListenersOnColumnDragStart = function (initListenersFn) {
		initListenersOnColumnDragStart = initListenersFn
	}

	const onColumnDragstart = function (ev) {
		onDragstart(ev, 'columns')

		initListenersOnColumnDragStart()
	}

	let initListenersOnGroupDragStart

	const setInitListenersOnGroupDragStart = function (initListenersFn) {
		initListenersOnGroupDragStart = initListenersFn
	}
	//endregion

	/**
	 *
	 * @param contentWrapElem {HTMLElement}
	 * @returns {Object<HTMLElement>}
	 * @memberof module:gcfAreasDndSharedLogicHelper
	 */
	const getDndAreas = function () {
		scope.dndAreas.columns =
			scope.contentWrapElement.querySelector('.gColumnsHolder')
		console.log('scope.contentWrapElement:', scope.contentWrapElement)
		if (isReport)
			scope.dndAreas.groups =
				scope.contentWrapElement.querySelector('.gGroupsHolder')

		scope.dndAreas.filtersHolder =
			scope.contentWrapElement.querySelector('.gFiltersDropArea')
		scope.dndAreas.deletionAreaHolder =
			scope.contentWrapElement.querySelector('.gDeletionDropArea')
		scope.dndAreas.leftSideGroupsHolder =
			scope.contentWrapElement.querySelector('.gLeftSideGroupsHolder')
		scope.dndAreas.rightSideColumnsHolder =
			scope.contentWrapElement.querySelector('.gRightSideColumnsHolder')

		return scope.dndAreas
	}
	/**
	 * Changes order of columns or groups inside entityViewerDataService.
	 *
	 * @param orderOf {String} - can be 'columns', 'groups'
	 * @param nextSibling {HTMLElement|null}
	 * @memberof module:gcfAreasDndSharedLogicHelper
	 */
	const changeOrder = function (orderOf, nextSibling) {
		const nextSiblingKey = nextSibling ? nextSibling.dataset.attrKey : null

		if (draggableAttrKey !== nextSiblingKey) {
			let GCitems = []
			let updateGCFMethod = null

			switch (orderOf) {
				case 'groups':
					GCitems = evDataService.getGroups()

					updateGCFMethod = function () {
						evDataService.setGroups(GCitems)
						evEventService.dispatchEvent(evEvents.GROUPS_CHANGE)
					}

					break

				case 'columns':
					GCitems = evDataService.getColumns()

					updateGCFMethod = function () {
						evDataService.setColumns(GCitems)
						evEventService.dispatchEvent(evEvents.COLUMNS_CHANGE)
					}

					break
			}

			scope.draggableItem = GCitems.find((item, index) => {
				if (item.key === draggableAttrKey) {
					GCitems.splice(index, 1)
					return true
				}

				return false
			})

			if (nextSiblingKey) {
				const nextSiblingIndex = GCitems.findIndex(
					(item) => item.key === nextSiblingKey
				)
				GCitems.splice(nextSiblingIndex, 0, scope.draggableItem)
			} else {
				// moved to the end
				GCitems.push(scope.draggableItem)
			}

			updateGCFMethod()

			evEventService.dispatchEvent(evEvents.REDRAW_TABLE)
		}
	}

	const removeDraggedOverClasses = function (ev) {
		const removeClasses = function (draggedElem) {
			draggedElem.classList.remove(
				'drop-left',
				'drop-right',
				'container-shadowed',
				'draggedOver'
			)
		}

		if (ev) {
			let leftElem = ev.target.closest('.draggedOver')

			if (leftElem) {
				removeClasses(leftElem)
			}
		} else {
			let leftElems = scope.contentWrapElement.querySelectorAll('.draggedOver')
			leftElems.forEach(removeClasses)
		}
	}

	//region Dragend
	let removeListenersOnDragend

	const setRemoveListenersOnDragend = function (removeListenersOnDragendFn) {
		removeListenersOnDragend = removeListenersOnDragendFn
	}

	const onDragend = function () {
		scope.contentWrapElement.classList.remove('g-groups-columns-dnd')

		draggableAttrKey = null
		scope.draggableItemIndex = null
		scope.draggableItem = null

		scope.hiddenDnDAreas.forEach((areaProp) => {
			if (!scope.dndAreas[areaProp]) return false
			scope.dndAreas[areaProp].classList.add('display-none')
		})

		removeDraggedOverClasses()

		removeListenersOnDragend()
	}
	//endregion Dragend

	const initDnDFromColumns = function () {
		scope.colsElems = scope.dndAreas.columns.querySelectorAll('.gDraggableHead')

		scope.colsElems.forEach((colElem) => {
			colElem.addEventListener('dragstart', onColumnDragstart)
			colElem.addEventListener('dragend', onDragend)
		})

		return scope.colsElems
	}
	/** When changing order of groups or columns */
	const onSameHolderDragenter = function (ev) {
		ev.stopPropagation()
		ev.preventDefault()

		const holderClass = ev.dataTransfer.types.includes('columns')
			? 'gColumnsHolder'
			: 'gGroupsHolder'
		// const draggedOverElem = ev.toElement.closest(".gcAreaDnD");
		const draggedOverElem = ev.target.closest('.gcAreaDnD')

		if (draggedOverElem.classList.contains(holderClass)) {
			draggedOverElem.classList.add('drop-right', 'draggedOver')
			ev.dataTransfer.dropEffect = 'move'
		} else {
			// Drag on item
			const types = ev.dataTransfer.types
			const nextSiblingKey = draggedOverElem.dataset.attrKey

			const nextColumn = scope.columns[scope.draggableItemIndex + 1]
			const beforeNextCol = nextColumn && nextColumn.key === nextSiblingKey

			if (types.includes(nextSiblingKey) || beforeNextCol) {
				// dragged over element itself or next element
				ev.dataTransfer.dropEffect = 'none'
			} else {
				draggedOverElem.classList.add('drop-left', 'draggedOver')
				ev.dataTransfer.dropEffect = 'move'
			}
		}
	}

	const onDropAreaDragenter = function (ev) {
		ev.preventDefault()
		ev.target.classList.add('dragged-over')
	}

	const onDropAreaDragleave = function (ev) {
		ev.preventDefault()
		ev.target.classList.remove('dragged-over')
	}

	let onDropToColumns

	/**
	 *
	 * @param handler {Function} - called on drop
	 */
	const setOnDropToColumns = function (handler) {
		onDropToColumns = handler
	}

	const onDropToFilters = function (ev) {
		ev.stopPropagation()

		let filters
		let filtersData // only for entity viewer

		if (isReport) {
			filters = scope.evDataService.getFilters()
		} else {
			filtersData = scope.evDataService.getFilters()
			filters = filtersData[scope.shownFiltersType] // scope.shownFiltersType assigned inside evGcfAreasDragAndDrop
		}

		const filterAlreadyExist = filters.find(
			(filter) => filter.key === draggableAttrKey
		)

		if (filterAlreadyExist) {
			const filterName = filterAlreadyExist.layout_name
				? filterAlreadyExist.layout_name
				: filterAlreadyExist.name

			$mdDialog.show({
				controller: 'WarningDialogController as vm',
				templateUrl: 'views/dialogs/warning-dialog-view.html',
				parent: angular.element(document.body),
				clickOutsideToClose: false,
				multiple: true,
				locals: {
					warning: {
						title: 'Error',
						description: 'Filter ' + filterName + ' already exist',
						actionsButtons: [
							{
								name: 'OK',
								response: false,
							},
						],
					},
				},
			})
		} else {
			const filterToAdd = evHelperService.getTableAttrInFormOf(
				'filter',
				scope.draggableItem
			)

			filters.push(filterToAdd)

			if (isReport) {
				scope.evDataService.setFilters(filters)
			} else {
				scope.evDataService.setFilters(filtersData)
			}

			scope.evEventService.dispatchEvent(evEvents.FILTERS_CHANGE)
		}
	}

	const onDropToDeletionArea = function (ev) {
		let droppedItemData = ev.dataTransfer.getData('attributeData')
		droppedItemData = JSON.parse(droppedItemData)

		let GCitems
		let updateGCFMethod

		switch (droppedItemData.itemOrigin) {
			case 'groups':
				GCitems = evDataService.getGroups()

				updateGCFMethod = function () {
					evDataService.setGroups(GCitems)
					evEventService.dispatchEvent(evEvents.GROUPS_CHANGE)
				}

				break

			case 'columns':
				GCitems = evDataService.getColumns()

				updateGCFMethod = function () {
					evDataService.setColumns(GCitems)
					evEventService.dispatchEvent(evEvents.COLUMNS_CHANGE)
				}
				break
		}

		const deletedItemIndex = GCitems.findIndex(
			(item) => item.key === droppedItemData.attrKey
		)
		GCitems.splice(deletedItemIndex, 1)

		updateGCFMethod()
		evEventService.dispatchEvent(evEvents.REDRAW_TABLE)
	}

	/** @module gcfAreasDndSharedLogicHelper **/
	return {
		defaultHiddenDnDAreas: defaultHiddenDnDAreas,
		getDndAreas: getDndAreas,

		initErroredItemListeners: initErroredItemListeners,
		setInitListenersOnColumnDragStart: setInitListenersOnColumnDragStart,
		setInitListenersOnGroupDragStart: setInitListenersOnGroupDragStart,

		changeOrder: changeOrder,
		removeDraggedOverClasses: removeDraggedOverClasses,

		onDragstart: onDragstart,
		initDnDFromColumns: initDnDFromColumns,

		setRemoveListenersOnDragend: setRemoveListenersOnDragend,
		onDragend: onDragend,

		onSameHolderDragenter: onSameHolderDragenter,
		onDropAreaDragenter: onDropAreaDragenter,
		onDropAreaDragleave: onDropAreaDragleave,

		setOnDropToColumns: setOnDropToColumns,
		onDropToFilters: onDropToFilters,
		onDropToDeletionArea: onDropToDeletionArea,
	}
}
