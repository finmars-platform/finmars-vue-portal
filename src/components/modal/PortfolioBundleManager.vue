<template>
	<BaseModal
		:title="title"
		class="modal--rename"
		:modelValue="modelValue"
		@update:modelValue="(newVal) => emit('update:modelValue', newVal)"
	>
		<div>
			<FmInputText label="Name" v-model="newName" />
			<FmInputText label="User Code" v-model="newUserCode" />
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
				v-model="newRegisters"
				:items="registersItems"
			/>
		</div>
		<!-- v-model="newRegisters" -->
		<!-- :items="newRegisters" -->

		<template #controls="{ cancel }">
			<div class="flex-row fc-space-between">
				<FmBtn type="basic" @click="() => cancelModal(cancel)"> CANCEL </FmBtn>

				<FmBtn
					type="primary"
					v-if="activeTypeModal == 'edit'"
					:disabled="!!nucErrorData"
					@click="save()"
				>
					SAVE
				</FmBtn>
				<FmBtn v-else type="primary" :disabled="!!nucErrorData" @click="save()">
					SAVE
				</FmBtn>
			</div>
		</template>
	</BaseModal>
</template>

<script setup>
	let props = defineProps({
		title: String,
		name: String,
		user_code: String,
		notes: String,
		typeModal: String,
		registers: Object,
		registersItems: Object,
	})
	let emit = defineEmits(['save', 'create', 'update:modelValue'])
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
	let newUserCode = ref(props.user_code)
	let configCode = ref('')
	let nucErrorData = ref(null)
	let activeTypeModal = ref(props.typeModal)
	let newRegisters = ref(props.registers)
	let registersItems = ref(props.registersItems)
	console.log('registersItems', registersItems)
	watch(
		() => props.name,
		() => (newName.value = props.name)
	)
	watch(
		() => props.user_code,
		() => (newUserCode.value = props.user_code)
	)
	watch(
		() => props.notes,
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
