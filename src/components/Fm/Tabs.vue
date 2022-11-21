<template>
	<div class="fm_tabs">
		<div class="fm_tabs_item"
			v-for="(tab, index) in tabs"
			:key="index"
			:class="{active: tab == modelValue}"
			@click="$emit('update:modelValue', tab)"
		>
			{{ tab }}
		</div>
	</div>
</template>

<script setup>
	defineProps({
		modelValue: String,
		tabs: Array
	})
	defineEmits(['update:modelValue'])
</script>

<style lang="scss">

</style>
