<template>
	<!-- <FmExpansionPanel :title="detailPortfolio + ' - ' + detailYear"> -->
	<FmExpansionPanel title="Chart">
		<div style="height: 350px;">
			<canvas id="myChart"><p>Chart</p></canvas>
		</div>
	</FmExpansionPanel>
</template>

<script setup>

	import Chart from 'chart.js/auto';

	const emits = defineEmits(['setMonth', 'refresh'])

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
				events: ['click'],
				onClick: function(event, array) {
					console.log("onclick", event, array);
					if (array.length > 0) {
						var chartElement = array[0];

						// Get the clicked bar's index and dataset
						var index = chartElement.index;
						var datasetIndex = chartElement.datasetIndex;

						// Access any property of the clicked bar, e.g., label or data
						var label = this.data.labels[index];
						var value = this.data.datasets[datasetIndex].data[index];

						// Reset all borders to 0
						Object.keys(this.data.datasets).forEach( (key) => {
							this.data.datasets[key].borderWidth = 0
						})

						console.log('this.data.datasets', this.data.datasets);

						// Add a border to the clicked bar
						this.data.datasets[datasetIndex].borderWidth = 3;  // Adjust the border width as needed

						this.data.datasets[datasetIndex].borderColor = 'orange';

						console.log(`Clicked on: ${label}, Value: ${value}`);

						emits('setMonth', {
							currentMonth: label,
						})

						// Add any other logic you want on bar click
					}
				},
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
