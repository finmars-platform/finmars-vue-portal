<template>
	<div>
		<div class="py-3 px-8">
			<FmBreadcrumbs :crumbs="crumbs" />
		</div>
		<div class="fm_container">
			<BaseTable
				colls="60px 1fr 1fr 1fr 1fr 1fr"
				:items="resourceGroups"
				:cb="clickCell"
				:status="!loading ? 'done' : 'loading'"
				:headers="[
					'ID',
					'Name',
					'User Code',
					'Configuration Code',
					'Description',
					'Notes'
				]"
			/>
			<div class="flex mt-4">
				<FmButton type="primary" @click="openModal()" rounded>
					Add Resource Group
				</FmButton>
			</div>

			<FmPagination
				:with-info="true"
				:total-items="count"
				:items-per-page="pageSize"
				:model-value="currentPage"
				@update:modelValue="handlePageChange"
			/>
			<BaseModal
				v-model="showModal"
				title="Create Resource Group"
				class="width-40"
			>
				<FmTextField
					v-model="newResourceGroup.user_code"
					label="User Code"
					:rules="[rules.required]"
					outlined
					class="mb-2"
				/>
				<div class="mb-4">
					<FmSelect
						v-model="newResourceGroup.configuration_code"
						:options="configCodeOptions"
						label="Configuration Code"
						variant="outlined"
					/>
					<span v-if="!newResourceGroup.configuration_code" class="error-text">
						Field is required
					</span>
				</div>
				<FmTextField
					v-model="newResourceGroup.name"
					label="Name"
					:rules="[rules.required]"
					outlined
					class="mb-2"
				/>
				<FmTextField
					v-model="newResourceGroup.description"
					label="Description"
					outlined
					class="mb-2"
				/>
				<template #controls>
					<div class="flex aic sb">
						<FmButton type="secondary" @click="cancelBaseModal" rounded>
							Cancel
						</FmButton>
						<FmButton
							type="primary"
							:disabled="!validateNewResourceGroup"
							@click="createNewResourceGroup"
							rounded
						>
							Create
						</FmButton>
					</div>
				</template>
			</BaseModal>
		</div>
	</div>
</template>

<script setup>
	import {
		FmBreadcrumbs,
		FmPagination,
		FmButton,
		FmTextField,
		FmSelect
	} from '@finmars/ui';

	const route = useRoute();
	const router = useRouter();

	const showModal = ref(false);
	const resourceGroups = ref([]);
	const count = ref(0);
	const pageSize = ref(40);
	const loading = ref(false);
	const currentPage = ref(route.query.page ? parseInt(route.query.page) : 1);
	const crumbs = ref([{ title: 'Resource Groups', path: 'resource-group' }]);
	const configCodeOptions = ref([{ title: 'No codes !', value: '' }]);

	let newResourceGroup = reactive({
		name: '',
		user_code: '',
		configuration_code: '',
		description: ''
	});

	const validateNewResourceGroup = computed(() => {
		return (
			newResourceGroup.name.length &&
			newResourceGroup.user_code.length &&
			newResourceGroup.configuration_code
		);
	});

	const rules = {
		required: (value) => (value ? '' : 'Field is required')
	};

	const getConfigList = async () => {
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
	};

	const getResourceGroup = async (currentPage = 1) => {
		loading.value = true;
		const payload = {
			page_size: pageSize.value,
			page: currentPage
		};
		const res = await useApi('resourceGroup.get', {
			filters: payload
		});
		count.value = res.count;
		loading.value = false;
		return res.results ?? [];
	};

	const openModal = () => {
		showModal.value = true;
	};

	const cancelBaseModal = () => {
		showModal.value = false;
	};

	const createNewResourceGroup = async () => {
		if (!validateNewResourceGroup.value) return;
		loading.value = true;
		const res = await useApi('resourceGroup.post', {
			body: newResourceGroup
		});
		if (res) {
			newResourceGroup = {
				name: '',
				user_code: '',
				configuration_code: '',
				description: ''
			};
			init();
			showModal.value = false;

			useNotify({
				type: 'success',
				title: 'Success'
			});
		} else {
			useNotify({
				type: 'error',
				title: 'No success'
			});
		}
		loading.value = false;
	};

	const clickCell = async (index) => {
		const resourceItem = resourceGroups.value[index];
		router.push(`resource-group/${resourceItem.id}`);
	};

	const buildItemsForResourceGroups = (items) => {
		return items.map((item) => {
			return {
				id: `${item.id}`,
				name: item.name,
				user_code: item.user_code,
				configuration_code: item.configuration_code,
				description: item.description?.length ? item.description : ' ',
				notes: item.assignments.length
					? item.assignments.map((it) => it.object_user_code).join(',')
					: ' '
			};
		});
	};

	async function init(page = 1) {
		const items = await getResourceGroup(page);
		resourceGroups.value = buildItemsForResourceGroups(items);
		await getConfigList();
	}

	const handlePageChange = (newPage) => {
		currentPage.value = newPage;
		init(currentPage.value);
	};

	init();
</script>

<style scoped lang="scss">
	.error-text {
		font-size: var(--spacing-12);
		color: var(--error-color);
		margin: var(--spacing-12);
	}
	:deep(.table-cell-btn) {
		display: flex;
		align-items: center;
		justify-content: space-between;
		text-align: left;
		user-select: auto;
	}
</style>
