<template>
	<section class="balance-report">
		<ReportHeader
			:entity-type="entityType"
			:content-type="contentType"
			:layouts="layouts"
			:disabled="isLoading"
			@set:layout="(ev) => console.log('SET LAYOUT AS DEFAULT: ', ev)"
			@select:layout="(ev) => console.log('SELECT LAYOUT', ev)"
		/>

		<div class="balance-report__content">CONTENT</div>

		<div v-if="isLoading" class="balance-report__loader">
			<FmProgressCircular indeterminate size="100" />
		</div>
	</section>
</template>

<script setup>
	import { onBeforeMount, ref } from 'vue';
	import { FmProgressCircular } from '@finmars/ui';
	import { getListLayout } from '~/services/uiService';
	import ReportHeader from '~/components/pages/reports/common/ReportHeader/ReportHeader.vue';

	definePageMeta({
		middleware: 'auth',
		bread: [
			{
				text: 'Balance Report',
				to: '/reports/balance',
				disabled: true
			}
		]
	});

	const entityType = 'balance-report';
	const contentType = 'reports.balancereport';
	const isLoading = ref(false);
	const layouts = ref([]);

	async function getLayouts() {
		const res = await getListLayout(entityType, { pageSize: 1000 });
		layouts.value = res.results;
	}

	onBeforeMount(async () => {
		try {
			isLoading.value = true;
			await getLayouts();
		} finally {
			isLoading.value = false;
		}
	});
</script>

<style scoped lang="scss">
	.balance-report {
		position: relative;
		width: 100%;
		height: 100%;
		color: var(--on-surface);

		&__content {
			position: relative;
			width: 100%;
			height: calc(100% - 130px);
		}

		&__loader {
			position: absolute;
			inset: 0;
			z-index: 5;
			pointer-events: none;
			display: flex;
			justify-content: center;
			align-items: center;
		}
	}
</style>
