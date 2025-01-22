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
			<div class="flex flex-column py-3">
				<div class="code-wrapper">
					<div class="flex flex-row gap-1">
						<div class="w-1/3">
							<FmSelect
								v-model="selectedItem.configuration_code"
								:options="configCodeOptions"
								label="Configuration"
								variant="outlined"
							/>
							<span v-if="!selectedItem.configuration_code" class="error-text"
							>Field is required</span
							>
						</div>
						<div class="w-full">
							<FmTextField
								v-model="selectedItem.user_code"
								:rules="[rules.required]"
								label="User Code"
								outlined
							/>
						</div>
					</div>
					<i class="text-xs my-1">
						Result: {{ selectedItem.configuration_code }}:{{
							selectedItem.user_code
						}}
					</i>
				</div>
				<FmTextField v-model="selectedItem.name" :rules="[rules.required]" label="Name" outlined />
				<FmTextField v-model="selectedItem.short_name" :rules="[rules.required]" label="Short name" outlined />
			</div>
			<div class="flex items-center justify-start gap-2 mt-4">
				<FmButton
					type="primary"
					@click="createItem"
					:loading="confirmButtonLoader"
					:disabled="
                   !selectedItem.configuration_code || !selectedItem.user_code
                "
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
		FmButton, FmIcon,
		FmProgressCircular,
		FmSelect,
		FmTextField
	} from '@finmars/ui';
	import { getRealmSpaceCodes } from '~/pages/system/helper';

	definePageMeta({
		middleware: 'auth'
	});

	const route = useRoute();
	const router = useRouter();
	const { realmCode, spaceCode } = getRealmSpaceCodes(route);

	const configCodeOptions = ref([{ title: 'No codes !', value: '' }]);
	const confirmButtonLoader = ref(false);
	const loading = ref(false);
	const crumbs = [
		{ title: 'Transaction type group', path: 'transaction-type-group' },
		{ title: 'New', path: 'new' }
	];

	const selectedItem = ref({
		name: '',
		short_name: '',
		user_code: '',
		configuration_code: ''
	});

	const rules = {
		required: (value) => (value ? '' : 'Field is required')
	};

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

	async function getConfigList() {
		try {
			const res = await useApi('configurationList.get');
			if (res.results) {
				configCodeOptions.value = res.results.map((result) => {
					return {
						title: result.configuration_code,
						value: result.configuration_code
					};
				});
			} else {
				configCodeOptions.value = [{ title: 'No codes !', value: '' }];
			}
		} catch (e) {
			console.log(`Catch error: ${e}`);
		}
	}

	async function createItem() {
		try {
			confirmButtonLoader.value = true;
			await useApi('transactionTypeGroup.post', {
				body: selectedItem.value
			});
			cancel();
		} catch (e) {
			console.log(`Catch error: ${e}`);
		} finally {
			confirmButtonLoader.value = false;
			router.back();
		}
	}

	async function init() {
		await getConfigList();
	}

	init();
</script>

<style scoped lang="scss">
	.code-wrapper {
		display: flex;
		flex-direction: column;
		border-radius: var(--spacing-4);
		border: 1px solid var(--border-color);
		padding: var(--spacing-12);
		margin-bottom: var(--spacing-16);
	}
	.error-text {
		font-size: var(--spacing-12);
		color: var(--error-color);
		margin: var(--spacing-12);
	}
</style>
