<template>

	<FmCard class="realm-card">

		<div class="flex aic sb">
			<div class="fm_card_title m-b-0">
				<div class="fm_card_title">
					Realm: {{ realm.name }} <span style="font-size: .7rem;">({{ realm.realm_code }})</span>
				</div>
			</div>

			<div anchor="right" class="realm-right-controls-holder">

				<div v-if="realm.is_update_available" class="realm-update-is-available-chip">
					Update is available
				</div>

				<FmMenu anchor="right"  v-if="isAdmin">
					<template #btn>
						<FmIcon icon="settings"/>
					</template>

					<template #default="{close}">
						<div class="fm_list">

							<div v-if="realm.is_update_available" class="fm_list_item" @click="initUpdateDatabase(), close()">
								<FmIcon class="mr-10" icon="downloading"/>
								Update
							</div>

							<div class="fm_list_item" @click="redeploy(), close()">
								<FmIcon class="mr-10" icon="restart_alt"/>
								Restart
							</div>

							<div class="fm_list_item" @click="stop(), close()" v-if="realm.status === 'operational'"
							>
								<FmIcon class="mr-10" icon="stop_circle"/>
								Stop
							</div>
							<div class="fm_list_item" @click="start(), close()" v-if="realm.status === 'stopped'"
							>
								<FmIcon class="mr-10" icon="play_circle"/>
								Start
							</div>

							<div class="fm_list_item" @click="isProvisionLogDialog = true, close()">
								<FmIcon class="mr-10" icon="cloud_sync"/>
								Show Provising Log
							</div>

							<div class="fm_list_item" @click="deleteRealm(), close()" v-if="!realm.spaces.length"
							>
								<FmIcon class="mr-10" icon="delete"/>
								Delete
							</div>

							<div class="fm_list_item" @click="isAboutDialog = true, close()">
								<FmIcon class="mr-10" icon="info"/>
								About
							</div>

						</div>
					</template>
				</FmMenu>
			</div>
		</div>


		<div class="fm_card_content">

			<div class="fm_container realm-spaces" v-if="realm.spaces.length">

				<PagesProfileDatabasesItem
					v-for="space in realm.spaces"
					:db="space"
					:realm="realm"
					:key="space.id"
					@refresh="store.getRealms()"
				/>

			</div>

			<div class="fm_container " v-if="!realm.spaces.length">
				<h3 class="text-center">No Spaces in this Realm</h3>
			</div>

			<div class="fm_container" style="justify-content: flex-end; display: flex;">

				<FmMenu>
					<template #btn>
						<FmIcon btnPrimary icon="add"/>
					</template>

					<div class="fm_list">
						<NuxtLink class="fm_list_item" :to="{
							path: '/v/profile/add-space',
							query: {realm_code: realm.realm_code, realm_id: realm.id}
						}">
							New Space
						</NuxtLink>
					</div>
				</FmMenu>

			</div>

		</div>

	</FmCard>

	<LazyPagesProfileWorkspaceProvisionLogM :realmCode="realm.realm_code" :realmId="realm.id"
											v-model="isProvisionLogDialog"
											v-if="isProvisionLogDialog"/>

	<LazyPagesProfileRealmAbout :realm="realm"
								@refresh="store.getRealms()"
											v-model="isAboutDialog"
											v-if="isAboutDialog"/>

</template>

<script setup>

const props = defineProps({
	realm: Object
});
const emit = defineEmits(["refresh", 'delete']);
const config = useRuntimeConfig();

let store = useStore()

let isAdmin = ref(false)
let isProvisionLogDialog = ref(false);
let isAboutDialog = ref(false);

props.realm.members.forEach((member) => {

	if (member.user === store.user.id) {
		isAdmin.value = true
	}

})

async function redeploy() {
	let isConfirm = await useConfirm({text: 'Are you sure?'})
	if (!isConfirm) return false

	let res = await useApi("realmRestart.put", {
		params: {id: props.realm.id},
		body: {realm_code: props.realm.realm_code}
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

	let res = await useApi("realmStop.put", {
		params: {id: props.realm.id},
		body: {realm_code: props.realm.realm_code}
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

	let res = await useApi("realmStart.put", {
		params: {id: props.realm.id},
		body: {realm_code: props.realm.realm_code}
	})
	if (res) {
		useNotify({
			type: 'success',
			title: 'Success',
		})
		emit("refresh");
	}
}

async function deleteRealm() {
	let isConfirm = await useConfirm({title: "Delete Realm", text: 'Are you sure?'})
	if (!isConfirm) return false

	let res = await useApi("realm.delete", {
		params: {id: props.realm.id},
	})
	if (res) {
		useNotify({
			type: 'success',
			title: 'Success',
		})
		emit("refresh");
	}
}

async function initUpdateDatabase() {

	await useApi('realmInitUpdate.put', {params: {id: props.realm.id}})

	emit("refresh");

}

</script>

<style lang="scss" scoped>

.realm-spaces {
	display: grid;
	grid-template-columns: repeat(3, 360px);
	grid-gap: 30px;
	//justify-content: flex-start;
	padding-bottom: $content-padding-x;
	justify-content: start
}

.realm-card {
	margin: 1rem;
}

.realm-update-is-available-chip {
	margin-right: 1rem;
	background: var(--primary-color);
	color: var(--page-background-color);
	border-radius: 6px;
	padding: 0.5rem;
}

.realm-right-controls-holder {
	display: flex;
	align-items: center;
	height: 2rem;
}

.fm_card_title, .fm_card_title span {
	color: var(--primary-color);
}
</style>
