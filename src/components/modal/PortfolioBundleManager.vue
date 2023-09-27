<template>
	<BaseModal
		class="modal--rename"
		:modelValue="modelValue"
		@update:modelValue="(newVal) => emit('update:modelValue', newVal)"
	>
		<div>
			<FmInputText label="Name" v-model="newName" />
            <FmInputText label="User Code" v-model="newUserCode"/>
        	<textarea
				class="bi_area"
				cols="60"
				rows="5"
				v-model="newNotes"
			></textarea>
			<BaseMultiSelectInput
						
						title="Accounts multiselector"
						item_title="name"
						item_id="id"
						@update:model-value="vm.selectedCustomFieldsChanged()"
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
