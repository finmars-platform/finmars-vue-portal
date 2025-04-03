<template>
	<div class="layout-list-view">
		<div
			v-for="item in items"
			:key="item.id"
			:class="[
				'layout-list-view__item',
				{ 'layout-list-view__item--selected': item.id === selectedLayout?.id }
			]"
			@click.stop.prevent="selectedLayout = item"
		>
			<div class="layout-list-view__item-block">
				<FmTooltip type="secondary" max-width="400" location="top start">
					<template #activator="{ props }">
						<FmIcon
							v-if="item.hasUseFromAboveFilter"
							v-bind="props"
							icon="mdi-flag"
							color="var(--on-surface)"
						/>
					</template>
					<span>Has Linked to Selection filter</span>
				</FmTooltip>

				<span>{{ item.name }}</span>

				<FmTooltip type="secondary" max-width="400" location="top start">
					<template #activator="{ props }">
						<FmIcon
							v-if="item.origin_for_global_layout"
							v-bind="props"
							icon="mdi-account-multiple"
							color="var(--on-surface)"
						/>
					</template>

					<span>Layout is used for sharing</span>
				</FmTooltip>
			</div>

			<div class="layout-list-view__item-block">
				<FmIconButton variant="text" icon="mdi-pencil" @click.stop.prevent />

				<FmIconButton
					variant="text"
					:icon="item.is_default ? 'mdi-star' : 'mdi-star-outline'"
					@click.stop.prevent
				/>

				<FmIconButton variant="text" icon="mdi-delete" @click.stop.prevent />
			</div>
		</div>

		<div
			v-if="autosaveLayout?.id"
			:class="[
				'layout-list-view__item',
				{ 'layout-list-view__item--selected': autosaveLayout.id === selectedLayout?.id }
			]"
			@click.stop.prevent="selectedLayout = autosaveLayout"
		>
			<div class="layout-list-view__item-block">
				<b>{{ autosaveLayout.name }}</b>
			</div>

			<div class="layout-list-view__item-block">
				<div class="layout-list-view__item-btn-placeholder" />

				<FmIconButton
					variant="text"
					:icon="autosaveLayout.is_default ? 'mdi-star' : 'mdi-star-outline'"
					@click.stop.prevent
				/>

				<div class="layout-list-view__item-btn-placeholder" />
			</div>
		</div>

		<div v-if="isLoading" class="layout-list-view__loader">
			<FmProgressCircular indeterminate size="80" />
		</div>
	</div>
</template>

<script setup>
	import { onMounted, ref, watch } from 'vue';
	import { storeToRefs } from 'pinia';
	import cloneDeep from 'lodash/cloneDeep';
	import hasIn from 'lodash/hasIn';
	import { FmIcon, FmIconButton, FmProgressCircular, FmTooltip } from '@finmars/ui';
	import { useBalanceReportStore } from '~/stores/useBalanceReportStore';

	const emits = defineEmits(['validate', 'select', 'confirm']);

	const balanceReportStore = useBalanceReportStore();
	const { loadLayoutList } = balanceReportStore;
	const { entityType, autosaveLayoutUserCode, layouts } = storeToRefs(balanceReportStore);

	const isLoading = ref(false);
	const items = ref([]);
	const autosaveLayout = ref();
	const selectedLayout = ref(null);

	onMounted(async () => {
		try {
			isLoading.value = true;

			await loadLayoutList(entityType.value);
			items.value = cloneDeep(layouts.value);

			const autosaveLayoutIndex = layouts.value.findIndex(
				(l) => l.user_code === autosaveLayoutUserCode.value
			);

			if (autosaveLayoutIndex !== -1) {
				autosaveLayout.value = cloneDeep(layouts.value[autosaveLayoutIndex]);
				items.value.splice(autosaveLayoutIndex, 1);
			}

			items.value.forEach((item) => {
				if (Array.isArray(item.data.filters) && item.data.filters.length > 0) {
					for (const filter of item.data.filters) {
						if (hasIn(filter.options, 'use_from_above')) {
							item.hasUseFromAboveFilter = true;
						}
					}
				}
			});

			console.log('items => ', items.value);
		} finally {
			isLoading.value = false;
		}
	});

	watch(
		[() => selectedLayout.value, () => isLoading.value],
		() => {
			emits('validate', !(!selectedLayout.value || isLoading.value));
		},
		{
			immediate: true
		}
	);
</script>

<style lang="scss" scoped>
	.layout-list-view {
		position: relative;
		width: 100%;
		height: 480px;
		color: var(--on-surface);
		overflow-y: auto;

		&__item {
			display: flex;
			width: 100%;
			height: 60px;
			padding: 0 16px;
			justify-content: space-between;
			align-items: center;
			border-bottom: 1px solid var(--outline-variant);
			cursor: pointer;

			&--selected {
				background-color: color-mix(in srgb, var(--secondary) 68%, transparent);
				color: var(--on-secondary);

				i {
					color: var(--on-secondary) !important;
					caret-color: var(--on-secondary) !important;
				}
			}

			&-block {
				display: flex;
				width: max-content;
				justify-content: center;
				align-items: center;
				column-gap: 4px;
			}

			&:hover {
				background-color: color-mix(in srgb, var(--on-surface) 8%, transparent);
				color: var(--on-surface);

				i {
					color: var(--on-surface) !important;
					caret-color: var(--on-surface) !important;
				}
			}

			&-btn-placeholder {
				position: relative;
				width: 40px;
				min-width: 40px;
				height: 40px;
				min-height: 40px;
			}
		}

		&__loader {
			position: absolute;
			inset: 0;
			z-index: 5;
			pointer-events: none;
			display: flex;
			justify-content: center;
			align-items: center;
		}
	}
</style>
