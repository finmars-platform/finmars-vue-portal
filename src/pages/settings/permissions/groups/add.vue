<template>
	<CommonSettingsLayout
		title="Add Group"
		saveText="Create Group"
		@save="save"
		@cancel="cancel"
	>
		<template #left>
			<FmCard title="General" class="mb-6">
				<BaseInput
					label="Name"
					v-model="form.name"
				/>
				<BaseInput
					label="User Code"
					v-model="user_code"
				/>

			</FmCard>
		</template>
		<template #right>
			<FmCard title="Access Policies" class="m-b-24">
				<BaseMultiSelectInput
					v-model="form.access_policies"
					title="Access Policies"
					:items="access_policies_templates"
					item_id="name"
				/>


			</FmCard>

			<FmCard title="Roles" class="m-b-24">
				<BaseMultiSelectInput
					v-model="form.roles"
					title="Roles"
					:items="roles"
					item_id="name"
				/>
			</FmCard>

			<FmCard title="Users" class="m-b-24">
				<BaseMultiSelectInput
					v-model="form.users"
					title="Users"
					:items="Users"
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
				text: 'Permissions: Members',
				to: '/settings/permissions',
				disabled: false
			},
			{
				text: 'Add member',
				disabled: true
			},
		],
	});
	const store = useStore()
	let route = useRoute()
	let router = useRouter()

	let form = reactive({
		groups: ['Guests'],
		base_api_url: store.current.base_api_url,
		is_owner: false
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


		let res = await useApi('group.post', {body: form})

		if ( !res.error ) {
			useNotify({type: 'success', title: 'Group created!'})
			// TODO move to active tab Groups
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
