<template>
	<BaseModal :title="title">
		<div class="wrapp">
			<FmInputText label="Custom Column Name" v-model="newName" />
			<FmInputText
				label="Custom Column Reference Code (use programming language naming rules)"
				v-model="newUserCode"
				v-model:configuration_code="configCode"
				:content_type="content_type"
				v-model:errorData="nucErrorData"
			/>
			<FmSelect label="Value type"></FmSelect>
			<textarea name="" id="" cols="30" rows="10"></textarea>
			<FmInputText label="Custom Column Expression" />
			<!-- 	:modelValue="name"
						:errorData="errors.name"
						@update:modelValue="emit('update:name', $event)"
						@update:errorData="(newVal) => onErrorDataChange('name', newVal)" -->
		</div>

		<template #controls="{ cancel }">
			<slot name="controls" :cancel="cancel">
				<FmBtn type="basic" @click="() => cancelModal(cancel)">CANCEL</FmBtn>
				<FmBtn type="primary" :disabled="!!nucErrorData" @click="save()"
					>Save</FmBtn
				>
			</slot>
		</template>
	</BaseModal>
</template>

<script setup>
	let props = defineProps({
		title: String,
		modelValue: Boolean,
		name: String,
		user_code: String,
		content_type: String,
	})
	let emit = defineEmits(['save', 'update:modelValue'])

	let newName = ref(props.name)
	let newUserCode = ref(props.user_code)
	let configCode = ref('')
	let nucErrorData = ref(null)
	watch(
		() => props.name,
		() => (newName.value = props.name)
	)
	watch(
		() => props.user_code,
		() => (newUserCode.value = props.user_code)
	)
	function save() {
		if (!newUserCode.value) {
			nucErrorData.value = {
				message: 'User code should not be empty',
			}
		} else {
			emit('save', {
				name: newName.value,
				user_code: newUserCode.value,
				configuration_code: configCode.value,
			})
		}
	}

	function cancelModal(cancelFn) {
		newName.value = props.name
		newUserCode.value = props.user_code

		cancelFn()
	}
</script>

<style lang="scss" scoped>
	.wrapp {
		padding: 0px 15px;
		min-width: 500px;
	}
</style>
