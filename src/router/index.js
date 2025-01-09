import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Signup from '../views/Signup.vue'
import JobDetail from '../views/JobDetail.vue'
import JobList from '../views/JobList.vue'
import JobPost from '../views/JobPost.vue'
import UserProfile from '../views/UserProfile.vue'
import JobPostUpdate from '../views/JobPostUpdate.vue'
import About from '../views/About.vue'

const routes = [
  {path: '/', component: Login },
  {path: '/signup', component: Signup },
  {path: '/job-detail/:id', component: JobDetail },
  {path: '/job-list', component: JobList },
  {path: '/job-post', component: JobPost },
  {path: '/user-profile', component: UserProfile },
  {path: '/job-post-update/:id', component: JobPostUpdate },
  {path: '/about', component: About },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router;
