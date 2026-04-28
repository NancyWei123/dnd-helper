<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import { ElMessage, ElMessageBox } from 'element-plus'
import { uploadMusic, uploadImage } from '@/Api/upload'
import {
  getChaptersByBook,
  getChapterById,
  createChapter,
  updateChapter,
  deleteChapter,
  type ChapterResponse
} from '@/Api/chapter'

const route = useRoute()
const router = useRouter()

const bookId = String(route.params.bookId || '')

const loading = ref(false)
const saving = ref(false)

const chapters = ref<ChapterResponse[]>([])
const currentChapter = ref<ChapterResponse | null>(null)
const markdownContent = ref('')
const musicUrl = ref('')

const isNewChapter = ref(false)

// notification popup
const notifyDialogVisible = ref(false)
const users = ref<any[]>([])
const selectedNotifyUserIds = ref<number[]>([])
const createdChapterForNotify = ref<ChapterResponse | null>(null)
const notifying = ref(false)

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

const fetchUsers = async () => {
  const token = localStorage.getItem('token')

  if (!token) {
    return
  }

  try {
    const response = await fetch('http://localhost:8080/api/users/all', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    if (!response.ok) {
      const message = await response.text()
      throw new Error(message || 'Failed to load users')
    }

    users.value = await response.json()
  } catch (error: any) {
    console.error(error)
    ElMessage.error(error.message || 'Failed to load users')
  }
}

const selectChapter = async (chapter: ChapterResponse) => {
  if (isNewChapter.value) {
    ElMessage.warning('Please save the new chapter first')
    return
  }

  try {
    const detail = await getChapterById(bookId, chapter.id)

    currentChapter.value = detail
    markdownContent.value = detail.contentMd || ''
    musicUrl.value = detail.musicUrl || ''
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
    musicUrl: '',
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

  musicUrl.value = ''
  isNewChapter.value = true
}

const beforeMusicUpload = (file: File) => {
  const isAudio = file.type.startsWith('audio/')
  const isLt50M = file.size / 1024 / 1024 < 50

  if (!isAudio) {
    ElMessage.error('Music must be an audio file')
    return false
  }

  if (!isLt50M) {
    ElMessage.error('Music file size must be less than 50MB')
    return false
  }

  return true
}

const handleMusicUpload = async (options: any) => {
  const file = options.file

  try {
    const result = await uploadMusic(file)

    musicUrl.value = result.url

    ElMessage.success('Music uploaded. Remember to save the chapter.')
  } catch (error) {
    console.error(error)
    ElMessage.error('Music upload failed')
  }
}

const clearMusic = () => {
  musicUrl.value = ''
  ElMessage.success('Music removed')
}

const testMusic = () => {
  if (!musicUrl.value.trim()) {
    ElMessage.warning('Please enter a music URL first')
    return
  }

  const audio = new Audio(musicUrl.value.trim())

  audio.play().catch(() => {
    ElMessage.error('Music cannot be played. Please check the URL.')
  })
}

const handleEditorImageUpload = async (
  files: File[],
  callback: (urls: string[]) => void
) => {
  try {
    const urls: string[] = []

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        ElMessage.error('Only image files are allowed')
        continue
      }

      if (file.size / 1024 / 1024 > 5) {
        ElMessage.error('Image size must be less than 5MB')
        continue
      }

      const result = await uploadImage(file)
      urls.push(result.url)
    }

    callback(urls)

    if (urls.length > 0) {
      ElMessage.success('Image uploaded. Remember to save the chapter.')
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('Image upload failed')
  }
}

const handleDeleteChapter = async () => {
  if (!currentChapter.value) {
    ElMessage.warning('Please select a chapter first')
    return
  }

  if (isNewChapter.value) {
    currentChapter.value = null
    markdownContent.value = ''
    musicUrl.value = ''
    isNewChapter.value = false
    ElMessage.success('Unsaved chapter removed')
    return
  }

  try {
    await ElMessageBox.confirm(
      `Are you sure you want to delete "${currentChapter.value.title}"? This action cannot be undone.`,
      'Delete Chapter',
      {
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }
    )

    const deletedChapterId = currentChapter.value.id

    await deleteChapter(bookId, deletedChapterId)

    chapters.value = chapters.value.filter(
      (chapter) => chapter.id !== deletedChapterId
    )

    if (chapters.value.length > 0) {
      await selectChapter(chapters.value[0])
    } else {
      currentChapter.value = null
      markdownContent.value = ''
      musicUrl.value = ''
      isNewChapter.value = false
    }

    ElMessage.success('Chapter deleted')
  } catch (error: any) {
    if (error === 'cancel' || error === 'close') {
      return
    }

    console.error(error)
    ElMessage.error(error.message || 'Failed to delete chapter')
  }
}

const openNotifyDialog = (chapter: ChapterResponse) => {
  createdChapterForNotify.value = chapter
  selectedNotifyUserIds.value = []
  notifyDialogVisible.value = true
}

const sendChapterNotification = async () => {
  if (!createdChapterForNotify.value) {
    ElMessage.warning('No chapter selected')
    return
  }

  if (selectedNotifyUserIds.value.length === 0) {
    ElMessage.warning('Please select at least one user')
    return
  }

  const token = localStorage.getItem('token')

  if (!token) {
    ElMessage.error('Please login first')
    router.push('/login')
    return
  }

  notifying.value = true

  try {
    const response = await fetch('http://localhost:8080/api/notifications/chapter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        bookId: Number(bookId),
        chapterId: createdChapterForNotify.value.id,
        userIds: selectedNotifyUserIds.value
      })
    })

    if (!response.ok) {
      const message = await response.text()
      throw new Error(message || 'Failed to send notification')
    }

    ElMessage.success('Notification sent')
    notifyDialogVisible.value = false
    selectedNotifyUserIds.value = []
    createdChapterForNotify.value = null
  } catch (error: any) {
    console.error(error)
    ElMessage.error(error.message || 'Failed to send notification')
  } finally {
    notifying.value = false
  }
}

const skipNotification = () => {
  notifyDialogVisible.value = false
  selectedNotifyUserIds.value = []
  createdChapterForNotify.value = null
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
        chapterOrder: currentChapter.value.chapterOrder,
        musicUrl: musicUrl.value.trim()
      })

      chapters.value.push(created)
      currentChapter.value = created
      markdownContent.value = created.contentMd || markdownContent.value
      musicUrl.value = created.musicUrl || musicUrl.value
      isNewChapter.value = false

      ElMessage.success('New chapter created')
      openNotifyDialog(created)
    } else {
      const updated = await updateChapter(bookId, currentChapter.value.id, {
        title: currentChapter.value.title,
        contentMd: markdownContent.value,
        chapterOrder: currentChapter.value.chapterOrder,
        musicUrl: musicUrl.value.trim()
      })

      currentChapter.value = updated
      markdownContent.value = updated.contentMd || markdownContent.value
      musicUrl.value = updated.musicUrl || musicUrl.value

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

const previewBook = () => {
  ElMessage.success('Previewing book...')
  router.push(`/books/${bookId}/read`)
}

onMounted(() => {
  loadChapters()
  fetchUsers()
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

          <el-button
            class="fantasy-button danger"
            :disabled="!currentChapter"
            @click="handleDeleteChapter"
          >
            Delete Chapter
          </el-button>

          <el-button class="fantasy-button primary" @click="previewBook">
            Preview
          </el-button>
        </div>
      </header>

      <section v-if="currentChapter" class="music-card">
        <div class="music-title">
          <span>🎵 Chapter Music</span>
          <small>Upload an MP3 file from disk, or paste a public music URL.</small>
        </div>

        <div class="music-row">
          <el-input
            v-model="musicUrl"
            placeholder="Upload music or paste URL"
            clearable
          />

          <el-upload
            :show-file-list="false"
            :before-upload="beforeMusicUpload"
            :http-request="handleMusicUpload"
            accept="audio/*"
          >
            <el-button class="fantasy-button secondary">
              Upload
            </el-button>
          </el-upload>

          <el-button class="fantasy-button secondary" @click="testMusic">
            Test
          </el-button>

          <el-button class="fantasy-button danger" @click="clearMusic">
            Clear
          </el-button>
        </div>

        <p v-if="musicUrl" class="music-url-preview">
          {{ musicUrl }}
        </p>
      </section>

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
          @on-upload-img="handleEditorImageUpload"
        />
      </section>
    </main>

    <el-dialog
      v-model="notifyDialogVisible"
      title="Notify Readers"
      width="560px"
      class="fantasy-notify-dialog"
      align-center
    >
      <div class="notify-content">
        <div class="notify-icon">✨</div>

        <p class="notify-text">
          <strong>{{ createdChapterForNotify?.title }}</strong>
          has been created.
        </p>

        <p class="notify-hint">
          Choose the readers you want to notify about this new chapter.
        </p>

        <el-select
          v-model="selectedNotifyUserIds"
          multiple
          filterable
          placeholder="Select readers"
          class="notify-select"
          popper-class="fantasy-reader-dropdown"
        >
          <el-option
            v-for="user in users"
            :key="user.id"
            :label="`${user.username} (${user.email})`"
            :value="user.id"
          />
        </el-select>
      </div>

      <template #footer>
        <div class="notify-footer">
          <el-button class="notify-button ghost" @click="skipNotification">
            Skip
          </el-button>

          <el-button
            class="notify-button gold"
            :loading="notifying"
            @click="sendChapterNotification"
          >
            Send Notification
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.music-url-preview {
  margin: 10px 0 0;
  color: #c9b28c;
  font-size: 12px;
  word-break: break-all;
}

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
  margin-bottom: 18px;
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

.music-card {
  margin-bottom: 18px;
  padding: 18px 22px;
  border-radius: 22px;
  border: 1px solid rgba(214, 168, 79, 0.32);
  background: rgba(42, 28, 22, 0.78);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.24);
}

.music-title {
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.music-title span {
  color: #f3e2b8;
  font-weight: 800;
  font-size: 18px;
}

.music-title small {
  color: #c9b28c;
}

.music-row {
  display: flex;
  gap: 12px;
  align-items: center;
}

:deep(.music-row .el-input__wrapper) {
  background: rgba(15, 10, 7, 0.72);
  border: 1px solid rgba(214, 168, 79, 0.32);
  box-shadow: none;
}

:deep(.music-row .el-input__inner) {
  color: #f8ead0;
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

.danger {
  border: 1px solid rgba(220, 80, 80, 0.7);
  background: rgba(127, 29, 29, 0.35);
  color: #f8ead0;
}

.danger:hover {
  background: rgba(180, 45, 45, 0.5);
  color: #fff3d0;
}

.editor-card {
  overflow: hidden;
  height: calc(100vh - 292px);
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

/* fantasy notification dialog */
:deep(.fantasy-notify-dialog) {
  border-radius: 30px;
  border: 1px solid rgba(214, 168, 79, 0.52);
  background:
    radial-gradient(circle at 50% 0%, rgba(214, 168, 79, 0.22), transparent 32%),
    radial-gradient(circle at 18% 20%, rgba(127, 29, 29, 0.28), transparent 34%),
    linear-gradient(135deg, #2a1c16, #120b08);
  box-shadow:
    0 36px 120px rgba(0, 0, 0, 0.72),
    inset 0 0 44px rgba(214, 168, 79, 0.08);
  overflow: hidden;
}

:deep(.fantasy-notify-dialog .el-dialog__header) {
  padding: 34px 42px 8px;
  margin: 0;
}

:deep(.fantasy-notify-dialog .el-dialog__title) {
  color: #f3e2b8;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 42px;
  line-height: 0.98;
  font-weight: 900;
  text-shadow:
    0 4px 0 #5c3518,
    0 14px 24px rgba(0, 0, 0, 0.42);
}

:deep(.fantasy-notify-dialog .el-dialog__headerbtn) {
  top: 28px;
  right: 30px;
  width: 34px;
  height: 34px;
}

:deep(.fantasy-notify-dialog .el-dialog__close) {
  color: #d6a84f;
  font-size: 22px;
  font-weight: 900;
}

:deep(.fantasy-notify-dialog .el-dialog__close:hover) {
  color: #f8ead0;
}

:deep(.fantasy-notify-dialog .el-dialog__body) {
  padding: 18px 42px 24px;
}

:deep(.fantasy-notify-dialog .el-dialog__footer) {
  padding: 0 42px 38px;
}

.notify-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.notify-icon {
  width: 58px;
  height: 58px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #f3e2b8;
  font-size: 28px;
  background: rgba(214, 168, 79, 0.16);
  border: 1px solid rgba(214, 168, 79, 0.45);
  box-shadow: inset 0 0 20px rgba(214, 168, 79, 0.08);
}

.notify-text {
  margin: 0;
  color: #f3e2b8;
  font-size: 18px;
  line-height: 1.6;
}

.notify-text strong {
  color: #d6a84f;
  font-weight: 900;
}

.notify-hint {
  margin: 0;
  color: #c9b28c;
  font-size: 14px;
  line-height: 1.5;
}

.notify-select {
  width: 100%;
}

:deep(.fantasy-notify-dialog .el-select__wrapper) {
  min-height: 50px;
  border-radius: 16px;
  background: rgba(15, 10, 7, 0.78);
  border: 1px solid rgba(214, 168, 79, 0.38);
  box-shadow: none;
}

:deep(.fantasy-notify-dialog .el-select__wrapper.is-focused) {
  border-color: #d6a84f;
  box-shadow: 0 0 0 1px rgba(214, 168, 79, 0.42);
}

:deep(.fantasy-notify-dialog .el-select__placeholder) {
  color: rgba(248, 234, 208, 0.58);
}

:deep(.fantasy-notify-dialog .el-select__selected-item) {
  color: #f8ead0;
}

:deep(.fantasy-notify-dialog .el-tag) {
  height: 28px;
  border-radius: 999px;
  border: 1px solid rgba(214, 168, 79, 0.5);
  background: rgba(214, 168, 79, 0.18);
  color: #f3e2b8;
  font-weight: 700;
}

:deep(.fantasy-notify-dialog .el-tag__close) {
  color: #d6a84f;
}

:deep(.fantasy-notify-dialog .el-tag__close:hover) {
  background: rgba(214, 168, 79, 0.3);
  color: #fff3d0;
}

.notify-footer {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
}

.notify-button {
  min-width: 150px;
  height: 52px;
  border-radius: 999px;
  font-size: 16px;
  font-weight: 900;
  cursor: pointer;
}

.notify-button.gold {
  border: none;
  background: linear-gradient(135deg, #d6a84f, #8f5f1f);
  color: #1c1410;
}

.notify-button.gold:hover {
  background: linear-gradient(135deg, #efc76d, #a86f24);
  color: #1c1410;
  transform: translateY(-1px);
}

.notify-button.ghost {
  border: 1px solid rgba(214, 168, 79, 0.42);
  background: rgba(15, 10, 7, 0.45);
  color: #f3e2b8;
}

.notify-button.ghost:hover {
  background: rgba(214, 168, 79, 0.14);
  color: #f8ead0;
  transform: translateY(-1px);
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

  .music-row {
    flex-direction: column;
    align-items: stretch;
  }

  .header-actions {
    width: 100%;
  }

  .editor-card {
    height: 70vh;
  }

  .notify-footer {
    flex-direction: column;
  }

  .notify-button {
    width: 100%;
  }
}
</style>

<style>
.fantasy-reader-dropdown {
  border: 1px solid rgba(214, 168, 79, 0.55) !important;
  border-radius: 18px !important;
  background:
    radial-gradient(circle at top, rgba(214, 168, 79, 0.18), transparent 36%),
    linear-gradient(135deg, #2a1c16, #120b08) !important;
  box-shadow:
    0 22px 60px rgba(0, 0, 0, 0.55),
    inset 0 0 24px rgba(214, 168, 79, 0.06) !important;
  overflow: hidden;
}

.fantasy-reader-dropdown .el-select-dropdown__list {
  padding: 10px !important;
}

.fantasy-reader-dropdown .el-select-dropdown__item {
  height: 46px;
  margin-bottom: 6px;
  padding: 0 16px;
  border-radius: 14px;
  color: #f3e2b8;
  font-weight: 700;
  font-family: Georgia, "Times New Roman", serif;
}

.fantasy-reader-dropdown .el-select-dropdown__item:hover {
  background: rgba(214, 168, 79, 0.16);
  color: #fff3d0;
}

.fantasy-reader-dropdown .el-select-dropdown__item.is-selected {
  background: linear-gradient(135deg, #d6a84f, #8f5f1f);
  color: #1c1410;
}

.fantasy-reader-dropdown .el-popper__arrow::before {
  background: #2a1c16 !important;
  border-color: rgba(214, 168, 79, 0.55) !important;
}
</style>