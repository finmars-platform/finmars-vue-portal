<template>
	<div class="lds-ring" :style="{'--loader-type': type, '--loader-size': size + 'px', '--loader-border': border + 'px'}">
		<div></div>
		<div></div>
		<div></div>
		<div></div>
	</div>
</template>

<script setup>

	let props = defineProps({
		size: {
			type: String,
			default: '25'
		},
		border: {
			type: String,
			default: '3'
		},
		type: {
			type: String,
			default: 'primary'
		}
	})

</script>

<style lang="scss" scoped>
	$size: var(--loader-size);
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
	}

</style>
