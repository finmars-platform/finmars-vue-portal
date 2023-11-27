<template>
	<div></div>
</template>

<script setup>
	import evEvents from '@/angular/services/entityViewerEvents'

	import metaService from '@/angular/services/metaService'
	import evHelperService from '@/angular/services/entityViewerHelperService'

	import GcfAreasDndSharedLogicHelper from '@/angular/helpers/entityViewer/sharedLogic/gcfAreasDndSharedLogicHelper'

	const props = defineProps([
		'contentWrapElement',
		'evDataService',
		'evEventService',
	])

	const scope = {
		contentWrapElement: props.contentWrapElement,
		evDataService: props.evDataService,
		evEventService: props.evEventService,
	}

	let sharedLogic

	//region Dragstart
	onMounted(() => {
		sharedLogic = new GcfAreasDndSharedLogicHelper(scope, $mdDialog, false)

		scope.shownFiltersType = 'frontend'
		scope.dndAreas = {}
		scope.hiddenDnDAreas = sharedLogic.defaultHiddenDnDAreas

		init()
	})

	function onDragOver(event) {
		event.preventDefault()
	}

	const initItemListeners = function () {
		scope.dndAreas.columns.addEventListener(
			'dragenter',
			sharedLogic.onSameHolderDragenter
		)
		scope.dndAreas.columns.addEventListener(
			'dragleave',
			sharedLogic.removeDraggedOverClasses
		)

		scope.dndAreas.columns
			.closest('.g-group-table-holder')
			.addEventListener('dragover', onDragOver)
		scope.dndAreas.columns.addEventListener('drop', onDropToColumns, {
			once: true,
		})

		scope.dndAreas.filtersHolder &&
			scope.dndAreas.filtersHolder.addEventListener(
				'drop',
				sharedLogic.onDropToFilters
			)
		scope.dndAreas.deletionAreaHolder &&
			scope.dndAreas.deletionAreaHolder.addEventListener(
				'drop',
				sharedLogic.onDropToDeletionArea
			)
		scope.dndAreas.leftSideGroupsHolder.addEventListener('drop', onDropToGroups)
		scope.dndAreas.rightSideColumnsHolder.addEventListener(
			'drop',
			onDropToColumns
		)

		scope.hiddenDnDAreas.forEach((hiddenAreaProp) => {
			if (!scope.dndAreas[hiddenAreaProp]) return false

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

	const removeListenersOnDragend = function () {
		scope.dndAreas.columns
			.closest('.g-group-table-holder')
			.removeEventListener('dragover', onDragOver)

		scope.dndAreas.filtersHolder &&
			scope.dndAreas.filtersHolder.removeEventListener(
				'drop',
				sharedLogic.onDropToFilters
			)

		scope.dndAreas.deletionAreaHolder &&
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
		// scope.dndAreas.columns.removeEventListener('dragover', (event) => {
		// 	console.log('event:', event)
		// 	// prevent default to allow drop
		// 	event.preventDefault()
		// })

		scope.dndAreas.columns.removeEventListener('drop', onDropToColumns)

		scope.colsElems.forEach(removeElemDragListeners)
	}

	const onDropToGroups = function (ev) {
		ev.preventDefault()

		let groups = evDataService.getGroups()

		const groupToAdd = evHelperService.getTableAttrInFormOf(
			'groups',
			scope.draggableItem
		)
		groups.push(groupToAdd)

		evDataService.setGroups(groups)

		evEventService.dispatchEvent(evEvents.GROUPS_CHANGE)
		// evEventService.dispatchEvent(evEvents.REDRAW_TABLE)
	}

	const onDropToColumns = function (ev) {
		ev.preventDefault()

		const nextSibling = ev.target.closest('.gDraggableHead')

		sharedLogic.changeOrder('columns', nextSibling)
	}
	async function init() {
		sharedLogic.setInitListenersOnColumnDragStart(onColumnDragstartListeners)
		sharedLogic.setRemoveListenersOnDragend(removeListenersOnDragend)

		setTimeout(() => {
			scope.dndAreas = sharedLogic.getDndAreas()
			scope.columns = evDataService.getColumns()
			scope.colsElems = sharedLogic.initDnDFromColumns()

			evEventService.addEventListener(evEvents.COLUMNS_CHANGE, function () {
				scope.columns = evDataService.getColumns()

				setTimeout(() => {
					scope.colsElems = sharedLogic.initDnDFromColumns()
				}, 500)
			})
		}, 500)

		evEventService.addEventListener(
			evEvents.FILTERS_TO_SHOW_CHANGE,
			function () {
				scope.shownFiltersType =
					scope.shownFiltersType === 'frontend' ? 'backend' : 'frontend'
			}
		)
	}
</script>
