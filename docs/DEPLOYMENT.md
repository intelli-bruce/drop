# DROP 배포 가이드

## 개요

- **Mac (Electron)**: Notarization을 통한 DMG 직접 배포
- **iOS (Flutter)**: TestFlight를 통한 배포

---

## 사전 요구사항

### 인증서 및 자격 증명

1. **Developer ID Application 인증서** (Mac Notarization용)
   - Keychain에 설치 필요
   - 확인: `security find-identity -v -p codesigning | grep "Developer ID"`

2. **Apple Distribution 인증서** (iOS App Store용)
   - Keychain에 설치 필요
   - 확인: `security find-identity -v -p codesigning | grep "Distribution"`

3. **환경 변수** (빌드 시 필요)
   ```
   APPLE_ID=your-apple-id@example.com
   APPLE_APP_SPECIFIC_PASSWORD=<앱 전용 비밀번호>
   APPLE_TEAM_ID=J2Y925QHNV
   ```

### Bundle ID 및 App ID

| 플랫폼 | Bundle ID |
|--------|-----------|
| Mac Desktop | `com.intellieffect.drop.desktop` |
| iOS Mobile | `com.intellieffect.drop.mobile` |
| iOS Widget | `com.intellieffect.drop.mobile.widget` |

### App Groups

- Group ID: `group.com.intellieffect.drop.widget`
- 메인 앱과 위젯이 공유

---

## Mac (Electron) 배포

### 빌드 및 Notarization

```bash
cd apps/desktop

# 환경 변수 설정 후 빌드
APPLE_ID=your-apple-id@example.com \
APPLE_APP_SPECIFIC_PASSWORD=<비밀번호> \
APPLE_TEAM_ID=J2Y925QHNV \
pnpm dist:remote
```

### 출력물

- DMG 파일: `apps/desktop/release/DROP-<version>-arm64.dmg`
- Notarization 자동 완료

### electron-builder 설정 (package.json)

```json
{
  "build": {
    "appId": "com.intellieffect.drop.desktop",
    "mac": {
      "target": "dmg",
      "identity": "Developer Name (J2Y925QHNV)",
      "hardenedRuntime": true,
      "notarize": true
    }
  }
}
```

---

## iOS (Flutter) 배포

### 1. IPA 빌드

```bash
cd apps/mobile

flutter build ipa \
  --dart-define=SUPABASE_URL=https://REDACTED_SUPABASE_HOST \
  --dart-define=SUPABASE_ANON_KEY=<anon_key>
```

### 2. TestFlight 업로드

```bash
xcrun altool --upload-app --type ios \
  -f build/ios/ipa/drop_mobile.ipa \
  -u your-apple-id@example.com \
  -p <앱_전용_비밀번호>
```

### 출력물

- IPA 파일: `apps/mobile/build/ios/ipa/drop_mobile.ipa`
- Archive: `apps/mobile/build/ios/archive/Runner.xcarchive`

---

## Apple Developer 설정 체크리스트

### App Store Connect

- [ ] iOS 앱 등록 (`com.intellieffect.drop.mobile`)
- [ ] Mac 앱 등록 (필요 시)

### Certificates, Identifiers & Profiles

- [ ] Developer ID Application 인증서 (Mac)
- [ ] Apple Distribution 인증서 (iOS)
- [ ] App ID: `com.intellieffect.drop.mobile` (App Groups 활성화)
- [ ] App ID: `com.intellieffect.drop.mobile.widget` (App Groups 활성화)
- [ ] App Group: `group.com.intellieffect.drop.widget`

---

## 문제 해결

### Notarization 실패

1. Developer ID Application 인증서 확인
2. 환경 변수 (APPLE_ID, APPLE_APP_SPECIFIC_PASSWORD, APPLE_TEAM_ID) 확인
3. `hardenedRuntime: true` 설정 확인

### iOS 서명 오류

1. Team ID 일치 확인 (Xcode 프로젝트 vs 인증서)
2. App Groups capability 설정 확인
3. Provisioning Profile 재생성

### App Group 등록 실패

- 이미 사용 중인 ID인 경우 다른 이름 사용
- 예: `group.com.intellieffect.drop.widget`
