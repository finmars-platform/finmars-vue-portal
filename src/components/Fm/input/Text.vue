<template>
	<BaseInput
		:label="label"
		:placeholder="placeholder"
		:tooltip="tooltip"
		:errorData="errorData"
		:modelValue="modelValue"
		@update:modelValue="newVal => $emit('update:modelValue', newVal)"
		@update:errorData="newVal => $emit('update:errorData', newVal)"
	>
		<template #button>
			<FmBtn
				type="iconBtn"
				icon="edit"
				@click="teIsOpened = true"
			/>
		</template>
	</BaseInput>

	<BaseModal :title="label"
						 v-model="teIsOpened">

		<div class="width-100 height-100">
			<textarea class="te_textarea" v-model="teValue"></textarea>
		</div>

		<template #controls>
			<div class="flex-row fc-space-between">
				<FmBtn type="basic" @click="teIsOpened = false">CANCEL</FmBtn>

				<FmBtn @click="modelValue = teValue, teIsOpened = false">OK</FmBtn>
			</div>
		</template>
	</BaseModal>
</template>

<script setup>

	let props = defineProps({
		modelValue: String,
		label: String,
		placeholder: String,
		tooltip: String,
		required: Boolean,
		errorData: Object,
	})

	let emit = defineEmits(['update:modelValue', 'update:errorData'])

	let teIsOpened = ref(false);
	let teValue = ref('');

	watch(
		teIsOpened,
		() => {
			if (teIsOpened.value) teValue.value = props.modelValue;
		}
	)

</script>

<style lang="scss" scoped>
	.te_textarea {
		width: 100%;
		height: 100%;
		resize: none;
	}
</style>
