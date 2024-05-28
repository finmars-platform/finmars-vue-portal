<template>
	<div class="fm_container flex sb aic"
			 :style="{height: panelHeight}">
		<div class="flex aic">
			<slot name="leftActions" />
		</div>

		<div class="flex aic">
			<slot name="rightActions" />
		</div>
	</div>
</template>

<script setup>
	let props = defineProps({
		height: {
			type: String,
			default: '50px'
		}
	})

	let panelHeight = computed(() => {

		if (!isNaN(props.height)) {
			return props.height + 'px';
		}

		return props.height;

	});

</script>

<style lang="scss" scoped>
	.fm_container {
		background: var(--base-backgroundColor);
		padding-top: 0;
		padding-bottom: 0;
		border-bottom: 1px solid var(--table-border-color);
		box-sizing: border-box;
	}

	.ev_toolbar { // used inside components/Rv/performance.vue
		padding: 10px 30px;
	}
</style>
