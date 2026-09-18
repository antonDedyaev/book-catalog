import { createRouter, createWebHistory } from 'vue-router'
import BooksList from '@/views/BooksList.vue'
import { useAuthStore } from '@/stores/auth.js'
import LoginView from '@/views/LoginView.vue'
import BookForm from '@/views/BookForm.vue'
import AuthorsList from '@/views/AuthorsList.vue'
import AuthorView from '@/views/AuthorView.vue'
import TopAuthorsView from '@/views/TopAuthorsView.vue'
import AuthorForm from '@/views/AuthorForm.vue'
import BookView from '@/views/BookView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'books', component: BooksList },
    { path: '/books/:id', name: 'book-view', component: BookView },
    {
      path: '/books/create',
      name: 'book-create',
      component: BookForm,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/books/:id/edit',
      name: 'book-edit',
      component: BookForm,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    { path: '/authors', name: 'authors', component: AuthorsList },
    {
      path: '/authors/:id',
      name: 'author',
      component: AuthorView,
    },
    {
      path: '/authors/create',
      name: 'author-create',
      component: AuthorForm,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/authors/:id/edit',
      name: 'author-edit',
      component: AuthorForm,
      meta: {
        requiresAuth: true,
      },
    },
    { path: '/reports/top-authors', name: 'report', component: TopAuthorsView },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.name === 'login' && auth.isAuthedUser) {
    return { path: '/' }
  }

  if (to.meta.requiresAuth && !auth.isAuthedUser) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }
})

export default router
