import { PropsWithChildren, useEffect, useState } from "react";
import Task, { Option } from "./Task";
import Skeleton from "react-loading-skeleton";
import 'react-loading-skeleton/dist/skeleton.css'
import "./TaskListFromIndexFile.css"
import TaskWrapper from "./TaskWrapper";

export enum TaskTypes {
    FIXED_OPTIONS = "FIXED_OPTIONS",
    PARAMETERIZED_OPTIONS = "PARAMETERIZED_OPTIONS"
}

export interface Task {
    id: string,
    title: string,
    type: TaskTypes,
    description: string,
    code: string,
    taskText: string,
    options: Option[],
    shuffleOptions?: boolean
}

export type TaskIndexList = string[]
/**
 * @TODO onBuild put all JSON Files in one big one. Rename the files in alphabetical order in the json so they can be handled in
 * clear names and will still be available without 404 on runtime
 */

export default function TaskGeneratorFromFiles(props: PropsWithChildren & { number: number }) {
    const [taskInfos, setTaskInfo] = useState<TaskIndexList>([])

    /**
     * fetch all Sub-Tasks of the Main-Task recursivly until Sub-Task file can not be found on the server
     * @param taskNumber 
     * @param fileContents 
     * @returns 
     */
    async function fetchTaskIndexFile() {
        let string = `${import.meta.env.VITE_BASE_PREFIX}tasks/${("0" + props.number).slice(-2)}/index.json`
        let url = new URL(string, import.meta.url).href
        if (url) {
            // Use the fetch API to read the file
            return await fetch(url)
                .then((response) => {
                    if (!response.ok) {
                        // make the promise be rejected if we didn't get a 2xx response --> No Task file exists
                        throw new Error("File not Found");
                    }
                    return response.text();
                })
                .then(async (data) => {
                    const parsedTaskList = JSON.parse(data) as TaskIndexList

                    return parsedTaskList
                })
                .catch((error: Error) => {
                    if (error.message !== "File not Found") {
                        console.error('Error reading the file:', error);
                    }
                });
        }
    }

    useEffect(() => {
        //start at Task Number:
        fetchTaskIndexFile()
            .then(contents => {
                if (!contents) return

                setTaskInfo(contents)
                return contents
            })
    }, []);

    const wrappers = taskInfos.map((file, key) => {
        if (file === "index.json") return

        return <TaskWrapper key={props.number + "/" + file} mainTaskNumber={props.number} subTaskNumber={key} taskFile={file}></TaskWrapper>
    })

    return (<>
        {wrappers || <Skeleton height={200} count={1}></Skeleton>}
    </>)
}

