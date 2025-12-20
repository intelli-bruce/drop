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
| 제품 원칙 | 빠름 · 단순 · 오프라인 우선 |

---

## 2. Tech Stack

| 영역 | Mobile (Flutter) | Desktop (Electron) |
|------|------------------|-------------------|
| Framework | Flutter 3.x | Electron + React |
| Language | Dart | TypeScript |
| State | Riverpod | Zustand |
| Local DB | Isar | better-sqlite3 |
| Editor | WebView + CodeMirror 6 | CodeMirror 6 + Vim |
| Audio/STT | record + Whisper API | - |

**Backend**: Supabase (PostgreSQL + Realtime + Storage)

---

## 3. Data Model

```sql
CREATE TABLE notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    source TEXT NOT NULL CHECK (source IN ('mobile', 'desktop', 'web')),
    is_deleted BOOLEAN DEFAULT FALSE
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
- 오프라인 → 온라인 동기화

### Desktop
- 날짜별 노트 피드 (무한 스크롤)
- CodeMirror 6 에디터 (Vim 모드, 인라인 미디어)
- 이미지/비디오 붙여넣기 (Cmd+V)
- 태그 필터, 검색
- Vim 키바인딩

---

## 5. MVP Scope (v1.0)

### Phase 1: Desktop
- [ ] Electron + React + CodeMirror 6 세팅
- [ ] 로컬 SQLite + 노트 CRUD
- [ ] Markdown 에디터 (Vim 모드, 인라인 미디어)
- [ ] Supabase 동기화

### Phase 2: Mobile
- [ ] Flutter + Isar 세팅
- [ ] 노트 목록/상세 화면
- [ ] 음성 녹음 + Whisper STT
- [ ] 이미지, 비디오 첨부
- [ ] Supabase 동기화

### Phase 3: Polish
- [ ] 태그, 검색
- [ ] 오프라인 테스트

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
