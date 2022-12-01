<template>
	<div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
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
	.lds-ellipsis {
		display: block;
		position: relative;
		width: 80px;
		height: 30px;
	}
	.lds-ellipsis div {
		position: absolute;
		top: calc(50% - 13px / 2);
		width: 13px;
		height: 13px;
		border-radius: 50%;
		background: $primary-lighten;
		animation-timing-function: cubic-bezier(0, 1, 1, 0);
	}
	.lds-ellipsis div:nth-child(1) {
		left: 8px;
		animation: lds-ellipsis1 0.6s infinite;
	}
	.lds-ellipsis div:nth-child(2) {
		left: 8px;
		animation: lds-ellipsis2 0.6s infinite;
	}
	.lds-ellipsis div:nth-child(3) {
		left: 32px;
		animation: lds-ellipsis2 0.6s infinite;
	}
	.lds-ellipsis div:nth-child(4) {
		left: 56px;
		animation: lds-ellipsis3 0.6s infinite;
	}
	@keyframes lds-ellipsis1 {
		0% {
			transform: scale(0);
		}
		100% {
			transform: scale(1);
		}
	}
	@keyframes lds-ellipsis3 {
		0% {
			transform: scale(1);
		}
		100% {
			transform: scale(0);
		}
	}
	@keyframes lds-ellipsis2 {
		0% {
			transform: translate(0, 0);
		}
		100% {
			transform: translate(24px, 0);
		}
	}
</style>
