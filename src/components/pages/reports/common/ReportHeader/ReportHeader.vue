<template>
	<div class="report-header">
		<div class="report-header__row">
			<div class="report-header__block">
				<FmButton type="secondary" rounded append-icon="mdi-menu-down">
					{{ defaultLayout?.name }}

					<FmMenu
						v-model="isLayoutSelectMenuOpen"
						activator="parent"
						width="300"
						min-width="300"
						:disabled="disabled"
					>
						<div class="report-header__menu-layouts">
							<div class="report-header__menu-layouts-content">
								<FmMenuItem
									v-for="layout in layouts"
									:id="`${layout.id}`"
									:key="layout.id"
									item-size="medium"
									:item-selected="layout.id === defaultLayout.id"
								>
									<div class="report-header__menu-layouts-item">
										<FmIcon
											icon="mdi-home"
											:color="
												layout.id === defaultLayout?.id
													? 'var(--primary)'
													: 'var(--outline-variant)'
											"
											@click="onLayoutsMenuItemClick('set:layout', layout)"
										/>

										<span @click="onLayoutsMenuItemClick('select:layout', layout)">
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
								/>

								<div v-else class="report-header__menu-main-delimiter" />
							</template>
						</template>
					</FmMenu>
				</FmIconButton>

				<FmButton type="secondary" rounded prepend-icon="mdi-content-save" />
			</div>

			<div class="report-header__block">
				<FmSelect
					:model-value="data.reportOptions.cost_method"
					:options="REPORT_OPTIONS"
					placeholder="Select cost method"
					variant="outlined"
					compact
					:disabled="disabled"
				/>

				<FmButton
					v-if="['pl-report', 'transaction-report'].includes(entityType)"
					type="secondary"
					rounded
					append-icon="mdi-menu-down"
					:disabled="disabled"
				>
					{{ datesDateFrom || 'Select date from' }}

					<FmMenu
						v-model="isDateFromMenuOpen"
						activator="parent"
						:close-on-content-click="false"
						:disabled="disabled"
					>
						<FmDateEditor
							:model-value="datesDateFrom"
							show-adjacent-months
							allow-weekend-selection
							calculate-previous-day-from-today
						/>
					</FmMenu>
				</FmButton>

				<FmButton type="secondary" rounded append-icon="mdi-menu-down" :disabled="disabled">
					{{ datesDateTo || 'Select date to' }}

					<FmMenu
						v-model="isDateToMenuOpen"
						activator="parent"
						:close-on-content-click="false"
						:disabled="disabled"
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
					v-model="currentCurrency"
					:options="currencies"
					variant="outlined"
					compact
					title-key="name"
					value-key="user_code"
					:disabled="disabled"
				/>

				<div class="report-header__checkbox">
					<FmCheckbox v-model="data.reportLayoutOptions.useDateFromAbove" label="Link date" />
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
					:value="[]"
					:attributes="[]"
					:suggested-attrs="[]"
					@update:model-value="(ev) => console.log('UPDATE FILTERS')"
				/>
			</div>

			<FmIconButton icon="mdi-dots-vertical" variant="text" />
		</div>
	</div>
</template>

<script setup>
	import { computed, ref } from 'vue';
	import { storeToRefs } from 'pinia';
	import dayjs from 'dayjs';
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
	import { useBalanceReportStore } from '~/stores/useBalanceReportStore';
	import { MAIN_MENU, REPORT_OPTIONS, REPORT_DATA_PROPERTIES } from './constants';

	const props = defineProps({
		entityType: {
			type: String
		},
		contentType: {
			type: String
		},
		disabled: {
			type: Boolean
		}
	});
	const emits = defineEmits(['select:layout', 'set:layout']);

	const balanceReportStore = useBalanceReportStore();
	const { data, layouts, currencies, currentCurrency } = storeToRefs(balanceReportStore);

	const [dateFromKey, dateToKey] = REPORT_DATA_PROPERTIES[props.entityType];

	const isLayoutSelectMenuOpen = ref(false);
	const isMainMenuOpen = ref(false);
	const isDateFromMenuOpen = ref(false);
	const isDateToMenuOpen = ref(false);
	const syncedTime = ref(dayjs());

	const defaultLayout = computed(() => (layouts.value || []).find((l) => l.is_default));

	const datesDateTo = computed(() => data.value.reportOptions[dateToKey]);
	const datesDateFrom = computed(() =>
		dateFromKey ? data.value.reportOptions[dateFromKey] : null
	);

	function onLayoutsMenuItemClick(eventName, payload) {
		emits(eventName, payload);
		isLayoutSelectMenuOpen.value = false;
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
