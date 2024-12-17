<template>
	<section class="code-editor-overlay">
		<div class="code-editor">
			<div class="code-editor__header">
				Code editor

				<FmIconButton
					icon="mdi-close"
					variant="text"
					@click.stop.prevent="emits('close')"
				/>
			</div>

			<div class="code-editor__body">
				<VAceEditor
					:value="value"
					lang="json"
					theme="monokai"
					class="code-editor__body-editor"
					@init="_onEditorInit"
				/>
			</div>

			<div class="code-editor__actions">
				<FmButton type="secondary" rounded @click.stop.prevent="emits('close')">
					Close
				</FmButton>

				<FmButton rounded @click.stop.prevent="update">OK</FmButton>
			</div>
		</div>
	</section>
</template>

<script setup>
	import { ref } from 'vue';
	import { FmButton, FmIconButton } from '@finmars/ui';
	import useAceEditor from '~/composables/useAceEditor';

	defineProps({
		value: {
			type: String
		}
	});

	const emits = defineEmits(['close', 'update']);

	const { VAceEditor, onEditorInit } = useAceEditor('python');

	const currentEditor = ref();

	function _onEditorInit(editor) {
		currentEditor.value = editor;
		onEditorInit(editor);
		editor.getSession().setUseWorker(false);
		editor.setOptions({
			enableBasicAutocompletion: true,
			enableSnippets: true
		});
		editor.focus();
	}

	function update() {
		const updatedValue = currentEditor.value.getValue();
		emits('update', updatedValue);
		emits('close');
	}
</script>

<style lang="scss" scoped>
	.code-editor-overlay {
		position: fixed;
		inset: 0;
		background-color: rgba(0, 0, 0, 0.3);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 1100;
	}

	.code-editor {
		position: relative;
		width: 90%;
		max-width: 1400px;
		height: 680px;
		border-radius: 24px;
		background-color: var(--surface);

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
			height: calc(100% - 148px);

			&-editor {
				position: relative;
				width: 100%;
				height: 100%;
				border-radius: 8px;
			}
		}

		&__actions {
			display: flex;
			width: 100%;
			height: 84px;
			padding: 0 24px;
			justify-content: flex-end;
			align-items: center;
			column-gap: 16px;
			border-top: 1px solid var(--outline-variant);
		}
	}
</style>
