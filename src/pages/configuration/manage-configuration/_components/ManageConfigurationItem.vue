<template>
	<div class="manage-configuration-item">
		<div class="row">
			<FmChip v-if="isPrimary" class="chip" elevated value="Primary" />

			<FmChip
				v-if="isFromMarketplace"
				elevated
				type="outlined"
				class="chip"
				value="From Marketplace"
			/>
		</div>

		<div class="title">{{ name }}</div>
		<div class="list">
			<div class="description">code: {{ code }}</div>
			<div class="description">version: {{ version }}</div>
			<div class="description"></div>
		</div>

		<FmButton size="small" @click="onOpen" class="button" rounded>
			Open</FmButton
		>
	</div>
</template>

<script setup>
	import { FmChip, FmButton } from '@finmars/ui';
	import { useGetNuxtLink } from '~/composables/useMeta';

	const route = useRoute();
	const router = useRouter();

	const props = defineProps({
		isFromMarketplace: Boolean,
		isPrimary: Boolean,
		version: String,
		code: String,
		name: String,
		itemId: Number
	});

	function onOpen() {
		router.push(
			useGetNuxtLink(
				`/configuration/manage-configuration/${props.itemId}`,
				route.params
			)
		);
	}
</script>

<style scoped lang="scss">
	.manage-configuration-item {
		border-radius: 12px;
		width: 256px;
		padding: 16px;
		border: 1px solid var(--table-border-color);

		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.row {
		display: flex;
		justify-content: flex-end;
	}

	.chip {
		&:not(:first-child) {
			margin-left: auto;
		}
	}

	.button {
		margin-left: auto;
		margin-right: auto;
		margin-top: auto;
	}

	.description {
		font-size: 12px;
	}
</style>
