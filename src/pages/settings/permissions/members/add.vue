<template>
	<FmSettingsLayout
		title="Add member"
		:saveFunc="save"
		saveText="Send invite"
		:cancelFunc="cancel"
	>
		<template #left>
			<v-card class="mb-6">
				<v-card-title class="text-h5">General</v-card-title>
				<v-card-content>
					<v-text-field
						label="Name"
						placeholder="Name"
						variant="outlined"
						density="comfortable"
						v-model="form.username"
					/>
					<v-text-field
						label="Email"
						placeholder="Email"
						variant="outlined"
						density="comfortable"
						v-model="form.email"
					/>
				</v-card-content>
			</v-card>
		</template>
		<template #right>
			<v-card class="mb-6">
				<v-card-title>Roles</v-card-title>
				<v-card-content>
					<BaseMultiSelect
						v-model="form.groups"
						title="Groups"
						:items="groups"
					/>

					<v-checkbox
						v-model="form.is_owner"
						label="Owner"
						color="primary"
						hide-details
					></v-checkbox>
				</v-card-content>
			</v-card>
		</template>
	</FmSettingsLayout>
</template>

<script setup>

	import moment from 'moment'

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
	let groups = ref({})

	async function init() {
		let res = await useApi('userGroups.get')
		groups.value = res.results
	}
	function findIds( val ) {
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
		return moment( date ).format('DD.MM.YYYY LT')
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
