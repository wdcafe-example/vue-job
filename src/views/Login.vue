<template>
  <div class="loading_info" v-if="isLoading">
    <p>로그인 처리중...</p>
  </div>
  <div class="form-container">
    <form @submit.prevent="handleLogin" class="form">
      <div class="form-group">
        <label for="email">이메일</label>
        <input type="email" id="email" placeholder="이메일" required v-model="email" />
      </div>
      <div class="form-group">
        <label for="password">비밀번호</label>
        <input type="password" id="password" placeholder="비밀번호" required v-model="password" />
      </div>
      <button>로그인</button>
      <router-link to="/signup">회원가입</router-link> 
      <router-link to="/about">앱소개</router-link>
    </form>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import supabase from '../supabase';
import { ref } from 'vue';

const router = useRouter();
const isLoading = ref(false); 

const email = ref('');
const password = ref('');

const handleLogin = async () => {
  isLoading.value = true;  // 서버 요청 시작지점

  const { data, error } = await supabase.auth.signInWithPassword({ 
    email: email.value,
    password: password.value,
  });  

  if (error) {
    console.log(error)
  } else {
    alert('로그인 성공');
    console.log(data);
    router.push('/job-list');
  }  
  isLoading.value = false;  // 로그인 요청이 끝난 후로 위치를 변경 합니다.
}
</script>

<style scoped lang="scss">
  @import '../assets/scss/form.scss';

  a{
    margin-left: 20px;
  }
</style>