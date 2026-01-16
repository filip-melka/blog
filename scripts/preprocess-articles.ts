import matter from "gray-matter"
import fs from "fs"
import { fileURLToPath } from "url"
import { dirname } from "path"
import { glob } from "glob"
import path from "path"
import { addPubDate } from "./add-pub-date"
import { ensureArticleExists } from "./sync-supabase"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function preprocessArticles() {
  const mdxFiles = await glob(path.join(__dirname, "../src/blog/**/*.mdx"))

  for (const filePath of mdxFiles) {
    const file = fs.readFileSync(filePath, "utf-8")
    const { data, content } = matter(file)

    addPubDate(filePath, data, content)

    try {
      await ensureArticleExists(data)
    } catch (err) {
      console.error(`Failed to sync article for ${filePath}:`, err)
    }
  }
}

preprocessArticles().catch((err) => {
  console.error(err)
  process.exit(1)
})
