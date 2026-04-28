<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { getAllBooks, type BookResponse } from "@/Api/book";

type BookStatus = "DRAFT" | "PUBLISHED";

interface Book extends BookResponse {
  status: BookStatus;
  coverUrl?: string;
}

const router = useRouter();

const books = ref<Book[]>([]);
const loading = ref(false);

const goUserCenter = () => {
  router.push("/user");
};

const getCoverUrl = (coverUrl?: string) => {
  if (!coverUrl) return "";

  // blob URL is only a temporary browser preview, cannot be used after refresh
  if (coverUrl.startsWith("blob:")) return "";

  // full backend or external URL
  if (coverUrl.startsWith("http://") || coverUrl.startsWith("https://")) {
    return coverUrl;
  }

  // backend relative upload URL, for example: /uploads/covers/xxx.png
  if (coverUrl.startsWith("/uploads")) {
    return `http://localhost:8080${coverUrl}`;
  }

  return coverUrl;
};

const loadBooks = async () => {
  loading.value = true;

  try {
    books.value = (await getAllBooks()) as Book[];
  } catch (error) {
    console.error(error);
    ElMessage.error("Failed to load books");
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadBooks();
});

const openBook = (book: Book) => {
  if (book.status === "PUBLISHED") {
    router.push(`/books/${book.id}/read`);
  } else {
    router.push(`/books/${book.id}/edit`);
  }
};

const editBook = (book: Book) => {
  router.push(`/books/${book.id}/edit`);
};

const createBook = () => {
  router.push("/books/new");
};
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

      <div class="button-group">
        <el-button class="fantasy-button primary" @click="createBook">
          Create New Book
        </el-button>

        <el-button class="fantasy-button primary" @click="goUserCenter">
          User Center
        </el-button>
      </div>
    </div>

    <div v-if="loading" class="state-card">
      Loading books...
    </div>

    <div v-else-if="books.length === 0" class="state-card">
      No books yet. Create your first spellbook.
    </div>

    <div v-else class="books-grid">
      <div
        v-for="book in books"
        :key="book.id"
        class="book-card"
      >
        <div class="book-cover" @click="openBook(book)">
          <img
            v-if="getCoverUrl(book.coverUrl)"
            :src="getCoverUrl(book.coverUrl)"
            :alt="book.title"
            @error="book.coverUrl = ''"
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

            <span class="date">
              Updated {{ book.updatedAt?.slice(0, 10) }}
            </span>
          </div>

          <h2>{{ book.title }}</h2>

          <p class="description">
            {{ book.description || "No description yet." }}
          </p>

          <div class="book-actions">
            <el-button v-if="book.status === 'PUBLISHED'" class="fantasy-button small" @click="openBook(book)"
          >
            Read
          </el-button>
            <el-button class="fantasy-button small secondary" @click="editBook(book)">
              Edit
            </el-button>
            <el-button class="fantasy-button small setting" @click="editBook(book)">
              Setting
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

.button-group {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 190px;
}

.button-group .el-button {
  margin-left: 0;
}

.state-card {
  width: min(1180px, 100%);
  margin: 0 auto;
  padding: 40px;
  text-align: center;
  border-radius: 24px;
  border: 1px solid rgba(214, 168, 79, 0.35);
  background: rgba(42, 28, 22, 0.88);
  color: #d8bd84;
  font-size: 18px;
  font-weight: 700;
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
  cursor: pointer;
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
.setting {
  border: 1px solid rgba(108, 79, 214, 0.65);
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

  .button-group {
    width: 100%;
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