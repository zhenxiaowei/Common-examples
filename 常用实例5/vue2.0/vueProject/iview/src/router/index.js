import Vue from 'vue'
import Router from 'vue-router'
import bootstropNav from '@/components/bootstropNav'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'bootstropNav',
      component: bootstropNav
    }
  ]
})
