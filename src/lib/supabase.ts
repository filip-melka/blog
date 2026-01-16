import { createClient } from "@supabase/supabase-js"

function getEnv(key: string): string | undefined {
  if (typeof process !== "undefined" && process.env[key])
    return process.env[key]
  return typeof import.meta !== "undefined"
    ? (import.meta as any).env?.[key]
    : undefined
}

const SUPABASE_URL = getEnv("PUBLIC_SUPABASE_URL")
const SUPABASE_ANON_KEY = getEnv("PUBLIC_SUPABASE_ANON_KEY")

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    "Missing Supabase environment variables. Set PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY.",
  )
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export async function fetchClaps(slug: string): Promise<number | Error> {
  if (import.meta.env.MODE === "mock") {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(Math.floor(Math.random() * 100))
      }, 500)
    })
  }
  const { data, error } = await supabase
    .from("articles")
    .select("claps")
    .eq("slug", slug)
    .single()

  if (data) {
    return data.claps
  } else {
    return error ? error : new Error("An error occurred while fetching claps")
  }
}

export async function saveClaps(slug: string, noOfClaps: number) {
  if (import.meta.env.MODE === "mock") return

  const res = await supabase.rpc("increment_claps", {
    increment_by: noOfClaps,
    article_slug: slug,
  })
}
