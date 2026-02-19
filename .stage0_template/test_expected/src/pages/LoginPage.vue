<template>
  <LoginPage
    :login-fn="loginFn"
    :default-redirect="defaultRedirect"
  />
</template>

<script setup lang="ts">
import { LoginPage } from '@agile-learning-institute/mentorhub_spa_utils'
import { useAuth } from '@/composables/useAuth'

const { login } = useAuth()

async function loginFn(subject?: string, roles?: string[]) {
  await login(subject, roles)
}

// Default redirect to first control domain list
const defaultRedirect = '/controls'
</script>