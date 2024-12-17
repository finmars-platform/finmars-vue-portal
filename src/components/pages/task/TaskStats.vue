<template>
	<div class="relative w-full min-h-[24px]">
		<div
			class="flex justify-start align-center gap-x-2 text-[18px]"
			@click.stop.prevent="showContent = !showContent"
		>
			Workers stats

			<FmIcon
				:icon="showContent ? 'mdi-menu-down' : 'mdi-menu-right'"
				color="var(--on-surface-variant)"
			/>
		</div>

		<div class="relative w-full h-[16px] flex justify-start align-center">
			<FmProgressLinear v-show="isStatsLoading" indeterminate />
		</div>

		<div v-show="showContent">
			<div v-for="(stat, key) in stats" :key="key" class="mb-2">
				<div><b>Worker: </b> {{ key }}</div>
				<div class="pl-5"><b>Uptime: </b> {{ getStatTime(stat) }}</div>
				<div class="pl-5">
					<b>Memory consumed: </b> {{ getStatMemoryConsumed(stat) }} MB
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
	import { onBeforeMount, onBeforeUnmount, ref } from 'vue';
	import dayjs from 'dayjs';
	import utc from 'dayjs/plugin/utc';
	import { FmIcon, FmProgressLinear } from '@finmars/ui';
	import useApi from '@/composables/useApi';

	dayjs.extend(utc);

	const isStatsLoading = ref(false);
	const statsRequestTimerId = ref();
	const stats = ref([]);
	const showContent = ref(false);

	async function getStats() {
		try {
			isStatsLoading.value = true;
			stats.value = await useApi('taskStats.get', {});
		} catch (e) {
			console.error('Stats loading error. ', e);
		} finally {
			isStatsLoading.value = false;
		}
	}

	function getStatTime(stat) {
		if (!stat.uptime) {
			return 0;
		}

		return dayjs.utc(stat.uptime * 1000).format('HH:mm:ss');
	}

	function getStatMemoryConsumed(stat) {
		if (!stat.rusage?.maxrss) {
			return 0;
		}

		return (stat.rusage.maxrss / 1024).toFixed(3);
	}

	onBeforeMount(async () => {
		await getStats();

		statsRequestTimerId.value = setInterval(getStats, 30000);
	});

	onBeforeUnmount(() => {
		statsRequestTimerId.value && clearInterval(statsRequestTimerId.value);
	});
</script>
