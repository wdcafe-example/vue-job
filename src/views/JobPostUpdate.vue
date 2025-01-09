<template>
  <div class="loading_info" v-if="isLoading">
    <p>등록 처리중...</p>
  </div>


  <div class="form-container" v-if="isLogin">
    <form>
      <!-- 1.제목 -->
      <div class="form-group">
        <label for="title">제목</label>
        <input 
          type="text" 
          id="title" 
          required
          placeholder="공고 내용을 요약해 주세요."
          v-model="title"
        >
      </div>

      <!-- 2.하는 일 -->
      <div class="form-group">
        <label for="todo">하는 일</label>
        <input 
          type="text" 
          id="todo" 
          v-model="todo"
          placeholder="해야할 업무를 입력해주세요."
          required
        />
      </div>

      <!-- 3.시급, 월급 항목 선택 -->
      <div class="form-group">
        <input type="radio" id="pay_rule1" name="pay_rule" value="시급" v-model="pay_rule" required>
        <input type="radio" id="pay_rule2" name="pay_rule" value="월급" v-model="pay_rule" required >
        <div class="tab-group">
          <label for="pay_rule1">시급</label>
          <label for="pay_rule2">월급</label>
        </div>
        <!-- 4.금액 입력 -->
        <input 
          type="number" 
          id="pay" 
          placeholder="시급 또는 월급을 입력해주세요."
          v-model="pay" 
          required
        >
      </div>

      <!-- 5.자세한 설명 -->
      <div class="form-group">
        <label for="desc">자세한 설명</label>
        <textarea 
          name="desc" 
          id="desc" 
          v-model="desc"
          rows="4"
          required
          placeholder="구체적인 업무 내용, 근무여건, 지원자가 갖추어야 할 능력 등 우대 사항에 대해 알려주세요."
        ></textarea>
      </div>

      <!-- 6.업체명 -->
      <div class="form-group">
        <label for="company_name">업체명</label>
        <input 
          type="text" 
          id="company_name" 
          v-model="company_name" 
          required
          placeholder="예) 땅콩가게"
        >
      </div>

      <!-- 7.위치(주소) -->
      <div class="form-group">
        <label for="location">위치</label>
        <input 
          type="text" 
          id="location" 
          v-model="location" 
          required 
          placeholder="예) 서울시 강남구 논현동"
        >
      </div>

      <!-- 8.연락처 -->
      <div class="form-group">
        <label for="tel">연락처</label>
        <input type="text" id="tel" v-model="tel" required placeholder="예) 010-1234-5678">
      </div>

      <!-- 9.사진(선택 입력) -->
      <div class="form-group">
        <label for="photo">
          <p class="title">사진(선택)</p>
          <figure>
            <Icon icon="mdi-light:camera" width="64" height="64"  style="color: #1e1e1e;" />
            <img :src="previewImage" alt="미리보기" width="64" height="64" v-if="previewImage" />
            <img src="/box64.jpg" alt="미리보기" width="64" height="64" v-if="!previewImage" />
          </figure>
        </label>
        <input type="file" id="photo" accept="image/*" @change="onFileChange">
      </div>

      <input type="button" class="btn-submit" value="등록하기" @click="handleSubmit">
      <!-- <button class="btn-submit">수정완료</button> -->
    </form>
  </div>
</template>
  
<script setup>
  // 외부 모듈로 만든 인증처리 호출 처리하기
  import { useAuth } from '../auth/auth';
  import supabase from '../supabase';
  import { ref, onMounted, onUnmounted } from 'vue';
  import { Icon } from '@iconify/vue';
  import { useRouter, useRoute } from 'vue-router';

  const router = useRouter();   // 페이지 이동 모듈
  const route = useRoute();     // 현재 페이지 정보 모듈
  const isLoading = ref(false);

  // 현재 페이지 정보 출력
  console.log('현재 페이지 정보 : ', route.params.id);

  // 인증 처리 호출
  const { isLogin, user, checkLoginStatus } = useAuth();

  // 입력 항목
  const title = ref('');
  const todo = ref('');
  const pay_rule = ref('시급');
  const pay = ref('');
  const desc = ref('');
  const company_name = ref('');
  const location = ref('');
  const tel = ref('');
  const img_url = ref(''); // 첨부한 사진은 storage에 저장하고 url을 저장
  const prev_img_url = ref(''); // 이전 이미지 URL 저장
  
  // 파일 정보
  const previewImage = ref(null);
  let file = null;    // 파일객체 저장 변수

  
  // 등록 버튼 클릭 시 처리
  const handleSubmit = async () => {
    // 서버 요청 시작지점
    isLoading.value = true; 

    // 이미지 업로드 처리
    // 기존 이미지 파일과 다른 경유(새로 첨부)
    if(prev_img_url.value) {
      if(!prev_img_url.value.includes(file.name)) {  
        await uploadImage();

        // 기존 이미지 삭제
        const { data, error } = await supabase
          .storage
          .from('images')
          .remove([prev_img_url.value.split('/').pop()]); // 파일명만 추출
      }else {
        // 파일 미첨부시 이전 이미지 사용
        img_url.value = prev_img_url.value;
      }
    } 

    // job_posts 테이블 수정
    const { error } = await supabase
    .from('job_posts')
    .update({ 
      title: title.value,
      todo: todo.value,
      pay_rule: pay_rule.value,
      pay: pay.value,
      desc: desc.value,
      company_name: company_name.value,
      location: location.value,
      tel: tel.value,
      img_url: img_url.value
    })
    .eq('id', route.params.id);

    if(error) {
      alert(error.message);
    } else {
      alert('글수정 성공!');
      router.push('/job-list');
    }

    // 서버 요청 완료지점
    isLoading.value = false;
  }


  // 파일 업로드 처리
  const onFileChange = (e) => {
    file = e.target.files[0];
    // console.log('파일 정보 : ', file);

    if(file) {
      previewImage.value = URL.createObjectURL(file); // 파일 정보를 이미지 파일로 변환
      console.log('파일 정보 : ', previewImage.value);
    }
  }

  // 이미지 업로드 처리
  const uploadImage = async () => {
      const { data, error } = await supabase
        .storage
        .from('images') 
        .upload(file.name, file, {
          cacheControl: '3600',     
          upsert: false             
        });

      if(error) {
        alert(error.message);
      } else {      
        console.log('uploaded file : ', data);
        const { data:imgData } = supabase
          .storage
          .from('images')
          .getPublicUrl(file.name);

        console.log('이미지 URL : ', imgData.publicUrl);  
        img_url.value = imgData.publicUrl;
      }
    }

  // 글 조회
  const getJobPost = async () => {
    const { data, error } = await supabase.from('job_posts').select('*').eq('id', route.params.id).single();
    console.log('글 정보 : ', data);

    // 입력 항목에 조회 결과 반영
    title.value = data.title;
    todo.value = data.todo;
    pay_rule.value = data.pay_rule;
    pay.value = data.pay;
    desc.value = data.desc;
    company_name.value = data.company_name;
    location.value = data.location;
    tel.value = data.tel;
    previewImage.value = data.img_url;
    prev_img_url.value = data.img_url;  // 이전 이미지 URL 저장
  }

  // 마운트시 로그인 상태 확인
  onMounted(async () => {
    await checkLoginStatus();
    // console.log('auth 정보 : ', isLogin.value, user.value);
    getJobPost();
  });

  // 언마운트시 메모리 해제
  onUnmounted(() => {
    console.log('unmounted!'); 

    // 메모리 누수 방지
    if(previewImage.value) {
      URL.revokeObjectURL(previewImage.value);    
    }
  });

</script>
  
<style lang="scss" scoped>
  @import '../assets/scss/form.scss';

  .form-container {
    margin-top: 20px;
    padding-bottom: 50px;

    .tab-group {
      display: flex;
      gap: 15px;
      label { 
        flex: 1;
        border: 1px solid var(--main-color-dark);
        border-radius: 8px;
        text-align: center;
        padding: 12px;
      }
    }

    input[type="radio"] {
        display: none;
    }

    input[type="radio"]:nth-child(1):checked ~ .tab-group label:nth-child(1) {
      background: var(--main-color-dark);
      color: #fff;
    }

    input[type="radio"]:nth-child(2):checked ~ .tab-group label:nth-child(2) {
      background: var(--main-color-dark);
      color: #fff;
    }

    #pay { margin-top: 8px;}

    // for=photo를 가진 form-group의 후손 input의 보더 스타일 제거
    .form-group:has(label[for=photo]) input {
      border: none;
    }

    //file 아이콘
    label[for=photo] {
      figure { 
        display: flex; 
        align-items: center;
        img { 
          border: 1px solid #ccc;
          margin-left: 30px; 
        }
      }
    }
    input[type="file"] {
      display: none;
    }

    .btn-submit {
      color: #fff;
      background: var(--main-color-light);
    }

    .form-group:has(label[for=photo]) {
      padding-bottom: 25px;
      border-bottom: 5px solid #ccc;
    }

  }


</style>