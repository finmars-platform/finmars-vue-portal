<template>
	<section class="balance-report">
		<div class="balance-report__header">
			<div class="balance-report__header-content">
				<div class="balance-report__header-block">
					<FmButton
						type="secondary"
						rounded
						append-icon="mdi-menu-down"
					>
						Layout (test)

						<FmMenu
							v-model="isLayoutSelectMenuOpen"
							activator="parent"
							:close-on-content-click="false"
						>
							Select layout
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

					<FmIconButton icon="mdi-content-save" variant="text" />
				</div>

				<div class="balance-report__header-block">
					<FmIconButton icon="mdi-tray-arrow-down" variant="text" />

					<FmIconButton
						icon="mdi-view-agenda-outline"
						variant="text"
					/>

					<FmIconButton icon="mdi-cog-outline" variant="text" />
				</div>
			</div>
		</div>

		<div class="balance-report__header">
			<div class="balance-report__header-filters">
				<FmFilterToolbar
					class="balance-report__filters"
					:value="[]"
					:attributes="[]"
					:suggested-attrs="[]"
					@update:model-value="(ev) => console.log('UPDATE FILTERS')"
				/>
			</div>

			<FmIconButton icon="mdi-dots-vertical" variant="text" />
		</div>
	</section>
</template>

<script setup>
	import { onBeforeMount, ref } from 'vue';
	import { FmButton, FmFilterToolbar, FmIconButton, FmMenu } from '@finmars/ui';
	import useApi from '~/composables/useApi';

	definePageMeta({
		middleware: 'auth',
		bread: [
			{
				text: 'Balance Report',
				to: '/reports/balance',
				disabled: true
			}
		]
	});

	const isLayoutSelectMenuOpen = ref(false);
	const isMainMenuOpen = ref(false);
</script>

<style scoped lang="scss">
	.balance-report {
		position: relative;
		width: 100%;
		min-height: 100vh;

		&__header {
			position: relative;
			display: flex;
			justify-content: space-between;
			align-items: center;
			width: 100%;
			height: 64px;
			padding: 0 16px;

			&-content {
				display: flex;
				justify-content: space-between;
				align-items: center;
				width: 100%;
				height: 100%;
				border-bottom: 1px solid var(--outline-variant);
			}

			&-block {
				display: flex;
				justify-content: center;
				align-items: center;
				column-gap: 8px;
			}

			&-filters {
				position: relative;
				width: calc(100% - 48px);
				height: 100%;
			}
		}

		&__filters {
			--fmFilterToolbar-background-color: transparent;
		}
	}
</style>
