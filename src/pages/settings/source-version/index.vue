<template>
	<div class="px-5 py-5 flex flex-col items-start justify-start gap-6">
		<div class="flex flex-col w-full gap-2">
			<span class="text-lg">Source Version</span>
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
					Add Source Version
				</FmButton>
			</div>
		</div>
		<template v-if="showModal">
			<SourceVersionModal
				v-model="showModal"
				:modal-type="modalType"
				:item="selectedItem"
				:title="modalTitle"
				:sources="sources"
				@close="closeModal"
				@edit="editItem"
				@create="createItem"
			/>
		</template>
	</div>
</template>

<script setup>
	import SourceVersionModal from '~/pages/settings/source-version/source-version-modal/index.vue';

	import Card from '~/pages/settings/client-entity/card/index.vue';
	import { FmButton, FmProgressCircular } from '@finmars/ui';

	definePageMeta({
		middleware: 'auth'
	});

	const loading = ref(false);
	const showModal = ref(false);
	const modalType = ref('create');
	const modalTitle = ref('Create Source Version');
	const items = ref([]);
	const sources = ref([]);

	const selectedItem = ref({});

	const getEditableObject = (item = null) => {
		return {
			id: item?.id || '',
			name: item?.name || '',
			user_code: item?.user_code || '',
			short_name: item?.short_name || '',
			notes: item?.notes || '',
			source: item?.source || null // TODO add source select to dialog
		};
	};

	async function getItemsList() {
		try {
			loading.value = true;
			const res = await useApi('sourceVersion.get');
			items.value = res.results;
			selectedItem.value = getEditableObject(null);
		} catch (e) {
			console.log(`Catch error: ${e}`);
		} finally {
			loading.value = false;
		}
	}

	async function getSourcesList() {
		try {
			loading.value = true;
			const res = await useApi('source.get');

			sources.value = res.results.map((result) => {
				return {
					title: result.name,
					value: result.id
				};
			});
		} catch (e) {
			console.log(`Catch error: ${e}`);
		} finally {
			loading.value = false;
		}
	}

	async function editItem(item) {
		try {
			loading.value = true;
			selectedItem.value = item;
			await useApi('sourceVersion.put', {
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
			await useApi('sourceVersion.post', {
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
			title: 'Delete Source Version',
			text: `Are you sure you want delete ${item.user_code}?`
		});
		if (confirm) {
			try {
				await useApi('sourceVersion.delete', {
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
		modalTitle.value = !item
			? 'Create Source Version'
			: 'Edit Source Version';
		showModal.value = true;
	}

	const closeModal = () => {
		selectedItem.value = getEditableObject(null);
		modalType.value = 'create';
		showModal.value = false;
	};

	async function init() {
		await getItemsList();
		await getSourcesList();
	}

	init();
</script>

<style lang="scss" scoped></style>
