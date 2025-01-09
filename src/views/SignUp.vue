<template>
  <div class="loading_info" v-if="isLoading">
    <p>회원가입 처리중...</p>
  </div>

  <div class="form-container">
    <form @submit.prevent="handleSignup" class="form">
      <div class="form-group">
        <label for="email">이메일</label>
        <input type="email" id="email" placeholder="이메일" required v-model="email" />
      </div>
      <div class="form-group">
        <label for="password">비밀번호</label>
        <input type="password" id="password" placeholder="비밀번호" required v-model="password" />
      </div>
      <div class="form-group">
        <label for="tel">전화번호</label>
        <input type="tel" id="tel" placeholder="010-1234-5678" required v-model="tel" />
      </div>
      <div class="form-group">
        <label for="name">이름</label>
        <input type="text" id="name" placeholder="이름" required v-model="name" />
      </div>
      <div class="form-group">
        <label for="addr">주소</label>
        <input type="text" id="addr" placeholder="주소" required v-model="addr" />
      </div>
      <div class="form-group">
        <label for="text">자기소개</label>
        <textarea id="text" placeholder="자기소개" required v-model="text" />
      </div>
      <button>회원가입</button>
      <router-link to="/">로그인</router-link>
    </form>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import supabase from '../supabase';
import { ref } from 'vue';

const email = ref('');
const password = ref('');
const tel = ref('');
const text = ref('');
const name = ref('');
const addr = ref('');
const isLoading = ref(false);
const router = useRouter();

// 입력폼 초기화 함수
// const resetForm = () => {
//   email.value = '';
//   password.value = '';
//   tel.value = '';
//   text.value = '';
//   name.value = '';
//   addr.value = '';
// }

// 회원가입 버튼 클릭 시 회원가입 함수 호출
const handleSignup = async () => {
  isLoading.value = true;  // 서버 요청 시작지점
  const { data, error } = await supabase.auth.signUp({ 
    email: email.value,
    password: password.value,
  });  

  if (error) {
    console.log(error)
  } else {
    console.log('회원가입 성공');
    const { error } = await supabase.from('user_table').insert({
      tel: tel.value,
      text: text.value,
      name: name.value,
      addr: addr.value,
    })
    if (error) {
      console.log(error)
    }else {
      alert('회원가입 성공');
      isLoading.value = false;  // 서버 요청 완료지점
      router.push('/');
    }
    // resetForm();
  }  
}

</script>

<style scoped lang="scss">
  @import '../assets/scss/form.scss';
</style>