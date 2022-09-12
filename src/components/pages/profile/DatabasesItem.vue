<template>
	<FmCard class="" controls>
		<div class="fm_card_title edit_hover">
			<span v-if="!isEditTitle">
				{{ isEditTitle ? editingData.name : db.name }}
			</span>
			<FmIcon primary
				v-if="!isEditTitle"
				class="edit_icon"
				icon="edit"
				@click="edit('title')"
			/>

			<input class="fm_card_title m-b-0"
				v-if="isEditTitle"
				v-model="editingData.name"
				ref="title"
			/>
		</div>

		<div class="fm_card_subtitle">
			{{ db.is_initialized ? `Expire (${ db.license_expiry_date })` : 'Workspace is initializing'}}
		</div>

		<div class="fm_card_content fm_card_text mb-x edit_hover">
			<template v-if="!isEditDesc">
				{{ isEditDesc ? editingData.description : db.description }}
				<FmIcon primary
					v-if="db.description"
					class="edit_icon"
					icon="edit"
					@click="edit()"
				/>
				<FmBtn
					v-else
					class="plain text-capitalize"
					type="action"
					@click="edit()"
				>
					Add Description
				</FmBtn>
			</template>
			<FmInputArea v-else v-model="editingData.description" ref="description" />
		</div>

		<div class="fm_card_text">Role: {{ db.is_owner ? "owner" : "admin" }}</div>

		<template #controls>
			<div class="flex sb aic">
				<template v-if="!isEdit && db.is_initialized">
					<FmIcon primary
						v-show="!showActions"
						icon="lock"
						tooltip="Show more"
						@click="showActions = true"
					/>

					<div class="flex" v-if="showActions">
						<FmIcon class="mr-10" icon="cloud_upload" tooltip="Export backup" primary @click="exportDb()" />
						<FmIcon v-if="db.is_owner" icon="delete" tooltip="Delete workspace" primary @click="deleteDB()" />
					</div>

					<FmBtn v-if="!isEdit" @click="open()">open</FmBtn>
				</template>

				<template v-if="isEdit">
					<FmBtn type="text" @click="cancelEdit()">cancel</FmBtn>

					<FmBtn @click="save()">save</FmBtn>
				</template>
			</div>
		</template>
	</FmCard>
</template>

<script setup>

	const props = defineProps({
		db: Object
	});
	const emit = defineEmits(["refresh", 'delete']);
	const config = useRuntimeConfig();
	let store = useStore()

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
	async function deleteDB() {
		let isConfirm = await useConfirm({text: 'Are you sure?'})

		if ( !isConfirm ) return false

		let res = props.db.is_owner
			? await useApi( 'masterDelete.delete', { params: {id: props.db.id} } )
			: await useApi( 'masterLeave.get', { params: {id: props.db.id} } )

		if ( res ) {
			store.getMasterUsers()

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
			navigateTo('/')
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
	padding-left: 5px;
	vertical-align: bottom;
	font-size: 18px;
}
.fm_card_title {
	word-wrap: break-word;
	.edit_icon {
		font-size: 24px;
	}
}
.fm_card_content {
	word-wrap: break-word;
}
.edit_hover:hover .edit_icon {
	visibility: visible;
	opacity: 1;
}
</style>
