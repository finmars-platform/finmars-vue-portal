<template>
	<div class="fm_menu" v-click-outside="() => isOpen = false">
		<div @click="toggle()" ref="activator">
			<slot name="btn"></slot>
		</div>

		<div
			class="fm_drop"
			:class="{active: isOpen}"
			ref="popup"
		>
			<slot></slot>
		</div>
	</div>
</template>

<script setup>

	let props = defineProps({
		anchor: {
			type: String,
			default: 'bottom', // bottom, top, top-start
		}
	})

	let isOpen = ref(false)
	let popup = ref(null) // DOM element
	let activator = ref(null) // DOM element

	onMounted(() => {
		let activatorRect = activator.value.getBoundingClientRect()
		let popupRect = popup.value.getBoundingClientRect()

		if ( props.anchor == 'bottom' ) {
			popup.value.style.position = 'absolute'
			popup.value.style.top = `${activatorRect.height}px`
			popup.value.style.width = `${popupRect.width}px`
		}

	})
	function toggle() {
		isOpen.value = !isOpen.value
	}
</script>

<style lang="scss" scoped>
	.fm_menu {
		position: relative;
	}
	.fm_drop {
		position: fixed;
		display: inline-block;
		min-width: 100px;
		top: 33px;
		z-index: 123;
		box-shadow: 0px 3px 11px 3px #64646466;
		visibility: hidden;
		opacity: 0;

		&.active {
			opacity: 1;
			visibility: visible;
		}
	}
</style>
