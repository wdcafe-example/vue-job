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
  // import supabase from '../supabase';
  // import { ref, onMounted } from 'vue';
  // import { Icon } from '@iconify/vue';
  // import { useRouter } from 'vue-router';

  // const router = useRouter();


  // 로그인 여부 - 화면 표시 상태 변수
  // const isLogin = ref(false);   

  // 입력 항목
  // const title = ref('');
  // const todo = ref('');
  // const pay_rule = ref('');
  // const pay = ref('');
  // const desc = ref('');
  // const company_name = ref('');
  // const location = ref('');
  // const tel = ref('');

  // 마운트시 로그인 상태 확인  <= 인증 확인은 외부 모듈로 만들어 호출 처리할 것임1
  // onMounted(async () => {
  //   const { data: { user } } = await supabase.auth.getUser();
    
  //   if (user) { 
  //     console.log('로그인 상태');
  //     // console.log(user.email); 
  //     isLogin.value = true;

  //     // 사용자 정보 조회
  //     const { data, error } = await supabase
  //       .from('user_table')
  //       .select()
  //       .eq('id', user.id);

  //   } else {
  //     console.log('로그아웃 상태');
  //     isLogin.value = false;
  //     alert('로그인 후 이용해주세요.');
  //     router.push('/');
  //   }
  // });

  // 외부 모듈로 만든 인증처리 호출 처리하기
  import { useAuth } from '../auth/auth';
  import supabase from '../supabase';
  import { ref, onMounted, onUnmounted } from 'vue';
  import { Icon } from '@iconify/vue';
  import { useRouter } from 'vue-router';

  const router = useRouter();
  const isLoading = ref(false);

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
  // author: 작성자 id(auth.user의 uid) 


  // 파일 정보
  const previewImage = ref(null);
  let file = null;    // 파일객체 저장 변수

  
  // 등록 버튼 클릭 시 처리
  const handleSubmit = async () => {
    // 서버 요청 시작지점
    isLoading.value = true; 

    // 이미지 업로드 처리
    if(previewImage.value) {     // 이미지가 첨부되었으면 업로드 처리
      await uploadImage();
    }

    // job_posts 테이블 수정
    const { error } = await supabase
    .from('job_posts')
    .insert({ 
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

    if(error) {
      alert(error.message);
    } else {
      alert('등록 성공!');
      router.push('/job-list');
    }

    // 서버 요청 완료지점
    isLoading.value = false;
  }


  // 파일 업로드 처리
  const onFileChange = (e) => {
    // 이미지 파일 경로 저장 변수는 업로드 함수에서도 사용 가능하게 전역변수로 선언
    file = e.target.files[0];    
    console.log('파일 정보 : ', file);

    if(file) {
      previewImage.value = URL.createObjectURL(file); // 파일 정보를 이미지 파일로 변환
      console.log('파일 정보 : ', previewImage.value);
    }
  }

  // 이미지 스토리지 업로드 처리
  const uploadImage = async () => {
    const { data, error } = await supabase
      .storage
      .from('images')  // 업로드 버킷 이름
      // upload(파일명, 파일객체, 옵션)
      .upload(file.name, file, {
        cacheControl: '3600',     // 캐시 제어 시간 3600초 (캐쉬설정)
        upsert: false             // 이미 존재하는 파일이면 업로드 하지 않음 (덮어쓰기 허용 여부)
      });

    if(error) {
      alert(error.message);
    } else {      
      console.log('uploaded file : ', data);
      // 이미지 URL 가져오기
      const { data:imgData } = supabase
        .storage
        .from('images')
        .getPublicUrl(file.name);

      console.log('이미지 URL : ', imgData.publicUrl);  // 이미지 URL 출력

      // 테이블에 저장할 변수 : 이미지 URL을 변수(img_url)에 저장
      img_url.value = imgData.publicUrl;
    }
  }

  // 마운트시 로그인 상태 확인
  onMounted(async () => {
    await checkLoginStatus();
    // console.log('auth 정보 : ', isLogin.value, user.value);
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