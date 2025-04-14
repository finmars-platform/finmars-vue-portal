<template>
	<div class="column-settings-menu">
		<template v-for="item in currentMenuItems" :key="item.action">
			<template v-if="item.type === 'menu-item'">
				<div v-if="item.action === 'alignment'" class="column-settings-menu__item-alignment">
					<FmTooltip location="top" type="secondary">
						<template #activator="{ props }">
							<FmIconButton
								v-bind="props"
								icon="mdi-format-align-left"
								:variant="currentColumnAlignment === 'left' ? 'tonal' : 'outlined'"
								@click.stop.prevent="runAction(`${item.action}:left`)"
							/>
						</template>

						<span>Left alignment</span>
					</FmTooltip>

					<FmTooltip location="top" type="secondary">
						<template #activator="{ props }">
							<FmIconButton
								v-bind="props"
								icon="mdi-format-align-center"
								:variant="currentColumnAlignment === 'center' ? 'tonal' : 'outlined'"
								@click.stop.prevent="runAction(`${item.action}:center`)"
							/>
						</template>

						<span>Center alignment</span>
					</FmTooltip>

					<FmTooltip location="top" type="secondary">
						<template #activator="{ props }">
							<FmIconButton
								v-bind="props"
								icon="mdi-format-align-right"
								:variant="currentColumnAlignment === 'right' ? 'tonal' : 'outlined'"
								@click.stop.prevent="runAction(`${item.action}:right`)"
							/>
						</template>

						<span>Right alignment</span>
					</FmTooltip>
				</div>

				<div v-else class="column-settings-menu__item" @click.stop.prevent="runAction(item.action)">
					{{ item.title }}
				</div>
			</template>

			<div v-else class="column-settings-menu__delimiter" />
		</template>
	</div>
</template>

<script setup>
	import { computed } from 'vue';
	import hasIn from 'lodash/hasIn';
	import get from 'lodash/get';
	import { FmIconButton, FmTooltip } from '@finmars/ui';
	import { REPORT_COLUMN_MENU_ITEMS } from './constants';

	const props = defineProps({
		column: {
			type: Object
		}
	});
	const emits = defineEmits(['action']);

	const isGroup = computed(() => hasIn(props.column, '___group_type_id'));
	const currentColumnAlignment = computed(() => get(props.column, ['style', 'text_align']));

	const currentMenuItems = computed(() =>
		REPORT_COLUMN_MENU_ITEMS.filter((i) => i.available.includes(isGroup.value ? 'group' : 'item'))
	);

	function runAction(payload) {
		emits('action', payload);
	}
</script>

<style lang="scss" scoped>
	.column-settings-menu {
		position: relative;
		width: 100%;
		min-height: 200px;
		max-height: 360px;
		overflow-x: hidden;
		overflow-y: auto;
		font: var(--body-large-font);
		color: var(--on-surface);

		&__item,
		&__item-alignment {
			display: flex;
			width: 100%;
			height: 48px;
			padding: 0 16px 0 32px;
			align-items: center;
		}

		&__item {
			justify-content: flex-start;
			cursor: pointer;

			&:hover {
				background-color: var(--surface-container-highest);
			}
		}

		&__item-alignment {
			justify-content: flex-start;
			column-gap: 16px;
		}

		&__delimiter {
			position: relative;
			width: 100%;
			height: 1px;
			border-bottom: 1px solid var(--outline-variant);
		}
	}
</style>
