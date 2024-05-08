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
		middleware: 'auth',
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
		grid-template-columns: 730px 500px;
		align-items: flex-start;
		justify-content: flex-start;
		gap: 20px
	}
	.hp_block {
		border: 1px solid var(--table-border-color);
		border-radius: 3px;
		background: var(--page-background-color);
	}
	.hp_title {
		background: var(--table-header-background-color);
		height: 33px;
		line-height: 33px;
		padding: 0 20px;
		font-weight: 500;
		border-bottom: 1px solid var(--table-border-color);
		font-size: 14px;
	}

</style>
