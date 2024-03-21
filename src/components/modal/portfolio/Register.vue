<template>
	<BaseModal :closingDisabled="creating" @update:modelValue="cancel">
		<div v-if="readyStatus" class="flex-column fc-space-between aprm_content">
			<div class="m-b-35">
				<!-- entity names for register here -->
				<FmInputEntityNames
					v-model:name="portfolioRegister.name"
					v-model:short_name="portfolioRegister.short_name"
					v-model:user_code="portfolioRegister.user_code"
					v-model:public_name="portfolioRegister.public_name"
					v-model:errorData="errorsData.pRegisterNames"
					label="Relation name (Portfolio Register)"
				/>
			</div>

			<div v-if="!portfolioId" class="m-b-35">
				<FmSelect
					v-model:modelValue="portfolioRegister.portfolio"
					v-model:errorData="errorsData.portfolio"
					label="Portfolio"
					:items="portfoliosList"
					prop_name="short_name"
					attach="body"
					tooltip="Select portfolio"
					optionsFilter
					required
				/>
			</div>

			<div class="m-b-35">
				<FmUnifiedDataSelect
					v-model:modelValue="portfolioRegister.valuation_currency"
					v-model:errorData="errorsData.vCurrency"
					label="Valuation currency"
					content_type="currencies.currency"
					required
					class="m-b-0"
				/>
			</div>

			<div class="m-b-35">
				<FmSelect
					v-model:modelValue="portfolioRegister.valuation_pricing_policy"
					v-model:errorData="errorsData.vPricingPolicy"
					label="Pricing Policy"
					:items="ppList"
					prop_name="short_name"
					optionsFilter
					required
				/>
			</div>

			<div class="m-b-35">
				<FmInputEntityNames
					v-model:name="portfolioRegister.new_linked_instrument.name"
					v-model:short_name="
						portfolioRegister.new_linked_instrument.short_name
					"
					v-model:user_code="portfolioRegister.new_linked_instrument.user_code"
					v-model:public_name="
						portfolioRegister.new_linked_instrument.public_name
					"
					v-model:errorData="errorsData.instrumentNames"
					label="Instrument name"
				/>
			</div>

			<div class="m-b-35">
				<FmSelect
					v-model:modelValue="
						portfolioRegister.new_linked_instrument.instrument_type
					"
					v-model:errorData="errorsData.iType"
					label="Instrument type"
					:items="itypesList"
					prop_name="short_name"
					attach="body"
					optionsFilter
					required
				/>
			</div>
		</div>

		<div v-if="!readyStatus" class="flex-row fc-center">
			<FmLoader />
		</div>

		<template #controls>
			<div class="flex-row fc-space-between">
				<FmBtn :disabled="creating" type="basic" @click="cancel">CANCEL</FmBtn>

				<div>
					<FmLoader v-if="creating" title="Creating new portfolio register" />
					<FmBtn :disabled="creating" type="primary" @click="save"
						>CREATE</FmBtn
					>
				</div>
			</div>
		</template>
	</BaseModal>
</template>

<script setup>
	import { useLoadAllPages } from '../../../composables/useApi'

	let props = defineProps({
		portfolioId: Number,
	})

	let emit = defineEmits(['cancel', 'save'])

	let readyStatus = ref(false)
	let creating = ref(false)

	let errorsData = reactive({
		pRegisterNames: null,
		portfolio: null,
		vCurrency: null,
		vPricingPolicy: null,
		instrumentNames: null,
		iType: null,
	})

	let portfolioRegister = ref({ new_linked_instrument: {} })

	if (props.portfolioId) portfolioRegister.value.portfolio = props.portfolioId

	let portfoliosList = ref([])
	let itypesList = ref([])
	let ppList = ref([])

	const fetchEntities = async function (routeOption, matchingRef) {
		try {
			matchingRef.value = await useLoadAllPages(routeOption, {
				filters: { page: 1, page_size: 1000 },
			})
		} catch (e) {
			throw e
		}
	}

	/*const fetchITypes = async function () {

		try {

			const res = await useLoadAllPages('instrumentTypeList.get', {filters: {page: 1, page_size: 1000}});

			itypesList.value = res.map(iType => {
				return {id: iType.id, name: iType.short_name};
			});

		} catch (e) {
			throw e;
		}

	};

	const fetchPricingPolicies = async function () {

		try {

			const res = await useLoadAllPages('pricingPolicyList.get', {filters: {page: 1, page_size: 1000}});

			ppList.value = res.map(policy => {
				return {id: policy.id, name: policy.short_name}
			})

		} catch (e) {
			throw e;
		}

	};*/
	function cancel() {
		if (creating.value) return

		portfolioRegister.value = { new_linked_instrument: {} }
		creating.value = false

		Object.keys(errorsData).forEach((prop) => {
			errorsData[prop] = null
		})

		emit('cancel')
	}

	async function save() {
		/*let formIsInvalid = !portfolioRegister.value.name &&
			!portfolioRegister.value.portfolio &&
			!portfolioRegister.value.valuation_currency &&
			!portfolioRegister.value.valuation_pricing_policy &&
			!portfolioRegister.value.new_linked_instrument.name &&
			!portfolioRegister.value.new_linked_instrument.instrument_type;*/

		Object.keys(errorsData).forEach((prop) => {
			errorsData[prop] = { validate: true }
		})

		const inputWithError = !Object.keys(errorsData).find(
			(prop) => errorsData[prop]
		)

		if (inputWithError) {
			return
		}

		creating.value = true

		const res = await useApi('portfolioRegisterList.post', {
			body: portfolioRegister.value,
		})

		creating.value = false

		if (!res._$error) {
			portfolioRegister.value = { new_linked_instrument: {} }

			Object.keys(errorsData).forEach((prop) => {
				errorsData[prop] = null
			})

			emit('save', res)
		}
	}

	async function init() {
		const promises = [
			fetchEntities('instrumentTypeList.get', itypesList),
			fetchEntities('pricingPolicyList.get', ppList),
		]

		if (!props.portfolioId) {
			promises.push(fetchEntities('portfolioList.get', portfoliosList))
		}

		await Promise.all(promises)

		readyStatus.value = true
	}

	init()
</script>

<style lang="scss" scoped>
	.aprm_content {
		:deep(.base-input),
		:deep(.fm_select) {
			margin-bottom: 0;
		}
	}
</style>
