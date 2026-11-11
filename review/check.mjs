// Pre-review for scenes added or changed in a pull request.
//
// The verdict matches the app's market.Check, except the commit: a pull
// request has none yet. The app checks the commit again when it installs.
//
//   node review/check.mjs <file> [<file>...]
//
// A file is <id>/scene.json or <id>/scene.html. Exit 1 prints one reason per
// line. With no files, nothing is checked and the run passes.

import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"
import { basename, dirname } from "node:path"

const idRe = /^[a-z0-9](?:[a-z0-9-]{0,38}[a-z0-9])?$/
const hashRe = /^[0-9a-f]{64}$/
const maxName = 40
const maxHTML = 1 << 20

const scriptSrc = /<script\b[^>]*\bsrc\s*=/i
const linkHref = /<link\b[^>]*\bhref\s*=/i
const remoteImg = /<img\b[^>]*\bsrc\s*=\s*["']?https?:/i
const callNames = ["eval", "fetch", "import", "WebSocket", "XMLHttpRequest"]

const failures = []

function fail(scene, reason) {
  failures.push(`${scene}: ${reason}`)
}

function isIdent(ch) {
  return /[_$0-9A-Za-z]/.test(ch)
}

function bounded(s, start, end) {
  return (start === 0 || !isIdent(s[start - 1])) && (end === s.length || !isIdent(s[end]))
}

function hasCall(s, name) {
  return hasFollower(s, name, ["("])
}

function hasFollower(s, name, followers) {
  for (let from = 0; ; ) {
    const at = s.indexOf(name, from)
    if (at < 0) return false
    if (bounded(s, at, at + name.length)) {
      const rest = s.slice(at + name.length).trimStart()
      if (followers.some((follower) => rest.startsWith(follower))) return true
    }
    from = at + name.length
  }
}

function hasProp(s, obj, name) {
  for (let from = 0; ; ) {
    const at = s.indexOf(obj, from)
    if (at < 0) return false
    if (bounded(s, at, at + obj.length)) {
      let rest = s.slice(at + obj.length).trimStart()
      if (rest.startsWith(".")) {
        rest = rest.slice(1).trimStart()
        if (rest.startsWith(name) && bounded(rest, 0, name.length)) return true
      }
      if (rest.startsWith("[")) {
        rest = rest.slice(1).trimStart()
        if (rest.startsWith(`"${name}"`) || rest.startsWith(`'${name}'`)) return true
      }
    }
    from = at + obj.length
  }
}

// frameWalk reports name used as a window: name.prop, name[...], or
// window.name, self.name, globalThis.name. A CSS property, a local binding
// and rect.top are not walks.
function frameWalk(s, name) {
  if (hasFollower(s, name, [".", "["])) return true
  for (const obj of ["window", "self", "globalThis"]) {
    if (hasProp(s, obj, name)) return true
  }
  return false
}

function unsafeScript(html) {
  const low = html.toLowerCase()
  if (low.includes("new function") && hasCall(html, "Function")) return "new Function"
  if (low.includes("document.write")) return "document.write"
  for (const name of callNames) {
    if (html.includes(name) && hasCall(html, name)) return name
  }
  if (frameWalk(html, "parent")) return "parent"
  if (frameWalk(html, "top")) return "top"
  return ""
}

function check(id, metaRaw, html) {
  if (!idRe.test(id)) return fail(id, "id 只能用小写字母、数字和连字符，2 到 40 个字符")
  let meta
  try {
    meta = JSON.parse(metaRaw)
  } catch {
    return fail(id, "scene.json 不是 JSON")
  }
  const allowed = ["id", "name", "version", "description", "htmlSha256", "preview", "author"]
  for (const key of Object.keys(meta)) {
    if (!allowed.includes(key)) return fail(id, `scene.json 有多余字段 ${key}`)
  }
  if (meta.id !== id) return fail(id, "scene.json 的 id 和目录名不一致")
  const name = typeof meta.name === "string" ? meta.name.trim() : ""
  if (!name || [...name].length > maxName) return fail(id, "name 为空或超过 40 个字符")
  if (typeof meta.version !== "string" || !meta.version || meta.version.length > 32) {
    return fail(id, "version 为空或超过 32 个字符")
  }
  if (typeof meta.description !== "string") return fail(id, "description 必须是字符串")
  if (meta.preview != null && meta.preview !== "preview.png") return fail(id, "preview 只能是 preview.png")
  if (meta.author != null && (typeof meta.author !== "string" || [...meta.author].length > 40)) {
    return fail(id, "author 超过 40 个字符")
  }
  if (!html.trim()) return fail(id, "scene.html 是空的")
  if (Buffer.byteLength(html) > maxHTML) return fail(id, "scene.html 超过 1 MiB")
  const hash = createHash("sha256").update(html).digest("hex")
  if (!hashRe.test(meta.htmlSha256 ?? "")) return fail(id, "htmlSha256 不是 64 位小写十六进制")
  if (meta.htmlSha256 !== hash) return fail(id, `htmlSha256 不一致，scene.html 的是 ${hash}`)
  if (scriptSrc.test(html)) return fail(id, "页面不能用 <script src>")
  if (linkHref.test(html)) return fail(id, "页面不能用 <link href>")
  if (remoteImg.test(html)) return fail(id, "图片不能指向 http 或 https")
  const bad = unsafeScript(html)
  if (bad) return fail(id, `页面不能用 ${bad}`)
}

const files = process.argv.slice(2)
const scenes = new Map()
for (const file of files) {
  const name = basename(file)
  if (name !== "scene.json" && name !== "scene.html" && name !== "preview.png") {
    fail(file, "只接受 <id>/scene.json、<id>/scene.html 和 <id>/preview.png")
    continue
  }
  const id = basename(dirname(file))
  const scene = scenes.get(id) ?? { json: "", html: "", preview: "" }
  scene[name === "scene.json" ? "json" : name === "scene.html" ? "html" : "preview"] = file
  scenes.set(id, scene)
}

for (const [id, scene] of scenes) {
  if (!scene.json || !scene.html) {
    fail(id, "scene.json 和 scene.html 必须成对出现")
    continue
  }
  let metaRaw = ""
  let html = ""
  try {
    metaRaw = readFileSync(scene.json, "utf8")
    html = readFileSync(scene.html, "utf8")
  } catch (err) {
    fail(id, `读不到文件：${err.message}`)
    continue
  }
  check(id, metaRaw, html)
  if (metaRaw.includes('"preview"') && !scene.preview) fail(id, "scene.json 写了 preview，但没有 preview.png")
}

if (failures.length) {
  for (const line of failures) console.error(line)
  process.exit(1)
}
