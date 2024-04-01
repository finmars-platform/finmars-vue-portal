<template>
	<!--	<FmCard class="db" controls-->
	<!--					:class="{red: diffDateKey <= 0, warn: diffDateKey > 0 && diffDateKey <= 30}"-->
	<!--	>-->
	<FmCard class="db" controls
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
						<!--						<div class="fm_list_item" @click="isOpenRollback = true, close()">-->
						<!--							<FmIcon class="mr-10" icon="cloud_sync"/>-->
						<!--							Rollback-->
						<!--						</div>-->
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
			<!--			{{ status }}-->

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
			<FmInputArea
				v-else
				v-model="editingData.description"
				ref="description"
				class="m-b-24"
			/>
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
						<a target="_blank" :href="`${config.public.apiURL}/${db.space_code}/api/v1/`"
						   class="clipboard_text">
							{{ db.space_code }}
						</a>
						<!-- <FmIcon class="m-l-4" icon="content_copy" size="16" /> -->
					</div>
				</div>

				<template v-if="!isEdit">
					<FmBtn v-if="!isEdit" @click="open()">open</FmBtn>
				</template>

				<template v-if="isEdit">
					<FmBtn type="text" @click="cancelEdit()">cancel</FmBtn>

					<FmBtn @click="save()">save</FmBtn>
				</template>


			</div>

			<!--			<div v-if="db.is_update_available" class="space-card-update-bar">-->
			<!--				<FmBtn @click="initUpdateDatabase()">Update</FmBtn>-->
			<!--			</div>-->
		</template>


	</FmCard>

	<LazyPagesProfileWorkspaceRollbackM :workspaceId="db.id" v-model="isOpenRollback" v-if="isOpenRollback"/>


</template>

<script setup>

import dayjs from 'dayjs'

const props = defineProps({
	db: Object,
	realm: Object
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

// let status = computed(() => {
//
// 	if (diffDateKey <= 0) return `Expired ${dateKey.format('DD.MM.YYYY')}`
// 	else if (diffDateKey <= 30) return `Expire ${dateKey.fromNow()}`
// 	else return `Expire date: ${dateKey.format('DD.MM.YYYY')}`
// })

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

async function deleteDB() {
	let isConfirm = await useConfirm({
		title: 'Delete Space',
		text: `Enter the full name of the Space "${props.db.name}" to initiate its deletion.`,
		check: props.db.name,
	})
	if (!isConfirm) return false

	let res = props.db.is_owner
		? await useApi('realmDeleteSpace.put', {
			params: {id: props.realm.id}, body: {
				realm_code: props.realm.realm_code,
				space_code: props.db.space_code,
			}
		})
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

	if (props.db.base_api_url) {
		window.location.href = '/' + props.db.base_api_url + '/v/home' // deprecated
	} else {
		window.location.href = '/' + props.db.realm_code + '/' + props.db.space_code + '/v/home'
	}
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
