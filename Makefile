.PHONY: help install setup test test-db clean \
        electron-rebuild electron-dev electron-dev-local electron-dev-remote \
        electron-build electron-build-local electron-build-remote \
        flutter-setup flutter-dev flutter-dev-remote flutter-build \
        flutter-analyze flutter-test flutter-codegen flutter-clean

.DEFAULT_GOAL := help

# 도움말 출력
help:
	@echo "사용 가능한 명령어:"
	@echo ""
	@echo "  기본 설정"
	@echo "    make install              - pnpm 의존성 설치"
	@echo "    make setup                - install + electron-rebuild (최초 세팅)"
	@echo ""
	@echo "  테스트/정리"
	@echo "    make test                 - 테스트 실행"
	@echo "    make test-db              - database 패키지 테스트"
	@echo "    make clean                - 빌드 산출물 및 node_modules 정리"
	@echo ""
	@echo "  Electron (Desktop)"
	@echo "    make electron-rebuild     - better-sqlite3 Electron용 재빌드"
	@echo "    make electron-dev         - 개발 서버 실행"
	@echo "    make electron-dev-local   - 로컬 Supabase로 개발 서버"
	@echo "    make electron-dev-remote  - 리모트 Supabase로 개발 서버"
	@echo "    make electron-build       - 프로덕션 빌드"
	@echo "    make electron-build-local - 로컬 Supabase 설정으로 빌드"
	@echo "    make electron-build-remote - 리모트 Supabase 설정으로 빌드"
	@echo ""
	@echo "  Flutter (Mobile)"
	@echo "    make flutter-setup        - Flutter 의존성 설치 + 코드 생성"
	@echo "    make flutter-dev          - 로컬 Supabase로 Flutter 실행"
	@echo "    make flutter-dev-remote   - 리모트 Supabase로 Flutter 실행"
	@echo "    make flutter-build        - iOS 시뮬레이터용 빌드"
	@echo "    make flutter-analyze      - Flutter 코드 분석"
	@echo "    make flutter-test         - Flutter 테스트"
	@echo "    make flutter-codegen      - Flutter 코드 재생성"
	@echo "    make flutter-clean        - Flutter 정리"

# ============================================
# 기본 설정
# ============================================

# 의존성 설치
install:
	pnpm install --ignore-scripts

# 설치 + 재빌드 (최초 세팅)
setup: install electron-rebuild

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
# Electron (Desktop)
# ============================================

# better-sqlite3를 Electron용으로 재빌드
electron-rebuild:
	cd node_modules/better-sqlite3 && \
	HOME=~/.electron-gyp npx node-gyp rebuild --release \
		--target=33.4.3 \
		--arch=arm64 \
		--dist-url=https://electronjs.org/headers

# 개발 서버 실행
electron-dev:
	pnpm dev

# 개발 서버 실행 (로컬 Supabase)
electron-dev-local:
	pnpm dev:local

# 개발 서버 실행 (리모트 Supabase)
electron-dev-remote:
	pnpm dev:remote

# 프로덕션 빌드
electron-build:
	pnpm build

# 빌드 (로컬 Supabase 설정)
electron-build-local:
	pnpm build:local

# 빌드 (리모트 Supabase 설정)
electron-build-remote:
	pnpm build:remote

# ============================================
# Flutter (Mobile)
# ============================================

# Flutter 의존성 설치 + 코드 생성
flutter-setup:
	cd apps/mobile && flutter pub get && dart run build_runner build --delete-conflicting-outputs

# Flutter 개발 서버 (로컬 Supabase)
flutter-dev:
	cd apps/mobile && flutter run \
		--dart-define=SUPABASE_URL=http://127.0.0.1:57321 \
		--dart-define=SUPABASE_ANON_KEY=REDACTED_SUPABASE_KEY_LOCAL

# Flutter 개발 서버 (리모트 Supabase)
flutter-dev-remote:
	cd apps/mobile && flutter run \
		--dart-define=SUPABASE_URL=https://REDACTED_SUPABASE_HOST \
		--dart-define=SUPABASE_ANON_KEY=REDACTED_SUPABASE_KEY

# Flutter 빌드 (iOS 시뮬레이터, 로컬)
flutter-build:
	cd apps/mobile && flutter build ios --simulator \
		--dart-define=SUPABASE_URL=http://127.0.0.1:57321 \
		--dart-define=SUPABASE_ANON_KEY=REDACTED_SUPABASE_KEY_LOCAL

# Flutter 코드 분석
flutter-analyze:
	cd apps/mobile && flutter analyze

# Flutter 테스트
flutter-test:
	cd apps/mobile && flutter test

# Flutter 코드 재생성
flutter-codegen:
	cd apps/mobile && dart run build_runner build --delete-conflicting-outputs

# Flutter 정리
flutter-clean:
	cd apps/mobile && flutter clean && rm -rf .dart_tool build
