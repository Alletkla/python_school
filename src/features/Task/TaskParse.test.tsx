// import * as task01 from "../../../public/tasks/01/01.json"

import * as fs from "fs"

// fs.readdir("../../../public/tasks/", (err: NodeJS.ErrnoException | null, files: string[]) => {
//     console.log(files.length)
// })

function readDirRecursive(dir: string, tree: {}) {
    const dirs = getDirectories(dir)
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

const getDirectories = (source: string) =>
    fs.readdirSync(source, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name)


describe("Tasks should parse correctly", () => {
    test("task1", () => {

        


        // //Jest runs in root directory
        // const parsedTask = JSON.parse('"' + task01 + '"')
    })
})