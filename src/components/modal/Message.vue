<template>
	<BaseModal
		:modelValue="modelValue"
		:title="title"
		@close="onClose">
		<div class="modal-content">
			<div v-if="description" class="error-text">
				<b>{{description}}</b>
			</div>
			<div v-else class="loading-style">
				<FmLoader />
			</div>
		</div>
		<template #controls="{ cancel }">
			<div class="flex-row fc-space-between">
				<FmBtn
					type="basic"
					@click="cancel">
					CLOSE
				</FmBtn>
			</div>
		</template>
	</BaseModal>
</template>

<script setup>
	defineProps({
		modelValue: Boolean,
		description: {
			required: true,
			type: String
		},
		title:{
			required: true,
			type: String
		}
	})

	let emit = defineEmits(['update:modelValue', 'close']);

	function onClose() {
		emit('update:modelValue', false);
	}

</script>

<style scoped lang="scss">
.modal-content{
	padding: 10px;
	.error-text{
		max-width: 500px;
	}
	.loading-style{
		display: flex;
		justify-content: center;
		justify-items: center;
	}
}
</style>
