// Writes the published scene ids into the catalog page before it deploys.
//
// The page used to ask api.github.com for the tree of main, and that endpoint
// answers 403 once an IP has spent its 60 unauthenticated requests an hour.
// raw.githubusercontent.com has no such limit, so the page only needs to know
// which directories exist. This finds them from the checkout and replaces the
// LISTING marker in the page.
//
//   node review/listing.mjs index.html

import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs"

const marker = "/* LISTING */ null /* /LISTING */"
const page = process.argv[2]
if (!page) {
  console.error("usage: node review/listing.mjs <page>")
  process.exit(1)
}

const ids = readdirSync(".")
  .filter((name) => !name.startsWith("."))
  .filter((name) => {
    try {
      return statSync(`${name}/scene.json`).isFile()
    } catch {
      return false
    }
  })
  .sort()

const html = readFileSync(page, "utf8")
if (!html.includes(marker)) {
  console.error(`${page} 里没有 ${marker}`)
  process.exit(1)
}

writeFileSync(page, html.replace(marker, JSON.stringify(ids)))
console.log(ids.join(" ") || "没有场景")
