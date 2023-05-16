<template>
	<div class="wrap" :class="{fullscreen: isFull}">
		<div class="title flex aic sb">
			<div>{{ widgetName }}</div>
			<FmIcon
				:icon="isFull ? 'fullscreen_exit' : 'fullscreen'"
				@click="isFull = !isFull"
			/>
		</div>

		<div class="content" v-if="status === 100">
			<div class="filters flex">
				<div class="filter_item"
					v-for="(item, i) in categories"
					:key="i"
					:class="{active: outputs.choosed_category.__val == item}"
					@click="outputs.choosed_category.__val = item, updateData()"
				>
					{{ item }}
				</div>
			</div>
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

	import dayjs from 'dayjs'
	import {
		Chart,
		BarElement,
		BarController,
		CategoryScale,
		LinearScale,
		Filler,
		Legend,
		Tooltip,
	} from 'chart.js';

	Chart.register(
		BarElement,
		BarController,
		CategoryScale,
		LinearScale,
		Filler,
		Legend,
		Tooltip,
	);

	const props = defineProps({
		wid: String
	})
	// 0-99 101-200
	const STATUSES = {
		0: 'Loading data',
		101: 'Data are not available',
	}
	let status = ref(0)

	let dashStore = useStoreDashboard()
	let historyStats = await dashStore.getHistory(props.wid)
	let component = dashStore.getWidget(props.wid)
	let widgetName = computed(() => {
		return inputs.value.type == 'pl' ? 'P&L (Historical)' : 'Balance (Historical)'
	})

	const inputs = computed(() => {
		let props = dashStore.props.inputs.filter((prop) => prop.component_id == component.uid)
		let obj = {}

		props.forEach((prop) => {
			obj[prop.key] = prop.__val
		})
		return obj
	})

	let outputs = computed(() => {
		let props = dashStore.props.outputs.filter((prop) => prop.component_id == component.uid)
		let obj = {}

		props.forEach((prop) => {
			obj[prop.key] = prop
		})
		return obj
	})


	if ( historyStats.error ) {
		status.value = 101
	}

	let active = ref(null)
	let isFull = ref(false)
	let dataOfActive = ref({})
	let activeIndex = ref(null)

	let categories = ref({})

	let data = {
		labels: [],
		datasets: [],
	}
	let myChart

	outputs.value.choosed_category.__val = 'Asset Types'
	createData()
	status.value = 100
	onMounted(async () => {
		if ( dayjs(inputs.value.date_to).diff(dayjs(), 'day') >= 0 ) {
			status.value = 101
			return false
		}
		createChart()

	})

	watch(inputs, async () => {
		if ( !Object.entries(inputs.value).length ) return false

		historyStats = await dashStore.getHistory(props.wid)
		updateData()
	})


	function createData() {
		if ( dayjs(inputs.value.date_to).diff(dayjs(), 'day') >= 0 ) {
			status.value = 101
			return false
		}
		let dataset = []
		categories.value = Object.keys(historyStats)

		for ( let date in historyStats[outputs.value.choosed_category.__val] ) {
			let formatedDate = dayjs(date).format('MMM YY')
			data.labels.push( formatedDate )

			for ( let instr in historyStats[outputs.value.choosed_category.__val][date].items ) {
				if ( !dataset[instr] ) {
					dataset[instr] = {
						data: {},
						total: 0
					}
				}

				dataset[instr].label = instr
				dataset[instr].data[formatedDate] = historyStats[outputs.value.choosed_category.__val][date].items[instr]
				dataset[instr].total += historyStats[outputs.value.choosed_category.__val][date].items[instr]
			}
		}

		for ( let prop in dataset ) {
			data.datasets.push( dataset[prop] )
		}

		data.datasets = data.datasets
			.sort( (a, b) => b.total - a.total)

		dataOfActive.value = {}

		data.datasets.forEach((item, key) => {
			item.backgroundColor = dashStore.instrColors[outputs.value.choosed_category.__val + item.label]

			dataOfActive.value[item.label] = item.data[activeIndex.value]
		})
		let notNull = Object.entries(historyStats[outputs.value.choosed_category.__val])
			.filter(item => item[1].total)

		if ( !outputs.value.choosed_date.__val )
			outputs.value.choosed_date.__val = notNull[notNull.length - 1][0]
	}

	function updateData() {
		data.labels = []
		data.datasets = []

		createData()

		// event
		myChart.update()
	}
	function createChart() {
		myChart = new Chart(props.wid, {
			type: 'bar',
			data: data,
			plugins: [{
				id: 'custom_canvas_background_color',
				afterDraw: (chart, args, options) => {
					let metas = chart.getSortedVisibleDatasetMetas()
					let allBarsByDay = []

					metas.forEach((categoty) => {
						categoty.data.forEach((date, key) => {
							if ( !allBarsByDay[key] ) allBarsByDay[key] = 0
							if (date.height) allBarsByDay[key] += date.height
						})
					})

					if ( activeIndex.value == null ) activeIndex.value = allBarsByDay.length - 1

					if ( !metas.length ) return false
					let active = metas[0].data[activeIndex.value]

					if ( !active ) return false

					const {ctx} = chart;
					ctx.save();
					ctx.globalCompositeOperation = 'destination-over';

					// Fill active
					ctx.fillStyle = options.color;
					ctx.fillRect(
						active.x - active.width * 1.25 / 2,
						chart.chartArea.top,
						active.width * 1.25,
						chart.chartArea.height
					);

					// Fill empty data
					ctx.fillStyle = options.nonActiveColor;
					allBarsByDay.forEach((item, key) => {
						if ( item ) return false

						let nullable = metas[0].data[key]

						ctx.fillRect(
							nullable.x - nullable.width * 1.25 / 2,
							chart.chartArea.top,
							nullable.width * 1.25,
							chart.chartArea.height
						);
					})

					ctx.restore();
				},
				defaults: {
					color: 'rgba(243, 123, 78, 0.2)',
					nonActiveColor: 'rgb(203, 203, 203, 0.4)',
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

									let newDate = Object.keys(historyStats[outputs.value.choosed_category.__val])
										.find(item => item.includes(date))

									sum = historyStats[outputs.value.choosed_category.__val][newDate].total

								})

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
					let metas = myChart.getSortedVisibleDatasetMetas()
					let index

					metas.forEach((dataset) => {
						let clickedElem = dataset.data.find( item => (item.x - (item.width * 1.25 / 2)) < evt.x && (item.x + (item.width * 1.25 / 2)) > evt.x )

						if ( clickedElem ) index = clickedElem.$context.parsed.x
					})

					const points = myChart.getElementsAtEventForMode(evt, 'nearest', { intersect: false, axis: 'x' }, true);

					if (points.length) {
						let data = {}
						let currentLabel

						try {
							let currentLabel = myChart.data.labels[index]

							points.forEach((item, i) => {
								data[myChart.data.datasets[item.datasetIndex].label] = myChart.data.datasets[item.datasetIndex].data[currentLabel]
							})
							active.value = points[0]
							myChart.update()

							activeIndex.value = index

							let rawDate = currentLabel.split(' ')
							let date = dayjs( rawDate[0] + ' 20' + rawDate[1] ).format('YYYY-MM-')

							outputs.value.choosed_date.__val =
								Object.keys(historyStats[outputs.value.choosed_category.__val])
									.find(item => item.includes(date))
						} catch (e) {
							console.log('Error in click:', e)
						}
					}
        }
			},
		});
	}
</script>

<style lang="scss" scoped>
	.wrap {
		border-radius: 5px;
		border: 1px solid $border;

		&.fullscreen {
			position: fixed;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			z-index: 1111;
			background: #fff;
		}
	}
	.title {
		height: 36px;
		line-height: 36px;
		background: $main-darken;
		padding: 0 20px;
	}
	.content {
		height: calc(100% - 72px);
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
