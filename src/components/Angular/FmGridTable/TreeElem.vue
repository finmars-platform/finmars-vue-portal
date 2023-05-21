<template>
	<div
		v-if="item.___type === 'group'"
		class="ev-left-panel-tree-elem"
		:class="{ 'last-level-group': isLastLevel }"
	>
		<div
			v-if="item.___parentId"
			class="ev-left-panel-tree-elem-line flex-row fi-center"
			:class="{
				'selected-group': item.___is_selected,
				'has-selected-child-group': item.___has_selected_child,
			}"
		>
			<div
				v-show="!item.___is_open"
				class="ev-left-panel-folding-btn"
				@click="scope.unfoldGroup($event)"
			>
				<span class="material-icons">chevron_right</span>
			</div>

			<div
				v-show="item.___is_open"
				class="ev-left-panel-folding-btn"
				@click="scope.foldGroup($event)"
			>
				<span class="material-icons">expand_more</span>
			</div>

			<div
				@click="scope.toggleGroupSelection($event)"
				class="ev-left-panel-tree-elem-name"
			>
				{{ scope.getPrettyName() }} ({{ item.___items_count }})
			</div>
			<!--        <div @click="toggleGroupSelection($event)"  class="ev-left-panel-tree-elem-name"> {{item.___group_name}}</div>-->
		</div>

		<div v-if="item.___is_open">
			<div v-for="child in item.results" class="ev-left-panel-children-holder">
				<AngularFmGridTableTreeElem
					:item="child"
					:evContentElement="evContentElement"
				/>
			</div>

			<div v-if="currentPage < total_pages">
				<button
					class="control-button load-more"
					v-if="!isLastLevel"
					@click="scope.loadMore($event)"
				>
					Load more
				</button>
				<button
					class="control-button load-all"
					v-if="!isLastLevel"
					@click="scope.loadAll($event)"
				>
					Load all
				</button>
			</div>
		</div>

		<div v-if="loading">
			<div class="loader-spinner flex-row fc-space-around">
				<FmLoader />
			</div>
		</div>
	</div>
</template>

<script setup>
	import evEvents from '@/angular/services/entityViewerEvents'
	import evDomManager from '@/angular/services/ev-dom-manager/ev-dom.manager'

	const props = defineProps(['evContentElement', 'item'])

	const scope = reactive({
		...props,
	})

	onMounted(() => {
		init()
	})

	scope.loading = ref(false)

	scope.unfoldGroup = function ($event) {
		scope.item.___is_open = true
		console.log('scope.item:', scope.item)

		evDataService.setData(scope.item)

		const hasUnloadedChildren =
			scope.item.___items_count > 0 && !scope.item.results.length

		if (hasUnloadedChildren) {
			scope.loading = true

			const dataLoadEndIndex = evEventService.addEventListener(
				evEvents.DATA_LOAD_END,
				function () {
					scope.loading = false
					evEventService.removeEventListener(
						evEvents.DATA_LOAD_END,
						dataLoadEndIndex
					)
				}
			)
		}

		evDomManager.requestGroups(
			scope.item.___id,
			scope.item.___parentId,
			evDataService,
			evEventService
		)

		// evEventService.dispatchEvent(evEvents.UPDATE_TABLE)
	}

	scope.foldGroup = function ($event) {
		scope.item.___is_open = false
		evDataService.setData(scope.item)
		// evEventService.dispatchEvent(evEvents.UPDATE_TABLE)
	}

	var deselectChildrenObjs = function (item) {
		item.results.forEach(function (child) {
			// deactivate objects from previously selected group

			if (child.___type === 'object') {
				child.___is_activated = false
			}
		})

		return item
	}

	scope.loadMore = function ($event) {
		var groupHashId = scope.item.___id

		var requestParameters = evDataService.getRequestParameters(groupHashId)

		console.log('load more ', requestParameters)

		scope.total_pages = Math.ceil(
			requestParameters.pagination.count /
				requestParameters.pagination.page_size
		)

		if (requestParameters.body.page < scope.total_pages) {
			if (!requestParameters.body.page) {
				requestParameters.body.page = 1
				requestParameters.requestedPages = [1]
			}

			requestParameters.body.page = requestParameters.body.page + 1
			requestParameters.pagination.page = requestParameters.pagination.page + 1
			requestParameters.requestedPages.push(requestParameters.body.page)

			evDataService.setRequestParameters(requestParameters)
			evDataService.setActiveRequestParametersId(requestParameters.id)

			scope.currentPage = requestParameters.body.page
		}

		evEventService.dispatchEvent(evEvents.UPDATE_TABLE)
	}

	scope.loadAll = function ($event) {
		var groupHashId = scope.item.___id

		var requestParameters = evDataService.getRequestParameters(groupHashId)

		console.log('load all ', requestParameters)

		scope.total_pages = Math.ceil(
			requestParameters.pagination.count /
				requestParameters.pagination.page_size
		)

		if (requestParameters.body.page < scope.total_pages) {
			if (!requestParameters.body.page) {
				requestParameters.body.page = 1
				requestParameters.requestedPages = [1]
			}

			requestParameters.loadAll = true

			requestParameters.body.page = requestParameters.body.page + 1
			requestParameters.pagination.page = requestParameters.pagination.page + 1
			requestParameters.requestedPages.push(requestParameters.body.page)

			evDataService.setRequestParameters(requestParameters)

			scope.currentPage = requestParameters.body.page
		}
		evEventService.dispatchEvent(evEvents.UPDATE_TABLE)
	}

	scope.toggleGroupSelection = function ($event) {
		if (!scope.isLastLevel) {
			return
		}

		var selectedGroups = []

		scope.multiselectIsActive =
			evDataService.getSelectedGroupsMultiselectState()

		if (!scope.multiselectIsActive) {
			var selected = scope.item.___is_selected
			var items = evDataService.getDataAsList()

			items.forEach(function (item) {
				item.___is_selected = false

				if (item.results && item.results.length) {
					item = deselectChildrenObjs(item)
				}

				evDataService.setData(item)
			})

			evDataService.setSelectedGroups([])

			scope.item.___is_selected = selected // return ___is_selected status of clicked group after resetting statuses of all groups
		}

		selectedGroups = evDataService.getSelectedGroups()

		if (scope.item.___is_selected) {
			if (scope.item.results && scope.item.results.length) {
				var item = evDataService.getData(scope.item.___id)
				item = deselectChildrenObjs(item)

				evDataService.setData(item)
			}

			selectedGroups = selectedGroups.filter(function (group) {
				return group.___id !== scope.item.___id
			})
		} else {
			evDomManager.requestObjects(
				scope.item.___id,
				scope.item.___parentId,
				evDataService,
				evEventService
			)

			selectedGroups.push(scope.item)
		}

		scope.item.___is_selected = !scope.item.___is_selected

		evDataService.setData(scope.item)

		evDataService.setSelectedGroups(selectedGroups)

		scope.evContentElement.scrollTop = 0

		evDataService.setSelectAllRowsState(false)

		evEventService.dispatchEvent(evEvents.ROW_ACTIVATION_CHANGE)
		evEventService.dispatchEvent(evEvents.HIDE_BULK_ACTIONS_AREA)

		evEventService.dispatchEvent(evEvents.UPDATE_TABLE)
	}

	scope.getPrettyName = function () {
		scope.item.___group_name_pretty = scope.item.___group_name

		if (scope.groupType && scope.groupType.entity === 'complex-transaction') {
			if (scope.groupType.key === 'status') {
				if (scope.item.___group_name === 1) {
					scope.item.___group_name_pretty = 'Booked'
				} else if (scope.item.___group_name === 2) {
					scope.item.___group_name_pretty = 'Pending'
				} else if (scope.item.___group_name === 3) {
					scope.item.___group_name_pretty = 'Ignored'
				}
			}
		}

		return scope.item.___group_name_pretty
	}

	scope.getGroupType = function () {
		// console.log('tree elem, ', scope.item)

		var groups = evDataService.getGroups()

		scope.groupType = groups[scope.item.___level - 1]

		if (scope.item.___level === groups.length) {
			scope.isLastLevel = true
		}

		// console.log('tree groups, ', groups)
		// console.log('tree groupType, ', scope.groupType)
	}

	var init = async function () {
		scope.getGroupType()

		evEventService.addEventListener(evEvents.REDRAW_TABLE, function () {
			scope.getGroupType()
		})

		evEventService.addEventListener(evEvents.DATA_LOAD_END, function () {
			scope.getGroupType()

			var groupHashId = scope.item.___id

			var requestParameters = evDataService.getRequestParameters(groupHashId)
			console.log('requestParameters:', requestParameters)

			scope.total_pages = Math.ceil(
				requestParameters.pagination.count /
					requestParameters.pagination.page_size
			)

			if (!requestParameters.body.page) {
				requestParameters.body.page = 1
				requestParameters.requestedPages = [1]
			}

			scope.currentPage = requestParameters.body.page
		})
	}
</script>
