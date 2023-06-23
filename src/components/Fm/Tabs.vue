<template>
	<div ref="tabsElem" class="fm_tabs">

		<div ref="tabsContainer" class="tabs_container">

<!--			<FmBtn
				v-if="showScrollBtns"
				:disabled="disableScrollLeft"
				class="display-block"
				@click="scrollLeft()"
			/>-->

			<div class="fm_tabs_item"
					 v-for="(tab, index) in tabs"
					 :key="index"
					 :class="{active: tab == modelValue}"
					 @click="$emit('update:modelValue', tab)"
			>
				{{ tab }}
			</div>

<!--			<FmBtn
				v-if="showScrollBtns"
				:disabled="disableScrollRight"
				class="display-block"
				@click="scrollRight()"
			/>-->

		</div>

	</div>
</template>

<script setup>

	defineProps({
		modelValue: String,
		tabs: Array
	})

	defineEmits(['update:modelValue'])

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
		console.log("testing1090 nextTabsWidth", nextTabsWidth);
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
		position: relative;
		display: flex;
		flex-wrap: nowrap;
	}

	.fm_tabs_item {
		text-wrap: nowrap;
	}
</style>
