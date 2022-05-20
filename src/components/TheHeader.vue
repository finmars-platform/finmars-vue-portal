<template>
	<v-toolbar class="px-7" prominent>
		<v-toolbar-title>{{ $route.meta.title || "No title" }}</v-toolbar-title>

		<v-spacer></v-spacer>

		<v-btn icon="mdi-home" :to="config.public.oldAppURL" />

		<v-btn class="text-lowercase" id="menu-db">
			{{ store.current.name }}
		</v-btn>

		<v-menu
			activator="#menu-db"
			anchor="bottom"
		>
			<v-list>
				<v-list-item
					v-for="(item, index) in store.databases"
					:key="index"
					@click="setCurrent( item.id )"
				>
					{{ item.name }}
				</v-list-item>
			</v-list>
		</v-menu>

		<v-btn class="text-lowercase" id="menu-btn">
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
		{name: 'Logout', cb: () => {}},
	])

	async function setCurrent( id ) {
		let res = await useApi('masterSet.patch', {params: {id}})

		if ( res ) navigateTo(config.public.oldAppURL)
	}
</script>

<style lang="scss" scoped>
.header {
	height: 50px;
	background: #eee;
	padding: 0 20px;
}
</style>
