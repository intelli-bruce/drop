# 책 검색 API 통합 - 남은 작업

> 작성일: 2026-01-09

## 완료된 작업

- [x] 통합 검색 타입 정의 (`BookSearchResult`, `BookSearchResponse`)
- [x] 네이버 책 API 유틸리티 구현 (`naver-books-utils.ts`)
- [x] 카카오 책 API 유틸리티 구현 (`kakao-books-utils.ts`)
- [x] Google Books API 유틸리티 구현 (`google-books-utils.ts`)
- [x] 통합 검색 서비스 구현 (`book-search-service.ts`)
- [x] IPC 핸들러 추가 (`books:search`, `books:getAvailableSources`)
- [x] Preload API 노출 (`window.api.books`)
- [x] Vite 환경변수 설정 추가

## 남은 작업

### 1. API 키 발급 및 설정

#### 카카오 REST API 키
1. [Kakao Developers](https://developers.kakao.com) 접속
2. 기존 앱 선택 또는 새 앱 생성
3. 앱 키 → **REST API 키** 복사
4. `.env.localdev`에 추가:
   ```env
   KAKAO_REST_API_KEY=발급받은_REST_API_키
   ```

#### 네이버 검색 API
1. [Naver Developers](https://developers.naver.com) 접속
2. 애플리케이션 등록 → 검색 API 선택
3. Client ID / Client Secret 복사
4. `.env.localdev`에 추가:
   ```env
   NAVER_CLIENT_ID=발급받은_Client_ID
   NAVER_CLIENT_SECRET=발급받은_Client_Secret
   ```

#### Google Books API (선택)
1. [Google Cloud Console](https://console.cloud.google.com) 접속
2. API 및 서비스 → 라이브러리 → Books API 활성화
3. 사용자 인증 정보 → API 키 생성
4. `.env.localdev`에 추가:
   ```env
   GOOGLE_BOOKS_API_KEY=발급받은_API_키
   ```
> 참고: Google Books API는 키 없이도 일일 1,000회까지 사용 가능

### 2. UI 수정 (선택)

현재 `BookSearchDialog.tsx`는 알라딘 API만 사용 중.
통합 검색으로 변경하려면:

```typescript
// 기존
const results = await window.api.aladin.search(query)

// 변경
const response = await window.api.books.search(query)
const results = response.results
```

### 3. 환경변수 현재 상태

```env
# 알라딘 (설정됨)
ALADIN_TTB_KEY=ttbwhdtmek1023001

# 네이버 (발급 필요)
NAVER_CLIENT_ID=
NAVER_CLIENT_SECRET=

# 카카오 (REST API 키 필요)
KAKAO_REST_API_KEY=

# Google Books (선택)
GOOGLE_BOOKS_API_KEY=
```

## 파일 구조

```
apps/desktop/src/main/
├── aladin-utils.ts          # 알라딘 API (기존)
├── naver-books-utils.ts     # 네이버 API (신규)
├── kakao-books-utils.ts     # 카카오 API (신규)
├── google-books-utils.ts    # Google Books API (신규)
└── book-search-service.ts   # 통합 검색 서비스 (신규)
```

## 사용법

```typescript
// 통합 검색 (모든 소스)
const result = await window.api.books.search('해리포터')

// 특정 소스만
const result = await window.api.books.search('Harry Potter', {
  sources: ['google'],
  preferKorean: false
})

// 사용 가능한 소스 확인
const sources = await window.api.books.getAvailableSources()
// => ['aladin', 'google'] (키가 없는 소스는 제외됨)
```
