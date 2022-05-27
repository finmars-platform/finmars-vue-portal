<template>
	<v-card width="360">
		<v-card-title>
			<v-hover v-if="!isEditTitle" v-slot="{ isHovering, props }">
				<div v-bind="props" >
					{{ db.name }}
					<v-btn
						:class="{ 'hide': !isHovering }"
						variant="plain"
						icon="mdi-pencil"
						color="primary"
						size="small"
						@click="editTitle(db.name)"
					/>
				</div>
			</v-hover>

			<v-text-field
				class="py-0"
				v-if="isEditTitle"
				autofocus
				density="compact"
				variant="plain"
				v-model="editingData.name"
				hide-details="auto"
			/>
		</v-card-title>

		<v-card-subtitle v-if="db.is_initialized">Expire ({{ db.license_expiry_date }})</v-card-subtitle>
		<v-card-subtitle v-else>Database is initializing</v-card-subtitle>

		<v-card-text>
			<v-hover v-if="!isEditDesc" v-slot="{ isHovering, props }">
				<div v-bind="props" >
					{{ db.description }}

					<v-btn
						v-if="db.description"
						:class="{ 'hide': !isHovering }"
						variant="plain"
						icon="mdi-pencil"
						color="primary"
						size="small"
						@click="editDesc()"
					/>
					<v-btn
						class="text-capitalize px-0"
						variant="plain"
						density="compact"
						color="primary"
						@click="editDesc()"
						v-else
						>Add Description</v-btn
					>
				</div>
			</v-hover>

			<v-textarea
				v-if="isEditDesc"
				placeholder="Add description"
				rows="4"
				no-resize
				autofocus
				variant="plain"
				v-model="editingData.description"
				hide-details="auto"
			></v-textarea>
		</v-card-text>

		<v-card-text>Role: {{ db.isOwner ? "owner" : "admin" }}</v-card-text>

		<v-card-actions v-if="!isEdit && db.is_initialized" class="justify-space-between d-flex">
			<v-btn id="parent" icon="mdi-lock" color="primary" @click="showActions = true">
				<v-tooltip
					activator="#parent"
					anchor="start"
				>Show more</v-tooltip>
			</v-btn>

			<div v-if="showActions">
				<v-btn icon="mdi-cloud-upload" color="primary" @click="exportDb()"></v-btn>
				<v-btn icon="mdi-delete" color="primary" class="ml-0" @click="emit('delete', db.id)"></v-btn>
			</div>

			<v-btn v-if="!isEdit" variant="contained" color="primary" @click="open()">open</v-btn>
		</v-card-actions>

		<v-card-actions v-if="isEdit" class="justify-space-between d-flex">
			<v-btn color="primary" @click="cancelEdit()">cancel</v-btn>

			<v-btn variant="contained" color="primary" @click="save()">save</v-btn>
		</v-card-actions>
	</v-card>
</template>

<script setup>
	const config = useRuntimeConfig();
	const emit = defineEmits(["refresh"]);
	const props = defineProps({
		db: Object,
	});

	let editingData = reactive({});

	let isEditDesc = ref(false);
	let isEditTitle = ref(false);
	let isEdit = ref(false);

	let showActions = ref(false)

	function setEditObject() {
		editingData.description = props.db.description;
		editingData.name = props.db.name;
		editingData.id = props.db.id;
	}
	function editDesc() {
		isEditDesc.value = true;
		isEdit.value = true;

		setEditObject();
	}
	function editTitle() {
		isEditTitle.value = true;
		isEdit.value = true;

		setEditObject();
	}
	function cancelEdit() {
		isEditTitle.value = false;
		isEditDesc.value = false;
		isEdit.value = false;
	}
	async function exportDb() {
		let res = await useApi("masterExport.get", {
			params: { id: props.db.id },
		});
		if ( res ) {
			useNotify({
				type: 'success',
				title: res.message,
			})
		}
	}
	async function open() {
		let res = await useApi("masterSet.patch", {
			body: {},
			params: { id: props.db.id },
		});
		if ( res.success ) {
			window.location.href = config.public.oldAppURL
		}
	}
	async function save() {
		let res = await useApi("masterUser.put", {
			body: editingData,
			params: { id: editingData.id },
		});

		if (res.status) {
			emit("refresh");
		}

		cancelEdit();
	}
</script>

<style lang="scss" scoped>
.databases {
	display: grid;
	grid-template-columns: repeat(3, auto);
	grid-gap: 30px;
	justify-content: flex-start;
}
</style>
