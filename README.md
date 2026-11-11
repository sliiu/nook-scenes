# nook-scenes

The Nook scene catalog. It holds scenes, not the app. A scene is published only when its pull request merges into `main`. [中文](README.zh.md)

The app installs from this repository only, through `nook://scene/<id>`. It fetches the files at the merged commit and checks `htmlSha256`.

## Submit a scene

One scene is one directory, and the directory name is the id: lowercase letters, digits and hyphens, 2 to 40 characters, not starting or ending with a hyphen.

```text
night/
  scene.json
  scene.html
```

`scene.json` has only these fields:

```json
{
  "id": "night",
  "name": "Night",
  "version": "1.0.0",
  "description": "One line about the scene",
  "htmlSha256": "lowercase hex SHA-256 of scene.html",
  "preview": "preview.png",
  "author": "Your name"
}
```

`id` matches the directory name. `name` is the display name, at most 40 characters. `version` is three numbers, such as `1.0.0`, and goes up whenever the page changes. `preview` and `author` are optional; `preview`, when present, is the file `preview.png` next to the page. Compute `htmlSha256` like this:

```bash
shasum -a 256 night/scene.html
```

The page is one self-contained HTML file of at most 1 MiB.

## Update a scene

Change the same directory and open another pull request. The id stays, so the app recognises the scene it already installed and replaces it instead of adding a second one.

The version must be greater than the published one. The last number for a small change (`1.0.0` to `1.0.1`), the middle for new behavior (`1.1.0`), the first when the way it works changes (`2.0.0`). Recompute `htmlSha256` when `scene.html` changes.

A `nook://scene/<id>` link names no commit, so it installs whatever `main` has. After the merge the old link points at the new version and needs no new address.

## What a page can do

A catalog scene runs in a sandbox and can only change volume and brightness:

- `Control.getVolume()`, `Control.setVolume(0–100)`, `Control.setMute(true|false)`
- `Control.getBrightness()`, `Control.setBrightness(0–100)`
- `Control.getState()`, which returns volume and brightness together
- `events.onStateChanged(fn)`, called when either changes outside the page

The page must stand on its own. These are refused, because the review never sees what they pull in:

- `<script src>`, `<link href>`, and an `<img src>` pointing at `http` or `https`
- `eval`, `new Function`, `document.write`, `import()`
- `fetch`, `WebSocket`, `XMLHttpRequest`
- `parent`, `top`

A `data:` image is fine. The text scan only catches the obvious; the sandbox is the boundary.

## What a page can read

The sandbox gives the page nothing but volume and brightness.

- It can read the current output volume, whether it is muted, and the current built-in display brightness. With no built-in display, brightness comes back unavailable rather than as some other number.
- It can change both, and the change reaches the system, not just the picture.
- It cannot read other scenes, files, device names or the network. It cannot leave the sandbox, and it cannot bring in anything the review did not see.

## Review

Every pull request runs `.github/workflows/review.yml`. It checks added and changed scenes with this repository's `review/check.mjs`, and the rules are the same ones the app checks again at install. A scene that fails does not merge.

App changes, bug fixes and new controls go to [sliiu/nook](https://github.com/sliiu/nook).

Published scenes are listed on the [scene page](https://sliiu.github.io/nook-scenes/). The install button points at `nook://scene/<id>`.

## Support

If Nook is useful to you, you can buy me a coffee:

<a href="https://www.buymeacoffee.com/pax_z" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me a Coffee" height="60" width="217"></a>
