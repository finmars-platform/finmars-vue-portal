<template>
	<div class="rename-field">
		<FmTextField
			:model-value="data.key"
			label="ID"
			outlined
			compact
			hide-details
			class="rename-field__row"
		/>

		<FmTextField
			:model-value="data.name"
			label="Original name"
			outlined
			compact
			hide-details
			class="rename-field__row"
		/>

		<FmTextField
			:model-value="name"
			label="Name*"
			outlined
			compact
			hide-details
			@update:model-value="updateName"
		/>
	</div>
</template>

<script setup>
	import { ref } from 'vue';
	import { FmTextField } from '@finmars/ui';

	const props = defineProps({
		data: {
			type: Object
		}
	});
	const emits = defineEmits(['select', 'validate']);

	const name = ref(props.data.layout_name);

	function updateName(value) {
		name.value = value;
		emits('select', name.value);
		emits('validate', !!name.value);
	}
</script>

<style lang="scss" scoped>
	.rename-field {
		position: relative;
		width: 100%;
		max-width: 400px;
		padding: 0 16px;

		&__row {
			margin-bottom: 16px;
			pointer-events: none;
			cursor: default;
			opacity: 0.7;
		}
	}
</style>
