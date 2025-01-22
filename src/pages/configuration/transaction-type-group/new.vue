<template>
	<div class="py-3 px-8">
		<div class="">
			<FmBreadcrumbs :crumbs="crumbs" @update-crumbs="handleCrumbs" />
		</div>
		<div
			v-if="loading"
			class="flex w-full justify-center items-center min-h-36"
		>
			<FmProgressCircular :size="32" indeterminate />
		</div>
		<template v-else>
			<div class="flex flex-column py-3 gap-2">
				<div class="code-wrapper">
					<UserCodeInput
						:user-code="selectedItem.user_code"
						@update:user-code="updateField('user_code', $event)"
						@update:configuration-code="
						updateField('configuration_code', $event)
					"
						@update:valid="updateUserCodeValidationValue"
					/>
				</div>
				<FmTextField
					:model-value="selectedItem.name"
					outlined
					label="Name"
					:error="formData.name.isDirty && !formData.name.isValid"
					:error-messages="
						formData.name.isDirty && !formData.name.isValid
							? 'This field may not be blank.'
							: ''
					"
					@change="updateField('name', $event)"
				/>
				<FmTextField
					:model-value="selectedItem.short_name"
					outlined
					label="Short name"
					:error="formData.short_name.isDirty && !formData.short_name.isValid"
					:error-messages="
						formData.short_name.isDirty && !formData.short_name.isValid
							? 'This field may not be blank.'
							: ''
					"
					@change="updateField('short_name', $event)"
				/>
			</div>
			<div class="flex items-center justify-start gap-2 mt-4">
				<FmButton
					type="primary"
					@click="createItem"
					:loading="confirmButtonLoader"
					:disabled="!isDirty || !isValid"
					rounded
				>
					Create
				</FmButton>
				<FmButton type="secondary" @click="cancel" rounded> Cancel </FmButton>
			</div>
		</template>
	</div>
</template>

<script setup>
	import {
		FmBreadcrumbs,
		FmButton,
		FmProgressCircular,
		FmTextField
	} from '@finmars/ui';
	import { getRealmSpaceCodes } from '~/pages/system/helper';
	import UserCodeInput from '~/components/common/UserCodeInput/UserCodeInput.vue';
	import cloneDeep from 'lodash/cloneDeep';

	definePageMeta({
		middleware: 'auth'
	});

	const emptyItem = {
		name: '',
		short_name: '',
		user_code: '',
		configuration_code: ''
	};

	const route = useRoute();
	const router = useRouter();
	const { realmCode, spaceCode } = getRealmSpaceCodes(route);

	const confirmButtonLoader = ref(false);
	const loading = ref(false);
	const crumbs = [
		{ title: 'Transaction type group', path: 'transaction-type-group' },
		{ title: 'New', path: 'new' }
	];

	const selectedItem = ref(cloneDeep(emptyItem));
	const formData = ref({
		name: {
			isDirty: false,
			isValid: true
		},
		short_name: {
			isDirty: false,
			isValid: true
		},
		configuration_code: {
			isDirty: false,
			skipValidation: true,
			isValid: true
		},
		user_code: {
			isDirty: false,
			skipValidation: true,
			isValid: true
		}
	});

	const isDirty = computed(
		() => Object.values(formData.value).some((i) => i.isDirty)
	);
	const isValid = computed(
		() => !Object.values(formData.value).some((i) => !i.isValid)
	);

	const handleCrumbs = (newCrumbs, newPath) => {
		router.push(`/${realmCode}/${spaceCode}/v/configuration` + newPath);
	};

	const cancel = () => {
		selectedItem.value = {
			name: '',
			short_name: '',
			user_code: '',
			configuration_code: ''
		};
		confirmButtonLoader.value = false;
		router.back();
	};

	function updateUserCodeValidationValue(val) {
		formData.value.user_code.isValid = val;
		formData.value.configuration_code.isValid = val;
	}

	function validateForm() {
		Object.keys(formData.value).forEach((field) => {
			if (!formData.value[field].skipValidation) {
				formData.value[field].isValid = !!selectedItem.value[field];
			}
		});
	}

	function updateField(field, value) {
		selectedItem.value[field] = value;
		!formData.value[field].isDirty &&
		(formData.value[field].isDirty = true);
		validateForm();
	}

	async function createItem() {
			confirmButtonLoader.value = true;
			const res = await useApi('transactionTypeGroup.post', {
				body: selectedItem.value
			});
      if (res && res._$error) {
        useNotify({type: 'error', title: res._$error.message || res._$error.detail});
      }
			cancel();
	}
</script>

<style scoped lang="scss">
	.code-wrapper {
		position: relative;
		width: 100%;
		padding: 16px 12px;
		border-radius: 8px;
		border: 1px solid var(--outline-variant);
		margin-bottom: var(--spacing-16);
	}
</style>
