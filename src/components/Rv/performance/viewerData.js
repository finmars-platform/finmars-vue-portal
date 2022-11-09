import moment from "moment/moment";

export function getEmptyLayoutData (ecosystemDefaults) {

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
			reportOptions: {
				begin_date: null,
				end_date: moment(new Date).format('YYYY-MM-DD'),
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

export default () => {

	return reactive(
		{
			listLayout: {},
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

				this.components = JSON.parse(JSON.stringify(listLayout.data.components));
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
