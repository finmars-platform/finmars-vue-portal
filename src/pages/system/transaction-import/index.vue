<template>
	<section class="transaction-import-page">
		<div class="transaction-import-page__header">
			<FmSearch
				v-model="selectedTransactionScheme"
				label="Select import scheme"
				width="320"
				hide-details
				return-object
				prepend-inner-icon=""
				:loading="isSchemeListLoading"
				:items="transactionSchemeList"
				:disabled="isImporting"
				class="transaction-import-page__schemes"
			/>

			<FmIconButton
				icon="mdi-developer-board"
				:disabled="schemeEditButtonDisabled"
				@click.stop.prevent="isSchemeEditorOpen = true"
			>
				<FmTooltip activator="parent" type="secondary" location="top">
					Edit scheme
				</FmTooltip>
			</FmIconButton>
		</div>

		<DataImportByScheme
			:scheme-id="selectedTransactionScheme?.id"
			api-url="transactionImport.post"
			:disabled="isSchemeListLoading"
			@update:importing-flag="isImporting = $event"
			@complete:import="onImportComplete"
		/>

		<TransactionImportScheme
			v-if="isSchemeEditorOpen"
			:scheme-id="selectedTransactionScheme?.id"
			:initial-scheme="copiedScheme"
			@close="closeSchemeEditor"
			@copy="makeSchemeCopy"
		/>
	</section>
</template>

<script setup>
	import { computed, nextTick, onBeforeMount, ref } from 'vue';
	import omit from 'lodash/omit';
	import { FmIconButton, FmSearch, FmTooltip } from '@finmars/ui';
	import useApi from '@/composables/useApi';
	import DataImportByScheme from '~/components/common/DataImportByScheme/DataImportByScheme.vue';
	import TransactionImportScheme from '@/components/modal/TransactionImportScheme/TransactionImportScheme.vue';

	const isSchemeListLoading = ref(false);
	const isImporting = ref(false);
	const transactionSchemeList = ref([]);
	const selectedTransactionScheme = ref(null);

	const isSchemeEditorOpen = ref(false);
	const copiedScheme = ref({});

	const schemeEditButtonDisabled = computed(
		() =>
			isSchemeListLoading.value ||
			isImporting.value ||
			!selectedTransactionScheme.value
	);

	const userCodesOfExistingTransactionImportSchemes = computed(() =>
		transactionSchemeList.value.map((s) => s.user_code)
	);

	async function getTransactionSchemeList() {
		try {
			isSchemeListLoading.value = true;
			const data = await useApi('importSchemeLight.get');
			transactionSchemeList.value =
				data?.results.map((r) => ({
					...r,
					title: r.name
				})) || [];
		} catch (e) {
			console.error('The transaction scheme list loading error. ', e);
		} finally {
			isSchemeListLoading.value = false;
		}
	}

	function closeSchemeEditor(shouldRefresh) {
		isSchemeEditorOpen.value = false;
		if (shouldRefresh) {
			getTransactionSchemeList();
			selectedTransactionScheme.value = null;
		}
	}

	function createUserCodeForCopiedScheme(oldUserCode) {
		let isUserCodeUnique = false;
		let newUserCode = oldUserCode;
		while (!isUserCodeUnique) {
			newUserCode = `${newUserCode}_copy`;
			if (
				!userCodesOfExistingTransactionImportSchemes.value.includes(newUserCode)
			) {
				isUserCodeUnique = true;
			}
		}
		return newUserCode;
	}

	function makeSchemeCopy(scheme) {
		isSchemeEditorOpen.value = false;
		selectedTransactionScheme.value = null;
		nextTick(() => {
			setTimeout(() => {
				copiedScheme.value = omit(scheme, 'id');
				copiedScheme.value.user_code = createUserCodeForCopiedScheme(
					copiedScheme.value.user_code
				);
				copiedScheme.value.inputs.forEach((i) => delete i.id);
				copiedScheme.value.calculated_inputs.forEach((i) => delete i.id);
				copiedScheme.value.rule_scenarios.forEach((i) => delete i.id);
				isSchemeEditorOpen.value = true;
			}, 500);
		});
	}

	function onImportComplete() {
		selectedTransactionScheme.value = null;
	}

	onBeforeMount(async () => {
		await getTransactionSchemeList();
	});
</script>

<style lang="scss" scoped>
	.transaction-import-page {
		position: relative;
		width: 100%;
		height: 100%;
		padding: 24px;

		&__header {
			display: flex;
			justify-content: flex-start;
			align-items: center;
			column-gap: 16px;
			margin-bottom: 16px;
		}

		&__schemes {
			max-width: 320px;

			:deep(.v-input__control) {
				.v-field.v-field--rounded {
					border-radius: 4px;
				}
			}
		}
	}
</style>
