<template>
	<div class="save-as-dialog">
		<div class="save-as-dialog__row">
			<FmTextField
				:model-value="layout.name"
				label="Layout Name"
				outlined
				hide-details
				@update:model-value="updateName"
			/>
		</div>

		<UserCodeInput
			:user-code="layout.user_code"
			:content-type="layout.content_type"
			:occupied-user-codes="occupiedUserCodes"
			@update:user-code="updateUserCode"
			@update:configuration-code="updateConfigurationCode"
			@update:valid="updateUserCodeValid"
		/>

		<div class="save-as-dialog__actions">
			<FmButton type="secondary" rounded @click.stop.prevent="emits('close')"> Cancel</FmButton>

			<FmButton rounded :disabled="!isFormValid" @click.stop.prevent="runSaveProcess">
				Save
			</FmButton>
		</div>

		<div v-if="isLoading" class="save-as-dialog__loader">
			<FmProgressCircular indeterminate size="80" />
		</div>
	</div>
</template>

<script setup>
	import { computed, inject, onBeforeMount, ref } from 'vue';
	import { FmButton, FmProgressCircular, FmTextField, FM_DIALOGS_KEY } from '@finmars/ui';
	import * as metaContentTypesService from '~/services/meta/metaContentTypeService';
	import * as uiService from '~/services/uiService';
	import UserCodeInput from '~/components/common/UserCodeInput/UserCodeInput.vue';
	import ConfirmationDialog from '~/components/modal/ConfirmationDialog.vue';

	const props = defineProps({
		entityType: {
			type: String
		},
		name: {
			type: String
		},
		userCode: {
			type: [String, undefined]
		},
		dashboardLayout: {
			type: [Object, undefined]
		},
		offerToOverride: {
			type: Boolean,
			default: false
		}
	});
	const emits = defineEmits(['close', 'select', 'confirm']);

	const dialogsSrv = inject(FM_DIALOGS_KEY);

	const isLoading = ref(false);
	const layout = ref({
		name: props.name || '',
		user_code: props.userCode || '',
		configuration_code: '',
		content_type: ''
	});
	const isUserCodeValid = ref(false);

	const occupiedUserCodes = ref([]);

	const isFormValid = computed(() => {
		if (props.offerToOverride) {
			const userCodeValid =
				isUserCodeValid.value ||
				(!isUserCodeValid.value && occupiedUserCodes.value.includes(layout.value.user_code));

			return userCodeValid && !!layout.value.name;
		}

		return isUserCodeValid.value && !!layout.value.name;
	});

	function updateName(val) {
		layout.value.name = val;
	}

	function updateUserCode(val) {
		layout.value.user_code = val;
	}

	function updateConfigurationCode(val) {
		layout.value.configuration_code = val;
	}

	function updateUserCodeValid(val) {
		isUserCodeValid.value = val;
	}

	function runSaveProcess() {
		console.log('runSaveProcess => ', isFormValid.value);
		if (!isFormValid.value) return;

		if (!props.offerToOverride) {
			console.log('### 00000 ###');
			emits('select', { status: 'agree', data: layout.value });
			emits('confirm');
			emits('close');
			return;
		}

		dialogsSrv.$openDialog({
			component: ConfirmationDialog,
			componentProps: {
				text: 'Layout with such user code already exists. Do you want to overwrite?'
			},
			dialogProps: {
				title: 'Warning',
				width: 480,
				onConfirm: () => {
					emits('select', { status: 'overwrite', data: layout.value });
					emits('confirm');
					emits('close');
				}
			}
		});

		console.log('runSaveProcess => ', layout.value);
	}

	onBeforeMount(async () => {
		try {
			isLoading.value = true;

			layout.value.content_type = metaContentTypesService.findContentTypeByEntity(props.entityType);

			if (!props.dashboardLayout) {
				const data = await uiService.getListLayoutLight(props.entityType);
				occupiedUserCodes.value = (data?.results || []).map((layout) => layout.user_code);
			}
		} finally {
			isLoading.value = false;
		}
	});
</script>

<style lang="scss" scoped>
	.save-as-dialog {
		position: relative;
		width: 100%;
		padding: 16px;

		&__row {
			position: relative;
			width: 100%;
			margin-bottom: 16px;
		}

		&__actions {
			position: relative;
			width: 100%;
			padding: 24px 24px 16px 24px;
			display: flex;
			justify-content: flex-end;
			align-items: center;
			column-gap: 8px;

			button {
				text-transform: none;
			}
		}

		&__loader {
			position: absolute;
			inset: 0;
			z-index: 5;
			pointer-events: none;
			display: flex;
			justify-content: center;
			align-items: center;
		}
	}
</style>
