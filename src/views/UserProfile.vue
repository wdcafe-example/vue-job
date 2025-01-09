<template>  
  <div class="form-container" v-if="isLogin">
    <div class="top-info-box">
      <div class="top-info-box-left">
        <img src="/vite.svg" alt="profile-img">
      </div>
      <div class="top-info-box-right">
        <span class="name">{{ name }}</span>
        <address class="addr">{{ addr }}</address>
      </div>
    </div>

    <div class="text-info">
      <h4>자기소개</h4>
      <p>{{ text }}</p>
    </div>
    <p><button @click="handleLogout" class="logout-btn">로그아웃</button></p>

    <details class="job-list">
      <summary>지원한 목록</summary>
      <p v-for="job in job_apply_list" :key="job.id">
        <span>[지원완료] {{ job.job_title }}</span>
        <time>{{ new Date(job.created_at).toLocaleDateString() }}</time>
      </p>
    </details>
    <details class="job-list">
      <summary>받은 지원내역</summary>
      <p v-for="job in job_apply_list" :key="job.id">
        <span>{{ job.applicant_name }}님이 <q>{{ job.job_title }}</q>에 지원했습니다.</span>
        <time>{{ new Date(job.created_at).toLocaleDateString() }}</time>
      </p>
    </details>
  </div>
</template>

<script setup>
  import { useAuth } from '../auth/auth';
  import supabase from '../supabase';
  import { onMounted, ref } from 'vue';
  import { useRouter } from 'vue-router';

  const { isLogin, user, checkLoginStatus } = useAuth(); // 로그인 상태 확인 함수 가져오기
  const router = useRouter();
  // const isLogin = ref(false);   // 로그인 상태 여부  


  const name = ref('');
  const addr = ref('');
  const text = ref('');

  const job_apply_list = ref([]);
  const job_recieve_list = ref([]);

  // 지원하기 목록 함수
  const getJobApplyList = async () => {
    const { data, error } = await supabase
      .from('job_apply_list')
      .select()
      .eq('applicant_id', user.value.id);

    if(error) {
      alert('지원하기 목록 조회 실패');
    } else {
      job_apply_list.value = data;
      console.log(job_apply_list.value); 
    }
  }

  // 받은 지원내역 가져오는 함수
  const getRecieveList = async () => {
    const { data, error } = await supabase
      .from('job_apply_list')
      .select()
      .eq('employer_id', user.value.id)
    
      if(error) {
        alert('받은 지원내역 가져오기 실패');
      } else {
        job_recieve_list.value = data;
        console.log('job_recieve_list:', job_recieve_list.value);
      }  
  }


  // 마운트시 로그인 상태 확인
  onMounted(async () => {
    // const { data: { user } } = await supabase.auth.getUser();
    // // console.log(user?.email);
    
    // if (user) { 
    //   console.log('로그인 상태');
    //   // console.log(user.email); 
    //   isLogin.value = true;

    //   // 사용자 정보 조회
    //   const { data, error } = await supabase
    //     .from('user_table')
    //     .select()
    //     .eq('id', user.id);

    //   if(data) {
    //     // console.log('사용자 정보 : ', data);
    //     name.value = data[0].name;
    //     addr.value = data[0].addr;
    //     text.value = data[0].text;
    //   }

    // } else {
    //   console.log('로그아웃 상태');
    //   isLogin.value = false;
    //   alert('로그인 후 이용해주세요.');
    //   router.push('/');
    // }


    await checkLoginStatus();
    await getJobApplyList();
    await getRecieveList();

    // 사용자 정보 조회
    const { data, error } = await supabase
      .from('user_table')
      .select()
      .eq('id', user.value.id)
      .single();

      console.log('user_table', data);
      name.value = data.name;
      addr.value = data.addr;
      text.value = data.text; 
  });

  // 로그아웃 함수
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if(error) {
      alert('로그아웃 실패');
    } else {
      alert('로그아웃 성공');
      router.push('/');
    }
  }

</script>

<style lang="scss" scoped>
  .form-container{
    padding: 20px;

    .top-info-box {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 20px 0 50px;

      >div:first-child{flex: 0 0 70px}
      >div:last-child{
        flex: 1;

        .name{
          font-size: 18px;
          font-weight: 700;
        }

        .addr{
          font-style: normal;
          color: #666;
        }
      }
    }

    .text-info{
      margin-top: 20px;
      
      h4{
        margin-bottom: 10px;
      }
      
      p{
        border: 1px solid #ccc;
        padding: 20px;
        margin-top: 10px;
        border-radius: 7px;
      }
    }

    >p{
      text-align: center;
      margin-top: 10px;
      
      // 버튼 디자인
      button { 
        background: transparent;
        color: var(--main-color);
        font-size: 16px;
        margin-top: 40px;
        border: none;
        &:hover{
          opacity: 0.7;
          text-decoration: underline;
        }
      } 
    }

    .job-list {
      list-style-type: none;
      font-size: 14px;
      padding: 1rem 0;
      
      summary {
        font-size: 16px;
        font-weight: bold;
        margin-bottom: 10px;
        padding-bottom: 10px;
        border-bottom: 1px solid #d9d9d9;
      }

      p {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
        time {
          color: #777;
          font-size: 12px;
          font-weight: 400;
          width: 10em;
          // outline: 1px solid red;
          text-align: right;
        }
      }

      q { font-weight: bold;}
    }
  }
</style>