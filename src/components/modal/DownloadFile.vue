<template>
	<BaseModal
		title="File Preview"
		:modelValue="!!data"
		@update:modelValue="() => emit('close')"
		class="modal-download-file"
	>
		<div class="p-b-16" style="position: relative">
			<FmIcon
				v-if="contentType !== 'image'"
				v-fm-tooltip="'Copy to clipboard'"
				@click="copyContent(data.content_formatted)"
				icon="file_copy"
				class="icon-copy"
			/>
			<div>
				<div
					v-if="contentType === 'text'"
					class="file-preview-content-wrap"
					style="font-family: monospace"
				>
					<div v-html="data.content_formatted"></div>
				</div>

				<div
					v-if="contentType === 'csv'"
					class="file-preview-content-wrap"
					style="font-family: monospace"
				>
					<div v-html="data.content_formatted"></div>
				</div>

				<div
					v-show="
						contentType === 'json' ||
						contentType === 'yaml' ||
						contentType === 'python'
					"
					class="file-preview-content-wrap"
				>
					<v-ace-editor
						v-if="data.content_formatted && contentType"
						v-model:value="data.content_formatted"
						theme="monokai"
						:lang="contentType"
						:options="EDITOR_OPTIONS"
						@init="editorInit"
						style="width: 100%; height: 500px"
					/>
				</div>

				<div v-show="contentType === 'image'" class="text-center">
					<img :src="imageSrc" />
				</div>
			</div>
		</div>

		<template #controls="{ cancel }">
			<div class="flex-row fc-space-between">
				<FmBtn @click="download"> Download</FmBtn>
				<FmBtn @click="cancel">OK</FmBtn>
			</div>
		</template>
	</BaseModal>
</template>

<script setup>
	import { VAceEditor } from 'vue3-ace-editor'
	import 'ace-builds/src-noconflict/mode-json'
	import 'ace-builds/src-noconflict/mode-python'
	import 'ace-builds/src-noconflict/mode-yaml'
	import 'ace-builds/src-noconflict/theme-monokai'

	const props = defineProps({
		fileInfo: Object
	})

	const emit = defineEmits(['close'])

	const EDITOR_OPTIONS = {
		enableBasicAutocompletion: true,
		enableSnippets: true,
		fontSize: 14,
		behavioursEnabled: true,
		highlightActiveLine: false,
		showPrintMargin: false,
		useWorker: false
	}

	const data = ref(props.fileInfo)
	const imageSrc = ref(null)

	const contentType = ref(null)

	function download() {
		let content = data.value.content

		if (typeof content === 'object') {
			content = JSON.stringify(data.value.content, null, 4)
		}

		let name = 'file'

		if (data.value.file_descriptor) {
			name = data.value.file_descriptor.name
		}

		if (data.value?.info?.file_report_object) {
			name = data.value.info.file_report_object.name
		}

		downloadFile(content, 'application/force-download', name)
	}

	function formatCSV() {
		let result = ''

		let lines = data.value.content.split(/\r?\n/)

		result = '<table><tbody>'

		lines.forEach(function (line) {
			const pieces = line.split(',')

			result = result + '<tr>'

			pieces.forEach(function (piece) {
				result = result + '<td>' + piece + '</td>'
			})

			result = result + '</tr>'
		})

		result = result + '</tbody></table>'

		return result
	}

	function copyContent(content) {
		copyToBuffer(content, () => useNotify({ type: 'success', title: 'Copied' }))
	}

	function editorInit(editor) {
		editor.focus()
		editor.navigateFileStart()
	}

	function formatContent() {
		let name = ''

		if (data.value.file_descriptor) {
			name = data.value.file_descriptor.name
		}

		if (data.value.info?.file_report_object) {
			name = data.value.info.file_report_object.name
		}

		if (name.indexOf('.csv') !== -1) {
			contentType.value = 'csv'

			data.value.content_formatted = formatCSV()
		} else if (name.indexOf('.json') !== -1) {
			contentType.value = 'json'

			data.value.content_formatted = data.value.content
		} else if (name.indexOf('.py') !== -1) {
			contentType.value = 'python'

			data.value.content_formatted = data.value.content
		} else if (name.indexOf('.yml') !== -1 || name.indexOf('.yaml') !== -1) {
			contentType.value = 'yaml'

			data.value.content_formatted = data.value.content
		} else if (name.indexOf('.txt') !== -1) {
			contentType.value = 'text'

			data.value.content_formatted = data.value.content
		} else if (name.indexOf('.log') !== -1) {
			contentType.value = 'text'

			data.value.content_formatted = data.value.content
		} else if (
			name.indexOf('.png') !== -1 ||
			name.indexOf('.jpg') !== -1 ||
			name.indexOf('.gif') !== -1
		) {
			contentType.value = 'image'

			const urlCreator = window.URL || window.webkitURL
			imageSrc.value = urlCreator.createObjectURL(data.value.blob)
		}
	}

	function readBlob() {
		const reader = new FileReader()

		reader.addEventListener('loadend', function () {
			data.value.content = reader.result

			formatContent()
		})

		reader.readAsText(data.value.content)
	}

	onMounted(() => {
		if (data.value.content instanceof Blob) {
			readBlob()
		} else {
			formatContent()
		}
	})
</script>

<style>
	.modal-download-file {
		width: 80vw;

		.icon-copy {
			position: absolute;
			top: 16px;
			right: 16px;
			cursor: pointer;
			z-index: 1;
		}
	}
</style>
