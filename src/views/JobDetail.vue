<template>
  <div class="job-detail-container" v-if="isLogin && post">
    <figure v-if="post.img_url">
      <img :src="post.img_url" alt="head image">
    </figure>

    <!-- 구인 상세 정보 -->
    <div class="job-detail-info" v-if="post">
      <h2>{{ post.title }}</h2>
      <p class="top_info">
        {{ post.company_name }}
        <span>&middot;</span>
        {{ post.location }}
      </p>
      <p class="pay">
        {{ post.pay_rule }}: <b>{{ post.pay.toLocaleString() }}</b>
      </p>
      <div class="desc">
        <h4>[ 지원 자격 ]</h4>
        <!-- 텍스트 박스 내용 수정처리가 안되게 처리 (disabled) -->
        <textarea class="desc" rows="8" disabled v-text="post.desc"></textarea>
      </div>
    </div>

    <!-- 하단 고정 버튼 -->
    <div class="bottom-btn-group" v-if="post && user.id !== post.author">
      <a class="btn-tel" :href="`tel:${post.tel}`">전화문의</a>
      <button class="btn-apply" @click="handleApply" v-if="!isApplied">지원하기</button>
      <button class="btn-apply-disable" v-if="isApplied">지원완료</button>
    </div>
    <div class="bottom-btn-group" v-if="post && user.id === post.author">
      <router-link :to="`/job-post-update/${post.id}`" class="btn-edit">수정</router-link>
      <button class="btn-delete" @click="handleDelete">삭제</button>
    </div>
  </div>
</template>

<script setup>
  import { useAuth } from '../auth/auth';
  import { useRoute, useRouter } from 'vue-router';
  import supabase from '../supabase';
  import { ref, onMounted } from 'vue';

  const { isLogin, user, checkLoginStatus } = useAuth(); // 로그인 상태 확인 함수 가져오기
  const route = useRoute();
  const router = useRouter();
  // console.log(route.params.id);

  const id = route.params.id;
  const post = ref(null);         // 글 데이터 저장 변수
  const isApplied = ref(false);   // 지원 여부 확인 변수


  // 지원 내역 조회 함수
  const checkApply = async () => {
    const { data, error } = await supabase
      .from('job_apply_list')
      .select()
      .eq('applicant_id', user.value.id)
      .eq('post_id', id);

    if(error) {
      alert('지원 내역 조회 실패!');
      return;
    } 

    if(data.length > 0) {
      isApplied.value = true;
    }
  }


  // 지원하기 처리 함수
  const handleApply = async () => {
    
    // 유저데이터에서 이름과 전화번호 가져오기(user_info 테이블에서 가져 옴)
    const { data, error } = await supabase
      .from('user_table')
      .select()
      .eq('id', user.value.id)
      .single();

      if(error) {
        alert('유저 정보 가져오기 실패!');
        return;
      }

    console.log( '유저 정보: ', data);

    // 지원 내역 저장 : 변수명 충돌방지를 위해 'err'로 변경
    const { error: err } = await supabase
      .from('job_apply_list')
      .insert({
        job_title: post.value.title,        // 글 제목
        employer_id: post.value.author,     // 고용주 : 글 작성자 ID
        applicant_id: user.value.id,        // 지원자 : 현재 로그인한 사용자 ID
        applicant_name: data.name,          // 지원자 : 현재 로그인한 사용자 이름
        applicant_tel: data.tel,            // 지원자 : 현재 로그인한 사용자 전화번호
        post_id: post.value.id              // 고용주가 게시한 글 ID 
      });

    if(err) {
      alert('지원 내역 저장 실패!');
    } else {
      alert('지원 내역 저장 성공!');
      router.push('/job-list');
    }

    // 지원 완료시 글목록으로 이동
    router.push('/job-list');
  }


  // 이미지 삭제 함수
  const deleteImage = async () => {
    if(post.value.img_url) {
      const { data, error } = await supabase
        .storage
        .from('images')
        .remove([post.value.img_url.split('/').pop()]); // 파일명만 추출

      if(error) {
        alert('이미지 삭제 실패!');
      } 
    }
  }


  // 삭제 버튼 클릭 시 처리
  const handleDelete = async () => {
    // 삭제 확인 창 표시
    const conf = confirm('정말로 삭제하시겠습니까?');
    if(!conf) return;  // 삭제 취소 시 처리 종료

    // 이미지 삭제
    await deleteImage();

    // 서버 요청 처리
    const { error } = await supabase
      .from('job_posts')
      .delete()
      .eq('id', id);

    if(error) {
      alert('글삭제 실패!');
    } else {
      alert('글삭제 성공!');
      router.push('/job-list');
    }
  }

  
  // 구인 상세 정보 불러오기
  onMounted(async () => {
    await checkLoginStatus();  // 로그인 상태 확인

    // 로그인된 사용자만 접근 가능한 데이터 로딩
    if (user.value) {
      const { data, error } = await supabase
        .from('job_posts')
        .select()
        .eq('id', id)
        .single()

      post.value = data;
      console.log(post.value);

      if (error) {
        alert('글 가져오기 실패');
      }
    }

    // 지원 내역 조회
    checkApply();
  });

</script>

<style scoped lang="scss">
figure {
  aspect-ratio: 16 / 9;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.job-detail-info {
  margin-top: 30px;
  padding: 20px;

  h2 {
    font-size: 16px;
    margin-bottom: 5px;
  }

  .top_info {
    font-size: 12px;
    color: #666;
    margin-bottom: 16px;
  }

  .pay {
    font-size: 14px;
    font-weight: bold;
    color: #444;
    padding: 10px 0;
    margin-bottom: 16px;
  }

  .desc {
    width: 100%;
    border: none;
    line-height: 22px;
    margin-bottom: 10px;
    outline: none;
    background: #fff;

    h4 {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 10px;
    }
  }
}

.bottom-btn-group {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  display: flex;
  
  button, .btn-tel, .btn-edit {
    width: 50%;
    border-radius: 0;
    padding-top: 14px;
    padding-bottom: 14px;
    margin: 0;
    cursor: pointer;
    color: #fff;
    font-weight: bold;
    font-size: 14px;
    text-align: center;
    text-decoration: none;
  }
  
  .btn-tel, .btn-edit {
    background-color: var(--main-color-dark);
  }
  
  .btn-apply, .btn-delete {
    background-color: var(--main-color-light);
  }

  .btn-apply-disable {
    background-color: #ccc;
  }
}
</style>