<template>
	<teleport to="body">
		<section class="transaction-import-scheme__overlay">
			<div class="transaction-import-scheme">
				<div class="transaction-import-scheme__header">
					{{ isEditMode ? 'Edit ' : 'Create ' }} transaction scheme

					<FmIconButton
						class="transaction-import-scheme__close-button"
						icon="mdi-close"
						variant="text"
						@click.stop.prevent="emits('close')"
					/>

					<div class="transaction-import-scheme__draft">
						<DraftButton
							v-if="draftUserCode"
							:draft-user-code="draftUserCode"
							:export-to-draft="exportToDraft"
							:apply-draft="applyDraft"
						/>
					</div>

					<div v-if="isLoading" class="transaction-import-scheme__loader">
						<FmProgressLinear indeterminate />
					</div>
				</div>

				<div class="transaction-import-scheme__body">
					<div class="transaction-import-scheme__tabs">
						<FmTabs
							:tabs="tabs"
							size="small"
							@change-tab="currentTab = $event"
						/>
					</div>

					<div class="transaction-import-scheme__content">
						<transition>
							<TabGeneral
								v-if="currentTab === 0"
								:scheme="scheme"
								:is-edit-mode="isEditMode"
								:loading="isLoading"
								@update:scheme="updateScheme"
								@update:valid="onUpdateValid('general', $event)"
							/>

							<TabScheme
								v-else
								:scheme="scheme"
								:loading="isLoading"
								@update:scheme="updateScheme"
								@update:valid="onUpdateValid('scheme', $event)"
							/>
						</transition>
					</div>
				</div>

				<div class="transaction-import-scheme__actions">
					<FmButton
						type="tertiary"
						rounded
						:disabled="isLoading || !isSchemeValid || !scheme?.id"
						@click.stop.prevent="makeCopy"
					>
						Make a copy
					</FmButton>

					<FmButton
						type="secondary"
						rounded
						@click.prevent.stop="emits('close', false)"
					>
						Cancel
					</FmButton>

					<FmButton
						rounded
						:disabled="isLoading || !isSchemeValid"
						@click.stop.prevent="save"
					>
						Save
					</FmButton>
				</div>
			</div>
		</section>
	</teleport>
</template>

<script setup>
	import { computed, onBeforeMount, ref } from 'vue';
	import cloneDeep from 'lodash/cloneDeep';
	import {
		FmButton,
		FmIconButton,
		FmProgressLinear,
		FmTabs
	} from '@finmars/ui';
	import useApi from '~/composables/useApi';
	import { createOrUpdateScheme } from './utils';
	import DraftButton from '~/components/common/DraftButton/DraftButton.vue';
	import TabGeneral from './TabGeneral.vue';
	import TabScheme from './TabScheme.vue';

	const props = defineProps({
		schemeId: {
			type: Number
		},
		initialScheme: {
			type: Object,
			default: () => ({
				inputs: [],
				calculated_inputs: [],
				rule_scenarios: []
			})
		}
	});

	const emits = defineEmits(['close', 'copy']);

	const tabs = [{ label: 'General' }, { label: 'Scheme' }];

	const isLoading = ref(false);
	const currentTab = ref(0);
	const scheme = ref(cloneDeep(props.initialScheme));
	const isTabFieldsValuesValid = ref({
		general: true,
		scheme: true
	});

	const isEditMode = computed(() => !!props.schemeId);

	const isSchemeValid = computed(
		() =>
			isTabFieldsValuesValid.value.general &&
			isTabFieldsValuesValid.value.scheme
	);

	async function getScheme() {
		try {
			isLoading.value = true;
			const res = await useApi('importSchemeInstance.get', {
				params: { id: props.schemeId }
			});
			res && (scheme.value = res);
		} catch (e) {
			console.error('The error loading the transaction schema data. ', e);
		} finally {
			isLoading.value = false;
		}
	}

	function updateScheme(value) {
		scheme.value = value;
	}

	function onUpdateValid(tab, value) {
		isTabFieldsValuesValid.value[tab] = value;
	}

	async function save() {
		try {
			isLoading.value = true;
			await createOrUpdateScheme(scheme.value);
			emits('close', true);
		} finally {
			isLoading.value = false;
		}
	}

	function makeCopy() {
		emits('copy', scheme.value);
	}

	const draftUserCode = computed(() => {
		if (!scheme.value || !scheme.value?.user_code) {
			return '';
		}

		return isEditMode.value
			? `integrations.complextransactionimportscheme.${scheme.value?.user_code}`
			: 'integrations.complextransactionimportscheme.new';
	});

	function exportToDraft() {
		return cloneDeep(scheme.value);
	}

	function applyDraft(value) {
		scheme.value = value;
	}

	onBeforeMount(async () => {
		if (isEditMode.value) {
			await getScheme();
		}
	});
</script>

<style lang="scss" scoped>
	.transaction-import-scheme__overlay {
		position: fixed;
		inset: 0;
		background-color: rgba(0, 0, 0, 0.2);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 1000;
	}

	.transaction-import-scheme {
		position: relative;
		width: 98%;
		height: 98%;
		border-radius: 24px;
		background-color: var(--surface);
		box-shadow:
			0 1px 3px 0 rgba(0, 0, 0, 0.3),
			0 4px 8px 3px rgba(0, 0, 0, 0.15);

		&__header {
			position: relative;
			display: flex;
			width: 100%;
			height: 64px;
			padding: 0 24px;
			justify-content: space-between;
			align-items: center;
			border-bottom: 1px solid var(--outline-variant);
			font-size: 18px;
			font-weight: 600;
			line-height: 24px;
		}

		&__draft {
			position: absolute;
			right: 64px;
		}

		&__loader {
			position: absolute;
			left: 0;
			width: 100%;
			bottom: -1px;
		}

		&__body {
			position: relative;
			width: 100%;
			height: calc(100% - 148px);
		}

		&__tabs {
			position: relative;
			width: 320px;
		}

		&__content {
			position: relative;
			width: 100%;
			height: calc(100% - 60px);

			&:before {
				content: '';
				position: absolute;
				left: 0;
				width: 100%;
				top: -1px;
				border-top: 1px solid var(--outline-variant);
			}
		}

		&__actions {
			display: flex;
			width: 100%;
			height: 84px;
			padding: 0 24px;
			justify-content: flex-end;
			align-items: center;
			column-gap: 16px;
			border-top: 1px solid var(--outline-variant);

			button {
				text-transform: none;
			}
		}
	}
</style>
