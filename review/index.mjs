// Writes scenes.json from the scene.json files under scenes/.
//
// The catalog pages read this one file. It carries what a card shows and
// nothing the page can already open itself, so there is no hash and no HTML.
// A scene without preview.png omits preview.
//
//   node review/index.mjs
//
// Prints "unchanged" and exits 0 when scenes.json already matches, so the
// deploy step can skip the commit.

import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs"

const kept = ["id", "name", "version", "description", "author"]

function scenes() {
  let names = []
  try {
    names = readdirSync("scenes")
  } catch {
    return []
  }
  return names
    .filter((name) => {
      try {
        return statSync(`scenes/${name}/scene.json`).isFile()
      } catch {
        return false
      }
    })
    .sort()
    .map((id) => {
      const meta = JSON.parse(readFileSync(`scenes/${id}/scene.json`, "utf8"))
      const row = {}
      for (const key of kept) {
        if (typeof meta[key] === "string" && meta[key] !== "") row[key] = meta[key]
      }
      let preview = false
      try {
        preview = statSync(`scenes/${id}/preview.png`).isFile()
      } catch {
        preview = false
      }
      if (preview) row.preview = `scenes/${id}/preview.png`
      return row
    })
}

const next = JSON.stringify({ scenes: scenes() }, null, 2) + "\n"
let current = ""
try {
  current = readFileSync("scenes.json", "utf8")
} catch {
  current = ""
}
if (current === next) {
  console.log("unchanged")
} else {
  writeFileSync("scenes.json", next)
  console.log("updated")
}
