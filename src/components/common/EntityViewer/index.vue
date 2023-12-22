<template>
	<div>
		<EvBaseTopPanel
			height="50"
			:loadingLayout="!readyStatusData.layout"
			@saveListLayout="saveLayout()"
			@openSettings="showSettingsDialog = true"
		>
			<template #rightActions>
				<div class="flex-row fc-end">
					<div style="flex-basis: 175px">
						<FmUnifiedDataSelect
							v-model="viewerData.reportOptions.report_currency"
							propId="user_code"
							:selectedItemName="
								viewerData.reportOptions.report_currency_object.name
							"
							noBorders
							content_type="currencies.currency"
							@update:modelValue="emit('refresh')"
							@itemSelected="
								(newVal) =>
									(viewerData.reportOptions.report_currency_object = newVal)
							"
						/>
					</div>

					<div style="flex-basis: 120px">
						<FmInputDateComplex
							v-if="readyStatusData.layout"
							v-model:firstDate="viewerData.reportOptions.end_date"
							v-model:firstDatepickerOptions="
								viewerData.reportLayoutOptions.datepickerOptions
									.reportLastDatepicker
							"
							noBorders
						/>

						<FmLoader v-if="!readyStatusData.layout" />
					</div>
				</div>

				<PagesReportsPerformanceDialogSettings
					v-model="showSettingsDialog"
					:bundles="bundles"
					@save="
						;(showSettingsDialog = false),
							([
								viewerData.reportOptions,
								viewerData.reportLayoutOptions,
								viewerData.components,
							] = $event),
							emit('refresh')
					"
					@cancel="showSettingsDialog = false"
				/>
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
							<div class="fm_list_item" @click="isOpenAddBundle = true">
								Add bundle
							</div>
						</div>
					</template>
				</FmMenu>

				<ModalPortfolioBundleAddEdit
					v-model="isOpenAddBundle"
					@save="createBundle"
				/>

				<ModalPortfolioRegister
					title="Add portfolio register"
					v-model="addRegisterIsOpen"
					@save="onPrtfRegisterCreate"
					@cancel="addRegisterIsOpen = false"
				/>
			</template>

			<template #rightActions>
				<FmIcon
					icon="splitscreen"
					@click="splitComponent = splitComponent ? null : 'FmBtn'"
					btn
				/>
				<FmIcon icon="refresh" @click="emit('refresh')" btn />
			</template>
		</FmHorizontalPanel>

		<div
			class="split_panel_wrap"
			:style="
				splitComponent
					? {
							gridTemplateRows: `calc(100% - ${splitHeight}px) ${splitHeight}px`,
					  }
					: {}
			"
		>
			<div class="split_panel_main">
				<slot
					:reportOptions="viewerData.reportOptions"
					:components="viewerData.components"
				></slot>
			</div>

			<div class="split_panel" v-if="splitComponent">
				<div class="split_panel_devider" @mousedown="resizeY"></div>

				<component :is="splitComponent" />
			</div>
		</div>
	</div>
</template>

<script setup>
	import dayjs from 'dayjs'

	const emit = defineEmits(['refresh'])

	const viewerData = getPerformanceViewerData()
	const layoutsStore = useLayoutsStore()
	const store = useStore()
	const route = useRoute()
	provide('viewerData', viewerData)

	let bundles = ref([])

	let readyStatusData = reactive({
		layout: false,
		bundles: false,
		portfolioRegisters: false,
	})

	let showSettingsDialog = ref(false)
	let addRegisterIsOpen = ref(false)
	let openSaveAsModal = ref(false)
	let isOpenAddBundle = ref(false)

	let splitHeight = ref(200)
	let splitComponent = ref(false)

	async function saveLayout() {
		if (viewerData.newLayout) {
			/*const layoutToSave = viewerData.getLayoutCurrentConfiguration();
			layoutToSave.name = "default";
			layoutToSave.user_code = "default";
			layoutToSave.is_default = true;

			let res = await useApi('listLayout.post', {body: layoutToSave});

			if (!res.error) {
				viewerData.newLayout = false;
				viewerData.listLayout = res;
				useNotify({type: 'success', title: 'Success. Page was saved.'})
			}*/
			openSaveAsModal.value = true
		} else {
			useSaveEvRvLayout(store, viewerData)
		}
	}
	watch(
		() => viewerData.layoutToOpen,
		async () => {
			if (viewerData.layoutToOpen) {
				await fetchListLayout()
				viewerData.layoutToOpen = null

				emit('refresh')
			}
		}
	)
	function resizeY(e) {
		let elem = e.target
		let parentRect = elem.closest('.split_panel_wrap').getBoundingClientRect()
		let startY = e.clientY
		let oldValue = splitHeight.value

		document.ondragstart = function () {
			return false
		}

		function onmousemove(e) {
			let newVal = oldValue + (startY - e.clientY)

			if (newVal < 30) newVal = 30
			if (newVal > parentRect.height) newVal = parentRect.height

			splitHeight.value = newVal
		}

		document.addEventListener('mousemove', onmousemove)
		document.onselectstart = function (e) {
			e.preventDefault()
			return false
		}
		document.onmouseup = function () {
			document.removeEventListener('mousemove', onmousemove)
			elem.onmouseup = null
			document.onselectstart = null
		}
	}
	function onPrtfRegisterCreate(newRegister) {
		addPrtfRegisterItem(newRegister)
		addRegisterIsOpen.value = false

		emit('refresh')
	}
	fetchPortfolioBundles()

	async function fetchPortfolioBundles() {
		let res = await useApi('portfolioBundleList.get',{
			filters: { page: 1, page_size: 1000 },
		})

		bundles.value = res.results
	}
	async function createBundle(bundleData) {
		const newBundleData = {
			name: bundleData.name,
			short_name: bundleData.name,
			user_code: bundleData.name,
			public_name: bundleData.name,
			registers: bundleData.registers,
		}

		let res = await useApi('portfolioBundle.post', { body: newBundleData })

		if (res) {
			emit('refresh')

			useNotify({
				type: 'success',
				title: 'Bundle created successfully',
			})
		}
	}

	// rework
	async function getEndDate() {
		if (viewerData.reportOptions?.end_date) {
			return viewerData.reportOptions?.end_date
		}

		const roCopy = viewerData.reportOptions
			? JSON.parse(JSON.stringify(viewerData.reportOptions))
			: viewerData.reportOptions
		console.error('No end_date set for performance report ', roCopy)

		// if there is expression for end_date, calculate it
		if (
			viewerData.reportLayoutOptions?.datepickerOptions?.reportLastDatepicker
				.datepickerMode !== 'datepicker' &&
			viewerData.reportLayoutOptions.datepickerOptions.reportLastDatepicker
				.expression
		) {
			const opts = {
				body: {
					is_eval: true,
					expression:
						viewerData.reportLayoutOptions.datepickerOptions
							.reportLastDatepicker.expression,
				},
			}

			const res = await useApi('expression.post', opts)

			viewerData.reportOptions.end_date = res.result

			return viewerData.reportOptions.end_date
		}

		const opts = {
			body: {
				is_eval: true,
				expression: 'last_business_day(now())',
			},
		}

		const res = await useApi('expression.post', opts)

		if (res.error) throw new Error(res.error)

		viewerData.reportOptions.end_date = res.result

		return viewerData.reportOptions.end_date
	}
	await fetchListLayout()

	async function fetchListLayout() {
		/*const resData = await useApi('defaultListLayout.get', {params: {contentType: viewerData.contentType}});

		if (resData.error) {
			throw new Error('Failed to fetch default performance layout');
		}

		const defaultListLayout = (resData.results.length) ? resData.results[0] : null;

		if (defaultListLayout.data.reportOptions.pricing_policy) {

			defaultListLayout.data.reportOptions.pricing_policy_object = pricingPolicyListLight.value.find(item => {
				return item.id === defaultListLayout.data.reportOptions.pricing_policy;
			});

		}

		if (defaultListLayout.data.reportOptions.report_currency) {

			defaultListLayout.data.reportOptions.report_currency_object = currencyListLight.value.find(item => {
				return item.id === defaultListLayout.data.reportOptions.report_currency;
			});

		}*/
		readyStatusData.layout = false

		const layoutRes = await useFetchEvRvLayout(
			layoutsStore,
			viewerData,
			route.query.layout
		)

		viewerData.setLayoutCurrentConfiguration(layoutRes, store.ecosystemDefaults)

		const reportOptionsRes = await useCalculateReportDatesExprs(
			viewerData.content_type,
			viewerData.reportOptions,
			viewerData.reportLayoutOptions
		)

		if (reportOptionsRes.error) throw reportOptionsRes.error

		viewerData.reportOptions = reportOptionsRes

		readyStatusData.layout = true
	}

	function getPerformanceViewerData() {
		return reactive({
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
					this.newLayout = false
					listLayout = useRecursiveDeepCopy(listLayout)
				} else {
					this.newLayout = true

					/*let edRes = await useApi('ecosystemDefaults.get');

						const ecosystemDefaults = (edRes.error) ? {} : edRes.results[0];*/

					listLayout = getEmptyLayoutData(
						JSON.parse(JSON.stringify(ecosystemDefaults))
					)
				}

				//region Setup data for FmInputDateComplex
				if (!listLayout.data.hasOwnProperty('reportLayoutOptions')) {
					listLayout.data.reportLayoutOptions = {}
				}

				if (
					!listLayout.data.reportLayoutOptions.hasOwnProperty(
						'datepickerOptions'
					)
				) {
					listLayout.data.reportLayoutOptions.datepickerOptions = {}
				}

				if (
					!listLayout.data.reportLayoutOptions.datepickerOptions.hasOwnProperty(
						'reportFirstDatepicker'
					)
				) {
					listLayout.data.reportLayoutOptions.datepickerOptions.reportFirstDatepicker =
						{}
				}

				if (
					!listLayout.data.reportLayoutOptions.datepickerOptions.hasOwnProperty(
						'reportLastDatepicker'
					)
				) {
					listLayout.data.reportLayoutOptions.datepickerOptions.reportLastDatepicker =
						{
							expression: 'last_business_day(now())',
							datepickerMode: 'expression',
						}
				}
				//endregion

				this.components = JSON.parse(JSON.stringify(listLayout.data.components))
				this.reportLayoutOptions = JSON.parse(
					JSON.stringify(listLayout.data.reportLayoutOptions)
				)
				this.reportOptions = JSON.parse(
					JSON.stringify(listLayout.data.reportOptions)
				)

				this.additions = JSON.parse(JSON.stringify(listLayout.data.additions))
				this.exportOptions = JSON.parse(
					JSON.stringify(listLayout.data.exportOptions)
				)

				this.listLayout = listLayout

				/*this.setComponents(JSON.parse(JSON.stringify(listLayout.data.components)));
					this.setReportOptions(JSON.parse(JSON.stringify(listLayout.data.reportOptions)));
					this.setAdditions(JSON.parse(JSON.stringify(listLayout.data.additions)));
					this.setExportOptions(JSON.parse(JSON.stringify(listLayout.data.exportOptions)));

					this.setListLayout(listLayout);*/
			},

			getLayoutCurrentConfiguration() {
				let listLayout = useRecursiveDeepCopy(this.listLayout)
				delete listLayout.newLayout;

				listLayout.data.components = { ...{}, ...this.components }
				listLayout.data.reportLayoutOptions = JSON.parse(
					JSON.stringify(this.reportLayoutOptions)
				)
				listLayout.data.reportOptions = JSON.parse(
					JSON.stringify(this.reportOptions)
				)

				listLayout.data.additions = JSON.parse(JSON.stringify(this.additions))
				listLayout.data.exportOptions = JSON.parse(
					JSON.stringify(this.exportOptions)
				)

				return listLayout
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
		})
	}

	function getEmptyLayoutData(ecosystemDefaults) {
		let reportCurrencyObj = null

		if (ecosystemDefaults.currency_object) {
			reportCurrencyObj = ecosystemDefaults.currency_object
		}

		let pricingPolicyObj = null

		if (ecosystemDefaults.pricing_policy_object) {
			pricingPolicyObj = ecosystemDefaults.pricing_policy_object
		}

		return {
			name: '',
			user_code: '',
			content_type: 'reports.performancereport',
			data: {
				additions: {},
				reportLayoutOptions: {
					datepickerOptions: {},
				},
				reportOptions: {
					begin_date: null,
					end_date: dayjs().format('YYYY-MM-DD'), // Nees lastBussiness day
					report_currency: ecosystemDefaults.currency || null,
					report_currency_object: reportCurrencyObj,
					calculation_type: 'time_weighted',
					segmentation_type: 'months',
					pricing_policy: ecosystemDefaults.pricing_policy || null,
					pricing_policy_object: pricingPolicyObj,
				},
				components: {
					period: true,
					detail: true,
					diagram: true,
				},
				exportOptions: {},
			},
		}
	}
</script>

<style lang="scss" scoped>
	.split_panel_wrap {
		display: grid;
		height: calc(100vh - 161px);
	}
	.split_panel {
		background: #fff;
	}
	.split_panel_main {
		overflow: auto;
	}
	.split_panel_devider {
		height: 5px;
		border-top: 1px solid $border;
		border-bottom: 1px solid $border;
		cursor: row-resize;
	}
</style>
