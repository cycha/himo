function readPackage(pkg) {
  // Allow build scripts for bcrypt and esbuild
  if (pkg.name === 'bcrypt' || pkg.name === 'esbuild') {
    pkg.scripts = pkg.scripts || {};
  }
  return pkg;
}

module.exports = {
  hooks: {
    readPackage
  }
}
