<template>
	<BaseModal @update:modelValue="emit('cancel')">

		<div v-if="readyStatus" class="flex-column fc-space-between">
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

			<div v-if="portolioSelector" class="m-b-35">
				<!-- unified data for portfolio select -->
			</div>

			<div class="m-b-35">
				<!-- unified data for valuation currency select -->
			</div>

			<div class="m-b-35">
				<FmInputSelect label="Pricing Policy" />
			</div>

			<div class="m-b-35">
				<!-- entity names for instrument here -->
			</div>

			<div class="m-b-35">
				<FmInputSelect label="Instrument type" />
			</div>
		</div>

		<template #controls>
			<div class="flex-row fc-space-between">
				<FmBtn type="basic" @click="emit('cancel')">CANCEL</FmBtn>
				<FmBtn type="primary" @click="emit('save')">CREATE</FmBtn>
			</div>
		</template>
	</BaseModal>
</template>

<script setup>

	import {useLoadAllPages} from "../../../composables/useApi";

	let props = defineProps({
		portolioSelector: Boolean
	})

	let emit = defineEmits(['cancel', 'save'])

	let readyStatus = ref(false);

	let portfolioRegister = ref({});

	const fetchIType = async function () {

		try {

			let ITypesList = await useLoadAllPages('instrumentType.get', {filters: {page: 1, page_size: 1000}});

			return ITypesList.map(iType => {
				return {id: iType.id, name: iType.short_name};
			});

		} catch (e) {
			throw e;
		}

	};

	const fetchPricingPolicies = async function () {

		try {

			let ppList = await useLoadAllPages('pricingPolicy.get', {filters: {page: 1, page_size: 1000}});

			return ppList.map(policy => {
				return {id: policy.id, name: policy.short_name}
			})

		} catch (e) {
			throw e;
		}

	};

	const init = async function () {

		await Promise.all([fetchIType(), fetchPricingPolicies()]);
		readyStatus.value = true;

	};

	init();

</script>

<style lang="scss" scoped>

</style>
