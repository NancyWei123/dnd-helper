<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { uploadCover } from '@/Api/upload'

const route = useRoute()
const router = useRouter()

const bookId = String(route.params.bookId || '')

const loading = ref(false)
const saving = ref(false)
const uploadingCover = ref(false)

const users = ref<any[]>([])
const selectedReaderIds = ref<number[]>([])
const coverPreviewUrl = ref('')

const form = reactive({
  title: '',
  description: '',
  coverUrl: '',
  permission: 'private',
  status: 'DRAFT'
})

const permissionOptions = [
  {
    value: 'private',
    title: 'Private',
    desc: 'Only you can read and edit this book.',
    icon: '🔒'
  },
  {
    value: 'protected',
    title: 'Protected',
    desc: 'Only selected users can read this book.',
    icon: '🛡️'
  },
  {
    value: 'public',
    title: 'Public',
    desc: 'Everyone can read this book.',
    icon: '🌍'
  }
]

const deleteBook = async () => {
  const token = localStorage.getItem('token')

  if (!token) {
    ElMessage.error('Please login first')
    router.push('/login')
    return
  }

  try {
    await ElMessageBox.confirm(
      `Are you sure you want to delete "${form.title}"? This action cannot be undone.`,
      'Delete Book',
      {
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }
    )

    const response = await fetch(`http://localhost:8080/api/books/${bookId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    if (!response.ok) {
      const message = await response.text()
      throw new Error(message || 'Failed to delete book')
    }

    ElMessage.success('Book deleted')
    router.push('/dashboard')
  } catch (error: any) {
    if (error === 'cancel' || error === 'close') {
      return
    }

    console.error(error)
    ElMessage.error(error.message || 'Failed to delete book')
  }
}

const getCoverUrl = (url: string) => {
  if (!url) return ''

  if (url.startsWith('blob:')) return ''

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }

  if (url.startsWith('/uploads')) {
    return `http://localhost:8080${url}`
  }

  return url
}

const fetchBook = async () => {
  const token = localStorage.getItem('token')

  if (!token) {
    ElMessage.error('Please login first')
    router.push('/login')
    return
  }

  const response = await fetch(`http://localhost:8080/api/books/${bookId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || 'Failed to load book')
  }

  const book = await response.json()
  form.title = book.title || ''
  form.description = book.description || ''
  form.coverUrl = book.coverUrl || ''
  form.permission = book.permission || 'private'
  form.status = book.status || 'DRAFT'
}

const fetchUsers = async () => {
  const token = localStorage.getItem('token')
  if (!token) return

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
}

const fetchBookReaders = async () => {
  const token = localStorage.getItem('token')
  if (!token) return

  const response = await fetch(`http://localhost:8080/api/books/${bookId}/readers`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  if (!response.ok) {
    // If your backend does not have GET readers yet, this will not break page loading.
    selectedReaderIds.value = []
    return
  }

  const readers = await response.json()

  selectedReaderIds.value = readers.map((reader: any) => reader.id)
}

const loadPage = async () => {
  loading.value = true

  try {
    await Promise.all([
      fetchBook(),
      fetchUsers(),
      fetchBookReaders()
    ])
  } catch (error: any) {
    console.error(error)
    ElMessage.error(error.message || 'Failed to load settings')
  } finally {
    loading.value = false
  }
}

const beforeCoverUpload = (file: File) => {
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

const handleCoverUpload = async (options: any) => {
  const file = options.file

  try {
    uploadingCover.value = true

    // Preview only. Do not save blob URL to database.
    coverPreviewUrl.value = URL.createObjectURL(file)

    const result = await uploadCover(file)

    // Real backend URL. This is saved to database.
    form.coverUrl = result.url

    ElMessage.success('Cover uploaded. Remember to save settings.')
  } catch (error) {
    console.error(error)
    ElMessage.error('Cover upload failed')
  } finally {
    uploadingCover.value = false
  }
}

const removeCover = () => {
  coverPreviewUrl.value = ''
  form.coverUrl = ''
}

const saveReaders = async (token: string) => {
  const response = await fetch(`http://localhost:8080/api/books/${bookId}/readers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      userIds: form.permission === 'protected' ? selectedReaderIds.value : []
    })
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || 'Failed to save readers')
  }
}

const saveSettings = async () => {
  if (!form.title.trim()) {
    ElMessage.warning('Please enter a book title')
    return
  }

  if (form.permission === 'protected' && selectedReaderIds.value.length === 0) {
    ElMessage.warning('Please select at least one reader')
    return
  }

  const token = localStorage.getItem('token')

  if (!token) {
    ElMessage.error('Please login first')
    router.push('/login')
    return
  }

  saving.value = true
  console.log('Saving settings with data:', {
    title: form.title,
    description: form.description,
    coverUrl: form.coverUrl,
    permission: form.permission,
    status: form.status,
    selectedReaderIds: selectedReaderIds.value
  })
  try {
    const response = await fetch(`http://localhost:8080/api/books/${bookId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        title: form.title,
        description: form.description,
        coverUrl: form.coverUrl,
        permission: form.permission,
        status: form.status
      })
    })

    if (!response.ok) {
      const message = await response.text()
      throw new Error(message || 'Failed to save book settings')
    }

    await saveReaders(token)

    ElMessage.success('Book settings saved')
    router.push('/dashboard')
  } catch (error: any) {
    console.error(error)
    ElMessage.error(error.message || 'Failed to save settings')
  } finally {
    saving.value = false
  }
}

const cancel = () => {
  router.push('/dashboard')
}

onMounted(() => {
  loadPage()
})
</script>

<template>
  <div class="settings-page">
    <div class="hero-card">
      <div>
        <p class="eyebrow">Book Settings</p>
        <h1>Manage Spellbook</h1>
        <p class="subtitle">
          Update your book cover, title, description, and reader permissions.
        </p>
      </div>

      <el-button class="dark-button" @click="cancel">
        Back
      </el-button>
    </div>

    <div v-if="loading" class="state-card">
      Loading book settings...
    </div>

    <div v-else class="settings-card">
      <section class="cover-section">
        <div class="cover-panel">
          <el-upload
            class="cover-uploader"
            :show-file-list="false"
            :before-upload="beforeCoverUpload"
            :http-request="handleCoverUpload"
            accept="image/*"
          >
            <div
              v-if="coverPreviewUrl || form.coverUrl"
              class="cover-wrapper"
            >
              <img
                :src="coverPreviewUrl || getCoverUrl(form.coverUrl)"
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
            v-if="coverPreviewUrl || form.coverUrl"
            class="remove-button"
            type="danger"
            plain
            @click.stop="removeCover"
          >
            Remove Cover
          </el-button>
        </div>

        <div class="basic-form">
          <el-form label-position="top">
            <el-form-item label="Book Title">
              <el-input
                v-model="form.title"
                placeholder="Enter book title"
                size="large"
              />
            </el-form-item>

            <el-form-item label="Description">
              <el-input
                v-model="form.description"
                type="textarea"
                :rows="7"
                placeholder="Describe your adventure..."
              />
            </el-form-item>

            <el-form-item label="Status">
              <el-select v-model="form.status" size="large" class="status-select">
                <el-option label="Draft" value="DRAFT" />
                <el-option label="Published" value="PUBLISHED" />
              </el-select>
            </el-form-item>
          </el-form>
        </div>
      </section>

      <section class="permission-section">
        <div class="section-title">
          <p class="eyebrow">Access Control</p>
          <h2>Book Permission</h2>
          <p>
            Choose who can read this book. You can update selected readers anytime.
          </p>
        </div>

        <div class="permission-grid">
          <button
            v-for="option in permissionOptions"
            :key="option.value"
            class="permission-card"
            :class="{ active: form.permission === option.value }"
            @click="form.permission = option.value"
          >
            <span class="permission-icon">{{ option.icon }}</span>
            <strong>{{ option.title }}</strong>
            <small>{{ option.desc }}</small>
          </button>
        </div>

        <div v-if="form.permission === 'protected'" class="reader-box">
          <div>
            <h3>Selected Readers</h3>
            <p>Only these users can read this book.</p>
          </div>

          <el-select
            v-model="selectedReaderIds"
            multiple
            filterable
            placeholder="Select readers"
            class="reader-select"
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
      </section>

      <div class="actions">
        <el-button class="dark-button danger-button" @click="deleteBook">
          Delete Book
        </el-button>
        <el-button
          class="gold-button"
          :loading="saving || uploadingCover"
          @click="saveSettings"
        >
          Save Settings
        </el-button>

        <el-button class="dark-button" @click="cancel">
          Cancel
        </el-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-page {
  min-height: 100vh;
  padding: 56px 8%;
  color: #f8ead0;
  background:
    radial-gradient(circle at 50% 20%, rgba(214, 168, 79, 0.16), transparent 30%),
    radial-gradient(circle at 12% 18%, rgba(127, 29, 29, 0.28), transparent 34%),
    linear-gradient(135deg, #0f0a07, #1c1410 50%, #090605);
}

.hero-card {
  max-width: 1180px;
  margin: 0 auto 28px;
  padding: 36px 42px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 28px;
  border-radius: 28px;
  border: 1px solid rgba(214, 168, 79, 0.38);
  background: rgba(42, 28, 22, 0.88);
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.4);
}

.eyebrow {
  margin: 0 0 10px;
  color: #d6a84f;
  font-size: 12px;
  letter-spacing: 5px;
  text-transform: uppercase;
}

h1,
h2,
h3 {
  margin: 0;
  color: #f3e2b8;
  font-family: Georgia, "Times New Roman", serif;
}

h1 {
  font-size: clamp(44px, 6vw, 72px);
  line-height: 1;
  text-shadow: 0 4px 0 #5c3518;
}

.subtitle {
  max-width: 620px;
  margin: 18px 0 0;
  color: #c9b28c;
  line-height: 1.7;
}

.state-card,
.settings-card {
  max-width: 1180px;
  margin: 0 auto;
  border-radius: 28px;
  border: 1px solid rgba(214, 168, 79, 0.36);
  background: rgba(42, 28, 22, 0.9);
  box-shadow:
    0 30px 90px rgba(0, 0, 0, 0.48),
    inset 0 0 32px rgba(214, 168, 79, 0.04);
}

.state-card {
  padding: 48px;
  text-align: center;
  color: #d8bd84;
  font-size: 18px;
  font-weight: 800;
}

.settings-card {
  padding: 38px;
}

.cover-section {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 38px;
  align-items: start;
}

.cover-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.cover-uploader {
  width: 240px;
}

.cover-wrapper {
  position: relative;
  width: 240px;
  height: 330px;
  border-radius: 22px;
  overflow: hidden;
  border: 1px solid rgba(246, 230, 184, 0.32);
  box-shadow: 0 22px 56px rgba(0, 0, 0, 0.52);
  cursor: pointer;
}

.cover-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(10, 6, 4, 0.58);
  color: #f8ead0;
  font-weight: 900;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.cover-wrapper:hover .cover-overlay {
  opacity: 1;
}

.upload-placeholder {
  width: 240px;
  height: 330px;
  border-radius: 22px;
  border: 1px dashed rgba(217, 164, 65, 0.75);
  background:
    linear-gradient(145deg, rgba(68, 42, 20, 0.72), rgba(18, 12, 9, 0.88));
  color: #e7c987;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  box-shadow: inset 0 0 36px rgba(0, 0, 0, 0.35);
}

.upload-placeholder:hover {
  transform: translateY(-2px);
  border-color: #efbd55;
}

.upload-placeholder p {
  margin: 0;
  font-weight: 900;
  font-size: 17px;
}

.upload-placeholder span {
  font-size: 12px;
  color: rgba(231, 201, 135, 0.66);
}

.upload-icon {
  font-size: 42px;
  margin-bottom: 8px;
}

.remove-button {
  margin-top: 16px;
  border-radius: 999px;
}

.basic-form {
  min-width: 0;
}

.status-select {
  width: 240px;
}

:deep(.el-form-item__label) {
  color: #d6a84f;
  font-weight: 800;
}

:deep(.el-input__wrapper),
:deep(.el-textarea__inner),
:deep(.el-select__wrapper) {
  background: rgba(15, 10, 7, 0.72);
  border: 1px solid rgba(214, 168, 79, 0.34);
  box-shadow: none;
  border-radius: 14px;
}

:deep(.el-input__inner),
:deep(.el-textarea__inner) {
  color: #f8ead0;
}

:deep(.el-input__inner::placeholder),
:deep(.el-textarea__inner::placeholder) {
  color: rgba(248, 234, 208, 0.48);
}

.permission-section {
  margin-top: 42px;
  padding-top: 34px;
  border-top: 1px solid rgba(214, 168, 79, 0.25);
}

.section-title p {
  margin: 12px 0 0;
  color: #c9b28c;
}

.permission-grid {
  margin-top: 24px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.permission-card {
  min-height: 158px;
  padding: 22px;
  text-align: left;
  border-radius: 22px;
  border: 1px solid rgba(214, 168, 79, 0.24);
  background: rgba(15, 10, 7, 0.44);
  color: #f8ead0;
  cursor: pointer;
  transition: all 0.2s ease;
}

.permission-card:hover,
.permission-card.active {
  transform: translateY(-4px);
  border-color: rgba(214, 168, 79, 0.72);
  background: rgba(92, 53, 24, 0.7);
  box-shadow: 0 18px 44px rgba(0, 0, 0, 0.35);
}

.permission-icon {
  display: block;
  margin-bottom: 14px;
  font-size: 34px;
}

.permission-card strong {
  display: block;
  color: #f3e2b8;
  font-size: 20px;
  font-family: Georgia, "Times New Roman", serif;
}

.permission-card small {
  display: block;
  margin-top: 8px;
  color: #c9b28c;
  line-height: 1.5;
}

.reader-box {
  margin-top: 24px;
  padding: 24px;
  border-radius: 22px;
  border: 1px solid rgba(214, 168, 79, 0.32);
  background: rgba(15, 10, 7, 0.48);
}

.reader-box p {
  margin: 8px 0 18px;
  color: #c9b28c;
}

.reader-select {
  width: 100%;
}

.actions {
  margin-top: 36px;
  display: flex;
  gap: 16px;
  justify-content: flex-end;
}

.gold-button,
.dark-button {
  min-width: 150px;
  height: 48px;
  border-radius: 999px;
  font-weight: 900;
}

.gold-button {
  border: none;
  background: linear-gradient(135deg, #d6a84f, #8f5f1f);
  color: #1c1410;
}

.gold-button:hover {
  background: linear-gradient(135deg, #efc76d, #a86f24);
  color: #1c1410;
}

.dark-button {
  border: 1px solid rgba(214, 168, 79, 0.45);
  background: rgba(15, 10, 7, 0.5);
  color: #f3e2b8;
}

.dark-button:hover {
  background: rgba(214, 168, 79, 0.14);
  color: #f8ead0;
}

@media (max-width: 900px) {
  .hero-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .cover-section {
    grid-template-columns: 1fr;
  }

  .cover-panel {
    align-items: flex-start;
  }

  .permission-grid {
    grid-template-columns: 1fr;
  }

  .actions {
    flex-direction: column;
  }

  .gold-button,
  .dark-button {
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
.danger-button {
  border: 1px solid rgba(220, 80, 80, 0.65);
  background: rgba(127, 29, 29, 0.38);
  color: #f8ead0;
}

.danger-button:hover {
  background: rgba(180, 45, 45, 0.55);
  border-color: rgba(255, 120, 120, 0.8);
  color: #fff3d0;
}
</style>