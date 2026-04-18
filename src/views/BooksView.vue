<script setup lang="ts">
import { ref } from 'vue'
import { MdPreview } from 'md-editor-v3'
import 'md-editor-v3/lib/preview.css'

const markdownContent = ref(`
# My First Book

This is a book written in **Markdown**.

## Chapter 1

Here is an image:

![Book Cover](/book-cover.png)

## Another image from internet

![Vue Logo](https://vuejs.org/images/logo.png)

> This is a quote in Markdown.
`)
</script>

<template>
  <div class="page">
    <div class="book-shell">
      <div class="book-header">
        <p class="eyebrow">Published Tome</p>
        <h1>Published Book</h1>
        <p class="subtitle">
          Read the scrolls of this adventure, written in Markdown and released to the realm.
        </p>
      </div>

      <div class="markdown-card">
        <MdPreview
          editor-id="preview-only"
          :model-value="markdownContent"
          preview-theme="github"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  padding: 56px 24px;
  color: #f8ead0;
  background:
    radial-gradient(circle at 50% 20%, rgba(214, 168, 79, 0.18), transparent 28%),
    radial-gradient(circle at 15% 15%, rgba(127, 29, 29, 0.25), transparent 32%),
    linear-gradient(135deg, #0f0a07, #1c1410 50%, #090605);
}

.book-shell {
  width: min(980px, 94vw);
  margin: 0 auto;
}

.book-header {
  margin-bottom: 28px;
  padding: 38px 42px;
  text-align: center;
  border-radius: 28px;
  border: 1px solid rgba(214, 168, 79, 0.42);
  background: rgba(42, 28, 22, 0.88);
  box-shadow:
    0 24px 70px rgba(0, 0, 0, 0.45),
    inset 0 0 36px rgba(214, 168, 79, 0.05);
}

.book-header::before {
  content: "📖";
  display: block;
  margin-bottom: 12px;
  font-size: 42px;
}

.eyebrow {
  margin: 0 0 12px;
  color: #d6a84f;
  font-size: 12px;
  letter-spacing: 4px;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  color: #f3e2b8;
  font-size: clamp(42px, 6vw, 76px);
  line-height: 1;
  text-shadow:
    0 4px 0 #5c3518,
    0 12px 30px rgba(0, 0, 0, 0.6);
}

.subtitle {
  max-width: 620px;
  margin: 22px auto 0;
  color: #c9b28c;
  font-size: 17px;
  line-height: 1.7;
}

.markdown-card {
  padding: 42px;
  border-radius: 28px;
  border: 1px solid rgba(214, 168, 79, 0.38);
  background:
    linear-gradient(rgba(243, 226, 184, 0.94), rgba(238, 213, 160, 0.95));
  box-shadow:
    0 30px 90px rgba(0, 0, 0, 0.5),
    inset 0 0 60px rgba(92, 53, 24, 0.12);
}

/* Style markdown preview inside md-editor-v3 */
:deep(.md-editor-preview-wrapper) {
  padding: 0;
  background: transparent;
}

:deep(.md-editor-preview) {
  color: #2a1c16;
  font-size: 17px;
  line-height: 1.8;
  background: transparent;
}

:deep(.md-editor-preview h1),
:deep(.md-editor-preview h2),
:deep(.md-editor-preview h3) {
  color: #5c3518;
  font-family: Georgia, "Times New Roman", serif;
}

:deep(.md-editor-preview h1) {
  padding-bottom: 14px;
  border-bottom: 2px solid rgba(92, 53, 24, 0.25);
  font-size: 42px;
}

:deep(.md-editor-preview h2) {
  margin-top: 36px;
  font-size: 30px;
}

:deep(.md-editor-preview blockquote) {
  margin: 24px 0;
  padding: 16px 22px;
  color: #5c3518;
  border-left: 5px solid #d6a84f;
  background: rgba(214, 168, 79, 0.16);
  border-radius: 12px;
}

:deep(.md-editor-preview img) {
  display: block;
  max-width: 100%;
  margin: 24px auto;
  border-radius: 18px;
  border: 1px solid rgba(92, 53, 24, 0.28);
  box-shadow: 0 16px 36px rgba(42, 28, 22, 0.25);
}

@media (max-width: 640px) {
  .page {
    padding: 32px 16px;
  }

  .book-header,
  .markdown-card {
    padding: 28px 22px;
    border-radius: 22px;
  }
}
</style>