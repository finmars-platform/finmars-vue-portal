<template>
	<div>
		<EvBaseTopPanel
			height="50"
			:loadingLayout="!readyStatusData.layout"
			@saveListLayout="saveLayout()"
			@openSettings="showSettingsDialog = true;"
		>
			<template #rightActions>
				<div class="flex-row fc-end">

					<div style="flex-basis: 175px;">
						<FmUnifiedDataSelect
							v-model="viewerData.reportOptions.report_currency"
							v-model:itemObject="viewerData.reportOptions.report_currency_object"
							noBorders
							content_type="currencies.currency"
							@update:modelValue="refresh()"
						/>
					</div>

					<div style="flex-basis: 120px;">

						<FmInputDateComplex
							v-if="readyStatusData.layout"
							v-model:firstDate="viewerData.reportOptions.end_date"
							v-model:firstDatepickerOptions="viewerData.reportLayoutOptions.datepickerOptions.reportLastDatepicker"
							noBorders
						/>

						<FmLoader v-if="!readyStatusData.layout" />

					</div>

				</div>

			</template>
		</EvBaseTopPanel>

		<FmHorizontalPanel height="initial" class="ev_toolbar">

			<template #leftActions>
				<FmMenu>
					<template #btn>
						<FmIcon class="add_ev_btn" btnPrimary icon="add" />
					</template>

					<template #default="{ close }">
						<div class="fm_list" @click="close()">
							<div class="fm_list_item" @click="addRegisterIsOpen = true">
								Add Portfolio register
							</div>
							<div class="fm_list_item">
								<div
									v-if="readyStatusData.portfolioRegisters"
									@click="isOpenAddBundle = true"
								>
									Add bundle
								</div>
								<FmLoader v-if="!readyStatusData.portfolioRegisters" />
							</div>
						</div>
					</template>
				</FmMenu>

<!--				<BaseModal
					v-model="isOpenAddBundle"
					title="Add Bundle"
					@update:modelValue="isOpenAddBundle = false"
				>

					<FmInputText
						title="Name"
						v-model="newBundle.name"
					/>

					<BaseMultiSelectTwoAreas
						class="p-b-16"
						v-model="newBundle.registers"
						:items="registersItems"
						item_id="id"
						item_title="user_code"
						@update:modelValue="newValue => newBundle.registers = newValue"
					/>

					<template #controls>
						<div class="flex sb">
							<FmBtn type="basic" @click="resetNewBundle(); isOpenAddBundle = false">cancel</FmBtn>
							<FmBtn @click="createBundle(), isOpenAddBundle = false">create</FmBtn>
						</div>
					</template>
				</BaseModal> -->
				<ModalPortfolioBundleAddEdit v-model="isOpenAddBundle"
																		 :registers="registersItems"
																		 @save="createBundle" />
			</template>

			<template #rightActions>
				<FmIcon icon="splitscreen" @click="splitComponent = 'FmBtn'" btn />
				<FmIcon icon="refresh" @click="refresh()" btn />
			</template>
		</FmHorizontalPanel>

		<PagesReportsPerformanceDialogSettings
			v-model="showSettingsDialog"
			v-model:externalReadyStatus="dsReadyStatus"
			:bundles="bundles"
			@save="showSettingsDialog = false, [viewerData.reportOptions, viewerData.reportLayoutOptions, viewerData.components] = $event, refresh()"
			@cancel="showSettingsDialog = false"
		/>

		<ModalPortfolioRegister
			title="Add portfolio register"
			v-model="addRegisterIsOpen"
			@save="onPrtfRegisterCreate"
			@cancel="addRegisterIsOpen = false"
		/>

		<EvModalSaveLayoutAs
			v-model="openSaveAsModal"
			@layoutSaved="layoutsStore.getListLayoutsLight(viewerData.content_type)"
		/>

		<!-- <ModalInfo title="Warning"
							 :description="`Are you sure you want to delete period: ${activePeriodData.user_code}?`"
							 v-model="showBundleDeletionWarning">

			<template #controls="{ cancel }">
				<div class="flex-row fc-space-between">
					<FmBtn type="basic" @click="cancel">CANCEL</FmBtn>

					<FmBtn type="basic" @click="deleteBundle(), cancel()">YES</FmBtn>
				</div>
			</template>

		</ModalInfo> -->

		<slot></slot>
	</div>
</template>

<script setup>

	const viewerData = getPerformanceViewerData();
	provide('viewerData', viewerData);

	let bundles = ref([])
	let registersItems = ref([]);

	let readyStatusData = reactive({
		layout: false,
		bundles: false,
		portfolioRegisters: false,
	});
	let showSettingsDialog = ref(false)
	let addRegisterIsOpen = ref(false);
	let openSaveAsModal = ref(false);
	let isOpenAddBundle = ref(false)

	let dsReadyStatus = computed(() => readyStatusData.layout && readyStatusData.bundles)
	let readyStatus = computed(() => {

		let ready = true;

		Object.keys(readyStatusData).forEach(rStatus => {
			ready = ready && readyStatusData[rStatus];
		});

		return ready;

	})

	function onPrtfRegisterCreate(newRegister) {

		addPrtfRegisterItem(newRegister);
		addRegisterIsOpen.value = false;

		refresh();

	}
	function addPrtfRegisterItem(newRegister) {
		registersItems.value.push({
			user_code: newRegister.user_code,
			id: newRegister.id,
		})
	}
	async function createBundle(bundleData) {

const newBundleData = {
	name: bundleData.name,
	short_name: bundleData.name,
	user_code: bundleData.name,
	public_name: bundleData.name,
	registers: bundleData.registers,
};

let res = await useApi('portfolioBundle.post', {body: newBundleData})

if ( res ) {

	refresh()

	useNotify({
		type: 'success',
		title: 'Bundle created successfully'
	})

}
}

	async function updateBundle(bundleData) {

		let updatedData = JSON.parse(JSON.stringify( activePeriodData.value ));
		updatedData = {...updatedData, ...bundleData};
		updatedData.short_name = bundleData.name;
		updatedData.user_code = bundleData.name;
		updatedData.public_name = bundleData.name;

		const opts = {
			params: {
				id: updatedData.id,
			},
			body: updatedData,
		};

		let res = await useApi('portfolioBundle.put', opts);

		if (!res.error) {

			useNotify({
				type: 'success',
				title: 'Bundle updated successfully'
			});

			refresh();

		}

	}
	async function deleteBundle() {

		const bundleToDelete = bundles.value[activePeriod.value];

		const res = await useApi( 'portfolioBundle.delete', {params: {id: bundleToDelete.id}} );

		if (!res.error) {

			useNotify({type: 'success', title: `Bundle ${bundleToDelete.name} was successfully deleted.`})

			refresh()

		}

	}

	function getPerformanceViewerData() {

return reactive(
	{
		listLayout: {},
		reportLayoutOptions: {},
		reportOptions: {},
		additions: {},
		components: {},
		exportOptions: {},

		layoutToOpen: null, // id of layout

		content_type: 'reports.performancereport',
		entityType: 'reports-performance', // TODO: remove and use only content_type

		isReport: true,
		isRootEntityViewer: true,
		newLayout: false,
		viewerContext: 'entity_viewer',

		/*setListLayout(listLayout) {
			this.state.listLayout = listLayout;
		},

		setReportOptions(ro) {
			this.state.reportOptions = ro;
		},

		setAdditions(additions) {
			this.state.additions = additions;
		},

		setComponents(components) {
			this.state.components = components;
		},

		setExportOptions(options) {
			this.state.exportOptions = options;
		},*/

		setLayoutCurrentConfiguration(listLayout, ecosystemDefaults) {

			if (listLayout) {

				this.newLayout = false;
				listLayout = useRecursiveDeepCopy(listLayout);

			} else {

				this.newLayout = true;

				/*let edRes = await useApi('ecosystemDefaults.get');

				const ecosystemDefaults = (edRes.error) ? {} : edRes.results[0];*/

				listLayout = getEmptyLayoutData(JSON.parse(JSON.stringify(ecosystemDefaults)));

			}

			//region Setup data for FmInputDateComplex
			if (!listLayout.data.hasOwnProperty('reportLayoutOptions')) {
				listLayout.data.reportLayoutOptions = {};
			}

			if (!listLayout.data.reportLayoutOptions.hasOwnProperty('datepickerOptions')) {
				listLayout.data.reportLayoutOptions.datepickerOptions = {};
			}

			if (!listLayout.data.reportLayoutOptions.datepickerOptions.hasOwnProperty('reportFirstDatepicker')) {
				listLayout.data.reportLayoutOptions.datepickerOptions.reportFirstDatepicker = {};
			}

			if (!listLayout.data.reportLayoutOptions.datepickerOptions.hasOwnProperty('reportLastDatepicker')) {

				listLayout.data.reportLayoutOptions.datepickerOptions.reportLastDatepicker = {
					expression: 'last_business_day(now())',
					datepickerMode: 'expression'
				};

			}
			//endregion

			this.components = JSON.parse(JSON.stringify(listLayout.data.components));
			this.reportLayoutOptions = JSON.parse(JSON.stringify(listLayout.data.reportLayoutOptions));
			this.reportOptions = JSON.parse(JSON.stringify(listLayout.data.reportOptions));

			this.additions = JSON.parse(JSON.stringify(listLayout.data.additions));
			this.exportOptions = JSON.parse(JSON.stringify(listLayout.data.exportOptions));

			this.listLayout = listLayout;

			/*this.setComponents(JSON.parse(JSON.stringify(listLayout.data.components)));
			this.setReportOptions(JSON.parse(JSON.stringify(listLayout.data.reportOptions)));
			this.setAdditions(JSON.parse(JSON.stringify(listLayout.data.additions)));
			this.setExportOptions(JSON.parse(JSON.stringify(listLayout.data.exportOptions)));

			this.setListLayout(listLayout);*/

		},

		getLayoutCurrentConfiguration() {

			let listLayout = useRecursiveDeepCopy(this.listLayout);

			listLayout.data.components = {...{}, ...this.components};
			listLayout.data.reportLayoutOptions = JSON.parse(JSON.stringify(this.reportLayoutOptions));
			listLayout.data.reportOptions = JSON.parse(JSON.stringify(this.reportOptions));

			listLayout.data.additions = JSON.parse(JSON.stringify(this.additions));
			listLayout.data.exportOptions = JSON.parse(JSON.stringify(this.exportOptions));

			return listLayout;
		},

		/*get reportOptions() {
			return this.state.reportOptions;
		},

		get components() {
			return this.state.components;
		},

		get exportOptions() {
			return this.state.exportOptions;
		},*/
	}
)

	}

	function getEmptyLayoutData (ecosystemDefaults) {

		let reportCurrencyObj = null;

		if (ecosystemDefaults.currency_object) {
			reportCurrencyObj = ecosystemDefaults.currency_object;
		}

		let pricingPolicyObj = null;

		if (ecosystemDefaults.pricing_policy_object) {
			pricingPolicyObj = ecosystemDefaults.pricing_policy_object;
		}

		return {
			name: "",
			user_code: "",
			content_type: "reports.performancereport",
			data: {
				additions: {},
				reportLayoutOptions: {
					datepickerOptions: {},
				},
				reportOptions: {
					begin_date: null,
					end_date: dayjs(new Date).format('YYYY-MM-DD'),
					report_currency: ecosystemDefaults.currency || null,
					report_currency_object: reportCurrencyObj,
					calculation_type: "time_weighted",
					segmentation_type: "months",
					pricing_policy: ecosystemDefaults.pricing_policy || null,
					pricing_policy_object: pricingPolicyObj,
				},
				components: {
					period: true,
					detail: true,
					diagram: true,
				},
				exportOptions: {}
			}
		};
	}

	watch(
		() => viewerData.layoutToOpen,
		async () => {

			if (viewerData.layoutToOpen) {

				await fetchListLayout();
				viewerData.layoutToOpen = null;

				refresh();

			}

		},
	)

</script>

<style lang="scss" scoped>

</style>
