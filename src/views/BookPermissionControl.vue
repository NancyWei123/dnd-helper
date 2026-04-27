<template>
  <section class="permission-card">
    <div class="permission-header">
      <div>
        <p class="eyebrow">Access Control</p>
        <h3 class="title">Who can read this book?</h3>
      </div>

      <span class="permission-badge" :class="permission">
        {{ permissionLabel }}
      </span>
    </div>

    <div class="permission-options">
      <button
        type="button"
        class="permission-option"
        :class="{ active: permission === 'private' }"
        @click="permission = 'private'"
      >
        <span class="option-icon">🔒</span>
        <span>
          <strong>Private</strong>
          <small>Only you</small>
        </span>
      </button>

      <button
        type="button"
        class="permission-option"
        :class="{ active: permission === 'public' }"
        @click="permission = 'public'"
      >
        <span class="option-icon">🌍</span>
        <span>
          <strong>Public</strong>
          <small>Everyone</small>
        </span>
      </button>

      <button
        type="button"
        class="permission-option"
        :class="{ active: permission === 'protected' }"
        @click="permission = 'protected'"
      >
        <span class="option-icon">🛡️</span>
        <span>
          <strong>Protected</strong>
          <small>Selected readers</small>
        </span>
      </button>
    </div>

    <p class="hint">
      {{ permissionHint }}
    </p>

    <div v-if="permission === 'protected'" class="reader-section">
      <div class="section-top">
        <label class="label">Select readers</label>

        <span class="reader-count">
          {{ selectedReaderIds.length }} selected
        </span>
      </div>

      <div class="search-box">
        <span class="search-icon">⌕</span>
        <input
          v-model="searchText"
          class="input"
          placeholder="Search users by username or email"
        />
      </div>

      <div v-if="selectedUsers.length > 0" class="selected-chips">
        <button
          v-for="user in selectedUsers"
          :key="user.id"
          type="button"
          class="reader-chip"
          @click="removeReader(user.id)"
        >
          {{ user.username }}
          <span>×</span>
        </button>
      </div>

      <div class="user-list">
        <label
          v-for="user in filteredUsers"
          :key="user.id"
          class="user-row"
          :class="{ checked: selectedReaderIds.includes(user.id) }"
        >
          <input
            type="checkbox"
            :value="user.id"
            v-model="selectedReaderIds"
          />

          <div class="avatar">
            {{ getInitial(user.username) }}
          </div>

          <div class="user-info">
            <div class="username">{{ user.username }}</div>
            <div class="email">{{ user.email }}</div>
          </div>
        </label>

        <p v-if="filteredUsers.length === 0" class="empty-text">
          No users found.
        </p>
      </div>

      <p v-if="selectedReaderIds.length === 0" class="warning">
        ⚠ Protected book should have at least one selected reader.
      </p>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, watch, onMounted } from "vue";

const props = defineProps({
  modelValue: {
    type: String,
    default: "private",
  },
  selectedReaders: {
    type: Array,
    default: () => [],
  },
  users: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits([
  "update:modelValue",
  "update:selectedReaders",
]);

const permission = ref(props.modelValue);
const selectedReaderIds = ref([...props.selectedReaders]);
const searchText = ref("");

// Add this local users list
const localUsers = ref([]);

onMounted(() => {
  fetchUsers();
});

async function fetchUsers() {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch("http://localhost:8080/api/users/all", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch users");
    }

    localUsers.value = await response.json();
  } catch (error) {
    console.error("Failed to load users:", error);
  }
}

// Use parent users if provided, otherwise use local fetched users
const displayUsers = computed(() => {
  return props.users.length > 0 ? props.users : localUsers.value;
});

watch(permission, (newValue) => {
  emit("update:modelValue", newValue);

  if (newValue !== "protected") {
    selectedReaderIds.value = [];
    emit("update:selectedReaders", []);
  }
});

watch(selectedReaderIds, (newValue) => {
  emit("update:selectedReaders", newValue);
});

watch(
  () => props.modelValue,
  (newValue) => {
    permission.value = newValue;
  }
);

watch(
  () => props.selectedReaders,
  (newValue) => {
    selectedReaderIds.value = [...newValue];
  }
);

const filteredUsers = computed(() => {
  const keyword = searchText.value.toLowerCase().trim();

  if (!keyword) {
    return displayUsers.value;
  }

  return displayUsers.value.filter((user) => {
    const username = user.username?.toLowerCase() || "";
    const email = user.email?.toLowerCase() || "";

    return username.includes(keyword) || email.includes(keyword);
  });
});

const selectedUsers = computed(() => {
  return displayUsers.value.filter((user) =>
    selectedReaderIds.value.includes(user.id)
  );
});

const permissionHint = computed(() => {
  if (permission.value === "private") {
    return "Only you can read this book. This is best for drafts or private notes.";
  }

  if (permission.value === "public") {
    return "Everyone can read this book once it is published.";
  }

  return "Only the readers you choose below can read this book.";
});

const permissionLabel = computed(() => {
  if (permission.value === "private") return "Private";
  if (permission.value === "public") return "Public";
  return "Protected";
});

function removeReader(userId) {
  selectedReaderIds.value = selectedReaderIds.value.filter(
    (id) => id !== userId
  );
}

function getInitial(username) {
  return username ? username.charAt(0).toUpperCase() : "?";
}
</script>

<style scoped>
.permission-card {
  margin-top: 26px;
  padding: 26px;
  border-radius: 24px;
  border: 1px solid rgba(214, 163, 64, 0.45);
  background:
    radial-gradient(circle at top left, rgba(214, 163, 64, 0.16), transparent 34%),
    linear-gradient(145deg, #21140f 0%, #130d0a 100%);
  box-shadow:
    0 18px 45px rgba(0, 0, 0, 0.32),
    inset 0 0 0 1px rgba(255, 238, 190, 0.04);
  color: #f6e6bd;
}

.permission-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 20px;
}

.eyebrow {
  margin: 0 0 6px;
  color: #d79d37;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}

.title {
  margin: 0;
  color: #fff2cc;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 24px;
  line-height: 1.2;
}

.permission-badge {
  flex-shrink: 0;
  padding: 8px 13px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 800;
  border: 1px solid rgba(214, 163, 64, 0.48);
  background: rgba(214, 163, 64, 0.12);
  color: #ffd98a;
}

.permission-badge.private {
  color: #f3c56f;
}

.permission-badge.public {
  color: #b8f3c4;
}

.permission-badge.protected {
  color: #ffd98a;
}

.permission-options {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.permission-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 15px;
  border-radius: 18px;
  border: 1px solid rgba(214, 163, 64, 0.28);
  background: rgba(255, 245, 220, 0.045);
  color: #eed8a8;
  text-align: left;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    background 0.18s ease,
    box-shadow 0.18s ease;
}

.permission-option:hover {
  transform: translateY(-2px);
  border-color: rgba(214, 163, 64, 0.62);
  background: rgba(214, 163, 64, 0.11);
}

.permission-option.active {
  border-color: #d79d37;
  background:
    linear-gradient(135deg, rgba(214, 163, 64, 0.22), rgba(214, 163, 64, 0.08));
  box-shadow: 0 0 0 3px rgba(214, 163, 64, 0.1);
}

.option-icon {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 14px;
  background: rgba(255, 238, 190, 0.08);
  font-size: 18px;
}

.permission-option strong {
  display: block;
  color: #fff2cc;
  font-size: 15px;
}

.permission-option small {
  display: block;
  margin-top: 3px;
  color: #ad9365;
  font-size: 12px;
}

.hint {
  margin: 16px 0 0;
  color: #c9b58a;
  font-size: 14px;
  line-height: 1.6;
}

.reader-section {
  margin-top: 24px;
  padding-top: 22px;
  border-top: 1px solid rgba(214, 163, 64, 0.22);
}

.section-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.label {
  display: block;
  color: #fff2cc;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 18px;
  font-weight: 700;
}

.reader-count {
  padding: 5px 10px;
  border-radius: 999px;
  background: rgba(214, 163, 64, 0.12);
  color: #dcb66a;
  font-size: 12px;
  font-weight: 700;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 14px;
  border-radius: 16px;
  border: 1px solid rgba(214, 163, 64, 0.34);
  background: rgba(255, 250, 238, 0.07);
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    background 0.18s ease;
}

.search-box:focus-within {
  border-color: #d79d37;
  background: rgba(255, 250, 238, 0.1);
  box-shadow: 0 0 0 4px rgba(214, 163, 64, 0.12);
}

.search-icon {
  color: #d79d37;
  font-size: 20px;
}

.input {
  width: 100%;
  height: 50px;
  border: none;
  outline: none;
  background: transparent;
  color: #fff2cc;
  font-size: 15px;
}

.input::placeholder {
  color: #8d7a5b;
}

.selected-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}

.reader-chip {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 7px 11px;
  border-radius: 999px;
  border: 1px solid rgba(214, 163, 64, 0.42);
  background: rgba(214, 163, 64, 0.15);
  color: #ffdf9a;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.reader-chip span {
  color: #f4c15e;
  font-size: 16px;
  line-height: 1;
}

.user-list {
  margin-top: 14px;
  max-height: 230px;
  overflow-y: auto;
  border-radius: 18px;
  border: 1px solid rgba(214, 163, 64, 0.22);
  background: rgba(0, 0, 0, 0.16);
}

.user-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 13px 14px;
  border-bottom: 1px solid rgba(214, 163, 64, 0.12);
  cursor: pointer;
  transition: background 0.18s ease;
}

.user-row:last-child {
  border-bottom: none;
}

.user-row:hover {
  background: rgba(214, 163, 64, 0.08);
}

.user-row.checked {
  background: rgba(214, 163, 64, 0.14);
}

.user-row input[type="checkbox"] {
  width: 17px;
  height: 17px;
  accent-color: #d79d37;
  cursor: pointer;
}

.avatar {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: linear-gradient(135deg, #d79d37, #9b641d);
  color: #1b100c;
  font-weight: 900;
}

.user-info {
  min-width: 0;
}

.username {
  color: #fff2cc;
  font-size: 14px;
  font-weight: 700;
}

.email {
  margin-top: 3px;
  color: #a9946f;
  font-size: 12px;
}

.empty-text {
  margin: 0;
  padding: 18px;
  color: #a9946f;
  text-align: center;
}

.warning {
  margin: 14px 0 0;
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid rgba(214, 70, 55, 0.4);
  background: rgba(214, 70, 55, 0.1);
  color: #ff9a8e;
  font-size: 13px;
  line-height: 1.5;
}

@media (max-width: 760px) {
  .permission-options {
    grid-template-columns: 1fr;
  }

  .permission-header {
    flex-direction: column;
  }

  .permission-card {
    padding: 20px;
  }
}
</style>