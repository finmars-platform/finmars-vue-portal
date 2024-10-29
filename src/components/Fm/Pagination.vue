<template>
	<div class="m-t-16 pagination-bar">
		<FmBtn
			:disabled="currentPage === 1"
			@click="openPreviousPage()"
			type="text"
		>
			Previous
		</FmBtn>
		<div class="flex pages-wrapper">
			<div v-for="page in pages" :key="page.number">
				<FmBtn
					@click="openPage(page)"
					v-if="page.number"
					:type="currentPage === page.number ? 'primary' : ''"
					class="pagination-bar-button"
				>
					{{page.caption}}
				</FmBtn>
				<div v-if="!page.number" style="margin: 10px;">
					{{page.caption}}
				</div>
			</div>
		</div>
		<FmBtn
			@click="openNextPage()"
			v-show="currentPage < totalPages"
			type="text"
		>
			Next
		</FmBtn>
	</div>
</template>

<script setup>
	import { defineProps, defineEmits } from 'vue';

	const route = useRoute();

	const props = defineProps({
		count: {
			type: Number,
			required: true
		},
		pageSize: {
			type: Number,
			default: 40
		}
	});

	const pages = ref([]);
	const totalPages = ref(0);
	const currentPage = ref(route.query.page ? parseInt(route.query.page) : 1);
	const emit = defineEmits(['page-change']);

	watch(
		() => props.count,
		() => {
			generatePages();
		}
	);

	const generatePages = () => {
		totalPages.value = Math.ceil(props.count / props.pageSize);
		pages.value = [];
		for (var i = 1; i <= totalPages.value; i = i + 1) {
			pages.value.push({
				number: i,
				caption: i.toString()
			});
		}
		if (totalPages.value > 10) {
			let currentPageIndex = 0;
			pages.value.forEach(function (item, index) {
				if (currentPage.value === item.number) {
					currentPageIndex = index;
				}
			});
			pages.value = pages.value.filter(function (item, index) {
				if (index < 2 || index > totalPages.value - 3) {
					return true;
				}
				if (index === currentPageIndex) {
					return true;
				}
				if (index > currentPageIndex - 3 && index < currentPageIndex) {
					return true;
				}
				if (index < currentPageIndex + 3 && index > currentPageIndex) {
					return true;
				}
				return false;
			});

			for (var i = 0; i < pages.value.length; i = i + 1) {
				var j = i + 1;
				if (j < pages.value.length) {
					if (pages.value[j].number && pages.value[i].number) {
						if (pages.value[j].number - pages.value[i].number > 1) {
							pages.value.splice(i + 1, 0, {
								caption: '...',
							});
						}
					}
				}
			}
		}
	}

	const openPreviousPage = () => {
		if (currentPage.value > 1) {
			currentPage.value = currentPage.value - 1;
			emit('page-change', currentPage.value);
			generatePages();
		}
	};

	const openNextPage = () => {
		if (currentPage.value < totalPages.value) {
			currentPage.value += 1;
			emit('page-change', currentPage.value);
			generatePages();
		}
	};

	const openPage = (page) => {
		if (page.number && page.number !== currentPage.value) {
			currentPage.value = page.number;
			emit('page-change', page.number);
			generatePages();
		}
	};
</script>

<style scoped lang="scss">
	.pagination-bar {
		display: flex;
		flex-wrap: nowrap;
		align-items: center;
		justify-content: flex-start;
	}
	.pages-wrapper > div {
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>
