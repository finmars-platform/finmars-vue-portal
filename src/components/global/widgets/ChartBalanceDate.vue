<template>
	<div class="wrap">
		<div class="title flex aic sb">
			<div>Balance (USD)</div>
			<div>{{ total }}</div>
		</div>

		<div v-if="status == 100" class="content">
			<canvas :id="wid"><p>Chart</p></canvas>
		</div>
		<div class="content flex-column aic jcc" v-else>
			<div class="flex aic">
				<FmIcon v-if="status > 100" class="m-r-8" icon="report_problem" />
				{{ STATUSES[status] }}
			</div>

			<FmLoaderData v-if="status < 100" />
		</div>
	</div>
</template>

<script setup>

	import {
		Chart,
		ArcElement,
		DoughnutController,
		Filler,
		Legend,
		Tooltip,
	} from 'chart.js';

	Chart.register(
		ArcElement,
		DoughnutController,
		Filler,
		Legend,
		Tooltip,
	);
	let props = defineProps({
		wid: {
			type: String,
			required: true
		},
		portfolio: {
			type: Number,
			required: true
		},
		date_to: {
			type: String,
			required: true
		},
		type: {
			type: String,
			defoult: 'nav'
		},
		client: String,
		token: String,
		frameMod: Boolean,
	})

	const STATUSES = {
		0: 'Waiting [barchart] data',
		101: 'Data are not available',
	}
	let status = ref(0)

	const COLORS = [
		'#577590CC',
		'#43AA8BCC',
		'#F9AB4B',
		'#FA6769',
		'#F9C74F',
		'#979BFF',
		'#D9ED92',
		'#C8D7F9',
		'#96B5B4',
		'#AB7967',
		'#577590CC',
		'#43AA8BCC',
		'#F9AB4B',
		'#FA6769',
		'#F9C74F',
		'#979BFF',
		'#D9ED92',
		'#C8D7F9',
		'#96B5B4',
		'#AB7967',
		'#577590CC',
		'#43AA8BCC',
		'#F9AB4B',
		'#FA6769',
		'#F9C74F',
		'#979BFF',
		'#D9ED92',
		'#C8D7F9',
		'#96B5B4',
		'#AB7967'
	]

	let total = ref('0 USD')
	let active = ref(null)
	let myChart
	let data = ref({
		labels: [],
		datasets: [
			{
				data: [],
				hoverOffset: 4
			},
			{
				data: [],
				circumference: 180
			}
		],
	})

	onMounted(() => {
		myChart = new Chart(props.wid, {
			type: 'doughnut',
			data: data.value,
			options: {
				cutout: '35%',
				responsive: true,
				maintainAspectRatio: false,
				onResize(chart, size) {
					let { position } = chart.options.plugins.legend

					if ( size.width < 500 && position == 'right' ) {
						chart.options.plugins.legend.position = 'bottom'
						chart.options.plugins.legend.labels.padding = 10

					} else if ( size.width > 500 && position == 'bottom') {

						chart.options.plugins.legend.position = 'right'
						chart.options.plugins.legend.labels.padding = 0
					}
				},
				plugins: {
					legend: {
						position: 'right',
						align: 'center',
						labels: {
							padding: 0,
							color: '#404040',
							boxWidth: 30,
							boxHeight: 30,
							maxWidth: 300,
							font: {
								size: 16
							},
							generateLabels: function(chart) {
								const original = Chart.overrides.pie.plugins.legend.labels.generateLabels;
           			let labelsOriginal = original.call(this, chart);

								labelsOriginal.forEach((item, i) => {
									item.datasetIndex = 0
									item.fillStyle = inheritColors[item.text]

									if ( data.value.datasets[0].data.length <= i ) {
										item.datasetIndex = 1
										item.index = i - data.value.datasets[0].data.length
									}
									let percent = Math.round(
										data.value.datasets[item.datasetIndex].data[item.index]
										/ parseFloat(total.value.replaceAll(',', ''))
										* 10000
									) / 100
									item.text = percent + '% | ' + item.text
								})

								return labelsOriginal
							}
						},
						onClick: function(mouseEvent, legendItem, legend) {

						},
					},

					tooltip: {
						callbacks: {
							label: function(context) {
								let labelIndex = context.dataIndex
								if ( context.datasetIndex === 1 ) {
									labelIndex = context.chart.data.datasets[0].data.length
								}

								return context.chart.data.labels[labelIndex] + ': ' + context.formattedValue;
							}
						}
					}
				},
				onClick: (evt) => {
					const points = myChart.getElementsAtEventForMode(evt, 'nearest', { intersect: false, axis: 'x' }, true);

					if (points.length) {
						const firstPoint = points[0];
						console.log('firstPoint:', firstPoint)
						const label = myChart.data.labels[firstPoint.index];
						const value = myChart.data.datasets[firstPoint.datasetIndex].data[firstPoint.index];

					}
        }
			},
		});
	})

	function precisionTick(value) {
		return new Intl.NumberFormat('en-US', {
			notation: "compact",
			maximumFractionDigits: 2
		}).format(value);
	}
</script>

<style lang="scss" scoped>
	.wrap {
		border-radius: 5px;
		border: 1px solid $border;
	}
	.title {
		height: 36px;
		line-height: 36px;
		background: $main-darken;
		padding: 0 20px;
	}
	.content {
		height: calc(100% - 38px);
	}
</style>
