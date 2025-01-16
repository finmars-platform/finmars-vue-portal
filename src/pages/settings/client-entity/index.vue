<template>
	<div class="px-5 py-5 flex flex-col items-start justify-start gap-6">
		<div class="flex flex-col w-full gap-2">
			<span class="text-lg">Client Entity</span>
			<div
				v-if="loading"
				class="flex w-full justify-center items-center min-w-44"
			>
				<FmProgressCircular :size="32" indeterminate />
			</div>
			<div
				v-else-if="!items.length"
				class="flex w-full justify-center items-center min-w-44"
			>
				<span>No data available!</span>
			</div>
			<template v-else>
				<Card
					v-for="item in items"
					@open-modal="openModal"
					@delete-item="deleteItem"
					:item="item"
					:key="item.id"
				/>
			</template>
			<div class="m-4">
				<FmButton type="primary" @click="openModal()" rounded>
					Add Entity
				</FmButton>
			</div>
		</div>
		<template v-if="showModal">
			<EntityModal
				v-model="showModal"
				:modal-type="modalType"
				:item="selectedItem"
				:title="modalTitle"
				:portfolios-options="portfoliosOptions"
				@close="closeModal"
				@edit="editItem"
				@create="createItem"
			/>
		</template>
	</div>
</template>

<script setup>
	import EntityModal from '~/pages/settings/client-entity/entity-modal/index.vue';
	import Card from '@/pages/settings/client-entity/card/index.vue';
	import { FmProgressCircular, FmButton } from '@finmars/ui';

	definePageMeta({
		middleware: 'auth'
	});

	const loading = ref(false);
	const showModal = ref(false);
	const modalType = ref('create');
	const modalTitle = ref('Create Client Entity');
	const items = ref([]);

	const portfoliosOptions = ref([]);
	const selectedItem = ref({});

	const getEditableObject = (item = null) => {
		return {
			id: item?.id || '',
			name: item?.name || '',
			user_code: item?.user_code || '',
			short_name: item?.short_name || '',
			first_name: item?.first_name || '',
			last_name: item?.last_name || '',
			email: item?.email || '',
			telephone: item?.telephone || '',
			notes: item?.notes || '',
			client_secrets: item?.client_secrets || [],
			client_secrets_object: item?.client_secrets_object || [],
			portfolios: item?.portfolios || []
		};
	};

	async function getItemsList() {
		try {
			loading.value = true;
			const res = await useApi('clientEntity.get');
			items.value = res.results;
			selectedItem.value = getEditableObject(null);
		} catch (e) {
			console.log(`Catch error: ${e}`);
		} finally {
			loading.value = false;
		}
	}

	async function getPortfoliosOptions() {
		try {
			const res = await useApi('portfolioList.get');
			if (res.results) {
				portfoliosOptions.value = res.results.map((result) => {
					return {
						title: result.name,
						value: result.id
					};
				});
			} else {
				portfoliosOptions.value = [];
			}
		} catch (e) {
			console.log(`Catch error: ${e}`);
		}
	}

	async function editItem(item) {
		try {
			loading.value = true;
			selectedItem.value = item;
			await useApi('clientEntity.put', {
				params: { id: selectedItem.value.id },
				body: selectedItem.value
			});
			await getItemsList();
			closeModal();
		} catch (e) {
			console.log(`Catch error: ${e}`);
		}
	}

	async function createItem(item) {
		try {
			loading.value = true;
			selectedItem.value = item;
			await useApi('clientEntity.post', {
				body: selectedItem.value
			});
			await getItemsList();
			closeModal();
		} catch (e) {
			console.log(`Catch error: ${e}`);
		}
	}

	async function deleteItem(item) {
		const confirm = await useConfirm({
			title: 'Delete Client Entity',
			text: `Are you sure you want delete ${item.user_code}?`
		});
		if (confirm) {
			try {
				await useApi('clientEntity.delete', {
					params: { id: item.id }
				});
				useNotify({
					type: 'success',
					title: `${item.name} successfully deleted`
				});
				await getItemsList();
			} catch (e) {
				console.log(`Catch error: ${e}`);
			}
		}
	}

	async function openModal(item = null) {
		selectedItem.value = getEditableObject(item);
		modalType.value = !item ? 'create' : 'edit';
		modalTitle.value = !item ? 'Create Client Entity' : 'Edit Client Entity';
		showModal.value = true;
	}

	const closeModal = () => {
		selectedItem.value = getEditableObject(null);
		modalType.value = 'create';
		showModal.value = false;
	};

	async function init() {
		await getItemsList();
		await getPortfoliosOptions();
	}

	init();
</script>

<style lang="scss" scoped></style>
