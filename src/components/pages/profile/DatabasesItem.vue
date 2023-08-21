<template>
	<FmCard class="db" controls v-if="db.is_healthy"
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
					<FmIcon icon="settings"/>
				</template>

				<template #default="{close}">
					<div class="fm_list">
						<div class="fm_list_item" @click="redeploy(), close()">
							<FmIcon class="mr-10" icon="restart_alt"/>
							Restart
						</div>

						<div class="fm_list_item" @click="stop(), close()"
								 v-if="db.status != 4"
						>
							<FmIcon class="mr-10" icon="stop_circle"/>
							Stop
						</div>
						<div class="fm_list_item" @click="start(), close()"
								 v-else
						>
							<FmIcon class="mr-10" icon="play_circle"/>
							Start
						</div>

						<div class="fm_list_item" @click="isOpenRollback = true, close()">
							<FmIcon class="mr-10" icon="cloud_sync"/>
							Rollback
						</div>
						<div class="fm_list_item" @click="isProvisionLogDialog = true, close()">
							<FmIcon class="mr-10" icon="cloud_sync"/>
							Show Provising Log
						</div>
						<div class="fm_list_item" @click="exportDb(), close()">
							<FmIcon class="mr-10" icon="cloud_upload"/>
							Export backup
						</div>
						<div
							v-if="db.is_owner"
							class="fm_list_item"
							@click="deleteDB(), close()"
						>
							<FmIcon class="mr-10" icon="delete"/>
							Delete
						</div>
						<div
							v-else
							class="fm_list_item"
							@click="deleteDB(), close()"
						>
							<FmIcon class="mr-10" icon="exit_to_app"/>
							Exit
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
			<FmInputArea v-else v-model="editingData.description" ref="description"/>
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
							{{ db.base_api_url }}
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


	</FmCard>

	<FmCard v-if="!db.is_healthy" class="space-card-unhealthy " :class="'db-' + db.base_api_url">

		<div class="space-card-foreground">

			<div class="space-card-foreground-loading">Initializing</div>
			<p class="space-card-foreground-small">Your Space is emerging</p>

			<div class="space-card-provision-log" @click="isProvisionLogDialog = true">
				<FmIcon class="mr-10" icon="lens_blur" v-fm-tooltip.bottom="'Show Provision Log'"/>
			</div>

		</div>

		<div class="space-card-background">


			<div class="container">

				<svg class="background__lights" id="lines" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1"
						 xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewbox="0 0 1920 1080" xml:space="preserve"
						 preserveAspectRatio="none">
    <g class="lines">
      <rect class="line" x="125.6" width="4.5" height="1080"></rect>
			<rect class="line" x="87.3" width="1.8" height="1080"></rect>
			<rect class="line" x="110" width="1.8" height="1080"></rect>
			<rect class="line" x="300" width="4.5" height="1080"></rect>
			<rect class="line" x="61" width="4.5" height="1080"></rect>
			<rect class="line" x="68.6" width="1.8" height="1080"></rect>
			<rect class="line" x="136.4" width="1.8" height="1080"></rect>
			<rect class="line" x="131.2" width="0.9" height="1080"></rect>
			<rect class="line" x="123.4" width="0.9" height="1080"></rect>
			<rect class="line" x="12.2" width="0.9" height="1080"></rect>
			<rect class="line" x="250.4" width="4.5" height="1080"></rect>
			<rect class="line" x="7.3" width="4.5" height="1080"></rect>
			<rect class="line" x="161.6" width="1.8" height="1080"></rect>
			<rect class="line" x="230.9" width="1.8" height="1080"></rect>
			<rect class="line" x="32.7" width="1.8" height="1080"></rect>
			<rect class="line" x="30.8" width="4.6" height="1080"></rect>
			<rect class="line" x="166.4" width="0.9" height="1080"></rect>
    </g>
					<g class="lights">
						<path class="light1 light" d='M619.5,55.5H615v68.7h4.5V55.5z'></path>
						<path class="light2 light" d='M1258.2,0h-4.5v25.3h4.5V0z'></path>
						<path class="light3 light"
									d="M875.1,123.8h-1.8v4h1.8V123.8z M875.1,289.4h-1.8v24.1h1.8V289.4z M875.1,0h-1.8v31.4h1.8V0z M875.1,50.2         h-1.8v11.5h1.8V50.2z"></path>
						<path class="light4 light"
									d="M110.8,983.8h-1.8v8.2h1.8V983.8z M1101.8,1075.9h-1.8v4.1h1.8V1075.9z M1101.8,873.7h-1.8v4.2h1.8V873.7z         M1101.8,851h-1.8v18.2h1.8V851z"></path>
						<path class="light5 light"
									d="M68.4,822.7h-1.8v3.8h1.8V822.7z M686.4,928.4h-1.8v23h1.8V928.4z M686.4,1043.8h-1.8v36.2h1.8V1043.8z"></path>
						<path class="light6 light"
									d="M155.6,860.9h-4.4v-34.1h4.4V860.9z M1551.6,533.5h-4.4v-13.9h4.4V533.5z M1551.6,1080h-4.4v-89.1h4.4V1080z"></path>
						<path class="light7 light"
									d="M131.1,707.7h-0.9V698h0.9V707.7z M1311.1,436.8h-0.9v-58.9h0.9V436.8z M1311.1,140.7h-0.9V48h0.9V140.7z"></path>
						<path class="light8 light" d="M12.1,514.5h-0.9v-9.7h0.9V514.5z M125.1,243.6h-0.9v-58.9h0.9V243.6z"></path>
						<path class="light9 light"
									d="M30.4,806.7h-4.6v-42.5h4.6V806.7z M305.4,398.5h-4.6v-17.3h4.6V398.5z M305.4,1080h-4.6V968.8h4.6V1080z"></path>
						<path class="light10 light"
									d="M182.9,170.7h-4.5v13.7h4.5V170.7z M1822.9,435.1h-4.5v6.8h4.5V435.1z M1822.9,55.9h-4.5v4h4.5V55.9z         M1822.9,0h-4.5v48.3h4.5V0z"></path>
						<path class="light11 light"
									d="M166.4,331.5h0.9v9.7h-0.9V331.5z M1666.4,602.4h0.9v58.9h-0.9V602.4z M1666.4,898.5h0.9v92.7h-0.9V898.5z"></path>
						<path class="light12 light"
									d="M162.4,200.7h-1.8v6.4h1.8V200.7z M1620.4,469.1h-1.8v39h1.8V469.1z M1620.4,0h-1.8v51h1.8V0z M1620.4,81.3         h-1.8V100h1.8V81.3z"></path>
						<path class="light13 light"
									d="M7.8,201h-4.5v16.2h4.5V201z M74.8,512.3h-4.5v8.1h4.5V512.3z M74.8,65.8h-4.5v4.6h4.5V65.8z M74.8,0h-4.5         v56.8h4.5V0z"></path>
						<path class="light14 light"
									d="M137.2,655.3h-1.8v6.3h1.8V655.3z M1371.2,829.7h-1.8v37.9h1.8V829.7z M1371.2,1020.3h-1.8v59.7h1.8V1020.3z"></path>
						<path class="light15 light"
									d="M123.3,898.1h-0.9v-4.9h0.9V898.1z M1234.3,762.5h-0.9v-29.5h0.9V762.5z M1234.3,614.4h-0.9v-46.4h0.9V614.4z         "></path>
						<path class="light16 light" d="M45.7,1010.8h-1.8v-18.1h1.8V1010.8z M457.7,507.5h-1.8V398h1.8V507.5z"></path>
						<path class="light17 light"
									d="M33.5,170.7h-1.8v13.7h1.8V170.7z M330.5,435.1h-1.8v6.8h1.8V435.1z M330.5,55.9h-1.8v4h1.8V55.9z M330.5,0         h-1.8v48.3h1.8V0z"></path>
    </g>
  </svg>

			</div>

		</div>


	</FmCard>

	<LazyPagesProfileWorkspaceRollbackM :workspaceId="db.id" v-model="isOpenRollback" v-if="isOpenRollback"/>
	<LazyPagesProfileWorkspaceProvisionLogM :baseApiUrl="db.base_api_url" v-model="isProvisionLogDialog"
																					v-if="isProvisionLogDialog"/>

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

let dateKey = dayjs(props.db.license_expiry_date)
let diffDateKey = dateKey.diff(dayjs(), 'days')

let status = computed(() => {
	if (!props.db.is_initialized) return 'Workspace is initializing'

	if (diffDateKey <= 0) return `Expired ${dateKey.format('DD.MM.YYYY')}`
	else if (diffDateKey <= 30) return `Expire ${dateKey.fromNow()}`
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

function edit(prop) {
	if (prop == 'title') isEditTitle.value = true;
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
	if (!isConfirm) return false

	let res = await useApi("masterExport.get", {
		params: {id: props.db.id},
	});
	if (res) {
		useNotify({
			type: 'success',
			title: res.message,
		})
	}
}

async function redeploy() {
	let isConfirm = await useConfirm({text: 'Are you sure?'})
	if (!isConfirm) return false

	let res = await useApi("masterRedeploy.get", {
		params: {baseApi: props.db.base_api_url}
	})
	if (res) {
		useNotify({
			type: 'success',
			title: 'Success',
		})
		emit("refresh");
	}
}

async function stop() {
	let isConfirm = await useConfirm({text: 'Are you sure?'})
	if (!isConfirm) return false

	let res = await useApi("masterStop.get", {
		params: {baseApi: props.db.base_api_url}
	})
	if (res) {
		useNotify({
			type: 'success',
			title: 'Success',
		})
		emit("refresh");
	}
}

async function start() {
	let isConfirm = await useConfirm({text: 'Are you sure?'})
	if (!isConfirm) return false

	let res = await useApi("masterStart.get", {
		params: {baseApi: props.db.base_api_url}
	})
	if (res) {
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
	if (!isConfirm) return false

	let res = props.db.is_owner
		? await useApi('masterDelete.delete', {params: {id: props.db.id}})
		: await useApi('masterLeave.get', {params: {id: props.db.id}})

	if (res) {
		store.getMasterUsers()

		useNotify({
			type: 'success',
			title: res.message,
		})
	}
}

async function initUpdateDatabase() {

	await useApi('masterInitUpdate.put', {params: {id: props.db.id}})

	store.getMasterUsers()

}

async function open() {
	window.location.href = '/' + props.db.base_api_url + '/v/home'
}

async function save() {
	let res = await useApi("masterUser.put", {
		body: editingData,
		params: {id: editingData.id},
	});

	if (res.status) {
		emit("refresh");
	}

	cancelEdit();
}


const viewportHeight = 1000;

function animateLight(lightClass, direction = 1) {
	const lights = document.querySelectorAll('.db-' + props.db.base_api_url + ' ' + '.' + lightClass);
	let position = 0;


	function step() {
		position += (1 * direction);

		if (direction === 1 && position > viewportHeight) {
			position = 0;
		} else if (direction === -1 && position < -viewportHeight) {
			position = 0;
		}

		lights.forEach((light, index) => {
			let offset = index === 0 ? position : (direction === 1 ? position - viewportHeight : position + viewportHeight);
			light.style.transform = 'translateY(' + offset + 'px)';
		});

		requestAnimationFrame(step);
	}

	step();
}

const lightClasses = {
	'light1': 1,
	'light2': -1,
	'light3': 1,
	'light4': -1,
	'light5': 1,
	'light6': -1,
	'light7': 1,
	'light8': -1,
	'light9': 1,
	'light10': -1,
	'light11': 1,
	'light12': -1,
	'light13': 1,
	'light14': -1,
	'light15': 1,
	'light16': -1,
	'light17': 1,
};

setTimeout(() => {
	Object.entries(lightClasses).forEach(([lightClass, direction]) => animateLight(lightClass, direction));
	// console.log("Init animation")
}, 1000 * Math.random() * 10)
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

.space-card-unhealthy {
	background: #000;
	box-shadow: 0 0 16px rgba(0, 0, 0, .8);
	min-height: 160px;
	position: relative;
}

.space-card-foreground {
	position: absolute;
	top: 0;
	left: 0;
	z-index: 1;
	background: transparent;
	color: #fff;
	width: 100%;
	height: 100%;

	.space-card-provision-log {
		display: none;
		position: absolute;
		top: 8px;
		right: 8px;
		opacity: 0;
	}
	&:hover {
		.space-card-provision-log {
			display: block;
			opacity: 0.7;
			&:hover {
				opacity: 1
			}
		}
	}

	.space-card-foreground-loading {

		margin: 20px;
		font-size: 36px;
		font-family: sans-serif;
		margin-bottom: 5px;


		&:after {
			display: inline-block;
			animation: dotty steps(1, end) 1s infinite;
			content: '';
		}

		@keyframes dotty {
			0% {
				content: '';
			}
			25% {
				content: '.';
			}
			50% {
				content: '..';
			}
			75% {
				content: '...';
			}
			100% {
				content: '';
			}
		}
	}
	.space-card-foreground-small {
		font-size: 12px;
		opacity: 0.7;
		margin-left: 22px;
	}
}

.space-card-background {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	overflow: hidden;

	.container {
		width: 100%;
		height: 100%;
		background-color: black;
		position: relative;
		overflow: hidden;

		.background__lights {
			width: 100%;
			height: 100%;
		}

		svg#lines {
			position: absolute;
			top: 0;
			left: 0;
		}
	}

	.lines {
		opacity: 0.05;
	}

	.line {
		fill-rule: evenodd;
		clip-rule: evenodd;
		fill: #ddd;
	}

	g.lights path {
		fill-opacity: 0;
		transition: fill-opacity 1s ease-in-out;
		fill: rgba(255, 255, 255, .4);
	}

	@keyframes lightUp {
		0% {
			fill-opacity: 0;
		}
		50% {
			fill-opacity: 1;
		}
		100% {
			fill-opacity: 0;
		}
	}

	.light {
		position: absolute;
		fill: #FFF; /* or any other color */
		// animation: lightUp 3s infinite;
	}

	.light1.light {
		animation: lightUp 3s infinite 2s;
	}

	.light2.light {
		animation: lightUp 3s infinite 1s;
	}

	.light3.light {
		animation: lightUp 3s infinite 1.5s;
	}

	.light4.light {
		animation: lightUp 3s infinite 2s;
	}

	.light5.light {
		animation: lightUp 3s infinite 2.5s;
	}

	.light6.light {
		animation: lightUp 3s infinite 3s;
	}

	.light7.light {
		animation: lightUp 3s infinite 3.5s;
	}

	.light8.light {
		animation: lightUp 3s infinite 4s;
	}

	.light9.light {
		animation: lightUp 3s infinite 4.5s;
	}

	.light10.light {
		animation: lightUp 3s infinite 5s;
	}

	.light11.light {
		animation: lightUp 3s infinite 5.5s;
	}

	.light12.light {
		animation: lightUp 3s infinite 6s;
	}

	.light13.light {
		animation: lightUp 3s infinite 6.5s;
	}

	.light14.light {
		animation: lightUp 3s infinite 7s;
	}

	.light15.light {
		animation: lightUp 3s infinite 7.5s;
	}

	.light16.light {
		animation: lightUp 3s infinite 8s;
	}

	.light17.light {
		animation: lightUp 3s infinite 8.5s;
	}


}

</style>
