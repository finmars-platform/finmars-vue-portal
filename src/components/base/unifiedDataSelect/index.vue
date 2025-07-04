<template>
	<FmMenu
		:opened="menuIsOpened"
		attach="body"
		:disabled="disabled"
		class="width-100"
		@update:opened="toggleMenu"
	>
		<template #btn>
			<BaseInput
				:modelValue="modelValue ? modelValue[propId] : null"
				:label="label"
				:tooltip="tooltip"
				:errorData="errorData"
				:class="{ active: menuIsOpened, bi_no_borders: noBorders }"
				:disabled="disabled"
				:required="required"
				@update:errorData="(newVal) => emit('update:errorData', newVal)"
				@click.stop="openMenu"
			>
				<template v-if="!noBorders && !noIndicatorButton" #button>
					<FmBtn
						v-show="!importingEntity"
						type="icon"
						icon="menu"
						:disabled="disabled"
						@click.stop="emit('openModal')"
					/>

					<div
						v-show="importingEntity"
						v-tooltip="{
							content: 'Importing entity',
							theme: 'error-tooltip'
						}"
					>
						<FmLoader />
					</div>
				</template>

				<input
					:placeholder="label"
					:value="inputText"
					type="text"
					:disabled="disabled"
					class="bi_main_input"
					@input="onFilterChange"
				/>

				<template #rightBtn>
					<slot name="rightBtn" />
					<FmIcon
						:icon="
							menuIsOpened ? 'arrow_drop_up' : 'arrow_drop_down'
						"
						:disabled="disabled"
					/>
				</template>
			</BaseInput>
		</template>

		<div class="sel_menu_block">
			<div>
				<div v-if="!processing" style="height: 369px; overflow-y: auto">
					<div
						v-if="localItems.length"
						class="text-bold opts_group_title"
					>
						Local Records ({{ localItemsTotal }})
					</div>

					<div v-if="localItems.length">
						<div
							v-for="option in localItems"
							:key="option.user_code"
							@click="selectItem(option)"
							class="sel_option"
						>
							<div v-html="getHighlighted(option.name)"></div>

							<div
								v-html="getHighlighted(option.user_code)"
							></div>
						</div>
					</div>

					<div
						v-if="databaseItems.length"
						class="text-bold opts_group_title"
						style="bottom: 0"
					>
						Global Records ({{ databaseItemsTotal }})
					</div>

					<div v-if="databaseItems.length">
						<div
							v-for="option in databaseItems"
							:key="option.user_code"
							@click="selectItem(option)"
							class="sel_option"
						>
							<div v-html="getHighlighted(option.name)"></div>

							<div
								v-html="getHighlighted(option.user_code)"
							></div>
						</div>
					</div>

					<div v-if="!localItems.length && !databaseItems.length">
						<span class="text-bold opts_group_title"
							>Not records found</span
						>
					</div>
				</div>

				<div v-if="processing" class="flex-row fc-center">
					<FmLoader />
				</div>
			</div>

			<slot name="selectedDetails" />
		</div>
	</FmMenu>
</template>

<script setup>
	import * as commonHelper from '~/components/Fm/UnifiedDataSelect/helper';

	let props = defineProps({
		label: String,
		tooltip: String,
		selectedOptionsName: String,

		noBorders: Boolean,
		noIndicatorButton: Boolean,
		required: Boolean,

		modelValue: Object,
		propId: {
			type: String,
			default: 'id'
		},

		importingEntity: Boolean,
		processing: Boolean,

		localItems: {
			type: Array,
			default() {
				return [];
			}
		},

		localItemsTotal: Number,

		databaseItems: {
			type: Array,
			default() {
				return [];
			}
		},

		databaseItemsTotal: Number,

		disabled: Boolean,

		errorData: Object
	});

	let emit = defineEmits([
		'update:modelValue',
		'update:errorData',
		'loadItems',
		'openModal'
	]);

	let menuIsOpened = ref(false);
	let inputText = ref('');

	watch(
		() => props.modelValue,
		() => {
			inputText.value = props.modelValue ? props.modelValue.name : '';
		}
	);

	function toggleMenu(opened) {
		inputText.value = '';

		if (opened) {
			emit('loadItems');
		} else if (props.modelValue) {
			inputText.value =
				props.modelValue.short_name || props.modelValue.name;
		}

		menuIsOpened.value = opened;
	}

	function openMenu() {
		if (menuIsOpened.value || props.disabled) return;

		menuIsOpened.value = true;

		inputText.value = '';

		emit('loadItems');
	}

	function getHighlighted(value) {
		return commonHelper.getHighlighted(inputText.value, value);
	}

	function onFilterChange($event) {
		inputText.value = $event.target.value;
		emit('loadItems', inputText.value);
	}

	function selectItem(item) {
		menuIsOpened.value = false;

		if (item[props.propId] === props.modelValue[props.propId]) return;

		emit('update:modelValue', JSON.parse(JSON.stringify(item)));
	}

	if (props.modelValue) {
		inputText.value = props.modelValue.name;
	}
</script>

<style lang="scss" scoped>
	.sel_menu_block {
		max-height: 380px;
		min-width: 280px;
		max-width: 280px;
		width: 280px;

		.sel_option {
			padding: 11px 16px 2px 16px;
			box-sizing: border-box;
			width: 100%;
			border-bottom: 1px solid #e0e0e0;
			cursor: pointer;

			&:first-child {
				border-top: 1px solid #e0e0e0;
			}

			&:hover {
				background: inherit;
				background-color: rgba(0, 0, 0, 0.03);
				/*border: none;
				border-radius: 0px;*/
				-moz-box-shadow: none;
				-webkit-box-shadow: none;
				box-shadow: none;
			}

			span.highlight {
				color: #f05a22;
				font-weight: bold;
			}
		}
	}

	.opts_group_title {
		font-size: 14px;
		color: #333333;
		margin: 8px;
		padding-left: 10px;
		position: sticky;
		background: #fff;
		cursor: pointer;
		height: 30px;
		padding-top: 9px;
		box-sizing: border-box;
	}

	.bi_main_input[disabled] {
		color: var(--card-secondary-text-color);
	}
</style>
