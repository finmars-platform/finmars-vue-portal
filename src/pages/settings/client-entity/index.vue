<template>
	<div class="container">
		<div class="client-entity-page">
			<div class="m-b-8">
				<h1 class="title">Client Entity</h1>
			</div>
			<FmCard class="m-b-8" v-for="clientEntity of clientEntities">

				<div class="flex_cb">
					<div>
						<span>{{ clientEntity.user_code }}</span>
					</div>
					<div>
						<FmBtn class="m-l-8 m-r-8" @click="editEntity(clientEntity)"
							>Edit</FmBtn
						>
						<FmBtn
							class="m-l-8 m-r-8"
							type="text"
							@click="openDeleteEntityModal(clientEntity)"
							>Delete</FmBtn
						>
					</div>
				</div>
			</FmCard>

			<div class="flex m-t-20">
				<FmBtn @click="createEntity()">Add Entity</FmBtn>
			</div>
		</div>

		<BaseModal
			v-model="showModal"
			title="Create Client Entity"
			class="width-60"
		>
			<span v-if="!newEntity.user_code.length">Field is required</span>
			<BaseInput
				class="m-b-10"
				v-model="newEntity.user_code"
				label="User Code"
			/>
			<span v-if="!newEntity.name.length">Field is required</span>
			<BaseInput class="m-b-10" v-model="newEntity.name" label="Name" />
			<BaseInput
				class="m-b-10"
				v-model="newEntity.short_name"
				label="Short Name"
			/>
			<BaseInput
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
					<FmBtn type="text" @click="cancelBaseModal"> Cancel </FmBtn>

					<FmBtn :disabled="!validateNewEntity" @click="createNewEntity"
						>Create</FmBtn
					>
				</div>
			</template>
		</BaseModal>
		<BaseModal
			v-model="showEditModal"
			title="Edit Client Entity"
			class="width-60"
		>
			<div class="m-b-10 p-b-8 p-t-8">
				<span>user_code: {{ editEntityObject.user_code }}</span>
			</div>
			<div>
				<span v-if="!editEntityObject.user_code.length">Field is required</span>
				<BaseInput
					class="m-b-10"
					v-model="editEntityObject.user_code"
					label="User Code"
				/>
				<span v-if="!editEntityObject.name.length">Field is required</span>
				<BaseInput
					class="m-b-10"
					v-model="editEntityObject.name"
					label="Name"
				/>
				<BaseInput
					class="m-b-10"
					v-model="editEntityObject.short_name"
					label="Short Name"
				/>
				<BaseInput
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
					<FmBtn type="text" @click="cancelBaseModal"> Cancel </FmBtn>

					<FmBtn :disabled="!validateEditEntity" @click="updateEntity"
						>Update</FmBtn
					>
				</div>
			</template>
		</BaseModal>
		<BaseModal
			v-model="openDeleteModal"
			title="Delete Client Entity"
			:controls="{
				cancel: { name: 'Cancel', cb: cancelDeleteBaseModal },
				action: { name: 'Delete', cb: deleteEntity }
			}"
			class="width-30"
		>
			<div class="m-b-16">
				Are you sure you want delete secret {{ deleteEntityObject.user_code }}?
			</div>
		</BaseModal>
	</div>
</template>

<script setup>
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
	const deleteEntityObject = ref({});
	const clientEntities = ref([]);
	const items = ref([]);
	const showModal = ref(false);
	const showEditModal = ref(false);
	const openDeleteModal = ref(false);
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
		editEntityObject.value = clientEntity;
		showEditModal.value = true;
	};

	const openDeleteEntityModal = async (clientEntity) => {
		openDeleteModal.value = true;
		deleteEntityObject.value = clientEntity;
	};

	const deleteEntity = async () => {
		await useApi('clientEntity.delete', {
			params: { id: deleteEntityObject.value.id }
		});
		await getEntities();
		deleteEntityObject.value = {};
	};

	const cancelDeleteBaseModal = () => {
		deleteEntityObject.value = {};
	};

	const cancelBaseModal = () => {
		showEditModal.value = false;
		showModal.value = false;
		items.value = [];
		userCode.value = '';
		editEntityObject.value = {};
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
