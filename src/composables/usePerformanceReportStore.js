import { defineStore } from "pinia";
import moment from 'moment';

export default defineStore({
	id: "performanceReport",
	state: () => {
		return {
			instances: {}
		}
	},
	actions: {

		initInstance() {

			const instanceId = generateUniqueId('performanceReportState');


			this.instances[instanceId] = {
				listLayout: {},
				reportOptions: {},
				components: {},
				exportOptions: {},
			}

			return instanceId;

		},

		setListLayout(id, layout) {
			this.instances[id].listLayout = layout;
		},

		async setLayoutCurrentConfig (id, listLayout, template) {

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

			this.instances[id].components = JSON.parse(JSON.stringify(listLayout.data.components));
			this.instances[id].reportOptions = JSON.parse(JSON.stringify(listLayout.data.reportOptions));

			this.instances[id].additions = JSON.parse(JSON.stringify(listLayout.data.additions));
			this.instances[id].exportOptions = JSON.parse(JSON.stringify(listLayout.data.exportOptions));

			this.setListLayout(id, listLayout);

			return new Promise(resolve => resolve());

		},

	},
	getters: {
		reportOptions(state) {
			return (id) => state.instances[id].reportOptions;
		},

		components(state) {
			return (id) => state.instances[id].components;
		},

		exportOptions() {
			return (id) => state.instances[id].exportOptions;
		}

	}
});


