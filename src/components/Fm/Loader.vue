<template>
<!--	<div class="lds-ring" :style="{'&#45;&#45;loader-type': type, '&#45;&#45;loader-size': size + 'px', '&#45;&#45;loader-border': border + 'px'}">
		<div></div>
		<div></div>
		<div></div>
		<div></div>
	</div>-->
	<div
		class="loader_container"
		:class="{'position_center': positionCenter}">

		<div
			class="loader_holder"
			:class="sizeComp"
		>

			<img src="/img/sphere.png" alt="">

			<div
				class="loader_elem"
				:style="
					`border-top-color: ${colorRef};
					border-right-color: ${colorRef}`
				"
			></div>

		</div>

	</div>

</template>

<script setup>

	let props = defineProps({
		size: {
			type: Number,
			default: 30
		},
		border: {
			type: String,
			default: '3'
		},
		type: {
			type: String,
			default: 'primary'
		},
		positionCenter: Boolean,
	})

  const brightColors = [
    '#FF5733', '#FFC300', '#36D7B7', '#3399FF', '#FF33FF', // Original colors
    '#FF6666', '#FF9900', '#66FF66', '#33CCFF', '#FF66CC', // Additional colors
    '#FF9966', '#FFCC00', '#00FF00', '#66CCFF', '#FF66FF',
    '#FFCCCC', '#FFFF00', '#00FF99', '#99CCFF', '#CC33FF',
    '#FFCC99', '#FFFF33', '#33FF33', '#66CCCC', '#CC66FF',
    '#FF9999', '#FFFF66', '#66FFCC', '#99A8FF', '#FF99FF',
    '#FF0000', '#FFCC66', // More colors
    '#FF8533', '#FFB600', '#66FF33', '#3399CC', '#FF00FF',
    '#FF8080', '#FFCC33', '#33FF66', '#66A3FF', '#FF00CC',
    '#FFA07A', '#FFD700', '#00FF7F', '#6699FF', '#FF0099',
    '#FFA500', '#FFCC7F', '#00FFBF', '#99BBFF', '#FF0099',
    '#FFB347', '#FFDD00', '#7FFF00', '#3399FF', '#FF1493',
    '#FF6347', '#FFE303', '#32CD32', '#66CCFF', '#C71585',
    '#FF4500', '#FFD700', // Even more colors
    '#A020F0', '#FF69B4', '#9932CC', '#DA70D6', '#FFB6C1',
    '#800080', '#FF00FF', '#FF1493', '#FF69B4', '#C71585',
    '#9400D3', '#D8BFD8', '#FFA07A', '#FF6EB4', '#FF82AB',
    '#800080', '#EE82EE', '#FF66CC', '#FF81C0', '#FF00FF',
    '#800080', '#DA70D6', '#FF1493', '#FF69B4', '#C71585',
    '#9932CC', '#BA55D3', '#9370DB', '#8A2BE2', '#9400D3',
    '#9932CC', '#8B008B', '#800080', '#FF00FF', '#C71585',
    '#FFA500', '#FFD700', '#00FF7F', '#6699FF', '#FF0099',
    '#FF8533', '#FFB600', '#66FF33', '#3399CC', '#FF00FF',
    '#FF8080', '#FFCC33', '#33FF66', '#66A3FF', '#FF00CC',
    '#FFA07A', '#FFD700', '#00FF7F', '#6699FF', '#FF0099',
    '#FFA500', '#FFCC7F', '#00FFBF', '#99BBFF', '#FF0099',
    '#FFB347', '#FFDD00', '#7FFF00', '#3399FF', '#FF1493',
    '#FF6347', '#FFE303', '#32CD32', '#66CCFF', '#C71585',
    '#FF4500', '#FFD700', // More and more colors
    '#A020F0', '#FF69B4', '#9932CC', '#DA70D6', '#FFB6C1',
    '#800080', '#FF00FF', '#FF1493', '#FF69B4', '#C71585',
    '#9400D3', '#D8BFD8', '#FFA07A', '#FF6EB4', '#FF82AB',
    '#800080', '#EE82EE', '#FF66CC', '#FF81C0', '#FF00FF',
    '#800080', '#DA70D6', '#FF1493', '#FF69B4', '#C71585',
    '#9932CC', '#BA55D3', '#9370DB', '#8A2BE2', '#9400D3',
    '#9932CC', '#8B008B', '#800080', '#FF00FF', '#C71585',
    '#FFA500', '#FFD700', '#00FF7F', '#6699FF', '#FF0099',
    '#FF8533', '#FFB600', '#66FF33', '#3399CC', '#FF00FF',
    '#FF8080', '#FFCC33', '#33FF66', '#66A3FF', '#FF00CC'
  ];

  const sizeComp = computed(() => `loader_size_${props.size}`)

  let colorInterval;
  const colorRef = ref('');

  onUnmounted(() => {
    clearInterval(colorInterval);
  })

  function rotateColor() {

    return setInterval(() => {

      const randomIndex = Math.floor(Math.random() * brightColors.length);

      colorRef.value = brightColors[randomIndex];

    }, 2*1000);

  }

  colorInterval = rotateColor();

</script>

<style lang="scss" scoped>
	/*$size: var(--loader-size);
	$border: var(--loader-border);
	.lds-ring {
		display: inline-block;
		position: relative;
		width: $size;
		height: $size;
		vertical-align: middle;
	}
	.lds-ring div {
		box-sizing: border-box;
		display: block;
		position: absolute;
		width: calc($size - 4px);
		height: calc($size - 4px);
		border: $border solid $primary;
		border-radius: 50%;
		animation: lds-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
		border-color: $primary transparent transparent transparent;
	}
	.lds-ring div:nth-child(1) {
		animation-delay: -0.45s;
	}
	.lds-ring div:nth-child(2) {
		animation-delay: -0.3s;
	}
	.lds-ring div:nth-child(3) {
		animation-delay: -0.15s;
	}
	@keyframes lds-ring {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}*/

	.loader_container.position_center {
		position: absolute;
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100%;
		width: 100%;
		top: 0;
		left: 0;
	}

	.loader_holder {
	background: #fff;
	position: relative;
	border-radius: 50%;
	/* border: 1px solid red; */
	text-align: center;
	box-shadow: 0 0 10px rgba(0,0,0,1);
	display: flex;
	justify-content: center;
	align-items: center;

	img {
	  width: 75%;
	  height: 75%;

	  animation: rotateCounterClockwise 20s linear infinite; /* Adjust duration as needed */

	}

	@keyframes rotateCounterClockwise {
	  0% {
		transform: rotate(0deg);
	  }
	  100% {
		transform: rotate(-360deg);
	  }
	}

	}

	.loader_elem {
	border: .2em solid transparent;
	border-top-color: #F05A22;
	border-radius: 50%;
	position: absolute;
	width: 100%;
	height: 100%;

	transition: border-top-color 2s linear, border-right-color 2s linear;
	animation: 1s rotateClockwise linear infinite;

	&:before {
	  content: '';
	  display: block;
	  width: inherit;
	  height: inherit;
	  position: absolute;
	  top: -.2em;
	  left: -.2em;
	  border: .2em solid currentcolor;
	  border-radius: 50%;
	  opacity: .2;
	}

	@keyframes rotateClockwise {
	  0% {
		transform: rotate(0deg);
	  }
	  100% {
		transform: rotate(360deg);
	  }
	}

	}

	@for $i from 10 through 100 {

	.loader_size_#{$i} {
	  width: #{$i}px;
	  height: #{$i}px;
	}

	}

</style>
