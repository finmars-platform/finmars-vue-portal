import metaHelper from '../../helpers/meta.helper'

export default function (uiService) {
	var getDataForComponentsSelector = function (
		viewModel,
		componentsForLinking,
		itemId
	) {
		var getComponentsTypesByContentType = function (contentType) {
			var filteredComponentsTypes = viewModel.componentsTypes.filter(function (
				componentType
			) {
				return (
					componentType.type === 'control' &&
					componentType.settings.value_type === 100 &&
					componentType.settings.content_type === contentType
				)
			})

			return filteredComponentsTypes
		}

		viewModel.controlComponentsTypes = viewModel.componentsTypes.filter(
			function (componentType) {
				return componentType.type === 'control'
			}
		)

		viewModel.dateControlComponentsTypes = viewModel.componentsTypes.filter(
			function (componentType) {
				return (
					componentType.type === 'control' &&
					componentType.settings.value_type === 40
				)
			}
		)

		viewModel.currencyControlComponentsTypes = getComponentsTypesByContentType(
			'currencies.currency'
		)

		viewModel.pricingPolicyControlComponentsTypes =
			getComponentsTypesByContentType('instruments.pricingpolicy')

		viewModel.portfoliosComponentTypes = getComponentsTypesByContentType(
			'portfolios.portfolio'
		)

		viewModel.accountsComponentTypes =
			getComponentsTypesByContentType('accounts.account')

		viewModel.strategies1ComponentTypes = getComponentsTypesByContentType(
			'strategies.strategy1'
		)

		viewModel.strategies2ComponentTypes = getComponentsTypesByContentType(
			'strategies.strategy2'
		)

		viewModel.strategies3ComponentTypes = getComponentsTypesByContentType(
			'strategies.strategy3'
		)

		viewModel.componentsTypes.forEach(function (comp) {
			if (
				componentsForLinking.indexOf(comp.type) !== -1 &&
				comp.id !== itemId
			) {
				viewModel.componentsForMultiselector.push({
					id: comp.id,
					name: comp.name,
				})
			}
		})
	}

	// Victor 2020.10.26
	const createCopyOfComponent = (component, id, namePostfix) => {
		const copy = metaHelper.recursiveDeepCopy(component, false)
		copy.id = id
		copy.name = `${copy.name} ${namePostfix}`

		if (copy.settings && copy.settings.linked_components) {
			copy.settings.linked_components = {}
		}

		return copy
	}

	// Victor 2020.10.26
	const exportComponentToDashboards = async (
		viewModel,
		$mdDialog,
		dataService
	) => {
		const dashboardLayouts = await uiService
			.getDashboardLayoutList()
			.then((data) => data.results)

		const compIdPattern = new Date().getTime() + '_' + dashboardLayouts.length
		const newId = dataService.___generateId(compIdPattern)

		const { name: currentDashboardLayoutName } = dataService.getData()
		const namePostfix = `(copied from dashboard: ${currentDashboardLayoutName})`

		const exportedComponent = createCopyOfComponent(
			viewModel.item,
			newId,
			namePostfix
		)

		const { status, selected: targetDashboardLayouts } = await $mdDialog.show({
			controller: 'ExpandableItemsSelectorDialogController as vm',
			templateUrl: 'views/dialogs/expandable-items-selector-dialog-view.html',
			multiple: true,
			locals: {
				data: {
					dialogTitle: 'Select dashboards to export',
					items: dashboardLayouts,
					multiselector: true,
				},
			},
		})

		if (status !== 'agree' || targetDashboardLayouts.length === 0) {
			return
		}

		targetDashboardLayouts.forEach((targetLayout) => {
			targetLayout.data.components_types.push(exportedComponent)
		})

		const updatedLayouts = await Promise.all(
			targetDashboardLayouts.map((layout) =>
				uiService.updateDashboardLayout(layout.id, layout)
			)
		)

		return $mdDialog.show({
			controller: 'InfoDialogController as vm',
			templateUrl: 'views/info-dialog-view.html',
			parent: angular.element(document.body),
			clickOutsideToClose: false,
			multiple: true,
			locals: {
				info: {
					title: 'Success',
					description: `Dashboard Layouts are Updated (${updatedLayouts
						.map(({ name }) => name)
						.join(', ')})`,
				},
			},
		})
	}

	const onReportTypeChange = async function (
		activeType,
		item,
		getLayoutsFn,
		$scope
	) {
		return new Promise(async (res) => {
			item.settings.entity_type = activeType.key
			item.settings.layout = null

			if (activeType.custom.menuOptionsNotLoaded) {
				activeType.fieldData.menuOptions = await getLayoutsFn()
				activeType.custom.menuOptionsNotLoaded = false

				$scope.$apply()
			}

			res(item)
		})
	}

	const prepareDataForReportLayoutSelector = function (
		layoutsSelectorsList,
		reportEntityType,
		selectedLayout,
		getLayoutsRes
	) {
		let activeSel = layoutsSelectorsList.find(function (selector) {
			return selector.key === reportEntityType
		})

		activeSel.isActive = true

		return new Promise((res) => {
			getLayoutsRes.then(function (layoutsList) {
				activeSel.model = selectedLayout
				activeSel.custom.menuOptionsNotLoaded = false
				activeSel.fieldData.menuOptions = layoutsList

				res(layoutsSelectorsList)
			})
		})
	}

	return {
		getDataForComponentsSelector: getDataForComponentsSelector,
		exportComponentToDashboards: exportComponentToDashboards,

		onReportTypeChange: onReportTypeChange,
		prepareDataForReportLayoutSelector: prepareDataForReportLayoutSelector,
	}
}
