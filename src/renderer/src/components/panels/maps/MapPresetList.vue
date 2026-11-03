<template>
    <div v-for="name in props.mapNames" :key="name" class="text-xs text-muted">{{ name }}</div>
</template>
<script setup lang="ts">
const props = defineProps<{ mapNames: string[] }>();
</script>

<style scoped></style>
