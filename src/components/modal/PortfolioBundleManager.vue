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
			<div class="multi-select">
				<BaseMultiSelectInput
					title="Accounts multiselector"
					item_title="name"
					item_id="id"
					v-model="newRegisters"
					:items="registersItems"
				/>
			</div>
		</div>
		<!-- v-model="newRegisters" -->
		<!-- :items="newRegisters" -->

		<template #controls="{ cancel }">
			<div class="flex-row fc-space-between">
				<FmBtn type="basic" @click="() => cancelModal(cancel)"> CANCEL </FmBtn>

				<FmBtn
					type="primary"
					v-if="activeCreation == false"
					:disabled="!!nucErrorData"
					@click="save()"
				>
					SAVE
				</FmBtn>
				<FmBtn
					v-else
					type="primary"
					:disabled="!!nucErrorData"
					@click="create()"
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
		title: String,
		name: String,
		user_code: String,
		notes: String,
		typeModal: String,
		registers: Object,
		registersItems: Object,
		publicName: String,
		shortName: String,
		сreation: String,
	})
	let emit = defineEmits(['save', 'create', 'update:modelValue'])

	let newName = ref(props.name)
	let newUserCode = ref(props.user_code)
	let configCode = ref('')
	let nucErrorData = ref(null)
	let activeTypeModal = ref(props.typeModal)
	let newRegisters = ref(props.registers)
	let registersItems = ref(props.registersItems)
	let activeCreation = ref(props.сreation)
	let newNote = ref(props.notes)
	let newPublicName = ref(props.publicName)
	let newShortName = ref(props.shortName)

	watch(
		() => props.modelValue,
		() => {
			if (props.modelValue) {
				;(newName.value = props.name),
					(newUserCode.value = props.user_code),
					(newNote.value = props.notes),
					(newShortName.value = props.shortName),
					(newRegisters.value = props.registers),
					(newPublicName.value = props.publicName)
			}
		}
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
				registers: newRegisters.value,
				notes: newNote.value,
				public_name: newPublicName.value,
				short_name: newShortName.value,
			})
		}
	}
	function create() {
		if (!newUserCode.value) {
			nucErrorData.value = {
				message: 'User code should not be empty',
			}
		} else {
			emit('create', {
				name: newName.value,
				user_code: newUserCode.value,
				registers: newRegisters.value,
				notes: newNote.value,
				public_name: newPublicName.value,
				short_name: newShortName.value,
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
	.multi-select {
		margin: 20px 0;
	}
</style>
