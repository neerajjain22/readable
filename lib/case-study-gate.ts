import { getCaseStudyBySlug } from "./case-study-data"

type RedisResponse<T> = {
  result: T
  error?: string
}

type OtpPayload = {
  otp: string
  createdAt: number
}

const OTP_EXPIRY_SECONDS = 600
const OTP_RATE_LIMIT_WINDOW_SECONDS = 600
const OTP_RATE_LIMIT_MAX = 5
const VERIFY_RATE_LIMIT_WINDOW_SECONDS = 600
const VERIFY_RATE_LIMIT_MAX = 10

const FREE_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "yahoo.co.in",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "msn.com",
  "aol.com",
  "icloud.com",
  "me.com",
  "proton.me",
  "protonmail.com",
])

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`)
  }
  return value
}

function getRedisConfig() {
  const url = requireEnv("UPSTASH_REDIS_REST_URL")
  const token = requireEnv("UPSTASH_REDIS_REST_TOKEN")
  return { url, token }
}

async function redisCommand<T>(args: string[]): Promise<T> {
  const { url, token } = getRedisConfig()

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error(`Redis request failed with status ${response.status}`)
  }

  const payload = (await response.json()) as RedisResponse<T>

  if (payload.error) {
    throw new Error(`Redis error: ${payload.error}`)
  }

  return payload.result
}

function otpKey(email: string): string {
  return `case-study:otp:${email}`
}

function verifiedKey(email: string): string {
  return `case-study:verified:${email}`
}

function otpRateLimitKey(ip: string): string {
  return `case-study:rate-limit:otp:${ip}`
}

function verifyRateLimitKey(ip: string): string {
  return `case-study:rate-limit:verify:${ip}`
}

async function increaseCounter(key: string, ttlSeconds: number): Promise<number> {
  const count = await redisCommand<number>(["INCR", key])
  if (count === 1) {
    await redisCommand<number>(["EXPIRE", key, String(ttlSeconds)])
  }
  return count
}

export async function assertOtpRateLimit(ip: string): Promise<void> {
  const count = await increaseCounter(otpRateLimitKey(ip), OTP_RATE_LIMIT_WINDOW_SECONDS)
  if (count > OTP_RATE_LIMIT_MAX) {
    throw new Error("Too many OTP requests. Please wait a few minutes and try again.")
  }
}

export async function assertVerifyRateLimit(ip: string): Promise<void> {
  const count = await increaseCounter(verifyRateLimitKey(ip), VERIFY_RATE_LIMIT_WINDOW_SECONDS)
  if (count > VERIFY_RATE_LIMIT_MAX) {
    throw new Error("Too many verification attempts. Please wait a few minutes and try again.")
  }
}

export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase()
}

export function isBusinessEmail(email: string): boolean {
  const normalized = normalizeEmail(email)
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)

  if (!validEmail) {
    return false
  }

  const domain = normalized.split("@")[1]

  if (!domain || FREE_EMAIL_DOMAINS.has(domain)) {
    return false
  }

  return true
}

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for")
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim()
  }

  const realIp = request.headers.get("x-real-ip")
  if (realIp) {
    return realIp.trim()
  }

  return "unknown"
}

export function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}

export async function storeOtp(email: string, otp: string): Promise<void> {
  const payload: OtpPayload = {
    otp,
    createdAt: Date.now(),
  }

  await redisCommand<string>(["SETEX", otpKey(email), String(OTP_EXPIRY_SECONDS), JSON.stringify(payload)])
}

export async function readOtp(email: string): Promise<OtpPayload | null> {
  const result = await redisCommand<string | null>(["GET", otpKey(email)])

  if (!result) {
    return null
  }

  try {
    const parsed = JSON.parse(result) as OtpPayload
    if (typeof parsed.otp === "string" && typeof parsed.createdAt === "number") {
      return parsed
    }
    return null
  } catch {
    return null
  }
}

export async function clearOtp(email: string): Promise<void> {
  await redisCommand<number>(["DEL", otpKey(email)])
}

export async function isVerifiedEmail(email: string): Promise<boolean> {
  const result = await redisCommand<number>(["EXISTS", verifiedKey(email)])
  return result === 1
}

export async function markVerifiedEmail(email: string): Promise<void> {
  await redisCommand<string>(["SET", verifiedKey(email), "1"])
}

async function sendResendEmail(payload: {
  to: string
  subject: string
  html: string
  text: string
}): Promise<void> {
  const apiKey = requireEnv("RESEND_API_KEY")
  const from = process.env.CASE_STUDY_FROM_EMAIL ?? "Readable <hello@tryreadable.ai>"

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    }),
    cache: "no-store",
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Failed to send email: ${response.status} ${body}`)
  }
}

export async function sendOtpEmail(email: string, otp: string): Promise<void> {
  const subject = "Your Readable verification code"
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;">
      <p>Use the code below to verify your business email and receive your case study:</p>
      <p style="font-size:28px;font-weight:700;letter-spacing:4px;margin:16px 0;">${otp}</p>
      <p>This code expires in 10 minutes.</p>
    </div>
  `
  const text = `Use this verification code to receive your case study: ${otp}. This code expires in 10 minutes.`

  await sendResendEmail({ to: email, subject, html, text })
}

export async function sendCaseStudyEmail(email: string, slug: string): Promise<void> {
  const study = getCaseStudyBySlug(slug)

  if (!study) {
    throw new Error("Case study not found")
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://readable.xyz"
  const downloadUrl = `${appUrl}${study.file}`
  const subject = "Your Requested Case Study"

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;">
      <p>Thanks for your interest in Readable.</p>
      <p>Download your case study here:</p>
      <p><a href="${downloadUrl}">${downloadUrl}</a></p>
      <p style="margin-top:24px;">
        <a href="https://cal.com/neeraj-jain-eveucp/30min" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:10px 16px;border-radius:8px;font-weight:600;">Book a Demo</a>
      </p>
    </div>
  `

  const text = `Thanks for your interest in Readable. Download your case study here: ${downloadUrl}\n\nBook a Demo: https://cal.com/neeraj-jain-eveucp/30min`

  await sendResendEmail({ to: email, subject, html, text })
}
