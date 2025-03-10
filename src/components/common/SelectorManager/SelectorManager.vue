<template>
	<div class="selector-manager">
		<FmButton
			type="tertiary"
			class="selector-manager__btn"
			:disabled="disabled"
			@click.stop.prevent="isModalOpen = true"
		>
			Selector manager
		</FmButton>

		<teleport v-if="isModalOpen" to="body">
			<section class="selector-manager__overlay">
				<div class="selector-manager__body">
					<div class="selector-manager__header">
						Selector values

						<FmIconButton
							class="selector-manager__close-button"
							icon="mdi-close"
							variant="text"
							@click.stop.prevent="isModalOpen = false"
						/>
					</div>

					<div class="selector-manager__content">
						<div class="selector-manager__row">
							<FmTextField
								v-model="searchText.value"
								compact
								hide-details
								label="Search for values"
							/>

							<FmTextField
								v-model="searchText.notes"
								compact
								hide-details
								label="Search for notes"
							/>
						</div>

						<div class="selector-manager__row">
							<div class="selector-manager__col-header">Value</div>
							<div class="selector-manager__col-header">Notes</div>
						</div>

						<div class="selector-manager__list">
							<draggable
								:list="filteredValues"
								item-key="order"
								handle=".selector-manager__item--drag"
								chosen-class="selector-manager__item--chosen"
								drag-class="selector-manager__item--move"
								@end="onMoveItemEnd"
							>
								<template #item="{ element }">
									<div class="selector-manager__item">
										<FmIcon
											v-if="!dragDisabled"
											class="selector-manager__item--drag"
											icon="mdi-drag"
											color="var(--on-surface)"
										/>

										<FmTextField
											:model-value="element.value"
											compact
											hide-details
											label="Value"
											@update:model-value="
												updateItem(element.order, 'value', $event)
											"
										/>

										<FmTextField
											:model-value="element.notes"
											compact
											hide-details
											label="Note"
											@update:model-value="
												updateItem(element.order, 'notes', $event)
											"
										/>

										<FmIcon
											class="selector-manager__item--delete"
											icon="mdi-trash-can-outline"
											color="var(--error)"
											@click.stop.prevent="deleteItem(element.order)"
										/>
									</div>
								</template>
							</draggable>

							<FmButton
								class="selector-manager__add-btn"
								type="secondary"
								rounded
								@click.stop.prevent="addSelector"
							>
								Add Selector
							</FmButton>
						</div>
					</div>

					<div class="selector-manager__actions">
						<FmButton
							type="secondary"
							rounded
							@click.prevent.stop="isModalOpen = false"
						>
							Cancel
						</FmButton>

						<FmTooltip type="secondary" location="top">
							<template #activator="{ props }">
								<FmButton
									v-bind="props"
									rounded
									v-on="okBtnDisabled ? {} : { click: update }"
								>
									OK
								</FmButton>
							</template>

							<span>Values should not be empty</span>
						</FmTooltip>
					</div>
				</div>
			</section>
		</teleport>
	</div>
</template>

<script setup>
	import { computed, ref, watch } from 'vue';
	import cloneDeep from 'lodash/cloneDeep';
	import size from 'lodash/size';
	import draggable from 'vuedraggable';
	import {
		FmButton,
		FmIcon,
		FmIconButton,
		FmTextField,
		FmTooltip
	} from '@finmars/ui';

	const props = defineProps({
		selectorValues: {
			type: Array
		},
		disabled: {
			type: Boolean
		}
	});

	const emits = defineEmits(['update']);

	const isModalOpen = ref(false);
	const isDirty = ref(false);
	const values = ref([]);
	const filteredValues = ref([]);

	const searchText = ref({
		value: '',
		notes: ''
	});

	const dragDisabled = computed(
		() => size(values.value) !== size(filteredValues.value)
	);

	const okBtnDisabled = computed(
		() => (values.value || []).some((i) => !i.value) || !isDirty.value
	);

	function prepareFilteredValues() {
		filteredValues.value = cloneDeep(values.value || [])
			.filter((item) => {
				const { value, notes } = item;
				return (
					(value ?? '')
						.toLowerCase()
						.includes(searchText.value.value.toLowerCase()) &&
					(notes ?? '')
						.toLowerCase()
						.includes(searchText.value.notes.toLowerCase())
				);
			})
			.sort((a, b) => a.order - b.order);
	}

	function initData() {
		values.value = cloneDeep(props.selectorValues || []).sort(
			(a, b) => a.order - b.order
		);
		prepareFilteredValues();
	}

	function addSelector() {
		isDirty.value = true;
		const currentLastOrder = values.value[values.value.length - 1].order;
		values.value.push({
			value: '',
			notes: '',
			order: currentLastOrder + 1
		});
		prepareFilteredValues();
	}

	function onMoveItemEnd({ oldIndex, newIndex }) {
		const updatedValues = cloneDeep(values.value);
		const movedItem = updatedValues.splice(oldIndex, 1);
		updatedValues.splice(newIndex, 0, movedItem[0]);
		updatedValues.forEach((i, index) => (i.order = index));
		updatedValues.sort((a, b) => a.order - b.order);
		values.value = updatedValues;
		nextTick(() => {
			filteredValues.value = cloneDeep(values.value);
			isDirty.value = true;
		});
	}

	function updateItem(order, field, value) {
		isDirty.value = true;
		const itemIndex = values.value.findIndex((i) => i.order === order);
		if (itemIndex === -1) {
			throw new Error('No edit item found.');
		}
		values.value[itemIndex][field] = value;
	}

	function deleteItem(order) {
		isDirty.value = true;
		const itemIndex = values.value.findIndex((i) => i.order === order);
		if (itemIndex === -1) {
			throw new Error('The item to delete not found.');
		}
		values.value.splice(itemIndex, 1);
		prepareFilteredValues();
	}

	function update() {
		emits('update', values.value);
		searchText.value = {
			value: '',
			notes: ''
		};
		isModalOpen.value = false;
	}

	watch(
		() => isModalOpen.value,
		(val, oVal) => {
			if (val && val !== oVal) {
				initData();
			}
		}
	);

	watch(
		() => props.selectorValues,
		() => {
			initData();
		},
		{ immediate: true }
	);

	watch([() => searchText.value.value, () => searchText.value.notes], () => {
		prepareFilteredValues();
	});
</script>

<style lang="scss" scoped>
	.selector-manager {
		position: relative;
		width: 100%;

		&__btn {
			--v-btn-height: 56px;

			width: 100%;
			max-width: 100% !important;
			text-transform: none;

			:deep(.v-btn__content) {
				font-size: 16px;
			}
		}

		&__overlay {
			position: fixed;
			inset: 0;
			background-color: rgba(0, 0, 0, 0.2);
			display: flex;
			justify-content: center;
			align-items: center;
			z-index: 1000;
		}

		&__body {
			position: relative;
			width: 800px;
			border-radius: 24px;
			background-color: var(--surface);
			box-shadow:
				0 1px 3px 0 rgba(0, 0, 0, 0.3),
				0 4px 8px 3px rgba(0, 0, 0, 0.15);
		}

		&__header {
			position: relative;
			display: flex;
			width: 100%;
			height: 64px;
			padding: 0 24px;
			justify-content: space-between;
			align-items: center;
			border-bottom: 1px solid var(--outline-variant);
			font-size: 18px;
			font-weight: 600;
			line-height: 24px;
		}

		&__content {
			position: relative;
			width: 100%;
			padding: 24px;
		}

		&__row {
			padding: 0 40px 0 24px;
			display: grid;
			grid-template-columns: 1fr 1fr;
			column-gap: 16px;
			margin-bottom: 16px;

			:deep(.fm-text-field) {
				--backgroundColor-fmTextField: transparent;
			}
		}

		&__col-header {
			font-size: 16px;
			font-weight: 600;
			line-height: 24px;
			text-align: center;
		}

		&__list {
			position: relative;
			width: 100%;
			min-height: 240px;
			max-height: 440px;
			overflow-y: auto;
		}

		&__item {
			position: relative;
			width: 100%;
			height: 48px;
			border-radius: 4px;
			border: 1px solid var(--outline-variant);
			padding: 0 40px 0 24px;
			margin-bottom: 4px;
			display: grid;
			grid-template-columns: 1fr 1fr;
			column-gap: 16px;

			:deep(.fm-text-field) {
				--backgroundColor-fmTextField: transparent;
			}

			&--drag {
				position: absolute;
				top: 12px;
				left: 2px;
				cursor: move;
			}

			&--chosen {
				background-color: color-mix(in srgb, var(--on-surface) 8%, transparent);
			}

			&--move {
				background-color: var(--secondary-container);
			}

			&--delete {
				position: absolute;
				top: 12px;
				right: 8px;
				cursor: pointer;
			}
		}

		&__add-btn {
			margin: 16px 0;
		}

		&__actions {
			display: flex;
			width: 100%;
			height: 84px;
			padding: 0 24px;
			justify-content: flex-end;
			align-items: center;
			column-gap: 16px;
			border-top: 1px solid var(--outline-variant);
		}
	}
</style>
