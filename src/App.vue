<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { documentTitle } from '@/constants/appCopy'

onMounted(() => {
  document.title = documentTitle
})
</script>

<template>
  <RouterView />
</template>
