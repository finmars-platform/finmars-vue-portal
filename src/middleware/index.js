export default defineNuxtRouteMiddleware((to, from) => {
  console.trace("autoreload");
  return  navigateTo('/home')
})
