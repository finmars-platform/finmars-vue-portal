<template>
	<div>
		<!-- :modelValue needed so that the multi selector's label displayed at the top when multi selector is not empty -->
		<BaseInput
			:modelValue="selectedList.length || ''"
			class="ms_wrap"
			:label="label"
			@click="isOpen = true"
		>
			<template #button><FmIcon icon="menu" /></template>

			<div class="flex aic" style="height: inherit" ref="chipWrap">
				<div
					v-if="selectedList.length"
					v-for="item in selectedList"
					:key="item[item_id]"
					class="flex-row fi-center fm_chip"
				>
					<FmIcon
						v-if="item.error_data"
						error
						icon="info"
						size="16"
						class="m-r-8"
						style="height: 16px"
					/>
					<span
						style="
							white-space: nowrap;
							overflow: hidden;
							text-overflow: ellipsis;
							display: inline-block;
							width: calc(100% - 20px);
							font-size: 12px;
						"
						>{{ item[item_title] }}</span
					>

					<FmIcon
						icon="close"
						size="16"
						class="m-l-4"
						@click.stop="deleteItem(item)"
					/>
				</div>

				<div v-else class="input_placeholder">{{placeholder || label}}</div>
			</div>
		</BaseInput>

		<BaseMultiSelectModal
			:title="modalTitle || label"
			:items="items"
			v-model:opened="isOpen"
			v-model="props.modelValue"
			:item_id="item_id"
			:item_title="item_title"
			@cancel="isOpen = false"
			@save="save"
		/>
	</div>
</template>

<script setup>
	import { getSelectedFilter } from './multiSelectHelper'

	let props = defineProps({
		items: {
			type: Array,
			default: [],
		},
		/** Unique keys or objects of selected items as string separated by comma or inside an array  */
		modelValue: {
			type: [String, Array],
			default: [],
		},
		label: String,
		modalTitle: String,
		item_id: {
			type: String,
			default: 'user_code',
		},
		item_title: {
			type: String,
			default: 'name',
		},

		placeholder: String,
	})
	let emit = defineEmits(['update:modelValue'])

	let isOpen = ref(false)
	let chipWrap = ref(null)

	// how many chips can fit into a multi selector
	let availableChips = ref(0)

	onMounted(() => {

		setTimeout(function () {
			// without setTimeout this function ca be called
			// when chipWrap.value have 0 width (width not calculated yet)
			availableChips.value = Math.floor(
				chipWrap.value.getBoundingClientRect().width / 75
			)

		}, 500);

	})
	/**
	 * Set of unique ids of selected items
	 * @type {Ref<Set>}
	 * */
	let selectedFilter

	selectedFilter = ref(getSelectedFilter(props.modelValue, props.item_id))

	let selectedList = computed(() => {
		let filtersArray = [...selectedFilter.value]

		if (!availableChips.value) return [];

		if (availableChips.value < filtersArray.length) {
			// remove data for chips that do not fit into a multi selector
			filtersArray = filtersArray.slice(0, availableChips.value - 1)
		}

		let result = filtersArray.map((selId) => {
			let selItem = props.items.find((item) => item[props.item_id] === selId)

			if (!selItem) {
				return {
					[props.item_id]: selId,
					[props.item_title]: 'Not found',
					error_data: {
						description: '',
					},
				}
			}

			return selItem
		})

		if (availableChips.value < selectedFilter.value.size) {
			// chip with number of chips that do not fit into a multi selector
			result.push({
				[props.item_id]: -1,
				[props.item_title]:
					selectedFilter.value.size - availableChips.value + 1 + '+',
			})
		}

		return result
	})

	function save(newValue) {
		isOpen.value = false
		emit('update:modelValue', newValue)
	}

	function deleteItem(item) {
		let index = props.modelValue.findIndex((o) => o == item.id)

		props.modelValue.splice(index, 1)

		let newRes = JSON.parse(JSON.stringify(props.modelValue))

		emit('update:modelValue', newRes)
	}

	watch(
		() => props.modelValue,
		() => {
			selectedFilter.value = getSelectedFilter(props.modelValue, props.item_id);
		}
	)
</script>

<style lang="scss" scoped>
	.ms_wrap {
		cursor: pointer;
	}
	.fm_chip {
		background: $main-darken-2;
		padding: 3px 8px;
		border-radius: 16px;
		min-width: 30px;
		text-align: center;
		max-width: 70px;

		& + & {
			margin-left: 5px;
		}
	}
	.input_placeholder {
		color: $text-pale;
	}
	/*.header {
	font-size: 20px;
	margin-bottom: 8px;
}
.block {
	min-width: 400px;
}
.list {
	border-bottom: 1px solid $border-darken;
	border-left: 1px solid $border-darken;
	border-right: 1px solid $border-darken;
	padding: 10px 0;
	overflow: auto;
	height: 270px;
}
.list_item {
	padding: 7px 14px;
	cursor: pointer;

	&.selected {
		background: #eee;
	}

	& + & {
		border-top: 1px solid #fff;
	}
}
.search {
}
.actions {
	padding: 0 10px;
}*/
</style>
