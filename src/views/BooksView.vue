<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { MdPreview } from 'md-editor-v3'
import 'md-editor-v3/lib/preview.css'
import { ElMessage } from 'element-plus'
import {
  getChaptersByBook,
  getChapterById,
  type ChapterResponse
} from '@/Api/chapter'

const route = useRoute()

const bookId = route.params.bookId as string

const loading = ref(false)
const chapters = ref<ChapterResponse[]>([])
const currentChapter = ref<ChapterResponse | null>(null)

const markdownContent = ref('')
const musicUrl = ref('')
const audioRef = ref<HTMLAudioElement | null>(null)
const isPlaying = ref(false)

const getPlayableMusicUrl = (url: string) => {
  if (!url) return ''

  const trimmedUrl = url.trim()

  if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
    return trimmedUrl
  }

  if (trimmedUrl.startsWith('/uploads')) {
    return `http://localhost:8080${trimmedUrl}`
  }

  if (trimmedUrl.startsWith('/music')) {
    return `${window.location.origin}${trimmedUrl}`
  }

  return trimmedUrl
}

const loadChapters = async () => {
  loading.value = true

  try {
    chapters.value = await getChaptersByBook(bookId)

    if (chapters.value.length > 0) {
      await selectChapter(chapters.value[0])
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('Failed to load chapters')
  } finally {
    loading.value = false
  }
}

const selectChapter = async (chapter: ChapterResponse) => {
  try {
    const chapterDetail = await getChapterById(bookId, chapter.id)

    currentChapter.value = chapterDetail
    markdownContent.value = chapterDetail.contentMd || 'No content yet.'
    musicUrl.value = chapterDetail.musicUrl || ''
    isPlaying.value = false

    await nextTick()

    if (audioRef.value) {
      audioRef.value.pause()
      audioRef.value.removeAttribute('src')
      audioRef.value.currentTime = 0
      audioRef.value.load()
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('Failed to load chapter')
  }
}

const toggleMusic = async () => {
  if (!musicUrl.value) {
    ElMessage.warning('No music found for this chapter')
    return
  }

  const playableUrl = getPlayableMusicUrl(musicUrl.value)

  if (!playableUrl) {
    ElMessage.warning('No music found for this chapter')
    return
  }

  if (!audioRef.value) {
    ElMessage.warning('Audio player is not ready')
    return
  }

  try {
    if (audioRef.value.src !== playableUrl) {
      audioRef.value.src = playableUrl
      audioRef.value.load()
    }

    if (audioRef.value.paused) {
      await audioRef.value.play()
      isPlaying.value = true
    } else {
      audioRef.value.pause()
      isPlaying.value = false
    }
  } catch (error) {
    console.error('Music play failed:', error)
    ElMessage.warning('Music cannot be played. Please check the music URL.')
  }
}

const stopMusic = () => {
  if (!audioRef.value) return

  audioRef.value.pause()
  audioRef.value.currentTime = 0
  isPlaying.value = false
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

      <div v-if="loading" class="sidebar-loading">
        Loading chapters...
      </div>

      <div v-else-if="chapters.length === 0" class="sidebar-empty">
        No chapters yet.
      </div>

      <div v-else class="chapter-list">
        <button
          v-for="chapter in chapters"
          :key="chapter.id"
          class="chapter-item"
          :class="{ active: currentChapter?.id === chapter.id }"
          @click="selectChapter(chapter)"
        >
          <span class="chapter-icon">📜</span>
          <span>{{ chapter.title }}</span>
        </button>
      </div>
    </aside>

    <main class="editor-main">
      <header class="editor-header">
        <div>
          <p class="eyebrow">Scriptorium</p>
          <h1>{{ currentChapter?.title || 'Select a Chapter' }}</h1>
        </div>

        <div v-if="musicUrl" class="music-player">
          <audio
            ref="audioRef"
            loop
            preload="auto"
            @ended="isPlaying = false"
            @pause="isPlaying = false"
            @play="isPlaying = true"
          />

          <button class="music-button" @click="toggleMusic">
            {{ isPlaying ? 'Pause Music' : 'Play Music' }}
          </button>

          <button class="music-button secondary" @click="stopMusic">
            Stop
          </button>
        </div>
      </header>

      <section class="editor-card">
        <div v-if="!currentChapter" class="empty-content">
          Select a chapter to read.
        </div>

        <MdPreview
          v-else
          editor-id="chapter-preview"
          :model-value="markdownContent"
          preview-theme="github"
          code-theme="github"
        />
      </section>
    </main>
  </div>
</template>

<style scoped>
.music-player {
  display: flex;
  gap: 10px;
  align-items: center;
}

.music-button {
  height: 40px;
  padding: 0 18px;
  border-radius: 999px;
  border: none;
  background: linear-gradient(135deg, #d6a84f, #8f5f1f);
  color: #1c1410;
  font-weight: 700;
  cursor: pointer;
}

.music-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(214, 168, 79, 0.22);
}

.music-button.secondary {
  background: rgba(214, 168, 79, 0.12);
  color: #d6a84f;
  border: 1px solid rgba(214, 168, 79, 0.36);
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

.sidebar-loading,
.sidebar-empty {
  padding: 18px;
  border-radius: 16px;
  border: 1px solid rgba(214, 168, 79, 0.25);
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

.editor-card {
  height: calc(100vh - 190px);
  overflow-y: auto;
  padding: 36px 48px;
  border-radius: 26px;
  border: 1px solid rgba(214, 168, 79, 0.36);
  background: #fffaf0;
  box-shadow: 0 30px 90px rgba(0, 0, 0, 0.5);
}

.empty-content {
  color: #2a1c16;
  font-size: 22px;
  font-weight: 700;
}

:deep(.md-editor-preview-wrapper) {
  padding: 0;
}

:deep(.md-editor-preview) {
  color: #2a1c16;
  font-size: 18px;
  line-height: 1.8;
}

:deep(.md-editor-preview h1),
:deep(.md-editor-preview h2),
:deep(.md-editor-preview h3) {
  font-family: Georgia, "Times New Roman", serif;
  color: #2a1c16;
}

:deep(.md-editor-preview h1) {
  font-size: 46px;
  border-bottom: 1px solid #e5d8bc;
  padding-bottom: 14px;
}

:deep(.md-editor-preview blockquote) {
  border-left: 4px solid #d6a84f;
  background: #f7edd7;
  color: #5c3518;
}

:deep(.md-editor-preview img) {
  max-width: 100%;
  border-radius: 16px;
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
    padding: 24px;
  }
}
</style>