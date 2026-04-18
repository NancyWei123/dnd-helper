<template>
  <div class="home-page">
    <div class="hero-card">
      <p class="eyebrow">DND Writing Studio</p>

      <h1>Write Your Legendary Story</h1>

      <p class="subtitle">
        Create books, manage chapters, write in Markdown, and publish your fantasy world.
      </p>

      <div class="button-group">
        <RouterLink to="/login">
          <el-button class="fantasy-button primary">Enter Tavern</el-button>
        </RouterLink>

        <RouterLink to="/register">
          <el-button class="fantasy-button secondary">Create Adventurer Account</el-button>
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>