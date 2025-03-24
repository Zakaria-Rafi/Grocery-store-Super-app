<template>
  <div>
    <h1>Release Notes</h1>
    <!-- eslint-disable vue/no-v-html -->
    <div v-html="markdownHtml" />
    <div v-if="error">{{ error }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { marked } from "marked";
import DOMPurify from "dompurify";

const markdownHtml = ref("");
const error = ref(null);
const { locale } = useI18n();

onMounted(async () => {
  try {
    const response = await fetch(`/releasenotes/releasenotes-${locale.value}.md`);
    const markdown = await response.text();
    markdownHtml.value = DOMPurify.sanitize(marked(markdown));
  } catch (err) {
    error.value = err;
  }
});
</script>
