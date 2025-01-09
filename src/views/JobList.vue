<template>
  <div class="job-list-container" v-if="isLogin">
    <!-- 조건문을 통해 구인목록이 있으면 구인목록을 불러오기 -->
    <ul class="job-list" v-if="posts.length > 0">
      <li class="job-item" v-for="post in posts" :key="post.id">
        <router-link :to="`/job-detail/${post.id}`">
          <div class="header">
            <h3>{{ post.title }}</h3> 
            <address>{{ post.location }}</address>
            <span>&middot;</span>
            <time>{{ format(post.created_at, 'yyyy-MM-dd') }}</time>
          </div>
          <div class="bottom-info">
            <p class="pay">시급: {{ post.pay }}원</p>
              <img v-if="post.img_url" :src="post.img_url" alt="image" width="64" height="64">
          </div>
        </router-link>
      </li>
    </ul>
    <p v-else class="loading-info">
      구인목록을 불러오는 중입니다...
    </p>
  </div>
</template>

<script setup>
  import { useAuth } from '../auth/auth';
  import supabase from '../supabase';
  import { ref, onMounted } from 'vue';
  import { format } from 'date-fns';

  const { isLogin, user, checkLoginStatus } = useAuth(); // 로그인 상태 확인 함수 가져오기

  const posts = ref([]);


  // 구인목록 가져오기
  onMounted(async () => {
    await checkLoginStatus();

    const { data, error } = await supabase
    .from('job_posts')
    .select('*')
    .order('created_at', { ascending: false });  // 최신글 순으로 정렬

    posts.value = data; // 구인목록 저장 
    // console.log(data);

    if(error) {
      alert('구인목록 가져오기 실패'); 
    } 
  });

</script>

<style lang="scss" scoped>
  .job-list-container {
    padding: 20px;
  }

  ul {
    list-style: none;
    padding: 0;
    li {
      padding: 15px;
      border-bottom: 1px solid rgba(0,0,0, 0.2);
    }
  }

  address, time, span {
    font-style: normal;
    display: inline;
    font-size: 12px;
    color: #666;
  }

  .pay {
    font-size: 14px;
    font-weight: bold;
  }

  .bottom-info {
    display: flex;
    justify-content: space-between;
    align-items: start;
    margin-top: 15px;
  }
</style>