<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getUser, changeEmail, changePassword } from '@/Api/user'

const router = useRouter()

const username = ref('Adventurer')
const email = ref('No email')
const loading = ref(false)

const emailDialogVisible = ref(false)
const passwordDialogVisible = ref(false)

const newEmail = ref('')

const oldPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

const loadUser = async () => {
  loading.value = true

  try {
    const user = await getUser()
    username.value = user.username
    email.value = user.email
  } catch (error) {
    console.error(error)
    ElMessage.error('Failed to load user')
  } finally {
    loading.value = false
  }
}

const handleChangeEmail = async () => {
  if (!newEmail.value) {
    ElMessage.warning('Please enter a new email')
    return
  }

  try {
    await changeEmail(newEmail.value)

    ElMessage.success('Email changed successfully')
    email.value = newEmail.value
    newEmail.value = ''
    emailDialogVisible.value = false
  } catch (error: any) {
    ElMessage.error(error.message || 'Failed to change email')
  }
}

const handleChangePassword = async () => {
  if (!oldPassword.value || !newPassword.value || !confirmPassword.value) {
    ElMessage.warning('Please fill in all password fields')
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    ElMessage.error('New passwords do not match')
    return
  }

  try {
    await changePassword(oldPassword.value, newPassword.value)

    ElMessage.success('Password changed successfully. Please login again.')

    oldPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
    passwordDialogVisible.value = false

    localStorage.removeItem('token')
    router.push('/login')
  } catch (error: any) {
    ElMessage.error(error.message || 'Failed to change password')
  }
}

const logout = () => {
  localStorage.removeItem('token')
  ElMessage.success('Logged out successfully')
  router.push('/login')
}

onMounted(() => {
  loadUser()
})
</script>

<template>
  <div class="user-center-page">
    <div class="user-card">
      <div class="avatar">
        🧙
      </div>

      <p class="eyebrow">Adventurer Profile</p>
      <h1>User Center</h1>

      <div class="info-box">
        <div class="info-row">
          <span class="label">Username</span>
          <span class="value">{{ username }}</span>
        </div>

        <div class="info-row">
          <span class="label">Email</span>
          <span class="value">{{ email }}</span>
        </div>
      </div>

      <div class="actions">
        <el-button class="fantasy-button secondary" @click="passwordDialogVisible = true">
          Change Password
        </el-button>
        <el-button class="fantasy-button secondary" @click="emailDialogVisible = true">
          Change Email
        </el-button>
      </div>

      <div class="actions second-row">
        <el-button class="fantasy-button" @click="router.push('/books')">
          My Books
        </el-button>

        <el-button class="fantasy-button danger" @click="logout">
          Logout
        </el-button>
      </div>
    </div>

    <el-dialog
      v-model="emailDialogVisible"
      title="Change Email"
      width="420px"
      class="fantasy-dialog"
    >
      <el-form label-position="top">
        <el-form-item label="New Email">
          <el-input
            v-model="newEmail"
            placeholder="Enter new email"
            size="large"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="emailDialogVisible = false">
          Cancel
        </el-button>
        <el-button type="primary" @click="handleChangeEmail">
          Save
        </el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="passwordDialogVisible"
      title="Change Password"
      width="420px"
      class="fantasy-dialog"
    >
      <el-form label-position="top">
        <el-form-item label="Old Password">
          <el-input
            v-model="oldPassword"
            type="password"
            show-password
            placeholder="Enter old password"
            size="large"
          />
        </el-form-item>

        <el-form-item label="New Password">
          <el-input
            v-model="newPassword"
            type="password"
            show-password
            placeholder="Enter new password"
            size="large"
          />
        </el-form-item>

        <el-form-item label="Confirm New Password">
          <el-input
            v-model="confirmPassword"
            type="password"
            show-password
            placeholder="Confirm new password"
            size="large"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="passwordDialogVisible = false">
          Cancel
        </el-button>
        <el-button type="primary" @click="handleChangePassword">
          Save
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.user-center-page {
  min-height: 100vh;
  padding: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(circle at 50% 20%, rgba(214, 168, 79, 0.18), transparent 30%),
    radial-gradient(circle at 15% 20%, rgba(127, 29, 29, 0.28), transparent 34%),
    linear-gradient(135deg, #0f0a07, #1c1410 50%, #090605);
  color: #f8ead0;
}

.user-card {
  width: min(780px, 92vw);
  padding: 62px;
  border-radius: 36px;
  border: 1px solid rgba(214, 168, 79, 0.42);
  background: rgba(42, 28, 22, 0.92);
  box-shadow:
    0 30px 90px rgba(0, 0, 0, 0.55),
    inset 0 0 40px rgba(214, 168, 79, 0.05);
}

.avatar {
  width: 104px;
  height: 104px;
  margin: 0 auto 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 54px;
  background: rgba(214, 168, 79, 0.16);
  border: 1px solid rgba(214, 168, 79, 0.5);
}

.eyebrow {
  margin: 0;
  text-align: center;
  color: #d6a84f;
  font-size: 12px;
  letter-spacing: 6px;
  text-transform: uppercase;
}

h1 {
  margin: 18px 0 42px;
  text-align: center;
  font-size: 64px;
  color: #f3e2b8;
  font-family: Georgia, "Times New Roman", serif;
  text-shadow: 0 5px 0 #5c3518;
}

.info-box {
  display: flex;
  flex-direction: column;
  gap: 22px;
  margin-bottom: 42px;
}

.info-row {
  padding: 22px 28px;
  display: flex;
  justify-content: space-between;
  gap: 18px;
  border-radius: 18px;
  border: 1px solid rgba(214, 168, 79, 0.32);
  background: rgba(15, 10, 7, 0.58);
}

.label {
  color: #d6a84f;
  font-weight: 800;
  font-size: 22px;
  font-family: Georgia, "Times New Roman", serif;
}

.value {
  color: #f8ead0;
  font-weight: 800;
  font-size: 22px;
  word-break: break-all;
  font-family: Georgia, "Times New Roman", serif;
}

.actions {
  display: flex;
  gap: 40px;
}

.second-row {
  margin-top: 20px;
}

.fantasy-button {
  flex: 1;
  height: 68px;
  border-radius: 999px;
  border: none;
  background: linear-gradient(135deg, #d6a84f, #8f5f1f);
  color: #1c1410;
  font-weight: 800;
  font-size: 18px;
}

.fantasy-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(214, 168, 79, 0.24);
}

.fantasy-button.secondary {
  background: rgba(214, 168, 79, 0.12);
  color: #d6a84f;
  border: 1px solid rgba(214, 168, 79, 0.42);
}

.fantasy-button.danger {
  background: rgba(127, 29, 29, 0.4);
  color: #f3e2b8;
  border: 1px solid rgba(214, 168, 79, 0.32);
}

:deep(.el-dialog) {
  border-radius: 24px;
  background: #2a1c16;
  border: 1px solid rgba(214, 168, 79, 0.42);
}

:deep(.el-dialog__title) {
  color: #f3e2b8;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 26px;
  font-weight: 800;
}

:deep(.el-form-item__label) {
  color: #d6a84f;
  font-weight: 700;
}

:deep(.el-input__wrapper) {
  background: rgba(15, 10, 7, 0.72);
  border: 1px solid rgba(214, 168, 79, 0.32);
  box-shadow: none;
}

:deep(.el-input__inner) {
  color: #f8ead0;
}

@media (max-width: 620px) {
  .user-card {
    padding: 36px 24px;
  }

  h1 {
    font-size: 42px;
  }

  .actions {
    flex-direction: column;
    gap: 14px;
  }

  .info-row {
    flex-direction: column;
  }
}
</style>