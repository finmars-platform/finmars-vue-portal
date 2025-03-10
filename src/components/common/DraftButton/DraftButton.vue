<template>
	<div class="draft-button">
		<FmMenu :items="menuItems" @click:item="onItemClick">
			<template #activator="{ props }">
				<div v-bind="props" class="draft-button__activator">
					<FmIcon
						icon="mdi-gesture"
						size="20"
						color="var(--primary)"
					/>

					<FmTooltip
						type="secondary"
						location="top"
						activator="parent"
					>
						Draft Manager
					</FmTooltip>

					<div v-if="isLoading" class="draft-button__loader">
						<FmProgressCircular indeterminate size="32" />
					</div>
				</div>
			</template>
		</FmMenu>

		<div class="draft-button__content">
			<span>Last Updated:</span>
			<span>{{ formatDate(draft?.modified_at) || '&nbsp;' }}</span>
		</div>

		<teleport v-if="isDraftViewerShow" to="body">
			<div class="draft-button__viewer-overlay">
				<div class="draft-button__viewer">
					<div class="draft-button__viewer-header">
						<h4>Draft</h4>

						<FmIconButton
							icon="mdi-close"
							variant="text"
							@click.stop.prevent="isDraftViewerShow = false"
						/>
					</div>

					<div class="draft-button__viewer-content">
						<VAceEditor
							:value="JSON.stringify(draft?.data, null, 4)"
							lang="json"
							theme="monokai"
							class="relative w-full h-full rounded-[6px]"
							@init="_onEditorInit"
						/>
					</div>

					<div class="draft-button__viewer-actions">
						<FmButton
							rounded
							type="secondary"
							@click.prevent.stop="isDraftViewerShow = false"
						>
							Close
						</FmButton>

						<FmButton
							rounded
							@click.prevent.stop="processAfterPreview"
						>
							Apply Draft
						</FmButton>
					</div>
				</div>
			</div>
		</teleport>
	</div>
</template>

<script setup>
	import { onBeforeMount, onBeforeUnmount, ref } from 'vue';
	import cloneDeep from 'lodash/cloneDeep';
	import dayjs from 'dayjs';
	import relativeTime from 'dayjs/plugin/relativeTime';
	import { diff } from 'jsondiffpatch';
	import {
		FmButton,
		FmIcon,
		FmIconButton,
		FmMenu,
		FmProgressCircular,
		FmTooltip
	} from '@finmars/ui';
	import useAceEditor from '~/composables/useAceEditor';
	import useApi from '~/composables/useApi';
	import useNotify from '~/composables/useNotify';

	dayjs.extend(relativeTime);

	const autosaveInterval = 30000; // ms

	const props = defineProps({
		draftUserCode: {
			type: String,
			required: true,
			validator(value) {
				if (!value) {
					console.warn('Draft is not inited. User Code is not set');
				}
				return !!value;
			}
		},
		exportToDraft: {
			type: Function,
			required: true
		},
		applyDraft: {
			type: Function,
			required: true
		}
	});

	const { VAceEditor, onEditorInit } = useAceEditor();

	const menuItems = [
		{ title: 'Preview Draft', value: 0 },
		{ title: 'Save Draft', value: 1 },
		{ title: 'Apply Draft to Form', value: 2 }
	];

	const isLoading = ref(false);
	const isDraftViewerShow = ref(false);
	const aceEditor = ref();

	const draft = ref(null);
	const lastSavedDraftData = ref(null);
	const draftInterval = ref(null);

	function getDefaultDraftData() {
		return {
			name: `Draft for ${props.draftUserCode}`,
			user_code: props.draftUserCode,
			data: {}
		};
	}

	function formatDate(date) {
		if (!date) return '';

		const formattedDate = dayjs(date).format('HH:mm');
		const fromNow = dayjs(date).fromNow();
		return `${formattedDate} (${fromNow})`;
	}

	async function getOrCreate(draftUserCode) {
		try {
			const res = await useApi('draft.get', {
				filters: { user_code: draftUserCode }
			});

			return res && res.results && res.results.length
				? res.results[0]
				: cloneDeep(getDefaultDraftData(draftUserCode));
		} catch (e) {
			console.error('The error of the drafts list loading. ', e);
			return getDefaultDraftData(draftUserCode);
		}
	}

	async function createDraft(draft) {
		draft.value = await useApi('draft.post', { body: draft });
	}

	async function updateDraft(draft) {
		return useApi('draft.put', {
			params: { id: draft.id },
			body: draft
		});
	}

	async function saveDraft(draft) {
		try {
			return draft.id ? updateDraft(draft) : createDraft(draft);
		} catch (e) {
			console.error('The error saving draft. ', e);
		}
	}

	function checkBeforeSaving() {
		if (!props.exportToDraft || !props.exportToDraft()) {
			useNotify({
				type: 'error',
				title: 'Nothing to save'
			});
			return false;
		}

		return true;
	}

	async function prepareDraft() {
		const canSave = checkBeforeSaving();
		if (!canSave) return;

		draft.value.data = props.exportToDraft();
		if (!lastSavedDraftData.value) {
			lastSavedDraftData.value = cloneDeep(draft.value.data);
		}

		const diffData = diff(draft.value.data, lastSavedDraftData.value);
		if (diffData) {
			try {
				isLoading.value = true;
				draft.value = await saveDraft(draft.value);
				lastSavedDraftData.value = cloneDeep(draft.value.data);
			} finally {
				isLoading.value = false;
			}
		}
	}

	async function forcedSaveDraft() {
		const canSave = checkBeforeSaving();
		if (!canSave) return;

		try {
			isLoading.value = true;
			draft.value.data = props.exportToDraft();
			lastSavedDraftData.value = cloneDeep(draft.value.data);
			await saveDraft(draft.value);
		} finally {
			isLoading.value = false;
		}
	}

	function runApplyingDraft() {
		props.applyDraft && draft.value && props.applyDraft(draft.value.data);
	}

	async function processAfterPreview() {
		const editedDraft = aceEditor.value.getValue();

		try {
			isLoading.value = true;
			draft.value = await saveDraft(JSON.parse(editedDraft));
			runApplyingDraft();
		} finally {
			isLoading.value = false;
		}
	}

	function onItemClick({ item }) {
		switch (item.value) {
			case 0:
				isDraftViewerShow.value = true;
				break;
			case 1:
				forcedSaveDraft();
				break;
			case 2:
				runApplyingDraft();
				break;
		}
	}

	function _onEditorInit(editor) {
		aceEditor.value = editor;
		onEditorInit(editor);
	}

	onBeforeMount(async () => {
		if (!props.draftUserCode) {
			return;
		}

		draft.value = await getOrCreate(props.draftUserCode);
		draftInterval.value = setInterval(
			() => prepareDraft(),
			autosaveInterval
		);
	});

	onBeforeUnmount(() => {
		clearInterval(draftInterval.value);
	});
</script>

<style lang="scss" scoped>
	.draft-button {
		position: relative;
		padding: 4px 8px;
		border-radius: 8px;
		box-shadow:
			0 1px 3px 0 rgba(0, 0, 0, 0.3),
			0 4px 8px 3px rgba(0, 0, 0, 0.15);
		display: flex;
		justify-content: flex-start;
		align-items: center;
		column-gap: 8px;

		&__activator {
			position: relative;
			width: 32px;
			height: 32px;
			border-radius: 50%;
			display: flex;
			justify-content: center;
			align-items: center;
			cursor: pointer;
			background-color: var(--surface-container-highest);

			&:hover {
				background-color: color-mix(
					in srgb,
					transparent,
					var(--primary) 20%
				);
			}
		}

		&__content {
			position: relative;
			width: max-content;
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: flex-start;

			span {
				font-size: 10px;
				font-weight: 500;
				line-height: 18px;
			}
		}

		&__loader {
			position: absolute;
			inset: 0;
			display: flex;
			justify-content: center;
			align-items: center;
			z-index: 1;
		}

		&__viewer {
			position: relative;
			width: 96%;
			max-width: 1200px;
			height: 600px;
			background-color: var(--surface);
			border-radius: 24px;

			&-header {
				position: relative;
				width: 100%;
				height: 64px;
				padding: 0 12px 0 24px;
				display: flex;
				justify-content: space-between;
				align-items: center;
				border-bottom: 1px solid var(--outline-variant);

				h4 {
					font-size: 18px;
					font-weight: 600;
				}
			}

			&-content {
				position: relative;
				width: 100%;
				height: calc(100% - 128px);
				padding: 24px;
			}

			&-actions {
				position: relative;
				width: 100%;
				height: 64px;
				padding: 24px;
				display: flex;
				justify-content: space-between;
				align-items: center;
				border-top: 1px solid var(--outline-variant);

				button {
					text-transform: none;
				}
			}

			&-overlay {
				position: fixed;
				inset: 0;
				z-index: 1000;
				background-color: rgba(0, 0, 0, 0.3);
				display: flex;
				justify-content: center;
				align-items: center;
			}
		}
	}
</style>
