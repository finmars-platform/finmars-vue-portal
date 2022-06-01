<template>
	<v-navigation-drawer
		class="sidebar overflow-x-visible"
		:rail="rail"
		permanent
		width="160"
		rail-width="58"
		color="#000"
	>
		<!-- <div @click="rail = !rail">switch</div> -->
		<NuxtLink class="logo" to="/">
			<img src="/v/img/logo.png" alt="" />
		</NuxtLink>

		<v-list bg-color="#000" class="menu px-0" nav v-model:opened="open">
			<v-list-item class="menu_item"
				v-for="(route, i) in menu"
				:key="i"
				:title="route.title"
				:to="!route.old ? route.link : ''"
				:href="(route.old ? config.public.oldAppURL : '') + route.link"
			>
				<template #prepend>
					<v-icon class="mr-3" :icon="route.icon" />
				</template>

				<v-list nav class="drop_menu pa-0" v-if="route.pages">
					<v-list-item class="menu_item"
						v-for="({link, title, old}, i) in route.pages"
						:key="i"
						:title="title"
						:to="!old ? link : ''"
						:href="old ? config.public.oldAppURL + link : ''"
						:disabled="!link"
					/>
				</v-list>
			</v-list-item>
		</v-list>
	</v-navigation-drawer>
</template>

<script setup>
	import menu from "~/assets/data/menu.js";

	let open = ref(['user'])
	let rail = ref(false)
	let config = useRuntimeConfig()


</script>

<style lang="scss" scoped>
.sidebar {
	width: 160px;
	background: #000;

}
.logo {
	padding: 10px;
}
.menu_item {
	color: #fff;
	border-radius: 0;
	cursor: pointer;

	&.router-link-exact-active {
		color: $c1;
	}

	&:hover {
		background: #9e9e9e33;
		.drop_menu {
			opacity: 1;
			visibility: visible;
		}
	}


}
.menu {
	overflow: inherit;
}
.drop_menu {
	position: absolute;
	left: 160px;
	top: 0;
	background: #000;
	width: 160px;
	color: #fff;
	opacity: 0;
	visibility: hidden;
	transition: 0.3s;
}
</style>
