<template>
	<BaseModal
		:modelValue="modelValue"
		:title="title"
		@close="onClose">
		<div class="modal-content">
			<b>Error message: </b>
			<slot name="modal-content"/>
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
	max-width: 500px;

	.loading-style{
		display: flex;
		justify-content: center;
		justify-items: center;
	}
}
</style>
