<template>
  <div class="login-page">
    <div class="login-card">
      <h1 class="login-title">Login</h1>

      <el-form class="login-form">
        <el-form-item label="Username">
          <el-input />
        </el-form-item>

        <el-form-item label="Password">
          <el-input type="password" show-password />
        </el-form-item>
        <RouterLink to="/dashboard">
            <el-button type="primary" class="login-button">
                Login
            </el-button>
        </RouterLink>
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
  background:
    radial-gradient(circle at top, rgba(214, 168, 79, 0.18), transparent 35%),
    linear-gradient(135deg, #1c1410, #0f0a07);
}

.login-card {
  width: 420px;
  padding: 40px;
  border-radius: 20px;
  border: 1px solid rgba(214, 168, 79, 0.45);
  background: rgba(42, 28, 22, 0.92);
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.45);
}

.login-title {
  margin: 0 0 32px;
  text-align: center;
  color: #f3e2b8;
  font-size: 36px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.login-button {
  width: 100%;
  margin-top: 16px;
}
</style>