import * as fs from "fs"

const getDirectories = (source: string) =>
    fs.readdirSync(source, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name)


function readDirRecursive(dir: string, tree: {}) {
    // const dirs = getDirectories(dir)
    const innerTree: { [key: string | number]: any } = {}

    const filesAndFolders = fs.readdirSync(dir, { withFileTypes: true })

    const files = filesAndFolders.filter(dirent => !dirent.isDirectory())
    const folders = filesAndFolders.filter(dirent => dirent.isDirectory())

    files.map((file, key) => innerTree[key] = { type: "file", name: file.name })

    folders.map(folder =>
        innerTree[folder.name] = Object.assign({ type: "folder" }, readDirRecursive(dir + "/" + folder.name, []))
    )

    return innerTree
}

// import viteConfig from './vite.config'
// const outDir = viteConfig.build?.outDir || 'dist'; // Default to 'dist' if not specified in the config.

function generateIndexFiles(outDir: string) {
    const TASK_DIR_NAME = outDir + "tasks/"
    const tree = readDirRecursive(TASK_DIR_NAME, [])

    Object.entries(tree).map(([folderName, content]: [string, any], index) => {
        if (content.type === "folder") {
            const files: string[] = []
            // console.log("folder:", folderName)
            Object.entries(content).map(([key, content]: [string, any], index) => {
                if (key === "type") return

                files.push(content.name)
            })
            const name = `${TASK_DIR_NAME}${folderName}/index.json`
            fs.writeFile(name, JSON.stringify(files), (err) => {
                if (err) throw err;
                console.log(`The file ${name} has been generated and saved!`);
            })
        }
    })
}

generateIndexFiles("dist/")
generateIndexFiles("public/")