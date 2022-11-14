<template>
	<div class="wrap">
		<div class="title">Balance (time) </div>

		<div class="filters flex">
			<div class="filter_item"
				v-for="(item, i) in categories"
				:key="i"
				:class="{active: categoryName == item}"
				@click="categoryName = item, updateData()"
			>
				{{ item }}
			</div>
		</div>

		<div class="content">
			<canvas :id="wid"><p>Chart</p></canvas>
		</div>
	</div>
</template>

<script setup>

	import dayjs from 'dayjs'
	import {
		Chart,
		BarElement,
		BarController,
		CategoryScale,
		LinearScale,
		LogarithmicScale,
		RadialLinearScale,
		TimeScale,
		TimeSeriesScale,
		Decimation,
		Filler,
		Legend,
		Title,
		Tooltip,
		SubTitle
	} from 'chart.js';

	let props = defineProps({
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

	let wid = 'barchart'
	let historyStats

	let active = ref(null)
	let dataOfActive = ref({})
	let activeIndex = ref(null)
	let categoryName = ref('Asset Types')
	let categories = reactive(new Set())

	let data = {
		labels: [],
		datasets: [],
	}
	let myChart
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
	]

	await getHistory()

	onMounted(() => {
		if (!historyStats) return false

		createData()
		Chart.register(
			BarElement,
			BarController,
			CategoryScale,
			LinearScale,
			LogarithmicScale,
			RadialLinearScale,
			TimeScale,
			TimeSeriesScale,
			Decimation,
			Filler,
			Legend,
			Title,
			Tooltip,
			SubTitle
		);
		myChart = new Chart(wid, {
			type: 'bar',
			data: data,
			plugins: [{
				id: 'custom_canvas_background_color',
				afterDraw: (chart, args, options) => {
					if ( !active.value ) return;
					const {ctx} = chart;
					ctx.save();
					ctx.globalCompositeOperation = 'destination-over';
					ctx.fillStyle = options.color;
					ctx.fillRect(
						active.value.element.x - active.value.element.width * 1.25 / 2,
						chart.chartArea.top,
						active.value.element.width * 1.25,
						chart.chartArea.height
					);
					ctx.restore();
				},
				defaults: {
					color: 'rgba(243, 123, 78, 0.2)'
				}
			}],
			options: {
				barPercentage: 0.8,
				categoryPercentage: 1.0,
				borderRadius: 3,
				responsive: true,
				maintainAspectRatio: false,
				scales: {
					x: {
						stacked: true,
					},
					y: {
						stacked: true,
						position: 'right',
						grace: '5%',
						ticks: {
							callback: function(value) {
								return new Intl.NumberFormat('en-US', {
										notation: "compact",
										maximumFractionDigits: 2
									}).format(parseFloat(value));
							}
						},
						grid: {
							tickWidth: 1,
							tickLength: 1,
						}
					}
				},
				plugins: {
					tooltip: {
						callbacks: {
							footer:  (tooltipItems) => {
								let sum = 0
								tooltipItems.forEach(function(tooltipItem) {
									let rawDate = tooltipItem.label.split(' ')
									let date = dayjs( rawDate[0] + ' 20' + rawDate[1] ).format('YYYY-MM-')

									let item = historyStats.items.find((item) => item.date.includes(date))
									sum = item.nav || item.total
								});
								return 'Total: ' + new Intl.NumberFormat('en-US', {
										style: 'currency',
										currency: 'USD',
									}).format(parseFloat(sum));
							}
						}
					},
					legend: {
						position: 'bottom',
						align: 'start',
						labels: {
							padding: 20,
							color: '#404040',
							boxWidth: 26,
							boxHeight: 26,
							font: {
								size: 16
							}
						}
					}
				},
				interaction: {
					mode: 'nearest',
					axis: 'x'
				},
				onClick: (evt) => {
					const points = myChart.getElementsAtEventForMode(evt, 'nearest', { intersect: false, axis: 'x' }, true);

					if (points.length) {
						let data = {}

						points.forEach((item, i) => {
							data[myChart.data.datasets[item.datasetIndex].label] = myChart.data.datasets[item.datasetIndex].data[item.index]
						})
						active.value = points[0]
						myChart.update()

						activeIndex.value = points[0].index
						send({
							action: 'clickOnChart',
							data,
							date: historyStats.items[points[0].index],
							category: categoryName.value
						})
					}
        }
			},
		});
	})
	async function getHistory(type = 'nav') {
		let apiOpts = {
			filters: {
				portfolio: props.portfolio,
				date_to: props.date_to
			},
			params: {
				type
			}
		}
		if ( props.client ) apiOpts.params.client = client
		if ( props.token ) apiOpts.headers = { Authorization: 'Token ' + props.token }

		let res = await useApi('widgetsHistory.get', apiOpts)

		if ( !res.error ) {
			historyStats = res
			activeIndex.value = historyStats.items.length - 1
		}
	}
	function updateData() {
		data.labels = []
		data.datasets = []

		createData()

		// event
		myChart.update()
	}
	function createData() {

		historyStats.items.forEach((date) => {
			data.labels.push(dayjs(date.date).format('MMM YY'))

			date.categories.forEach((category) => {
				categories.add( category.name )
				if ( category.name != categoryName.value ) return false

				category.items.forEach((instrument, key) => {
					if ( !data.datasets[key] ) {
						data.datasets[key] = {
							data: [],
							total: 0
						}
					}

					data.datasets[key].label = instrument.name
					data.datasets[key].data.push(instrument.value)
					data.datasets[key].total += instrument.value
				})
			})
		})
		data.datasets = data.datasets
			.filter((item) => item.total != 0)
			.sort( (a, b) => b.total - a.total)

		dataOfActive.value = {}

		data.datasets.forEach((item, key) => {
			item.backgroundColor = COLORS[key]

			dataOfActive.value[item.label] = item.data[activeIndex.value]
		})
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
		height: calc(100% - 36px);
	}
	.filters {
		margin-top: 12px;
		margin-left: 12px;
		overflow-x: auto;
    overflow-y: hidden;
	}
	.filter_item {
		height: 25px;
		line-height: 25px;
		padding: 0 15px;
		background: $main-darken;
		border-radius: 5px;
		cursor: pointer;

		&.active {
			background: $primary;
			color: $separ;
		}

		&+& {
			margin-left: 20px;
		}
	}
</style>
