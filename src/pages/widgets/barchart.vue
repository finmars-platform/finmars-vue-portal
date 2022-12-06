<template>
	<div class="wrap">
		<div class="title">{{ widgetName }}</div>

		<div class="filters flex" v-show="status == 100">
			<div class="filter_item"
				v-for="(item, i) in categories"
				:key="i"
				:class="{active: categoryName == item}"
				@click="categoryName = item, updateData()"
			>
				{{ item }}
			</div>
		</div>

		<div class="content" v-show="status == 100">
			<canvas id="myChart"><p>Chart</p></canvas>
		</div>

		<div class="content flex-column aic jcc" v-if="status > 100">
			<div class="flex aic">
				<FmIcon v-if="status > 100" class="m-r-8" icon="report_problem" />
				{{ STATUSES[status] }}
			</div>
		</div>
	</div>
</template>

<script setup>

	import moment from 'moment'
	import {
  Chart,
  ArcElement,
  LineElement,
  BarElement,
  PointElement,
  BarController,
  BubbleController,
  DoughnutController,
  LineController,
  PieController,
  PolarAreaController,
  RadarController,
  ScatterController,
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

	Chart.register(
		ArcElement,
		LineElement,
		BarElement,
		PointElement,
		BarController,
		BubbleController,
		DoughnutController,
		LineController,
		PieController,
		PolarAreaController,
		RadarController,
		ScatterController,
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

	definePageMeta({
		layout: 'auth'
	});

	const STATUSES = {
		0: 'Loading data',
		101: 'Data are not available',
		102: 'Data are missing',
		103: 'Bad/incomplete input data'
	}
	let status = ref(0)

	let route = useRoute()
	let wId = route.query.wId
	let portfolioId = route.query.portfolioId
	let client = route.query.workspace
	let date_to = route.query.date_to
	let typeHistory = 'nav'
	let widgetName = ref('Balance (Historical)')
	let historyStats = {}


	async function getHistory() {
		let res = await useApi('widgetsHistory.get', {
			params: {
				type: typeHistory,
				client,
			},
			filters: {
				portfolio: portfolioId,
				date_to,
			},
			headers: {
				Authorization: 'Token ' + route.query.token
			}
		})

		if ( res.error ) {
			status.value = 101

			return false
		}

		if ( !res.items || res.items.length == 0  ) {
			status.value = 102

			return false
		}

		historyStats = res
		activeIndex.value = historyStats.items?.length - 1

		return true
	}
	let active = ref(null)
	let dataOfActive = ref({})
	let activeIndex = ref(null)
	let categoryName = ref('Asset Types')
	let categories = reactive(new Set())

	await getHistory()


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

	function updateData() {
		data.labels = []
		data.datasets = []

		createData()

		send({
			action: 'clickOnChart',
			data: {...dataOfActive.value},
			date: historyStats.items[activeIndex.value],
			category: categoryName.value
		})
		myChart.update()

	}


	function createData() {
		let dataByName = {}
		let dataset = []

		historyStats.items.forEach((date) => {
			data.labels.push(moment(date.date).format('MMM YY'))

			if ( !date.categories.length ) {
				for ( let prop in dataset ) {
					dataset[prop].data.push(null)
				}
			}

			date.categories.forEach((category) => {
				categories.add( category.name )
				if ( category.name != categoryName.value ) return false

				category.items.forEach((instrument, key) => {
					if ( !dataset[instrument.name] ) {
						dataset[instrument.name] = {
							data: [],
							total: 0
						}
					}

					dataset[instrument.name].label = instrument.name
					dataset[instrument.name].data.push(instrument.value)
					dataset[instrument.name].total += instrument.value
				})
			})
		})
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

	onMounted(async () => {
		initPostMessageBus()

		createData()
		status.value = 100
		await nextTick()

		myChart = new Chart('myChart', {
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
									let date = moment( rawDate[0] + ' 20' + rawDate[1] ).format('YYYY-MM-')

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

	function initPostMessageBus() {
		if ( window == top ) return false

		send({
			action: 'init'
		})

		window.addEventListener("message", async (e) => {
			if ( e.data.action == 'ready' ) {
				e.source.postMessage({
					action: 'clickOnChart',
					data: {...dataOfActive.value},
					date: historyStats.items[activeIndex.value],
					category: categoryName.value
				}, '*')
			}
			if ( e.data.action == 'updateOpts' ) {
				portfolioId = e.data.data.portfolioId
				date_to = e.data.data.date_to

				let success = await getHistory()

				if ( success ) status.value = 100
				updateData()
			}
			if ( e.data.action == 'changeHistoryType' ) {
				let map = {
					nav: 'nav',
					total: 'pl'
				}
				typeHistory = map[e.data.type]

				let success = await getHistory()
				if ( success ) status.value = 100

				widgetName.value = e.data.type == 'total' ? 'P&L (Historical)' : 'Balance (Historical)'

				updateData()
			}
		});
	}
	function send( data, source = window.parent ) {
		let dataObj = Object.assign(data, {
			wId,
		})
		source.postMessage( dataObj, "*" )
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
		height: calc(100vh - 100px);
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
