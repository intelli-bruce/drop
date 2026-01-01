#!/usr/bin/env node
/**
 * CLI 로그인 명령
 * 이메일/패스워드 또는 토큰 직접 입력 방식
 */
import 'dotenv/config'
import { createInterface } from 'readline'
import { createClient } from '@supabase/supabase-js'
import { saveRefreshToken, isAuthenticated } from './auth.js'

const SUPABASE_URL = process.env.SUPABASE_URL || 'http://127.0.0.1:58321'
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY || 'REDACTED_SUPABASE_KEY_LOCAL'

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
})

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, resolve)
  })
}

async function loginWithEmail() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

  const email = await question('Email: ')
  const password = await question('Password: ')

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error('Login failed:', error.message)
    return false
  }

  if (data.session?.refresh_token) {
    saveRefreshToken(data.session.refresh_token)
    console.log('\nLogin successful!')
    console.log('User:', data.user?.email)
    console.log('Refresh token saved to .env')
    return true
  }

  console.error('No session received')
  return false
}

async function loginWithToken() {
  console.log('\nTo get your refresh token:')
  console.log('1. Open DROP Desktop app')
  console.log('2. Open DevTools (Cmd+Option+I)')
  console.log('3. Run in Console: (await supabase.auth.getSession()).data.session?.refresh_token')
  console.log('')

  const token = await question('Paste refresh token: ')

  if (!token.trim()) {
    console.error('No token provided')
    return false
  }

  // 토큰 유효성 검증
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  const { data, error } = await supabase.auth.refreshSession({
    refresh_token: token.trim(),
  })

  if (error) {
    console.error('Invalid token:', error.message)
    return false
  }

  if (data.session?.refresh_token) {
    saveRefreshToken(data.session.refresh_token)
    console.log('\nToken saved successfully!')
    console.log('User:', data.user?.email)
    return true
  }

  console.error('Failed to validate token')
  return false
}

async function main() {
  console.log('DROP MCP Server - Authentication')
  console.log('=================================')
  console.log(`Supabase URL: ${SUPABASE_URL}`)
  console.log('')

  if (isAuthenticated()) {
    const answer = await question('Already authenticated. Re-authenticate? (y/N): ')
    if (answer.toLowerCase() !== 'y') {
      console.log('Keeping existing authentication.')
      rl.close()
      process.exit(0)
    }
  }

  console.log('\nChoose authentication method:')
  console.log('1. Email/Password')
  console.log('2. Paste refresh token from Desktop app')
  console.log('')

  const choice = await question('Choice (1 or 2): ')

  let success = false
  if (choice === '1') {
    success = await loginWithEmail()
  } else if (choice === '2') {
    success = await loginWithToken()
  } else {
    console.error('Invalid choice')
  }

  rl.close()
  process.exit(success ? 0 : 1)
}

main().catch((err) => {
  console.error('Error:', err)
  rl.close()
  process.exit(1)
})
