<template>
	<CommonSettingsLayout
		title="Add member"
		saveText="Send invite"
		@save="save"
		@cancel="cancel"
	>
		<template #left>
			<FmCard title="General" class="mb-6">
				<BaseInput
					label="Name"
					v-model="form.username"
				/>
				<BaseInput
					label="Email"
					v-model="form.email"
				/>
			</FmCard>
		</template>
		<template #right>
			<FmCard title="Roles" class="m-b-6">
				<BaseMultiSelectInput
					v-model="form.groups"
					title="Groups"
					:items="groups"
					item_id="name"
				/>

				<FmCheckbox
					v-model="form.is_owner"
					label="Owner"
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
		form.groups = form.groups.join(',')
		let res = await useApi('memberInvites.post', {body: form, params: {id: route.params.id}})

		if ( !res.error ) useNotify({type: 'success', title: 'Invite sent!'})
		else useNotify({type: 'error', title: 'User exists'})
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
