<template>
	<div
		class="fm_container ev_toolbar g-filters-holder"
	>
		<div
			class="g-filter-left-part gFiltersLeftPart"
			:class="{ 'no-ev-g-filter-switch': !scope.thereAreFrontendFilters }"
		>
			<template v-if="scope.isReport">
				<FmMenu>
					<template #btn>
						<FmIcon
							class="add_ev_btn"
							btnPrimary
							icon="add"
							v-fm-tooltip="'Add'"
						/>
					</template>

					<template #default="{ close }">
						<div class="fm_list" @click="close()">
							<div
								v-for="item in scope.addMenu.data.menu.root.items"
								class="fm_list_item"
								@click="scope.dispatchAddMenuAction($event, item)"
							>
								{{ item.name }}
							</div>
						</div>
					</template>
				</FmMenu>

				<FmIcon
					btn
					icon="link"
					color="primary"
					class="g-toggle-filters-btn md-icon-button chain-button"
					:class="{
						'g-use-from-above-filters-hidden': !scope.showUseFromAboveFilters,
					}"
					style="margin-left: 10px"
					@click="scope.toggleUseFromAboveFilters()"
				/>
			</template>

			<template v-if="!scope.isReport">
				<FmIcon
					v-if="
						scope.entityType != 'instrument' &&
						scope.entityType != 'instrument-type' &&
						scope.entityType != 'account-type' &&
						scope.entityType != 'transaction-type'
					"
					btnPrimary
					icon="add"
					class="g-filter-settings-big-left-btn"
					:class="{
						'g-use-from-above-filters-hidden': !scope.showUseFromAboveFilters,
					}"
					v-fm-tooltip="'ADD ' + evGetEntityNameByState()"
					@click="evAddEntity"
				/>

				<!-- <md-menu v-if="scope.entityType == 'instrument'">
					<md-button
						class="g-filter-settings-big-left-btn md-icon-button primary-button rounded"
						@click="$mdOpenMenu($event)"
					>
						<span class="material-icons">add</span>
						<md-tooltip md-direction="top"
							>ADD {{ evGetEntityNameByState() }}</md-tooltip
						>
					</md-button>

					<md-menu-content width="4">
						<md-menu-item>
							<md-button
								@click="evAddEntity($event)"
								class="g-settings-option-btn"
							>
								<span>Add Blank</span>
							</md-button>
						</md-menu-item>
						<md-menu-item>
							<md-button
								@click="openTransactionTypeDialog($event)"
								class="g-settings-option-btn"
							>
								<span>Add Typical</span>
							</md-button>
						</md-menu-item>
						<md-menu-item>
							<md-button
								@click="openSimpleImportDialog($event)"
								class="g-settings-option-btn"
							>
								<span>Import from File</span>
							</md-button>
						</md-menu-item>
						<md-menu-item>
							<md-button
								@click="addFromProvider($event)"
								class="g-settings-option-btn"
							>
								<span>Get From Provider</span>
							</md-button>
						</md-menu-item>
					</md-menu-content>
				</md-menu> -->

				<FmMenu v-if="scope.entityType == 'instrument'">
					<template #btn>
						<FmIcon
							class="add_ev_btn"
							btnPrimary
							icon="add"
							@click="$mdOpenMenu($event)"
							v-fm-tooltip="'ADD ' + evGetEntityNameByState()"
						/>
					</template>

					<template #default="{ close }">
						<div class="fm_list" @click="close()">
							<div class="fm_list_item" @click="evAddEntity($event)">
								Add Blank
							</div>
							<div
								class="fm_list_item"
								@click="openTransactionTypeDialog($event)"
							>
								Add Typical
							</div>
							<div class="fm_list_item" @click="openSimpleImportDialog($event)">
								Import from File
							</div>
							<div class="fm_list_item" @click="addFromProvider($event)">
								Get From Provider
							</div>
						</div>
					</template>
				</FmMenu>

				<!-- <md-menu v-if="scope.entityType == 'instrument-type'">
					<md-button
						class="g-filter-settings-big-left-btn md-icon-button primary-button rounded"
						@click="$mdOpenMenu($event)"
					>
						<span class="material-icons">add</span>
						<md-tooltip md-direction="top"
							>ADD {{ evGetEntityNameByState() }}</md-tooltip
						>
					</md-button>

					<md-menu-content width="4">
						<md-menu-item>
							<md-button
								@click="evAddEntity($event)"
								class="g-settings-option-btn"
							>
								<span>Add Blank</span>
							</md-button>
						</md-menu-item>
						<md-menu-item>
							<md-button
								class="md-raised"
								package-manager-button
								content-type="'instruments.instrumenttype'"
							>
								Select from List
							</md-button>
						</md-menu-item>
					</md-menu-content>
				</md-menu> -->

				<FmMenu v-if="scope.entityType == 'instrument-type'">
					<template #btn>
						<FmIcon
							class="add_ev_btn"
							btnPrimary
							icon="add"
							@click="$mdOpenMenu($event)"
							v-fm-tooltip="'ADD ' + evGetEntityNameByState()"
						/>
					</template>

					<template #default="{ close }">
						<div class="fm_list" @click="close()">
							<div class="fm_list_item" @click="evAddEntity($event)">
								Add Blank
							</div>
							<div
								class="fm_list_item"
								@click="openTransactionTypeDialog($event)"
							>
								Select from List
							</div>
						</div>
					</template>
				</FmMenu>
				<!-- <md-menu v-if="scope.entityType == 'account-type'">
					<md-button
						class="g-filter-settings-big-left-btn md-icon-button primary-button rounded"
						@click="$mdOpenMenu($event)"
					>
						<span class="material-icons">add</span>
						<md-tooltip md-direction="top"
							>ADD {{ evGetEntityNameByState() }}</md-tooltip
						>
					</md-button>

					<md-menu-content width="4">
						<md-menu-item>
							<md-button
								@click="evAddEntity($event)"
								class="g-settings-option-btn"
							>
								<span>Add Blank</span>
							</md-button>
						</md-menu-item>
						<md-menu-item>
							<md-button
								class="md-raised"
								package-manager-button
								content-type="'accounts.accounttype'"
							>
								Select from List
							</md-button>
						</md-menu-item>
					</md-menu-content>
				</md-menu> -->
				<FmMenu v-if="scope.entityType == 'account-type'">
					<template #btn>
						<FmIcon
							class="add_ev_btn"
							btnPrimary
							icon="add"
							@click="$mdOpenMenu($event)"
							v-fm-tooltip="'ADD ' + evGetEntityNameByState()"
						/>
					</template>

					<template #default="{ close }">
						<div class="fm_list" @click="close()">
							<div class="fm_list_item" @click="evAddEntity($event)">
								Add Blank
							</div>
							<div
								class="fm_list_item md-raised"
								package-manager-button
								content-type="'accounts.accounttype'"
							>
								Select from List
							</div>
						</div>
					</template>
				</FmMenu>
				<!-- <md-menu v-if="scope.entityType == 'transaction-type'">
					<md-button
						class="g-filter-settings-big-left-btn md-icon-button primary-button rounded"
						@click="$mdOpenMenu($event)"
					>
						<span class="material-icons">add</span>
						<md-tooltip md-direction="top"
							>ADD {{ evGetEntityNameByState() }}</md-tooltip
						>
					</md-button>

					<md-menu-content width="4">
						<md-menu-item>
							<md-button
								@click="evAddEntity($event)"
								class="g-settings-option-btn"
							>
								<span>Add Blank</span>
							</md-button>
						</md-menu-item>
						<md-menu-item>
							<md-button
								class="md-raised"
								package-manager-button
								content-type="'transactions.transactiontype'"
							>
								Select from List
							</md-button>
						</md-menu-item>
					</md-menu-content>
				</md-menu> -->

				<FmMenu v-if="scope.entityType == 'transaction-type'">
					<template #btn>
						<FmIcon
							class="add_ev_btn"
							btnPrimary
							icon="add"
							@click="$mdOpenMenu($event)"
							v-fm-tooltip="'ADD ' + evGetEntityNameByState()"
						/>
					</template>

					<template #default="{ close }">
						<div class="fm_list" @click="close()">
							<div class="fm_list_item" @click="evAddEntity($event)">
								Add Blank
							</div>
							<div
								class="fm_list_item md-raised"
								package-manager-button
								content-type="'transactions.transactiontype'"
							>
								Select from List
							</div>
						</div>
					</template>
				</FmMenu>

				<!-- <md-button
					v-if="scope.thereAreFrontendFilters"
					class="g-toggle-filters-btn md-icon-button"
					@click="toggleFiltersToShow()"
				>
					<span
						v-show="scope.shownFiltersType === 'frontend'"
						class="material-icons"
						>laptop_mac</span
					>
					<span
						v-show="scope.shownFiltersType === 'backend'"
						class="material-icons"
						>dns</span
					>
				</md-button> -->
				<FmBtn
					v-if="scope.thereAreFrontendFilters"
					type="text"
					class="g-toggle-filters-btn"
					@click="toggleFiltersToShow()"
				>
					<span
						v-show="scope.shownFiltersType == 'frontend'"
						class="material-icons"
					>laptop_mac</span
					>
					<span
						v-show="scope.shownFiltersType == 'backend'"
						class="material-icons"
					>dns</span
					>
				</FmBtn>
			</template>
		</div>
		<!--СustomPopupDirective.vue-->
		<div class="gFiltersContainer flex aic fww">
			<!-- <rv-filter
               on-cancel="cancel()"
               on-save="save()"> -->

			<AngularFmGridTableRvFilterPopup
				v-if="scope.popupData.filterKey"
				:filterKey="scope.popupData.filterKey"
				:popupEventService="scope.popupEventService"
				:popupData="scope.popupData"
				:vm="vm"
				:gFiltersHelper="scope.gFiltersHelper"
				@close="scope.popupData.filterKey = null"
			/>

			<FmChips
				v-if="scope.readyStatus.filters"
				class="g-filter-chips"
				:items="scope.filtersChips"
				canDelete
				@chipClick="scope.onFilterChipClick($event)"
				@delete="scope.removeFilter($event)"
			>
				<FmBtn type="action" @click="scope.addFilter" style="margin: 2px 0"
				>ADD FILTER</FmBtn
				>
			</FmChips>
		</div>

		<div class="flex aic gFiltersRightPart">
			<FmIcon
				icon="refresh"
				@click="scope.refreshTable()"
				v-fm-tooltip="'Refresh Database Filters'"
				btn
			/>

			<FmMenu v-if="scope.isRootEntityViewer">
				<template #btn>
					<FmIcon btn icon="view_stream" v-fm-tooltip="'Split'" />
				</template>

				<template #default="{ close }">
					<div class="fm_list" @click="close()">
						<div
							v-if="
								!scope.isReport && scope.entityType !== 'complex-transaction'
							"
							class="fm_list_item g-settings-option-btn"
							@click="toggleSplitPanel($event, 'permission-editor')"
						>
							<FmIcon
								:style="{
									opacity:
										scope.currentAdditions?.type == 'permission-editor' ? 1 : 0,
								}"
								icon="done"
							/>
							<span>Open permission editor</span>
						</div>

						<div
							v-if="!scope.isReport"
							class="fm_list_item g-settings-option-btn"
							@click="toggleSplitPanel($event, 'editor')"
						>
							<FmIcon
								:style="{
									opacity: scope.currentAdditions?.type == 'editor' ? 1 : 0,
								}"
								icon="done"
							/>

							<span>Open editor split panel</span>
						</div>

						<md-menu-item v-if="scope.isReport">
							<md-button
								@click="toggleSplitPanel($event, 'balance-report')"
								class="g-settings-option-btn"
							>
								<span
									class="material-icons"
									v-show="scope.currentAdditions?.type === 'balance-report'"
								>done</span
								>
								<span
									class="material-icons"
									v-show="scope.currentAdditions?.type !== 'balance-report'"
									style="visibility: hidden"
								>done</span
								>

								<span>Open Balance Report view panel</span>
							</md-button>
						</md-menu-item>

						<md-menu-item v-if="scope.isReport">
							<md-button
								@click="toggleSplitPanel($event, 'pl-report')"
								class="g-settings-option-btn"
							>
								<span
									class="material-icons"
									v-show="scope.currentAdditions?.type === 'pl-report'"
								>done</span
								>
								<span
									class="material-icons"
									v-show="scope.currentAdditions?.type !== 'pl-report'"
									style="visibility: hidden"
								>done</span
								>

								<span>Open P&L Report view panel</span>
							</md-button>
						</md-menu-item>

						<md-menu-item v-if="scope.isReport">
							<md-button
								@click="toggleSplitPanel($event, 'transaction-report')"
								class="g-settings-option-btn"
							>
								<span
									class="material-icons"
									v-show="scope.currentAdditions?.type === 'transaction-report'"
								>done</span
								>
								<span
									class="material-icons"
									v-show="scope.currentAdditions?.type !== 'transaction-report'"
									style="visibility: hidden"
								>done</span
								>

								<span>Open Transaction Report view panel</span>
							</md-button>
						</md-menu-item>
					</div>
				</template>
			</FmMenu>

			<FmMenu v-if="scope.isRootEntityViewer && scope.isReport">
				<template #btn>
					<FmIcon btn icon="view_module" v-fm-tooltip="'Matrix'" />
				</template>

				<template #default="{ close }">
					<div class="fm_list" @click="close()">
						<div class="fm_list_item" @click="scope.toggleMatrix">
							<FmIcon
								v-show="scope.currentAdditions?.type === 'permission-editor'"
								icon="matrix"
							/>
							<span>Open Matrix</span>
						</div>
					</div>
				</template>
			</FmMenu>

			<FmMenu>
				<template #btn>
					<FmIcon btn icon="upgrade" v-fm-tooltip="'Export'" />
				</template>

				<template #default="{ close }">
					<div class="fm_list" @click="close()">
						<div
							class="fm_list_item"
							v-if="scope.isReport"
							@click="exportAsPdf"
						>
							Export to PDF
						</div>

						<div class="fm_list_item" @click="exportAsCSV">Export to CSV</div>

						<div class="fm_list_item" @click="exportAsExcel">
							Export to Excel
						</div>

						<div class="fm_list_item" @click="copyReport">
							Copy all to buffer
						</div>

						<div class="fm_list_item" @click="copySelectedToBuffer">
							Copy selected to buffer
						</div>
					</div>
				</template>
			</FmMenu>

			<FmMenu>
				<template #btn>
					<FmIcon btn icon="more_vert" v-fm-tooltip="'More'" />
				</template>

				<template #default="{ close }">
					<div class="fm_list" @click="close()">
						<div class="fm_list_item" @click="openViewConstructor">
							View Constructor
						</div>

						<div
							class="fm_list_item"
							v-if="scope.entityType !== 'complex-transaction'"
							@click="openCustomFieldsManager"
						>
							Custom Columns
						</div>

						<!--						<div
													class="fm_list_item"
													v-if="scope.isReport"
													@click="toggleAutoRefresh"
												>
													<span v-if="scope.rvAutoRefresh">Disable Auto Refresh</span>
													<span v-if="!scope.rvAutoRefresh">Enable Auto Refresh</span>
												</div>-->

						<div
							class="fm_list_item"
							v-if="!scope.isReport"
							@click="openInputFormEditor"
						>
							Edit form
						</div>
					</div>
				</template>
			</FmMenu>
		</div>

		<AngularFmGridTableMatrixSettingsM
			v-if="$mdDialog.modals['ReportViewerMatrixSettingsDialogController']"
			:payload="$mdDialog.modals['ReportViewerMatrixSettingsDialogController']"
			:modelValue="true"
		/>
	</div>
</template>

<script setup>

</script>

<style scoped lang="scss">

</style>
