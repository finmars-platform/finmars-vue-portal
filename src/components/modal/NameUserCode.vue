<template>
	<BaseModal
		:modelValue="modelValue"
		@update:modelValue="(newVal) => emit('update:modelValue', newVal)"
		class="modal--rename"
	>
		<div>
			<FmInputText label="Name" v-model="newName" class="m-b-24" />

			<FmInputUserCode
				style="width: 700px"
				class="m-b-20"
				v-model="newUserCode"
				:content_type="content_type"
				v-model:errorData="nucErrorData"
				@configurationCodeChanged="newVal => configCode = newVal"
			/>
		</div>

		<template #controls="{ cancel }">
			<div class="flex-row fc-space-between">
				<FmBtn
					type="basic"
					@click="() => cancelModal(cancel)"
				>
					CANCEL
				</FmBtn>

				<FmBtn
				    type="primary"
				    :disabled="!!nucErrorData"
				    @click="save()"
				>
					SAVE
				</FmBtn>
			</div>
		</template>

	</BaseModal>

</template>

<script setup>

	let props = defineProps({
		modelValue: Boolean,
		name: String,
		user_code: String,
		content_type: String,
		occupiedUserCodes: {
			type: Array,
			default() { return [] },
		},
	})

	let emit = defineEmits(['save', 'update:modelValue'])

	let newName = ref(props.name)
	let newUserCode = ref(props.user_code);
	let configCode = ref('');
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
		newName.value = props.name;
		configCode.value = '';
		newUserCode.value = props.user_code;

		cancelFn();
	}

</script>

<style lang="scss" scoped>
	.modal.modal--rename {
		min-width: 600px;
		& .bi_main_input {
			color: #101010;
		}
		.selected_text {
			color: #101010;
		}
		.usercode-input {
			border: none;
			padding: 0;
			padding-bottom: 15px;
		}
		.bi_side_items {
			display: flex;
			padding: 0 8px;
		}
	}
</style>
