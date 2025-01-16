<template>
	<section class="aliases-page">
		<div class="relative w-[400px] mb-[16px]">
			<FmSelect
				variant="outlined"
				label="Configuration"
				:options="configurationCodes"
				:model-value="configurationCode"
				:disabled="isLoading"
				@update:model-value="configurationCode = $event"
			/>
		</div>

		<div class="mb-[24px]">
			<AliasesFields
				title="Complex Transaction Fields"
				block="complexTransaction"
				:configuration-code="configurationCode"
				@change:loading="isBlockLoading.complexTransaction = $event"
			/>
		</div>

		<div class="mb-[24px]">
			<AliasesFields
				title="Instrument Fields"
				block="instrument"
				:configuration-code="configurationCode"
				@change:loading="isBlockLoading.instrument = $event"
			/>
		</div>

		<div class="mb-[24px]">
			<AliasesFields
				title="Transaction Fields"
				block="transaction"
				:configuration-code="configurationCode"
				@change:loading="isBlockLoading.transaction = $event"
			/>
		</div>

		<div
			v-if="isLoading"
			class="fixed inset-0 z-index-[1000] flex justify-center items-center bg-[var(--aliases-page-loader-bg)]"
		>
			<FmProgressCircular indeterminate size="80" />
		</div>
	</section>
</template>

<script setup>
	import { computed, onBeforeMount, ref } from 'vue';
	import { storeToRefs } from 'pinia';
	import { FmProgressCircular, FmSelect } from '@finmars/ui';
	import useStore from '~/stores/useStore';
	import useApi from '@/composables/useApi';
	import AliasesFields from '~/components/pages/system/settings/aliases/AliasesFields.vue';

	const { current } = storeToRefs(useStore());

	const isBlockLoading = ref({
		configurationCode: false,
		complexTransaction: false,
		transaction: false,
		instrument: false
	});

	const configurationCodes = ref([]);
	const configurationCode = ref();

	const isLoading = computed(
		() =>
			isBlockLoading.value.configurationCode ||
			isBlockLoading.value.complexTransaction ||
			isBlockLoading.value.transaction ||
			isBlockLoading.value.instrument
	);

	async function getConfigurationCodes() {
		try {
			isBlockLoading.value.configurationCode = true;

			const res = await useApi('configurationList.get', {
				filters: {
					page: 1,
					page_size: 1000,
					is_package: false
				}
			});

			configurationCodes.value = (res.results || []).map((item) => ({
				title: item.configuration_code,
				value: item.configuration_code
			}));

			const primaryItem = (res.results || []).find((item) => item.is_primary);
			if (primaryItem) {
				configurationCode.value = primaryItem.configuration_code;
			} else {
				console.warn('No primary configuration code found.');
				configurationCode.value = `local.poms.${current.value.base_api_url}`;
			}
		} catch (e) {
			console.error('The error of the configuration codes loading. ', e);
		} finally {
			isBlockLoading.value.configurationCode = false;
		}
	}

	onBeforeMount(async () => {
		await getConfigurationCodes();
	});
</script>

<style lang="scss" scoped>
	.aliases-page {
		--aliases-page-loader-bg: rgba(0, 0, 0, 0.05);

		position: relative;
		width: 100%;
		height: 100%;
		color: var(--on-surface);
		padding: 24px;
	}
</style>
