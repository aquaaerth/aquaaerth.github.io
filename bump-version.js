const fs = require("fs");

const files = ["index.html", "home.js", "CHANGELOG.md"];
let version = "3.3"; // current version
let [major, minor] = version.split(".").map(Number);
let newVersion = `${major}.${minor + 1}`;

files.forEach(file => {
  let content = fs.readFileSync(file, "utf8");
  content = content.replace(/v\d+\.\d+/g, `v${newVersion}`);
  if (file === "index.html") {
    content = content.replace(/AquaEarth v\d+\.\d+/, `AquaEarth v${newVersion}`);
  }
  fs.writeFileSync(file, content, "utf8");
  console.log(`✅ Updated ${file} to v${newVersion}`);
});

console.log(`🚀 Bumped to v${newVersion}`);
