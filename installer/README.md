# Installer

## Pacman

To create `pacman` compatible packages run the following command:

```sh
# Default build from scratch - only depends on nodejs
makepkg -p PKGBUILD     --log --clean -f
# Download the prebuilt files from GitHub - no build or dependencies
makepkg -p PKGBUILD_BIN --log --clean -f
# Build from scratch using the latest git commit - only depends on nodejs
makepkg -p PKGBUILD_GIT --log --clean -f
```

You can add `--install` to instantly install the built package.

## NSIS

To create a Windows installer install Nullsoft Scriptable Install System from their official site: http://nsis.sourceforge.net/Download
Then after installing add the install directory to your environment path so that you can use the command `makensis`.

```ps1
npm install
npm run build
npm run package:windows
cd installer
makensis windows_installer.nsi
```

## MAN page

With the following page the man page can be updated and viewed for testing.

```sh
npm run create:manPage && pandoc "installer/man.md" -s -t man -o "installer/man.1" && man -l "installer/man.1"
```
