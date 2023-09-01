/**
 * Created by mevstratov on 11.09.2019.
 */

export default function () {
	var data = {
		checkForSplitPanelLayoutChangesFn: null,
		openAdditionFn: null,
		setSplitPanelLayoutToOpenFn: null,
	}

	function setSplitPanelLayoutChangesCheckFn(callbackFn) {
		data.checkForSplitPanelLayoutChangesFn = callbackFn
	}

	function getSplitPanelChangedLayout() {
		if (!data.checkForSplitPanelLayoutChangesFn) {
			return null
		}

		return data.checkForSplitPanelLayoutChangesFn()
	}

	return {
		setSplitPanelLayoutChangesCheckFn: setSplitPanelLayoutChangesCheckFn,
		getSplitPanelChangedLayout: getSplitPanelChangedLayout,
	}
}
