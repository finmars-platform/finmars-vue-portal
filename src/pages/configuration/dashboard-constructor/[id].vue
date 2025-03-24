<template>
	<section class="dashboard-constructor-page">
		<template v-if="!isMounted && !layout">
			<div class="dashboard-constructor-page__loading">Loading ...</div>
		</template>

		<template
			v-if="
				route.params.id === 'new' &&
				!layout?.id &&
				!layout?.data?.layout_type
			"
		>
			<h3 class="title-new">Select Device for Dashboard Layout</h3>

			<div class="actions-new">
				<div
					class="layout-type-button"
					v-ripple.center.circle
					@click="selectLayoutType('mobile')"
				>
					<FmIcon
						icon="mdi-cellphone"
						size="32"
						color="var(--on-surface)"
					/>

					Mobile
				</div>

				<div
					class="layout-type-button"
					v-ripple.center.circle
					@click="selectLayoutType('tablet')"
				>
					<FmIcon
						icon="mdi-tablet"
						size="32"
						color="var(--on-surface)"
					/>

					Tablet
				</div>

				<div
					class="layout-type-button"
					v-ripple.center.circle
					@click="selectLayoutType('desktop')"
				>
					<FmIcon
						icon="mdi-monitor"
						size="32"
						color="var(--on-surface)"
					/>

					Desktop
				</div>
			</div>
		</template>

		<template
			v-if="
				layout?.id ||
				(route.params.id === 'new' && layout?.data?.layout_type)
			"
		>
			<div class="actions">
				<div class="actions__block">
					<FmButton
						type="secondary"
						rounded
						:disabled="isLoading"
						@click.stop.prevent="goToDashboard"
					>
						Go to Dashboard
					</FmButton>

					<FmButton
						v-if="layout.id"
						type="tertiary"
						rounded
						:disabled="isLoading"
						@click.stop.prevent="makeCopy"
					>
						Make a copy
					</FmButton>

					<FmButton
						v-if="layout.id"
						type="tertiary"
						rounded
						:disabled="isLoading"
						@click.stop.prevent="openJsonEditor"
					>
						Edit as JSON
					</FmButton>
				</div>

				<FmButton
					rounded
					:disabled="isLoading || !isValid"
					@click.stop.prevent="save"
				>
					Save
				</FmButton>
			</div>

			<div class="content">
				<div class="row">
					<div class="top-row">
						<div class="user-code-block">
							<UserCodeInput
								:user-code="layout?.user_code"
								@update:user-code="
									updateField('user_code', $event)
								"
								@update:configuration-code="
									updateField('configuration_code', $event)
								"
								@update:valid="updateUserCodeValidationValue"
							/>
						</div>

						<FmTextField
							class="name"
							:model-value="layout?.name"
							outlined
							label="Dashboard Layout Name"
							:error="
								formData.name.isDirty && !formData.name.isValid
							"
							:error-messages="
								formData.name.isDirty && !formData.name.isValid
									? 'This field may not be blank.'
									: ''
							"
							@update:model-value="updateField('name', $event)"
						/>

						<FmButton
							type="tertiary"
							rounded
							:disabled="isLoading"
							@click="toggleTopPanelActivity"
						>
							{{
								layout?.data?.fixed_area?.status === 'active'
									? 'Deactivate Top Panel'
									: 'Activate Top Panel'
							}}
						</FmButton>

						<FmCheckbox
							class="default"
							v-model="layout.is_default"
							:disabled="isLoading"
							label="Is Default"
						/>
					</div>
				</div>

				<div class="block">
					<div class="block-content">
						<div class="top-panel">
							<TopPanelLayout
								v-if="
									layout?.data?.fixed_area?.status ===
									'active'
								"
								:data="layout?.data"
								@edit:component="editComponent"
								@update="updateDashboard"
							/>
						</div>

						<div class="tabs">
							<TabsHeader
								:tabs="layoutTabsHeader"
								:active-tab="activeTab"
								@select="activeTab = $event"
								@add="addTab"
								@update="updateTab"
								@delete="deleteTab"
								@move="moveTab"
							/>

							<div class="tabs-body">
								<TabLayout
									v-if="
										layout?.data &&
										!isEmpty(layout?.data?.tabs)
									"
									:data="layout?.data"
									:active-tab="activeTab"
									@edit:component="editComponent"
									@update="updateDashboard"
								/>
							</div>
						</div>
					</div>

					<div class="block-sidebar">
						<FmButton
							class="add-btn"
							type="tertiary"
							rounded
							:disabled="isLoading"
						>
							Add New Component

							<FmMenu
								activator="parent"
								:items="
									DASHBOARD_CONSTRUCTOR_COMPONENTS_AVAILABLE_FOR_CREATION
								"
								@click:item="addNewComponent"
							/>
						</FmButton>

						<div class="block-sidebar__title">
							Drag cards from here
						</div>

						<div class="block-sidebar__content">
							<ComponentListItem
								v-for="item in availableComponentsTypes"
								:key="item.id"
								:item="item"
								@edit="editComponent"
								@delete="deleteComponent"
							/>
						</div>
					</div>
				</div>
			</div>

			<EntityJsonEditor
				v-if="isJsonEditorOpen"
				:data="layout"
				entity-type="dashboard-layout"
				@close="isJsonEditorOpen = false"
				@update="getLayout"
			/>
		</template>

		<div v-if="isLoading" class="loader">
			<FmProgressCircular indeterminate size="120" />
		</div>
	</section>
</template>

<script setup>
	import { onBeforeUnmount, onMounted, ref } from 'vue';
	import isEmpty from 'lodash/isEmpty';
	import {
		FmButton,
		FmCheckbox,
		FmIcon,
		FmMenu,
		FmProgressCircular,
		FmTextField,
		Ripple
	} from '@finmars/ui';
	import { useDashboardConstructor } from '~/composables/dashboard-constructor/useDashboardConstructor';
	import {
		DASHBOARD_CONSTRUCTOR_EVENTS,
		DASHBOARD_CONSTRUCTOR_COMPONENTS_AVAILABLE_FOR_CREATION
	} from '~/constants';
	import UserCodeInput from '~/components/common/UserCodeInput/UserCodeInput.vue';
	import ComponentListItem from '~/components/pages/configuration/dashboard-constructor/ComponentListItem.vue';
	import TabsHeader from '~/components/pages/configuration/dashboard-constructor/TabsHeader/TabsHeader.vue';
	import TopPanelLayout from '~/components/pages/configuration/dashboard-constructor/TopPanelLayout/TopPanelLayout.vue';
	import TabLayout from '~/components/pages/configuration/dashboard-constructor/TabLayout/TabLayout.vue';
	import EntityJsonEditor from '~/components/modal/EntityJsonEditor/EntityJsonEditor.vue';

	const vRipple = Ripple;

	definePageMeta({
		middleware: 'auth'
	});

	const route = useRoute();
	const isMounted = ref(false);

	const {
		vueBus,
		isLoading,
		isJsonEditorOpen,
		isValid,
		formData,
		layout,
		availableComponentsTypes,
		layoutTabsHeader,
		activeTab,
		goToDashboard,
		openJsonEditor,
		makeCopy,
		save,
		selectLayoutType,
		loadLayoutData,
		downloadAttributes,
		updateField,
		updateDashboard,
		updateUserCodeValidationValue,
		toggleTopPanelActivity,
		addNewComponent,
		editComponent,
		deleteComponent,
		addTab,
		updateTab,
		deleteTab,
		moveTab
	} = useDashboardConstructor();

	async function getLayout() {
		await loadLayoutData(route.params.id);
		if (!isEmpty(layout.value?.data?.tabs)) {
			activeTab.value = layout.value.data.tabs[0].id;
		} else {
			activeTab.value = null;
		}
	}

	onMounted(async () => {
		if (!route.params.id) {
			console.error('The dashboard id is missing!');
			return;
		}

		try {
			isLoading.value = true;

			await downloadAttributes();

			if (route.params.id !== 'new') {
				await getLayout();
			}
		} finally {
			isLoading.value = false;
			isMounted.value = true;
		}
	});

	onBeforeUnmount(() => {
		vueBus.$emitter.off(
			DASHBOARD_CONSTRUCTOR_EVENTS.UPDATE_DASHBOARD_CONSTRUCTOR
		);
	});
</script>

<style lang="scss" scoped>
	.dashboard-constructor-page {
		--page-loader-bg: rgba(0, 0, 0, 0.05);

		position: relative;
		width: 100%;
		height: 100%;
		color: var(--on-surface);
		font-family: -apple-system, SFPro, BlinkMacSystemFont, 'Segoe UI',
			Roboto, Ubuntu, 'Helvetica Neue', sans-serif;

		button {
			text-transform: none;
		}

		&__loading {
			display: flex;
			width: 100%;
			height: 320px;
			justify-content: center;
			align-items: center;
			font: var(--headline-large-font);
		}
	}

	.title-new {
		text-align: center;
		font: var(--headline-small-font);
		color: var(--on-surface);
		padding-top: 64px;
		margin-bottom: 24px;
	}

	.actions-new {
		position: relative;
		width: 100%;
		height: 200px;
		display: flex;
		justify-content: center;
		align-items: center;
		column-gap: 24px;
	}

	.layout-type-button {
		position: relative;
		width: 160px;
		height: 160px;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		row-gap: 16px;
		font: var(--body-medium-font);
		color: var(--on-surface);
		border-radius: 50%;
		cursor: pointer;

		&:hover {
			background-color: color-mix(
				in srgb,
				transparent,
				var(--on-surface) 8%
			);
		}
	}

	.actions {
		display: flex;
		width: 100%;
		height: 64px;
		justify-content: space-between;
		align-items: center;
		padding: 0 16px;
		border-bottom: 1px solid var(--outline-variant);

		&__block {
			display: flex;
			justify-content: center;
			align-items: center;
			column-gap: 16px;
		}

		button {
			text-transform: none;
		}
	}

	.content {
		position: relative;
		width: 100%;
		height: calc(100% - 88px);
		overflow-y: auto;
		padding: 16px;
	}

	.row {
		position: relative;
		width: 100%;
		overflow-x: auto;
		padding-bottom: 8px;
		margin-bottom: 8px;
	}

	.top-row {
		display: flex;
		justify-content: flex-start;
		align-items: flex-start;
		width: max-content;
		padding-top: 6px;
		column-gap: 10px;
	}

	.user-code-block {
		position: relative;
		width: 540px;
		padding: 16px 12px;
		border-radius: 8px;
		border: 1px solid var(--outline-variant);
	}

	.name {
		position: relative;
		height: max-content;
		width: 240px;
	}

	.default {
		:deep(label.v-label) {
			font-size: 16px !important;
			padding: 0 4px;
		}
	}

	.block {
		display: flex;
		width: 100%;
		height: calc(100% - 134px);
		justify-content: space-between;
		align-items: stretch;

		&-content {
			position: relative;
			width: calc(100% - 336px);
			margin-right: 8px;
			padding-right: 8px;
			overflow-y: auto;
		}

		&-sidebar {
			position: relative;
			width: 320px;

			.add-btn {
				width: 100%;
				max-width: 100% !important;
			}

			&__title {
				font: var(--title-medium-font);
				padding: 10px 0;
			}

			&__content {
				position: relative;
				width: 100%;
				height: calc(100% - 80px);
				overflow-y: auto;
			}
		}
	}

	.top-panel {
		position: relative;
		width: 100%;
		min-height: 75px;
		border-radius: 4px;
		border: 1px solid var(--surface-container-low);
		margin-bottom: 24px;
	}

	.tabs {
		position: relative;
		border-radius: 4px;

		&-body {
			position: relative;
			width: 100%;
			min-height: 75px;
			border-bottom-left-radius: 4px;
			border-bottom-right-radius: 4px;
			border-right: 1px solid var(--surface-container-low);
			border-bottom: 1px solid var(--surface-container-low);
			border-left: 1px solid var(--surface-container-low);
		}
	}

	.loader {
		position: absolute;
		inset: 0;
		z-index: 5;
		background-color: var(--page-loader-bg);
		display: flex;
		justify-content: center;
		align-items: center;
		pointer-events: none;
	}
</style>
