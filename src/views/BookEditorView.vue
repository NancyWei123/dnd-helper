<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()

const bookId = route.params.bookId

const currentChapter = ref('Chapter 1: The First Quest')
const saving = ref(false)

const chapters = ref([
  {
    id: 1,
    title: 'Chapter 1: The First Quest'
  },
  {
    id: 2,
    title: 'Chapter 2: The Lost Map'
  },
  {
    id: 3,
    title: 'Chapter 3: The Dragon Gate'
  }
])

const markdownContent = ref(`# Chapter 1: The First Quest

The rain fell softly outside the old tavern.

A young adventurer opened a worn leather journal and began to write.

## Scene 1

The candlelight moved like tiny golden spirits on the wooden table.

![Book Cover](/book-cover.png)

> Every great adventure begins with a single written word.

## Notes

- Main character enters the tavern
- Introduce the mysterious map
- Add dialogue with the old wizard
`)

const selectChapter = (chapter: { id: number; title: string }) => {
  currentChapter.value = chapter.title

  markdownContent.value = `# ${chapter.title}

Start writing your adventure here...

## Scene

Describe the scene in Markdown.

![Book Cover](/book-cover.png)

> Add a quote or important lore here.
`
}

const saveChapter = async () => {
  saving.value = true

  try {
    // Later you can send this to Django/Spring Boot backend
    // await fetch(`http://localhost:8000/api/chapters/${chapterId}/`, {
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ content_md: markdownContent.value })
    // })

    console.log('Saving markdown:', markdownContent.value)

    ElMessage.success('Chapter saved')
  } catch (error) {
    ElMessage.error('Save failed')
  } finally {
    saving.value = false
  }
}

const publishBook = () => {
  ElMessage.success('Book published to the realm')
  router.push(`/read/${bookId}`)
}
</script>

<template>
  <div class="editor-page">
    <aside class="chapter-sidebar">
      <div class="sidebar-header">
        <p class="eyebrow">Scrolls</p>
        <h2>Chapters</h2>
      </div>

      <div class="chapter-list">
        <button
          v-for="chapter in chapters"
          :key="chapter.id"
          class="chapter-item"
          :class="{ active: currentChapter === chapter.title }"
          @click="selectChapter(chapter)"
        >
          <span class="chapter-icon">📜</span>
          <span>{{ chapter.title }}</span>
        </button>
      </div>

      <el-button class="sidebar-button">
        + New Chapter
      </el-button>
    </aside>

    <main class="editor-main">
      <header class="editor-header">
        <div>
          <p class="eyebrow">Scriptorium</p>
          <h1>{{ currentChapter }}</h1>
        </div>

        <div class="header-actions">
          <el-button class="fantasy-button secondary" :loading="saving" @click="saveChapter">
            Save Draft
          </el-button>

          <el-button class="fantasy-button primary" @click="publishBook">
            Publish Tome
          </el-button>
        </div>
      </header>

      <section class="editor-card">
        <MdEditor
          v-model="markdownContent"
          language="en-US"
          preview-theme="github"
          code-theme="github"
        />
      </section>
    </main>
  </div>
</template>

<style scoped>
.editor-page {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 290px 1fr;
  color: #f8ead0;
  background:
    radial-gradient(circle at 60% 20%, rgba(214, 168, 79, 0.16), transparent 30%),
    radial-gradient(circle at 12% 18%, rgba(127, 29, 29, 0.24), transparent 34%),
    linear-gradient(135deg, #0f0a07, #1c1410 50%, #090605);
}

.chapter-sidebar {
  padding: 28px;
  border-right: 1px solid rgba(214, 168, 79, 0.28);
  background: rgba(15, 10, 7, 0.72);
  box-shadow: 16px 0 50px rgba(0, 0, 0, 0.28);
}

.sidebar-header {
  margin-bottom: 24px;
}

.eyebrow {
  margin: 0 0 8px;
  color: #d6a84f;
  font-size: 12px;
  letter-spacing: 4px;
  text-transform: uppercase;
}

h1,
h2 {
  margin: 0;
  color: #f3e2b8;
  font-family: Georgia, "Times New Roman", serif;
}

h1 {
  font-size: clamp(32px, 4vw, 52px);
  line-height: 1.1;
  text-shadow: 0 4px 0 #5c3518;
}

h2 {
  font-size: 32px;
}

.chapter-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chapter-item {
  width: 100%;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  text-align: left;
  border-radius: 16px;
  border: 1px solid rgba(214, 168, 79, 0.2);
  background: rgba(42, 28, 22, 0.68);
  color: #c9b28c;
  cursor: pointer;
  transition: all 0.2s ease;
}

.chapter-item:hover,
.chapter-item.active {
  color: #f3e2b8;
  border-color: rgba(214, 168, 79, 0.65);
  background: rgba(92, 53, 24, 0.72);
  transform: translateX(4px);
}

.chapter-icon {
  font-size: 20px;
}

.sidebar-button {
  width: 100%;
  margin-top: 22px;
  border-radius: 999px;
  border: 1px solid rgba(214, 168, 79, 0.6);
  background: transparent;
  color: #f3e2b8;
}

.editor-main {
  padding: 34px;
  overflow: hidden;
}

.editor-header {
  margin-bottom: 24px;
  padding: 28px;
  display: flex;
  justify-content: space-between;
  gap: 24px;
  align-items: center;
  border-radius: 26px;
  border: 1px solid rgba(214, 168, 79, 0.36);
  background: rgba(42, 28, 22, 0.88);
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.38);
}

.header-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.fantasy-button {
  border-radius: 999px;
  font-weight: 700;
  cursor: pointer;
}

.primary {
  border: none;
  background: linear-gradient(135deg, #d6a84f, #8f5f1f);
  color: #1c1410;
}

.secondary {
  border: 1px solid rgba(214, 168, 79, 0.65);
  background: rgba(15, 10, 7, 0.45);
  color: #f3e2b8;
}

.editor-card {
  overflow: hidden;
  height: calc(100vh - 190px);
  border-radius: 26px;
  border: 1px solid rgba(214, 168, 79, 0.36);
  background: #f3e2b8;
  box-shadow: 0 30px 90px rgba(0, 0, 0, 0.5);
}

:deep(.md-editor) {
  height: 100%;
  border-radius: 26px;
}

:deep(.md-editor-toolbar-wrapper) {
  background: #2a1c16;
  border-bottom: 1px solid rgba(214, 168, 79, 0.3);
}

:deep(.md-editor-toolbar-item) {
  color: #f3e2b8;
}

:deep(.md-editor-toolbar-item:hover) {
  color: #d6a84f;
}

@media (max-width: 900px) {
  .editor-page {
    grid-template-columns: 1fr;
  }

  .chapter-sidebar {
    border-right: none;
    border-bottom: 1px solid rgba(214, 168, 79, 0.28);
  }

  .editor-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .editor-card {
    height: 70vh;
  }
}
</style>