<template>
	<teleport to="body">
		<section
			class="fixed inset-0 bg-black/40 flex justify-center items-center z-[100]"
		>
			<div
				class="relative w-[80%] h-[75%] bg-[var(--surface)] rounded-[24px]"
			>
				<div
					class="relative w-full h-[64px] pl-[24px] pr-[12px] flex justify-between items-center border-b-[1px] border-b-[var(--outline-variant)] border-solid"
				>
					<span class="text-[18px] font-bold">
						Preview "{{ file?.name }}" file
					</span>

					<FmIconButton
						icon="mdi-close"
						variant="text"
						@click.stop.prevent="emits('close')"
					/>
				</div>

				<div class="relative w-full p-[24px] h-[calc(100%-128px)]">
					<template v-if="shouldUseEditor">
						<VAceEditor
							:value="formattedContent"
							lang="json"
							theme="monokai"
							class="relative w-full h-full rounded-[6px]"
							@init="onEditorInit"
						/>
					</template>

					<template v-if="isCurrentTypeText">
						<div
							class="relative w-full h-full rounded-[6px] bg-[#2f3129] text-[#e6db74] p-2 overflow-y-auto"
							v-html="formattedContent"
						/>
					</template>

					<template v-if="isCurrentTypeImage">
						<div
							class="relative w-full h-full rounded-[6px] bg-[#2f3129]"
						>
							<img
								:src="formattedContent"
								alt="image"
								class="w-full h-full object-contain"
							/>
						</div>
					</template>

					<FmIconButton
						v-if="!isCurrentTypeImage"
						icon="mdi-content-copy"
						variant="text"
						class="absolute top-[32px] right-[36px] z-10"
						:class="['task-info-file-preview__copy']"
						:disabled="isProcessing"
						@click.stop.prevent="copyContentToClipboard"
					>
						<FmTooltip
							activator="parent"
							type="secondary"
							location="top"
						>
							Copy to clipboard
						</FmTooltip>
					</FmIconButton>

					<div
						v-if="isProcessing"
						class="absolute left-0 top-0 w-full h-full flex justify-center items-center bg-black/20"
					>
						<FmProgressCircular indeterminate />
					</div>
				</div>

				<div
					class="relative w-full px-[24px] h-[64px] flex justify-between items-center border-t-[1px] border-t-[var(--outline-variant)] border-solid"
				>
					<FmButton
						v-if="file.file_url"
						rounded
						:disabled="isProcessing"
						@click.prevent.stop="_downloadFile"
						>Download
					</FmButton>

					<FmButton
						rounded
						type="secondary"
						@click.prevent.stop="emits('close')"
					>
						Close
					</FmButton>
				</div>
			</div>
		</section>
	</teleport>
</template>

<script setup>
	import { computed, ref, onBeforeMount } from 'vue';
	import {
		FmButton,
		FmIconButton,
		FmProgressCircular,
		FmTooltip
	} from '@finmars/ui';
	import useApi from '~/composables/useApi';
	import useNotify from '~/composables/useNotify';
	import useAceEditor from '~/composables/useAceEditor';
	import { downloadFile } from '~/pages/explorer/helper';

	const props = defineProps({
		file: {
			/*
			{
				id?: number;
				name: string;
				notes: string;
				type: string;
				created_at: string; // Date ISO 8601
				content_type: string;
				content?: any;
				content_type_verbose: string;
				file_url?: string;
			}
			*/
			type: Object,
			required: true
		}
	});

	const emits = defineEmits(['close']);

	const { VAceEditor } = useAceEditor();

	const isProcessing = ref(false);
	const data = ref(null);
	const content = ref('');
	const formattedContent = ref('');

	const contentType = computed(() => props.file?.content_type_verbose);
	const shouldUseEditor = computed(() =>
		['json', 'yaml', 'pyton'].includes(contentType.value)
	);
	const isCurrentTypeText = computed(() =>
		['csv', 'log', 'txt', 'text'].includes(contentType.value)
	);
	const isCurrentTypeImage = computed(() =>
		['png', 'jpg', 'jpeg', 'gif', 'image'].includes(contentType.value)
	);

	function onEditorInit(editor) {
		switch (contentType.value) {
			case 'json':
				editor.getSession().setMode('ace/mode/json');
				break;
			case 'yml':
			case 'yaml':
				editor.getSession().setMode('ace/mode/yaml');
				break;
			case 'py':
			case 'pyton':
				editor.getSession().setMode('ace/mode/pyton');
				break;
		}

		editor.getSession().setUseWorker(false);
		editor.setHighlightActiveLine(false);
		editor.setShowPrintMargin(false);
		editor.setFontSize(14);
		editor.setBehavioursEnabled(true);
		editor.setOptions({
			enableBasicAutocompletion: true,
			enableSnippets: true
		});
		editor.navigateFileStart();
		editor.focus();
	}

	function formatCSV(content) {
		const lines = content.split(/\r?\n/);
		let result = '<table><tbody>';
		lines.forEach((line) => {
			const pieces = line.split(',');
			result += '<tr>';
			pieces.forEach((piece) => {
				result += `<td>${piece}</td>`;
			});
			result += '</tr>';
		});
		result += '</tbody></table>';
		return result;
	}

	function formatContent() {
		switch (contentType.value) {
			case 'csv':
				formattedContent.value = formatCSV(content.value);
				break;
			case 'json':
				formattedContent.value = JSON.stringify(content.value, null, 4);
				break;
			case 'py':
			case 'pyton':
			case 'yml':
			case 'yaml':
			case 'txt':
			case 'text':
			case 'log':
				formattedContent.value = content.value;
				break;
			case 'png':
			case 'jpg':
			case 'jpeg':
			case 'gif':
			case 'image':
				// eslint-disable-next-line no-case-declarations
				const urlCreator = window.URL || window.webkitURL;
				formattedContent.value = urlCreator.createObjectURL(data.value);
				break;
		}
	}

	function copyContentToClipboard() {
		const controller = new AbortController();

		document.addEventListener('copy', (e) => {
			e.clipboardData.setData('text/plain', formattedContent.value);
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

	async function _downloadFile() {
		const { name } = props.file;
		const value =
			typeof content.value === 'object'
				? JSON.stringify(content.value, null, 4)
				: content.value;
		downloadFile(value, 'application/force-download', name);
	}

	async function readBlob(blob) {
		return new Promise((resolve) => {
			const reader = new FileReader();

			reader.onloadend = () => {
				const content = reader.result;
				resolve(content);
			};

			reader.readAsText(blob);
		});
	}

	onBeforeMount(async () => {
		if (!props.file) {
			return;
		}

		try {
			isProcessing.value = true;
			const { file_url, info } = props.file;

			if (file_url) {
				data.value = await useApi('explorerViewFile.get', {
					filters: { path: file_url }
				});
				if (data.value instanceof Blob) {
					content.value = await readBlob(data.value);
				} else {
					content.value = data.value;
				}
			} else if (info) {
				data.value = info;
				content.value = info;
			}

			formatContent();
		} catch (error) {
			console.error(`The file ${props.file.name} loading error. `, error);
		} finally {
			isProcessing.value = false;
		}
	});
</script>

<style lang="scss" scoped>
	.task-info-file-preview__copy {
		:deep(.v-icon) {
			color: var(--surface) !important;
			caret-color: var(--surface) !important;
		}
	}
</style>
