<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import PwaInstallSheet from '@/components/pwa/PwaInstallSheet.vue'
import { documentTitle } from '@/constants/appCopy'

onMounted(() => {
  document.title = documentTitle
})
</script>

<template>
  <RouterView />
  <PwaInstallSheet />
</template>
