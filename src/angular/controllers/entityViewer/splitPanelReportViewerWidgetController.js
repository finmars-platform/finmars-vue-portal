import EntityViewerDataService from '../../services/entityViewerDataService'
import EntityViewerEventService from '../../services/eventService'
import SplitPanelExchangeService from '../../services/groupTable/exchangeWithSplitPanelService'

import evEvents from '../../services/entityViewerEvents'

export default function ($scope, $uiRouterGlobals, metaContentTypesService) {
	let vm = this

	vm.evDataService = new EntityViewerDataService()
	vm.evEventService = new EntityViewerEventService()

	vm.spExchangeService = new SplitPanelExchangeService()

	vm.readyStatus = false
	vm.rootWrapElem = null

	const layoutData = {
		layoutId: $uiRouterGlobals.params.layoutId,
		user_code: $uiRouterGlobals.params.user_code,
		name: $uiRouterGlobals.params.name,
		content_type: $uiRouterGlobals.params.content_type,
	}

	Object.keys(layoutData).forEach((key) => {
		if (!layoutData[key]) {
			console.error(
				'Error: not enough data for split panel from query parameters',
				$uiRouterGlobals.params
			)
			throw new Error(`${key} was not specified`)
		}
	})

	const additions = {
		isOpen: true,
		layoutData: layoutData,
		type: metaContentTypesService.findEntityByContentType(
			layoutData.content_type
		),
	}

	vm.evDataService.setAdditions(additions)

	const parentWindow = window.parent

	window.addEventListener('message', (event) => {
		if (event.origin === 'http://0.0.0.0:8080') {
			switch (event.data.action) {
				case 'INITIALIZATION_SETTINGS_TRANSMISSION':
					vm.evDataService.setRootWrapElemData(event.data.rootWrapElemData)
					vm.readyStatus = true

					break
			}
		}
	})

	parentWindow.postMessage(
		{ action: 'SPLIT_WIDGET_INITIALIZED' },
		'http://0.0.0.0:8080'
	)

	/* vm.evEventService.addEventListener(evEvents.ADDITIONS_CHANGE, () => {
        // send additions
    }); */

	/*
        vm.evDataService.setActiveObject(activeObject);
        vm.evEventService.dispatchEvent(evEvents.ACTIVE_OBJECT_CHANGE);
     */
}
