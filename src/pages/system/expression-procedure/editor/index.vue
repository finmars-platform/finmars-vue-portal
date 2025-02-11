<template>
	<div class="content">
		<div class="py-3 px-8">
			<FmBreadcrumbs :crumbs="crumbs" @update-crumbs="handleCrumbs" />
		</div>
		<div class="py-3 px-8 flex flex-col gap-4 w-full h-full">
			<FmButton type="primary" rounded @click="execute">Execute</FmButton>
			<div class="flex w-full h-full gap-2">
				<VAceEditor
					:value="editorValue"
					id="expressionEditor"
					lang="json"
					theme="monokai"
					class="min-h-80 w-full h-full"
					@init="onEditorInit"
				/>
				<div class="flex flex-col w-full h-full gap-2">
					<div class="card flex flex-col gap-2 min-h-40 h-full">
						<span>Log:</span>
						<pre><strong>{{executeResult?.log}}</strong></pre>
					</div>
					<div class="card flex flex-col gap-2 min-h-40 h-full">
						<span>Output:</span>
						<pre><strong>{{executeResult?.result}}</strong></pre>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
	import {
		FmBreadcrumbs,
		FmButton,
	} from '@finmars/ui';
	import { getRealmSpaceCodes } from '~/pages/system/helper';
	import useAceEditor from '~/composables/useAceEditor';

	definePageMeta({
		middleware: 'auth'
	});

	const route = useRoute();
	const router = useRouter();

	const { VAceEditor, onEditorInit } = useAceEditor();
	const { realmCode, spaceCode } = getRealmSpaceCodes(route);
	const crumbs = [
		{ title: 'Expression procedure', path: 'expression-procedure' },
		{ title: 'Code Editor', path: 'editor' }
	];
	const executeResult = ref(null);
	const editorValue = ref();

	const handleCrumbs = (newCrumbs, newPath) => {
		router.push(`/${realmCode}/${spaceCode}/v/system` + newPath);
	};

	async function execute() {
		useNotify({
			type: 'warning',
			title: 'Execute is in processing'
		});
		const editor = ace.edit('expressionEditor');
		editorValue.value = editor.getValue();
		const opts = {
			body: {
				is_eval: true,
				expression: editorValue.value,
			}
		}
		const res = await useApi('expression.post', opts);
		if (res && res._$error) {
			useNotify({ type: 'error', title: res._$error.message || res._$error.detail });
		} else {
			executeResult.value = res;
			useNotify({
				type: 'success',
				title: 'Execute is being processed'
			});
		}
	}
</script>

<style scoped lang="scss">
	.content{
		height: calc(100vh - 160px);
		.card {
			border-radius: var(--spacing-4);
			border: 1px solid var(--card-border-color);
			padding: var(--spacing-4);
		}
	}
</style>
