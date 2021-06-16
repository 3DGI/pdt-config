import Vue from 'vue'
import Router from 'vue-router'
import RecordList from '@/components/RecordList'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'RecordList',
      component: RecordList
    }
  ]
})
