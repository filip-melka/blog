import matter from "gray-matter"
import fs from "fs"
import { fileURLToPath } from "url"
import { dirname } from "path"
import { glob } from "glob"
import path from "path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const mdxFiles = await glob(path.join(__dirname, "../src/blog/**/*.mdx"))

mdxFiles.forEach((filePath) => addPubDate(filePath))

function addPubDate(filePath) {
  const file = fs.readFileSync(filePath, "utf-8")
  const { data, content } = matter(file)

  if (!data.pubDate && !data.isDraft) {
    const today = new Date()
    today.setUTCHours(0)
    today.setMinutes(0)
    today.setSeconds(0)
    today.setMilliseconds(0)
    data.pubDate = today

    const newFile = matter.stringify(content, data)

    fs.writeFileSync(filePath, newFile)
  }
}
