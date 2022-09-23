export default defineNuxtRouteMiddleware((to, from) => {
  return navigateTo('/home', { redirectCode: 301 })
})
