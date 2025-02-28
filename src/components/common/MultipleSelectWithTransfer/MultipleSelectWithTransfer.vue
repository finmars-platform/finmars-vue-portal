<template>
	<div :id="`s-${id}`" class="relative w-full">
		<FmSelect
			ref="sel"
			:model-value="modelValue"
			:options="options"
			prepend-icon="mdi-menu"
			variant="outlined"
			:label="label"
			:placeholder="placeholder"
			persistent-placeholder
			multiple
			:compact="compact"
			scroll-strategy="block"
			:disabled="disabled"
			@click:prependIcon="onIconClick"
			@focus="onFocus"
			@update:model-value="updateValue"
		>
			<template #selection>
				<FmChip
					:value="displaySelected.value"
					:tooltip="displaySelected.tooltip"
					:compact="compact"
					rounded
					closable
					@click:close="deleteSelection"
				/>
			</template>
		</FmSelect>

		<FmMenu
			v-model="isMenuOpen"
			:activator="`#s-${id}`"
			offset="6"
			scroll-strategy="block"
			:close-on-content-click="false"
		>
			<div class="relative w-[640px] min-h-[300px] p-16">
				<h4
					class="relative w-full text-center text-[14px] text-bold mb-2"
				>
					{{ label }}
				</h4>

				<div class="flex flex-row justify-center items-stretch">
					<div class="flex flex-column w-[45%]">
						<h4 class="text-center text-[14px] text-bold mb-2">
							Available
						</h4>
						<div
							class="relative w-full rounded-[4px] border border-solid border-[var(--outline)] flex-grow"
						>
							<FmTextField
								v-model="searchText.available"
								compact
								clearable
								placeholder="Search for.."
								hide-details
								class="filter-select__search"
								@click:clear="searchText.available = ''"
							/>
							<div
								class="relative w-full min-h-[100px] max-h-[150px] overflow-y-auto"
							>
								<div
									v-for="item in availableOptionsFiltered"
									:key="item.value"
									class="relative px-2 w-full h-[30px] flex flex-row justify-start items-center text-[14px] cursor-pointer mb-[2px]"
									:class="{
										'bg-[var(--secondary-container)]':
											highlightedOptions.available.includes(
												item.value
											)
									}"
									@click.stop.prevent="
										onItemItemClick('available', item)
									"
								>
									{{ item.title }}
								</div>
							</div>
						</div>
					</div>

					<div
						class="w-[10%] flex flex-column justify-center items-center"
					>
						<FmIconButton
							icon="mdi-chevron-right"
							variant="text"
							@click.stop.prevent="onBtnClick('right')"
						/>
						<FmIconButton
							icon="mdi-chevron-double-right"
							variant="text"
							@click.stop.prevent="onBtnClick('doubleRight')"
						/>
						<FmIconButton
							icon="mdi-chevron-left"
							variant="text"
							@click.stop.prevent="onBtnClick('left')"
						/>
						<FmIconButton
							icon="mdi-chevron-double-left"
							variant="text"
							@click.stop.prevent="onBtnClick('doubleLeft')"
						/>
					</div>

					<div class="flex flex-column w-[45%]">
						<h4 class="text-center text-[14px] text-bold mb-2">
							Selected
						</h4>
						<div
							class="relative w-full rounded-[4px] border border-solid border-[var(--outline)] flex-grow"
						>
							<FmTextField
								v-model="searchText.selected"
								compact
								clearable
								placeholder="Search for.."
								hide-details
								class="filter-select__search"
								@click:clear="searchText.selected = ''"
							/>
							<div
								class="relative w-full min-h-[100px] max-h-[150px] overflow-y-auto"
							>
								<div
									v-for="item in selectedOptionsFiltered"
									:key="item.value"
									class="relative px-2 w-full h-[30px] flex flex-row justify-start items-center text-[14px] cursor-pointer mb-[2px]"
									:class="{
										'bg-[var(--secondary-container)]':
											highlightedOptions.selected.includes(
												item.value
											)
									}"
									@click.stop.prevent="
										onItemItemClick('selected', item)
									"
								>
									{{ item.title }}
								</div>
							</div>
						</div>
					</div>
				</div>

				<div class="flex flex-row gap-4 justify-end items-center pt-4">
					<FmButton
						rounded
						type="secondary"
						@click.stop.prevent="close"
					>
						Close
					</FmButton>
					<FmButton
						rounded
						:disabled="!isDirty"
						@click.stop.prevent="save"
					>
						Save
					</FmButton>
				</div>
			</div>
		</FmMenu>
	</div>
</template>

<script setup>
	import { computed, ref } from 'vue';
	import cloneDeep from 'lodash/cloneDeep';
	import isEmpty from 'lodash/isEmpty';
	import {
		FmButton,
		FmChip,
		FmIconButton,
		FmMenu,
		FmSelect,
		FmTextField,
		getRandomString
	} from '@finmars/ui';

	const props = defineProps({
		modelValue: {
			type: Array,
			default: () => []
		},
		label: {
			type: String
		},
		placeholder: {
			type: String
		},
		options: {
			type: Array,
			default: () => []
		},
		compact: {
			type: Boolean
		},
		disabled: {
			type: Boolean
		}
	});
	const emits = defineEmits(['update:modelValue']);

	const id = getRandomString(4);

	const sel = ref(null);
	const isMenuOpen = ref(false);
	const searchText = ref({
		available: '',
		selected: ''
	});
	const isDirty = ref(false);

	const selectedOptions = ref([]);
	const selectedOptionsValues = computed(() =>
		selectedOptions.value.map((o) => o.value)
	);
	const selectedOptionsFiltered = computed(() =>
		selectedOptions.value.filter((o) =>
			o.title
				.toLowerCase()
				.includes(searchText.value.selected.toLowerCase())
		)
	);

	const availableOptions = computed(() =>
		props.options.filter(
			(o) => !selectedOptionsValues.value.includes(o.value)
		)
	);
	const availableOptionsFiltered = computed(() =>
		availableOptions.value.filter((o) =>
			o.title
				.toLowerCase()
				.includes(searchText.value.available.toLowerCase())
		)
	);

	const highlightedOptions = ref({
		available: [],
		selected: []
	});

	const displaySelected = computed(() => {
		if (isEmpty(props.modelValue)) {
			return {
				value: '',
				tooltip: ''
			};
		}

		if (props.modelValue.length === 1) {
			const option = props.options.find(
				(o) => o.value === props.modelValue[0]
			);
			return {
				value: option?.title || '',
				tooltip: option?.title || ''
			};
		}

		const optionTitles = props.options
			.filter((o) => props.modelValue.includes(o.value))
			.map((o) => o.title)
			.sort();

		return {
			value: `${optionTitles[0]} (+${optionTitles.length - 1})`,
			tooltip: optionTitles.join(', ')
		};
	});

	function onIconClick(ev) {
		ev.preventDefault();
		ev.stopImmediatePropagation();

		sel.value.toggleDropdown(false);
		isMenuOpen.value = !isMenuOpen.value;
		if (isMenuOpen.value) {
			init();
		} else {
			clear();
		}
	}

	function onFocus() {
		isMenuOpen.value = false;
	}

	function onItemItemClick(part, item) {
		const { value } = item;
		const index = highlightedOptions.value[part].findIndex(
			(optionValue) => optionValue === value
		);
		if (index === -1) {
			highlightedOptions.value[part].push(item.value);
		} else {
			highlightedOptions.value[part].splice(index, 1);
		}
	}

	function onBtnClick(btn) {
		isDirty.value = true;
		switch (btn) {
			case 'left':
				highlightedOptions.value.available = [];
				highlightedOptions.value.selected.forEach((val) => {
					const index = selectedOptions.value.findIndex(
						(o) => o.value === val
					);
					if (index !== -1) {
						selectedOptions.value.splice(index, 1);
					}
				});
				highlightedOptions.value.selected = [];
				break;
			case 'doubleLeft':
				clear(false);
				break;
			case 'right':
				highlightedOptions.value.selected = [];
				highlightedOptions.value.available.forEach((val) => {
					if (!selectedOptionsValues.value.includes(val)) {
						const option = availableOptions.value.find(
							(o) => o.value === val
						);
						selectedOptions.value.push(option);
					}
				});
				highlightedOptions.value.available = [];
				break;
			case 'doubleRight':
				selectedOptions.value = cloneDeep(props.options);
				highlightedOptions.value.selected = [];
				highlightedOptions.value.available = [];
				break;
		}
	}

	function updateValue(val) {
		emits('update:modelValue', val);
	}

	function deleteSelection() {
		selectedOptions.value = [];
		highlightedOptions.value = {
			available: [],
			selected: []
		};
		updateValue([]);
	}

	function clear(touchDirty = true) {
		touchDirty && (isDirty.value = false);
		selectedOptions.value = [];
		searchText.value = {
			available: '',
			selected: ''
		};
		highlightedOptions.value = {
			available: [],
			selected: []
		};
	}

	function close() {
		isMenuOpen.value = false;
		clear();
	}

	function save() {
		emits('update:modelValue', selectedOptionsValues.value);
		close();
	}

	function init() {
		selectedOptions.value = (props.modelValue || []).reduce((res, item) => {
			const option = props.options.find((opt) => opt.value === item);
			if (option) {
				res.push(option);
			}
			return res;
		}, []);
		selectedOptions.value.sort((a, b) =>
			a.title.toLowerCase() > b.title.toLowerCase() ? 1 : -1
		);
	}

	init();
</script>

<style lang="scss" scoped>
	.filter-select {
		&__search {
			--backgroundColor-fmTextField: var(--surface-container);
		}
	}
</style>
