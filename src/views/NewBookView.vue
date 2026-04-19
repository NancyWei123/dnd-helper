<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const router = useRouter()
const formRef = ref(null)
const loading = ref(false)

const form = reactive({
  title: '',
  description: '',
  coverUrl: '',
  status: 'DRAFT'
})

const rules = {
  title: [
    { required: true, message: 'Please enter book title', trigger: 'blur' }
  ]
}

const beforeCoverUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isImage) {
    ElMessage.error('Cover must be an image file')
    return false
  }

  if (!isLt5M) {
    ElMessage.error('Cover image size must be less than 5MB')
    return false
  }

  return true
}

const handleCoverUpload = async (options) => {
  const file = options.file

  // Local preview only.
  // This URL is temporary and will disappear after page refresh.
  form.coverUrl = URL.createObjectURL(file)

  ElMessage.success('Cover selected')
}

const removeCover = () => {
  form.coverUrl = ''
}

const createBook = async () => {
  await formRef.value.validate()

  const token = localStorage.getItem('token')

  if (!token) {
    ElMessage.error('Please login first')
    router.push('/login')
    return
  }

  try {
    loading.value = true

    const response = await fetch('http://localhost:8080/api/books', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(form)
    })

    if (!response.ok) {
      const message = await response.text()
      throw new Error(message || 'Failed to create book')
    }

    ElMessage.success('Book created successfully')
    router.push('/dashboard')
  } catch (error) {
    ElMessage.error(error.message)
  } finally {
    loading.value = false
  }
}

const cancel = () => {
  router.push('/dashboard')
}
</script>

<template>
  <div class="create-book-page">
    <div class="hero-card">
      <div>
        <p class="eyebrow">Guild Library</p>
        <h1>Create New Spellbook</h1>
        <p class="subtitle">
          Write your fantasy book, save drafts, and publish your adventures.
        </p>
      </div>

      <el-button class="gold-button" @click="cancel">
        Back to Library
      </el-button>
    </div>

    <el-card class="form-card">
      <template #header>
        <div class="card-header">
          <span>Book Details</span>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
      >
        <div class="form-grid">
          <div class="left-column">
            <el-form-item label="Title" prop="title">
              <el-input
                v-model="form.title"
                placeholder="The Dragon of Moonfall Keep"
              />
            </el-form-item>

            <el-form-item label="Description">
              <el-input
                v-model="form.description"
                type="textarea"
                :rows="6"
                placeholder="Describe your adventure..."
              />
            </el-form-item>

            <el-form-item label="Status">
              <el-select v-model="form.status" class="full-width">
                <el-option label="Draft" value="DRAFT" />
                <el-option label="Published" value="PUBLISHED" />
              </el-select>
            </el-form-item>
          </div>

          <div class="right-column">
            <el-form-item label="Cover Image">
              <el-upload
                class="cover-uploader"
                :show-file-list="false"
                :before-upload="beforeCoverUpload"
                :http-request="handleCoverUpload"
                accept="image/*"
              >
                <div v-if="form.coverUrl" class="cover-wrapper">
                  <img
                    :src="form.coverUrl"
                    class="cover-preview"
                    alt="Book cover"
                  />

                  <div class="cover-overlay">
                    <span>Click to change</span>
                  </div>
                </div>

                <div v-else class="upload-placeholder">
                  <el-icon class="upload-icon">
                    <Plus />
                  </el-icon>
                  <p>Upload Cover</p>
                  <span>PNG, JPG, WEBP</span>
                </div>
              </el-upload>

              <el-button
                v-if="form.coverUrl"
                class="remove-button"
                type="danger"
                plain
                @click.stop="removeCover"
              >
                Remove Cover
              </el-button>
            </el-form-item>
          </div>
        </div>

        <div class="actions">
          <el-button
            class="gold-button"
            :loading="loading"
            @click="createBook"
          >
            Create Book
          </el-button>

          <el-button class="dark-button" @click="cancel">
            Cancel
          </el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.create-book-page {
  min-height: 100vh;
  padding: 72px 10%;
  background:
    radial-gradient(circle at top left, rgba(97, 29, 26, 0.45), transparent 36%),
    radial-gradient(circle at bottom right, rgba(129, 88, 30, 0.28), transparent 34%),
    linear-gradient(135deg, #1a0708 0%, #14100c 45%, #050505 100%);
  color: #f8e8bd;
}

.hero-card {
  max-width: 1180px;
  margin: 0 auto 36px;
  padding: 42px 48px;
  border: 1px solid rgba(184, 132, 43, 0.55);
  border-radius: 24px;
  background: rgba(32, 24, 17, 0.72);
  box-shadow: 0 28px 80px rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 28px;
}

.eyebrow {
  margin: 0 0 14px;
  color: #c59234;
  text-transform: uppercase;
  letter-spacing: 8px;
  font-size: 14px;
  font-weight: 700;
}

.hero-card h1 {
  margin: 0;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(48px, 7vw, 82px);
  line-height: 1;
  color: #f6e6b8;
  text-shadow:
    0 4px 0 #4a2a12,
    0 16px 28px rgba(0, 0, 0, 0.55);
}

.subtitle {
  margin-top: 22px;
  font-size: 18px;
  line-height: 1.7;
  color: #e5c88e;
}

.form-card {
  max-width: 980px;
  margin: 0 auto;
  border-radius: 22px;
  border: 1px solid rgba(184, 132, 43, 0.5);
  background: rgba(31, 23, 17, 0.88);
  box-shadow: 0 28px 90px rgba(0, 0, 0, 0.45);
  overflow: hidden;
}

:deep(.el-card__header) {
  border-bottom: 1px solid rgba(184, 132, 43, 0.35);
  background: rgba(84, 52, 22, 0.42);
}

:deep(.el-card__body) {
  padding: 34px;
}

.card-header {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 30px;
  font-weight: 700;
  color: #f6e6b8;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 260px;
  gap: 34px;
  align-items: start;
}

.left-column,
.right-column {
  min-width: 0;
}

.right-column {
  display: flex;
  justify-content: center;
}

:deep(.el-form-item__label) {
  color: #e7c987;
  font-weight: 700;
  letter-spacing: 0.5px;
}

:deep(.el-input__wrapper),
:deep(.el-textarea__inner),
:deep(.el-select__wrapper) {
  background: rgba(18, 12, 9, 0.8);
  border: 1px solid rgba(184, 132, 43, 0.35);
  box-shadow: none;
  border-radius: 12px;
}

:deep(.el-input__inner),
:deep(.el-textarea__inner) {
  color: #f8e8bd;
}

:deep(.el-textarea__inner) {
  min-height: 150px;
}

:deep(.el-input__inner::placeholder),
:deep(.el-textarea__inner::placeholder) {
  color: rgba(231, 201, 135, 0.45);
}

:deep(.el-input__wrapper.is-focus),
:deep(.el-textarea__inner:focus),
:deep(.el-select__wrapper.is-focused) {
  border-color: #c59234;
  box-shadow: 0 0 0 1px rgba(197, 146, 52, 0.45);
}

.full-width {
  width: 100%;
}

.cover-uploader {
  width: 220px;
}

.cover-wrapper {
  position: relative;
  width: 220px;
  height: 300px;
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid rgba(246, 230, 184, 0.28);
  box-shadow: 0 22px 46px rgba(0, 0, 0, 0.48);
  cursor: pointer;
}

.cover-preview {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.cover-overlay {
  position: absolute;
  inset: 0;
  background: rgba(10, 6, 4, 0.55);
  color: #f8e8bd;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.cover-wrapper:hover .cover-overlay {
  opacity: 1;
}

.upload-placeholder {
  width: 220px;
  height: 300px;
  border-radius: 18px;
  border: 1px dashed rgba(217, 164, 65, 0.75);
  background:
    linear-gradient(145deg, rgba(68, 42, 20, 0.7), rgba(18, 12, 9, 0.85));
  color: #e7c987;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  box-shadow: inset 0 0 36px rgba(0, 0, 0, 0.35);
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.upload-placeholder:hover {
  transform: translateY(-2px);
  border-color: #efbd55;
  box-shadow:
    inset 0 0 36px rgba(0, 0, 0, 0.35),
    0 18px 40px rgba(0, 0, 0, 0.36);
}

.upload-placeholder p {
  margin: 0;
  font-weight: 800;
  font-size: 16px;
}

.upload-placeholder span {
  font-size: 12px;
  color: rgba(231, 201, 135, 0.65);
}

.upload-icon {
  font-size: 38px;
  margin-bottom: 8px;
}

.remove-button {
  margin-top: 14px;
  border-radius: 999px;
}

.actions {
  display: flex;
  gap: 14px;
  margin-top: 20px;
}

.gold-button {
  border: none;
  border-radius: 999px;
  background: linear-gradient(135deg, #d9a441, #a86f1c);
  color: #1d1209;
  font-weight: 800;
  padding: 12px 28px;
  box-shadow: 0 12px 26px rgba(0, 0, 0, 0.28);
}

.gold-button:hover,
.gold-button:focus {
  background: linear-gradient(135deg, #efbd55, #bd8427);
  color: #1d1209;
  transform: translateY(-1px);
}

.dark-button {
  border-radius: 999px;
  border: 1px solid rgba(184, 132, 43, 0.5);
  background: rgba(20, 13, 9, 0.8);
  color: #e7c987;
  font-weight: 700;
  padding: 12px 28px;
}

.dark-button:hover,
.dark-button:focus {
  border-color: #d9a441;
  background: rgba(84, 52, 22, 0.65);
  color: #f8e8bd;
}

@media (max-width: 900px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .right-column {
    justify-content: flex-start;
  }
}

@media (max-width: 768px) {
  .create-book-page {
    padding: 32px 20px;
  }

  .hero-card {
    padding: 32px 26px;
    flex-direction: column;
    align-items: flex-start;
  }

  .hero-card h1 {
    font-size: 48px;
  }

  :deep(.el-card__body) {
    padding: 24px;
  }

  .cover-uploader,
  .cover-wrapper,
  .upload-placeholder {
    width: 190px;
  }

  .cover-wrapper,
  .upload-placeholder {
    height: 260px;
  }
}
</style>