<template>
	<v-toolbar class="px-7" prominent>
		<v-toolbar-title>{{ $route.meta.title || "No title" }}</v-toolbar-title>

		<v-spacer></v-spacer>

		<v-btn class="text-lowercase">
			<v-icon start size="24" icon="mdi-account-box"></v-icon>
			{{ "a.priak" }}
		</v-btn>
	</v-toolbar>
</template>

<script setup>
import { useUserStore } from "~/stores/user";

let user = useUserStore();
</script>

<style lang="scss" scoped>
.header {
	height: 50px;
	background: #eee;
	padding: 0 20px;
}
</style>
