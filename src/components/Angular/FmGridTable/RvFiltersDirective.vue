<template>
	<div
		class="g-filters-holder width-100 flex-row fc-space-between flex-i-start"
		ng-class="{'hide-ev-front-filters': !isReport && thereAreFrontendFilters && shownFiltersType === 'frontend'}"
		xmlns="http://www.w3.org/1999/html"
	>
		<div class="flex-row flex-i-start">
			<div
				class="g-filter-left-part gFiltersLeftPart"
				:class="{ 'no-ev-g-filter-switch': !thereAreFrontendFilters }"
			>
				<div v-if="isReport" layout="row">
					<!--<md-button class="g-filter-settings-big-left-btn md-icon-button primary-button rounded"
										 ng-click="calculateReport()">
							<span class="material-icons">refresh</span>
							<md-tooltip md-direction="top">Calculate</md-tooltip>
					</md-button>-->
					<!--					<md-menu>-->
					<!--						<md-button class="g-filter-settings-big-left-btn md-icon-button primary-button rounded"-->
					<!--											 @click="$mdOpenMenu($event)">-->
					<!--							<span class="material-icons">add</span>-->
					<!--							<md-tooltip md-direction="top">Add</md-tooltip>-->
					<!--						</md-button>-->

					<!--						<md-menu-content width="4">-->
					<!--							<md-menu-item v-for="item in addMenu.data.menu.root.items">-->
					<!--								<md-button @click="dispatchAddMenuAction($event, item)"-->
					<!--													 class="g-settings-option-btn">-->
					<!--									<span>{{item.name}}</span>-->
					<!--								</md-button>-->
					<!--							</md-menu-item>-->

					<!--						</md-menu-content>-->
					<!--					</md-menu>-->

					<FmMenu>
						<template #btn>
							<FmIcon
								v-fm-tooltip="'Add'"
								class="g-filter-settings-big-left-btn"
								btn-primary
								icon="add"
							/>
						</template>

						<template #default="{ close }">
							<div
								class="fm_list"
								@click="close()"
							>
								<div
									v-for="item in addMenu.data.menu.root.items"
									class="fm_list_item"
									@click="dispatchAddMenuAction($event, item)"
								>
									{{ item.name }}
								</div>
							</div>
						</template>
					</FmMenu>

					<!--					<md-button-->
					<!--						class="g-toggle-filters-btn md-icon-button chain-button"-->
					<!--						:class="{'g-use-from-above-filters-hidden': !showUseFromAboveFilters}"-->
					<!--						@click="toggleUseFromAboveFilters()"-->
					<!--					>-->
					<!--						<span class="material-icons">link</span>-->
					<!--					</md-button>-->

					<template #btn>
						<FmIcon
							v-fm-tooltip="'Add'"
							class="g-toggle-filters-btn chain-button"
							:class="{'g-use-from-above-filters-hidden': !showUseFromAboveFilters}"
							btn-primary
							icon="link"
							@click="toggleUseFromAboveFilters()"
						/>
					</template>
				</div>

				<div
					v-if="!isReport"
					layout="row"
				>
					<!--					<md-button-->
					<!--						v-if="entityType != 'instrument' && entityType != 'instrument-type' && entityType != 'account-type' && entityType != 'transaction-type'"-->
					<!--						class="g-filter-settings-big-left-btn md-icon-button primary-button rounded"-->
					<!--						@click="evAddEntity($event)"-->
					<!--					>-->

					<!--						<span class="material-icons">add</span>-->
					<!--						<md-tooltip md-direction="top">-->
					<!--							ADD {{ evGetEntityNameByState() }}-->
					<!--						</md-tooltip>-->
					<!--					</md-button>-->

					<template #btn>
						<FmIcon
							v-if="entityType != 'instrument' && entityType != 'instrument-type' && entityType != 'account-type' && entityType != 'transaction-type'"
							v-fm-tooltip="'ADD ' + evGetEntityNameByState()"
							class="g-filter-settings-big-left-btn primary-button rounded"
							btn-primary
							icon="add"
							@click="evAddEntity($event)"
						/>
					</template>


<!--					<md-menu v-if="entityType == 'instrument'">-->
<!--						<md-button-->
<!--							class="g-filter-settings-big-left-btn md-icon-button primary-button rounded"-->
<!--							@click="$mdOpenMenu($event)"-->
<!--						>-->
<!--							<span class="material-icons">add</span>-->
<!--							<md-tooltip md-direction="top">-->
<!--								ADD {{ evGetEntityNameByState() }}-->
<!--							</md-tooltip>-->
<!--						</md-button>-->

<!--						<md-menu-content width="4">-->
<!--							<md-menu-item>-->
<!--								<md-button-->
<!--									class="g-settings-option-btn"-->
<!--									@click="evAddEntity($event)"-->
<!--								>-->
<!--									<span>Add Blank</span>-->
<!--								</md-button>-->
<!--							</md-menu-item>-->
<!--							<md-menu-item>-->
<!--								<md-button-->
<!--									class="g-settings-option-btn"-->
<!--									@click="openTransactionTypeDialog($event)"-->
<!--								>-->
<!--									<span>Add Typical</span>-->
<!--								</md-button>-->
<!--							</md-menu-item>-->
<!--							<md-menu-item>-->
<!--								<md-button-->
<!--									class="g-settings-option-btn"-->
<!--									@click="openSimpleImportDialog($event)"-->
<!--								>-->
<!--									<span>Import from File</span>-->
<!--								</md-button>-->
<!--							</md-menu-item>-->
<!--							<md-menu-item>-->
<!--								<md-button-->
<!--									class="g-settings-option-btn"-->
<!--									@click="addFromProvider($event)"-->
<!--								>-->
<!--									<span>Get From Provider</span>-->
<!--								</md-button>-->
<!--							</md-menu-item>-->
<!--						</md-menu-content>-->
<!--					</md-menu>-->



					<FmMenu v-if="entityType == 'instrument'">
						<template #btn>
							<FmIcon
								class="g-filter-settings-big-left-btn  primary-button rounded"
								btn-primary
								icon="add"
								@click="$mdOpenMenu($event)"
								v-fm-tooltip="'ADD ' + evGetEntityNameByState()"

							/>
						</template>

						<template #default="{ close }">
									<template #btn>
										<FmIcon
											btn-primary
											icon="link"
											class="g-settings-option-btn"
											@click="evAddEntity($event)">
											<span>Add Blank</span>
										/>
									</template>
							<template #btn>
								<FmIcon
									btn-primary
									icon="link"
									class="g-settings-option-btn"
									@click="openTransactionTypeDialog($event)"
								>
									<span>Add Typical</span>
									/>
							</template>
							<template #btn>
								<FmIcon
									btn-primary
									icon="link"
									class="g-settings-option-btn"
									@click="openSimpleImportDialog($event)"
								>
									<span>Import from File</span>
									/>
							</template>
							<template #btn>
								<FmIcon
									btn-primary
									icon="link"
									class="g-settings-option-btn"
									@click="addFromProvider($event)"
								>
									<span>Get From Provider</span>
									/>
							</template>

						</template>
					</FmMenu>





<!--					<md-menu v-if="entityType == 'instrument-type'">-->
<!--						<md-button-->
<!--							class="g-filter-settings-big-left-btn md-icon-button primary-button rounded"-->
<!--							@click="$mdOpenMenu($event)"-->
<!--						>-->
<!--							<span class="material-icons">add</span>-->
<!--							<md-tooltip md-direction="top">-->
<!--								ADD {{ evGetEntityNameByState() }}-->
<!--							</md-tooltip>-->
<!--						</md-button>-->

<!--						<md-menu-content width="4">-->
<!--							<md-menu-item>-->
<!--								<md-button-->
<!--									class="g-settings-option-btn"-->
<!--									@click="evAddEntity($event)"-->
<!--								>-->
<!--									<span>Add Blank</span>-->
<!--								</md-button>-->
<!--							</md-menu-item>-->
<!--							<md-menu-item>-->
<!--								<md-button-->
<!--									class="md-raised"-->
<!--									package-manager-button-->
<!--									content-type="'instruments.instrumenttype'"-->
<!--								>-->
<!--									Select from List-->
<!--								</md-button>-->
<!--							</md-menu-item>-->
<!--						</md-menu-content>-->
<!--					</md-menu>-->

					<FmMenu  v-if="entityType == 'instrument-type'">
						<template #btn>
							<FmIcon
								class="g-filter-settings-big-left-btn  primary-button rounded"
								btn-primary
								icon="add"
								@click="$mdOpenMenu($event)"
								v-fm-tooltip="'ADD ' + evGetEntityNameByState()"

							/>
						</template>

						<template #default="{ close }">
							<template #btn>
								<FmIcon
									btn-primary
									icon="link"
									class="g-settings-option-btn"
									@click="evAddEntity($event)"
								>
									<span>Add Blank</span>
									/>
							</template>
							<template #btn>
								<FmIcon
									btn-primary
									icon="link"
									class="g-settings-option-btn"
									content-type="'instruments.instrumenttype'"
									@click="openTransactionTypeDialog($event)"
								>
									Select from List
									/>
							</template>

						</template>
					</FmMenu>

<!--					<md-menu v-if="entityType == 'account-type'">-->
<!--						<md-button-->
<!--							class="g-filter-settings-big-left-btn md-icon-button primary-button rounded"-->
<!--							@click="$mdOpenMenu($event)"-->
<!--						>-->
<!--							<span class="material-icons">add</span>-->
<!--							<md-tooltip md-direction="top">-->
<!--								ADD {{ evGetEntityNameByState() }}-->
<!--							</md-tooltip>-->
<!--						</md-button>-->

<!--						<md-menu-content width="4">-->
<!--							<md-menu-item>-->
<!--								<md-button-->
<!--									class="g-settings-option-btn"-->
<!--									@click="evAddEntity($event)"-->
<!--								>-->
<!--									<span>Add Blank</span>-->
<!--								</md-button>-->
<!--							</md-menu-item>-->
<!--							<md-menu-item>-->
<!--								<md-button-->
<!--									class="md-raised"-->
<!--									package-manager-button-->
<!--									content-type="'accounts.accounttype'"-->
<!--								>-->
<!--									Select from List-->
<!--								</md-button>-->
<!--							</md-menu-item>-->
<!--						</md-menu-content>-->
<!--					</md-menu>-->

					<FmMenu  v-if="entityType == 'account-type'">
						<template #btn>
							<FmIcon
								class="g-filter-settings-big-left-btn  primary-button rounded"
								btn-primary
								icon="add"
								@click="$mdOpenMenu($event)"
								v-fm-tooltip="'ADD ' + evGetEntityNameByState()"

							/>
						</template>

						<template #default="{ close }">
							<template #btn>
								<FmIcon
									btn-primary
									icon="link"
									class="g-settings-option-btn"
									@click="evAddEntity($event)"
								>
									<span>Add Blank</span>
									/>
							</template>
							<template #btn>
								<FmIcon
									btn-primary
									icon="link"
									class="g-settings-option-btn"
									content-type="'accounts.accounttype'"
									@click="openTransactionTypeDialog($event)"
								>
									Select from List
									/>
							</template>

						</template>
					</FmMenu>
					<md-menu v-if="entityType == 'transaction-type'">
						<md-button
							class="g-filter-settings-big-left-btn md-icon-button primary-button rounded"
							@click="$mdOpenMenu($event)"
						>
							<span class="material-icons">add</span>
							<md-tooltip md-direction="top">
								ADD {{ evGetEntityNameByState() }}
							</md-tooltip>
						</md-button>

						<md-menu-content width="4">
							<md-menu-item>
								<md-button
									class="g-settings-option-btn"
									@click="evAddEntity($event)"
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
					</md-menu>

					<FmMenu  v-if="entityType == 'transaction-type'">
						<template #btn>
							<FmIcon
								class="g-filter-settings-big-left-btn  primary-button rounded"
								btn-primary
								icon="add"
								@click="$mdOpenMenu($event)"
								v-fm-tooltip="'ADD ' + evGetEntityNameByState()"

							/>
						</template>

						<template #default="{ close }">
							<template #btn>
								<FmIcon
									btn-primary
									icon="link"
									class="g-settings-option-btn"
									@click="evAddEntity($event)"
								>
									<span>Add Blank</span>
									/>
							</template>
							<template #btn>
								<FmIcon
									btn-primary
									icon="link"
									class="g-settings-option-btn"
									content-type="'transactions.transactiontype'"
								>
									<!--									@click="openTransactionTypeDialog($event)"-->

									Select from List
									/>
							</template>

						</template>
					</FmMenu>
<!--					<md-button-->
<!--						v-if="thereAreFrontendFilters"-->
<!--						class="g-toggle-filters-btn md-icon-button"-->
<!--						@click="toggleFiltersToShow()"-->
<!--					>-->
<!--						<span-->
<!--							v-show="shownFiltersType === 'frontend'"-->
<!--							class="material-icons"-->
<!--						>laptop_mac</span>-->
<!--						<span-->
<!--							v-show="shownFiltersType === 'backend'"-->
<!--							class="material-icons"-->
<!--						>dns</span>-->
<!--					</md-button>-->
					<template #btn>
						<FmIcon
							v-if="thereAreFrontendFilters"
							@click="toggleFiltersToShow()"
							btn-primary
							icon="link"
							class="g-toggle-filters-btn"
							content-type="'transactions.transactiontype'"

						>
							<!--									@click="openTransactionTypeDialog($event)"-->

							<span
								v-show="shownFiltersType === 'frontend'"
							>laptop_mac</span>
							<span
								v-show="shownFiltersType === 'backend'"
							>dns</span>
							/>
					</template>
				</div>
			</div>

			<div class="gFiltersContainer">
				<!--СustomPopupDirective.vue  ChipsListDirective.vue-->
				<div v-if="readyStatus.filters">
					<div
						custom-popup
						popup-template-url="{{filterPopupTemplate}}"
						popup-data="popupData"
						popup-event-service="popupEventService"
						popup-x="popupPosX"
						popup-y="popupPosY"
						on-save="filterSettingsChange()"
						class="g-filter-chips-wrap"
					/>
<!--					<chips-list-->
<!--						chips-list="filtersChips"-->
<!--						chips-deletion="true"-->
<!--						chips-addition="ADD FILTER"-->
<!--						on-chip-click="onFilterChipClick(chipsData, event)"-->
<!--						hide-overflowing-chips="false"-->
<!--						on-chips-deletion="removeFilter(chipsData)"-->
<!--						on-add-chip-click="addFilter(event)"-->
<!--						on-first-render-ending="onChipsFirstRender()"-->
<!--						class="g-filter-chips"-->
<!--					/>-->
					<FmChips
						v-if="scope.readyStatus.filters"
						class="g-filter-chips"
						:items="filtersChips"
						canDelete
						@chipClick="scope.onFilterChipClick($event)"
						@delete="removeFilter($event)"
					/>

					<FmBtn type="action" @click="addFilter">ADD FILTER</FmBtn>

				</div>
			</div>
		</div>

<!--		<div class="icon-buttons gFiltersRightPart">-->
<!--			<md-button-->
<!--				class="signed-button"-->
<!--				@click="refreshTable()"-->
<!--			>-->
<!--				<div class="flex-column flex-i-center">-->
<!--					<span class="material-icons">refresh</span>-->
<!--					<span>Refresh</span>-->
<!--					<md-tooltip md-direction="bottom">-->
<!--						<div v-if="isReport">-->
<!--							<div v-if="reportOptions.auth_time">-->
<!--								Auth Time: {{ reportOptions.auth_time }}s</br>-->
<!--								Execution Time: {{ reportOptions.execution_time }}s</br>-->
<!--								Relation Prefetch Time: {{ reportOptions.relation_prefetch_time }}s</br>-->
<!--								Serialization Time: {{ reportOptions.serialization_time }}s </br>-->
<!--								Render Time: {{ renderTime }}s </br>-->
<!--								Rows downloaded: {{ reportOptions.items.length }} </br>-->
<!--							</div>-->
<!--							Refresh Database Filters-->
<!--						</div>-->
<!--						<div v-if="!isReport">-->
<!--							Refresh Database Filters-->
<!--						</div>-->
<!--					</md-tooltip>-->
<!--				</div>-->
<!--			</md-button>-->

<!--			<md-menu-->
<!--				v-if="isRootEntityViewer"-->
<!--				class="full-width"-->
<!--			>-->
<!--				<md-button-->
<!--					class="signed-button"-->
<!--					@click="$mdOpenMenu($event)"-->
<!--				>-->
<!--					<div class="flex-column flex-i-center">-->
<!--						<span class="material-icons">view_stream</span>-->
<!--						<span>Split</span>-->
<!--					</div>-->
<!--				</md-button>-->

<!--				<md-menu-content width="4">-->
<!--					<md-menu-item v-if="!isReport && entityType !== 'complex-transaction'">-->
<!--						<md-button-->
<!--							class="g-settings-option-btn"-->
<!--							@click="toggleSplitPanel($event, 'permission-editor')"-->
<!--						>-->
<!--							<span-->
<!--								v-show="currentAdditions.type === 'permission-editor'"-->
<!--								class="material-icons"-->
<!--							>done</span>-->
<!--							<span-->
<!--								v-show="currentAdditions.type !== 'permission-editor'"-->
<!--								class="material-icons"-->
<!--								style="visibility: hidden;"-->
<!--							>done</span>-->

<!--							<span>Open permission editor</span>-->
<!--						</md-button>-->
<!--					</md-menu-item>-->

<!--					<md-menu-item v-if="!isReport">-->
<!--						<md-button-->
<!--							class="g-settings-option-btn"-->
<!--							@click="toggleSplitPanel($event, 'editor')"-->
<!--						>-->
<!--							<span-->
<!--								v-show="currentAdditions.type === 'editor'"-->
<!--								class="material-icons"-->
<!--							>done</span>-->
<!--							<span-->
<!--								v-show="currentAdditions.type !== 'editor'"-->
<!--								class="material-icons"-->
<!--								style="visibility: hidden;"-->
<!--							>done</span>-->

<!--							<span>Open editor split panel</span>-->
<!--						</md-button>-->
<!--					</md-menu-item>-->

<!--					<md-menu-item v-if="isReport">-->
<!--						<md-button-->
<!--							class="g-settings-option-btn"-->
<!--							@click="toggleSplitPanel($event, 'balance-report')"-->
<!--						>-->
<!--							<span-->
<!--								v-show="currentAdditions.type === 'balance-report'"-->
<!--								class="material-icons"-->
<!--							>done</span>-->
<!--							<span-->
<!--								v-show="currentAdditions.type !== 'balance-report'"-->
<!--								class="material-icons"-->
<!--								style="visibility: hidden;"-->
<!--							>done</span>-->

<!--							<span>Open Balance Report view panel</span>-->
<!--						</md-button>-->
<!--					</md-menu-item>-->

<!--					<md-menu-item v-if="isReport">-->
<!--						<md-button-->
<!--							class="g-settings-option-btn"-->
<!--							@click="toggleSplitPanel($event, 'pl-report')"-->
<!--						>-->
<!--							<span-->
<!--								v-show="currentAdditions.type === 'pl-report'"-->
<!--								class="material-icons"-->
<!--							>done</span>-->
<!--							<span-->
<!--								v-show="currentAdditions.type !== 'pl-report'"-->
<!--								class="material-icons"-->
<!--								style="visibility: hidden;"-->
<!--							>done</span>-->

<!--							<span>Open P&L Report view panel</span>-->
<!--						</md-button>-->
<!--					</md-menu-item>-->

<!--					<md-menu-item v-if="isReport">-->
<!--						<md-button-->
<!--							class="g-settings-option-btn"-->
<!--							@click="toggleSplitPanel($event, 'transaction-report')"-->
<!--						>-->
<!--							<span-->
<!--								v-show="currentAdditions.type === 'transaction-report'"-->
<!--								class="material-icons"-->
<!--							>done</span>-->
<!--							<span-->
<!--								v-show="currentAdditions.type !== 'transaction-report'"-->
<!--								class="material-icons"-->
<!--								style="visibility: hidden;"-->
<!--							>done</span>-->

<!--							<span>Open Transaction Report view panel</span>-->
<!--						</md-button>-->
<!--					</md-menu-item>-->
<!--				</md-menu-content>-->
<!--			</md-menu>-->

<!--			<md-menu-->
<!--				v-if="isRootEntityViewer && isReport"-->
<!--				class="full-width"-->
<!--			>-->
<!--				<md-button-->
<!--					class="signed-button"-->
<!--					@click="$mdOpenMenu($event)"-->
<!--				>-->
<!--					<div class="flex-column flex-i-center">-->
<!--						<span class="material-icons">view_module</span>-->
<!--						<span>Matrix</span>-->
<!--					</div>-->
<!--				</md-button>-->

<!--				<md-menu-content width="4">-->
<!--					<md-menu-item>-->
<!--						<md-button-->
<!--							class="g-settings-option-btn"-->
<!--							@click="toggleMatrix($event)"-->
<!--						>-->
<!--							<span-->
<!--								v-show="viewContext === 'matrix'"-->
<!--								class="material-icons"-->
<!--							>done</span>-->
<!--							<span-->
<!--								v-show="viewContext !== 'matrix'"-->
<!--								class="material-icons"-->
<!--								style="visibility: hidden;"-->
<!--							>done</span>-->

<!--							<span>Open Matrix</span>-->
<!--						</md-button>-->
<!--					</md-menu-item>-->
<!--				</md-menu-content>-->
<!--			</md-menu>-->

<!--			<md-menu>-->
<!--				<md-button-->
<!--					class="signed-button"-->
<!--					@click="$mdOpenMenu($event)"-->
<!--				>-->
<!--					<div class="flex-column flex-i-center">-->
<!--						<span class="material-icons">upgrade</span>-->
<!--						<span>Export</span>-->
<!--					</div>-->
<!--				</md-button>-->

<!--				<md-menu-content width="4">-->
<!--					<md-menu-item v-if="isReport">-->
<!--						<md-button-->
<!--							class="g-settings-option-btn"-->
<!--							@click="exportAsPdf($event)"-->
<!--						>-->
<!--							<span>Export to PDF</span>-->
<!--						</md-button>-->
<!--					</md-menu-item>-->

<!--					<md-menu-item>-->
<!--						<md-button-->
<!--							class="g-settings-option-btn"-->
<!--							@click="exportAsCSV()"-->
<!--						>-->
<!--							<span>Export to CSV</span>-->
<!--						</md-button>-->
<!--					</md-menu-item>-->

<!--					<md-menu-item>-->
<!--						<md-button-->
<!--							class="g-settings-option-btn"-->
<!--							@click="exportAsExcel()"-->
<!--						>-->
<!--							<span>Export to Excel</span>-->
<!--						</md-button>-->
<!--					</md-menu-item>-->


<!--					<md-menu-item>-->
<!--						<md-button-->
<!--							class="g-settings-option-btn"-->
<!--							@click="copyReport()"-->
<!--						>-->
<!--							<span>Copy all to buffer</span>-->
<!--						</md-button>-->
<!--					</md-menu-item>-->
<!--					<md-menu-item>-->
<!--						<md-button-->
<!--							class="g-settings-option-btn"-->
<!--							@click="copySelectedToBuffer()"-->
<!--						>-->
<!--							<span>Copy selected to buffer</span>-->
<!--						</md-button>-->
<!--					</md-menu-item>-->
<!--				</md-menu-content>-->
<!--			</md-menu>-->

<!--			<md-menu>-->
<!--				<md-button-->
<!--					class="signed-button"-->
<!--					@click="$mdOpenMenu($event)"-->
<!--				>-->
<!--					<div class="flex-column flex-i-center">-->
<!--						<span class="material-icons">more_vert</span>-->
<!--						<span>More</span>-->
<!--					</div>-->
<!--				</md-button>-->

<!--				<md-menu-content width="4">-->
<!--					<md-menu-item>-->
<!--						<md-button-->
<!--							class="g-settings-option-btn"-->
<!--							@click="openViewConstructor($event)"-->
<!--						>-->
<!--							<span>View Constructor</span>-->
<!--						</md-button>-->
<!--					</md-menu-item>-->

<!--					<md-menu-item v-if="entityType !== 'complex-transaction'">-->
<!--						<md-button-->
<!--							class="g-settings-option-btn"-->
<!--							@click="openCustomFieldsManager($event)"-->
<!--						>-->
<!--							<span>Custom Columns</span>-->
<!--						</md-button>-->
<!--					</md-menu-item>-->

<!--					<md-menu-item v-if="isReport">-->
<!--						<md-button-->
<!--							class="g-settings-option-btn"-->
<!--							@click="toggleAutoRefresh()"-->
<!--						>-->
<!--							<span v-if="rvAutoRefresh">Disable Auto Refresh</span>-->
<!--							<span v-if="!rvAutoRefresh">Enable Auto Refresh</span>-->
<!--						</md-button>-->
<!--					</md-menu-item>-->

<!--					<md-menu-item v-if="!isReport">-->
<!--						<md-button-->
<!--							class="g-settings-option-btn"-->
<!--							@click="openInputFormEditor($event)"-->
<!--						>-->
<!--							<span>Edit form</span>-->
<!--						</md-button>-->
<!--					</md-menu-item>-->
<!--				</md-menu-content>-->
<!--			</md-menu>-->
<!--		</div>-->
		<div class="icon-buttons gFiltersRightPart">
<!--			<template #btn>-->
<!--				<FmIcon-->
<!--					class="signed-button"-->
<!--					@click="refreshTable()"-->
<!--					btn-primary-->
<!--					icon="add"-->
<!--					v-fm-tooltip="md-tooltip весь тот что ниже тут  "-->

<!--				/>-->
<!--				<span class="material-icons">refresh</span>-->
<!--				<span>Refresh</span>-->
<!--				<md-tooltip md-direction="bottom">-->
<!--					<div v-if="isReport">-->
<!--						<div v-if="reportOptions.auth_time">-->
<!--							Auth Time: {{ reportOptions.auth_time }}s</br>-->
<!--							Execution Time: {{ reportOptions.execution_time }}s</br>-->
<!--							Relation Prefetch Time: {{ reportOptions.relation_prefetch_time }}s</br>-->
<!--							Serialization Time: {{ reportOptions.serialization_time }}s </br>-->
<!--							Render Time: {{ renderTime }}s </br>-->
<!--							Rows downloaded: {{ reportOptions.items.length }} </br>-->
<!--						</div>-->
<!--						Refresh Database Filters-->
<!--					</div>-->
<!--					<div v-if="!isReport">-->
<!--						Refresh Database Filters-->
<!--					</div>-->
<!--				</md-tooltip>-->
<!--			</template>-->
			<FmMenu  v-if="isRootEntityViewer">
				<template #btn>
					<FmIcon
						class="signed-button"
						btn-primary
						icon="add"
						@click="$mdOpenMenu($event)"
						v-fm-tooltip="'ADD ' + evGetEntityNameByState()"

					/>
<!--					добавить в кнопку-->
<!--					<div class="flex-column flex-i-center">-->
<!--						<span class="material-icons">view_stream</span>-->
<!--						<span>Split</span>-->
<!--					</div>-->
				</template>

				<template #default="{ close }">
					<template #btn v-if="!isReport && entityType !== 'complex-transaction'">
						<FmIcon
							btn-primary
							icon="link"
							class="g-settings-option-btn"
							@click="toggleSplitPanel($event, 'permission-editor')"
						>
							<span
								v-show="currentAdditions.type === 'permission-editor'"
								class="material-icons"
							>done</span>
							<span
								v-show="currentAdditions.type !== 'permission-editor'"
								class="material-icons"
								style="visibility: hidden;"
							>done</span>

							<span>Open permission editor</span>
							/>
					</template>
					<template #btn v-if="!isReport">
						<FmIcon
							btn-primary
							icon="link"
							class="g-settings-option-btn"
							@click="toggleSplitPanel($event, 'editor')"
						>
						<span
							v-show="currentAdditions.type === 'editor'"
							class="material-icons"
						>done</span>
							<span
								v-show="currentAdditions.type !== 'editor'"
								class="material-icons"
								style="visibility: hidden;"
							>done</span>

							<span>Open editor split panel</span>
							/>
					</template>
					<template #btn v-if="!isReport">
						<FmIcon
							btn-primary
							icon="link"
							class="g-settings-option-btn"
							@click="toggleSplitPanel($event, 'balance-report')"
						>
							<span
								v-show="currentAdditions.type === 'balance-report'"
								class="material-icons"
							>done</span>
							<span
								v-show="currentAdditions.type !== 'balance-report'"
								class="material-icons"
								style="visibility: hidden;"
							>done</span>

							<span>Open Balance Report view panel</span>
							/>
					</template>
					<template #btn v-if="!isReport">
						<FmIcon
							btn-primary
							icon="link"
							class="g-settings-option-btn"
							@click="toggleSplitPanel($event, 'pl-report')"
						>
							<span
								v-show="currentAdditions.type === 'pl-report'"
								class="material-icons"
							>done</span>
							<span
								v-show="currentAdditions.type !== 'pl-report'"
								class="material-icons"
								style="visibility: hidden;"
							>done</span>

							<span>Open P&L Report view panel</span>
							/>
					</template>
					<template #btn v-if="!isReport">
						<FmIcon
							btn-primary
							icon="link"
							class="g-settings-option-btn"
							@click="toggleSplitPanel($event, 'transaction-report')"
						>
						<span
							v-show="currentAdditions.type === 'transaction-report'"
							class="material-icons"
						>done</span>
							<span
								v-show="currentAdditions.type !== 'transaction-report'"
								class="material-icons"
								style="visibility: hidden;"
							>done</span>

							<span>Open Transaction Report view panel</span>
							/>
					</template>
				</template>
			</FmMenu>

			<FmMenu v-if="isRootEntityViewer && isReport">
				<template #btn>
					<FmIcon
						class="signed-button"
						btn-primary
						icon="add"
						@click="$mdOpenMenu($event)"

					/>
					<div class="flex-column flex-i-center">
						<span class="material-icons">view_module</span>
						<span>Matrix</span>
					</div>
				</template>

				<template #default="{ close }">
					<template #btn>
						<FmIcon
							btn-primary
							icon="link"
							class="g-settings-option-btn"
							@click="toggleMatrix($event)"
						>
							<span
								v-show="viewContext === 'matrix'"
								class="material-icons"
							>done</span>
							<span
								v-show="viewContext !== 'matrix'"
								class="material-icons"
								style="visibility: hidden;"
							>done</span>

							<span>Open Matrix</span>
							/>
					</template>


				</template>
			</FmMenu>

			<FmMenu >
				<template #btn>
					<FmIcon
						class="signed-button"
						btn-primary
						icon="add"
						@click="$mdOpenMenu($event)"

					/>
					<div class="flex-column flex-i-center">
						<span class="material-icons">upgrade</span>
						<span>Export</span>
					</div>
				</template>

				<template #default="{ close }">
					<template #btn  v-if="isReport">
						<FmIcon
							btn-primary
							icon="link"
							class="g-settings-option-btn"
							@click="exportAsPdf($event)"
						>
							<span>Export to PDF</span>
							/>
					</template>
					<template #btn  >
						<FmIcon
							btn-primary
							icon="link"
							class="g-settings-option-btn"
							@click="exportAsCSV()"
						>
							<span>Export to CSV</span>
							/>
					</template>
					<template #btn  >
						<FmIcon
							btn-primary
							icon="link"
							class="g-settings-option-btn"
							@click="exportAsExcel()"						>
							<span>Export to Excel</span>							/>
					</template>
					<template #btn  >
						<FmIcon
							btn-primary
							icon="link"
							class="g-settings-option-btn"
							@click="copyReport()"
						>
							<span>Copy all to buffer</span>
							/>
					</template>
					<template #btn  >
						<FmIcon
							btn-primary
							icon="link"
							class="g-settings-option-btn"
							@click="copySelectedToBuffer()"
						>
							<span>Copy all to buffer</span>
							/>
					</template>
				</template>
			</FmMenu>


			<FmMenu >
				<template #btn>
					<FmIcon
						class="signed-button"
						btn-primary
						icon="add"
						@click="$mdOpenMenu($event)"

					/>
					<div class="flex-column flex-i-center">
						<span class="material-icons">more_vert</span>
						<span>More</span>
					</div>
				</template>

				<template #default="{ close }">
					<template #btn  v-if="isReport">
						<FmIcon
							btn-primary
							icon="link"
							class="signed-button"
							@click="$mdOpenMenu($event)"
						>
							<div class="flex-column flex-i-center">
								<span class="material-icons">more_vert</span>
								<span>More</span>
							</div>
							/>
					</template>
					<template #btn  >
						<FmIcon
							btn-primary
							icon="link"
							class="g-settings-option-btn"
							@click="openViewConstructor($event)"
						>
							<span>View Constructor</span>
							/>
					</template>
					<template #btn v-if="entityType !== 'complex-transaction'">
						<FmIcon
							btn-primary
							icon="link"
							class="g-settings-option-btn"
							@click="openCustomFieldsManager($event)"
						>
							<span>Custom Columns</span>
					</template>
					<template #btn  v-if="isReport" >
						<FmIcon
							btn-primary
							icon="link"
							class="g-settings-option-btn"
							@click="toggleAutoRefresh()"
						>
							<span v-if="rvAutoRefresh">Disable Auto Refresh</span>
							<span v-if="!rvAutoRefresh">Enable Auto Refresh</span>
							/>
					</template>
					<template #btn v-if="!isReport"  >
						<FmIcon
							btn-primary
							icon="link"
							class="g-settings-option-btn"
							@click="openInputFormEditor($event)"
						>
							<span>Edit form</span>
							/>
					</template>
				</template>
			</FmMenu>
		</div>
		</div>
</template>

<script>
	// import evEvents from '@/angular/services/entityViewerEvents'
	//
	// // import EventService from '@/angular/services/eventService';
	const props = defineProps([
		'evDataService',
		'evEventService',
		'attributeDataService',
	])
	// export default function ($mdDialog, gFiltersHelper, uiService) {

	templateUrl: 'views/directives/groupTable/filters/g-ev-rv-filters-view.html',
		// link: function (scope, elem, attrs, gFiltersVm) {
		(scope.entityType = gFiltersVm.entityType)
	scope.isReport = true
	scope.isRootEntityViewer = scope.evDataService.isRootEntityViewer()
	scope.showUseFromAboveFilters = !scope.hideUseFromAboveFilters

	const hideUseFromAboveFilters = gFiltersVm.hideUseFromAboveFilters

	if (hideUseFromAboveFilters) {
		scope.showUseFromAboveFilters = false
	} else {
		scope.showUseFromAboveFilters = !scope.isRootEntityViewer // show use from above filters by default inside split panel
	}

	scope.rvAutoRefresh = scope.evDataService.getAutoRefreshState()

	if (scope.rvAutoRefresh === null || scope.rvAutoRefresh === undefined) {
		//if we missed initial state for already existing layout
		scope.rvAutoRefresh = true
	}

	scope.readyStatus = {
		filters: false,
	}

	scope.filterPopupTemplate =
		'views/popups/groupTable/filters/rv-filter-popup-view.html'

	scope.popupPosX = gFiltersVm.popupPosX
	scope.popupPosY = gFiltersVm.popupPosY
	/*scope.fpBackClasses = gFiltersVm.fpBackClasses;
                scope.fpClasses = gFiltersVm.fpClasses;*/

	const gFiltersLeftPartWidth =
		elem[0].querySelector('.gFiltersLeftPart').clientWidth
	const gFiltersRightPartWidth =
		elem[0].querySelector('.gFiltersRightPart').clientWidth
	let filtersChipsContainer = elem[0].querySelector('.gFiltersContainer')

	let filters = scope.evDataService.getFilters()
	let useFromAboveFilters = []
	let customFields = scope.attributeDataService.getCustomFieldsByEntityType(
		scope.entityType
	)

	/* scope.calculateReport = function () {
                    scope.evEventService.dispatchEvent(evEvents.REQUEST_REPORT);
                }; */
	scope.refreshTable = function () {
		scope.evEventService.dispatchEvent(evEvents.REQUEST_REPORT)
	}

	//region Chips
	scope.onFilterChipClick = gFiltersVm.onFilterChipClick

	scope.filterSettingsChange = function () {
		scope.evEventService.dispatchEvent(evEvents.FILTERS_CHANGE)

		scope.evDataService.resetTableContent(true)

		scope.evEventService.dispatchEvent(evEvents.UPDATE_TABLE)
	}

	scope.toggleUseFromAboveFilters = function () {
		scope.showUseFromAboveFilters = !scope.showUseFromAboveFilters
		scope.evEventService.dispatchEvent(evEvents.TOGGLE_SHOW_FROM_ABOVE_FILTERS)
		formatFiltersForChips()

		setTimeout(() => {
			const filterAreaHeightChanged = gFiltersVm.updateFilterAreaHeight()

			if (filterAreaHeightChanged) {
				scope.evEventService.dispatchEvent(evEvents.UPDATE_TABLE_VIEWPORT)
			}
		}, 0)
	}

	/* const getUseFromAboveFilters = function () {

                    useFromAboveFilters = filters.filter((filter, index) => {

                        if (filter.options && filter.options.use_from_above && Object.keys(filter.options.use_from_above).length) {

                            filter.filtersListIndex = index;
                            return true;

                        }

                        return false;

                    });

                }; */

	const formatFiltersForChips = function () {
		scope.filtersChips = []
		const errors = []

		console.log('formatFiltersForChips.filters', filters)

		filters.forEach((filter) => {
			if (filter.type !== 'filter_link') {
				// don't show filter from dashboard component

				const filterOpts = filter.options || {}
				/* let filterVal = filterOpts.filter_values || "";

                            if (filterOpts.filter_type === 'from_to') {

                                filterVal = `From ${filterOpts.filter_values.min_value} to ${filterOpts.filter_values.max_value}`;

                            } else if (filterOpts.filter_type === 'out_of_range' ) {

                                filterVal = `Out of range from ${filterOpts.filter_values.min_value} to ${filterOpts.filter_values.max_value}`;

                            } */

				// hide use from above filters if needed
				if (
					scope.showUseFromAboveFilters ||
					!filterOpts.use_from_above ||
					!Object.keys(filterOpts.use_from_above).length
				) {
					let filterData = {
						id: filter.key,
						isActive: filterOpts.enabled,
					}

					const filterName = filter.layout_name
						? filter.layout_name
						: filter.name

					let chipText = gFiltersVm.getChipTextElem(
						filterName,
						filterOpts.filter_values,
						filterOpts.filter_type
					)

					if (
						filterOpts.use_from_above &&
						Object.keys(filterOpts.use_from_above).length
					) {
						filterData.classes = 'use-from-above-filter-chip'
						filterData.tooltipContent = chipText

						chipText = '<span class="material-icons">link</span>' + chipText
					}

					filterData.text = chipText

					/*
                                if (filter.key.startsWith('custom_fields')) {
                                    const customField = customFields.find( field => filter.key === `custom_fields.${field.user_code}`)
                                    if (!customField) {

                                        filter.options.enabled = false;
                                        const description = `The ${filter.groups ? 'group' : 'column'} does not exist in the Configuration`

                                        filterData.error_data = {
                                            code: 10,
                                            description: description
                                        }

                                        const error = {
                                            key: filter.key,
                                            description: description
                                        }

                                        errors.push(error)

                                    }

                                }
                                */
					if (filter.key.startsWith('custom_fields')) {
						let error
						;[filter, filterData, error] =
							gFiltersVm.checkCustomFieldFilterForError(
								filter,
								filterData,
								customFields
							)
						if (error) errors.push(error)
					}

					scope.filtersChips.push(filterData)
				}
			}
		})

		if (errors.length) gFiltersVm.updateMissingCustomFieldsList(errors)

		gFiltersVm.updateFilterAreaHeight()
	}

	scope.onChipsFirstRender = gFiltersVm.onChipsFirstRender

	scope.addFilter = function ($event) {
		gFiltersVm.openAddFilterDialog($event, filters).then((res) => {
			if (res.status === 'agree') {
				for (var i = 0; i < res.data.items.length; i = i + 1) {
					filters.push(res.data.items[i])
				}

				scope.evDataService.setFilters(filters)
				scope.evEventService.dispatchEvent(evEvents.FILTERS_CHANGE)

				scope.$apply()
			}
		})
	}

	scope.removeFilter = function (filtersToRemove) {
		filters = filters.filter((filter) => {
			return filtersToRemove.find((item) => item.id !== filter.key)
		})

		scope.evDataService.setFilters(filters)

		scope.evEventService.dispatchEvent(evEvents.FILTERS_CHANGE)
		scope.evEventService.dispatchEvent(evEvents.UPDATE_TABLE)
	}
	//endregion

	scope.toggleSplitPanel = gFiltersVm.toggleSplitPanel

	scope.toggleMatrix = function ($event) {
		var viewType = scope.evDataService.getViewType()
		var newViewType

		if (viewType === 'matrix') {
			newViewType = 'report_viewer'
		} else {
			newViewType = 'matrix'
		}

		if (newViewType === 'matrix') {
			var settings = scope.evDataService.getViewSettings(newViewType)

			$mdDialog
				.show({
					controller: 'ReportViewerMatrixSettingsDialogController as vm',
					templateUrl:
						'views/dialogs/report-viewer-matrix-settings-dialog-view.html',
					parent: angular.element(document.body),
					clickOutsideToClose: false,
					targetEvent: $event,
					preserveScope: true,
					multiple: true,
					autoWrap: true,
					skipHide: true,
					locals: {
						data: {
							attributeDataService: scope.attributeDataService,
							evDataService: scope.evDataService,
							evEventService: scope.evEventService,
							settings: settings,
						},
					},
				})
				.then(function (res) {
					if (res.status === 'agree') {
						settings = res.data.settings

						scope.evDataService.setViewType(newViewType)
						scope.evDataService.setViewSettings(newViewType, settings)

						scope.evEventService.dispatchEvent(evEvents.VIEW_TYPE_CHANGED)
					}
				})
		} else {
			scope.evDataService.setViewType(newViewType)
			scope.evDataService.setViewSettings(newViewType, {})

			scope.evEventService.dispatchEvent(evEvents.VIEW_TYPE_CHANGED)
		}
	}

	scope.exportAsPdf = function ($event) {
		$mdDialog.show({
			controller: 'ExportPdfDialogController as vm',
			templateUrl: 'views/dialogs/export-pdf-dialog-view.html',
			parent: angular.element(document.body),
			targetEvent: $event,
			locals: {
				evDataService: scope.evDataService,
				evEventService: scope.evEventService,
				data: { entityType: scope.entityType },
			},
		})
	}

	scope.exportAsCSV = gFiltersVm.exportAsCSV
	scope.exportAsExcel = gFiltersVm.exportAsExcel
	scope.copyReport = gFiltersVm.copyReport
	scope.copySelectedToBuffer = gFiltersVm.copySelectedToBuffer

	scope.openViewConstructor = gFiltersVm.openViewConstructor

	scope.openCustomFieldsManager = function ($event) {
		$mdDialog.show({
			controller: 'CustomFieldDialogController as vm',
			templateUrl: 'views/dialogs/custom-field/custom-field-dialog-view.html',
			parent: angular.element(document.body),
			targetEvent: $event,
			clickOutsideToClose: false,
			preserveScope: true,
			multiple: true,
			locals: {
				attributeDataService: scope.attributeDataService,
				entityViewerEventService: scope.evEventService,
				data: {
					entityType: gFiltersVm.entityType,
				},
			},
		})
	}

	scope.toggleAutoRefresh = function () {
		scope.rvAutoRefresh = !scope.rvAutoRefresh

		scope.evDataService.setAutoRefreshState(scope.rvAutoRefresh)
	}

	scope.addMenu = {
		data: {
			menu: {
				root: {
					items: [
						{
							action: 'book_transaction',
							name: 'Book Transaction',
							order: 0,
						},
						{
							action: 'add_portfolio',
							name: 'Add Portfolio',
							order: 1,
						},
						{
							action: 'add_account',
							name: 'Add Account',
							order: 2,
						},
						{
							action: 'add_currency',
							name: 'Add Currency',
							order: 3,
						},
						{
							action: 'add_instrument',
							name: 'Add Instrument',
							order: 4,
						},
					],
				},
			},
		},
	}

	const getAddMenuLayout = function () {
		uiService
			.getContextMenuLayoutList({
				filters: {
					type: 'report_menu_add_entities',
				},
			})
			.then(function (data) {
				if (data.results.length) {
					scope.addMenu = data.results[0]
				}

				scope.$apply()
			})
	}

	scope.dispatchAddMenuAction = function ($event, item) {
		scope.evDataService.setUserRequestedAction(item.action)

		scope.evEventService.dispatchEvent(evEvents.USER_REQUEST_AN_ACTION)
	}

	const initEventListeners = function () {
		// placed here because formatFiltersForChips() should be called only after customFields update
		scope.evEventService.addEventListener(
			evEvents.DYNAMIC_ATTRIBUTES_CHANGE,
			function () {
				customFields = scope.attributeDataService.getCustomFieldsByEntityType(
					scope.entityType
				)
				formatFiltersForChips()
			}
		)

		scope.evEventService.addEventListener(
			evEvents.TABLE_SIZES_CALCULATED,
			function () {
				gFiltersVm.calculateFilterChipsContainerWidth(
					gFiltersLeftPartWidth,
					gFiltersRightPartWidth,
					filtersChipsContainer
				)
			}
		)

		scope.evEventService.addEventListener(evEvents.FILTERS_CHANGE, function () {
			filters = scope.evDataService.getFilters()

			// getUseFromAboveFilters();
			useFromAboveFilters = gFiltersHelper.filterUseFromAboveFilters(filters)

			formatFiltersForChips()

			setTimeout(function () {
				// wait until DOM elems reflow after ng-repeat

				const filterAreaHeightChanged = gFiltersVm.updateFilterAreaHeight()

				if (filterAreaHeightChanged) {
					scope.evEventService.dispatchEvent(evEvents.UPDATE_TABLE_VIEWPORT)
				}
			}, 0)
		})

		scope.evEventService.addEventListener(
			evEvents.ACTIVE_OBJECT_FROM_ABOVE_CHANGE,
			function () {
				if (useFromAboveFilters.length) {
					// UPDATE_TABLE or REQUEST_REPORT dispatched inside gFiltersHelper.insertActiveObjectDataIntoFilters()
					const filtersChangedFromAbove =
						gFiltersHelper.insertActiveObjectDataIntoFilters(
							scope.evDataService,
							scope.evEventService
						)
					if (filtersChangedFromAbove) formatFiltersForChips()
				}
			}
		)

		scope.evEventService.addEventListener(
			evEvents.CLEAR_USE_FROM_ABOVE_FILTERS,
			function () {
				if (useFromAboveFilters.length) {
					useFromAboveFilters.forEach((ufaFilter) => {
						filters[ufaFilter.filtersListIndex].options.filter_values = []
					})

					scope.evDataService.setFilters(filters)

					scope.evEventService.dispatchEvent(evEvents.FILTERS_CHANGE)

					scope.evDataService.resetTableContent(true)

					scope.evEventService.dispatchEvent(evEvents.UPDATE_TABLE)
				}
			}
		)

		scope.evEventService.addEventListener(
			evEvents.ADDITIONS_CHANGE,
			function () {
				scope.currentAdditions = scope.evDataService.getAdditions()
			}
		)

		scope.evEventService.addEventListener(evEvents.DATA_LOAD_END, function () {
			scope.reportOptions = scope.evDataService.getReportOptions() // for refresh tooltip -> auth time
		})

		scope.evEventService.addEventListener(evEvents.FINISH_RENDER, function () {
			scope.renderTime = scope.evDataService.getRenderTime() // for refresh tooltip -> auth time
		})
	}

	const init = function () {
		scope.currentAdditions = scope.evDataService.getAdditions()

		scope.popupEventService = gFiltersVm.popupEventService
		scope.chipsListEventService = gFiltersVm.chipsListEventService

		scope.popupData = gFiltersVm.popupData

		getAddMenuLayout()

		useFromAboveFilters = gFiltersHelper.filterUseFromAboveFilters(filters)
		formatFiltersForChips()

		scope.readyStatus.filters = true

		gFiltersVm.updateFilterAreaHeightOnInit()

		initEventListeners()
	}

	init()
</script>

<style lang="scss" scoped></style>
