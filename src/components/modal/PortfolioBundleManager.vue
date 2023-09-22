<template>
	<BaseModal
		class="modal--rename"
	>
		<div>
			<FmInputText label="Name" v-model="newName" @update:modelValue="emits('selected', $event)"/>
            <FmInputText label="User Code" v-model="newName1" @update:modelValue="emits('selected', $event)" />
            <textarea name="" id="" cols="30" rows="10" @update:modelValue="emits('selected', $event)"></textarea>
			
            
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
		
	})
    // modelValue: Boolean,
	// 	name: String,
	// 	user_code: String,
	// 	content_type: String,
	// 	occupiedUserCodes: {
	// 		type: Array,
	// 		default() { return [] },
	// 	},
	// let emit = defineEmits(['save', 'update:modelValue'])

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
		newUserCode.value = props.user_code;

		cancelFn();
	}

</script>

<style lang="scss" scoped>
	.modal.modal--rename {
		min-width: 400px;
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
