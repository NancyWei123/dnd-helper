<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

type BookStatus = 'DRAFT' | 'PUBLISHED'

interface Book {
  id: number
  title: string
  description: string
  coverUrl: string
  status: BookStatus
  updatedAt: string
}

const router = useRouter()

const books = ref<Book[]>([
  {
    id: 1,
    title: 'The Dragon of Moonfall Keep',
    description: 'A dark fantasy campaign about lost kingdoms, ancient magic, and a forgotten dragon oath.',
    coverUrl: '/book-cover.png',
    status: 'PUBLISHED',
    updatedAt: '2026-04-19'
  },
  {
    id: 2,
    title: 'Chronicles of the Silver Guild',
    description: 'A collection of adventurer notes, tavern stories, and unfinished campaign chapters.',
    coverUrl: '',
    status: 'DRAFT',
    updatedAt: '2026-04-18'
  },
  {
    id: 3,
    title: 'The Wizard’s Broken Map',
    description: 'A mystery adventure written in Markdown with maps, images, and chapter notes.',
    coverUrl: '',
    status: 'PUBLISHED',
    updatedAt: '2026-04-15'
  }
])

const openBook = (book: Book) => {
  if (book.status === 'PUBLISHED') {
    router.push(`/books`)
  } else {
    router.push(`/books/${book.id}/edit`)
  }
}

const editBook = (book: Book) => {
  router.push(`/books/${book.id}/edit`)
}

const createBook = () => {
  router.push('/books/new')
}
</script>

<template>
  <div class="books-page">
    <div class="page-header">
      <div>
        <p class="eyebrow">Guild Library</p>
        <h1>My Spellbooks</h1>
        <p class="subtitle">
          Manage your fantasy books, drafts, chapters, and published adventures.
        </p>
      </div>

      <el-button class="fantasy-button primary" @click="createBook">
        Create New Book
      </el-button>
    </div>

    <div class="books-grid">
      <div
        v-for="book in books"
        :key="book.id"
        class="book-card"
      >
        <div class="book-cover">
          <img
            v-if="book.coverUrl"
            :src="book.coverUrl"
            :alt="book.title"
          />
          <span v-else>📖</span>
        </div>

        <div class="book-content">
          <div class="book-top">
            <el-tag
              :type="book.status === 'PUBLISHED' ? 'success' : 'warning'"
              effect="dark"
            >
              {{ book.status }}
            </el-tag>

            <span class="date">Updated {{ book.updatedAt }}</span>
          </div>

          <h2>{{ book.title }}</h2>

          <p class="description">
            {{ book.description }}
          </p>

          <div class="book-actions">
            <el-button class="fantasy-button small" @click="openBook(book)">
              {{ book.status === 'PUBLISHED' ? 'Read Tome' : 'Continue Writing' }}
            </el-button>

            <el-button class="fantasy-button small secondary" @click="editBook(book)">
              Edit
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.books-page {
  min-height: 100vh;
  padding: 56px;
  color: #f8ead0;
  background:
    radial-gradient(circle at 50% 20%, rgba(214, 168, 79, 0.16), transparent 30%),
    radial-gradient(circle at 12% 18%, rgba(127, 29, 29, 0.28), transparent 34%),
    linear-gradient(135deg, #0f0a07, #1c1410 50%, #090605);
}

.page-header {
  width: min(1180px, 100%);
  margin: 0 auto 34px;
  padding: 34px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  border-radius: 28px;
  border: 1px solid rgba(214, 168, 79, 0.38);
  background: rgba(42, 28, 22, 0.88);
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.4);
}

.eyebrow {
  margin: 0 0 10px;
  color: #d6a84f;
  font-size: 12px;
  letter-spacing: 4px;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  color: #f3e2b8;
  font-size: clamp(42px, 5vw, 68px);
  line-height: 1;
  text-shadow: 0 4px 0 #5c3518;
}

.subtitle {
  max-width: 620px;
  margin: 18px 0 0;
  color: #c9b28c;
  font-size: 17px;
  line-height: 1.7;
}

.books-grid {
  width: min(1180px, 100%);
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 22px;
}

.book-card {
  overflow: hidden;
  border-radius: 26px;
  border: 1px solid rgba(214, 168, 79, 0.35);
  background: rgba(42, 28, 22, 0.9);
  box-shadow:
    0 24px 70px rgba(0, 0, 0, 0.38),
    inset 0 0 32px rgba(214, 168, 79, 0.04);
  transition: all 0.2s ease;
}

.book-card:hover {
  transform: translateY(-6px);
  box-shadow:
    0 30px 90px rgba(0, 0, 0, 0.5),
    0 0 30px rgba(214, 168, 79, 0.13);
}

.book-cover {
  height: 210px;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(circle at center, rgba(214, 168, 79, 0.2), transparent 34%),
    linear-gradient(135deg, #5c3518, #1c1410);
  color: #d6a84f;
  font-size: 64px;
}

.book-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.book-content {
  padding: 24px;
}

.book-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.date {
  color: #9f8a67;
  font-size: 13px;
}

h2 {
  min-height: 64px;
  margin: 18px 0 12px;
  color: #f3e2b8;
  font-size: 26px;
  line-height: 1.2;
  font-family: Georgia, "Times New Roman", serif;
}

.description {
  min-height: 84px;
  margin: 0;
  color: #c9b28c;
  line-height: 1.6;
}

.book-actions {
  margin-top: 24px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.fantasy-button {
  border-radius: 999px;
  font-weight: 700;
  cursor: pointer;
}

.primary,
.small {
  border: none;
  background: linear-gradient(135deg, #d6a84f, #8f5f1f);
  color: #1c1410;
}

.secondary {
  border: 1px solid rgba(214, 168, 79, 0.65);
  background: rgba(15, 10, 7, 0.45);
  color: #f3e2b8;
}

@media (max-width: 1000px) {
  .books-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 640px) {
  .books-page {
    padding: 28px 16px;
  }

  .books-grid {
    grid-template-columns: 1fr;
  }

  .page-header {
    padding: 26px;
  }
}
</style>