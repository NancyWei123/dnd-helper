<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { login } from "@/Api/user";

const router = useRouter();

const email = ref("");
const password = ref("");
const loading = ref(false);
const errorMessage = ref("");

const handleLogin = async () => {
  errorMessage.value = "";

  if (!email.value || !password.value) {
    errorMessage.value = "Please enter email and password";
    return;
  }

  loading.value = true;

  try {
    const res = await login({
      email: email.value,
      password: password.value,
    });

    localStorage.setItem("token", res.token);

    router.push("/dashboard");
  } catch (error: any) {
    if (error.response?.status === 401) {
      errorMessage.value = "Wrong password";
    } else {
      errorMessage.value = "Login failed. Please check your email and password.";
    }
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <h1 class="login-title">Login</h1>

      <el-form class="login-form" @submit.prevent>
        <el-form-item label="Email">
          <el-input
            v-model="email"
            placeholder="Enter your email"
            clearable
          />
        </el-form-item>

        <el-form-item label="Password">
          <el-input
            v-model="password"
            type="password"
            placeholder="Enter your password"
            show-password
          />
        </el-form-item>

        <p v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </p>

        <el-button
          type="primary"
          class="login-button"
          :loading="loading"
          @click="handleLogin"
        >
          Login
        </el-button>
      </el-form>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background:
    radial-gradient(circle at top, rgba(205, 151, 54, 0.2), transparent 34%),
    radial-gradient(circle at bottom left, rgba(120, 74, 28, 0.22), transparent 32%),
    linear-gradient(135deg, #1b130f 0%, #0f0a07 100%);
  color: #f3e2b8;
}

.login-card {
  width: 460px;
  max-width: 100%;
  padding: 46px 44px 42px;
  border-radius: 26px;
  border: 1px solid rgba(201, 151, 62, 0.55);
  background:
    linear-gradient(180deg, rgba(46, 31, 23, 0.96), rgba(31, 21, 17, 0.96));
  box-shadow:
    0 28px 90px rgba(0, 0, 0, 0.55),
    inset 0 0 40px rgba(255, 217, 139, 0.035);
}

.login-title {
  margin: 0 0 34px;
  text-align: center;
  color: #f7e7bd;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 42px;
  font-weight: 800;
  letter-spacing: 1px;
  text-shadow: 0 3px 0 rgba(88, 51, 19, 0.65);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.login-button {
  width: 100%;
  height: 48px;
  margin-top: 18px;
  border: none;
  border-radius: 999px;
  background: linear-gradient(135deg, #d6a84f, #b98222);
  color: #1d1208;
  font-size: 17px;
  font-weight: 800;
  letter-spacing: 0.5px;
  box-shadow: 0 10px 24px rgba(176, 119, 31, 0.28);
}

.login-button:hover {
  background: linear-gradient(135deg, #efc76d, #c98c28);
  color: #140c05;
  transform: translateY(-1px);
}

.error-message {
  margin: 4px 0 0;
  color: #ffb4a8;
  font-size: 14px;
  text-align: center;
}

/* Element Plus form label */
:deep(.el-form-item) {
  margin-bottom: 18px;
}

:deep(.el-form-item__label) {
  color: #d8bd84;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 17px;
  font-weight: 700;
}

/* Input outside */
:deep(.el-input__wrapper) {
  min-height: 48px;
  border-radius: 14px;
  background: rgba(255, 247, 226, 0.95);
  box-shadow:
    0 0 0 1px rgba(214, 168, 79, 0.35),
    inset 0 2px 5px rgba(64, 35, 12, 0.08);
}

/* Input when focus */
:deep(.el-input__wrapper.is-focus) {
  box-shadow:
    0 0 0 1px #d6a84f,
    0 0 0 4px rgba(214, 168, 79, 0.14);
}

/* Input text */
:deep(.el-input__inner) {
  color: #2a1a10;
  font-size: 16px;
  font-weight: 600;
}

/* Placeholder */
:deep(.el-input__inner::placeholder) {
  color: #a98d5f;
  font-weight: 500;
}

/* Password eye icon */
:deep(.el-input__suffix) {
  color: #8a6227;
}

@media (max-width: 520px) {
  .login-card {
    padding: 34px 24px;
  }

  .login-title {
    font-size: 34px;
  }
}
</style>