<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import { ElMessage } from 'element-plus'
import {
  getChaptersByBook,
  getChapterById,
  createChapter,
  updateChapter,
  type ChapterResponse
} from '@/Api/chapter'

const route = useRoute()
const router = useRouter()

// Must match your route path: /books/:bookId/edit
const bookId = String(route.params.bookId || '')

const loading = ref(false)
const saving = ref(false)

const chapters = ref<ChapterResponse[]>([])
const currentChapter = ref<ChapterResponse | null>(null)
const markdownContent = ref('')

// true means this chapter is only in frontend, not saved to backend yet
const isNewChapter = ref(false)

const loadChapters = async () => {
  if (!bookId) {
    ElMessage.error('Book id is missing from URL')
    return
  }

  loading.value = true

  try {
    chapters.value = await getChaptersByBook(bookId)

    if (chapters.value.length > 0) {
      await selectChapter(chapters.value[0])
    } else {
      addNewChapter()
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('Failed to load chapters')
  } finally {
    loading.value = false
  }
}

const selectChapter = async (chapter: ChapterResponse) => {
  // If user is editing a new unsaved chapter, warn them before switching
  if (isNewChapter.value) {
    ElMessage.warning('Please save the new chapter first')
    return
  }

  try {
    const detail = await getChapterById(bookId, chapter.id)

    currentChapter.value = detail
    markdownContent.value = detail.contentMd || ''
    isNewChapter.value = false
  } catch (error) {
    console.error(error)
    ElMessage.error('Failed to load chapter')
  }
}

const addNewChapter = () => {
  const nextOrder = chapters.value.length + 1

  currentChapter.value = {
    id: 0,
    bookId: Number(bookId),
    title: `Chapter ${nextOrder}: New Chapter`,
    contentMd: '',
    chapterOrder: nextOrder,
    createdAt: '',
    updatedAt: ''
  }

  markdownContent.value = `# Chapter ${nextOrder}: New Chapter

Start writing your adventure here...

## Scene

Describe the scene in Markdown.

> Add a quote or important lore here.
`

  isNewChapter.value = true
}

const saveChapter = async () => {
  if (!currentChapter.value) {
    ElMessage.warning('Please select a chapter first')
    return
  }

  if (!currentChapter.value.title.trim()) {
    ElMessage.warning('Please enter a chapter title')
    return
  }

  saving.value = true

  try {
    if (isNewChapter.value) {
      const created = await createChapter(bookId, {
        title: currentChapter.value.title,
        contentMd: markdownContent.value,
        chapterOrder: currentChapter.value.chapterOrder
      })

      chapters.value.push(created)
      currentChapter.value = created
      markdownContent.value = created.contentMd || markdownContent.value
      isNewChapter.value = false

      ElMessage.success('New chapter created')
    } else {
      const updated = await updateChapter(bookId, currentChapter.value.id, {
        title: currentChapter.value.title,
        contentMd: markdownContent.value,
        chapterOrder: currentChapter.value.chapterOrder
      })

      currentChapter.value = updated
      markdownContent.value = updated.contentMd || markdownContent.value

      chapters.value = chapters.value.map((chapter) =>
        chapter.id === updated.id ? updated : chapter
      )

      ElMessage.success('Chapter saved')
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('Save failed')
  } finally {
    saving.value = false
  }
}

const publishBook = () => {
  ElMessage.success('Book published to the realm')
  router.push(`/books/${bookId}/read`)
}

onMounted(() => {
  loadChapters()
})
</script>

<template>
  <div class="editor-page">
    <aside class="chapter-sidebar">
      <div class="sidebar-header">
        <p class="eyebrow">Scrolls</p>
        <h2>Chapters</h2>
      </div>

      <div v-if="loading" class="sidebar-state">
        Loading chapters...
      </div>

      <div v-else-if="chapters.length === 0 && !currentChapter" class="sidebar-state">
        No chapters yet.
      </div>

      <div v-else class="chapter-list">
        <button
          v-if="isNewChapter && currentChapter"
          class="chapter-item active"
        >
          <span class="chapter-icon">✨</span>
          <span>{{ currentChapter.title }}</span>
        </button>

        <button
          v-for="chapter in chapters"
          :key="chapter.id"
          class="chapter-item"
          :class="{ active: currentChapter?.id === chapter.id && !isNewChapter }"
          @click="selectChapter(chapter)"
        >
          <span class="chapter-icon">📜</span>
          <span>{{ chapter.title }}</span>
        </button>
      </div>

      <el-button class="sidebar-button" @click="addNewChapter">
        + New Chapter
      </el-button>
    </aside>

    <main class="editor-main">
      <header class="editor-header">
        <div class="chapter-title-box">
          <p class="eyebrow">
            {{ isNewChapter ? 'New Scroll' : 'Scriptorium' }}
          </p>

          <el-input
            v-if="currentChapter"
            v-model="currentChapter.title"
            class="chapter-title-input"
            placeholder="Chapter title"
          />

          <h1 v-else>Select a Chapter</h1>
        </div>

        <div class="header-actions">
          <el-button
            class="fantasy-button secondary"
            :loading="saving"
            :disabled="!currentChapter"
            @click="saveChapter"
          >
            {{ isNewChapter ? 'Create Chapter' : 'Save Chapter' }}
          </el-button>

          <el-button class="fantasy-button primary" @click="publishBook">
            Publish Tome
          </el-button>
        </div>
      </header>

      <section class="editor-card">
        <div v-if="!currentChapter" class="empty-editor">
          Select a chapter to start editing.
        </div>

        <MdEditor
          v-else
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

.sidebar-state {
  padding: 16px;
  border-radius: 16px;
  border: 1px solid rgba(214, 168, 79, 0.24);
  background: rgba(42, 28, 22, 0.68);
  color: #c9b28c;
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

.sidebar-button:hover {
  background: rgba(214, 168, 79, 0.12);
  color: #f8ead0;
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

.chapter-title-box {
  flex: 1;
}

.chapter-title-input {
  max-width: 680px;
}

:deep(.chapter-title-input .el-input__wrapper) {
  min-height: 58px;
  border-radius: 18px;
  background: rgba(255, 247, 226, 0.96);
  box-shadow:
    0 0 0 1px rgba(214, 168, 79, 0.45),
    inset 0 2px 5px rgba(64, 35, 12, 0.08);
}

:deep(.chapter-title-input .el-input__inner) {
  color: #2a1c16;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 28px;
  font-weight: 800;
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

.primary:hover {
  background: linear-gradient(135deg, #efc76d, #a86f24);
  color: #1c1410;
}

.secondary {
  border: 1px solid rgba(214, 168, 79, 0.65);
  background: rgba(15, 10, 7, 0.45);
  color: #f3e2b8;
}

.secondary:hover {
  background: rgba(214, 168, 79, 0.14);
  color: #f8ead0;
}

.editor-card {
  overflow: hidden;
  height: calc(100vh - 190px);
  border-radius: 26px;
  border: 1px solid rgba(214, 168, 79, 0.36);
  background: #f3e2b8;
  box-shadow: 0 30px 90px rgba(0, 0, 0, 0.5);
}

.empty-editor {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2a1c16;
  font-size: 22px;
  font-weight: 700;
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

  .header-actions {
    width: 100%;
  }

  .editor-card {
    height: 70vh;
  }
}
</style>