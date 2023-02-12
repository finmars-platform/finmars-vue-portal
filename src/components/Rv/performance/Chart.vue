<template>
	<!-- <FmExpansionPanel :title="detailPortfolio + ' - ' + detailYear"> -->
	<FmExpansionPanel title="chart">
		<div style="height: 350px;">
			<canvas id="myChart"><p>Chart</p></canvas>
		</div>
	</FmExpansionPanel>
</template>

<script setup>

	import dayjs from 'dayjs'
	import Chart from 'chart.js/auto';

	let props = defineProps({
		end_date: {
			type: String
		}
	})

	function updateChart( datasetMonth, datasetLine ) {
		chart.data.datasets[0].data = datasetMonth
		chart.data.datasets[0].backgroundColor =
			datasetMonth.map(item => item > 0 ? '#a5d9c9' : '#fac878')

		chart.data.datasets[1].data = datasetLine

		chart.update()
	}

	// let chart = new Chart('myChart', {
	// 	type: 'bar',
	// 	data: {
	// 		labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
	// 		datasets: [
	// 			{
	// 				label: 'Monthly Returns',
	// 				data: portfolioItems.value[0],
	// 				backgroundColor: portfolioItems.value[0]?.map(item => item > 0 ? '#a5d9c9' : '#fac878'),
	// 				order: 1
	// 			},
	// 			{
	// 				label: 'Cummulative Return',
	// 				data: portfolioItemsCumm.value[0],
	// 				fill: '#f05a23',
	// 				type: 'line',
	// 				borderColor: '#f05a23',
	// 				tension: 0.1,
	// 				order: 0
	// 			}
	// 		],
	// 	},
	// 	options: {
	// 		responsive: true,
	// 		maintainAspectRatio: false,
	// 		plugins: {
	// 			legend: {
	// 				position: 'top',
	// 				reverse: true
	// 			}
	// 		},
	// 		scales: {
	// 			y: {
	// 				grace: '5%',
	// 				ticks: {
	// 					// Include a dollar sign in the ticks
	// 					callback: function(value, index, ticks) {
	// 						return value + '%';
	// 					}
	// 				}
	// 			}
	// 		}
	// 	},
	// });

</script>

<style lang="scss" scoped>

</style>
