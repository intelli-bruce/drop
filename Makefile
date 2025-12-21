.PHONY: install rebuild dev build test clean

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

# 개발 서버 실행
dev:
	pnpm dev

# 프로덕션 빌드
build:
	pnpm build

# 테스트 실행
test:
	pnpm test

# database 패키지 테스트
test-db:
	pnpm --filter @throw/database test

# 빌드 산출물 정리
clean:
	rm -rf node_modules
	rm -rf apps/*/node_modules apps/*/out apps/*/dist
	rm -rf packages/*/node_modules packages/*/dist
