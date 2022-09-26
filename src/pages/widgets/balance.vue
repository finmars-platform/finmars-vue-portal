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

const toPercentage = (value, dimension) => {
	return typeof value === 'string' && value.endsWith('%') ?
    parseFloat(value) / 100
    : +value / dimension;
}
function getRatioAndOffset(rotation, circumference, cutout) {
  let ratioX = 1;
  let ratioY = 1;
  let offsetX = 0;
  let offsetY = 0;
  // If the chart's circumference isn't a full circle, calculate size as a ratio of the width/height of the arc
  if (circumference < TAU) {
    const startAngle = rotation;
    const endAngle = startAngle + circumference;
    const startX = Math.cos(startAngle);
    const startY = Math.sin(startAngle);
    const endX = Math.cos(endAngle);
    const endY = Math.sin(endAngle);
    const calcMax = (angle, a, b) => _angleBetween(angle, startAngle, endAngle, true) ? 1 : Math.max(a, a * cutout, b, b * cutout);
    const calcMin = (angle, a, b) => _angleBetween(angle, startAngle, endAngle, true) ? -1 : Math.min(a, a * cutout, b, b * cutout);
    const maxX = calcMax(0, startX, endX);
    const maxY = calcMax(HALF_PI, startY, endY);
    const minX = calcMin(PI, startX, endX);
    const minY = calcMin(PI + HALF_PI, startY, endY);
    ratioX = (maxX - minX) / 2;
    ratioY = (maxY - minY) / 2;
    offsetX = -(maxX + minX) / 2;
    offsetY = -(maxY + minY) / 2;
  }
  return {ratioX, ratioY, offsetX, offsetY};
}
 const PI = Math.PI;
 const TAU = 2 * PI;
 const PITAU = TAU + PI;
 const INFINITY = Number.POSITIVE_INFINITY;
 const RAD_PER_DEG = PI / 180;
 const HALF_PI = PI / 2;
 const QUARTER_PI = PI / 4;
 const TWO_THIRDS_PI = PI * 2 / 3;

 const toDimension = (value, dimension) =>
  typeof value === 'string' && value.endsWith('%') ?
    parseFloat(value) / 100 * dimension
    : +value;
class Custom extends DoughnutController {

	update(mode) {
		const chart = this.chart;
    const {chartArea} = chart;
    const meta = this.getMeta();
    const arcs = meta.data;
    const spacing = this.getMaxBorderWidth() + this.getMaxOffset(arcs) + this.options.spacing;
    const maxSize = Math.max((Math.min(chartArea.width, chartArea.height) - spacing) / 2, 0);
    const cutout = Math.min(toPercentage(this.options.cutout, maxSize), 1);
    const chartWeight = this._getRingWeight(this.index);

    // Compute the maximal rotation & circumference limits.
    // If we only consider our dataset, this can cause problems when two datasets
    // are both less than a circle with different rotations (starting angles)
    const {circumference, rotation} = this._getRotationExtents();
    const {ratioX, ratioY, offsetX, offsetY} = getRatioAndOffset(rotation, circumference, cutout);
    const maxWidth = (chartArea.width - spacing) / ratioX;
    const maxHeight = (chartArea.height - spacing) / ratioY;
    const maxRadius = Math.max(Math.min(maxWidth, maxHeight) / 2, 0);
    const outerRadius = toDimension(this.options.radius, maxRadius);
    const innerRadius = Math.max(outerRadius * cutout, 0);
    const radiusLength = (outerRadius - innerRadius) / this._getVisibleDatasetWeightTotal();
    this.offsetX = offsetX;
    this.offsetY = offsetY;

    meta.total = this.calculateTotal();

    this.outerRadius = outerRadius - radiusLength * this._getRingWeightOffset(this.index);
    this.innerRadius = Math.max(this.outerRadius - radiusLength * chartWeight, 0);

    this.updateElements(arcs, 0, arcs.length, mode);
  }
	updateElements(arcs, start, count, mode) {
    const reset = mode === 'reset';
    const chart = this.chart;
    const chartArea = chart.chartArea;
    const opts = chart.options;
    const animationOpts = opts.animation;
    const centerX = (chartArea.left + chartArea.right) / 2;
    const centerY = (chartArea.top + chartArea.bottom) / 2;
    const animateScale = reset && animationOpts.animateScale;
    const innerRadius = animateScale ? 0 : this.innerRadius;
    let outerRadius = animateScale ? 0 : this.outerRadius;
    const {sharedOptions, includeOptions} = this._getSharedOptions(start, mode);
    let startAngle = this._getRotation();
    let i;

    for (i = 0; i < start; ++i) {
      startAngle += this._circumference(i, reset);
    }
		console.log('=====================' + mode)

    for (i = start; i < start + count; ++i) {
      const circumference = this._circumference(i, reset);
      const arc = arcs[i];
			let newOuterRadius = innerRadius + arc.$context.parsed / 12 * innerRadius
      const properties = {
        x: centerX,
        y: centerY,
        startAngle,
        endAngle: startAngle + circumference,
        circumference,
        outerRadius: newOuterRadius,
        innerRadius,
      };
			console.log('properties:', properties)
      if (includeOptions) {
        properties.options = sharedOptions || this.resolveDataElementOptions(i, arc.active ? 'active' : mode);
      }
      startAngle += circumference;

      this.updateElement(arc, i, properties, mode);
    }
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

	let res = await useApi('widgetsHistory.get')
	console.log('res:', res)
	let active = ref(null)

	onMounted(() => {
		initPostMessageBus()

		let myChart = new Chart('myChart', {
			type: 'doughnut',
			data: {
				labels: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov'],
				datasets: [
					{
						label: 'Crypto',
						data: [5,3,6,12,3],
						backgroundColor: ['rgba(87, 117, 144, 0.5)', 'rgba(250, 103, 105, 0.5)'],
						hoverOffset: 4
					},
					{
						label: 'Monthly mi',
						data: [-9, -1],
						backgroundColor: 'rgba(250, 103, 105, 0.8)',
						// rotation: 10,
						// offset: 50,
						circumference: 180
					}
				],
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: {
						position: 'right',
						align: 'center',
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
