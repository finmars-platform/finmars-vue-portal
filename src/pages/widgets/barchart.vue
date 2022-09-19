<template>
	<div style="height: 100vh;">
		<canvas id="myChart"><p>Chart</p></canvas>
	</div>
</template>

<script setup>
	import Chart from 'chart.js/auto';

	definePageMeta({
		layout: 'auth'
	});

	let wId = useRoute().query.wId

	onMounted(() => {
		initPostMessageBus()

		let chart = new Chart('myChart', {
			type: 'bar',
			data: {
				labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
				datasets: [
					{
						label: 'Crypto',
						data: [-1,2,3,5,3,2,4,5,3,6,12,3],
						backgroundColor: '#43AA8B',
					},
					{
						label: 'Cash & Equivalents',
						data: [4,5,3,5,3,6,4,5,9,4,11,3],
						backgroundColor: '#FA6769',
					},
					{
						label: 'Monthly Returns 3',
						data: [1,3,1,3,-9,8,4,5,3,6,3,3],
						backgroundColor: '#577590',
					}
				],
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				scales: {
					x: {
						stacked: true,
					},
					y: {
						stacked: true
					}
				},
				plugins: {
					legend: {
						position: 'top',
						reverse: true
					}
				},
				interaction: {
					mode: 'nearest',
					axis: 'x'
				},
				onClick: (evt) => {
					const points = chart.getElementsAtEventForMode(evt, 'nearest', { intersect: false, axis: 'x' }, true);

					if (points.length) {
						const firstPoint = points[0];
						const label = chart.data.labels[firstPoint.index];
						const value = chart.data.datasets[firstPoint.datasetIndex].data[firstPoint.index];

						send({
							action: 'clickOnChart',
							data: label
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
