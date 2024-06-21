<template>
	<label class="toggle-switch">
		<input
			type="checkbox"
			:checked="checked"
			@click="emit('change')">
		<span class="slider round"></span>
	</label>
</template>

<script setup lang="ts">
	defineProps({
		checked: Boolean,
	});
	let emit = defineEmits(['change']);
</script>

<style scoped lang="scss">

	//styles for toggle button

	.toggle-switch {
		position: relative;
		display: inline-block;
		width: 52px;
		height: 32px;
	}

	.toggle-switch input {
		opacity: 0;
		width: 0;
		height: 0;
	}

	.slider {
		position: absolute;
		cursor: pointer;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: var(--primary-color);
		transition: .4s;
	}

	.slider:before {
		position: absolute;
		content: "";
		height: 24px;
		width: 24px;
		left: 2px;
		bottom: 4px;
		background-color: var(--onPrimary-color);
		transition: .4s;
	}

	input:checked + .slider {
		background-color: var(--primary-color); /* Adjust the color to match the image */
	}

	input:checked + .slider:before {
		left: 0px;
	}

	input:checked + .slider:before {
		transform: translateX(26px);
	}

	.slider.round {
		border-radius: 34px;
	}

	.slider.round:before {
		border-radius: 50%;
	}
</style>
