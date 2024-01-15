<template>
	<div>
		<FmTopRefresh
			@refresh="store.getMasterUsers(), refreshInvites()"
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


						</div>
					</div>
				</FmMenu>
				<PagesProfileDatabaseFromBackup
					v-model="isShowNewBackup"
					@cancel="isShowNewBackup = false, store.getMasterUsers()"
				/>
			</template>
		</FmTopRefresh>

		<div class="fm_container databases p-b-16"
			 v-if="invites && invites.results.length"
		>
			<PagesProfileInviteItem
				v-for="invite in invites.results"
				:invite="invite"
				:key="invite.id"
				@refresh="refreshInvites()"
			/>
		</div>

		<div class="fm_container databases"
			 v-if="store.masterUsers.length"
		>
			<PagesProfileDatabasesItem
				v-for="db in store.masterUsers"
				:db="db"
				:key="db.id"
				@refresh="store.getMasterUsers()"
			/>
		</div>
		<div class="fm_container no-databases" v-else>

			<h1>No spaces found</h1>
			<p>Please, contact <a href="mailto:sales@finmars.com" title="sales@finmars.com">sales@finmars.com</a></p>

		</div>
	</div>
</template>

<script setup>

let store = useStore()

let { data: invites, refresh: refreshInvites } = await useAsyncData(
	"invitesToDB",
	() => useApi('invitesToDB.get'),
	{lazy: true}
);

let isShowNewBackup = ref(false)

import formbricks from "@/services/formbricks";
await formbricks.registerRouteChange();

</script>

<style lang="scss" scoped>
.databases {
	display: grid;
	grid-template-columns: repeat(3, 360px);
	grid-gap: 30px;
	//justify-content: flex-start;
	justify-content: center;
	padding-bottom: $content-padding-x;
}
.no-databases {
	text-align: center;
	margin-top: 1rem;

	h1 {
		font-size: 1.5rem;
	}

	p {
		font-size: 1.2rem;
		margin-top: 1rem;
	}
	a {
		display: inline-block;
		color: #f05a22
	}
}
</style>
