import { createRouter, createWebHashHistory } from 'vue-router'
import Todo from '../components/todo.vue'
import Memo from '../components/memo.vue'
import ExpenseTracker from '../components/ExpenseTracker/ExpenseTrackerMain.vue'
import IncomForm from '../components/ExpenseTracker/IncomForm.vue'

const routes = [
  { path: '/', redirect: '/tasks' },
  { path: '/tasks', name: 'tasks', component: Todo },
  { path: '/memo', name: 'memo', component: Memo },
  { path: '/expenseTracker', name: 'ExpenseTracker', component: ExpenseTracker },
  { path: '/incomForm', name: 'IncomForm', component: IncomForm },
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
