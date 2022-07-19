<template>
	<div>
		<v-container class="" fluid>
			<div class="flex aic">
				<h3 class="text-h4">Active Tokens</h3>

				<v-btn class="ml-6">Logout from all devices</v-btn>
			</div>

			<ul class="token_item" v-for="(token, index) in tokenInfo" :key="index">
				<li class="token_item_line" v-if="token.current_master_user_object">
					<b class="token_item_title">Workspace:</b>
					{{ token.current_master_user_object.name }}
					<div
						class="current_token"
						v-if="
							token.current_master_user_object &&
							store.current.base_api_url ==
								token.current_master_user_object.base_api_url
						"
					>
						Current
					</div>
				</li>
				<li class="token_item_line">
					<b class="token_item_title">Access Expire at:</b>
					{{ fromatDate(token.access_token_expires_at) }}
				</li>
				<li class="token_item_line">
					<b class="token_item_title">Refresh Expire at:</b>
					{{ fromatDate(token.refresh_token_expires_at) }}
				</li>
				<li class="token_item_line">
					<b class="token_item_title">Created:</b>
					{{ fromatDate(token.created) }}
				</li>
				<li
					class="flex token_item_line"
					v-if="token.current_master_user_object"
				>
					<b class="token_item_title">API URL: </b>
					<NuxtLink
						:to="`${config.public.apiURL}/${token.current_master_user_object.base_api_url}/api/v1`"
					>
						{{
							`${config.public.apiURL}/${token.current_master_user_object.base_api_url}/api/v1`
						}}
					</NuxtLink>
				</li>
				<li class="token_item_line">
					<v-btn class="mr-4" color="primary"
						v-if="
							token.current_master_user_object &&
							store.current.base_api_url ==
								token.current_master_user_object.base_api_url
						"
					>
						Refresh token
					</v-btn>
					<v-btn
						color="primary"
						variant="text"
						@click="tokenShows[index] = !tokenShows[index]"
					>
						Show tokens
					</v-btn>
				</li>
				<li class="token_item_line" v-show="tokenShows[index]">
					<b class="token_item_title">Access Token: </b>
					{{ token.keycloak_access_token }}
				</li>
				<li class="token_item_line" v-show="tokenShows[index]">
					<b class="token_item_title">Refresh Token: </b>
					{{ token.keycloak_refresh_token }}
				</li>
			</ul>
		</v-container>
	</div>
</template>

<script setup>
import moment from "moment";

let tokenInfo = (await useApi("tokenInfo.get")).results;
let tokenShows = ref([])

let store = useStore();
const config = useRuntimeConfig();

function fromatDate(date) {
	return moment(date).format("DD.MM.YYYY LT");
}
</script>

<style lang="scss" scoped>
.token_item {
	padding-top: 20px;
}
.token_item_line {
	padding-bottom: 5px;
	display: flex;
	align-items: center;
}
.token_item_title {
	display: inline-block;
	width: 150px;
}
.current_token {
	border: 1px solid $c1;
	background: #fff;
	border-radius: 4px;
	padding: 2px 5px;
	margin-left: 7px;
}
</style>
