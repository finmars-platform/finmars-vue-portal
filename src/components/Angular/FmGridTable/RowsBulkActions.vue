<template>
	<div class="active-rows-actions display-none activeRowsActions">
		<div class="active-row-actions-wrapper">
			<div class="selected-rows-count">
				<span>{{ $scope.selectedRowsCount }}</span>
				<span>selected</span>
			</div>

			<div class="active-row-actions-container">
				<div v-if="!$scope.isReport">
					<!-- <g-ev-rows-bulk-actions
						v-bind:="evDataService"
						ev-event-service="evEventService"
					></g-ev-rows-bulk-actions> -->

					<div class="ev-active-row-actions">
						<div class="selector-popup popup-menu">
							<md-button
								ng-repeat="option in popupData.options"
								ng-click="popupData.selectOption(option, _$popup, $event)"
								class="popup-menu-item"
							>
								<div
									class="material-icons selected-icon"
									ng-class="{'visibility-hidden': !option.isActive}"
								>
									done
								</div>
								<div ng-bind="option.name"></div>
							</md-button>
						</div>

						<md-button
							custom-popup
							popup-template-url="'views/popups/selector-popup-view.html'"
							popup-data="popupData"
							open-on="click"
							position-relative-to="element"
							close-on-click-outside="closeOnClickOutside"
							style="margin: 0 0 0 20px"
							class="selector-btn"
						>
							Bulk actions
							<span class="arrow_downward-icon material-icons"
								>arrow_drop_down</span
							>
						</md-button>
					</div>
				</div>
			</div>
		</div>

		<button class="close-button" @click="$scope.closeSelectedRowsActions()">
			<span class="material-icons">close</span>
		</button>
	</div>
</template>

<script setup>
	import evEvents from '@/angular/services/entityViewerEvents'

	const props = defineProps(['contentWrapElement'])
	const { evEventService, evDataService } = inject('ngDependace')

	let vm = reactive({})
	let $scope = reactive({ contentWrapElement: props.contentWrapElement })

	$scope.isReport = evDataService.isEntityReport()

	$scope.selectedRowsCount = 0
	let selectedRowsActionBlockElement

	const countSelectedRows = (tree) => {
		let count = 0

		tree.forEach((subtotal) => {
			const isSubtotalSelected =
				subtotal.___level !== 0 &&
				(subtotal.___is_area_subtotal_activated ||
					subtotal.___is_line_subtotal_activated)

			if (isSubtotalSelected) {
				count++
			}

			if (subtotal.results) {
				subtotal.results.forEach((obj) => {
					const isObjSelected = obj.id && obj.___is_activated
					if (isObjSelected) {
						count++
					}
				})
			}
		})

		return count
	}

	$scope.closeSelectedRowsActions = function () {
		// $scope.selectedRowsCount = 0;
		// clearAllRowsSelection();
		selectedRowsActionBlockElement.classList.add('display-none')
	}

	const init = function () {
		evEventService.addEventListener(
			evEvents.ROW_ACTIVATION_CHANGE,
			function () {
				const allData = evDataService.getDataAsList()
				$scope.selectedRowsCount = countSelectedRows(allData)

				if ($scope.selectedRowsCount > 1) {
					selectedRowsActionBlockElement.classList.remove('display-none')
				} else {
					selectedRowsActionBlockElement.classList.add('display-none')
				}
			}
		)

		evEventService.addEventListener(
			evEvents.HIDE_BULK_ACTIONS_AREA,
			function () {
				selectedRowsActionBlockElement.classList.add('display-none')
			}
		)
	}

	onMounted(() => {
		selectedRowsActionBlockElement =
			$scope.contentWrapElement.querySelector('.activeRowsActions')
		init()
	})
</script>

<style lang="scss" scoped></style>
