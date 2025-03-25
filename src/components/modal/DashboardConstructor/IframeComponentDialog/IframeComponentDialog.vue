<template>
	<div class="iframe-component-dialog">
		<div class="body">
			<FmTabs
				:tabs="IFRAME_COMPONENT_TABS"
				variant="normal"
				@change-tab="activeTab = $event"
			/>

			<div class="content">
				<!-- TAB: Main -->
				<template v-if="activeTab === 0">
					<div class="row-grid">
						<FmTextField
							v-model="itemData.name"
							label="Name"
							hide-details
							outlined
							:disabled="isLoading"
						/>

						<UserCodeField
							v-model="itemData.user_code"
							:disabled="isLoading"
							@update:valid="isUserCodeValid = $event"
						/>

						<FmSelect
							v-model="itemData.url_type"
							:options="URL_TYPES"
							variant="outlined"
							label="Type"
							:disabled="isLoading"
							@update:model-value="itemData.url_type = $event"
						/>
					</div>

					<div
						v-if="itemData.url_type === 'relative_url'"
						class="row"
					>
						<p>
							If Relative URL selected you need to provide only
							path that after Space Code
						</p>
						<p>Example:</p>
						<code
							>/api/storage/workflows/com/finmars/index.html</code
						>
					</div>

					<div class="row-grid">
						<FmTextField
							v-model="itemData.url"
							label="Url"
							hide-details
							outlined
							:disabled="isLoading"
						/>
					</div>
				</template>

				<!-- TAB: Advance settings  -->
				<template v-if="activeTab === 1">
					<div class="row-grid">
						<FmCheckbox
							v-model="itemData.settings.assume_tab_height"
							label="Assume height of tab"
						/>
					</div>
				</template>
			</div>
		</div>

		<div class="actions">
			<FmButton
				type="secondary"
				rounded
				@click.stop.prevent="emits('close')"
			>
				Cancel
			</FmButton>

			<div class="actions__block">
				<FmButton
					type="tertiary"
					rounded
					:disabled="isLoading"
					@click.stop.prevent="exportToDashboards"
				>
					Export to dashboards
				</FmButton>

				<FmButton
					rounded
					:disabled="isLoading || !itemData.name || !isUserCodeValid"
					@click.stop.prevent="save"
				>
					Ok
				</FmButton>
			</div>
		</div>

		<div v-if="isLoading" class="loader">
			<FmProgressCircular indeterminate size="80" />
		</div>
	</div>
</template>

<script setup>
	import { onBeforeMount, ref } from 'vue';
	import { storeToRefs } from 'pinia';
	import cloneDeep from 'lodash/cloneDeep';
	import size from 'lodash/size';
	import {
		FmButton,
		FmCheckbox,
		FmProgressCircular,
		FmTabs,
		FmTextField,
		FmSelect
	} from '@finmars/ui';
	import { IFRAME_COMPONENT_TABS } from '../constants';
	import { useDashboardConstructorStore } from '~/stores/useDashboardConstructorStore';
	import { md5 } from '~/utils/md5';
	import { URL_TYPES } from './constants';
	import UserCodeField from '~/components/common/UserCodeField/UserCodeField.vue';

	const props = defineProps({
		item: {
			type: [Object, null]
		}
	});
	const emits = defineEmits(['close', 'select', 'confirm']);

	const dashboardConstructorStore = useDashboardConstructorStore();
	const { components } = storeToRefs(dashboardConstructorStore);
	const { exportComponentToDashboards, updateComponent, setComponents } =
		dashboardConstructorStore;

	const activeTab = ref(0);
	const isLoading = ref(false);
	const itemData = ref(null);
	const isUserCodeValid = ref(false);

	function exportToDashboards() {
		exportComponentToDashboards(itemData.value);
	}

	function save() {
		const updatedComponent = cloneDeep(itemData.value);

		if (updatedComponent.id) {
			updateComponent(updatedComponent);
		} else {
			updatedComponent.id = md5(
				`${Date.now()}_${size(components.value)}`
			);
			const updatedComponents = cloneDeep(components.value);
			updatedComponents.push(updatedComponent);
			setComponents(updatedComponents);
		}

		emits('confirm');
	}

	onBeforeMount(() => {
		if (props.item) {
			itemData.value = cloneDeep(props.item);
		} else {
			itemData.value = {
				type: 'iframe',
				id: null, // should be generated before create
				name: '',
				settings: {
					entity_type: 'balance-report',
					assume_tab_height: false,
					auto_refresh: false,
					linked_components: {
						report_settings: {}
					}
				},
				url_type: 'absolute_url',
				url: '',
				user_settings: {}
			};
		}
	});
</script>

<style lang="scss" scoped>
	.iframe-component-dialog {
		position: relative;
		width: 100%;
		color: var(--on-surface);

		.body {
			position: relative;
			width: 100%;
			padding: 24px 24px 0 24px;

			:deep(.v-tabs) {
				border-radius: 4px 4px 0 0;
				width: 640px;

				button {
					text-transform: none;
					background-color: transparent !important;
				}
			}
		}

		.content {
			position: relative;
			top: -1px;
			width: 100%;
			height: 480px;
			border-radius: 0 8px 8px 8px;
			padding: 24px 24px 0 24px;
			border: 1px solid var(--outline-variant);

			button {
				text-transform: none;
			}
		}

		.actions {
			display: flex;
			width: 100%;
			padding: 24px;
			justify-content: space-between;
			align-items: center;

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

		.loader {
			position: absolute;
			inset: 0;
			z-index: 5;
			pointer-events: none;
			display: flex;
			justify-content: center;
			align-items: center;
			background-color: rgba(0, 0, 0, 0.2);
		}
	}

	.row-grid {
		position: relative;
		width: 100%;
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		column-gap: 16px;
		margin-bottom: 16px;

		:deep(.fm-text-field) {
			height: max-content;
		}

		:deep(.fm-select-activator) {
			height: max-content;
		}
	}

	.row {
		position: relative;
		width: 100%;
		margin-bottom: 16px;
		font: var(--body-medium-font);

		p {
			font: inherit;
		}

		code {
			display: block;
			width: max-content;
			padding: 8px 16px;
			border-radius: 4px;
			background-color: var(--inverse-surface);
			color: var(--inverse-on-surface);
			margin-top: 4px;
		}
	}
</style>
