const fs = require("fs")
const path = require("path")
const promisify = (api) => (...param) => new Promise((res, rej) => {
  api(...param, (err, ...ret) => {
    if (err) {
      rej(err)
    } else {
      res(...ret)
    }
  })
})
const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)

async function write(infile, outfile) {
  let content = (await readFile(infile)).toString()
  content = content.replace(/\\/g, "\\\\")
  content = content.replace(/`/g, "\\\`")
  content = content.replace(/\${/g, "\\${")

  await writeFile(outfile, `
  //Auto-generated
  let script = document.createElement('script')
  script.innerHTML=window.onload=\`(function(){
    console.log("Run injected code");
    ${content}
  })()\`
  document.body.appendChild(script)
  `)
}

async function main() {
  if (process.argv.length < 3) {
    console.log("usage: " + process.argv.join(" ") + " file1 [file2 ... ] ")
    process.exit()
  }
  try {
    await Promise.all(
      Array.from(process.argv)
        .slice(2)
        .filter(file => fs.existsSync(path.resolve(file)))
        .map((file) => {
          let p = path.parse(file).name
          console.log(file)
          return write(file, `${__dirname}/ext/js/${p}.js`)
        })
    )
  } catch (e) {
    console.error(e)
  }
}
main()
