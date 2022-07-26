<template>
	<header>
		<v-breadcrumbs class="pa-0" :items="$route.meta.bread" active-color="#000">
      <template v-slot:divider>
        <v-icon size="20" color="#737373" icon="mdi-arrow-right"></v-icon>
      </template>
    </v-breadcrumbs>

		<div class="flex aic">
			<FmIcon v-if="store.current.name" icon="home" :href="config.public.oldAppURL" />

			<template v-if="store.current.name">
				<FmMenu>
					<template #btn="{ isOpen }">
						<FmBtn type="text" :class="['text-lowercase', {active: isOpen}]">
							{{ store.current.name }}
						</FmBtn>
					</template>

					<div class="fm_list">
						<v-list-item class="fm_list_item"
							v-for="(item, index) in store.databases"
							:key="index"
							@click="setCurrent( item.id )"
						>
							{{ item.name }}
						</v-list-item>
					</div>
				</FmMenu>
			</template>

			<FmMenu>
				<template #btn="{ isOpen }">
					<FmBtn type="text" :class="['text-lowercase', {active: isOpen}]">
						<FmIcon size="24" icon="account_box" />
						{{ store.user.username }}
					</FmBtn>
				</template>

				<div class="fm_list">
					<v-list-item class="fm_list_item"
						v-for="(item, index) in menu"
						:key="index"
						@click="item.cb()"
					>
						{{ item.name }}
					</v-list-item>
				</div>
			</FmMenu>
		</div>
	</header>
</template>

<script setup>

	const store = useStore()
	const config = useRuntimeConfig()

	let menu = ref([
		{name: 'Profile', cb: () => {navigateTo('/profile')}},
		{name: 'Logout', cb: () => {
			useCookie('access_token').value = null
			useCookie('refresh_token').value = null
			window.location.href = '/'
		}},
	])

	async function setCurrent( id ) {
		let res = await useApi('masterSet.patch', {params: {id}})

		if ( res ) window.location.href = config.public.oldAppURL
	}
</script>

<style lang="scss" scoped>
header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	height: 56px;
	background: $main-darken;
	padding: 0 $content-padding-x;
}
</style>
