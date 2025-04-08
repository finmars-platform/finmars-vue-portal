<template>
	<div class="flex justify-end">
		<DraftButton
			v-if="draft"
			@preview-draft="previewDraft"
			@user-save-draft="userSaveDraft"
			@apply-draft-to-from="applyDraftToFrom"
			:date="draftModifiedAt"
		/>
	</div>
	<div class="finmars-playbook-toolbar">
		Playbook
		<FmBtn class="outline-button" type="primary" @click="save()">
			<span v-if="fileSaveProcessing">Saving...</span>
			<span v-if="!fileSaveProcessing">Save</span>
		</FmBtn>
		<FmBtn
			:class="`outline-button ${!activeCell ? 'disabled' : ''}`"
			type="primary"
			@click="execute()"
		>
			<span v-if="executing">Executing...</span>
			<span v-if="!executing">Execute</span>
		</FmBtn>
		<FmBtn class="outline-button" type="primary" @click="addCell()">
			Add Cell
		</FmBtn>
	</div>

	<div class="finmars-playbook-cell-holder">
		<div v-if="fileData && fileData?.cells?.length && !processing">
			<div
				v-for="(cell, index) in fileData.cells"
				:key="cell"
				class="finmars-playbook-cell {{cell.active ? 'active' : ''}}"
				@click="activateCell(cell)"
			>
				<div class="finmars-playbook-cell-content">
					<v-ace-editor
						:id="`aceEditorPython${index}`"
						theme="monokai"
						style="min-height: 420px"
					/>
					<FmBtn
						class="outline-button delete-cell-button"
						type="primary"
						@click="deleteCell(index)"
						>Delete</FmBtn
					>
					<div v-if="cell.outputs">
						<div
							v-for="output in cell.outputs"
							:key="output"
							class="finmars-playbook-cell-output"
						>
							<pre>{{ output }}</pre>
						</div>
					</div>
				</div>
			</div>
			<div v-if="!fileData.cells.length">
				<p>No Cells found. You can add a new one.</p>
			</div>
		</div>
		<div class="flex-row items-center justify-center loader w-full min-h-40" v-if="processing || fileSaveProcessing">
			<FmLoader :size="60" />
		</div>
	</div>

	<BaseModal title="Draft" v-model="draftIsOpened">
		<div class="width-100 height-100">
			<v-ace-editor
				id="aceEditorJson"
				lang="json"
				theme="monokai"
				style="min-height: 420px"
			/>
		</div>

		<template #controls>
			<div class="flex-row fc-space-between">
				<FmBtn type="text" @click="close()">Close</FmBtn>
				<FmBtn @click="saveDraftModal()">Apply Draft</FmBtn>
			</div>
		</template>
	</BaseModal>
</template>

<script setup>
	import DraftButton from '~/pages/explorer/_components/DraftButton.vue';
	import { VAceEditor } from 'vue3-ace-editor';
	import { getRealmSpaceCodes } from '~/pages/explorer/helper';

	const route = useRoute();
	const emit = defineEmits(['updatePlaybook']);
	const props = defineProps({
		currentPath: {
			type: Array,
			required: true
		},
		playbook: {
			type: Object,
			required: true
		},
		playbookName: {
			type: String,
			required: true
		}
	});
	const draftIsOpened = ref(false);
	const draft = ref(null);
	const dataForEditorJson = ref(null);
	const draftModifiedAt = ref('');
	const replacedCurrentPath = ref([]);
	const replacedPlaybookName = ref('');
	const activeCell = ref(null);
	const fileData = ref(null);
	const processing = ref(false);
	const fileSaveProcessing = ref(false);
	const executing = ref(false);
	let userCode = 'explorer.' + props.currentPath.join('__');

	watch(
		() => props.playbook,
		(newValue) => {
			console.log('0000 props.playbook', props.playbook);
			dataForEditorJson.value = newValue;
		},
		{ deep: true }
	);

	watch(
		() => props.currentPath,
		(newValue) => {
			replacedCurrentPath.value = newValue.map(item => item.replace(/%20/g, ' '));
			userCode = 'explorer.' + replacedCurrentPath.value.join('__');
		},
		{ deep: true , immediate: true }
	);

	watch(
		() => props.playbookName,
		(newValue) => {
			replacedPlaybookName.value = newValue.replace(/%20/g, ' ');
		},
		{ deep: true , immediate: true }
	);

	const previewDraft = () => {
		draftIsOpened.value = true;
		setTimeout(function () {
			const editor = ace.edit('aceEditorJson');
			editor.setTheme('ace/theme/monokai');
			editor.getSession().setMode('ace/mode/json');
			editor.getSession().setUseWorker(false);
			editor.setHighlightActiveLine(false);
			editor.setShowPrintMargin(false);
			ace.require('ace/ext/language_tools');
			editor.setOptions({
				enableBasicAutocompletion: true,
				enableLiveAutocompletion: true
			});
			editor.setFontSize(14);
			editor.setBehavioursEnabled(true);
			editor.setValue(props.playbook);
			editor.focus();
			editor.navigateFileStart();
			editor.getSession().on('change', () => {
				dataForEditorJson.value = editor.getValue();
			});
		}, 400);
	};

	const userSaveDraft = () => {
		saveDraftModal();
	};

	const initEditor = () => {
		setTimeout(() => {
			fileData.value?.cells?.forEach((cell, index) => {
				const editor = ace.edit(`aceEditorPython${index}`);
				editor.setTheme('ace/theme/monokai');
				editor.getSession().setMode('ace/mode/python');
				editor.getSession().setUseWorker(false);
				editor.setHighlightActiveLine(false);
				editor.setShowPrintMargin(false);
				ace.require('ace/ext/language_tools');
				editor.setOptions({
					enableBasicAutocompletion: true,
					enableLiveAutocompletion: true
				});
				editor.setFontSize(14);
				editor.setBehavioursEnabled(true);
				editor.setValue(cell.source);
				editor.focus();
				editor.navigateFileStart();
				editor.getSession().on('change', () => {
					cell.source = editor.getValue();
				});
			});
		}, 400);
	};

	const applyDraftToFrom = () => {
		processing.value = true;
		draft.value.data = fileData.value;
		setTimeout(function () {
			processing.value = false;
			initEditor();
		}, 1000);
	};

	const saveDraftModal = async () => {
		emit('updatePlaybook', dataForEditorJson.value);
		draft.value.data = dataForEditorJson.value;
		try {
			if (draft.value.id) {
				const options = {
					params: { id: draft.value.id },
					body: draft.value
				};
				await useApi('draft.put', options);
				draftModifiedAt.value = draft.value.modified_at;
			} else {
				draft.value = await useApi('draft.post', { body: draft.value });
				draftModifiedAt.value = draft.value.modified_at;
			}
			close();
		} catch (error) {
			console.log(error, 'draft.put error');
		}
	};

	const save = async () => {
		if(!fileData?.value) return;
		processing.value = true;
		fileSaveProcessing.value = true;
		const formData = new FormData();
		const content = JSON.stringify(fileData.value, null, 4);
		const blob = new Blob([content], { type: 'application/json' });
		const file = new File([blob], replacedPlaybookName.value);
		const pathPieces = [...replacedCurrentPath.value];
		pathPieces.pop();
		const path = pathPieces.join('/')?.replace(/%20/g, ' ');
		formData.append('file', file);
		formData.append('path', path);
		try {
			await useApi('explorerFile.post', {
				body: formData
			});
			useNotify({
				type: 'success',
				title: 'File Saved'
			});
		} catch (error) {
			useNotify({
				type: 'error',
				title: 'Something went wrong !'
			});
		} finally {
			processing.value = false;
			fileSaveProcessing.value = false;
			initEditor();
		}
	};

	const execute = async () => {
		const options = {
			method: 'POST',
			body: JSON.stringify({
				code: activeCell.value.source,
				file_path: replacedCurrentPath.value.join('/')
			}),
			headers: {
				'Content-Type': 'application/json',
				Authorization: 'Token ' + useCookie('access_token').value
			}
		};
		try {
			const host = useRuntimeConfig().public.apiURL;
			const { realmCode, spaceCode } = getRealmSpaceCodes(route);
			const res = await fetch(
				`${host}/${realmCode}/${spaceCode}/workflow/api/execute-code/`,
				options
			);
			const data = await res.json();
			executing.value = false;
			activeCell.value.outputs = [data.result];
			useNotify({
				type: 'success',
				title: 'Executed'
			});
		} catch (error) {
			useNotify({
				type: 'error',
				title: 'Something went wrong !'
			});
		} finally {
			processing.value = false;
			executing.value = false;
		}
	};

	const getOrCreate = async () => {
		processing.value = true;
		const filters = {
			user_code: userCode
		};
		try {
			const data = await useApi('draft.get', { filters });
			if (data.results.length) {
				draft.value = data.results[0];
				draftModifiedAt.value = draft.value.modified_at;
				emit('updatePlaybook', draft.value.data);
			} else {
				draft.value = {
					name: 'Draft for ' + userCode,
					user_code: userCode,
					data: {}
				};
			}
		} catch (error) {
			console.log('Error draft.get', error);
		} finally {
			initEditor();
			processing.value = false;
		}
	};

	const activateCell = (cell) => {
		if(!fileData?.value?.cells) return;
		fileData.value.cells = fileData?.value?.cells?.map(function (item) {
			item.active = false;
			return item;
		});
		cell.active = true;
		activeCell.value = cell;
	};

	const generateUniqueID = () => {
		const currentDatetime = new Date().toISOString();
		return useGenerateUniqueId(currentDatetime);
	};

	const addCell = () => {
		if(!fileData?.value) return;
		fileData?.value?.cells?.push({
			id: generateUniqueID(),
			cell_type: 'code',
			source: '',
			metadata: {
				trusted: true
			},
			execution_count: 0
		});
		initEditor();
		useNotify({
			type: 'success',
			title: 'Cell added'
		});
	};

	const deleteCell = async (index) => {
		if(!fileData?.value?.cells) return;
		const confirm = await useConfirm({
			title: 'Warning',
			text: `Are you sure that you want to delete?`
		});
		if (confirm) {
			processing.value = true;
			fileData?.value?.cells?.splice(index, 1);
			processing.value = false;
		}
	};

	const close = () => {
		draftIsOpened.value = false;
	};

	const init = async () => {
		processing.value = true;
		const options = {
			path: replacedCurrentPath.value.join('/')
		};
		const res = await useApi('explorerViewFile.get', { filters: options });
		fileData.value = JSON.parse(res);
		await getOrCreate();
		processing.value = false;
	};

	init();
</script>

<style scoped lang="scss">
	.finmars-playbook-cell-content {
		position: relative;
		.delete-cell-button {
			color: #ba1a1a;
			background: var(--light-borderColor);
			position: absolute;
			right: 15px;
			top: 15px;
			font-weight: 600;
			font-size: 14px;
		}
	}
	.finmars-playbook-toolbar {
		display: flex;
		align-items: center;
		justify-content: flex-start;
		gap: 10px;
	}
	.finmars-playbook-cell {
		margin-bottom: 10px;
	}
	.finmars-playbook-cell-output {
		overflow: auto;
		padding: var(--spacing-16);
	}
	.disabled {
		pointer-events: none;
		opacity: 0.4;
	}
	:deep(.ace_editor) {
		min-width: 50vw;
	}
</style>
