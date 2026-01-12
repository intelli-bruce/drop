#!/bin/bash
# MCP 서버 실행 스크립트
# .env 파일이 있는 디렉토리로 이동 후 실행
cd "$(dirname "$0")"
exec node dist/index.js
