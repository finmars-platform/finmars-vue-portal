<template>
	<div class="flex sp aic">
		<div class="available">
			<div class="header">Available</div>

			<div class="block">
				<div class="search">
					<BaseInput class="m-b-0" label="Search" v-model="availableSearch" />
				</div>

				<div class="list">
					<div
						class="list_item"
						v-for="item in availableList"
						:key="item[item_id]"
						:class="{ selected: item.selected }"
						@click="item.selected = !item.selected"
						@dblclick="() => {
							item.selected = true;
							addItem();
						}"
					>
						{{ item[item_title] }}
					</div>
				</div>
			</div>
		</div>

		<div class="actions">
			<FmIcon btn icon="chevron_right" @click="addItem()" />
			<FmIcon btn icon="keyboard_double_arrow_right" @click="addItem('all')" />

			<FmIcon btn icon="chevron_left" @click="removeItem()" />
			<FmIcon
				btn
				icon="keyboard_double_arrow_left"
				@click="removeItem('all')"
			/>
		</div>

		<div class="selected">
			<div class="header">Selected</div>

			<div class="block">
				<div class="search">
					<BaseInput class="m-b-0" label="Search" v-model="selectedSearch" />
				</div>
				<div class="list">
					<div
						class="list_item"
						v-for="item in selectedList"
						:key="item[item_id]"
						:class="{ selected: item.selected }"
						@click="item.selected = !item.selected"
						@dblclick="() => {
							item.selected = true; removeItem();
						}"
					>
						{{ item[item_title] }}
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
	import {
		getSelectedFilter,
		computeSelectedList,
		computeAvailableList,
	} from './multiSelectHelper'

	let props = defineProps({
		items: {
			type: Array,
			default() { return [] },
		},
		/** Unique keys or objects of selected items as string separated by comma or inside an array */
		modelValue: [String, Array],
		item_title: {
			type: String,
			default: 'name',
		},
		item_id: {
			type: String,
			default: 'user_code',
		},
	})

	let emit = defineEmits(['update:modelValue'])

	let availableSearch = ref('')
	let selectedSearch = ref('')
	/**
	 * Set of unique ids of selected items
	 * @type {Ref<Set>}
	 * */
	let selectedFilter = ref(getSelectedFilter(props.modelValue, props.item_id))

	let selectedList = computed(() => {
		return computeSelectedList(
			selectedFilter.value,
			props.items,
			props.item_id,
			props.item_title
		).filter((selItem) => {
			// apply filter of user
			return selItem[props.item_title]
				.toLocaleLowerCase()
				.includes(selectedSearch.value.toLocaleLowerCase())
		})
	})

	let availableList = computed(() => {
		return computeAvailableList(
			selectedFilter.value,
			props.items,
			props.item_id,
			props.item_title,
			availableSearch.value
		)
	})

	function updateModelValue() {
		let result = [...selectedFilter.value]

		if (typeof props.modelValue == 'string') result = result.join(',')

		emit('update:modelValue', result)
	}

	function addItem(all) {
		let items = availableList.value
			.filter((item) => item.selected || !!all)
			.map((item) => {
				item.selected = false
				return item[props.item_id]
			})
		items.forEach((item) => selectedFilter.value.add(item))

		updateModelValue()
	}
	function removeItem(all) {
		let items = selectedList.value
			.filter((item) => item.selected || !!all)
			.map((item) => {
				item.selected = false
				return item[props.item_id]
			})

		items.forEach((item) => selectedFilter.value.delete(item))

		updateModelValue()
	}

	watch(
		() => props.modelValue,
		() => {
			selectedFilter.value = getSelectedFilter(props.modelValue, props.item_id)
		}
	)
</script>

<style lang="scss" scoped>
	.header {
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
		margin-top: -3px;
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
</style>
