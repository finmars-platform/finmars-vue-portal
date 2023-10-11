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
				style="width: 550px"
				class="m-b-20"
				v-model="newUserCode"
				v-model:configuration_code="newConfigurationCode"
				:content_type="content_type"
				v-model:errorData="nucErrorData"
			></FmInputUserCode>

			<FmInputArea
				class="bi_area"
				cols="73"
				rows="5"
				v-model="newNotes"
			></FmInputArea>

			<FmSelect
				label="Default Instrument Pricing Scheme"
				:items="itemsInstrumentSchemeList"
				v-model="newDefaultInstrumentPricingScheme"
			/>
			<FmSelect
				label="Default Instrument Pricing Scheme"
				:items="itemsCurrencySchemeList"
				v-model="newDefaultCurrencyPricingScheme"
			/>
		</div>

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
		notes: String,
		user_code: String,
		typeModal: String,
		registers: Object,
		registersItems: Object,
		publicName: String,
		shortName: String,
		сreation: String,
		configuration_code: String,
		default_currency_pricing_scheme: String,
		default_currency_pricing_scheme_object: Object,
		default_instrument_pricing_scheme: String,
		default_instrument_pricing_scheme_object: Object,
		meta: Object,
		expr: String,
	})

	let emit = defineEmits(['save', 'create', 'update:modelValue'])

	let newName = ref(props.name)
	let newUserCode = ref(props.user_code)
	let newNote = ref(props.notes)
	let nucErrorData = ref(null)
	let activeCreation = ref(props.сreation)

	let newShortName = ref(props.shortName)
	let itemsInstrumentSchemeList = ref([])
	let itemsCurrencySchemeList = ref([])
	let newDefaultCurrencyPricingScheme = ref('')
	let newDefaultInstrumentPricingScheme = ref('')
	let newDefaultCurrencyPricingShcemeObject = ref(
		props.default_currency_pricing_scheme_object
	)
	let newMeta = ref(props.meta)
	let newExpr = ref(props.expr)
	let newDefaultInstrumentPricingSchemeObject = ref(
		props.default_instrument_pricing_scheme_object
	)
	let newConfigurationCode = ref(props.configuration_code)

	async function getInstrumentSchemeList() {
		let edRes = await useApi('instrumentSchemeList.get')
		itemsInstrumentSchemeList.value = edRes.error ? [] : edRes.results
	}
	getInstrumentSchemeList()

	async function getCurrencySchemeList() {
		let edRes = await useApi('currencySchemeList.get')
		itemsCurrencySchemeList.value = edRes.error ? [] : edRes.results
	}
	getCurrencySchemeList()

	watch(
		() => props.modelValue,
		() => {
			if (props.modelValue) {
				;(newName.value = props.name),
					(newUserCode.value = props.user_code),
					(newNote.value = props.notes),
					(newShortName.value = props.shortName),
					(newMeta.value = props.meta),
					(newExpr.value = props.expr),
					(newDefaultCurrencyPricingShcemeObject.value =
						props.default_currency_pricing_scheme_object),
					(newDefaultInstrumentPricingSchemeObject.value =
						props.default_instrument_pricing_scheme_object),
					(newConfigurationCode.value = props.configuration_code)
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
				configuration_code: newConfigurationCode.value,
				name: newName.value,
				user_code: newUserCode.value,
				notes: newNote.value,
				short_name: newShortName.value,
				default_currency_pricing_scheme: newDefaultCurrencyPricingScheme.value,
				default_instrument_pricing_scheme:
					newDefaultInstrumentPricingScheme.value,
				default_currency_pricing_scheme_object:
					newDefaultCurrencyPricingShcemeObject.value,
				default_instrument_pricing_scheme_object:
					newDefaultInstrumentPricingSchemeObject.value,
				meta: newMeta.value,
				expr: newExpr.value,
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
				configuration_code: newConfigurationCode.value,
				name: newName.value,
				user_code: newUserCode.value,
				notes: newNote.value,
				short_name: newShortName.value,
				default_currency_pricing_scheme: newDefaultCurrencyPricingScheme.value,
				default_currency_pricing_scheme_object:
					newDefaultCurrencyPricingShcemeObject.value,
				default_instrument_pricing_scheme_object:
					newDefaultInstrumentPricingSchemeObject.value,
				default_instrument_pricing_scheme:
					newDefaultInstrumentPricingScheme.value,
				meta: newMeta.value,
				expr: newExpr.value,
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
