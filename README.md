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

`id` 必须和目录名相同。`name` 是显示名，最多 40 个字符。`preview` 和 `author` 可以不写；写了 `preview` 就只能是同目录的 `preview.png`。`htmlSha256` 这样算：

```bash
shasum -a 256 night/scene.html
```

页面是一个不依赖外链的 HTML 文件，最大 1 MiB。

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

`scene.json` has `id`, `name`, `version`, `description` and `htmlSha256`. `preview` and `author` are optional. `preview`, when present, is the file `preview.png` next to the page. `id` matches the directory name, `name` is at most 40 characters, and the page is one self-contained HTML file of at most 1 MiB.

```bash
shasum -a 256 night/scene.html
```

A catalog scene runs in a sandbox and can only change volume and brightness, through `Control.getVolume`, `setVolume`, `setMute`, `getBrightness`, `setBrightness`, `getState`, and `events.onStateChanged`. The page is refused if it uses `<script src>`, `<link href>`, an `http` or `https` image, `eval`, `new Function`, `document.write`, `import()`, `fetch`, `WebSocket`, `XMLHttpRequest`, or `parent` and `top` as a window. A `data:` image is fine. The text scan only catches the obvious; the sandbox is the boundary.

Every pull request runs `.github/workflows/review.yml`, which checks added and changed scenes with `review/check.mjs`. A scene that fails does not merge.

App changes go to [sliiu/nook](https://github.com/sliiu/nook). Published scenes are listed on the [scene page](https://sliiu.github.io/nook-scenes/).
