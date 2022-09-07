<template>
	<div>
		<FmTopRefresh
			:refresh="refresh"
		/>
		<div class="flex aic">
			<div class="py-6 px-7">
				<div class="table">
				<div class="table-row header">
					<div class="table-cell">Name</div>
					<div class="table-cell">Role</div>
					<div class="table-cell">Status</div>
					<div class="table-cell">Groups</div>
				</div>

				<div class="table-row"
					v-for="(item) in members"
					:key="item.id"
					:item="item"
					@click="$router.push(`/settings/permissions/members/${item.id}`)"
				>
					<div class="table-cell">{{ item.username }}</div>
					<div class="table-cell">{{ item.role }}</div>
					<div class="table-cell">{{ item.status }}</div>
					<div class="table-cell">{{ item.groups }}</div>
				</div>
				</div>
			</div>

			<div class="table">
				<div class="table-row header">
					<div class="table-cell">Procedure</div>
					<div class="table-cell">Date</div>
					<div class="table-cell">Status</div>
				</div>

				<PagesPermissionsItemEvent
					v-for="(item) in statuses"
					:key="item.id"
					:item="item"
				/>
			</div>
		</div>
	</div>
</template>

<script setup>
	import moment from 'moment'

	definePageMeta({
		bread: [
			{
				text: 'Permissions: Members',
				to: '/settings/permissions',
				disabled: false
			}
		],
	});
	const store = useStore()


	let stockMembers = ref(null)
	let stockInvites = ref(null)

	let members = computed(() => {
		let data = {}

		if ( !stockMembers.value ) return []

		stockMembers.value.forEach(item => {
			let roles = []

			if ( item.is_admin ) roles.push('Admin')
			if ( item.is_owner ) roles.push('Owner')
			if ( !item.is_owner && !item.is_admin ) roles.push('User')

			data[ item.username ] = {
				id: item.id,
				username: item.username,
				role: roles.join(', '),
				status: item.is_owner ? 'Creator' : 'Accepted',
				groups: item.groups_object.map(item => item.name).join(', ')
			}
		})

		console.log('data:', data)
		return data
	})

	let statuses = ref(null)
	let processing = ref(false)

	const mapSratuses = {
		P: 'Processing',
		D: 'Done',
	}

	async function init() {
		let res = await useApi('members.get')
		stockMembers.value = res.results

		res = await useApi('memberInvites.get')
		stockInvites.value = res.results

		let resStatus = await useApi('dataInstance.get')
		statuses.value = resStatus.results
	}
	function refresh() {

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
.cards {
	display: grid;
	grid-template-columns: repeat(2, auto);
	grid-gap: 30px;
	justify-content: flex-start;
}
.table {
	border: 1px solid $border;
	width: 100%;
	font-size: 14px;
}
.table-row {
	display: grid;
	grid-template-columns: 1fr 1fr 1fr 1fr;
	align-items: center;
	background: #Fff;
	border-bottom: 1px solid $border;
	padding: 5px 0;
	// height: 26px;
	&.header {
		background: #F2F2F2;
		height: 50px;
	}
}
.table-cell {
	white-space: nowrap;
	padding: 0 14px;
}
.sub_procedure {
	grid-column: 1 / -1;
	padding: 5px 18px;
}
.sp_item {
	padding-top: 10px;
}
.date_item {
	width: 48%;
}
.sp_item_h {
	width: 120px;
}
</style>
