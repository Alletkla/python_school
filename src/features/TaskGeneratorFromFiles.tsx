import React, { } from "react";
import { PropsWithChildren, useEffect, useState } from "react";
import Task from "./Task/Task";
import Skeleton from "react-loading-skeleton";
import "./TaskGeneratorFromFiles.css"
import ParameterizedTask from "./Task/ParameterizedTask";
import shuffle from "../helpers/shuffle";

import { v4 as uuid } from "uuid"

enum TaskTypes {
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
                    fileContents.push({ id: uuid(), shuffleOptions: true, ...JSON.parse(data) });
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

    function handleFail(id: string, task: Task) {
        setTasks(prevTasks => {
            const index = prevTasks.findIndex(task => task.id === id)
            const newTasks = prevTasks.slice(0, index + 1).concat([{ ...task, description: "" }]).concat(tasks.slice(index + 1))
            return newTasks
        })
    }

    return (<>
        {tasks.map((task, key) => {
            let taskEl
            const options = task.options

            if (task.shuffleOptions) {
                shuffle(options)
            }

            if (task.type === TaskTypes.PARAMETERIZED_OPTIONS) {
                taskEl = <ParameterizedTask
                    task={{ ...task, options }}
                    onFail={(id: string) => handleFail(id, task)}
                >
                    {task.taskText}
                </ParameterizedTask>
            } else {
                taskEl = <Task task={task}>
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