import { PropsWithChildren, useEffect, useState } from "react";
import { Task as ITask, TaskTypes } from "./TaskListFromIndexFile";
import Task from "./Task";
import ParameterizedTask from "./ParameterizedTask";
import { v4 as uuid } from "uuid"


export default function TaskWrapper(props: PropsWithChildren
    &
{
    mainTaskNumber: number,
    subTaskNumber: number,
    taskFile: string,
}) {
    const [tasks, setTasks] = useState<JSX.Element[]>([])
    const [bluePrintTask, setBluePrintTask] = useState<ITask | null>(null)

    useEffect(() => {
        fetchTask()
            .then(task => {
                if (task) {
                    setBluePrintTask(task)
                }
            })
    }, [])

    if (tasks.length === 0) {
        /**@TODO Make a JSX Factory for this */
        if (bluePrintTask?.type === TaskTypes.PARAMETERIZED_OPTIONS) {
            const newId = uuid()
            setTasks(prev => [...prev,
            <ParameterizedTask key={newId}
                task={{
                    ...bluePrintTask,
                    id: newId,
                    type: TaskTypes.PARAMETERIZED_OPTIONS
                }}
                onFail={handleFail}>
            </ParameterizedTask>
            ])
        }
        if (bluePrintTask?.type === TaskTypes.FIXED_OPTIONS) {
            setTasks(prev => [...prev, <Task task={{ ...bluePrintTask }} onFail={handleFail}></Task>])
        }
    }


    async function fetchTask() {
        let string = `${import.meta.env.VITE_BASE_PREFIX}tasks/${("0" + props.mainTaskNumber).slice(-2)}/${props.taskFile}`
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
                    const parsedTask = JSON.parse(data) as ITask

                    if (!parsedTask.options) console.log(url, parsedTask)

                    return {
                        shuffleOptions: true,
                        ...parsedTask,
                        //Number constructor for stripping leading zeros away
                        title: `${Number(props.mainTaskNumber)}.${props.subTaskNumber + 1} ${parsedTask.title}`,
                        id: uuid(),
                        options: parsedTask.options.map(option => {
                            if (option.value === undefined || option.value === null) {
                                throw new Error("Option Value not defined, check Task Format")
                            }
                            return { ...option, id: uuid() }
                        })
                    }
                })
                .catch((error: Error) => {
                    if (error.message !== "File not Found") {
                        console.error('Error reading the file:', error);
                    }
                });
        }
    }

    function handleFail() {
        console.log("came here")
        if (bluePrintTask?.type === TaskTypes.PARAMETERIZED_OPTIONS) {
            const newId = uuid()
            setTasks(prev => [...prev,
            <ParameterizedTask key={newId}
                task={{
                    ...bluePrintTask,
                    id: newId,
                    title: "",
                    description: "",
                    type: TaskTypes.PARAMETERIZED_OPTIONS
                }}
                onFail={handleFail}>
            </ParameterizedTask>
            ])
            return
        }
        if (bluePrintTask?.type === TaskTypes.FIXED_OPTIONS) {
            setTasks(prev => [...prev, <Task task={{ ...bluePrintTask }} onFail={handleFail}></Task>])
        }
    }

    return (
        <div id={`wrapper_task_${props.mainTaskNumber}`}>
            {tasks}
        </div>
    )
}