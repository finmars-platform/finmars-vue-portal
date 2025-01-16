<template>
	<div class="channels-toolbar">
		<ChannelsToolbarType v-model="filter.type" />

		<ChannelsToolbarModule v-model="filter.module" />

		<ChannelsToolbarPortfolio v-model="filter.portfolio" />

		<ChannelsToolbarDate v-model="filter.date" />

		<FmIconButton icon="mdi-magnify" variant="text" />

		<ChannelsToolbarActions
			:channel="channel"
			@select:action="runSelectAction"
		/>
	</div>
</template>

<script setup>
	import { ref } from 'vue';
	import { FmIconButton } from '@finmars/ui';
	import ChannelsToolbarActions from './ChannelsToolbarActions.vue';
	import ChannelsToolbarType from './ChannelsToolbarType.vue';
	import ChannelsToolbarModule from './ChannelsToolbarModule.vue';
	import ChannelsToolbarPortfolio from './ChannelsToolbarPortfolio.vue';
	import ChannelsToolbarDate from './ChannelsToolbarDate.vue';

	const props = defineProps({
		channel: {
			type: Object
		}
	});

	const emits = defineEmits(['select:action']);

	const filter = ref({
		type: 'all',
		module: 'all',
		portfolio: 'all',
		date: {
			from: '',
			to: ''
		}
	});

	function runSelectAction(action) {
		emits('select:action', action);
	}
</script>

<style lang="scss" scoped>
	.channels-toolbar {
		position: relative;
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: flex-end;
		align-items: center;
		flex-grow: 1;

		:deep(.v-btn) {
			text-transform: none;
		}
	}
</style>
