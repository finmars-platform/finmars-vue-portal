<template>
	<!-- <FmExpansionPanel :title="detailPortfolio + ' - ' + detailYear"> -->
	<div class="position-relative">
		<FmExpansionPanel title="Chart">

			<div style="justify-content: end; display: flex">
				<FmSelect style="width: 300px;"
						  v-model="performance_type"
						  :items="performanceTypeOpts"
						  @update:modelValue="updateChart(yearData.portfolioMonthsEndsRaw)"
				/>
			</div>

			<div style="height: 350px;">
				<canvas id="performanceYearsChart"><p>Chart</p></canvas>
			</div>

		</FmExpansionPanel>

		<div v-show="loadingData" class="loader-container">
			<FmLoader :size="100" />
		</div>
	</div>

</template>

<script setup>

import Chart from 'chart.js/auto';

const emits = defineEmits(['setMonth', 'refresh'])

const props = defineProps({
	/** Id of a bundle or a whole object of a bundle. */
	bundle: {
		type: [Number, Object],
	},
	yearData: {
		type: Object
	},

    calculation_type: {
        type: String,
    },
    report_currency: {
        type: [Number, String],
    },
    performance_unit: String,

})

let bundleId = computed(() => {

	if (!props.bundle) return null;

	if (typeof props.bundle == 'object' && props.bundle.id) {
		return props.bundle.id
	}

	if (typeof props.bundle == 'number') return props.bundle

})

let loadingData = ref(false);
let chart

let performanceTypeOpts = [
	{
		id: 'monthly',
		name: 'Monthly',
	},
	{
		id: 'cumulative',
		name: 'Cumulative',
	},
]


let performance_type = ref('monthly')

// updateChart( props.yearData.datasetMonth, props.yearData.datasetLine )
watch(
    () => [
        props.bundle,
        props.yearData,
    ],
	() => {

        if (props.bundle &&
			props.yearData && Object.keys(props.yearData).length) {

            updateChart(props.yearData.portfolioMonthsEndsRaw)

        }
        else {

            if (chart) {
                chart.destroy();
                createChart();
			}

		}

	},
	{deep: true}
)

async function getReports({period_type, end, ids, type = 'months'}) {

	let res = await useApi('performanceReport.post', {
		body: {
			save_report: false,
			period_type: period_type,
			end_date: end,
			calculation_type: props.calculation_type,
			segmentation_type: type,
			report_currency: props.report_currency,
			bundle: ids,
		},
	})

	return res
}

function getPeriodType(performanceType) {
	return performanceType.value === 'monthly' ? 'mtd' : 'ytd';
}

function getChartDataItem(res) {

	if (props.performance_unit === 'percent') {
		return parseFloat(res.grand_return * 100).toFixed(2);

	}

	return parseFloat(res.grand_absolute_pl).toFixed(2);

}

function updateChartBackgroundColor(dataset) {
	return dataset.map(item => item > 0 ? '#a5d9c9' : '#fac878');
}

let updateChartReqKey = null;

async function updateChart(portfolioMonthsEndsRaw) {

	const reqKey = useGenerateUniqueId(bundleId.value + '');
	updateChartReqKey = reqKey;

	loadingData.value = true;

	if (chart) {
		chart.destroy();
	}

	createChart();

	console.log('updateChart.props', props);

	// let ends = [];
	let dataPromises = [];

	if ( Array.isArray(portfolioMonthsEndsRaw) ) {

		dataPromises = portfolioMonthsEndsRaw.map(async item => {

			if (!item) {
				return null;
			}

			const period_type = getPeriodType(performance_type);
			const res = await getReports({ period_type, end: item, ids: bundleId.value });
			return getChartDataItem(res);

		});

	}


	let chartData;

	try {
		chartData = await Promise.all(dataPromises);
		loadingData.value = false;
	} catch (e) {
		loadingData.value = false;
        console.error(e);
		throw "Error above occurred while trying to load data for RvPerformanceChart";
	}

	if (updateChartReqKey !== reqKey) {
		// New request sent while old request was processing.
		// Discard result of old request.
		return;

	}

	chart.data.datasets[0].data = chartData;
	chart.data.datasets[0].backgroundColor = updateChartBackgroundColor(chartData);

	console.log('chart.data.datasets[0]', chart.data.datasets[0]);

	chart.update();
}

function createChart() {

	let type = 'bar';
	let datasets = [
		{
			label: 'Monthly Returns',
			data: [],
			backgroundColor: [],
			order: 1
		}
	]

	if (performance_type.value === 'monthly') {

		type = 'bar';

		datasets = [
			{
				label: 'Monthly Returns',
				data: [],
				backgroundColor: [],
				order: 1,
				minBarLength: 4,
			}

		]

	} else {

		type = 'line';
		datasets = [
			{
				label: 'Cumulative Returns',
				data: [],
				fill: '#f05a23',
				type: 'line',
				borderColor: '#f05a23',
				tension: 0.1,
				order: 0
			}
		]
	}


	chart = new Chart('performanceYearsChart', {
		type: type,
		data: {
			labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
			datasets: datasets,
		},
		options: {
			responsive: true,
			maintainAspectRatio: false,
			events: ['click', 'mousemove'],
			onHover: (event, chartElement) => {

				const target = event.native ? event.native.target : null;

				if (target) {
					target.style.cursor = chartElement[0] ? 'pointer' : 'default';
				}
			},
			onClick: function (event, array) {
				console.log("onclick", event, array);
				if (array.length > 0) {
					var chartElement = array[0];

					// Get the clicked bar's index and dataset
					var index = chartElement.index;
					var datasetIndex = chartElement.datasetIndex;

					// Access any property of the clicked bar, e.g., label or data
					var label = this.data.labels[index];
					var value = this.data.datasets[datasetIndex].data[index];

					// Reset all borders to 0
					Object.keys(this.data.datasets).forEach((key) => {
						this.data.datasets[key].borderWidth = 0
					})

					console.log('this.data.datasets', this.data.datasets);

					// Add a border to the clicked bar
					this.data.datasets[datasetIndex].borderWidth = 3;  // Adjust the border width as needed

					this.data.datasets[datasetIndex].borderColor = 'orange';

					console.log(`Clicked on: ${label}, Value: ${value}`);

					emits('setMonth', {
						currentMonth: label,
					})

					// Add any other logic you want on bar click
				}
			},
			plugins: {
				legend: {
					position: 'top',
					reverse: true
				},
				tooltip: {
					callbacks: {
						label: (tooltipItem) => {

							console.log('tooltipItem', tooltipItem);

							if (props.performance_unit === 'percent') {

								return tooltipItem.formattedValue + '%'

							} else {
								return tooltipItem.formattedValue;
							}

						},
					}
				}
			},
			scales: {
				y: {
					grace: '5%',
					ticks: {
						// Include a dollar sign in the ticks
						callback: function (value, index, ticks) {

							if (props.performance_unit === 'percent') {
								return value + '%';
							} else {
								return value;
							}

						}
					}
				}
			}
		},
	});
}

</script>

<style lang="scss" scoped>
	.loader-container {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}
</style>
