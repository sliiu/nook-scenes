<div align="center">

<a href="https://sliiu.github.io/nook/"><img src="https://raw.githubusercontent.com/sliiu/nook/main/.github/logo-256.png" width="112" alt="Nook"></a>

<br>

# nook-scenes

### Nook 的场景清单。

**一个场景被合并进 `main`，才算上架。**<br>
这里只放场景，不放应用代码。

[![License](https://img.shields.io/badge/license-MIT-111111)](https://github.com/sliiu/nook/blob/main/LICENSE)

**[Nook](https://sliiu.github.io/nook/)** &nbsp;·&nbsp; **[应用](https://github.com/sliiu/nook)** &nbsp;·&nbsp; **简体中文** · [English](README.md)

</div>

<br>

应用只从本仓库安装，地址写在 `nook://scene/<id>`。安装时按合并后的 commit 取文件，并核对 `scene.json` 里的 `htmlSha256`。

## 提一个场景

一个场景是一个目录，目录名就是 id。id 用小写字母、数字和连字符，2 到 40 个字符，不能以连字符开头或结尾。

```text
scenes/night/
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
shasum -a 256 scenes/night/scene.html
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

已上架的场景列在 [Nook 的页面](https://sliiu.github.io/nook/)。安装按钮指向 `nook://scene/<id>`。

## 支持

如果 Nook 对你有帮助，欢迎请我喝杯咖啡：

<a href="https://www.buymeacoffee.com/pax_z" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me a Coffee" height="60" width="217"></a>
