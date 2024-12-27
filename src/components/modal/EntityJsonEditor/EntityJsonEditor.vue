<template>
	<teleport to="body">
		<section class="entity-json-editor--overlay">
			<div class="entity-json-editor">
				<div class="entity-json-editor__header">
					<span>JSON Editor - {{ title }}</span>

					<FmIconButton
						icon="mdi-close"
						variant="text"
						@click.stop.prevent="emits('close')"
					/>
				</div>

				<div class="entity-json-editor__body">
					<VAceEditor
						lang="json"
						theme="monokai"
						class="entity-json-editor__editor"
						@init="_onEditorInit"
					/>

					<FmIconButton
						icon="mdi-content-copy"
						variant="text"
						class="entity-json-editor__editor-copy"
						:disabled="isProcessing"
						@click.stop.prevent="copyContentToClipboard"
					>
						<FmTooltip activator="parent" type="secondary" location="top">
							Copy to clipboard
						</FmTooltip>
					</FmIconButton>
				</div>

				<div class="entity-json-editor__actions">
					<FmButton
						type="secondary"
						rounded
						@click.stop.prevent="emits('close')"
					>
						Close
					</FmButton>

					<div class="entity-json-editor__actions-block">
						<FmButton
							type="tertiary"
							rounded
							@click.stop.prevent="convertToExport"
						>
							Convert to Export
						</FmButton>

						<FmButton
							type="tertiary"
							rounded
							@click.prevent.stop="_downloadFile"
						>
							Download
						</FmButton>

						<FmButton
							rounded
							:disabled="isProcessing"
							@click.prevent.stop="save"
						>
							Save
						</FmButton>
					</div>
				</div>
			</div>
		</section>
	</teleport>
</template>

<script setup>
	import { computed, ref } from 'vue';
	import capitalize from 'lodash/capitalize';
	import cloneDeep from 'lodash/cloneDeep';
	import { FmButton, FmIconButton, FmTooltip } from '@finmars/ui';
	import useAceEditor from '~/composables/useAceEditor';
	import useNotify from '~/composables/useNotify';
	import { downloadFile } from '~/pages/explorer/helper';
	import { create, update } from '~/services/entity/entityResolverService';

	const props = defineProps({
		data: {
			type: Object
		},
		entityType: {
			type: String
		}
	});

	const emits = defineEmits(['close', 'update']);

	const { VAceEditor, onEditorInit } = useAceEditor();

	const isProcessing = ref(false);
	const aceEditor = ref();

	const title = computed(() => {
		if (!props.entityType) {
			return '';
		}

		const splittedStr = props.entityType.split('-');
		splittedStr[0] = capitalize(splittedStr[0]);
		return splittedStr.join(' ');
	});

	function _onEditorInit(editor) {
		editor.getSession().setMode('ace/mode/json');
		editor.getSession().setUseWorker(false);
		editor.setAutoScrollEditorIntoView(true);
		editor.setOptions({
			enableBasicAutocompletion: true,
			enableSnippets: true
		});
		editor.setValue(JSON.stringify(props.data, null, 4));
		editor.focus();
		onEditorInit(editor);
		aceEditor.value = editor;
	}

	function copyContentToClipboard() {
		const controller = new AbortController();

		document.addEventListener('copy', (e) => {
			e.clipboardData.setData('text/plain', aceEditor.value.getValue());
			e.preventDefault();

			useNotify(
				{
					type: 'success',
					title: 'Copied',
					closeOnClick: true,
					ignoreDuplicates: true,
					duration: 1500
				},
				{ signal: controller.signal }
			);
		});
		document.execCommand('copy');

		controller.abort();
	}

	function recursiveConvert(data) {
		const convertedData = cloneDeep(data);
		Object.keys(convertedData).forEach((key) => {
			if (props.entityType === 'complex-transaction') {
				if (key === 'transaction_type_object') {
					convertedData.transaction_type =
						convertedData.transaction_type_object?.user_code;
				}

				if (
					!['inputs', 'transaction_type', 'status', 'meta', 'source'].includes(
						key
					)
				) {
					delete convertedData[key];
				}

				return;
			}

			if (
				[
					'id',
					'deleted_user_code',
					'procedure_modified_datetime',
					'created_at',
					'modified_at',
					'is_deleted',
					'pricing_policies',
					'registers'
				].includes(key) ||
				key.includes('___')
			) {
				delete convertedData[key];
				return;
			}

			if (`${key}_object` in convertedData && convertedData[`${key}_object`]) {
				convertedData[key] = convertedData[`${key}_object`].user_code;
				delete convertedData[`${key}_object`];
				return;
			}

			if (key === 'attributes') {
				convertedData.attributes = convertedData.attributes.map((attr) => {
					const editedAttr = cloneDeep(attr);
					editedAttr.attribute_type =
						editedAttr.attribute_type_object?.user_code;
					delete editedAttr.attribute_type_object;

					if (editedAttr.classifier_object) {
						editedAttr.classifier = editedAttr.classifier_object.name;
						delete editedAttr.classifier_object;
					}

					return editedAttr;
				});
				return;
			}

			if (key === 'accrual_calculation_schedules') {
				convertedData.accrual_calculation_schedules =
					convertedData.accrual_calculation_schedules.map((schedule) => {
						const editedSchedule = cloneDeep(schedule);
						delete editedSchedule.id;

						editedSchedule.accrual_calculation_model =
							editedSchedule.accrual_calculation_model_object?.user_code;
						delete editedSchedule.accrual_calculation_model_object;

						editedSchedule.periodicity =
							editedSchedule.periodicity_object?.user_code;
						delete editedSchedule.periodicity_object;

						return editedSchedule;
					});
			}
		});
		return convertedData;
	}

	function convertToExport() {
		const convertedData = recursiveConvert(
			JSON.parse(aceEditor.value.getValue())
		);
		aceEditor.value.setValue(JSON.stringify(convertedData, null, 4));

		useNotify({
			type: 'success',
			title: 'Converted'
		});
	}

	async function _downloadFile() {
		const data = JSON.parse(aceEditor.value.getValue());
		const schemeName = data.name;
		const fileName = schemeName
			? `${schemeName} (${title.value}).json`
			: `${title.value}.json`;
		downloadFile(
			aceEditor.value.getValue(),
			'application/force-download',
			fileName
		);
	}

	async function save() {
		try {
			isProcessing.value = true;
			const data = JSON.parse(aceEditor.value.getValue());
			if (data.id) {
				await update(props.entityType, data);
			} else {
				await create(props.entityType, data);
			}
			emits('update', data);
			emits('close');
		} catch (e) {
			console.error('Error saving JSON editor data. ', e);
		} finally {
			isProcessing.value = false;
		}
	}
</script>

<style lang="scss" scoped>
	.entity-json-editor--overlay {
		position: fixed;
		inset: 0;
		background-color: rgba(0, 0, 0, 0.3);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 1100;
	}

	.entity-json-editor {
		position: relative;
		width: 90%;
		max-width: 1600px;
		border-radius: 24px;
		background-color: var(--surface);
		box-shadow:
			0 1px 3px 0 rgba(0, 0, 0, 0.3),
			0 4px 8px 3px rgba(0, 0, 0, 0.15);

		&__header {
			position: relative;
			display: flex;
			width: 100%;
			height: 64px;
			padding: 0 24px;
			justify-content: space-between;
			align-items: center;
			border-bottom: 1px solid var(--outline-variant);
			font-size: 18px;
			font-weight: 600;
			line-height: 24px;
		}

		&__body {
			position: relative;
			width: 100%;
			height: 520px;
			padding: 24px;
			overflow: auto;
		}

		&__editor {
			position: relative;
			width: 100%;
			height: 100%;
			border-radius: 6px;

			&-copy {
				position: absolute;
				top: 32px;
				right: 36px;
				z-index: 10;

				:deep(.v-icon) {
					color: var(--surface) !important;
					caret-color: var(--surface) !important;
				}
			}
		}

		&__actions {
			display: flex;
			width: 100%;
			height: 84px;
			padding: 0 24px;
			justify-content: space-between;
			align-items: center;
			border-top: 1px solid var(--outline-variant);

			&-block {
				display: flex;
				justify-content: center;
				align-items: center;
				column-gap: 8px;
			}

			button {
				text-transform: none;
			}
		}
	}
</style>
