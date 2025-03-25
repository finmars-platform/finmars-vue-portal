<template>
	<div class="apex-chart-component-dialog">
		<div class="body">
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
			</div>

			<div class="row-grid">
				<TwoFieldsMultiselect
					:value="itemData.settings.components_to_listen"
					:options="componentsTypesToListen"
					label="Components to Listen"
					:disabled="isLoading"
					@update:value="
						itemData.settings.components_to_listen = $event
					"
				/>

				<FmCheckbox
					v-model="itemData.settings.show_header"
					label="Show Header"
				/>
			</div>

			<div class="editor-wrapper">
				<VAceEditor
					:value="itemData.value?.source || ''"
					lang="javascript"
					theme="monokai"
					class="editor"
					@init="_onEditorInit"
					@update:value="onJsonUpdate"
				/>
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
	import { computed, onBeforeMount, ref } from 'vue';
	import { storeToRefs } from 'pinia';
	import cloneDeep from 'lodash/cloneDeep';
	import size from 'lodash/size';
	import {
		FmButton,
		FmCheckbox,
		FmProgressCircular,
		FmTextField
	} from '@finmars/ui';
	import useAceEditor from '~/composables/useAceEditor';
	import { md5 } from '~/utils/md5';
	import { useDashboardConstructorStore } from '~/stores/useDashboardConstructorStore';
	import TwoFieldsMultiselect from '~/components/common/TwoFieldsMultiselect/TwoFieldsMultiselect.vue';
	import UserCodeField from '~/components/common/UserCodeField/UserCodeField.vue';

	const props = defineProps({
		item: {
			type: [Object, null]
		}
	});
	const emits = defineEmits(['close', 'select', 'confirm']);

	const { VAceEditor, onEditorInit } = useAceEditor('javascript');
	const dashboardConstructorStore = useDashboardConstructorStore();
	const { components } = storeToRefs(dashboardConstructorStore);
	const { updateComponent, setComponents } = dashboardConstructorStore;

	const aceEditor = ref();
	const isLoading = ref(false);
	const itemData = ref(null);
	const isUserCodeValid = ref(false);

	const componentsTypesToListen = computed(() =>
		(components.value || [])
			.filter((c) => !!c.user_code)
			.map((c) => ({
				id: c.user_code,
				name: c.name
			}))
	);

	function _onEditorInit(editor) {
		onEditorInit(editor);
		editor.getSession().setUseWorker(false);
		editor.setValue(itemData.value.source);
		aceEditor.value = editor;
	}

	function onJsonUpdate(val) {
		itemData.value.source = val;
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

	onBeforeMount(async () => {
		if (props.item) {
			itemData.value = cloneDeep(props.item);
		} else {
			itemData.value = {
				type: 'apex_chart',
				id: null, // should be generated before create
				name: '',
				settings: {
					show_header: true,
					components_to_listen: []
				},
				source: '',
				user_settings: {}
			};
		}
	});
</script>

<style lang="scss" scoped>
	.apex-chart-component-dialog {
		position: relative;
		width: 100%;

		.body {
			position: relative;
			width: 100%;
			height: 480px;
			padding: 24px 24px 0 24px;
			overflow-y: auto;

			:deep(.v-tabs) {
				border-radius: 4px 4px 0 0;
				width: 640px;

				button {
					text-transform: none;
					background-color: transparent !important;
				}
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
		grid-template-columns: repeat(2, 1fr);
		column-gap: 16px;
		margin-bottom: 16px;

		:deep(.fm-text-field) {
			height: max-content;
		}
	}

	.editor-wrapper {
		position: relative;
		width: 100%;
		height: 256px;
	}

	.editor {
		position: relative;
		width: 100%;
		height: 100%;
		border-radius: 4px;
	}
</style>
