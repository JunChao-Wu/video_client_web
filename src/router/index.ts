import { createRouter, createWebHistory } from 'vue-router'

import { checkRole } from '@/router/guard/viewRole.guard'

import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/upload',
      name: 'upload',
      props: true,
      component: () => import('../views/UploadView.vue'),
      beforeEnter: async () => {
        try {
          await checkRole()
        } catch (error) {
          return false
        }
      }
    },
    {
      path: '/player',
      name: 'player',
      component: () => import('../views/PlayerView.vue')
    },
    {
      path: '/examine',
      name: 'examine',
      component: () => import('../views/ExamineView.vue'),
      beforeEnter: async () => {
        try {
          await checkRole()
        } catch (error) {
          return false
        }
      }
    },
    {
      path: '/series',
      name: 'series',
      component: () => import('../views/SeriesView.vue')
    },
    {
      path: '/series_add',
      name: 'seriesAdd',
      component: () => import('@/components/series/SeriesAddComponent.vue'),
      beforeEnter: async () => {
        try {
          await checkRole()
        } catch (error) {
          return false
        }
      }
    },
    {
      path: '/my_series',
      name: 'mySeries',
      component: () => import('@/components/series/MySeriesComponent.vue'),
      beforeEnter: async () => {
        try {
          await checkRole()
        } catch (error) {
          return false
        }
      }
    }
  ]
})

export default router
