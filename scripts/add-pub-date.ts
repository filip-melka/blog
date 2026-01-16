import matter from "gray-matter"
import fs from "fs"

export function addPubDate(
  filePath: string,
  data: Record<string, unknown>,
  content: string,
) {
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
