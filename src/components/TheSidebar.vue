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
			<template
				v-for="(route, i) in menu"
				:key="i"
			>
				<v-list-item class="menu_item"
					v-if="!route.pages && !route.submenu"
					:title="route.title"
					:to="!route.old ? route.link : ''"
					:href="(route.old ? config.public.oldAppURL : '') + route.link"
				>
					<template #prepend>
						<v-icon class="mr-3" :icon="route.icon" />
					</template>
				</v-list-item>

				<v-list-item class="menu_item drop_menu_wrap"
					v-if="route.pages && route.title != 'Settings'"
					:title="route.title"
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

				<v-list-item class="menu_item submenu_wrap"
					v-if="route.submenu"
					:title="route.title"
					@click="isOpenSubmenu = !isOpenSubmenu"
				>
					<template #prepend>
						<v-icon class="mr-3" :icon="route.icon" />
					</template>

					<div v-show="isOpenSubmenu" class="submenu">
						<v-list nav class="submenu_list pa-0"
							v-for="(submenu, index) in route.submenu"
							:key="index"
						>
							<v-list-subheader>{{ submenu.title }}</v-list-subheader>
							<v-list-item class="menu_item drop_menu_wrap"
								v-for="({link, title, old, pages}, i) in submenu.pages"
								:key="i"
								:title="title"
								:to="!old ? link : ''"
								:href="old ? config.public.oldAppURL + link : ''"
								:disabled="!link"
							>
								<v-list nav class="drop_menu pa-0" v-if="pages">
									<v-list-item class="menu_item"
										v-for="({link, title, old}, i) in pages"
										:key="i"
										:title="title"
										:to="!old ? link : ''"
										:href="old ? config.public.oldAppURL + link : ''"
										:disabled="!link"
									/>
								</v-list>
							</v-list-item>
						</v-list>
					</div>
				</v-list-item>
			</template>
		</v-list>
	</v-navigation-drawer>
</template>

<script setup>
	import menu from "~/assets/data/menu.js";

	let open = ref(['user'])
	let rail = ref(false)
	let isOpenSubmenu = ref(false)

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
	text-transform: uppercase;

	&.router-link-exact-active {
		color: $primary;
	}
}
.drop_menu_wrap:hover {
	background: #9e9e9e33;
	cursor: pointer;
	.drop_menu {
		opacity: 1;
		visibility: visible;
	}
}
.v-list-item-title {
	text-transform: uppercase;
}
.menu {
	overflow: inherit;
	text-transform: uppercase;
}
.submenu {
	position: fixed;
	top: 55px;
	left: 160px;
	width: 160px;
	height: calc(100vh - 55px);
	background: #000;
	border-left: 1px solid $border;

	&_list {
		background: #000;
		color: #fff;
		overflow: inherit;
	}
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

	&.active {
		opacity: 1;
		visibility: visible;
	}
}
</style>
