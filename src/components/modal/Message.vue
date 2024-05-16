<template>
	<BaseModal
		:modelValue="modelValue"
		:title="title"
		@close="onClose">
		<div class="modal-content">
			<div v-if="descriptionTitle || description" class="error-text">
				<b v-if="descriptionTitle" class="error-title">
					{{descriptionTitle}}
				</b>
				<span v-if="description">
					{{description}}
				</span>
			</div>
			<div v-else class="loading-style">
				<FmLoader />
			</div>
		</div>
		<template #controls="{ cancel }">
			<slot name="controls" :cancel="cancel"></slot>
		</template>
	</BaseModal>
</template>

<script setup>
	defineProps({
		modelValue: Boolean,
		title:{
			required: true,
			type: String
		},
		descriptionTitle: String,
		description: String
	})

	let emit = defineEmits(['update:modelValue', 'close']);

	function onClose() {
		emit('update:modelValue', false);
	}

</script>

<style scoped lang="scss">
.modal-content{
	padding: 10px;
	max-width: 500px;

	.error-title{
		padding-right: 10px;
	}

	.loading-style{
		display: flex;
		justify-content: center;
		justify-items: center;
	}
}
</style>
