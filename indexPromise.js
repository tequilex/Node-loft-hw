const yargs = require('yargs')
const path = require('path');
const fs = require('fs')

const args = yargs
  .usage('Usage: node $0 [options]')
  .help('help')
  .alias('help', 'h')
  .version('0.0.1')
  .alias('version', 'v')
  .example('node $0 --entry ./path --dist ./path --delete')
  .option('entry', {
    alias: 'e',
    describe: 'Путь к читаемой директории',
    demandOption: true
  })
  .option('dist', {
    alias: 'd',
    describe: 'Путь к директории для сохранения файлов',
    default: './dist'
  })
  .option('delete', {
    alias: 'D',
    describe: 'Нужно ли удалять исходную директорию?',
    boolean: true,
    default: false
  })
  .epilog('-------------------------------------------------------------')
  .argv

const config = {
  src: path.normalize(path.join(__dirname, args.entry)),
  dist: path.normalize(path.join(__dirname, args.dist)),
  delete: args.delete
}

function readDir(src) {
  return new Promise((resolve, reject) => {
    fs.readdir(src, (err, files) => {
      if (err) reject(err)

      resolve(files)
    })
  })
}

function stats(src) {
  return new Promise((resolve, reject) => {
    fs.stat(src, (err, stat) => {
      if (err) reject(err)

      resolve(stat)
    })
  })
}

function mkDir(src) {
  return new Promise((resolve, reject) => {
    createDir(src, (err) => {
      if (err) reject(err)

      resolve()
    })
  })
}

function copyFile(from, to) {
  return new Promise((resolve, reject) => {
    fs.link(from, to, (err) => {
      if (err) reject(err)

      resolve()
    })
  })
}

function createDir(src, cb) {
  fs.mkdir(src, function (err) {
    if (err && err.code === 'EEXIST') return cb(null)
    if (err) return cb(err)
    cb(null)
  })
}

(async function () {
  async function sorter(src) {
    const files = await readDir(src)

    for (const file of files) {
      const currentPath = path.join(src, file)
      const stat = await stats(currentPath)

      if (stat.isDirectory()) {
        await sorter(currentPath)
      } else {
        await mkDir(config.dist)

        const innerDir = (path.basename(currentPath)[0]).toUpperCase()

        await mkDir(path.join(args.dist, innerDir))
        await copyFile(currentPath, path.join(args.dist, innerDir, path.basename(currentPath)))
        console.log(`Файл: ${path.basename(currentPath)}`, ' скопирован');
      }
    }
  }

  try {
    await sorter(config.src)

    if (args.delete) {
      fs.rmSync(config.src, { recursive: true })
      console.log(`Папка ${args.entry} удалена`);
    }
  } catch (error) {
    console.log(error);
  }
})()