# get major version from local
pkgversion=$(dot-json dist/package.json version)
echo pkg $pkgversion
git tag v$pkgversion
