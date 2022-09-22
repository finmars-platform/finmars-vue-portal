<template>
	<div style="height: 100vh;">
		<canvas id="myChart"><p>Chart</p></canvas>
	</div>
</template>

<script setup>
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
class Custom extends DoughnutController {

	update() {
		super.update(arguments)
		const meta = this.getMeta();
		const max = Math.max(...meta._dataset.data)

		meta.data.forEach((item) => {
			let value = item.$context.parsed

			if ( value < max ) {
				console.log('value:', value)

			}
		})
  }
};
Custom.id = 'derivedBubble';
Custom.defaults = DoughnutController.defaults;

// Stores the controller so that the chart initialization routine can look it up
	Chart.register(
		Custom,
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

	// let res = await useApi('widgetsHistory.get')
	let active = ref(null)

	onMounted(() => {
		initPostMessageBus()

		let myChart = new Chart('myChart', {
			type: 'derivedBubble',
			data: {
				labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
				datasets: [
					{
						label: 'Crypto',
						data: [-11,2,3,5,3,2,4,5,3,6,12,3],
						backgroundColor: ['rgba(87, 117, 144, 0.5)', 'rgba(250, 103, 105, 0.5)'],
						hoverOffset: 4
					},
					// {
					// 	label: 'Monthly mi',
					// 	data: [-9, -1],
					// 	backgroundColor: 'rgba(250, 103, 105, 0.8)',
					// 	// rotation: 10,
					// 	// offset: 50,
					// 	circumference: 180
					// }
				],
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: {
						position: 'right',
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

	function initPostMessageBus() {
		if ( window == top ) return false

		send({
			action: 'init'
		})

		window.addEventListener("message", (e) => {
			console.log('Iframe event:', e.source)
			e.source.postMessage("hi u", "*")
		});
	}
	function send( data, source = window.parent ) {
		let dataObj = Object.assign(data, {
			wId,
		})
		source.postMessage( dataObj, "*" )
	}
</script>
