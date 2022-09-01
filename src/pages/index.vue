<template>
	<div class="fm_container wrap">
		<PagesHomepageNotifications />

		<div class="hp_block">
			<div class="hp_title">Bookmarks</div>

			<div class="hp_content">
				<div style="padding: 10px 20px;">Coming soon</div>
			</div>
		</div>
	</div>
</template>

<script setup>

	definePageMeta({
		bread: [
			{
				text: 'Home page: Investor',
				disabled: true
			},
		],
	});

</script>

<style lang="scss" scoped>
	.wrap {
		display: grid;
		grid-template-columns: 1fr 500px;
		align-items: flex-start;
		gap: 20px
	}
	.hp_block {
		border: 1px solid $border;
		border-radius: 3px;
		background: $separ;
		max-width: 730px;
	}
	.hp_title {
		background: $main-darken;
		height: 33px;
		line-height: 33px;
		padding: 0 20px;
		font-weight: 500;
		border-bottom: 1px solid $border;
		font-size: 14px;
		font-weight: 500;
	}

</style>
