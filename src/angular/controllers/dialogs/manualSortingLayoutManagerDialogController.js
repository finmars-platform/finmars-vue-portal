import uiService from '../../services/uiService'
import objectComparisonHelper from '../../helpers/objectsComparisonHelper'

export default function (
	$scope,
	$mdDialog,
	toastNotificationService,
	data,
	entityViewerDataService
) {
	let vm = this

	vm.column = data.column
		? JSON.parse(angular.toJson(data.column))
		: { options: { sort_settings: {} } }
	let originalSortSettings = JSON.parse(
		JSON.stringify(vm.column.options.sort_settings)
	)

	/*if (!vm.column.options) vm.column.options = {};
        if (!vm.column.options.sort_settings) vm.column.options.sort_settings = {mode: null};*/

	vm.columnLayouts = []
	vm.commonLayouts = []

	vm.readyStatus = { columnLayouts: false, commonLayouts: false }

	const getColumnLayouts = function () {
		vm.readyStatus.columnLayouts = false
		vm.columnLayouts = []

		return new Promise((resolve, reject) => {
			uiService
				.getColumnSortDataList({
					filters: {
						is_common: false,
						column_key: vm.column.key,
					},
				})
				.then(function (data) {
					if (data.results.length) {
						vm.columnLayouts = data.results
					}

					vm.readyStatus.columnLayouts = true

					// $scope.$apply();
					resolve()
				})
				.catch((e) => reject(e))
		})
	}

	const getCommonLayouts = function () {
		vm.readyStatus.commonLayouts = false
		vm.commonLayouts = []

		return new Promise((resolve, reject) => {
			uiService
				.getColumnSortDataList({
					filters: {
						is_common: true,
					},
				})
				.then(function (data) {
					if (data.results.length) {
						vm.commonLayouts = data.results
					}

					vm.readyStatus.commonLayouts = true

					resolve()
				})
				.catch((e) => reject(e))
		})
	}

	vm.getLayouts = function () {}

	const getLayoutsByType = function (type) {
		if (type === 'column') {
			return vm.columnLayouts
		} else if (type === 'common') {
			return vm.commonLayouts
		}

		throw new Error('No layouts with type: ' + type)
	}

	vm.editManualSortingLayout = function ($event, item, layoutType) {
		$mdDialog
			.show({
				controller: 'ManualSortingSettingsDialogController as vm',
				templateUrl: 'views/dialogs/manual-sorting-settings-dialog-view.html',
				targetEvent: $event,
				multiple: true,
				locals: {
					data: {
						column: vm.column,
						item: item,
					},
					entityViewerDataService: entityViewerDataService,
				},
			})
			.then(function (res) {
				if (res.status === 'agree') {
					/*const layoutsList = getLayoutsByType(layoutType);
                    const changedLayoutIndex = layoutsList.findIndex(layout => layout.id === item.id);
                    layoutsList.splice(changedLayoutIndex, 1, res.data);*/

					/*setTimeout(function () {
                        $scope.$apply();
                    }, 0);*/

					Promise.all([getColumnLayouts(), getCommonLayouts()]).then(() => {
						$scope.$apply()
					})
				}
			})
	}

	vm.deleteManualSortingLayout = function ($event, item, layoutType) {
		$mdDialog
			.show({
				controller: 'WarningDialogController as vm',
				templateUrl: 'views/dialogs/warning-dialog-view.html',
				parent: angular.element(document.body),
				targetEvent: $event,
				preserveScope: true,
				autoWrap: true,
				multiple: true,
				skipHide: true,
				locals: {
					warning: {
						title: 'Warning',
						description:
							'Are you sure you want to delete manual sorting layout?',
					},
				},
			})
			.then(function (res) {
				if (res.status === 'agree') {
					uiService.deleteColumnSortData(item.id).then(function (data) {
						/*vm.getColumnLayouts();
                          vm.getCommonLayouts();*/

						let layoutsList = getLayoutsByType(layoutType)

						const index = layoutsList.findIndex(
							(layout) => layout.id === item.id
						)

						layoutsList.splice(index, 1)

						toastNotificationService.success(
							`Manual sorting layout '${item.name}' deleted.`
						)

						$scope.$apply()
					})
				}
			})
	}

	vm.createManualSortingLayout = function ($event) {
		$mdDialog
			.show({
				controller: 'ManualSortingSettingsDialogController as vm',
				templateUrl: 'views/dialogs/manual-sorting-settings-dialog-view.html',
				targetEvent: $event,
				multiple: true,
				locals: {
					data: {
						column: vm.column,
					},
					entityViewerDataService: entityViewerDataService,
				},
			})
			.then(function (res) {
				if (res.status === 'agree') {
					if (res.data.is_common) {
						vm.commonLayouts.unshift(res.data)
					} else {
						vm.columnLayouts.unshift(res.data)
					}

					setTimeout(function () {
						$scope.$apply()
					}, 0)
				}
			})
	}

	vm.applyManualSortingLayout = function ($event, item) {
		vm.column.options.sort_settings.mode = 'manual'
		vm.column.options.sort_settings.layout_user_code = item.user_code
	}

	vm.clearManualSortingLayout = function ($event, item) {
		vm.column.options.sort_settings.layout_user_code = null
	}

	vm.newSortingNotAvailable = function () {
		return (
			!vm.column.options.sort_settings.layout_user_code ||
			objectComparisonHelper.areObjectsTheSame(
				vm.column.options.sort_settings,
				originalSortSettings
			)
		)
	}

	vm.agree = function ($event) {
		const resData = {
			sort_settings: vm.column.options.sort_settings,
		}

		if (!resData.sort_settings.layout_user_code)
			resData.sort_settings.mode = 'native'

		$mdDialog.hide({ status: 'agree', data: resData })
	}

	vm.cancel = function () {
		$mdDialog.hide({ status: 'disagree' })
	}

	vm.init = function () {
		Promise.all([getColumnLayouts(), getCommonLayouts()]).then(() => {
			$scope.$apply()
		})
	}

	vm.init()
}
