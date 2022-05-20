<template>
	<div>
		<v-container class="justify-space-between d-flex py-3" fluid>
			<v-menu
				anchor="bottom"
			>
				<template v-slot:activator="{ props }">
					<v-btn color="primary" icon="mdi-plus" size="small" v-bind="props" />
				</template>

				<v-list>
					<v-list-item :value="1" @click="$router.push('/profile/add-database')">
						New
					</v-list-item>
					<v-list-item :value="2">
						<v-list-item-title>From Backup</v-list-item-title>

						<PagesProfileDatabaseFromBackup
							@close="isShowNewBackup = false, refresh()"
							v-model="isShowNewBackup"
							activator="parent"
						/>
					</v-list-item>
				</v-list>
			</v-menu>

			<v-spacer></v-spacer>

			<v-btn
				size="x-small"
				height="auto"
				variant="text"
				stacked
				class="text-lowercase"
				@click="refresh"
			>
				<v-icon start size="16" icon="mdi-refresh"></v-icon>
				refresh
			</v-btn>
		</v-container>

		<v-divider></v-divider>

		<v-container fluid class="databases bg-grey-lighten-5" v-if="invites.length || data.results.length">

			<PagesProfileInviteItem
				width="360"
				v-for="invite in invites"
				:invite="invite"
				:key="invite.id"
				@refresh="refresh(), refreshInvites()"
			/>
			<PagesProfileDatabasesItem
				width="360"
				v-for="db in data.results"
				:db="db"
				:key="db.id"
				@refresh="refresh()"
				@delete="deleteDB($event)"
			/>

		</v-container>
		<v-container fluid class="text-h4" v-else>No databases found</v-container>
	</div>
</template>

<script setup>

	let { data, refresh } = await useAsyncData("masterUser", () =>
		useApi("masterUser.get")
	);
	let { data: {value: {results: invites}}, refresh: refreshInvites } = await useAsyncData("invitesToDB", () =>
		useApi('invitesToDB.get')
	);

	let isShowNewBackup = ref(false)

	async function deleteDB(id) {
		let res = await useApi('masterLeave.get', {params: {id}})

		if ( res ) refresh()
	}

</script>

<style lang="scss" scoped>
.databases {
	display: grid;
	grid-template-columns: repeat(3, auto);
	grid-gap: 30px;
	justify-content: flex-start;
}
</style>
