<template>
	<div class="report-table">
		<div class="report-table__header">
			<div :class="['report-table__header-checkbox', 'report-table__header-cell']">
				<FmCheckbox :disabled="disabled" />
			</div>

			<div
				v-if="!isMenuColumnHidden"
				:class="['report-table__header-menu', 'report-table__header-cell']"
			>
				<FmIconButton
					icon="mdi-label-outline"
					variant="text"
					class="report-table__header-menu-btn"
					:disabled="disabled"
				>
					<FmMenu activator="parent">
						<template #default>
							<template v-for="item in LABEL_OPTIONS" :key="item.key">
								<FmMenuItem
									:class="[
										'report-table__header-menu-item',
										{ 'report-table__header-menu-item--bordered': item.key === 'reset' }
									]"
									item-size="medium"
								>
									<FmIcon :icon="item.icon" :color="item.color" />
								</FmMenuItem>
							</template>
						</template>
					</FmMenu>
				</FmIconButton>
			</div>

			<template v-for="gr in groups" :key="gr.key">
				<div
					:class="['report-table__header-group', 'report-table__header-cell']"
					:style="{ width: gr.style?.width || '100px' }"
				>
					<FmIconButton
						icon="mdi-menu-right"
						variant="text"
						class="report-table__header-cell-prepend"
					/>

					<span>{{ gr.layout_name }}</span>

					<FmIconButton
						icon="mdi-dots-vertical"
						variant="text"
						class="report-table__header-cell-append"
					/>
				</div>
			</template>

			<template v-for="col in visibleColumns" :key="col.key">
				<div
					:class="['report-table__header-col', 'report-table__header-cell']"
					:style="{ width: col.style?.width || '100px' }"
				>
					<span>{{ col.layout_name }}</span>

					<FmIconButton
						icon="mdi-dots-vertical"
						variant="text"
						class="report-table__header-cell-append"
					/>
				</div>
			</template>

			<FmIconButton
				:class="[
					'report-table__header-menu-icon',
					{ 'report-table__header-menu-icon--closed': isMenuColumnHidden }
				]"
				:icon="isMenuColumnHidden ? 'mdi-chevron-right' : 'mdi-chevron-left'"
				size="small"
				variant="tonal"
				:disabled="disabled"
				@click.stop.prevent="isMenuColumnHidden = !isMenuColumnHidden"
			/>
		</div>
	</div>
</template>

<script setup>
	import { computed, ref } from 'vue';
	import { storeToRefs } from 'pinia';
	import get from 'lodash/get';
	import { FmCheckbox, FmIcon, FmIconButton, FmMenu, FmMenuItem } from '@finmars/ui';
	import { useBalanceReportStore } from '~/stores/useBalanceReportStore';
	import { LABEL_OPTIONS } from './constants';

	const props = defineProps({
		disabled: {
			type: Boolean
		}
	});

	const balanceReportStore = useBalanceReportStore();
	const { currentLayout, sortGroup, sortColumn } = storeToRefs(balanceReportStore);

	const isMenuColumnHidden = ref(false);

	const groups = computed(() => get(currentLayout.value, ['data', 'grouping'], []));
	const groupIds = computed(() => groups.value.map((gr) => gr.___group_id));
	const columns = computed(() =>
		get(currentLayout.value, ['data', 'columns'], []).filter(
			(col) => !groupIds.value.includes(col.___column_id)
		)
	);
	const visibleColumns = computed(() => columns.value.filter((col) => !col.isHidden));
</script>

<style lang="scss" scoped>
	.report-table {
		--report-table-row-height: 48px;

		position: relative;
		width: max-content;

		&__header {
			position: relative;
			width: max-content;
			height: var(--report-table-row-height);
			display: flex;
			justify-content: flex-start;
			align-items: center;
			background-color: var(--surface-container);
			color: var(--on-surface-variant);
			border-bottom: 1px solid var(--outline-variant);

			&-cell {
				position: relative;
				height: 100%;
				display: flex;
				align-items: center;
				overflow: hidden;
				border-right: 1px solid var(--outline-variant);
				font: var(--label-medium-pro-font);

				&-prepend,
				&-append {
					position: absolute;
					right: 0;
					top: calc(var(--report-table-row-height) - 40px) / 2;
				}

				&-prepend {
					left: 0;
				}

				&-append {
					right: 0;
				}
			}

			&-checkbox {
				width: var(--report-table-row-height);
				justify-content: center;
			}

			&-menu {
				width: calc(2 * var(--report-table-row-height));
				padding-left: var(--report-table-row-height);
				justify-content: center;

				&-btn {
					:deep(.v-icon) {
						color: var(--on-surface-variant) !important;
						caret-color: var(--on-surface-variant) !important;
					}
				}

				&-item {
					&--bordered {
						border-top: 1px solid var(--outline-variant);
					}
				}

				&-icon {
					position: absolute;
					width: 16px !important;
					height: 16px !important;
					left: calc(3 * var(--report-table-row-height) - 8px);
					top: 16px;
					z-index: 1;

					&--closed {
						left: calc(var(--report-table-row-height) - 8px);
					}
				}
			}

			&-group {
				padding: 0 40px;
			}

			&-col {
				padding: 0 40px 0 16px;
			}
		}
	}
</style>
