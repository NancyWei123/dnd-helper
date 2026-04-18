<template>
  <div class="home-page">
    <div class="magic-light"></div>

    <div class="hero-card">
      <p class="eyebrow">Fantasy Markdown Studio</p>

      <h1>DND Helper</h1>

      <p class="subtitle">
        Write campaigns, chapters, character lore, and publish your stories in Markdown.
      </p>

      <div class="button-group">
        <RouterLink to="/login">
          <el-button class="fantasy-button primary">Enter</el-button>
        </RouterLink>

        <RouterLink to="/register">
          <el-button class="fantasy-button secondary">Register</el-button>
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-page {
  min-height: 100vh;
  padding: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  color: #f8ead0;
  background:
    radial-gradient(circle at 50% 35%, rgba(214, 168, 79, 0.18), transparent 28%),
    radial-gradient(circle at 20% 20%, rgba(127, 29, 29, 0.25), transparent 30%),
    linear-gradient(135deg, #0f0a07, #1c1410 50%, #090605);
}

.home-page::before {
  content: "";
  position: absolute;
  inset: 24px;
  border: 1px solid rgba(214, 168, 79, 0.28);
  border-radius: 28px;
  pointer-events: none;
}

.home-page::after {
  content: "✦";
  position: absolute;
  top: 18%;
  right: 24%;
  font-size: 42px;
  color: rgba(214, 168, 79, 0.45);
  text-shadow: 0 0 24px rgba(214, 168, 79, 0.8);
}

.magic-light {
  position: absolute;
  width: 420px;
  height: 420px;
  border-radius: 999px;
  background: rgba(214, 168, 79, 0.12);
  filter: blur(70px);
}

.hero-card {
  width: min(760px, 92vw);
  padding: 64px 56px;
  position: relative;
  text-align: center;
  border-radius: 28px;
  border: 1px solid rgba(214, 168, 79, 0.42);
  background:
    linear-gradient(rgba(42, 28, 22, 0.86), rgba(28, 20, 16, 0.92));
  box-shadow:
    0 30px 90px rgba(0, 0, 0, 0.55),
    inset 0 0 40px rgba(214, 168, 79, 0.05);
}

.hero-card::before {
  content: "⚔";
  display: block;
  margin-bottom: 18px;
  font-size: 46px;
  color: #d6a84f;
  text-shadow: 0 0 24px rgba(214, 168, 79, 0.55);
}

.eyebrow {
  margin: 0 0 14px;
  color: #d6a84f;
  font-size: 13px;
  letter-spacing: 4px;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  font-size: clamp(54px, 8vw, 96px);
  line-height: 1;
  color: #f3e2b8;
  letter-spacing: 2px;
  text-shadow:
    0 4px 0 #5c3518,
    0 12px 32px rgba(0, 0, 0, 0.65);
}

.subtitle {
  max-width: 560px;
  margin: 28px auto 0;
  color: #c9b28c;
  font-size: 18px;
  line-height: 1.7;
}

.button-group {
  margin-top: 38px;
  display: flex;
  justify-content: center;
  gap: 18px;
  flex-wrap: wrap;
}

.fantasy-button {
  height: 48px;
  padding: 0 26px;
  border-radius: 999px;
  font-weight: 700;
  letter-spacing: 0.4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.primary {
  border: none;
  background: linear-gradient(135deg, #d6a84f, #8f5f1f);
  color: #1c1410;
}

.secondary {
  border: 1px solid rgba(214, 168, 79, 0.75);
  background: rgba(15, 10, 7, 0.45);
  color: #f3e2b8;
}

.primary:hover,
.secondary:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 30px rgba(214, 168, 79, 0.24);
}

@media (max-width: 600px) {
  .hero-card {
    padding: 48px 28px;
  }

  .button-group {
    flex-direction: column;
  }

  .fantasy-button {
    width: 100%;
  }
}
</style>