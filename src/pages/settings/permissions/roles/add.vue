<template>
	<CommonSettingsLayout
		title="Add Role"
		saveText="Create Role"
		@save="save"
		@cancel="cancel"
	>
		<template #left>
			<FmCard title="General" class="mb-24">
				<BaseInput
					label="Name"
					v-model="form.name"
				/>
				<BaseInput
					label="User Code"
					v-model="form.user_code"
				/>

				<BaseInput
					label="Configuration Code"
					v-model="form.configuration_code"
				/>

			</FmCard>
		</template>
		<template #right>
			<FmCard title="Groups" class="m-b-24">
				<BaseMultiSelectInput
					v-model="form.groups"
					title="Groups"
					:items="groups"
					item_id="name"
				/>


			</FmCard>

			<FmCard title="Members" class="m-b-24">
				<BaseMultiSelectInput
					v-model="form.members"
					title="Members"
					:items="members"
					item_id="name"
				/>

			</FmCard>
			<FmCard title="Access Policies" class="m-b-24">
				<BaseMultiSelectInput
					v-model="form.access_policies"
					title="Personal Access Policies"
					:items="access_policies"
					item_id="name"
				/>

			</FmCard>
		</template>
	</CommonSettingsLayout>
</template>

<script setup>

	import dayjs from 'dayjs'

	definePageMeta({
		bread: [
			{
				text: 'Permissions: Roles',
				to: '/settings/permissions',
				disabled: false
			},
			{
				text: 'Add Role',
				disabled: true
			},
		],
	});
	const store = useStore()
	let route = useRoute()
	let router = useRouter()

	let form = reactive({
		name: '',
		user_code: '',
		configuration_code: 'com.finmars.local',
		groups: [],
		users: [],
		access_policies: [],
	})
	let groups = ref([])

	async function init() {
		let res = await useApi('userGroups.get')
		groups.value = res.results
	}
	function findIds( val ) {
		if ( typeof val == 'string' ) val = val.split(',')
		let result = []
		val.forEach( itemArr => {
			let elem = groups.value.find(itemObj => itemObj.name == itemArr)
			if ( elem ) result.push( elem.id )
		})

		return result
	}
	async function save() {

		let res = await useApi('roleList.post', {body: form})

		if ( !res.error ) {
			useNotify({type: 'success', title: 'Role created!'})

			router.push('/settings/permissions')
		}
	}
	async function cancel() {
		router.push('/settings/permissions')
	}
	function fromatDate( date ) {
		return dayjs( date ).format('DD.MM.YYYY LT')
	}

	if ( store.current.base_api_url ) {
		init()
	} else {
		watch( () => store.current, async () => {
			init()
		})
	}
</script>

<style lang="scss" scoped>
.coll {
	width: 48%;
}
.control_line {
	width: calc(100% - 160px);
	position: fixed;
	left: 160px;
	bottom: 0;
	border-top: 1px solid $border;
}
</style>
