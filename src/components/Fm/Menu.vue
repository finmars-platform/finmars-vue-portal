<template>
	<div class="fm_menu">
		<div ref="activator" class="height-100">
			<slot name="btn" :isOpen="isOpen"></slot>
		</div>

		<Teleport :to="attach">
			<transition>
				<div
					v-if="isOpen"
					class="fm_drop"
					:class="fmDropClass"
					ref="popup"
					:style="{'min-height': minHeight}"
					v-click-outside="closeOnCo"
				>
					<slot :close="toggle"></slot>
				</div>
			</transition>
		</Teleport>
	</div>
</template>

<script setup>

	const props = defineProps({
		opened: Boolean,
		anchor: {
			type: String,
			default: 'bottom left',
		},
		relativeTo: [String, Node],

		openOnClick: {
			type: Boolean,
			default: true,
		},
		openOnHover: {
			type: Boolean,
			default: false,
		},
		openOnRightClick: {
			type: Boolean,
			default: false,
		},

		disabled: Boolean,
		closeOnClickOutside: {
			type: Boolean,
			default: true,
		},

		attach: {
			type: String,
			default: 'body',
		},

		minHeight: String,
		menuWidth: [Number, String],
		minWidth: [Number, String],

		positionX: Number,
		positionY: Number,
		offsetX: {
			type: Number,
			default: 0
		},
		offsetY: {
			type: Number,
			default: 0
		},
		fmDropClass: {
			type: String,
			default: ''
		},
	})

	const emit = defineEmits(['update:opened'])

	let isOpen = ref(false)
	let popup = ref(null) // DOM element
	let activator = ref(null) // DOM element

	let isTop = props.anchor.includes('top')
	let isBot = props.anchor.includes('bottom')
	let isLeft = props.anchor.includes('left')
	let isRight = props.anchor.includes('right')

	onMounted(() => {

		if ( props.openOnHover ) {
			activator.value.addEventListener('mouseover', () => {
				isOpen.value = true
			});
			activator.value.addEventListener('mouseleave', () => {
				isOpen.value = false
			});

		}
		else if (props.openOnRightClick) {

			activator.value.addEventListener('contextmenu', event => {

				event.preventDefault();
				event.stopPropagation();

				isOpen.value = true;

			});

		}
		else if (props.openOnClick) {
			activator.value.addEventListener('click', toggle);
		}

	});

	watch(
		() => props.opened,
		() => {
			if (!props.disabled) isOpen.value = props.opened;
		}
	)

	async function openHandlerBegins() {

		await nextTick()

		if (props.minWidth || props.minWidth === 0) {

			let minWidth = props.minWidth;

			if ( isNaN(props.minWidth) ) {
				minWidth = props.minWidth + 'px';
			}

			popup.value.style['min-width'] = minWidth;

		}

	}

	/*let isOpenHandler = async () => {

		if ( !isOpen.value ) return false
		await openHandlerBegins();

		let activatorRect = activator.value.getBoundingClientRect()
		let popupRect = popup.value.getBoundingClientRect()
		let parent = popup.value.closest('.scrollable')
		let distanceToLeft, distanceToRight, distanceToTop, distanceToBottom

		if ( parent ) {
			let parentRect = parent.getBoundingClientRect()

			distanceToLeft = Math.abs(parentRect.left - activatorRect.left - props.offsetX)
			distanceToRight = Math.abs(parentRect.right - activatorRect.right - props.offsetX)
			distanceToTop = Math.abs(activatorRect.top - parentRect.top - props.offsetY)
			distanceToBottom = Math.abs(parentRect.bottom - activatorRect.bottom - props.offsetY)

		} else {

			distanceToLeft = Math.abs(window.innerWidth - activatorRect.left - props.offsetX)
			distanceToRight = Math.abs(window.innerWidth - activatorRect.right - props.offsetX)
			distanceToTop = Math.abs(activatorRect.top - props.offsetY)
			distanceToBottom = Math.abs(window.innerHeight - activatorRect.bottom - props.offsetY)
		}

		// Hack чтобы посчитать реальную ширину
		popup.value.style.position = 'absolute'
		popup.value.style.minWidth = `${popupRect.width}px`
		popup.value.style.width = `100%`
		// Y axios || if no anchor or anchor == bottom and top have distance
		if (
			(
				( (!isTop && !isBot) || isBot )
				&& ( (distanceToBottom >= popupRect.height) || (distanceToBottom > distanceToTop) )
			)
			|| ((distanceToTop <= popupRect.height) && (distanceToBottom > distanceToTop))
		) {
			popup.value.style.top    = `${activatorRect.height + props.offsetY}px`
			popup.value.style.maxHeight = `${distanceToBottom - 15}px`
		} else {
			popup.value.style.bottom = `${activatorRect.height + props.offsetY}px`;
			popup.value.style.maxHeight = `${distanceToTop - 15}px`
		}
		// X axios
		if (
			(
				( (!isLeft && !isRight) || isRight)
				&& ((distanceToLeft >= popupRect.width) || (distanceToLeft > distanceToRight))
			)
			|| ((distanceToRight <= popupRect.width) && (distanceToLeft > distanceToRight))
		) {
			popup.value.style.right = 0 + props.offsetX + 'px'
			popup.value.style.left = 'auto'
		} else {
			popup.value.style.left = 0 + props.offsetX + 'px'
		}

	};*/

	const isOpenHandler = async () => {

		if ( !isOpen.value ) return false;

		/* Close other popups and dialogs with close on click outside
		 * Have to emulate click because of preventDefault(), preventPropagation()
		 * */
		document.body.click();

		await openHandlerBegins();

		popup.value.style.position = 'absolute';
		// popup.value.style['z-index'] = 55; // should be same as $modal-z-index inside variables.scss

		// const coords = targetElement.getBoundingClientRect();
		let positionX;
		if (props.positionX) positionX = props.positionX;

		let positionY;
		if (props.positionY) positionY = props.positionY;

		let activatorRect = activator.value.getBoundingClientRect();
		// let popupRect = popup.value.getBoundingClientRect()

        if (!props.minWidth && props.minWidth !== 0) {
            popup.value.style['min-width'] = activatorRect.width + 'px';
        }

		let popupHeight = popup.value.clientHeight;
		let popupWidth = popup.value.clientWidth;

		/*if (props.menuWidth === 'activator') {

			popupWidth = activatorRect.width;
			popup.value.style.width = popupWidth + 'px';

		}*/

		if (!positionX) {

			if (isLeft) {
				positionX = activatorRect['left'];

			} else {
				positionX = activatorRect['right'];
			}

		}

		if (!positionY) {
			positionY = isTop ? activatorRect['top'] : activatorRect['bottom'];
		}

		if (props.offsetX) {
			positionX = positionX + props.offsetX;
		}

		if (props.offsetY) {
			positionY = positionY + props.offsetY;
		}

		//#region Prevents popup from creeping out of window
		const windowHeight = document.body.clientHeight;
		const windowWidth = document.body.clientWidth;

		if (popupHeight > windowHeight) popupHeight = windowHeight;

		if (positionX + popupWidth > windowWidth) {
			popup.value.style.right = '0';
			popup.value.style.left = "auto";

		} else {
			popup.value.style.left = positionX + 'px';
			popup.value.style.right = "";
		}

		if (positionY + popupHeight > windowHeight) {
			popup.value.style.bottom = '0';
			popup.value.style.top = "auto";

		}
		else {
			popup.value.style.top = positionY + 'px';
			popup.value.style.bottom = "";
		}
		//#endregion Prevents popup from creeping out of window >

	};

	watch(isOpen, isOpenHandler)

	function toggle() {

		if (props.disabled) return;

		isOpen.value = !isOpen.value;

		emit('update:opened', isOpen.value);

	}

	let closeOnCo = {
		handler: function (event) {
			// needed when fm_drop attached to another element (e.g. body) instead of activator
			if ( ( popup.value && popup.value.contains(event.target) ) || activator.value.contains(event.target) ) return;

			isOpen.value = false;
			emit('update:opened', isOpen.value);

		},
		events: ['click', 'contextmenu'],
		isActive: props.closeOnClickOutside
	};

</script>

<style lang="scss" scoped>
.fm_menu {
	position: relative;
	display: inline-block;
}
.fm_drop {
	position: fixed;
	// z-index: 123;
	z-index: var(--modal-z-index);
	box-shadow: 0 3px 11px 3px hsl(0deg 0% 60% / 40%);
	display: inline-block;
	border-radius: 5px;
	overflow: auto;
	left: 0;
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
