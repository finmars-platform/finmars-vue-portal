export default defineNuxtRouteMiddleware((to, from) => {
  return window.location.href = '/home'
})
