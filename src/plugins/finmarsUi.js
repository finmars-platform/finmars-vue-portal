/*import { FmNavigationPortal, FmHeader } from '@finmars/ui'

export default defineNuxtPlugin((nuxtApp) => {
	nuxtApp.vueApp.component('FmNavigationPortal', FmNavigationPortal)
	nuxtApp.vueApp.component('FmHeader', FmHeader)
})*/

import { uiComponentsPlugin } from '@finmars/ui'

export default defineNuxtPlugin((nuxtApp) => {
	nuxtApp.vueApp.use(uiComponentsPlugin)
})
