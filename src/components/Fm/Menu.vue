<template>
	<div class="fm_menu" v-click-outside="() => isOpen = false">
		<div @click="toggle()" ref="activator">
			<slot name="btn" :isOpen="isOpen"></slot>
		</div>

		<div
			class="fm_drop"
			:class="{active: isOpen}"
			ref="popup"
		>
			<slot :close="() => isOpen = false"></slot>
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

	let clientWidth = window.innerWidth

	onMounted(() => {
		setTimeout(() => {
			let activatorRect = activator.value.getBoundingClientRect()
			let popupRect = popup.value.getBoundingClientRect()

			// Hack чтобы посчитать реальную ширину
			popup.value.style.position = 'absolute'
			popup.value.style.minWidth = `${popupRect.width}px`
			popup.value.style.width = `100%`

			// Y axios
			if ( props.anchor == 'bottom' ) {
				popup.value.style.top = `${activatorRect.height}px`
			}

			// X axios

			if ( clientWidth - activatorRect.right <= popupRect.width ) {
				popup.value.style.right = `0`
			}
		}, 20)
	})
	function toggle() {
		isOpen.value = !isOpen.value
	}
</script>

<style lang="scss" scoped>
	.fm_menu {
		position: relative;
		display: inline-block;
	}
	.fm_drop {
		position: fixed;
		display: inline-block;
		top: 33px;
		z-index: 123;
		box-shadow: 0 3px 11px 3px hsl(0deg 0% 60% / 40%);
		visibility: hidden;
		opacity: 0;

		&.active {
			opacity: 1;
			visibility: visible;
		}
	}
</style>
