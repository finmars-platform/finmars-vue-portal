import evEvents from '../../services/entityViewerEvents'

export default function () {
	return {
		restrict: 'E',
		scope: {
			evDataService: '=',
			evEventService: '=',
			contentWrapElement: '=',
		},
		templateUrl: 'views/directives/groupTable/g-rows-bulk-actions-view.html',
		controller: [
			'$scope',
			function gFiltersController($scope) {

				let vm = this;

				$scope.isReport = $scope.evDataService.isEntityReport();

				$scope.selectedRowsCount = 0;
				const selectedRowsActionBlockElement = $scope.contentWrapElement.querySelector('.activeRowsActions');

				const countSelectedRows = rowsList => {

					let count = 0;

					rowsList.forEach(rowData => {

						//# region For report viewer
						const isSubtotalSelected = rowData.___level !== 0 && (rowData.___is_area_subtotal_activated || rowData.___is_line_subtotal_activated);

						if (isSubtotalSelected) {
							count++;
						}
						//# endregions

						/*if (rowData.results) {
                            rowData.results.forEach(obj => {
                                const isObjSelected = obj.id && obj.___is_activated
                                if (isObjSelected) {
                                    count++;
                                }
                            })
                        }*/
						if (rowData.___type === 'object' && rowData.___is_activated) {
							count++;
						}

					});

					return count;
				};

				/* const clearAllRowsSelection = () => {

					const dataList = $scope.evDataService.getDataAsList();

					dataList.forEach(function (item) {

						item.___is_activated = false;
						item.___is_area_subtotal_activated = false;
						item.___is_line_subtotal_activated = false;

						if (item.results && item.results.length) {

							item.results.forEach(function (childItem) {

								childItem.___is_activated = false

							});

						}

					});

					$scope.evDataService.setSelectAllRowsState(false);
					$scope.evDataService.setAllData(dataList);

					$scope.evEventService.dispatchEvent(evEvents.REDRAW_TABLE);
					$scope.evEventService.dispatchEvent(evEvents.ROW_ACTIVATION_CHANGE);

				}; */

				$scope.closeSelectedRowsActions = function () {

					// $scope.selectedRowsCount = 0;
					// clearAllRowsSelection();
					selectedRowsActionBlockElement.classList.add('display-none');

				};

				const init = function () {

					$scope.evEventService.addEventListener(evEvents.ROW_ACTIVATION_CHANGE, function () {

						const allData = $scope.evDataService.getDataAsList();
						$scope.selectedRowsCount = countSelectedRows(allData);

						if ($scope.selectedRowsCount > 1) {

							selectedRowsActionBlockElement.classList.remove('display-none');
							setTimeout(() => $scope.$apply());

						} else {
							$scope.closeSelectedRowsActions();
						}

					});

					$scope.evEventService.addEventListener(evEvents.HIDE_BULK_ACTIONS_AREA, $scope.closeSelectedRowsActions);

					$scope.evEventService.addEventListener(evEvents.DATA_LOAD_START, $scope.closeSelectedRowsActions);
				};

				init();

			},
		],
	}
}
