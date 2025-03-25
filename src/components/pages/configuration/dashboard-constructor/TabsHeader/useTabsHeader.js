import { computed, ref } from 'vue';

export function useTabsHeader(emits) {
	const tabsInnerValue = ref([]);
	const tabsEl = ref(null);

	const isEditModeOn = computed(() =>
		tabsInnerValue.value.some((t) => t.editState)
	);

	function validateTabName(captionName, tab, tabs) {
		if (!captionName) {
			tab.isValid = false;
			return 'Should not be empty.';
		}

		const processedTabName = captionName.replaceAll(' ', '').toLowerCase();
		const isSuchNamePresent = tabs.some((t) => {
			if (t.editState) {
				return false;
			}

			return t.captionName.toLowerCase() === processedTabName;
		});

		if (isSuchNamePresent) {
			tab.isValid = false;
			return 'Name should be a unique.';
		}

		tab.isValid = true;
		return true;
	}

	function startEdit(tab, tabs) {
		tabsInnerValue.value.forEach((t) => {
			if (t.id === tab.id) {
				t.editState = true;
				t.inputEl && t.inputEl.focus();
				return;
			}

			t.editState = false;
			const initialTab = tabs.find((tb) => tb.id === t.id);
			if (!t.captionName) {
				initialTab?.name && (t.name = initialTab.name);
				initialTab?.name && (t.captionName = initialTab.name);
				// temporary hide (PLAT-873)
				// !initialTab?.name && emits('delete', tab);
			}
		});
	}

	function cancelEdit(tab, tabs) {
		if (!tab || !tab.id) return;

		const initialTab = tabs.find((t) => tab.id === t.id);

		// temporary hide (PLAT-873)
		// if (!initialTab.name && !initialTab.captionName) {
		// 	emits('delete', tab);
		// 	return;
		// }

		tab.name = initialTab.name;
		tab.captionName = tab.name;
		tab.editState = false;
		tab.isValid = true;
		emits('update', { tab, value: { editState: false } });
	}

	function saveData(tab) {
		if (!tab.captionName || !tab.captionName) return;
		tab.name = tab.captionName.replaceAll(' ', '');
		tab.captionName = tab.name;
		tab.isValid = true;
		emits('update', {
			tab,
			value: {
				editState: false,
				name: tab.name,
				captionName: tab.captionName
			}
		});
	}

	function onMoveTabEnd({ oldIndex, newIndex }) {
		emits('move', { oldIndex, newIndex });
	}

	/*
	// temporary hide (PLAT-873)
	function onClickOutside(ev, tabId, tabs, initialTabs) {
		ev.stopPropagation();
		ev.preventDefault();
		const tab = tabs.find((t) => t.id === tabId);
		if (tab && tab.editState) {
			cancelEdit(tab, initialTabs);
		}
	}
	 */

	return {
		tabsInnerValue,
		tabsEl,
		isEditModeOn,
		// onClickOutside,
		validateTabName,
		startEdit,
		cancelEdit,
		saveData,
		onMoveTabEnd
	};
}
