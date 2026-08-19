/**
 * userData 경로 결정 (BRU-28).
 *
 * `productName`은 사람이 보는 표시 이름이라 자유롭게 바꿀 수 있어야 하지만,
 * Electron은 앱 이름으로 `userData`(= appData/<app name>) 경로를 정한다.
 * 표시 이름을 DROP → Braindump로 바꾼 순간 저장 경로가 통째로 갈아엎히고
 * Supabase 세션(localStorage)·설정 파일이 사라진다 — 전원 강제 로그아웃이다.
 *
 * 그래서 경로를 표시 이름과 분리해 여기서 고정한다. 이 값은 식별자다. 바꾸지 마라.
 *
 * **값의 출처는 추측이 아니라 실측이다.** 설치본 v1.0.31이 실제로 쓰는 경로를
 * 실행 중인 프로세스의 `--user-data-dir` 인자로 확인했다 (2026-08-20):
 *
 *     ~/Library/Application Support/@drop/desktop        (설치본)
 *     ~/Library/Application Support/@drop/desktop-dev    (dev 실행)
 *
 * 패키지 앱의 이름은 `productName`이 아니라 package.json의 `name`(`@drop/desktop`)으로
 * 잡혀 있었다. `productName`을 근거로 'DROP'을 쓰면 빈 디렉터리를 새로 만들어
 * 세션을 잃는다 — 고치려던 사고를 그대로 되풀이한다.
 */
import { join } from 'path'

/** 기존 설치본이 이미 쓰고 있는 디렉터리. 표시 이름과 무관하게 고정이다. */
export const USER_DATA_DIR_SEGMENTS = ['@drop', 'desktop'] as const

/** dev 실행이 설치본과 세션·캐시를 공유하지 않도록 접미사를 붙인다(기존 dev 경로와 동일). */
export function resolveUserDataDir(appDataDir: string, isPackaged: boolean): string {
  const [scope, dir] = USER_DATA_DIR_SEGMENTS
  return join(appDataDir, scope, isPackaged ? dir : `${dir}-dev`)
}
