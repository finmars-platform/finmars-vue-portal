<template>
	<div class="wrap" :class="{fullscreen: isFull}">
		<div class="title flex aic sb">
			<div>Balance (time)</div>
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
					:class="{active: categoryName == item}"
					@click="categoryName = item, updateData()"
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

	let props = defineProps({
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
	let widget = dashStore.getWidget(props.wid)

	let scope = computed(() => {
		return dashStore.scopes[widget.scope]
	})
	scope.value._detail_date = '2022-09-09'
	if ( historyStats.error ) {
		status.value = 101
	}

	let active = ref(null)
	let isFull = ref(false)
	let typeHistory = 'nav'
	let dataOfActive = ref({})
	let activeIndex = ref(null)
	let categoryName = ref('Asset Types')
	let categories = ref({})

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

	createData()
	status.value = 100
	onMounted(() => {
		createChart()
	})

	function createData() {
		let dataset = []
		categories.value = Object.keys(historyStats)

		for ( let date in historyStats[categoryName.value] ) {
			let formatedDate = dayjs(date).format('MMM YY')
			data.labels.push( formatedDate )

			for ( let instr in historyStats[categoryName.value][date].items ) {
				if ( !dataset[instr] ) {
					dataset[instr] = {
						data: {},
						total: 0
					}
				}

				dataset[instr].label = instr
				dataset[instr].data[formatedDate] = historyStats[categoryName.value][date].items[instr]
				dataset[instr].total += historyStats[categoryName.value][date].items[instr]
			}
		}

		for ( let prop in dataset ) {
			let elem = dataset[prop]

			if ( elem.total == 0 ) continue

			data.datasets.push( dataset[prop] )
		}

		data.datasets = data.datasets
			.sort( (a, b) => b.total - a.total)

		dataOfActive.value = {}

		data.datasets.forEach((item, key) => {
			item.backgroundColor = COLORS[key]

			dataOfActive.value[item.label] = item.data[activeIndex.value]
		})
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
									sum = typeHistory == 'nav' ? item.nav : item.total
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

							scope.value._detail_date = Object.keys(historyStats).find(item => item.includes(date))
							console.log('scope.value._detail_date:', scope.value._detail_date)
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
