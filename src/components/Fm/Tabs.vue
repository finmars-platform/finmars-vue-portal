<template>
	<div class="tabs_container">
		<!--			<FmBtn
			v-if="showScrollBtns"
			:disabled="disableScrollLeft"
			class="display-block"
			@click="scrollLeft()"
		/>-->
		<FmBtn
			v-if="!swiperData.isBeginning || !swiperData.isEnd"
			class="slide_btn"
			type="iconBtn"
			:disabled="swiperData.isBeginning"
			@click="slidePrev"
		>
			<FmIcon icon="chevron_left" />
		</FmBtn>

		<swiper ref="swiperElem" slidesPerView="auto" @swiper="onSwiperInit">
			<swiper-slide v-for="(tab, index) in tabs" :key="index">
				<div
					class="fm_tabs_item"
					:class="{ active: tab == modelValue }"
					@click="$emit('update:modelValue', tab)"
				>
					{{ tab }}
				</div>
			</swiper-slide>
		</swiper>

		<FmBtn
			v-if="!swiperData.isBeginning || !swiperData.isEnd"
			class="slide_btn"
			type="iconBtn"
			:disabled="swiperData.isEnd"
			@click="slideNext"
		>
			<FmIcon icon="chevron_right" />
		</FmBtn>

		<!--			<FmBtn
			v-if="showScrollBtns"
			:disabled="disableScrollRight"
			class="display-block"
			@click="scrollRight()"
		/>-->
	</div>
</template>

<script setup>
	import { Swiper, SwiperSlide } from 'swiper/vue'

	const swiperElem = ref(null)

	defineProps({
		modelValue: String,
		tabs: Array,
	})

	defineEmits(['update:modelValue'])

	let swiperData = ref({})

	function onSwiperInit(swiperInst) {
		swiperData.value = swiperInst
	}

	function slidePrev() {
		swiperData.value.slidePrev()
	}

	function slideNext() {
		swiperData.value.slideNext()
	}
	/*onMounted(() => {

		allowedWidth = tabsElem.value.clientWidth;
		containerWidth = tabsContainerElem.value.clientWidth;

		showScrollBtns.value = allowedWidth >= containerWidth;

		// prevTabsWidth = containerLeft;



	})

	let showScrollBtns = ref(false);
	let disableScrollRight = ref(false);
	let disableScrollLeft = ref(false);

	let tabsElem = ref(null);
	let tabsContainerElem = ref(null);

	let allowedWidth;
	let containerWidth;
	let containerLeft;

	let nextTabsWidth = 0;
	let prevTabsWidth = 0;

	function scrollLeft() {

		containerLeft = tabsContainerElem.value.style.left || 0;

		nextTabsWidth = allowedWidth - containerWidth + containerLeft;
		nextTabsWidth = Math.max(0, nextTabsWidth);

		tabsContainerElem.value.style.left = ;

	}

	function scrollRight() {

		containerLeft = tabsContainerElem.value.style.left || 0;
		tabsContainerElem.value.style.left = containerLeft + nextTabsWidth;

		nextTabsWidth = allowedWidth - containerWidth + containerLeft;
		nextTabsWidth = Math.max(0, nextTabsWidth);

	}*/
</script>

<style lang="scss">
	.fm_tabs {
		overflow: hidden;
	}

	.tabs_container {
		/*position: relative;
		display: flex;
		flex-wrap: nowrap;*/
		display: flex;
	}

	.fm_tabs_item {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		height: 48px;
		padding: 12px 24px;
		text-wrap: nowrap;
	}

	.swiper {
		margin: initial;
	}

	.swiper-slide {
		width: auto;
		flex-shrink: 1;
	}

	.slide_btn {
		width: 32px;

		&:not([disabled]):hover {
			background-color: $primary-lighten-2;
		}
	}
</style>
