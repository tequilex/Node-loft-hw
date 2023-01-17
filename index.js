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


function createDir(src, cb) {
  if (!fs.existsSync(src)) {
    fs.mkdir(src, function(err) {
      if (err) return cb(err)

      cb(null)
    })
  } else {
    cb(null)
  }
}

function sorter(src) {
  fs.readdir(src, function(err, files) {
    if (err) throw err
    
    files.forEach(function(file) {
      const currentPath = path.join(src, file)
      
      const innerDir = (path.basename(currentPath)[0]).toUpperCase()

      fs.stat(currentPath, function(err, stats) {
        if (err) throw err

        if (stats.isDirectory()) {
          sorter(currentPath)
        } else {
          createDir(config.dist, function(err) {
            if (err) throw err

            createDir(`./dist/${innerDir}`, function(err) {
              if (err) throw err

              fs.link(currentPath, `./dist/${innerDir}/${path.basename(currentPath)}`, function(err) {
                if (err) {
                  console.error(err.message)
                  return
                }
              } )
              console.log(`Файл: ${path.basename(currentPath)}`, ' скопирован');
            })
          })
        }
      }) 
    })
  })
}
console.log(args.delete)
try {
  sorter(config.src)
} catch (error) {
  console.log(error.message);
}
