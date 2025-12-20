# PRD — Throw

> "생각을 떠올리는 즉시 어디서든 기록하고, 하나의 공간에서 관리"

---

## 1. Product Overview

| 항목 | 내용 |
|------|------|
| 제품명 | Throw |
| 구성요소 | iOS/Android App (Flutter), Desktop App (Electron), Supabase Backend |
| 핵심 가치 | 블록 기반 노트 + 실시간 동기화 |
| 목표 사용자 | 빠른 기록 + 멀티 디바이스 사용자 |
| 제품 원칙 | 빠름 · 단순 · 오프라인 우선 · 단일 소스 |

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Supabase Cloud                               │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  PostgreSQL                                              │    │
│  │  - notes (노트 메타데이터)                                │    │
│  │  - note_blocks (블록 컨텐츠)                             │    │
│  │  - tags, note_tags (태그)                                │    │
│  └─────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Storage                                                 │    │
│  │  - 이미지, 오디오, 비디오 파일                            │    │
│  └─────────────────────────────────────────────────────────┘    │
│                            │                                     │
│                    Realtime Subscriptions                        │
└────────────────────────────┼─────────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│ Flutter Mobile│    │   Electron    │    │  (Future)     │
│  (iOS/Android)│    │  (Mac/Win)    │    │   Web App     │
│               │    │               │    │               │
│  Hive/Isar    │    │  SQLite       │    │  IndexedDB    │
│  (로컬 캐시)   │    │  (로컬 캐시)   │    │  (로컬 캐시)   │
│               │    │               │    │               │
│  음성/텍스트   │    │  TipTap       │    │               │
│  미디어 첨부   │    │  Block Editor │    │               │
└───────────────┘    └───────────────┘    └───────────────┘
```

---

## 3. Tech Stack

### Backend (공통)

| 영역 | 기술 |
|------|------|
| Database | Supabase PostgreSQL |
| Realtime | Supabase Realtime |
| Storage | Supabase Storage |
| Authentication | Anonymous (v1), Supabase Auth (v2) |
| Sync Strategy | Offline-first + Last-write-wins |

### Mobile App (Flutter)

| 영역 | 기술 |
|------|------|
| Framework | Flutter 3.x |
| Language | Dart |
| State Management | Riverpod / Bloc |
| Local Storage | Isar (NoSQL) or Drift (SQLite) |
| Audio | just_audio + record |
| STT | OpenAI Whisper API |
| Network | supabase_flutter |
| Editor | flutter_quill 또는 WebView + TipTap |
| Minimum iOS | 14.0+ |
| Minimum Android | API 24+ (Android 7.0) |

### Desktop App (Electron)

| 영역 | 기술 |
|------|------|
| Framework | Electron + React/Vue |
| Language | TypeScript |
| State Management | Zustand / Pinia |
| Local Storage | better-sqlite3 |
| Editor | TipTap (ProseMirror 기반) |
| Network | @supabase/supabase-js |
| Build | electron-builder |
| Minimum macOS | 11.0+ |
| Minimum Windows | 10+ |

---

## 4. Data Model

### 4.1 Supabase Schema

```sql
-- 노트 메타데이터
CREATE TABLE notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    source TEXT NOT NULL CHECK (source IN ('mobile', 'desktop', 'web')),
    device_id TEXT,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- 블록 기반 컨텐츠
CREATE TABLE note_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES note_blocks(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('text', 'image', 'audio', 'video')),
    content TEXT,
    storage_path TEXT,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    version INTEGER NOT NULL DEFAULT 1
);

-- 태그
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 노트-태그 연결
CREATE TABLE note_tags (
    note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (note_id, tag_id)
);

-- 인덱스
CREATE INDEX idx_notes_created_at ON notes(created_at DESC);
CREATE INDEX idx_notes_is_deleted ON notes(is_deleted);
CREATE INDEX idx_note_blocks_note_id ON note_blocks(note_id);
CREATE INDEX idx_note_blocks_parent_id ON note_blocks(parent_id);
```

### 4.2 Flutter Model (Dart)

```dart
// Isar 또는 Drift 기반
@collection
class Note {
  Id id = Isar.autoIncrement;

  @Index(unique: true)
  late String uuid;

  late DateTime createdAt;
  late DateTime updatedAt;
  late String source;
  String? deviceId;
  late bool isDeleted;
  late String syncStatus; // pending | synced | conflict

  final blocks = IsarLinks<NoteBlock>();
  final tags = IsarLinks<Tag>();
}

@collection
class NoteBlock {
  Id id = Isar.autoIncrement;

  @Index(unique: true)
  late String uuid;

  late String noteId;
  String? parentId;
  late String type; // text | image | audio | video
  String? content;
  String? storagePath;
  late int position;
  late DateTime createdAt;
  late DateTime updatedAt;
  late int version;
  late String syncStatus;
}
```

### 4.3 Electron Model (TypeScript)

```typescript
// SQLite + Drizzle ORM
interface Note {
  id: string;          // UUID
  createdAt: Date;
  updatedAt: Date;
  source: 'mobile' | 'desktop' | 'web';
  deviceId?: string;
  isDeleted: boolean;
  syncStatus: 'pending' | 'synced' | 'conflict';
}

interface NoteBlock {
  id: string;          // UUID
  noteId: string;
  parentId?: string;
  type: 'text' | 'image' | 'audio' | 'video';
  content?: string;
  storagePath?: string;
  position: number;
  createdAt: Date;
  updatedAt: Date;
  version: number;
  syncStatus: 'pending' | 'synced' | 'conflict';
}
```

---

## 5. Block Editor

### 5.1 Desktop (TipTap)

TipTap은 ProseMirror 기반의 headless 에디터로, 블록 에디터 구현에 적합.

```typescript
// TipTap Block Schema
const editor = useEditor({
  extensions: [
    StarterKit,
    Placeholder.configure({ placeholder: '메모를 입력하세요...' }),
    Image,
    // Custom blocks
    AudioBlock,
    VideoBlock,
  ],
  onUpdate: ({ editor }) => {
    // 블록 변경 시 로컬 저장 + sync
    saveBlocks(editor.getJSON());
  },
});
```

**키보드 동작**

| 키 | 동작 |
|----|------|
| Enter | 새 블록 생성 |
| Backspace (빈 블록) | 블록 삭제, 이전 블록으로 이동 |
| Backspace (시작점) | 이전 블록과 병합 |
| ↑/↓ | 블록 간 이동 |
| Cmd+V (이미지) | 이미지 블록 삽입 |
| Escape | 편집 종료 |

### 5.2 Mobile (Flutter)

옵션 A: **flutter_quill** (네이티브 위젯)

- 장점: 네이티브 성능, 커스터마이징 가능
- 단점: 블록 에디터로 확장 어려움

옵션 B: **WebView + TipTap** (하이브리드)

- 장점: Desktop과 에디터 코드 공유
- 단점: WebView 성능 이슈, 네이티브 느낌 부족

**권장: 옵션 B (WebView + TipTap)**

- 에디터 로직 통일
- 유지보수 용이

---

## 6. Feature Spec

### 6.1 Mobile (Flutter)

| 기능 | 설명 |
|------|------|
| 텍스트 노트 | 텍스트 블록 입력 |
| 음성 노트 | 녹음 → Whisper STT → 텍스트 변환 |
| 미디어 첨부 | 이미지, 오디오 첨부 |
| 블록 편집 | Enter로 블록 분리, Backspace로 병합 |
| 태그 | 노트에 태그 추가/관리 |
| 오프라인 | 오프라인 작성 → 온라인 시 동기화 |

### 6.2 Desktop (Electron)

| 기능 | 설명 |
|------|------|
| 노트 피드 | 날짜별 노트 목록 (무한 스크롤) |
| 블록 에디터 | TipTap 기반 Notion 스타일 에디터 |
| 이미지 붙여넣기 | Cmd+V로 이미지 삽입 |
| 태그 필터 | 태그로 노트 필터링 |
| 검색 | 전체 텍스트 검색 |
| 키보드 내비게이션 | j/k로 노트 이동, Enter로 편집 |

---

## 7. Sync Strategy

### 7.1 Offline-First

```
[사용자 액션]
      │
      ▼
[로컬 DB 저장] (syncStatus = pending)
      │
      ▼
[온라인 확인]
      │
      ├─ YES → Supabase Push → syncStatus = synced
      │
      └─ NO → 대기 (네트워크 복구 시 재시도)
```

### 7.2 Realtime Subscription

```typescript
// Electron
supabase
  .channel('notes')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'notes' },
    (payload) => handleNoteChange(payload))
  .on('postgres_changes', { event: '*', schema: 'public', table: 'note_blocks' },
    (payload) => handleBlockChange(payload))
  .subscribe();
```

```dart
// Flutter
supabase
  .from('notes')
  .stream(primaryKey: ['id'])
  .listen((data) => handleNoteChange(data));
```

---

## 8. Project Structure

```
throw/
├── mobile/                       # Flutter App
│   ├── lib/
│   │   ├── main.dart
│   │   ├── models/
│   │   │   ├── note.dart
│   │   │   ├── note_block.dart
│   │   │   └── tag.dart
│   │   ├── providers/            # Riverpod providers
│   │   ├── screens/
│   │   │   ├── home_screen.dart
│   │   │   ├── note_detail_screen.dart
│   │   │   └── recording_screen.dart
│   │   ├── services/
│   │   │   ├── supabase_service.dart
│   │   │   ├── sync_service.dart
│   │   │   ├── storage_service.dart
│   │   │   └── whisper_service.dart
│   │   └── widgets/
│   │       ├── block_editor.dart
│   │       ├── note_card.dart
│   │       └── audio_player.dart
│   ├── pubspec.yaml
│   └── README.md
│
├── desktop/                      # Electron App
│   ├── src/
│   │   ├── main/                 # Electron main process
│   │   │   ├── index.ts
│   │   │   └── ipc.ts
│   │   ├── renderer/             # React/Vue frontend
│   │   │   ├── App.tsx
│   │   │   ├── components/
│   │   │   │   ├── NoteList.tsx
│   │   │   │   ├── NoteCard.tsx
│   │   │   │   └── BlockEditor.tsx
│   │   │   ├── hooks/
│   │   │   ├── stores/
│   │   │   └── services/
│   │   │       ├── supabase.ts
│   │   │       ├── sync.ts
│   │   │       └── db.ts
│   │   └── shared/               # 공유 타입/유틸
│   │       ├── types.ts
│   │       └── constants.ts
│   ├── package.json
│   └── electron-builder.yml
│
├── editor/                       # 공유 에디터 (WebView용)
│   ├── src/
│   │   ├── index.ts
│   │   ├── extensions/
│   │   │   ├── audio-block.ts
│   │   │   └── image-block.ts
│   │   └── styles/
│   ├── package.json
│   └── vite.config.ts
│
├── supabase/
│   ├── config.toml
│   └── migrations/
│       └── 001_initial_schema.sql
│
├── Makefile
└── PRD.md
```

---

## 9. Build Commands

```bash
# Mobile (Flutter)
make mobile-run-ios      # iOS 시뮬레이터 실행
make mobile-run-android  # Android 에뮬레이터 실행
make mobile-build-ios    # iOS 빌드
make mobile-build-apk    # Android APK 빌드

# Desktop (Electron)
make desktop-dev         # 개발 서버 실행
make desktop-build-mac   # macOS 빌드
make desktop-build-win   # Windows 빌드

# Editor (공유)
make editor-dev          # 에디터 개발 서버
make editor-build        # 에디터 번들 빌드

# Supabase
make supabase-start      # 로컬 Supabase 시작
make supabase-stop       # 로컬 Supabase 중지
make supabase-migrate    # 마이그레이션 실행
```

---

## 10. MVP Scope (v1.0)

### Phase 1: Desktop (Electron) - 2주

- [ ] 프로젝트 세팅 (Electron + React + TipTap)
- [ ] 로컬 SQLite DB 설정
- [ ] 블록 에디터 구현 (텍스트, 이미지)
- [ ] 노트 CRUD
- [ ] Supabase 연동 + 동기화
- [ ] 키보드 내비게이션

### Phase 2: Mobile (Flutter) - 2주

- [ ] 프로젝트 세팅 (Flutter + Isar)
- [ ] 노트 목록/상세 화면
- [ ] WebView 에디터 연동
- [ ] 음성 녹음 + Whisper STT
- [ ] 이미지 첨부
- [ ] Supabase 동기화

### Phase 3: Polish - 1주

- [ ] 태그 시스템
- [ ] 검색 기능
- [ ] 오프라인 모드 테스트
- [ ] 버그 수정

### 제외 (v2)

- [ ] 사용자 인증
- [ ] 비디오 첨부
- [ ] Apple Watch
- [ ] AI 요약/태그 자동 추출
- [ ] Windows 빌드

---

## 11. 기술 선택 이유

### Why Electron (Desktop)?

| 문제 | 해결 |
|------|------|
| SwiftUI NSTextView 포커스 충돌 | Web 텍스트 에디팅은 성숙함 |
| 블록 에디터 직접 구현 어려움 | TipTap/ProseMirror 사용 |
| 레퍼런스 부족 | Notion, Obsidian 등 선례 많음 |

### Why Flutter (Mobile)?

| 문제 | 해결 |
|------|------|
| iOS/Android 둘 다 지원 필요 | 코드 공유 |
| 음성 녹음/STT | 네이티브 플러그인 성숙 |
| 오프라인 우선 | Isar/Drift 로컬 DB 지원 좋음 |

### Why 분리? (Flutter Desktop 안 쓰는 이유)

- Flutter Desktop 텍스트 에디팅도 미성숙
- super_editor 등 아직 production-ready 아님
- 에디터만큼은 웹 기술이 압도적으로 우위

---

## 12. KPIs

| 목표 | 지표 |
|------|------|
| 빠른 기록 | 노트 생성 < 3초 |
| 정확한 STT | Whisper 성공률 95%+ |
| 실시간 동기화 | 변경 → 다른 디바이스 반영 < 3초 |
| 오프라인 | 오프라인 작업 → 온라인 복구 시 100% 동기화 |
| 앱 안정성 | Crash-free rate 99%+ |

---

*Last Updated: 2024-12-20*

