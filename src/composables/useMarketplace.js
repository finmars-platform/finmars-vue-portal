export function useMarketplace() {
	const items = ref([])
	const readyStatus = reactive({ data: false })
	const filters = reactive({})

	const totalPages = ref(1)
	const currentPage = ref(1)
	const activeTaskId = ref(null)
	const pageSize = ref(40)
	const isShowModules = ref(false)

	const pages = ref([])

	// TODO move to separate service to keep it DRY
	const alphabets = [
		'#357EC7', // A
		'#C11B17', // B
		'#008080', // C
		'#728C00', // D
		'#0020C2', // E
		'#347C17', // F
		'#D4A017', // G
		'#7D0552', // H
		'#9F000F', // I
		'#E42217', // J
		'#F52887', // K
		'#571B7E', // L
		'#1F45FC', // M
		'#C35817', // N
		'#F87217', // O
		'#41A317', // P
		'#4C4646', // Q
		'#4CC417', // R
		'#C12869', // S
		'#15317E', // T
		'#AF7817', // U
		'#F75D59', // V
		'#FF0000', // W
		'#000000', // X
		'#E9AB17', // Y
		'#8D38C9' // Z
	]

	function getAvatar(char) {
		let charCode = char.charCodeAt(0)
		let charIndex = charCode - 65

		let colorIndex = charIndex % alphabets.length

		return alphabets[colorIndex]
	}

	function openPreviousPage() {
		if (currentPage.value <= 1) return

		currentPage.value = currentPage.value - 1

		getData()
	}

	function openNextPage() {
		if (currentPage.value >= totalPages.value) return

		currentPage.value = currentPage.value + 1

		getData()
	}

	function openPage(page) {
		if (!page.number) return

		currentPage.value = page.number

		getData()
	}

	function generatePages(data) {
		totalPages.value = Math.ceil(data.count / pageSize.value)

		pages.value = []

		for (let i = 1; i <= totalPages.value; i++) {
			pages.value.push({
				number: i,
				caption: i.toString()
			})
		}

		if (totalPages.value > 10) {
			let currentPageIndex = 0

			pages.value.forEach((item, index) => {
				if (currentPage.value === item.number) {
					currentPageIndex = index
				}
			})

			pages.value = pages.value.filter((item, index) => {
				if (index < 2 || index > totalPages.value - 3) {
					return true
				}

				if (index === currentPageIndex) {
					return true
				}

				if (index > currentPageIndex - 3 && index < currentPageIndex) {
					return true
				}

				if (index < currentPageIndex + 3 && index > currentPageIndex) {
					return true
				}

				return false
			})

			for (let i = 0; i < pages.value.length; i = i + 1) {
				let j = i + 1

				if (j < pages.value.length) {
					if (pages.value[j].number && pages.value[i].number) {
						if (pages.value[j].number - pages.value[i].number > 1) {
							pages.value.splice(i + 1, 0, {
								caption: '...'
							})
						}
					}
				}
			}
		}
	}

	async function getData() {
		const { configCodes } = useStore()

		readyStatus.data = false

		if (isShowModules.value) {
			delete filters['is_package']
		} else {
			filters['is_package'] = true
		}

		const payload = {
			pageSize: pageSize.value,
			page: currentPage.value,
			ordering: 'name',
			...filters
		}

		try {
			const data = await useApi('marketplaceList.get', { filters: payload })

			if (data) {
				generatePages(data)

				items.value = data.results

				items.value.forEach((remoteItem) => {
					configCodes.forEach(function (localItem) {
						if (
							remoteItem.configuration_code === localItem.configuration_code
						) {
							remoteItem.localItem = localItem
						}
					})
				})
			}
		} catch (e) {
			console.warn('Error marketplace.get', e)
		} finally {
			readyStatus.data = true
		}
	}

	async function installConfiguration(item) {
		try {
			const payload = {
				configuration_code: item.configuration_code,
				version: item.latest_release_object.version,
				channel: item.latest_release_object.channel,
				is_package: item.is_package
			}

			const res = await useApi('marketplaceInstall.post', { body: payload })

			activeTaskId.value = res.task_id
		} catch (e) {
			console.log('installConfiguration', e)
		}
	}

	function setFiltersQuery(query) {
		currentPage.value = 1
		filters.query = query

		getData()
	}

	function setShowModules(bool) {
		isShowModules.value = bool

		getData()
	}

	function removeActiveTaskId() {
		activeTaskId.value = null
	}

	return {
		getData,
		isShowModules,
		activeTaskId,
		filters,
		items,
		installConfiguration,
		currentPage,
		totalPages,
		pages,
		openNextPage,
		readyStatus,
		openPreviousPage,
		openPage,
		getAvatar,
		setFiltersQuery,
		setShowModules,
		removeActiveTaskId
	}
}
