<template>
	<v-toolbar class="px-7" prominent style="overflow: visible;">
		<v-breadcrumbs class="pa-0" :items="$route.meta.bread" active-color="#000">
      <template v-slot:divider>
        <v-icon size="20" color="#737373" icon="mdi-arrow-right"></v-icon>
      </template>
    </v-breadcrumbs>

		<v-spacer></v-spacer>

		<v-btn v-if="store.current.name" color="#737373" icon="mdi-home" :href="config.public.oldAppURL" />

		<template v-if="store.current.name">
			<FmMenu>
				<template #btn="{ isOpen }">
					<v-btn class="text-lowercase" :class="{active: isOpen}">
						{{ store.current.name }}
					</v-btn>
				</template>

				<v-list>
					<v-list-item
						v-for="(item, index) in store.databases"
						:key="index"
						@click="setCurrent( item.id )"
					>
						{{ item.name }}
					</v-list-item>
				</v-list>
			</FmMenu>
		</template>

		<v-btn color="#737373" class="text-lowercase" id="menu-btn">
			<v-icon start size="24" icon="mdi-account-box"></v-icon>
			{{ store.user.username }}
		</v-btn>
		<v-menu
			activator="#menu-btn"
			anchor="bottom"
			:close-on-content-click="true"
		>
			<v-list>
				<v-list-item
					v-for="(item, index) in menu"
					:key="index"
					@click="item.cb()"
				>
					{{ item.name }}
				</v-list-item>
			</v-list>
		</v-menu>
	</v-toolbar>
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
.header {
	height: 50px;
	background: #eee;
	padding: 0 20px;
}
</style>
