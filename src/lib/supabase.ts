import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
)

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
