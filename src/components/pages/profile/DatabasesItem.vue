<template>
	<FmCard class="" controls>
		<div class="fm_card_title edit_hover">
			<span
				:contenteditable="isEditTitle"
				@input="editingData.name = $event.target.innerText"
				ref="title"
			>
				{{ isEditTitle ? editingData.name : db.name }}
			</span>
			<FmIcon
				class="edit_icon"
				icon="edit"
				@click="edit('title')"
			/>
		</div>

		<div class="fm_card_subtitle">
			{{ db.is_initialized ? `Expire (${ db.license_expiry_date })` : 'Database is initializing'}}
		</div>

		<div class="fm_card_content edit_hover">
			<span
				:contenteditable="isEditDesc"
				@input="editingData.description = $event.target.innerText"
				ref="description"
			>
				{{ isEditDesc ? editingData.description : db.description }}
			</span>

			<FmIcon
				v-if="db.description"
				class="edit_icon"
				icon="edit"
				@click="edit()"
			/>
			<FmBtn
				v-else
				class="text-capitalize"
				type="text"
				@click="edit()"
			>
				Add Description
			</FmBtn>
		</div>

		<div>Role: {{ db.is_owner ? "owner" : "admin" }}</div>



		<template #controls>
			<template v-if="!isEdit && db.is_initialized" class="justify-space-between d-flex pa-4 py-2">
				<v-btn id="parent" icon="mdi-lock" color="primary" @click="showActions = true" v-show="!showActions">
					<v-tooltip
						activator="#parent"
						anchor="start"
					>Show more</v-tooltip>
				</v-btn>

				<div v-if="showActions">
					<v-btn icon="mdi-cloud-upload" color="primary" @click="exportDb()"></v-btn>
					<v-btn v-if="db.is_owner" icon="mdi-delete" color="primary" class="ml-0" @click="emit('delete', db.id)"></v-btn>
				</div>

				<v-btn v-if="!isEdit" variant="elevated" color="primary" @click="open()">open</v-btn>
			</template>
			<template v-if="isEdit">
				<v-btn color="primary" @click="cancelEdit()">cancel</v-btn>

				<v-btn variant="elevated" color="primary" @click="save()">save</v-btn>
			</template>
		</template>
	</FmCard>
</template>

<script setup>

	const props = defineProps({
		db: Object
	});
	const emit = defineEmits(["refresh", 'delete']);
	const config = useRuntimeConfig();

	let isEditDesc = ref(false);
	let isEditTitle = ref(false);
	let isEdit = ref(false);

	let title = ref(null);
	let description = ref(null);

	let editingData = reactive({
		description: '',
		name: '',
		id: ''
	});
	setEditObject()

	let showActions = ref(false)

	function setEditObject() {
		editingData.description = props.db.description;
		editingData.name = props.db.name;
		editingData.id = props.db.id;
	}
	function edit( prop ) {
		if ( prop == 'title' ) isEditTitle.value = true;
		else isEditDesc.value = true;

		isEdit.value = true;

		setTimeout(() => {
			title.value.focus()
		}, 0)
	}
	function cancelEdit() {
		isEditTitle.value = false;
		isEditDesc.value = false;
		isEdit.value = false;
		props.db.name = props.db.name
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
.edit_icon {
	display: inline-block;
	opacity: 0;
	visibility: hidden;
	transition: opacity 0.3s;
	padding: 5px;
}
.fm_card_content {
	word-wrap: break-word;
}
.edit_hover:hover .edit_icon {
	visibility: visible;
	opacity: 1;
}
</style>
