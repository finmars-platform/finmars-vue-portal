import moment from "moment/moment";

export default () => {

	return reactive(
		{
			listLayout: {},
			reportOptions: {},
			additions: {},
			components: {},
			exportOptions: {},

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

			async setLayoutCurrentConfig(listLayout) {

				if (listLayout) {
					listLayout = recursiveDeepCopy(listLayout);

				} else {

					let edRes = await useApi('ecosystemDefaults.get');

					const ecosystemDefaults = (edRes.error) ? {} : edRes.results[0];

					listLayout = {
						name: "",
						user_code: "",
						content_type: "reports.performancereport",
						data: {
							additions: {},
							reportOptions: {
								begin_date: '0001-01-01',
								end_date: moment(new Date).format('YYYY-MM-DD'),
								report_currency: ecosystemDefaults.currency || null,
								calculation_type: "time_weighted",
								segmentation_type: "months",
								pricing_policy: ecosystemDefaults.pricing_policy || null,
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

				return new Promise(resolve => resolve());

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
