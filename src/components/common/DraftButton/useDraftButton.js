import { onBeforeMount, ref } from 'vue';
import cloneDeep from 'lodash/cloneDeep';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { diff } from 'jsondiffpatch';
import useApi from '~/composables/useApi';
import useNotify from '~/composables/useNotify';

dayjs.extend(relativeTime);

const autosaveInterval = 30000; // ms

export default function useDraftButton(
	draftUserCode,
	exportToDraft,
	applyDraft
) {
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
			name: `Draft for ${draftUserCode}`,
			user_code: draftUserCode,
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
				: getDefaultDraftData(draftUserCode);
		} catch (e) {
			console.error('The error of the drafts list loading. ', e);
			return getDefaultDraftData(draftUserCode);
		}
	}

	async function createDraft(draft) {
		return useApi('draft.post', { body: draft });
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
		if (!exportToDraft || !exportToDraft()) {
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

		draft.value.data = exportToDraft();
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
			draft.value.data = exportToDraft();
			lastSavedDraftData.value = cloneDeep(draft.value.data);
			await saveDraft(draft.value);
		} finally {
			isLoading.value = false;
		}
	}

	function runApplyingDraft() {
		applyDraft && draft.value && applyDraft(draft.value.data);
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

	async function init() {
		if (!draftUserCode) {
			return;
		}

		draft.value = await getOrCreate(draftUserCode);
		draftInterval.value = setInterval(() => prepareDraft(), autosaveInterval);
	}

	init();

	onBeforeMount(() => {
		clearInterval(draftInterval.value);
	});

	return {
		menuItems,
		isLoading,
		isDraftViewerShow,
		aceEditor,
		draft,
		formatDate,
		runApplyingDraft,
		forcedSaveDraft,
		processAfterPreview
	};
}
