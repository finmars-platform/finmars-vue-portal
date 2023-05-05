<template>
	<CommonSettingsLayout
		title="Add Role"
		saveText="Create Role"
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
					v-model="form.user_code"
				/>

				<FmCheckbox
					v-model="form.is_owner"
					label="Owner"
					class="m-b-8"
				/>

				<FmCheckbox
					v-model="form.is_admin"
					label="Admin"
				/>

			</FmCard>
		</template>
		<template #right>
			<FmCard title="Groups" class="m-b-6">
				<BaseMultiSelectInput
					v-model="form.groups"
					title="Groups"
					:items="groups"
					item_id="name"
				/>


			</FmCard>

			<FmCard title="Groups" class="m-b-6">
				<BaseMultiSelectInput
					v-model="form.roles"
					title="Roles"
					:items="roles"
					item_id="name"
				/>

			</FmCard>
			<FmCard title="Personal Access Policies" class="m-b-6">
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
		let sendedForm = {
			...form,
			groups: form.groups.join(',')
		}

		let res = await useApi('memberInvites.post', {body: sendedForm, params: {id: route.params.id}})

		if ( !res.error ) {
			useNotify({type: 'success', title: 'Invite sent!'})

			Object.assign(form, {
				groups: [],
				is_owner: false,
				email: '',
				username: '',
			})
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
