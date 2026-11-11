# nook-scenes

Nook 的场景清单。这里只放场景，不放应用代码。一个场景被合并进 `main`，才算上架。

应用只从本仓库安装，地址写在 `nook://scene/<id>`。安装时按合并后的 commit 取文件，并核对 `scene.json` 里的 `htmlSha256`。

## 提一个场景

一个场景是一个目录，目录名就是 id。id 用小写字母、数字和连字符，2 到 40 个字符，不能以连字符开头或结尾。

```text
night/
  scene.json
  scene.html
```

`scene.json` 只有这几个字段：

```json
{
  "id": "night",
  "name": "Night",
  "version": "1.0.0",
  "description": "一句话说明这个场景",
  "htmlSha256": "小写十六进制，是 scene.html 原文件的 SHA-256",
  "preview": "preview.png",
  "author": "你的名字"
}
```

`id` 必须和目录名相同。`name` 是显示名，最多 40 个字符。`version` 用三段数字，如 `1.0.0`，每次改页面都要往上加。`preview` 和 `author` 可以不写；写了 `preview` 就只能是同目录的 `preview.png`。`htmlSha256` 这样算：

```bash
shasum -a 256 night/scene.html
```

页面是一个不依赖外链的 HTML 文件，最大 1 MiB。

## 更新一个场景

更新就是改原来的目录，再提一个 PR。id 不变，应用靠 id 认出已安装的场景，合并后用户再装一次就是覆盖，不会装出第二个。

版本号每次都要比已上架的大。只改文案加最后一位（`1.0.0` → `1.0.1`），加行为加中间一位（`1.1.0`），换掉用法加第一位（`2.0.0`）。`scene.html` 变了，`htmlSha256` 要一起重算。

`nook://scene/<id>` 不带 commit，安装时取 `main` 的最新。所以旧链接在合并之后指向的就是新版本，不用换地址。

## 页面里可以做什么

市场场景跑在沙箱里，只能调节音量和亮度：

- `Control.getVolume()`、`Control.setVolume(0–100)`、`Control.setMute(true|false)`
- `Control.getBrightness()`、`Control.setBrightness(0–100)`
- `Control.getState()`，一次拿到音量和亮度
- `events.onStateChanged(fn)`，系统侧变化时回调

页面必须自包含。这些写法会被拒绝，因为审核看不到它们带进来的内容：

- `<script src>`、`<link href>`、指向 `http` 或 `https` 的 `<img src>`
- `eval`、`new Function`、`document.write`、`import()`
- `fetch`、`WebSocket`、`XMLHttpRequest`
- `parent`、`top`

`data:` 图片可以用。预审只挡明显的写法，沙箱才是边界。

## 页面拿得到什么

沙箱给页面的只有音量和亮度。

- 能读到输出音量的当前值、是否静音，以及内建屏亮度的当前值。没有内建屏时亮度不可用，页面会拿到一个不可用的状态，而不是别的数。
- 能改这两项，改动作用于系统，不只是场景里的画面。
- 读不到其他场景、文件、设备名和网络。页面出不去这个沙箱，也带不进来审核没看过的内容。

## 审核

每个 PR 会跑 `.github/workflows/review.yml`。它用本仓库的 `review/check.mjs` 扫新增和改动的场景，规则和应用安装时的校验是同一套。没过的不合并。

改应用、修 bug、加控制项，去 [sliiu/nook](https://github.com/sliiu/nook)。

已上架的场景列在 [场景页](https://sliiu.github.io/nook-scenes/)。安装按钮指向 `nook://scene/<id>`。

## English

This is the Nook scene catalog. It holds scenes, not the app. A scene is published only when its pull request merges into `main`.

The app installs from this repository only, through `nook://scene/<id>`. It fetches the files at the merged commit and checks `htmlSha256`.

One scene is one directory, named with its id: lowercase letters, digits and hyphens, 2 to 40 characters, not starting or ending with a hyphen.

```text
night/
  scene.json
  scene.html
  preview.png
```

`scene.json` has `id`, `name`, `version`, `description` and `htmlSha256`. `preview` and `author` are optional. `preview`, when present, is the file `preview.png` next to the page. `id` matches the directory name, `name` is at most 40 characters, `version` is three numbers such as `1.0.0` and goes up whenever the page changes, and the page is one self-contained HTML file of at most 1 MiB.

```bash
shasum -a 256 night/scene.html
```

To update a scene, change its directory and open another pull request. The id stays, so the app replaces the installed copy instead of adding a second one. The version must be greater than the published one: the last number for a small change (`1.0.0` to `1.0.1`), the middle for new behavior (`1.1.0`), the first when the way it works changes (`2.0.0`). Recompute `htmlSha256` when `scene.html` changes. A `nook://scene/<id>` link names no commit, so it installs whatever `main` has and needs no new address.

A catalog scene runs in a sandbox and can only change volume and brightness, through `Control.getVolume`, `setVolume`, `setMute`, `getBrightness`, `setBrightness`, `getState`, and `events.onStateChanged`. The page can read the current output volume, whether it is muted, and the built-in display brightness, and setting them changes the system, not just the picture. It cannot read other scenes, files, device names or the network, and it cannot leave the sandbox. With no built-in display, brightness comes back unavailable rather than as some other number.

The page is refused if it uses `<script src>`, `<link href>`, an `http` or `https` image, `eval`, `new Function`, `document.write`, `import()`, `fetch`, `WebSocket`, `XMLHttpRequest`, or `parent` and `top` as a window. A `data:` image is fine. The text scan only catches the obvious; the sandbox is the boundary.

Every pull request runs `.github/workflows/review.yml`, which checks added and changed scenes with `review/check.mjs`. A scene that fails does not merge.

App changes go to [sliiu/nook](https://github.com/sliiu/nook). Published scenes are listed on the [scene page](https://sliiu.github.io/nook-scenes/).
