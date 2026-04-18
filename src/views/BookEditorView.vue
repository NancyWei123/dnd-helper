<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
const bookId = route.params.bookId
</script>

<template>
  <div>
    <h1>Book Editor</h1>
    <p>Editing book ID: {{ bookId }}</p>
  </div>
</template>