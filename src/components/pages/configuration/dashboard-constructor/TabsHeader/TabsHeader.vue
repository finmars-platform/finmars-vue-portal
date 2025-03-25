<template>
	<div ref="tabsEl" class="tabs-header">
		<draggable
			class="tabs-header__body"
			:list="tabsInnerValue"
			item-key="id"
			direction="horizontal"
			handle=".tabs-header__tab-drag"
			chosen-class="tabs-header__tab--chosen"
			drag-class="tabs-header__tab--move"
			@end="onMoveTabEnd"
		>
			<template #item="{ element }">
				<div
					:class="[
						'tabs-header__tab',
						{
							'tabs-header__tab--editing': element.editState,
							'tabs-header__tab--active': element.id === activeTab
						}
					]"
					@click.stop.prevent="emits('select', element.id)"
				>
					<FmIcon
						v-if="!isEditModeOn && tabsInnerValue.length > 1"
						icon="mdi-drag"
						class="tabs-header__tab-drag"
					/>

					<FmTextField
						v-show="element.editState"
						class="tabs-header__tab-input"
						v-model="element.captionName"
						label="Tab name"
						:autofocus="element.editState"
						compact
						:rules="[
							(captionName) =>
								validateTabName(captionName, element, tabs)
						]"
						@init="element.inputEl = $event.input"
					/>

					<div
						v-show="!element.editState"
						class="tabs-header__tab-input--readonly"
					>
						{{ element.name }}
					</div>

					<template v-if="element.editState">
						<FmIconButton
							icon="mdi-content-save"
							size="small"
							variant="text"
							:disabled="!element.isValid"
							@click.stop.prevent="saveData(element)"
						/>
						<FmIconButton
							icon="mdi-close-circle"
							size="small"
							variant="text"
							@click.stop.prevent="cancelEdit(element, tabs)"
						/>
					</template>

					<template v-else>
						<FmIconButton
							icon="mdi-pencil"
							size="small"
							variant="text"
							@click.stop.prevent="startEdit(element, tabs)"
						/>
						<FmIconButton
							icon="mdi-delete"
							size="small"
							variant="text"
							@click.stop.prevent="emits('delete', element)"
						/>
					</template>
				</div>
			</template>
		</draggable>

		<FmIconButton
			icon="mdi-plus"
			variant="outlined"
			size="small"
			class="tabs-header__add-button"
			:disabled="isEditModeOn"
			@click.stop.prevent="emits('add')"
		>
			<FmTooltip activator="parent" type="secondary" location="top">
				Add new tab
			</FmTooltip>
		</FmIconButton>
	</div>
</template>

<script setup>
	import { watch } from 'vue';
	import cloneDeep from 'lodash/cloneDeep';
	import draggable from 'vuedraggable';
	import { FmIcon, FmIconButton, FmTextField, FmTooltip } from '@finmars/ui';
	import { useTabsHeader } from './useTabsHeader';

	const props = defineProps({
		tabs: {
			type: Array,
			default: () => []
		},
		activeTab: {
			type: [String, null]
		}
	});

	const emits = defineEmits(['add', 'select', 'update', 'move', 'delete']);

	const {
		tabsInnerValue,
		tabsEl,
		isEditModeOn,
		validateTabName,
		startEdit,
		cancelEdit,
		saveData,
		onMoveTabEnd
	} = useTabsHeader(emits);

	watch(
		() => props.tabs,
		() => {
			const updatedTabs = cloneDeep(props.tabs);
			updatedTabs.forEach((t) => {
				t.isValid = true;
			});
			updatedTabs.sort((a, b) => (a.tab_number > b.tab_number ? 1 : -1));
			tabsInnerValue.value = updatedTabs;
		},
		{ immediate: true }
	);
</script>

<style lang="scss" scoped>
	@use '@/assets/scss/core/mixins' as mixins;

	.tabs-header {
		position: relative;
		width: 100%;
		min-height: 62px;
		padding-right: 48px;
		overflow: hidden;
		border-bottom: 1px solid var(--surface-container-low);

		&__add-button {
			position: absolute;
			bottom: 15px;
			right: 8px;
		}

		&__body {
			position: relative;
			width: 100%;
			display: flex;
			justify-content: flex-start;
			align-items: center;
			transition: all 0.2s ease-in-out;
			overflow-x: auto;
		}

		&__tab {
			position: relative;
			display: flex;
			width: max-content;
			min-width: 160px;
			height: 60px;
			border-top-left-radius: 6px;
			border-top-right-radius: 6px;
			border-left: 1px solid var(--surface-container);
			border-top: 1px solid var(--surface-container);
			border-right: 1px solid var(--surface-container);
			padding: 0 8px 0 20px;
			justify-content: space-between;
			align-items: center;
			cursor: pointer;
			overflow: hidden;

			&-input {
				--backgroundColor-fmTextField: transparent;

				width: 180px;

				:deep(.v-input__details) {
					min-height: 14px;
					padding: 2px 0 0 0;
				}

				&--readonly {
					position: relative;
					font: var(--body-large-font);
					min-width: 64px;
					width: max-content;
					max-width: 240px;
					@include mixins.text-overflow-ellipsis(240px);
				}
			}

			&-drag {
				position: absolute;
				left: -4px;
				top: 18px;
				cursor: move;
			}

			&--active {
				border-top: 1px solid var(--surface-container-low);
				border-right: 1px solid var(--surface-container-low);
				border-left: 1px solid var(--surface-container-low);
				background-color: var(--surface-container-low);
			}

			&--editing {
				min-width: 274px;
			}

			&--chosen {
				background-color: color-mix(
					in srgb,
					var(--on-surface) 8%,
					transparent
				);
			}

			&--move {
				background-color: var(--secondary-container);
			}

			&:hover {
				background-color: var(--surface-container-highest);
			}

			button {
				z-index: 2;
			}
		}
	}
</style>
