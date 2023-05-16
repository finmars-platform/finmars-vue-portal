<template>
	<!-- <FmExpansionPanel :title="detailPortfolio + ' - ' + detailYear"> -->
	<FmExpansionPanel title="chart">
		<div style="height: 350px;">
			<canvas id="myChart"><p>Chart</p></canvas>
		</div>
	</FmExpansionPanel>
</template>

<script setup>

	import Chart from 'chart.js/auto';

	const props = defineProps({
		yearData: {
			type: Object
		}
	})

	let chart

	// updateChart( props.yearData.datasetMonth, props.yearData.datasetLine )
	watch(
		props,
		() => updateChart( props.yearData.datasetMonth, props.yearData.datasetLine )
	)

	function updateChart( datasetMonth, datasetLine ) {
		if ( !chart ) createChart()

		chart.data.datasets[0].data = datasetMonth
		chart.data.datasets[0].backgroundColor = [];

		if (datasetMonth) {
			chart.data.datasets[0].backgroundColor =
				datasetMonth.map(item => item > 0 ? '#a5d9c9' : '#fac878')
		}

		chart.data.datasets[1].data = datasetLine

		chart.update()
	}

	function createChart() {
		chart = new Chart('myChart', {
			type: 'bar',
			data: {
				labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
				datasets: [
					{
						label: 'Monthly Returns',
						data: [],
						backgroundColor: [],
						order: 1
					},
					{
						label: 'Cummulative Return',
						data: [],
						fill: '#f05a23',
						type: 'line',
						borderColor: '#f05a23',
						tension: 0.1,
						order: 0
					}
				],
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
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
							callback: function(value, index, ticks) {
								return value + '%';
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
