# PRD — Throw

> "생각을 떠올리는 즉시 어디서든 기록하고, 하나의 공간에서 관리"

---

## 1. Product Overview

| 항목 | 내용 |
|------|------|
| 제품명 | Throw |
| 구성요소 | iOS/Android (Flutter), Desktop (Electron), Supabase Backend |
| 핵심 가치 | Markdown 노트 + 실시간 동기화 |
| 목표 사용자 | 빠른 기록 + 멀티 디바이스 사용자 |
| 제품 원칙 | 빠름 · 단순 · Supabase SSoT |

---

## 2. Tech Stack

| 영역 | Mobile (Flutter) | Desktop (Electron) |
|------|------------------|-------------------|
| Framework | Flutter 3.x | Electron + React |
| Language | Dart | TypeScript |
| State | Riverpod | Zustand |
| Editor | WebView + Lexical | Lexical |
| Audio/STT | record + Whisper API | - |

**Backend (SSoT)**: Supabase (PostgreSQL + Realtime + Storage)

---

## 3. Data Model

### 3.1 아키텍처

```
[Mobile/Desktop App] → [Supabase JS Client] → [Supabase (SSoT)]
                                                    ├── PostgreSQL
                                                    ├── Storage (첨부파일)
                                                    └── Realtime (실시간 동기화)
```

- **SSoT (Single Source of Truth)**: 모든 데이터는 Supabase에 직접 저장
- **Realtime**: Supabase Realtime으로 디바이스 간 실시간 동기화
- **Storage**: 첨부파일은 Supabase Storage에 저장

### 3.2 Schema

```sql
CREATE TABLE notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    source TEXT NOT NULL CHECK (source IN ('mobile', 'desktop', 'web')),
    is_deleted BOOLEAN DEFAULT FALSE
);

CREATE TABLE attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('image', 'audio', 'video', 'file')),
    storage_path TEXT NOT NULL,  -- Supabase Storage path
    filename TEXT,
    mime_type TEXT,
    size INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE note_tags (
    note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (note_id, tag_id)
);
```

---

## 4. Features

### Mobile
- 텍스트/음성 노트 (Whisper STT)
- 이미지, 오디오, 비디오 첨부
- Markdown 편집, 태그

### Desktop
- 날짜별 노트 피드 (무한 스크롤)
- Lexical 에디터 (Markdown 지원)
- 이미지/비디오 붙여넣기 (Cmd+V)
- 태그 필터, 검색

---

## 5. MVP Scope (v1.0)

### Phase 1: Desktop
- [x] Electron + React + Lexical 세팅
- [x] Supabase 연동 (SSoT)
- [x] 노트 CRUD + Realtime 동기화
- [ ] 첨부파일 업로드 (Storage)

### Phase 2: Mobile
- [ ] Flutter 세팅
- [ ] Supabase 연동
- [ ] 노트 목록/상세 화면
- [ ] 음성 녹음 + Whisper STT
- [ ] 이미지, 비디오 첨부

### Phase 3: Polish
- [ ] 태그, 검색
- [ ] UI/UX 개선

### v2
- 사용자 인증
- iOS/Android 위젯

---

## 6. KPIs

| 목표 | 지표 |
|------|------|
| 빠른 기록 | 노트 생성 < 3초 |
| STT 정확도 | Whisper 성공률 95%+ |
| 실시간 동기화 | 디바이스 간 반영 < 3초 |
| 앱 안정성 | Crash-free rate 99%+ |

---

*Last Updated: 2025-12-21*
