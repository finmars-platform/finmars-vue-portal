<template>
	<div
		class="g-filter-settings"
		:style="{ left: positions.left + 'px', top: positions.top + 'px' }"
	>
		<div class="g-filter-header flex sb aic">
			<h4>{{ vm?.filter?.name }}</h4>
			<FmIcon icon="close" @click="vm.cancel()" />
		</div>

		<div class="g-filter-content">
			<AngularFmGridTableRvTextFilter
				v-if="vm.filter.value_type === 10 || vm.filter.value_type === 30"
				:gFiltersHelper="gFiltersHelper"
				:vm="vm"
			/>

			<AngularFmGridTableRvNumberFilter
				v-if="vm.filter.value_type === 20"
				:gFiltersHelper="gFiltersHelper"
				:vm="vm"
			/>

			<div v-if="vm.filter.value_type === 40" class="m-b-24">
				<rv-date-filter></rv-date-filter>
			</div>

			<div v-if="vm.filter.value_type === 50" class="m-b-24">
				<rv-boolean-filter></rv-boolean-filter>
			</div>

			<FmCheckbox
				class="m-b-4"
				v-model="vm.filter.options.enabled"
				label="Enabled"
			/>
			<FmCheckbox
				v-model="vm.filter.options.exclude_empty_cells"
				label="Exclude cells with no value"
			/>
		</div>

		<div class="g-filter-footer flex sb">
			<FmBtn type="text" @click="vm.cancel()" class="link-button">cancel</FmBtn>
			<FmBtn @click="vm.saveFilterSettings()" class="link-button">APPLY</FmBtn>
		</div>
	</div>
</template>

<script setup>
	import popupEvents from '@/angular/services/events/popupEvents'
	import evEvents from '@/angular/services/entityViewerEvents'
	import userFilterService from '@/angular/services/rv-data-provider/user-filter.service'

	import metaHelper from '@/angular/helpers/meta.helper'

	const emits = defineEmits(['close'])
	const props = defineProps([
		'filterKey',
		'popupEventService',
		'popupData',
		'vm',
		'gFiltersHelper',
	])

	let $scope = {
		...props,
	}
	const { evEventService, evDataService, attributeDataService } =
		inject('ngDependace')

	// function RvFilterController($scope) {
	let vm = props.vm

	vm.popupEventService = $scope.popupEventService

	vm.columnRowsContent = []
	vm.showSelectMenu = false

	vm.isRootEntityViewer = evDataService.isRootEntityViewer()
	vm.useFromAbove = evDataService.getUseFromAbove()

	vm.filterNotFound = false

	let filtersList
	let useFromAboveFilters
	let isUseFromAboveFilter = false
	let filterIndex = -1
	const positions = ref({})

	onMounted(() => {
		let elem

		if (props.popupData.elem) {
			elem = props.popupData.elem
		} else {
			let chips = document.querySelectorAll('.chips-list-container .chip-wrap')

			elem = chips[chips.length - 1]
		}
		let rect = elem.getBoundingClientRect()

		positions.value.left = rect.left - 160
		positions.value.top = rect.top - 60
	})

	const findFilter = function () {
		let allFilters = JSON.parse(JSON.stringify(evDataService.getFilters()))
		filtersList = []
		useFromAboveFilters = []

		isUseFromAboveFilter = false

		allFilters.forEach((filter) => {
			if (isUseFromAbove(filter)) {
				useFromAboveFilters.push(filter)

				if (filter.key === $scope.filterKey) {
					vm.filter = filter
					isUseFromAboveFilter = true
					filterIndex = useFromAboveFilters.length - 1
				}
			} else {
				filtersList.push(filter)

				if (filter.key === $scope.filterKey) {
					vm.filter = filter
					filterIndex = filtersList.length - 1
				}
			}
		})

		if (filterIndex > -1) {
			vm.filter = props.gFiltersHelper.setFilterDefaultOptions(vm.filter, true)
		} else {
			vm.filterNotFound = true
		}
	}

	vm.getDataForSelects = function () {
		var columnRowsContent = userFilterService.getCellValueByKey(
			evDataService,
			vm.filter.key
		)

		vm.columnRowsContent = columnRowsContent.map(
			userFilterService.mapColRowsContent
		)

		// $scope.$apply();
	}

	var dialogParent = document.querySelector('.dialog-containers-wrap')

	vm.openUseFromAboveSettings = function () {
		return new Promise(function (resolve) {
			$mdDialog
				.show({
					controller: 'UseFromAboveDialogController as vm',
					templateUrl: 'views/dialogs/use-from-above-dialog-view.html',
					parent: dialogParent,
					multiple: true,
					locals: {
						data: {
							item: vm.filter.options.use_from_above.key,
							data: { value_type: vm.filter.value_type },
							entityType: vm.filter.options.use_from_above.attrs_entity_type,
							filterType: vm.filter.options.filter_type,
						},
						attributeDataService: attributeDataService,
					},
				})
				.then(function (res) {
					if (res.status === 'agree') {
						if (
							vm.filter.options.use_from_above.key !== res.data.item ||
							vm.filter.options.filter_type !== res.data.filterType
						) {
							vm.filter.options.use_from_above = {}

							vm.filter.options.use_from_above.key = res.data.item
							vm.filter.options.filter_type = res.data.filterType
							vm.filter.options.use_from_above.attrs_entity_type =
								res.data.attrsEntityType

							// resolve('use_from_above');
							resolve(vm.filter)
						}
					} else {
						// resolve(vm.filter.options.filter_type);
						resolve(vm.filter)
					}
				})
		})
	}

	const isUseFromAbove = (filterData) => {
		return !!(
			filterData.options.use_from_above &&
			Object.keys(filterData.options.use_from_above).length
		)
	}

	vm.getActiveFilterType = (filterTypesList) => {
		if (
			vm.filter.options.use_from_above &&
			Object.keys(vm.filter.options.use_from_above).length
		) {
			return 'use_from_above'
		} else {
			const activeType = filterTypesList.find((type) => {
				// return type.value === vm.filter.options.filter_type;
				return type.id === vm.filter.options.filter_type
			})

			// return activeType ? activeType.value : null;
			return activeType ? activeType.id : null
		}
	}

	vm.saveFilterSettings = function () {
		if (isUseFromAboveFilter !== isUseFromAbove(vm.filter)) {
			// is use from above toggled

			if (isUseFromAboveFilter) {
				// became ordinary filter

				filtersList.push(vm.filter)
				useFromAboveFilters.splice(filterIndex, 1)
			} else {
				// became use from above filter

				filtersList.splice(filterIndex, 1)
				useFromAboveFilters.push(vm.filter)
			}
		}

		let allFilters = useFromAboveFilters.concat(filtersList)

		evDataService.setFilters(allFilters)
		evEventService.dispatchEvent(evEvents.FILTERS_CHANGE)

		vm.cancel()
	}

	vm.cancel = function () {
		emits('close')
	}

	const init = function () {
		findFilter()

		// evEventService.addEventListener(evEvents.FILTERS_CHANGE, function () {
		// 	findFilter()
		// })
	}

	init()
</script>

<style lang="scss" scoped>
	.g-filter-settings {
		position: absolute;
		left: 0;
		top: 50px;
		width: 350px;
		background: #fff;
		box-shadow: 0 1px 4px hsl(0deg 0% 40% / 25%);
		border-radius: 5px;
		border: 1px solid $border;
		z-index: 43;
	}
	h4 {
		font-weight: 600;
	}
	.g-filter-header {
		border-bottom: 1px solid $border;
		padding: 10px 20px;
	}
	.g-filter-content {
		padding: 20px;
	}
	.g-filter-footer {
		padding: 10px 20px;
		border-top: 1px solid $border;
	}
</style>
