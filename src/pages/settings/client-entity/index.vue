<template>
	<div class="container">
		<div class="client-entity-page">
			<div class="m-b-8">
				<h1 class="title">Client Entity</h1>
			</div>
			<FmCard class="m-b-8" v-for="clientEntity of clientEntities">
				<div class="flex_cb">
					<div class="flex flex-col gap-2">
						<span>User code: {{ clientEntity.user_code }}</span>
						<span>Name: {{ clientEntity.name }}</span>
					</div>
					<div>
						<FmButton
							class="m-l-8 m-r-8"
							type="primary"
							@click="editEntity(clientEntity)"
							rounded
						>
							Edit
						</FmButton>
						<FmButton
							class="m-l-8 m-r-8"
							type="secondary"
							@click="deleteEntity(clientEntity)"
							rounded
						>
							Delete
						</FmButton>
					</div>
				</div>
			</FmCard>

			<div class="flex m-t-20">
				<FmButton type="primary" @click="createEntity()" rounded
					>Add Entity</FmButton
				>
			</div>
		</div>

		<BaseModal
			v-model="showModal"
			title="Create Client Entity"
			class="width-60"
		>
			<FmTextField
				class="m-b-10"
				v-model="newEntity.user_code"
				label="User Code"
				:rules="[requiredValidate]"
			/>
			<FmTextField
				class="m-b-10"
				v-model="newEntity.name"
				label="Name"
				:rules="[requiredValidate]"
			/>
			<FmTextField
				class="m-b-10"
				v-model="newEntity.short_name"
				label="Short Name"
			/>
			<FmTextField
				class="m-b-10"
				v-model="newEntity.public_name"
				label="Public Name"
			/>
			<div class="flex flex-column m-b-10">
				<span>Notes</span>
				<textarea
					id="notes"
					name="notes"
					rows="6"
					cols="50"
					v-model="newEntity.notes"
				/>
			</div>
			<template #controls>
				<div class="flex aic sb">
					<FmButton type="secondary" @click="cancelBaseModal">
						Cancel
					</FmButton>
					<FmButton
						type="primary"
						:disabled="!validateNewEntity"
						@click="createNewEntity"
					>
						Create
					</FmButton>
				</div>
			</template>
		</BaseModal>
		<BaseModal
			v-model="showEditModal"
			title="Edit Client Entity"
			class="width-60"
		>
			<div class="m-b-10 p-b-8 p-t-8">
				<span>User Code: {{ editEntityObject.user_code }}</span>
			</div>
			<div>
				<FmTextField
					class="m-b-10"
					v-model="editEntityObject.user_code"
					label="User Code"
					:rules="[requiredValidate]"
				/>
				<FmTextField
					class="m-b-10"
					v-model="editEntityObject.name"
					label="Name"
					:rules="[requiredValidate]"
				/>
				<FmTextField
					class="m-b-10"
					v-model="editEntityObject.short_name"
					label="Short Name"
				/>
				<FmTextField
					class="m-b-10"
					v-model="editEntityObject.public_name"
					label="Public Name"
				/>
				<div class="flex flex-column m-b-10">
					<span>Notes</span>
					<textarea
						id="notes"
						name="notes"
						rows="6"
						cols="50"
						v-model="editEntityObject.notes"
					/>
				</div>
			</div>
			<template #controls>
				<div class="flex aic sb">
					<FmButton type="secondary" @click="cancelBaseModal">Cancel</FmButton>
					<FmButton
						type="primary"
						:disabled="!validateEditEntity"
						@click="updateEntity"
						>Update</FmButton
					>
				</div>
			</template>
		</BaseModal>
	</div>
</template>

<script setup>
	import cloneDeep from 'lodash/cloneDeep';

	definePageMeta({
		middleware: 'auth',
		bread: [
			{
				text: 'Settings Client Entity',
				to: '/settings/client-entity'
			}
		]
	});

	let newEntity = reactive({
		name: '',
		user_code: '',
		short_name: '',
		public_name: '',
		notes: ''
	});

	const editEntityObject = ref({});
	const clientEntities = ref([]);
	const items = ref([]);
	const showModal = ref(false);
	const showEditModal = ref(false);
	const userCode = ref('');

	const errorValidateData = ref(false);

	const validateEditEntity = computed(() => {
		return (
			editEntityObject.value.name.length &&
			editEntityObject.value.user_code.length
		);
	});

	const validateNewEntity = computed(() => {
		return newEntity.name.length && newEntity.user_code.length;
	});

	const getEntities = async () => {
		const res = await useApi('clientEntity.get');
		clientEntities.value = res.results;
	};

	const createEntity = () => {
		showModal.value = true;
	};

	const updateEntity = async () => {
		if (!validateEditEntity.value) return;
		try {
			await useApi('clientEntity.put', {
				params: { id: editEntityObject.value.id },
				body: {
					name: editEntityObject.value.name,
					user_code: editEntityObject.value.user_code,
					short_name: editEntityObject.value.short_name,
					public_name: editEntityObject.value.public_name,
					notes: editEntityObject.value.notes
				}
			});
			await getEntities();
			showEditModal.value = false;
			items.value = [];
			errorValidateData.value = false;
		} catch (error) {
			errorValidateData.value = true;
		}
	};

	const createNewEntity = async () => {
		try {
			if (!validateNewEntity.value) return;
			await useApi('clientEntity.post', {
				body: newEntity
			});

			newEntity = {
				name: '',
				user_code: '',
				short_name: '',
				public_name: '',
				notes: ''
			};

			await getEntities();
			showModal.value = false;
			items.value = [];
			errorValidateData.value = false;
		} catch (error) {
			errorValidateData.value = true;
		}
	};

	const editEntity = (clientEntity) => {
		editEntityObject.value = cloneDeep(clientEntity);
		showEditModal.value = true;
	};

	const deleteEntity = async (clientEntity) => {
		const confirm = await useConfirm({
			title: 'Delete Client Entity',
			text: `Are you sure you want delete ${clientEntity.user_code}?`
		});
		if (!confirm) return false;

		await useApi('clientEntity.delete', {
			params: { id: clientEntity.id }
		});
		await getEntities();
	};

	const cancelBaseModal = () => {
		editEntityObject.value = {};
		showEditModal.value = false;
		showModal.value = false;
		items.value = [];
		userCode.value = '';
		newEntity = {};
	};

	const requiredValidate = (val) => {
		return val ? '' : 'This is required field';
	};

	const init = async () => {
		await getEntities();
	};

	init();
</script>

<style lang="scss" scoped>
	.title {
		margin-top: 5px;
		font-size: 20px;
	}
	.container {
		padding: 30px;
	}
	.user-code {
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		align-items: center;
		margin: 0 var(--spacing-12);
	}
	.right-container {
		width: 36%;
	}
	.right-container span {
		display: inline-block;
		width: 140px;
		white-space: nowrap;
		overflow: hidden !important;
		text-overflow: ellipsis;
		vertical-align: middle;
	}
	textarea {
		border-radius: var(--spacing-4);
		border: 1px solid var(--table-border-color);
		padding: var(--spacing-4);
	}
</style>
