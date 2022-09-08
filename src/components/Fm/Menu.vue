<template>

	<div class="fm_menu" v-click-outside="() => isOpen = false">
		<div @click="toggle()" ref="activator">
			<slot name="btn" :isOpen="isOpen"></slot>
		</div>

		<transition>
			<div
				v-if="isOpen"
				class="fm_drop"
				ref="popup"
				:style="{'min-height': menuMinHeight}"
			>
				<slot :close="() => isOpen = false"></slot>
			</div>
		</transition>

	</div>

</template>

<script setup>

	let props = defineProps({
		anchor: {
			type: String,
			default: 'bottom', // bottom, top, top-start
		},
		menuMinHeight: String
	})

	let isOpen = ref(false)
	let popup = ref(null) // DOM element
	let activator = ref(null) // DOM element

	let clientWidth = window.innerWidth
	let clientHeight = window.innerHeight

	watch(isOpen, async () => {
		if ( !isOpen.value ) return false
		await nextTick()

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
		else if ( clientHeight - activatorRect.bottom < popupRect.height ) {
			popup.value.style.bottom = `${activatorRect.height}px`;
		}

		// X axios

		if ( (clientWidth - activatorRect.right <= popupRect.width) || props.anchor.includes('right') ) {
			popup.value.style.right = `0`
		}
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
		z-index: 123;
		box-shadow: 0 3px 11px 3px hsl(0deg 0% 60% / 40%);
		display: inline-block;
		border-radius: 5px;
	}


	.v-enter-active,
	.v-leave-active {
		transition: opacity 0.3s ease;
	}

	.v-enter-from,
	.v-leave-to {
		opacity: 0;
	}
</style>
