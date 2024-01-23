<template>
	<!-- <FmExpansionPanel :title="detailPortfolio + ' - ' + detailYear"> -->
	<FmExpansionPanel title="Chart">

		<div style="justify-content: end; display: flex">
			<FmSelect style="width: 300px;"
					  v-model="performance_type"
					  :items="performanceTypeOpts"
					  @update:modelValue="updateChart(yearData.portfolioMonthsEndsRaw)"
			/>
		</div>

		<div style="height: 350px;">
			<canvas id="myChart"><p>Chart</p></canvas>
		</div>
	</FmExpansionPanel>
</template>

<script setup>

import Chart from 'chart.js/auto';

const emits = defineEmits(['setMonth', 'refresh'])

const props = defineProps({
	bundleId: {
		type: [Number, Object],
	},
	reportOptions: {
		type: Object,
	},
	yearData: {
		type: Object
	}
})

let bundleId = computed(() => {

	if (!props.bundleId) return null;

	if (typeof props.bundleId == 'object' && props.bundleId.id) {
		return props.bundleId.id
	}

	if (typeof props.bundleId == 'number') return props.bundleId

})

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
	props,
	() => updateChart(props.yearData.portfolioMonthsEndsRaw)
)

async function getReports({period_type, end, ids, type = 'months'}) {

	// console.log('getReports.period_type', period_type)
	// console.log('getReports.end', end)
	// console.log('getReports.type', type)
	// console.log('getReports.ids', ids)
	// console.log('getReports.====')

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

function getChartDataItem(res, reportOptions) {
	return reportOptions.performance_unit === 'percent' ?
		parseFloat((res.grand_return * 100).toFixed(2)) :
		parseFloat(res.grand_absolute_pl.toFixed(2));
}

function updateChartBackgroundColor(dataset) {
	return dataset.map(item => item > 0 ? '#a5d9c9' : '#fac878');
}

async function updateChart(portfolioMonthsEndsRaw) {
	if (chart) {
		chart.destroy();
	}

	createChart();

	console.log('updateChart.props', props);

	const dataPromises = portfolioMonthsEndsRaw.map(async item => {
		const period_type = getPeriodType(performance_type);
		const res = await getReports({ period_type, end: item, ids: bundleId.value });
		return getChartDataItem(res, props.reportOptions);
	});

	const chartData = await Promise.all(dataPromises);

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
				order: 1
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


	chart = new Chart('myChart', {
		type: type,
		data: {
			labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
			datasets: datasets,
		},
		options: {
			responsive: true,
			maintainAspectRatio: false,
			events: ['click'],
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
				}
			},
			scales: {
				y: {
					grace: '5%',
					ticks: {
						// Include a dollar sign in the ticks
						callback: function (value, index, ticks) {

							if (props.reportOptions.performance_unit === 'percent') {
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

</style>
