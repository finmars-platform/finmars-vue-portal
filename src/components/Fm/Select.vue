<template>
	<FmMenu
		class="fm_select"
		:opened="menuIsOpened"
		:openOn="optionsFilter ? false : 'click'"
		:menuWidth="attach === 'body' ? 'activator' : ''"
		:attach="attach"
		@update:opened="toggleMenu"
		data-testId="select"
	>
		<template #btn="{ isOpen }">
			<BaseInput
				:errorData="errorData"
				:modelValue="modelValue"
				class="input_btn"
				:class="{
					active: isOpen,
					bi_no_borders: no_borders,
				}"
				:label="label"
				:tooltip="tooltip"
				:required="required"
				:style="{ height: height }"
				@update:errorData="(newVal) => emit('update:errorData', newVal)"
				@click.stop="openMenu"
				v-bind="$attrs"
			>
				<template #button>
					<slot name="left_icon"></slot>
				</template>

				<template v-if="optionsFilter">
					<input
						ref="mainInput"
						:placeholder="label"
						v-model="moFilter"
						type="text"
						class="bi_main_input"
					/>
				</template>

				<template v-else>
					<div class="fm_select_main_input">
						<div
							class="selected_text"
							:class="{ 'nothing_selected': !selectedItem }"
						>
							{{ selectedName }}
						</div>
					</div>
				</template>

				<template #rightBtn>
					<slot name="right_btn">
						<div class="flex-row">
							<FmBtn
								v-if="clearBtn"
								type="icon"
								icon="close"
								class="fm_select_right_btn"
								@click.stop="emit('update:modelValue', null)"
							/>

							<FmBtn
								type="icon"
								:icon="isOpen ? 'arrow_drop_up' : 'arrow_drop_down'"
								@click="mainInput && mainInput.focus()"
							/>
						</div>
					</slot>
				</template>
			</BaseInput>
		</template>

		<template #default="{ close }">
			<div class="fm_list">
				<div
					class="fm_list_item"
					v-for="(item, index) in menuOptions"
					:key="index"
					:class="{ active: item[prop_id] == modelValue }"
					@click="selectOption(item)"
				>
					<div>{{ item[prop_name] }}</div>
				</div>
			</div>
		</template>
	</FmMenu>
</template>

<script setup>
	import FmMenu from './Menu.vue'
	import FmBtn from './Btn.vue'
	import BaseInput from '../base/Input.vue'
	// import { ref, computed } from 'vue'

	let props = defineProps({
		modelValue: [String, Number],
		items: Array,
		label: String,
		tooltip: String,
		prop_id: {
			type: String,
			default: 'id',
		},
		prop_name: {
			type: String,
			default: 'name',
		},
		height: String,
		no_borders: Boolean,
		optionsFilter: Boolean,
		required: Boolean,
		attach: {
			type: String,
			// default: 'body',
		},
		clearBtn: Boolean, // button that empties select
		errorData: Object,
	})

	let emit = defineEmits(['update:modelValue', 'update:errorData'])

	let moFilter = ref('')
	let menuIsOpened = ref(false)

	let menuOptions = computed(() => {
		if (moFilter.value) {
			return props.items.filter((item) => {
				return (
					item[props.prop_name] &&
					item[props.prop_name]
						.toLowerCase()
						.includes(moFilter.value.toLowerCase())
				)
			})
		}

		return props.items
	})

	let selectedItem = computed(() => {

		if (props.items)
			return props.items.find((item) => item[props.prop_id] == props.modelValue)

		return null
	})

	let selectedName = computed(() => {
		if (selectedItem.value) {
			return selectedItem.value[props.prop_name]
		}
		// else if (props.label) {
		// 	return ' ';
		// }
		return props.label ? props.label : 'Select option'
	})

	let mainInput = ref(null)

	function selectOption(selItem) {
		// if (props.optionsFilter) moFilter.value = '';
		toggleMenu(false)

		if (selItem[props.prop_id] === props.modelValue) {
			return
		}

		emit('update:modelValue', selItem[props.prop_id])
	}

	//#region props.optionsFilter === true
	function openMenu() {
		moFilter.value = ''
		menuIsOpened.value = true
	}

	function toggleMenu(opened) {
		if (!opened) {
			moFilter.value = selectedName.value
		}

		menuIsOpened.value = opened
	}

	if (props.optionsFilter) {
		if (props.modelValue) {
			moFilter.value = selectedName.value
		}

		watch(
			() => props.modelValue,
			() => {
				if (props.modelValue) moFilter.value = selectedName.value
			}
		)
	}

	//#endregion
</script>

<style lang="scss" scoped>
	.fm_select {
		display: block;
	}
	.input_btn {
		cursor: pointer;

		:deep(.bi_main_input) {
			cursor: pointer;
		}
	}

	.selected_text {
		-webkit-line-clamp: 1;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		overflow: hidden;

		&.nothing_selected {
			color: $text-pale2;
		}
	}
	/*.selected_field {
		height: 100%;
		display: flex;
		align-items: center;

		.selected_field_item.nothing_selected {
			color: $text-pale;
		}
	}*/
</style>
