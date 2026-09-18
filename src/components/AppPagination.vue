<script setup>
defineProps({ page: Number, totalPages: Number })
const emit = defineEmits(['change'])
</script>

<template>
  <nav class="pagination">
    <button :disabled="page <= 1" @click="emit('change', page - 1)">Назад</button>
    <span class="pages">Стр. {{ page }} из {{ totalPages }}</span>
    <button :disabled="page >= totalPages" @click="emit('change', page + 1)">Вперед</button>
  </nav>
</template>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 24px;
  justify-content: center;
}
.pages {
  color: var(--text-muted);
}
</style>
