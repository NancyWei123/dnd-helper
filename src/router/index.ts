import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import DashboardView from '../views/DashboardView.vue'
import BookEditorView from '../views/BookEditorView.vue'
import BooksView from '../views/BooksView.vue'
import NewBookView from '../views/NewBookView.vue'


const routes = [
  { path: '/', name: 'home', component: HomeView },

  { path: '/login', name: 'login', component: LoginView },
  { path: '/register', name: 'register', component: RegisterView },

  { path: '/dashboard', name: 'dashboard', component: DashboardView },
  { path: '/books', name: 'books', component: BooksView },
  { path: '/books/:bookId/edit', name: 'book-editor', component: BookEditorView },

  { path: '/books/:bookId/read', name: 'read-book', component: BooksView },
  { path: '/books/new', name: 'new-book', component: NewBookView },
  
]
const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router