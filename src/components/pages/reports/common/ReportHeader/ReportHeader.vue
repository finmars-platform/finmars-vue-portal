<template>
	<div class="report-header">
		<div class="report-header__row">
			<div class="report-header__block">
				<FmButton type="secondary" rounded append-icon="mdi-menu-down">
					{{ defaultLayout?.name }}

					<FmMenu
						v-model="isLayoutSelectMenuOpen"
						activator="parent"
						:close-on-content-click="false"
						:disabled="disabled"
					>
						<div class="report-header__menu-layouts">
							<div class="report-header__menu-layouts-content">
								<FmMenuItem
									v-for="layout in layouts"
									:id="`${layout.id}`"
									:key="layout.id"
									item-size="medium"
									:item-selected="
										layout.id === defaultLayout.id
									"
								>
									<div
										class="report-header__menu-layouts-item"
									>
										<FmIcon
											icon="mdi-home"
											:color="
												layout.id === defaultLayout?.id
													? 'var(--primary)'
													: 'var(--outline-variant)'
											"
											@click="
												onLayoutsMenuItemClick(
													'set:layout',
													layout
												)
											"
										/>

										<span
											@click="
												onLayoutsMenuItemClick(
													'select:layout',
													layout
												)
											"
											>{{ layout.name }}</span
										>
									</div>
								</FmMenuItem>
							</div>
						</div>
					</FmMenu>
				</FmButton>

				<FmIconButton icon="mdi-dots-vertical" variant="text">
					<FmMenu
						v-model="isMainMenuOpen"
						activator="parent"
						:close-on-content-click="false"
					>
						Main menu
					</FmMenu>
				</FmIconButton>

				<FmButton
					type="secondary"
					rounded
					prepend-icon="mdi-content-save"
				/>
			</div>

			<div class="report-header__block">
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
	import {
		FmButton,
		FmFilterToolbar,
		FmIcon,
		FmIconButton,
		FmMenu,
		FmMenuItem
	} from '@finmars/ui';

	const props = defineProps({
		entityType: {
			type: String
		},
		contentType: {
			type: String
		},
		layouts: {
			type: Array,
			default: () => []
		},
		disabled: {
			type: Boolean
		}
	});
	const emits = defineEmits(['select:layout', 'set:layout']);

	const isLayoutSelectMenuOpen = ref(false);
	const isMainMenuOpen = ref(false);

	const defaultLayout = computed(() =>
		(props.layouts || []).find((l) => l.is_default)
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
			padding: 16px 0;
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
	}
</style>
