import React from "react";
import { PropsWithChildren, useEffect, useState } from "react";
import Task from "./Task/Task";
import Skeleton from "react-loading-skeleton";
import "./TaskGeneratorFromFiles.css"
import ParameterizedTask from "./Task/ParameterizedTask";
import shuffle from "../helpers/shuffle";

enum TaskTypes {
    FIXED_OPTIONS = "FIXED_OPTIONS",
    PARAMETERIZED_OPTIONS = "PARAMETERIZED_OPTIONS"
}

interface Task {
    title: string,
    type: TaskTypes,
    description: string,
    code: string,
    taskText: string,
    options: string[],
    shuffleOptions?: boolean
}

export default function TaskGeneratorFromFiles(props: PropsWithChildren & { number: number }) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const number = ("0" + props.number).slice(-2);


    async function fetchFile(taskNumber: number, fileContents: Task[]) {
        let string = `${import.meta.env.VITE_BASE_PREFIX}tasks/${number}/${("0" + taskNumber).slice(-2)}.json`
        let url = new URL(string, import.meta.url).href
        if (url && taskNumber < 5) {
            // Use the fetch API to read the file
            await fetch(url)
                .then((response) => {
                    if (!response.ok) {
                        // make the promise be rejected if we didn't get a 2xx response
                        throw new Error("File not Found");
                    }
                    return response.text();
                })
                .then(async (data) => {
                    /** @TODO generate a UUID here? */
                    fileContents.push({shuffleOptions: true, ...JSON.parse(data)});
                    // Continue fetching recursively with the next taskNumber
                    await fetchFile(taskNumber + 1, fileContents);
                })
                .catch((error: Error) => {
                    if (error.message !== "File not Found") {
                        console.error('Error reading the file:', error);
                    }
                });
        }
        return fileContents
    }


    useEffect(() => {
        //start at Task Number:
        fetchFile(1, []).then(contents => setTasks(contents))
    }, []);

    if (tasks.length === 0) {
        return <Skeleton count={5}></Skeleton>
    }

    return (<>
        {tasks.map((task, key) => {
            let taskEl
            const options = task.options

            if (task.shuffleOptions){
                shuffle(options)
            }

            if (task.type === TaskTypes.PARAMETERIZED_OPTIONS) {
                taskEl = <ParameterizedTask
                    code={task.code}
                    options={options}
                >
                    {task.taskText}
                </ParameterizedTask>
            } else {
                taskEl = <Task code={task?.code} options={task.options}>
                    {task.taskText}
                </Task>
            }
            return (
                <React.Fragment key={key}>
                    <h2>{task?.title}</h2>
                    <p className="description">{task?.description}</p>
                    {taskEl}
                </React.Fragment>
            )
        })}

    </>)
}