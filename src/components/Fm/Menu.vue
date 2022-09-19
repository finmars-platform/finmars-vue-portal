<template>

	<div class="fm_menu" v-click-outside="() => isOpen = false">
		<div @click="toggle()" ref="activator" class="height-100">
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
		/** @values bottom, top, top-start */
		anchor: {
			type: String,
			default: 'bottom left',
		},
		menuMinHeight: String,
		offsetY: {
			type: Number,
			default: 0
		},
	})

	let isOpen = ref(false)
	let popup = ref(null) // DOM element
	let activator = ref(null) // DOM element

	let isTop = props.anchor.includes('top')
	let isBot = props.anchor.includes('bottom')
	let isLeft = props.anchor.includes('left')
	let isRight = props.anchor.includes('right')

	watch(isOpen, async () => {
		if ( !isOpen.value ) return false
		await nextTick()

		let activatorRect = activator.value.getBoundingClientRect()
		let popupRect = popup.value.getBoundingClientRect()

		let parent = popup.value.closest('.scrollable')
		let distanceToLeft, distanceToRight, distanceToTop, distanceToBottom

		if ( parent ) {
			let parentRect = parent.getBoundingClientRect()

			distanceToLeft = parentRect.left - activatorRect.left
			distanceToRight = parentRect.right - activatorRect.right
			distanceToTop = activatorRect.top - parentRect.top
			distanceToBottom = parentRect.bottom - activatorRect.bottom

		} else {

			distanceToLeft = window.innerWidth - activatorRect.left
			distanceToRight = window.innerWidth - activatorRect.right
			distanceToTop = activatorRect.top - window.innerHeight
			distanceToBottom = window.innerHeight - activatorRect.bottom
		}

		// Hack чтобы посчитать реальную ширину
		popup.value.style.position = 'absolute'
		popup.value.style.minWidth = `${popupRect.width}px`
		popup.value.style.width = `100%`
		console.log('popupRect.height:', popupRect.height)
		console.log('distanceToTop:', distanceToTop)



		// Y axios || if no anchor or anchor == bottom and top have distance
		if (
			( ((!isTop && !isBot) || isBot) && distanceToBottom >= popupRect.height )
			|| distanceToTop <= popupRect.height
		) {
			popup.value.style.top    = `${activatorRect.height + props.offsetY}px`
		} else {
			popup.value.style.bottom = `${activatorRect.height + props.offsetY}px`;
		}

		// X axios
		if (
			( ((!isLeft && !isRight) || isRight) && distanceToRight >= popupRect.width )
			|| distanceToLeft <= popupRect.width
		) {
			popup.value.style.right = `0`
		} else {
			popup.value.style.left = 0
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
