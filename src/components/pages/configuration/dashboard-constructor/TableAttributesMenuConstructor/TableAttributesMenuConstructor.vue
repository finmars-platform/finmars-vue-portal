<template>
	<FmMenu
		v-model="isMenuOpen"
		:offset="-20"
		:close-on-content-click="false"
		:close-on-back="false"
		persistent
		z-index="1010"
		:disabled="disabled"
	>
		<template #activator="{ props }">
			<FmTextField
				v-bind="props"
				:model-value="valueText"
				:label="label"
				outlined
				readonly
			/>
		</template>

		<div class="table-attributes-menu">
			<div class="table-attributes-menu__title">{{ title }}</div>

			<div class="table-attributes-menu__content">
				<div class="table-attributes-menu__content-row">
					<b>Column ID</b>
					<b>Column Alias</b>
				</div>

				<div
					v-for="attr in innerValue"
					:key="attr.attribute_data.key"
					class="table-attributes-menu__content-row"
				>
					<FmTextField
						:model-value="attr.attribute_data.name"
						label="Attribute name"
						compact
						outlined
						readonly
						hide-details
						:disabled="disabled"
					/>

					<FmTextField
						v-model="attr.layout_name"
						label="Attribute custom table name"
						compact
						outlined
						hide-details
						:disabled="disabled"
					/>

					<div
						v-if="!attr.is_default"
						class="table-attributes-menu__content-row-btns"
					>
						<FmIconButton
							icon="mdi-chevron-up"
							variant="text"
							:disabled="attr.order === 0 || disabled"
							@click.stop.prevent="
								moveAttr('up', attr.attribute_data.key)
							"
						/>

						<FmIconButton
							icon="mdi-chevron-down"
							variant="text"
							:disabled="
								attr.order === size(innerValue) - 1 || disabled
							"
							@click.stop.prevent="
								moveAttr('down', attr.attribute_data.key)
							"
						/>

						<FmIconButton
							icon="mdi-close"
							variant="text"
							:disabled="disabled"
							@click.stop.prevent="
								deleteAttr(attr.attribute_data.key)
							"
						/>
					</div>
				</div>

				<FmButton
					type="secondary"
					rounded
					class="table-attributes-menu__content-add"
					:disabled="disabled"
					@click.stop.prevent="changeAttributeOfMenuPosition"
				>
					Add Columns
				</FmButton>
			</div>

			<div class="table-attributes-menu__actions">
				<FmButton
					type="secondary"
					rounded
					@click.stop.prevent="isMenuOpen = false"
				>
					Cancel
				</FmButton>

				<FmButton
					rounded
					:disabled="disabled"
					@click.stop.prevent="update"
				>
					Ok
				</FmButton>
			</div>
		</div>
	</FmMenu>
</template>

<script setup>
	import {
		computed,
		defineAsyncComponent,
		inject,
		ref,
		toValue,
		watch
	} from 'vue';
	import cloneDeep from 'lodash/cloneDeep';
	import size from 'lodash/size';
	import {
		FM_DIALOGS_KEY,
		FmButton,
		FmIconButton,
		FmMenu,
		FmTextField
	} from '@finmars/ui';

	const props = defineProps({
		value: {
			type: Array,
			default: () => []
		},
		label: {
			type: String
		},
		title: {
			type: String
		},
		availableAttrs: {
			type: Array,
			default: () => []
		},
		defaultAttrsKeys: {
			type: String
		},
		nothingSelectedText: {
			type: String
		},
		isReport: {
			type: Boolean
		},
		disabled: {
			type: Boolean
		}
	});

	const emits = defineEmits(['update:value']);

	const dialogService = inject(FM_DIALOGS_KEY);

	const isMenuOpen = ref(false);
	const innerValue = ref([]);

	const defaultAttrFromAvailable = computed(() => {
		const attr = props.availableAttrs.find(
			(a) => a.key === props.defaultAttrsKeys
		);
		if (!attr) {
			return null;
		}

		return {
			attribute_data: cloneDeep(attr),
			layout_name: '',
			isDefault: true
		};
	});

	const valueText = computed(() => {
		if (!props.value.length) {
			return props.nothingSelectedText || '[]';
		}

		const values = props.value.map(
			(v) => v.layout_name || v.attribute_data.name
		);
		return `[${values.join(', ')}]`;
	});

	const filteredAvailableAttrs = computed(() =>
		props.availableAttrs.filter((a) => {
			const isAttrSelected = innerValue.value.find(
				(v) => a.key === v.attribute_data?.key
			);
			return !isAttrSelected;
		})
	);

	function reorderAttrs(data = []) {
		return data.map((a, i) => ({
			...a,
			order: i
		}));
	}

	function updateSelectedAttrs() {
		if (
			(!props.value || props.value.length === 0) &&
			props.defaultAttrsKeys
		) {
			emits('update:value', defaultAttrFromAvailable.value || []);
			return;
		}

		if (
			props.defaultAttrsKeys &&
			props.value[0].attribute_data.key !== props.defaultAttrsKeys
		) {
			const updatedValue = cloneDeep(props.value);
			updatedValue[0].is_default = true;

			const attrIndex = updatedValue.findIndex(
				(a) => a.attribute_data.key === props.defaultAttrsKeys
			);
			let defaultAttr = null;

			if (attrIndex !== -1) {
				defaultAttr = updatedValue[attrIndex];
				defaultAttr.is_default = true;
				updatedValue.splice(attrIndex, 1);
				updatedValue.unshift(defaultAttr);
			} else {
				updatedValue.unshift(defaultAttrFromAvailable.value);
			}

			emits('update:value', updatedValue);
			return;
		}

		const updatedValue = cloneDeep(props.value);
		updatedValue[0].is_default = true;
		emits('update:value', updatedValue);
	}

	function addColumns(attrIds = []) {
		const currentLastOrder = size(innerValue.value);
		const newAttrs = attrIds.reduce((res, id, index) => {
			const attrInstance = props.availableAttrs.find((a) => a.key === id);

			if (attrInstance) {
				res.push({
					layout_name: '',
					order: currentLastOrder + index,
					attribute_data: cloneDeep(attrInstance)
				});
			}

			return res;
		}, []);
		innerValue.value = [...innerValue.value, ...newAttrs];
	}

	function moveAttr(direction, attrKey) {
		const attrIndex = innerValue.value.findIndex(
			(a) => a.attribute_data.key === attrKey
		);

		if (attrIndex === -1) {
			return;
		}

		const anotherAttrIndex =
			direction === 'down' ? attrIndex + 1 : attrIndex - 1;

		const updatedValue = cloneDeep(innerValue.value);
		updatedValue[attrIndex] = cloneDeep(innerValue.value[anotherAttrIndex]);
		updatedValue[anotherAttrIndex] = cloneDeep(innerValue.value[attrIndex]);
		innerValue.value = reorderAttrs(updatedValue);
	}

	function deleteAttr(attrKey) {
		const attrIndex = innerValue.value.findIndex(
			(a) => a.attribute_data.key === attrKey
		);
		const updatedValue = cloneDeep(innerValue.value);
		updatedValue.splice(attrIndex, 1);
		innerValue.value = reorderAttrs(updatedValue);
	}

	function changeAttributeOfMenuPosition() {
		const component = defineAsyncComponent(
			() =>
				import(
					'@/components/modal/TableAttributeSelectorDialog/TableAttributeSelectorDialog.vue'
				)
		);

		const dialogInstance = dialogService.$openDialog({
			component,
			componentProps: {
				availableAttrs: toValue(filteredAvailableAttrs.value),
				multiple: true
			},
			dialogProps: {
				title: 'Select Column',
				width: 700,
				confirmButton: false,
				cancelButton: false,
				closeOnClickOverlay: false,
				onConfirm: (attrIds) => addColumns(attrIds)
			}
		});
		if (dialogInstance.el) {
			const dialogWrapperEl =
				dialogInstance.el.querySelector('.fm-dialog-overlay');
			dialogWrapperEl && (dialogWrapperEl.style.zIndex = '1100');
		}
	}

	function update() {
		emits('update:value', innerValue.value);
		isMenuOpen.value = false;
	}

	watch(
		() => props.value,
		() => {
			innerValue.value = cloneDeep(props.value);
		},
		{ immediate: true }
	);

	watch(
		() => props.defaultAttrsKeys,
		() => {
			if (props.value || props.defaultAttrsKeys) {
				updateSelectedAttrs();
			}
		}
	);
</script>

<style lang="scss" scoped>
	.table-attributes-menu {
		position: relative;
		width: 800px;
		padding: 16px;

		&__title {
			font: var(--headline-small-font);
			margin-bottom: 16px;
		}

		&__content {
			position: relative;
			width: 100%;
			height: 240px;
			overflow-x: hidden;
			overflow-y: auto;

			&-row {
				position: relative;
				width: 100%;
				padding-right: 132px;
				display: grid;
				grid-template-columns: 1fr 1fr;
				column-gap: 16px;
				margin-bottom: 16px;

				&-btns {
					position: absolute;
					right: 0;
					top: 0;
					width: 132px;
					height: 100%;
					display: flex;
					justify-content: center;
					align-items: center;
					column-gap: 2px;
				}
			}

			&-add {
				margin: 16px 0;
			}
		}

		&__actions {
			display: flex;
			width: 100%;
			justify-content: space-between;
			align-items: center;
			padding: 8px 0;
		}

		button {
			text-transform: none;
		}
	}
</style>
