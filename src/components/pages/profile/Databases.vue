<template>
	<div>
		<FmTopRefresh
			@refresh="store.getDatabases(), refreshInvites()"
		>
			<template #action>
				<FmMenu>
					<template #btn>
						<FmIcon btnPrimary icon="add" />
					</template>

					<div class="fm_list">
						<NuxtLink class="fm_list_item"
							to="/profile/add-database"
						>
							New
						</NuxtLink>
						<div class="fm_list_item" @click="isShowNewBackup = true">
							From Backup

							<PagesProfileDatabaseFromBackup
								v-model="isShowNewBackup"
								@close="isShowNewBackup = false, store.getDatabases()"
							/>
						</div>
					</div>
				</FmMenu>
			</template>
		</FmTopRefresh>

		<div class="fm_container databases"
			v-if="invites || store.databases.length"
		>
			<template v-if="invites">
				<PagesProfileInviteItem
					v-for="invite in invites.results"
					:invite="invite"
					:key="invite.id"
					@refresh="store.getDatabases(), refreshInvites()"
				/>
			</template>

			<PagesProfileDatabasesItem
				v-for="db in store.databases"
				:db="db"
				:key="db.id"
				@refresh="store.getDatabases()"
				@delete="deleteDB($event)"
			/>
		</div>
		<div class="fm_content" v-else>No databases found</div>
	</div>
</template>

<script setup>

	let store = useStore()

	let { data: invites, refresh: refreshInvites } = await useAsyncData("invitesToDB", () =>
		useApi('invitesToDB.get')
	);

	let isShowNewBackup = ref(false)

	async function deleteDB(id) {
		let res = await useApi('masterLeave.get', {params: {id}})

		if ( res ) store.getDatabases()
	}

</script>

<style lang="scss" scoped>
.databases {
	display: grid;
	grid-template-columns: repeat(3, 360px);
	grid-gap: 30px;
	justify-content: flex-start;
	padding-bottom: $content-padding-x;
}
</style>
