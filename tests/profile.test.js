import { describe, test } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils-edge'

const html = await $fetch('/')


