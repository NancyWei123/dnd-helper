<script setup lang="ts">
import { reactive, ref, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { register, sendVerificationCode } from '@/Api/user'

const router = useRouter()

const loading = ref(false)
const sendCodeLoading = ref(false)
const countdown = ref(0)

let timer: number | null = null

const form = reactive({
  username: '',
  email: '',
  verificationCode: '',
  password: '',
  confirmPassword: ''
})

const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

const startCountdown = () => {
  countdown.value = 60

  timer = window.setInterval(() => {
    countdown.value--

    if (countdown.value <= 0) {
      if (timer !== null) {
        clearInterval(timer)
        timer = null
      }
    }
  }, 1000)
}

const handleSendCode = async () => {
  if (!form.email) {
    ElMessage.warning('Please enter your email first')
    return
  }

  if (!isValidEmail(form.email)) {
    ElMessage.warning('Please enter a valid email')
    return
  }

  sendCodeLoading.value = true

  try {
    const response = await sendVerificationCode(form.email)

    if (!response.ok) {
      throw new Error('Send verification code failed')
    }

    ElMessage.success('Verification code sent')
    startCountdown()
  } catch (error) {
    ElMessage.error('Failed to send verification code')
  } finally {
    sendCodeLoading.value = false
  }
}

const handleRegister = async () => {
  if (
    !form.username ||
    !form.email ||
    !form.verificationCode ||
    !form.password ||
    !form.confirmPassword
  ) {
    ElMessage.warning('Please fill in all fields')
    return
  }

  if (!isValidEmail(form.email)) {
    ElMessage.warning('Please enter a valid email')
    return
  }

  if (form.password !== form.confirmPassword) {
    ElMessage.error('Passwords do not match')
    return
  }

  loading.value = true

  try {
    const response = await register({
      username: form.username,
      email: form.email,
      verificationCode: form.verificationCode,
      password: form.password
    })

    if (!response.ok) {
      throw new Error('Register failed')
    }

    ElMessage.success('Account created successfully')
    localStorage.setItem('token', response.token)
    router.push('/login')
  } catch (error) {
    ElMessage.error('Register failed. Please try again.')
  } finally {
    loading.value = false
  }
}

onBeforeUnmount(() => {
  if (timer !== null) {
    clearInterval(timer)
  }
})
</script>

<template>
  <div class="register-page">
    <div class="register-card">
      <div class="card-icon">📜</div>

      <p class="eyebrow">Join the Guild</p>
      <h1>Create Adventurer</h1>
      <p class="subtitle">
        Start your writing journey and craft your own legendary book.
      </p>

      <el-form label-position="top" class="register-form">
        <el-form-item label="Username">
          <el-input
            v-model="form.username"
            placeholder="Enter your adventurer name"
            size="large"
          />
        </el-form-item>

        <el-form-item label="Email">
          <div class="email-row">
            <el-input
              v-model="form.email"
              placeholder="Enter your email"
              size="large"
            />

            <el-button
              class="send-code-button"
              :loading="sendCodeLoading"
              :disabled="countdown > 0"
              @click="handleSendCode"
            >
              {{ countdown > 0 ? `${countdown}s` : 'Send Code' }}
            </el-button>
          </div>
        </el-form-item>

        <el-form-item label="Verification Code">
          <el-input
            v-model="form.verificationCode"
            placeholder="Enter verification code"
            size="large"
          />
        </el-form-item>

        <el-form-item label="Password">
          <el-input
            v-model="form.password"
            type="password"
            show-password
            placeholder="Create a password"
            size="large"
          />
        </el-form-item>

        <el-form-item label="Confirm Password">
          <el-input
            v-model="form.confirmPassword"
            type="password"
            show-password
            placeholder="Confirm your password"
            size="large"
            @keyup.enter="handleRegister"
          />
        </el-form-item>

        <el-button
          class="fantasy-button primary"
          :loading="loading"
          @click="handleRegister"
        >
          Create Account
        </el-button>
      </el-form>

      <p class="bottom-text">
        Already have an account?
        <RouterLink to="/login">Enter Tavern</RouterLink>
      </p>
    </div>
  </div>
</template>

<style scoped>
.register-page {
  min-height: 100vh;
  padding: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(circle at 50% 25%, rgba(214, 168, 79, 0.18), transparent 30%),
    radial-gradient(circle at 15% 20%, rgba(127, 29, 29, 0.28), transparent 34%),
    linear-gradient(135deg, #0f0a07, #1c1410 50%, #090605);
  color: #f8ead0;
}

.register-card {
  width: min(460px, 92vw);
  padding: 42px;
  border-radius: 28px;
  border: 1px solid rgba(214, 168, 79, 0.42);
  background: rgba(42, 28, 22, 0.92);
  box-shadow:
    0 30px 90px rgba(0, 0, 0, 0.55),
    inset 0 0 40px rgba(214, 168, 79, 0.05);
}

.card-icon {
  text-align: center;
  font-size: 42px;
  margin-bottom: 12px;
}

.eyebrow {
  margin: 0;
  text-align: center;
  color: #d6a84f;
  font-size: 12px;
  letter-spacing: 4px;
  text-transform: uppercase;
}

h1 {
  margin: 12px 0 0;
  text-align: center;
  font-size: 42px;
  color: #f3e2b8;
  text-shadow: 0 4px 0 #5c3518;
}

.subtitle {
  margin: 16px auto 30px;
  text-align: center;
  color: #c9b28c;
  line-height: 1.6;
}

.register-form {
  display: flex;
  flex-direction: column;
}

.email-row {
  display: flex;
  gap: 10px;
  width: 100%;
}

.email-row .el-input {
  flex: 1;
}

.send-code-button {
  height: 40px;
  min-width: 110px;
  border-radius: 12px;
  border: 1px solid rgba(214, 168, 79, 0.45);
  background: rgba(214, 168, 79, 0.12);
  color: #d6a84f;
  font-weight: 700;
}

.send-code-button:hover {
  background: rgba(214, 168, 79, 0.22);
  color: #f3e2b8;
}

.fantasy-button {
  width: 100%;
  height: 46px;
  margin-top: 8px;
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
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(214, 168, 79, 0.24);
}

.bottom-text {
  margin: 24px 0 0;
  text-align: center;
  color: #c9b28c;
}

.bottom-text a {
  color: #d6a84f;
  font-weight: 700;
  text-decoration: none;
}

:deep(.el-form-item__label) {
  color: #d6a84f;
  font-weight: 700;
  letter-spacing: 1px;
}

:deep(.el-input__wrapper) {
  background: rgba(15, 10, 7, 0.72);
  border: 1px solid rgba(214, 168, 79, 0.32);
  box-shadow: none;
}

:deep(.el-input__inner) {
  color: #f8ead0;
}

:deep(.el-input__inner::placeholder) {
  color: #8f7a5c;
}

@media (max-width: 520px) {
  .register-card {
    padding: 32px 24px;
  }

  h1 {
    font-size: 34px;
  }

  .email-row {
    flex-direction: column;
  }

  .send-code-button {
    width: 100%;
  }
}
</style>