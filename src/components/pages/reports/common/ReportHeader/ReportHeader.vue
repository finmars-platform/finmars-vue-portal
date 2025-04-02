<template>
	<div class="report-header">
		<div class="report-header__row">
			<div class="report-header__block">
				<FmButton type="secondary" rounded append-icon="mdi-menu-down">
					{{ currentLayout?.name }}

					<FmMenu
						v-model="isLayoutSelectMenuOpen"
						activator="parent"
						width="300"
						min-width="300"
						:disabled="isLoading"
					>
						<div class="report-header__menu-layouts">
							<div class="report-header__menu-layouts-content">
								<FmMenuItem
									v-for="layout in layouts"
									:id="`${layout.id}`"
									:key="layout.id"
									item-size="medium"
									:item-selected="layout.id === currentLayout?.id"
								>
									<div class="report-header__menu-layouts-item">
										<FmIcon
											icon="mdi-home"
											:color="layout.is_default ? 'var(--primary)' : 'var(--outline-variant)'"
											@click="onLayoutsMenuItemClick('layout:set-default', layout)"
										/>

										<span @click="onLayoutsMenuItemClick('layout:select', layout)">
											{{ layout.name }}
										</span>
									</div>
								</FmMenuItem>
							</div>
						</div>
					</FmMenu>
				</FmButton>

				<FmIconButton icon="mdi-dots-vertical" variant="text">
					<FmMenu v-model="isMainMenuOpen" activator="parent" :close-on-content-click="false">
						<template #default>
							<template v-for="item in MAIN_MENU" :key="item.action">
								<FmMenuItem
									v-if="item.type === 'item'"
									class="report-header__menu-main-item"
									:id="item.action"
									item-size="medium"
									:title="item.title"
									:prepend-icon="item.icon"
									:item-disabled="disableMainMenuItem(item)"
									@click.stop.prevent="onMainMenuItemClick(item.action)"
								/>

								<div v-else class="report-header__menu-main-delimiter" />
							</template>
						</template>
					</FmMenu>
				</FmIconButton>

				<FmButton
					type="secondary"
					rounded
					prepend-icon="mdi-content-save"
					@click.stop.prevent="saveLayout"
				/>
			</div>

			<div class="report-header__block">
				<FmSelect
					v-if="entityType !== 'transaction-report'"
					:model-value="data?.reportOptions.cost_method"
					:options="REPORT_OPTIONS"
					placeholder="Select cost method"
					variant="outlined"
					compact
					:disabled="isLoading"
					@update:model-value="updateLayoutField('data.reportOptions.cost_method', $event)"
				/>

				<FmButton
					v-if="['pl-report', 'transaction-report'].includes(entityType)"
					type="secondary"
					rounded
					append-icon="mdi-menu-down"
					:disabled="isLoading"
				>
					{{ datesDateFrom || 'Select date from' }}

					<FmMenu
						v-model="isDateFromMenuOpen"
						activator="parent"
						:close-on-content-click="false"
						:disabled="isLoading"
					>
						<FmDateEditor
							:model-value="datesDateFrom"
							show-adjacent-months
							allow-weekend-selection
							calculate-previous-day-from-today
						/>
					</FmMenu>
				</FmButton>

				<FmButton type="secondary" rounded append-icon="mdi-menu-down" :disabled="isLoading">
					{{ datesDateTo || 'Select date to' }}

					<FmMenu
						v-model="isDateToMenuOpen"
						activator="parent"
						:close-on-content-click="false"
						:disabled="isLoading"
					>
						<FmDateEditor
							:model-value="datesDateTo"
							show-adjacent-months
							allow-weekend-selection
							calculate-previous-day-from-today
						/>
					</FmMenu>
				</FmButton>

				<FmSelect
					v-if="entityType !== 'transaction-report'"
					:model-value="data?.reportOptions.report_currency"
					:options="currencies"
					variant="outlined"
					compact
					title-key="name"
					value-key="user_code"
					:disabled="isLoading"
					@update:model-value="updateLayoutField('data.reportOptions.report_currency', $event)"
				/>

				<div class="report-header__checkbox">
					<FmCheckbox :model-value="data?.reportLayoutOptions.useDateFromAbove" label="Link date" />
				</div>

				<FmButton type="secondary" rounded prepend-icon="mdi-autorenew">Synced</FmButton>

				<FmIconButton icon="mdi-tray-arrow-down" variant="text" />

				<FmIconButton icon="mdi-view-agenda-outline" variant="text" />

				<FmIconButton icon="mdi-cog-outline" variant="text" />
			</div>
		</div>

		<div class="report-header__row">
			<div class="report-header__filters">
				<FmFilterToolbar
					class="report-header__filters-toolbar"
					:value="data?.filters || []"
					:attributes="[]"
					:suggested-attrs="[]"
					@update:model-value="() => console.log('UPDATE FILTERS')"
				/>
			</div>

			<FmIconButton icon="mdi-dots-vertical" variant="text" />
		</div>
	</div>
</template>

<script setup>
	import { computed, ref } from 'vue';
	import { storeToRefs } from 'pinia';
	import set from 'lodash/set';
	import {
		FmButton,
		FmCheckbox,
		FmDateEditor,
		FmFilterToolbar,
		FmIcon,
		FmIconButton,
		FmMenu,
		FmMenuItem,
		FmSelect
	} from '@finmars/ui';
	import * as metaContentTypesService from '~/services/meta/metaContentTypeService';
	import useGlobalStore from '~/stores/useStore';
	import { useBalanceReportStore } from '~/stores/useBalanceReportStore';
	import { REPORT_DATA_PROPERTIES } from '../constants';
	import { MAIN_MENU, REPORT_OPTIONS } from './constants';

	const props = defineProps({
		entityType: {
			type: String
		},
		contentType: {
			type: String
		}
	});
	const emits = defineEmits(['header:action']);

	const { defaultConfigurationCode } = storeToRefs(useGlobalStore());
	const balanceReportStore = useBalanceReportStore();
	const { isLoading, layouts, currentLayout, currencies } = storeToRefs(balanceReportStore);
	const { saveLayout } = balanceReportStore;

	const [dateFromKey, dateToKey] = REPORT_DATA_PROPERTIES[props.entityType];

	const data = computed(() => currentLayout.value?.data);

	const targetContentType = ref(
		metaContentTypesService.findContentTypeByEntity(props.entityType, 'ui')
	);
	const isLayoutSelectMenuOpen = ref(false);
	const isMainMenuOpen = ref(false);
	const isDateFromMenuOpen = ref(false);
	const isDateToMenuOpen = ref(false);

	const autosaveLayoutUserCode = computed(
		() => `${defaultConfigurationCode}:${targetContentType.value}:autosave`
	);
	const datesDateTo = computed(() => data.value?.reportOptions[dateToKey]);
	const datesDateFrom = computed(() =>
		dateFromKey ? data.value?.reportOptions[dateFromKey] : null
	);

	function disableMainMenuItem(item) {
		const autosaveLayout = layouts.value.find((l) => l.user_code === autosaveLayoutUserCode.value);
		if (['layout:rename', 'layout:delete'].includes(item.action)) {
			return currentLayout.value.id === autosaveLayout?.id || currentLayout.value.isNewLayout;
		}

		if (item.action === 'layout:make-default') {
			return currentLayout.value.is_default;
		}

		return false;
	}

	function onMainMenuItemClick(action, payload) {
		console.log('onMainMenuItemClick: ', action, payload);
		emits('header:action', { action, payload });
		isMainMenuOpen.value = false;
	}

	function onLayoutsMenuItemClick(action, payload) {
		console.log('onLayoutsMenuItemClick: ', action, payload);
		emits('header:action', { action, payload });
		isLayoutSelectMenuOpen.value = false;
	}

	function updateLayoutField(field, value) {
		console.log('updateLayoutField => ', field, value);
		set(currentLayout.value, field, value);
	}
</script>

<style lang="scss" scoped>
	.report-header {
		position: relative;
		width: 100%;
		border-bottom: 1px solid var(--outline-variant);
		padding: 0 16px;

		button {
			text-transform: none;
		}

		&__row {
			position: relative;
			display: flex;
			justify-content: space-between;
			align-items: center;
			width: 100%;
			height: 64px;
		}

		&__block {
			display: flex;
			justify-content: center;
			align-items: center;
			column-gap: 8px;
		}

		&__menu-layouts {
			position: relative;
			width: 300px;
			height: 240px;
			padding: 8px 0;
			overflow: hidden;

			&-content {
				position: relative;
				width: 100%;
				height: 100%;
				overflow-y: auto;
			}

			&-item {
				display: flex;
				width: 100%;
				height: 100%;
				justify-content: flex-start;
				align-items: center;
				column-gap: 8px;

				span {
					display: block;
					position: relative;
					flex-grow: 1;
					line-height: 24px;
				}

				i:hover {
					color: var(--primary) !important;
					caret-color: var(--primary) !important;
				}
			}
		}

		&__menu-main {
			&-item {
				width: 300px;
				line-height: 24px;
			}

			&-delimiter {
				position: relative;
				width: 100%;
				height: 1px;
				border-bottom: 1px solid var(--outline-variant);
			}
		}

		&__filters {
			position: relative;
			width: calc(100% - 32px);
			height: 100%;
			margin-left: -16px;
			display: flex;
			justify-content: stretch;
			align-items: center;

			&-toolbar {
				--fmFilterToolbar-background-color: transparent;
			}
		}

		.report-header__row:first-child {
			border-bottom: 1px solid var(--outline-variant);
		}

		&__checkbox {
			position: relative;
			min-width: 100px;
		}
	}
</style>
