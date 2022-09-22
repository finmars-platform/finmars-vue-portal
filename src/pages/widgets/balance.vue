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
    draw() {
        // Call bubble controller method to draw all the points
        super.draw(arguments);

        // Now we can do some custom drawing for this dataset. Here we'll draw a red box around the first point in each dataset
        const meta = this.getMeta();
        const pt0 = meta.data[0];

        const {x, y} = pt0.getProps(['x', 'y']);
        const {radius} = pt0.options;

        const ctx = this.chart.ctx;
        ctx.save();
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 1;
        ctx.strokeRect(x - radius, y - radius, 2 * radius, 2 * radius);
        ctx.restore();
    }
};
Custom.id = 'derivedBubble';
Custom.defaults = BubbleController.defaults;

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
			type: 'doughnut',
			data: {
				labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
				datasets: [
					{
						label: 'Crypto',
						data: [-11,2,3,5,3,2,4,5,3,6,12,3],
						backgroundColor: ['rgba(87, 117, 144, 0.5)', 'rgba(250, 103, 105, 0.5)'],
						hoverOffset: 4,
						cutout: 50
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
			plugins: [{
				id: 'myEventCatcher',
				beforeEvent(chart, args, pluginOptions) {
					console.log('args:', args)
					const event = args.event;
					if (event.type === 'mouseout') {
						// process the event
					}
				}
			}],
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
		let res = myChart.elements
		console.log('myChart:', res)

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
