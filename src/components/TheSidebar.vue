<template>
	<!-- <div class="sidebar">
		<NuxtLink class="logo" to="/">
			<img src="/img/logo.png" alt="" />
		</NuxtLink>

		<ul>
			<li v-for="(item, index) in menuList" :key="index">
				<NuxtLink class="menu_item" :to="item.to">{{ item.title }}</NuxtLink>
			</li>
		</ul>
	</div> -->
	<v-navigation-drawer permanent>
		<v-list-item>
			<v-list-item-content>
				<v-list-item-title class="text-h6"> Application </v-list-item-title>
				<v-list-item-subtitle> subtext </v-list-item-subtitle>
			</v-list-item-content>
		</v-list-item>

		<v-divider></v-divider>

		<v-list dense nav>
			<v-list-item v-for="item in items" :key="item.title" link>
				<v-list-item-icon>
					<v-icon>{{ item.icon }}</v-icon>
				</v-list-item-icon>

				<v-list-item-content>
					<v-list-item-title>{{ item.title }}</v-list-item-title>
				</v-list-item-content>
			</v-list-item>
		</v-list>
	</v-navigation-drawer>
</template>

<script setup>
import menuList from "~/assets/data/menu.json";

const menuItems = menuList;
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
