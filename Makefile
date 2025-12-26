.PHONY: install rebuild dev dev-local dev-remote build build-local build-remote test clean \
        mobile-setup mobile-dev mobile-dev-remote mobile-build mobile-analyze mobile-test mobile-codegen mobile-clean

# 의존성 설치
install:
	pnpm install --ignore-scripts

# better-sqlite3를 Electron용으로 재빌드
rebuild:
	cd node_modules/better-sqlite3 && \
	HOME=~/.electron-gyp npx node-gyp rebuild --release \
		--target=33.4.3 \
		--arch=arm64 \
		--dist-url=https://electronjs.org/headers

# 설치 + 재빌드 (최초 세팅)
setup: install rebuild

# 개발 서버 실행 (로컬 Supabase)
dev:
	pnpm dev

# 개발 서버 실행 (로컬 Supabase)
dev-local:
	pnpm dev:local

# 개발 서버 실행 (리모트 Supabase)
dev-remote:
	pnpm dev:remote

# 프로덕션 빌드
build:
	pnpm build

# 빌드 (로컬 Supabase 설정)
build-local:
	pnpm build:local

# 빌드 (리모트 Supabase 설정)
build-remote:
	pnpm build:remote

# 테스트 실행
test:
	pnpm test

# database 패키지 테스트
test-db:
	pnpm --filter @drop/database test

# 빌드 산출물 정리
clean:
	rm -rf node_modules
	rm -rf apps/*/node_modules apps/*/out apps/*/dist
	rm -rf packages/*/node_modules packages/*/dist

# ============================================
# Mobile (Flutter)
# ============================================

# Flutter 의존성 설치 + 코드 생성
mobile-setup:
	cd apps/mobile && flutter pub get && dart run build_runner build --delete-conflicting-outputs

# Flutter 개발 서버 (로컬 Supabase)
mobile-dev:
	cd apps/mobile && flutter run \
		--dart-define=SUPABASE_URL=http://127.0.0.1:57321 \
		--dart-define=SUPABASE_ANON_KEY=REDACTED_SUPABASE_KEY_LOCAL

# Flutter 개발 서버 (리모트 Supabase)
mobile-dev-remote:
	cd apps/mobile && flutter run \
		--dart-define=SUPABASE_URL=https://REDACTED_SUPABASE_HOST \
		--dart-define=SUPABASE_ANON_KEY=REDACTED_SUPABASE_KEY

# Flutter 빌드 (iOS 시뮬레이터, 로컬)
mobile-build:
	cd apps/mobile && flutter build ios --simulator \
		--dart-define=SUPABASE_URL=http://127.0.0.1:57321 \
		--dart-define=SUPABASE_ANON_KEY=REDACTED_SUPABASE_KEY_LOCAL

# Flutter 코드 분석
mobile-analyze:
	cd apps/mobile && flutter analyze

# Flutter 테스트
mobile-test:
	cd apps/mobile && flutter test

# Flutter 코드 재생성
mobile-codegen:
	cd apps/mobile && dart run build_runner build --delete-conflicting-outputs

# Flutter 정리
mobile-clean:
	cd apps/mobile && flutter clean && rm -rf .dart_tool build
