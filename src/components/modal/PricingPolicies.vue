<template>
	<BaseModal
		:title="title"
		class="modal--rename"
		:modelValue="modelValue"
		@update:modelValue="(newVal) => emit('update:modelValue', newVal)"
	>
		<div>
			<FmInputText label="Name" v-model="newName" />
			<FmInputUserCode
				style="width: 400px"
				class="m-b-20"
				v-model="newUserCode"
				v-model:configuration_code="configCode"
				:content_type="content_type"
				v-model:errorData="nucErrorData"
			></FmInputUserCode>
			<!-- <FmInputArea
				class="bi_area"
				cols="73"
				rows="5"
				v-model="newNotes"
			></FmInputArea> -->

			<FmSelect title="Default Instrument Pricing Scheme" :items="itemsInstrumentSchemeList"/>
			<FmSelect title="Default Currency Pricing Scheme"  :items="itemsCurrencySchemeList"/>
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
		title: String,
		name: String,
		user_code: String,
		typeModal: String,
		registers: Object,
		registersItems: Object,
		publicName: String,
		shortName: String,
		сreation: String,
		notes: String,
	})
	let emit = defineEmits(['save', 'create', 'update:modelValue'])

	let newName = ref(props.name)
	let newNotes = ref(props.notes)
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
	let itemsInstrumentSchemeList = []
	let itemsCurrencySchemeList = []

	async function getInstrumentSchemeList() {
		let edRes = await useApi('instrumentSchemeList.get')
		itemsInstrumentSchemeList.value = edRes.error ? {} : edRes.results
	}
	getInstrumentSchemeList()
	
	async function getCurrencySchemeList() {
		let edRes = await useApi('currencySchemeList.get')
		itemsCurrencySchemeList.value = edRes.error ? {} : edRes.results
	}
	getCurrencySchemeList()
	console.log('itemsInstrumentSchemeList', itemsInstrumentSchemeList)
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

	console.log('activeCreation save', props.сreation)

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
</style>
