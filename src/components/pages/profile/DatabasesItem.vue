<template>
	<v-card width="360">
		<v-card-title>
			<template v-if="!isEditTitle">
				{{ db.name }}
				<v-btn
					variant="plain"
					icon="mdi-pencil"
					color="primary"
					size="small"
					@click="editTitle(db.name)"
				/>
			</template>

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

		<v-card-subtitle>Expired ({{ db.license_expiry_date }})</v-card-subtitle>

		<v-card-text>
			<template v-if="!isEditDesc">
				{{ db.description }}

				<v-btn
					v-if="db.description"
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
			</template>

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

		<v-card-actions class="justify-space-between d-flex">
			<v-btn v-if="!isEdit" icon="mdi-lock" color="primary" @click="emit('delete', db.id)"></v-btn>
			<v-btn v-else color="primary" @click="cancelEdit()">cancel</v-btn>

			<v-btn v-if="!isEdit" variant="contained" color="primary">open</v-btn>
			<v-btn v-else variant="contained" color="primary" @click="save()"
				>save</v-btn
			>
		</v-card-actions>
	</v-card>
</template>

<script setup>
const emit = defineEmits(["refresh"]);
const props = defineProps({
	db: Object,
});

let editingData = reactive({});

let isEditDesc = ref(false);
let isEditTitle = ref(false);
let isEdit = ref(false);

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
