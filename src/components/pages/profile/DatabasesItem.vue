<template>
	<FmCard class="db" controls
		:class="{red: diffDateKey <= 0, warn: diffDateKey > 0 && diffDateKey <= 30}"
	>
		<div class="flex aic sb">
			<div class="fm_card_title edit_hover m-b-0">
				<span v-if="!isEditTitle">
					{{ isEditTitle ? editingData.name : db.name.length > 20 ? db.name.slice(0, 20) + '...' : db.name }}
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

			<FmMenu anchor="right" v-if="db.is_owner || db.is_admin">
				<template #btn>
					<FmIcon icon="settings" />
				</template>

				<template #default="{close}">
					<div class="fm_list">
						<div class="fm_list_item" @click="redeploy(), close()">
							<FmIcon class="mr-10" icon="restart_alt" /> Restart
						</div>

						<div class="fm_list_item" @click="stop(), close()"
							v-if="db.status != 4"
						>
							<FmIcon class="mr-10" icon="stop_circle" /> Stop
						</div>
						<div class="fm_list_item" @click="start(), close()"
							v-else
						>
							<FmIcon class="mr-10" icon="play_circle" /> Start
						</div>

						<div class="fm_list_item" @click="isOpenRollback = true, close()">
							<FmIcon class="mr-10" icon="cloud_sync" /> Rollback
						</div>
						<div class="fm_list_item" @click="isProvisionLogDialog = true, close()">
							<FmIcon class="mr-10" icon="cloud_sync" /> Show Provising Log
						</div>
						<div class="fm_list_item" @click="exportDb(), close()">
							<FmIcon class="mr-10" icon="cloud_upload" /> Export backup
						</div>
						<div
							v-if="db.is_owner"
							class="fm_list_item"
							@click="deleteDB(), close()"
						>
							<FmIcon class="mr-10" icon="delete" /> Delete
						</div>
						<div
							v-else
							class="fm_list_item"
							@click="deleteDB(), close()"
						>
							<FmIcon class="mr-10" icon="exit_to_app" /> Exit
						</div>
					</div>
				</template>
			</FmMenu>
		</div>


		<div class="fm_card_subtitle m-t-8">
			{{ status }}
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


		<template #controls style="padding: 0;">
			<div class="flex space-card-actions sb aic">
				<div>
					<div class="fm_card_text">Role: {{ db.is_owner ? "owner" : "admin" }}</div>
					<div class="clipboard flex aic">
						<FmIcon
							:tooltip="STATUSES[db.status]"
							class="db_status"
							:class="{
								green: db.status == 1,
								yellow: db.status == 2,
								red: db.status == 3 || db.status == 4,
							}"
						></FmIcon>
						<a target="_blank" :href="`${config.public.apiURL}/${db.base_api_url}/api/v1/`" class="clipboard_text">
							{{ db.base_api_url}}
						</a>
						<!-- <FmIcon class="m-l-4" icon="content_copy" size="16" /> -->
					</div>
				</div>

				<template v-if="!isEdit && db.is_initialized">
					<FmBtn v-if="!isEdit" @click="open()">open</FmBtn>
				</template>

				<template v-if="isEdit">
					<FmBtn type="text" @click="cancelEdit()">cancel</FmBtn>

					<FmBtn @click="save()">save</FmBtn>
				</template>



			</div>

			<div v-if="db.is_update_available" class="space-card-update-bar">
				<FmBtn @click="initUpdateDatabase()">Update</FmBtn>
			</div>
		</template>

		<LazyPagesProfileWorkspaceRollbackM :workspaceId="db.id" v-model="isOpenRollback" v-if="isOpenRollback" />
		<LazyPagesProfileWorkspaceProvisionLogM :baseApiUrl="db.base_api_url" v-model="isProvisionLogDialog" v-if="isProvisionLogDialog" />
	</FmCard>
</template>

<script setup>

	import dayjs from 'dayjs'

	const props = defineProps({
		db: Object
	});
	const emit = defineEmits(["refresh", 'delete']);
	const config = useRuntimeConfig();

	let store = useStore()

	let isEditDesc = ref(false);
	let isEditTitle = ref(false);
	let isEdit = ref(false);

	let isOpenRollback = ref(false);
	let isProvisionLogDialog = ref(false);

	let title = ref(null);
	let description = ref(null);

	const STATUSES = {
		1: 'Active',
		2: 'Maintenance',
		3: 'Offline',
		4: 'Down/stopped'
	}

	let editingData = reactive({
		description: '',
		name: '',
		id: ''
	});
	setEditObject()

	let showActions = ref(false)

	let dateKey = dayjs( props.db.license_expiry_date )
	let diffDateKey = dateKey.diff(dayjs(), 'days')

	let status = computed(() => {
		if ( !props.db.is_initialized ) return 'Workspace is initializing'

		if ( diffDateKey <= 0  ) return `Expired ${dateKey.format('DD.MM.YYYY')}`
		else if ( diffDateKey <= 30  ) return `Expire ${dateKey.fromNow()}`
		else return `Expire date: ${dateKey.format('DD.MM.YYYY')}`
	})

	function setEditObject() {
		editingData.description = props.db.description;
		editingData.name = props.db.name;
		editingData.id = props.db.id;
	}
	async function copy() {
		await navigator.clipboard.writeText(`${config.public.apiURL}/${props.db.base_api_url}/api/v1/`)

		useNotify({
			type: 'success',
			title: 'Copied to clipboard',
		})
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
		let isConfirm = await useConfirm({text: 'Are you sure?'})
		if ( !isConfirm ) return false

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
	async function redeploy() {
		let isConfirm = await useConfirm({text: 'Are you sure?'})
		if ( !isConfirm ) return false

		let res = await useApi("masterRedeploy.get", {
			params: {baseApi: props.db.base_api_url}
		})
		if ( res ) {
			useNotify({
				type: 'success',
				title: 'Success',
			})
			emit("refresh");
		}
	}
	async function stop() {
		let isConfirm = await useConfirm({text: 'Are you sure?'})
		if ( !isConfirm ) return false

		let res = await useApi("masterStop.get", {
			params: {baseApi: props.db.base_api_url}
		})
		if ( res ) {
			useNotify({
				type: 'success',
				title: 'Success',
			})
			emit("refresh");
		}
	}
	async function start() {
		let isConfirm = await useConfirm({text: 'Are you sure?'})
		if ( !isConfirm ) return false

		let res = await useApi("masterStart.get", {
			params: {baseApi: props.db.base_api_url}
		})
		if ( res ) {
			useNotify({
				type: 'success',
				title: 'Success',
			})
			emit("refresh");
		}
	}
	async function deleteDB() {
		let isConfirm = await useConfirm({
			title: 'Delete workspace',
			text: `Enter the full name of the workspace "${props.db.name}" to initiate its deletion.`,
			check: props.db.name,
		})
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

	async function initUpdateDatabase(){

		await useApi( 'masterInitUpdate.put', { params: {id: props.db.id} } )

		store.getMasterUsers()

	}
	async function open() {
		window.location.href = '/' + props.db.base_api_url + '/v/home'
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
.db {
	&.red {
		background: #FFCCCC;
	}
	&.warn {
		background: #FFE8CC;
	}
}
.clipboard {
	cursor: pointer;
	color: $text-lighten;
	transition: color 0.3s;
	&_text {
		text-decoration: underline;
	}
	&:hover {
		color: $text;
	}
}
.db_status {
	width: 10px;
	height: 10px;
	border-radius: 50%;
	margin-right: 7px;
	margin-top: 1px;
	&.green {
		background: #02A471;
	}
	&.yellow {
		background: #FFA462;
	}
	&.red {
		background: #E15303;
	}
}
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
.fm_container {
	div.fm_card_actions {
		padding: 0;
	}
}

.space-card-actions {
	padding: 20px;
	padding-bottom: 20px;
}
.space-card-update-bar {
	.fm_btn {
		width: 100%;
	}
}
</style>
