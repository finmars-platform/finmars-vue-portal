<template>
	<div class="wrap">
		<div class="title">Balance (time) </div>

		<div class="content">
			<canvas id="myChart"><p>Chart</p></canvas>
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

	let wId = useRoute().query.wId

	let histroy = await useApi('widgetsHistory.get')
	let active = ref(null)
	let last = ref({})

	onMounted(() => {
		initPostMessageBus()

		let data = {
			labels: [],
			datasets: [],
		}

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

		let categoryName = 'Asset Types'
		let categories = []

		histroy.items.forEach((date) => {
			data.labels.push(moment(date.date).format('MMM YY'))

			date.categories.forEach((category) => {
				categories.push( category.name )
				if ( category.name != categoryName ) return false

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


		data.datasets.forEach((item, key) => {
			item.backgroundColor = COLORS[key]

			last.value[item.label] = item.data[item.data.length - 1]
		})

		let myChart = new Chart('myChart', {
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
								var suffixes = ["", "k", "m", "b","t"];
								var suffixNum = Math.floor((""+value).length/3);
								var shortValue = parseFloat((suffixNum != 0 ? (value / Math.pow(1000,suffixNum)) : value).toPrecision(2));
								if (shortValue % 1 != 0) {
										var shortNum = shortValue.toFixed(1);
								}
								return shortValue+suffixes[suffixNum];
							}
						},
						grid: {
							tickWidth: 1,
							tickLength: 1,
						}
					}
				},
				plugins: {
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
					console.log('evt:', evt)
					console.log('points:', points)

					if (points.length) {
						let data = {}

						points.forEach((item, i) => {
							data[myChart.data.datasets[item.datasetIndex].label] = myChart.data.datasets[item.datasetIndex].data[item.index]
						})
						active.value = points[0]
						myChart.update()

						send({
							action: 'clickOnChart',
							data
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

		window.addEventListener("message", (e) => {
			if ( e.data.action == 'ready' ) {
				e.source.postMessage({
					action: 'clickOnChart',
					data: {...last.value}
				}, '*')
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
		height: calc(100vh - 38px);
	}
</style>
