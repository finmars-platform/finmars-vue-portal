<template>
	<v-navigation-drawer
		:rail="rail"
		permanent
		width="200"
		rail-width="58"
		theme="dark"
	>
		<!-- <div @click="rail = !rail">switch</div> -->
		<NuxtLink class="logo" to="/">
			<img src="/v/img/logo.png" alt="" />
		</NuxtLink>

		<v-list class="px-0" nav v-model:opened="open">
			<template
				v-for="(route, i) in menu"
				:key="i"
			>
				<v-list-item
					v-if="!route.pages"
					:title="route.title"
					:to="route.link"
				>
					<template #prepend>
						<v-icon class="mr-3" :icon="route.icon" />
					</template>
				</v-list-item>
				<v-list-group
					v-else
				>
					<template v-slot:activator="{ props }">
						<v-list-item
							variant="contained"
							v-bind="props"
							:title="route.title"
							value="userwe"
						>
							<template #prepend>
								<v-icon class="mr-3" :icon="route.icon" />
							</template>
						</v-list-item>
					</template>

					<v-list-item
						v-for="({link, title}, i) in route.pages"
						:key="i"
						:title="title"
						:to="link"
					/>
				</v-list-group>
			</template>
		</v-list>
	</v-navigation-drawer>
</template>

<script setup>
	import menu from "~/assets/data/menu.js";

	let open = ref(['user'])
	let rail = ref(false)


</script>

<style lang="scss" scoped>
.sidebar {
	height: 100vh;
	background: #000;
}
.logo {
	padding: 10px;
}
.menu_item {
	padding: 10px;
	color: #fff;
	font-size: 11px;
	text-transform: uppercase;

	&.router-link-exact-active {
		color: $c1;
	}
}
</style>
