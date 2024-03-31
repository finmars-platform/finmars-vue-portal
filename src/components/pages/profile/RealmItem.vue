<template>

	<FmCard class="realm-card">

		<div class="flex aic sb">
			<div class="fm_card_title m-b-0">
				<div class="fm_card_title">
					Realm: {{ realm.name }} <span style="font-size: .7rem; color: grey;">({{ realm.realm_code }})</span>
				</div>
			</div>

			<FmMenu anchor="right" v-if="isAdmin">
				<template #btn>
					<FmIcon icon="settings"/>
				</template>

				<template #default="{close}">
					<div class="fm_list">
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

					</div>
				</template>
			</FmMenu>
		</div>


		<div class="fm_card_content">

			<div class="fm_container realm-spaces" v-if="realm.spaces.length">

				<PagesProfileDatabasesItem
					v-for="space in realm.spaces"
					:db="space"
					:key="space.id"
					@refresh="store.getMasterUsers()"
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
							path: '/profile/add-space',
							query: {realm_code: realm.realm_code}
						}">
							New Space
						</NuxtLink>
					</div>
				</FmMenu>

			</div>

		</div>

	</FmCard>

	<LazyPagesProfileWorkspaceProvisionLogM :realmCode="realm.realm_code" v-model="isProvisionLogDialog"
											v-if="isProvisionLogDialog"/>

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

props.realm.members.forEach((member) => {

	if (member.user === store.user.id) {
		isAdmin.value = true
	}

})

async function redeploy() {
	let isConfirm = await useConfirm({text: 'Are you sure?'})
	if (!isConfirm) return false

	let res = await useApi("realmRestart.put", {
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

</style>
