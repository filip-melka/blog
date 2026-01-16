import "dotenv/config"
import { createClient } from "@supabase/supabase-js"

function getEnv(key: string): string | undefined {
  if (typeof process !== "undefined" && process.env[key])
    return process.env[key]
  return typeof import.meta !== "undefined"
    ? (import.meta as any).env?.[key]
    : undefined
}

const SUPABASE_URL = getEnv("PUBLIC_SUPABASE_URL")
const SUPABASE_SECRET_KEY = getEnv("SUPABASE_SECRET_KEY")

if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
  throw new Error(
    "Missing Supabase environment variables. Set PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY.",
  )
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY)

export async function ensureArticleExists(data: { [key: string]: any }) {
  const slug = data.slug
  if (!slug) return

  const { data: existing, error: fetchError } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .single()

  if (existing) return

  if (fetchError && fetchError.code !== "PGRST116") {
    // PGRST116 = "no rows returned"
    throw fetchError
  }

  const { data: created, error: insertError } = await supabase
    .from("articles")
    .insert({
      slug,
    })
    .select()
    .single()

  if (insertError) {
    throw insertError
  }
}
