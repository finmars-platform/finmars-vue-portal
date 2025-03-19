<template>
	<div ref="blockEl" class="table-row-block">
		<div class="table-row-block__checkbox">
			<FmCheckbox :disabled="disabled" />
		</div>

		<div v-if="!isMenuColumnHidden" class="table-row-block__menu">
			<FmIconButton
				icon="mdi-dots-vertical"
				variant="text"
				class="table-row-block__menu-btn"
				:disabled="disabled"
				@click.stop.prevent
			/>

			<FmIconButton
				icon="mdi-label-outline"
				variant="text"
				class="table-row-block__menu-btn2"
				:disabled="disabled"
			>
				<FmMenu activator="parent">
					<template #default>
						<template v-for="item in LABEL_OPTIONS.slice(0, -1)" :key="item.key">
							<FmMenuItem class="table-row-block__menu-item" item-size="medium">
								<FmIcon :icon="item.icon" :color="item.color" />
							</FmMenuItem>
						</template>
					</template>
				</FmMenu>
			</FmIconButton>
		</div>
	</div>
</template>

<script setup>
	import { ref } from 'vue';
	import { FmCheckbox, FmIcon, FmIconButton, FmMenu, FmMenuItem } from '@finmars/ui';
	import { LABEL_OPTIONS } from '../ReportTable/constants';

	const props = defineProps({
		isMenuColumnHidden: {
			type: Boolean
		},
		disabled: {
			type: Boolean
		}
	});

	const blockEl = ref(null);
</script>

<style lang="scss" scoped>
	.table-row-block {
		position: relative;
		display: flex;
		justify-content: flex-start;
		align-items: center;
		width: max-content;
		height: 100%;
		background-color: var(--surface-container);

		&__checkbox {
			display: flex;
			justify-content: center;
			align-items: center;
			width: var(--report-table-row-height);
			min-width: var(--report-table-row-height);
			height: 100%;
			border-right: 1px solid var(--outline-variant);
		}

		&__menu {
			position: relative;
			display: flex;
			justify-content: center;
			align-items: center;
			width: calc(2 * var(--report-table-row-height));
			min-width: calc(2 * var(--report-table-row-height));
			height: 100%;
			border-right: 1px solid var(--outline-variant);
			padding-left: var(--report-table-row-height);

			&-btn {
				position: absolute;
				left: 4px;
				top: calc(var(--report-table-row-height) - 40px) / 2;
			}

			&-btn2 {
				:deep(.v-icon) {
					color: var(--on-surface-variant) !important;
					caret-color: var(--on-surface-variant) !important;
				}
			}

			&-item {
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
	}
</style>
