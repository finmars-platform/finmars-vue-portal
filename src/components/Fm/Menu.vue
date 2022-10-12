<template>

	<div class="fm_menu" v-click-outside="closeOnCo">
		<div ref="activator" class="height-100">
			<slot name="btn" :isOpen="isOpen"></slot>
		</div>

		<Teleport :to="attach" :disabled="!!!attach">
			<transition>
				<div
					v-if="isOpen"
					class="fm_drop"
					ref="popup"
					:style="{'min-height': minHeight}"
				>
					<slot :close="toggle"></slot>
				</div>
			</transition>
		</Teleport>

	</div>

</template>

<script setup>

let props = defineProps({
	opened: Boolean,
	anchor: {
		type: String,
		default: 'bottom left',
	},
	relativeTo: [String, Node],

	openOn: {
		type: [String, Boolean],
		default: 'click',
	},

	attach: String,

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
	testProp: String
})

let emit = defineEmits(['cancel'])

let isOpen = ref(false)
let popup = ref(null) // DOM element
let activator = ref(null) // DOM element

let openEventsList = computed(() => {
	return props.openOn ? props.openOn.split(' ') : [];
});

let isTop = props.anchor.includes('top')
let isBot = props.anchor.includes('bottom')
let isLeft = props.anchor.includes('left')
let isRight = props.anchor.includes('right')

watch(
	() => props.opened,
	() => {
		isOpen.value = props.opened;
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

let isOpenHandler = async () => {

	if ( !isOpen.value ) return false
	await openHandlerBegins();

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
		distanceToTop = Math.abs(activatorRect.top - window.innerHeight)
		distanceToBottom = Math.abs(window.innerHeight - activatorRect.bottom)
	}

	// Hack чтобы посчитать реальную ширину
	popup.value.style.position = 'absolute'
	popup.value.style.minWidth = `${popupRect.width}px`
	popup.value.style.width = `100%`

	// Y axios || if no anchor or anchor == bottom and top have distance
	if (
		(
			( (!isTop && !isBot) || isBot )
			&& ((distanceToBottom >= popupRect.height) || (distanceToBottom > distanceToTop))
		)
		|| ((distanceToTop <= popupRect.height) && (distanceToBottom > distanceToTop))
	) {
		popup.value.style.top    = `${activatorRect.height + props.offsetY}px`
		popup.value.style.maxHeight = `${distanceToBottom - 20}px`
	} else {
		popup.value.style.bottom = `${activatorRect.height + props.offsetY}px`;
		popup.value.style.maxHeight = `${distanceToTop - 20}px`
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

};

if (props.attach && props.attach.toLowerCase() === 'body') {

	isOpenHandler = async () => {

		if ( !isOpen.value ) return false
		await openHandlerBegins();

		popup.value.style.position = 'absolute';
		popup.value.style['z-index'] = 2000; // should be same as $backdrop-z-index inside variables.scss

		// const coords = targetElement.getBoundingClientRect();
		let positionX;
		if (props.positionX) positionX = props.positionX;

		let positionY;
		if (props.positionY) positionY = props.positionY;

		let activatorRect = activator.value.getBoundingClientRect();
		// let popupRect = popup.value.getBoundingClientRect()

		let popupHeight = popup.value.clientHeight;
		let popupWidth = popup.value.clientWidth;

		if (props.menuWidth === 'activator') {

			popupWidth = activatorRect.width;
			popup.value.style.width = popupWidth + 'px';

		}

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
			popup.value.style.left = "";

		} else {
			popup.value.style.left = positionX + 'px';
			popup.value.style.right = "";
		}

		if (positionY + popupHeight > windowHeight) {
			popup.value.style.bottom = '0';
			popup.value.style.top = "";

		}
		else {
			popup.value.style.top = positionY + 'px';
			popup.value.style.bottom = "";
		}
		//#endregion Prevents popup from creeping out of window >

	};

}

watch(isOpen, isOpenHandler)

function toggle() {
	isOpen.value = !isOpen.value;
	if (!isOpen.value) emit('cancel');
}

function closeOnCo(event) {
	// needed when fm_drop attached to another element (e.g. body)
	if ((popup.value && popup.value.contains(event.target)) || activator.value.contains(event.target)) return;

	isOpen.value = false;
	emit('cancel');

}

onMounted(() => {

	if (openEventsList.value.includes('click')) {
		activator.value.addEventListener('click', toggle);
	}

});

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
	overflow: auto;
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
