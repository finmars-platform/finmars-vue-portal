<template>
	<BaseModal :closeOnClickOutside="false"
						 @update:modelValue="cancel">

		<div v-if="readyStatus" class="flex-column fc-space-between aprm_content">

			<div class="m-b-35">
				<!-- entity names for register here -->
				<FmInputEntityNames label="Relation name"
														v-model:name="portfolioRegister.name"
														v-model:short_name="portfolioRegister.short_name"
														v-model:user_code="portfolioRegister.user_code"
														v-model:public_name="portfolioRegister.public_name"
														:editing="true"
														hideValueToShow />
			</div>

			<div v-if="portfolioId" class="m-b-35">
				<FmInputSelect label="Portfolio"
											 v-model="portfolioRegister.portfolio"
											 :menuOptions="portfoliosList" />
			</div>

			<div class="m-b-35">
				<FmUnifiedDataSelect label="Valuation currency"
														 v-model="portfolioRegister.valuation_currency"
														 content_type="currencies.currency"
														 notNull
														 class="m-b-0" />
			</div>

			<div class="m-b-35">
				<FmSelect label="Pricing Policy"
									:items="ppList"
									prop_name="short_name"
									optionsFilter
									v-model="portfolioRegister.valuation_pricing_policy" />
			</div>

			<div class="m-b-35">
				<FmInputEntityNames label="Relation name"
														v-model:name="portfolioRegister.new_linked_instrument.name"
														v-model:short_name="portfolioRegister.new_linked_instrument.short_name"
														v-model:user_code="portfolioRegister.new_linked_instrument.user_code"
														v-model:public_name="portfolioRegister.new_linked_instrument.public_name"
														:editing="true"
														hideValueToShow />
			</div>

			<div class="m-b-35">
				<FmInputSelect label="Instrument type"
											 :menuOptions="itypesList"
											 v-model="portfolioRegister.new_linked_instrument.instrument_type" />
			</div>

		</div>

		<div v-if="!readyStatus" class="flex-row fc-center">
			<FmLoader />
		</div>

		<template #controls>
			<div class="flex-row fc-space-between">
				<FmBtn type="basic" @click="cancel">CANCEL</FmBtn>
				<FmBtn type="primary" @click="emit('save')">CREATE</FmBtn>
			</div>
		</template>
	</BaseModal>
</template>

<script setup>

	import {useLoadAllPages} from "../../../composables/useApi";

	let props = defineProps({
		portfolioId: Number
	})

	let emit = defineEmits(['cancel', 'save'])

	let readyStatus = ref(false);

	let portfolioRegister = ref({new_linked_instrument: {}});

	if (props.portfolioId) portfolioRegister.value.portfolio = props.portfolioId;

	let portfoliosList = ref([]);
	let itypesList = ref([]);
	let ppList = ref([]);

	const fetchEntities = async function (routeOption, matchingRef) {

		try {

			const res = await useLoadAllPages(routeOption, {filters: {page: 1, page_size: 1000}});

			matchingRef.value = res.map(iType => {
				return {id: iType.id, name: iType.short_name};
			});

		} catch (e) {
			throw e;
		}

	}

	/*const fetchITypes = async function () {

		try {

			const res = await useLoadAllPages('instrumentType.get', {filters: {page: 1, page_size: 1000}});

			itypesList.value = res.map(iType => {
				return {id: iType.id, name: iType.short_name};
			});

		} catch (e) {
			throw e;
		}

	};

	const fetchPricingPolicies = async function () {

		try {

			const res = await useLoadAllPages('pricingPolicy.get', {filters: {page: 1, page_size: 1000}});

			ppList.value = res.map(policy => {
				return {id: policy.id, name: policy.short_name}
			})

		} catch (e) {
			throw e;
		}

	};*/
	function cancel() {
		portfolioRegister.value = {new_linked_instrument: {}};
		emit('cancel');
	}

	async function save() {
		console.log("testing save portfolioRegister", portfolioRegister);
		// useApi('portfolioRegister.post', {body: });
		emit('save');
	}

	async function init () {

		const promises = [
			fetchEntities('instrumentType.get', itypesList),
			fetchEntities('pricingPolicy.get', ppList)
		];

		if (props.portfolioId) promises.push(portfoliosList);

		await Promise.all(promises);

		readyStatus.value = true;

	}

	init();

</script>

<style lang="scss" scoped>
	.aprm_content {
		:deep(.base-input) {
			margin-bottom: 0;
		}
	}
</style>
