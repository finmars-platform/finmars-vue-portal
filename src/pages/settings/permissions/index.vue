<template>
	<div>
		<FmTabs v-model="tab" :tabs="['Members', 'Groups']" />

		<FmTopRefresh
			@refresh="refresh()"
		>
			<template #action>
				<FmIcon
					btnPrimary
					icon="add"
					@click="$router.push(`/settings/permissions/members/add`)"
				/>
			</template>
		</FmTopRefresh>

		<div class="fm_container">
			<BaseTable
				:headers="['', 'Name', 'Role', 'Status', 'Groups']"
				:items="members"
				colls="50px repeat(4, 1fr)"
				:cb="(id) => $router.push(`/settings/permissions/members/${stockMembers[id].id}`)"
			>
			<template #actions="{index}">
					<div class="flex jcc aic height-100">
						<FmMenu anchor="bottom left">
							<template #btn>
								<FmIcon icon="more_vert" />
							</template>
							<div class="fm_list">
								<div class="fm_list_item"
									@click="deleteMember(index)"
								>
									<FmIcon class="m-r-4" icon="delete" /> Delete
								</div>
							</div>
						</FmMenu>
					</div>
				</template>
			</BaseTable>
			<!-- <div class="table">
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
			</div> -->
		</div>
	</div>
</template>

<script setup>

	import dayjs from 'dayjs'

	definePageMeta({
		bread: [
			{
				text: 'Permissions: Members',
				disabled: true
			}
		],
	});
	const store = useStore()

	let tab = ref('Members')
	watch(
		tab,
		() => {
			const config = useRuntimeConfig()
			location.href = `${config.public.apiURL}/${store.current.base_api_url}/a/#!/settings/users-and-groups?tab=groups`
		}
	)

	let stockMembers = ref(null)
	let stockInvites = ref(null)

	let members = computed(() => {
		let data = []

		if ( !stockMembers.value || !stockInvites.value ) return []

		stockMembers.value.forEach(item => {
			let roles = []

			if ( item.is_admin ) roles.push('Admin')
			if ( item.is_owner ) roles.push('Owner')
			if ( !item.is_owner && !item.is_admin ) roles.push('User')

			data.push({
				// id: item.id,
				username: item.username,
				role: roles.join(', '),
				status: item.is_owner ? 'Creator' : 'Accepted',
				groups: item.groups_object.map(item => item.name).join(', ')
			})
		})

		stockInvites.value.forEach(item => {
			if ( data.find(row => row.username == item.user_object.username) ) return false

			let roles = []

			if ( item.is_admin ) roles.push('Admin')
			if ( item.is_owner ) roles.push('Owner')
			if ( !item.is_owner && !item.is_admin ) roles.push('User')

			data.push({
				// id: item.id,
				username: item.user_object.username,
				role: 'Admin',
				status: 'Pending',
				groups: item.groups
			})
		})

		return data
	})

	let statuses = ref(null)
	let processing = ref(false)


	async function init() {
		let res = await useApi('memberList.get')
		stockMembers.value = res.results

		res = await useApi('memberInvites.get')
		stockInvites.value = res.results

		let resStatus = await useApi('dataInstance.get')
		statuses.value = resStatus.results
	}
	async function deleteMember( index ) {
		let usernameDel = members.value[index].username

		let isConfirm = await useConfirm({
			title: 'Delete member',
			text: `Do you want to delete a member "${usernameDel}"?`,
		})
		if ( !isConfirm ) return false

		let res = await useApi('memberKick.post', {
				params: {username: usernameDel, base_api_url: store.current.base_api_url}
			})

		// if ( stockMembers.value.find(item => item.username == usernameDel ) ) {
		// 	let deletedMember = stockMembers.value.find(item => item.username == usernameDel )

		// 	let res = await useApi('member.delete', {
		// 		params: {id: deletedMember.id}
		// 	})

		// } else {

		// 	let deletedInvite = stockInvites.value.find(item => item.user_object.username == usernameDel )

		// 	let res = await useApi('memberInvites.delete', {
		// 		params: {username: deletedInvite.user_object.username, base_api_url: store.current.base_api_url}
		// 	})
		// }

		useNotify({type: 'success', title: `Member "${usernameDel}" was deleted.`})

		refresh()
	}
	init()
	function refresh() {
		init()
	}
	function fromatDate( date ) {
		return dayjs( date ).format('DD.MM.YYYY LT')
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
		height: 35px;
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
