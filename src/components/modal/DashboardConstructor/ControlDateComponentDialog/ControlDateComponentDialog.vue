<template>
	<div class="control-date-component-dialog" @keydown.stop.prevent.enter>
		<div class="control-date-component-dialog__body">
			<FmTabs
				:tabs="TABS"
				variant="normal"
				@change-tab="activeTab = $event"
			/>

			<div class="control-date-component-dialog__content">
				<template v-if="activeTab === 0">
					<div class="row-grid">
						<FmTextField
							v-model="itemData.name"
							label="Name"
							outlined
							:disabled="isLoading"
						/>

						<UserCodeField
							v-model="itemData.user_code"
							:disabled="isLoading"
							@update:valid="isUserCodeValid = $event"
						/>

						<FmCheckbox
							v-model="itemData.settings.auto_refresh"
							label="Trigger Refresh on Value Change"
						/>
					</div>
				</template>

				<template v-else>
					<div class="row">
						<FmTextField
							:model-value="
								itemData.settings.default_value_expression
							"
							label="Expression"
							outlined
							hide-details
							:disabled="isLoading"
							@update:model-value="
								itemData.settings.default_value_expression =
									$event
							"
						/>

						<div
							class="control-date-component-dialog__expression-editor"
						>
							<ExpressionEditorSelector
								menu-location="end"
								:rule-expr="
									itemData.settings.default_value_expression
								"
								:disabled="isLoading"
								@update="
									itemData.settings.default_value_expression =
										$event
								"
							>
								<template #activator>
									<FmIconButton
										icon="mdi-dots-horizontal"
										variant="outlined"
									/>
								</template>
							</ExpressionEditorSelector>
						</div>
					</div>
				</template>
			</div>
		</div>

		<div class="control-date-component-dialog__actions">
			<FmButton
				type="secondary"
				rounded
				@click.stop.prevent="emits('close')"
			>
				Cancel
			</FmButton>

			<FmButton
				rounded
				:disabled="isLoading || !itemData.name || !isUserCodeValid"
				@click.stop.prevent="save"
			>
				Ok
			</FmButton>
		</div>

		<div v-if="isLoading" class="control-date-component-dialog__loader">
			<FmProgressCircular indeterminate size="80" />
		</div>
	</div>
</template>

<script setup>
	import { onBeforeMount, ref } from 'vue';
	import { storeToRefs } from 'pinia';
	import cloneDeep from 'lodash/cloneDeep';
	import {
		FmButton,
		FmCheckbox,
		FmIconButton,
		FmProgressCircular,
		FmTabs,
		FmTextField
	} from '@finmars/ui';
	import { useDashboardConstructorStore } from '~/stores/useDashboardConstructorStore';
	import { TABS } from '../constants';
	import { md5 } from '~/utils/md5';
	import ExpressionEditorSelector from '~/components/common/ExpressionEditorSelector/ExpressionEditorSelector.vue';
	import UserCodeField from '~/components/common/UserCodeField/UserCodeField.vue';

	const props = defineProps({
		item: {
			type: [Object, null]
		}
	});

	const emits = defineEmits(['close', 'confirm']);

	const dashboardConstructorStore = useDashboardConstructorStore();
	const { components } = storeToRefs(dashboardConstructorStore);
	const { updateComponent, setComponents } = dashboardConstructorStore;

	const isLoading = ref(false);
	const activeTab = ref(0);

	const itemData = ref(null);
	const isUserCodeValid = ref(false);

	function save() {
		if (itemData.value.id) {
			updateComponent(itemData.value);
		} else {
			itemData.value.id = md5(`${Date.now()}_${itemData.value.id}`);
			const updatedComponents = cloneDeep(components.value);
			updatedComponents.push(itemData.value);
			setComponents(updatedComponents);
		}

		emits('confirm');
	}

	onBeforeMount(() => {
		if (props.item) {
			itemData.value = cloneDeep(props.item);
			delete itemData.value.defaultValue;
		} else {
			itemData.value = {
				type: 'control',
				id: null,
				name: '',
				settings: {
					value_type: 40,
					default_value_expression: 'now() - timedelta(days=1)'
				}
			};
		}
	});
</script>

<style lang="scss" scoped>
	.control-date-component-dialog {
		position: relative;
		width: 100%;

		&__body {
			position: relative;
			width: 100%;
			padding: 24px 24px 0 24px;

			:deep(.v-tabs) {
				border-radius: 4px 4px 0 0;
				width: 320px;

				button {
					text-transform: none;
					background-color: transparent !important;
				}
			}
		}

		&__content {
			position: relative;
			top: -1px;
			width: 100%;
			height: 480px;
			border-radius: 0 8px 8px 8px;
			padding: 24px 24px 0 24px;
			border: 1px solid var(--outline-variant);
		}

		&__expression-editor {
			position: relative;
			width: max-content;
			min-width: max-content;
			height: max-content;
		}

		&__actions {
			display: flex;
			width: 100%;
			padding: 24px;
			justify-content: space-between;
			align-items: center;

			button {
				text-transform: none;
			}
		}

		&__loader {
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

	.row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		column-gap: 16px;
		margin-bottom: 16px;
	}

	.row-grid {
		position: relative;
		width: 100%;
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		column-gap: 16px;
		margin-bottom: 16px;

		:deep(.fm-checkbox) {
			label.v-label {
				padding-left: 8px;
				font: var(--body-large-font) !important;
			}
		}

		:deep(.fm-text-field) {
			height: max-content;
		}
	}
</style>
