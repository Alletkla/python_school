import React, { } from "react";
import { PropsWithChildren, useEffect, useState } from "react";
import Task, { Option } from "./Task/Task";
import Skeleton from "react-loading-skeleton";
import "./TaskGeneratorFromFiles.css"
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
    options: Option[],
    shuffleOptions?: boolean
}
/**
 * @TODO onBuild put all JSON Files in one big one. Rename the files in alphabetical order in the json so they can be handled in
 * clear names and will still be available without 404 on runtime
 */
export default function TaskGeneratorFromFiles(props: PropsWithChildren & { number: number }) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [taskBlueprints, setTaskBlueprints] = useState<Task[]>([])
    const number = ("0" + props.number).slice(-2);

    async function fetchFile(taskNumber: number, fileContents: Task[]) {
        let string = `${import.meta.env.VITE_BASE_PREFIX}tasks/${number}/${("0" + taskNumber).slice(-2)}.json`
        let url = new URL(string, import.meta.url).href
        if (url && taskNumber < 100) {
            // Use the fetch API to read the file
            await fetch(url)
                .then((response) => {
                    if (!response.ok) {
                        // make the promise be rejected if we didn't get a 2xx response --> No Task file exists
                        throw new Error("File not Found");
                    }
                    return response.text();
                })
                .then(async (data) => {
                    const parsedTask = JSON.parse(data) as Task

                    fileContents.push(
                        {
                            shuffleOptions: true,
                            ...parsedTask,
                            id: uuid(),
                            options: parsedTask.options.map(option => {
                                if (option.value === undefined || option.value === null) {
                                    throw new Error("Option Value not defined, check Task Format")
                                }
                                return { ...option, id: uuid() }
                            })
                        });
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
        fetchFile(1, [])
            .then(contents => { setTaskBlueprints(contents); return contents })
            .then(contents => {
                setTasks(preComputeTasks(contents))
            })
    }, []);

    if (tasks.length === 0) {
        return <Skeleton count={5}></Skeleton>
    }

    function handleFail(id: string, task: Task) {
        setTasks(prevTasks => {
            const index = prevTasks.findIndex(task => task.id === id)
            const blueprint = taskBlueprints.find(blueprint => blueprint.id === id)
            if (blueprint) {
                const newId = uuid()
                blueprint.id = newId

                return prevTasks.slice(0, index + 1).concat(preComputeTasks([{ ...blueprint, id: newId, description: "" }])).concat(tasks.slice(index + 1))
            }
            console.warn("no Blueprint found for task")
            return prevTasks
        })
    }

    // console.log(tasks)

    function preComputeTasks(tasks: Task[]) {
        return tasks.map((task) => {
            const options = task.options

            if (task.shuffleOptions) {
                shuffle(options)
            }

            if (task.type === TaskTypes.PARAMETERIZED_OPTIONS) {
                const [codeWithRefs, parameters] = substituteNumbers(task.code)
                const code = substituteRefs(codeWithRefs, parameters)
                const options = substituteOptions(task.options, parameters)

                task = { ...task, options, code }
            }
            return { ...task }
        })
    }

    return (<>
        {tasks.map((task) => {
            return (
                <React.Fragment key={task.id}>
                    <h2>{props.number} - {task?.title}</h2>
                    <p className="pre-wrap fs-5">{task?.description}</p>
                    <Task task={task} onFail={() => handleFail(task.id, task)}>
                        <div className="pre-wrap">{task.taskText}</div>
                    </Task>
                </React.Fragment>
            )
        })}

    </>)
}

const substituteOptions = function (options: Option[], parameters: number[]) {
    const newOptions = [...options]
    newOptions.forEach((option, key) => {
        newOptions[key] = {...option, id: option.id, label:substituteRefs(option.label, parameters), value: substituteRefs(option.value, parameters)}
        if (option.feedback){
            newOptions[key] = {...newOptions[key], feedback: substituteRefs(option.feedback, parameters) }
        }
    })

    /**
     * @TODO Although it should work in all cases since random numbers are only generated when there is no reff to the task itself
     * not a good way to seperate labels from values.
     */
    newOptions.forEach((option, key) => {
        const [newOptionVal, substitutionsVal] = substituteNumbers(option.value)
        newOptions[key] = {...option, id: option.id, value: newOptionVal }
    })

    return newOptions
}

const substituteRefs = function (code: string | undefined, parameters: number[]) {

    if (code === undefined){
        return ""
    }

    let reg = new RegExp("@@{ref:(.*?)}", "g")
    let matches = [...code.matchAll(reg)]

    let lastMatchedIndex = 0
    let newOption = ""
    matches.forEach(match => {
        const ref = parseInt(match[1])

        const startIndex = match.index || 0
        const insertedParameter = parameters[ref]

        newOption += code.substring(lastMatchedIndex, startIndex) + insertedParameter
        lastMatchedIndex = startIndex + match[0].length
    })

    //add all missing characters from lastMatchedIndex to end
    newOption += code.substring(lastMatchedIndex)
    return newOption
}

const substituteNumbers = function (code: string): [string, number[]] {
    let replacedCode = ""

    let reg = new RegExp("@@{number;?(.*?)}", "g")
    let matches = [...code.matchAll(reg)]


    let lastMatchedIndex = 0
    const insertedParameters: number[] = []

    matches.forEach(match => {
        const parameters = match[1].split(";")
        if (parameters.length < 2) {
            parameters[0] = "-100"
            parameters[1] = "100"
        }

        const startIndex = match.index || 0
        const insertedParameter = getRandomInt(parseInt(parameters[0]), parseInt(parameters[1]))

        replacedCode += code.substring(lastMatchedIndex, startIndex) + insertedParameter
        lastMatchedIndex = startIndex + match[0].length
        insertedParameters.push(insertedParameter)
    })
    replacedCode += code.substring(lastMatchedIndex)

    return [replacedCode, insertedParameters]
}

/**
 * Returns a random integer between min (inclusive) and max (inclusive).
 * The value is no lower than min (or the next integer greater than min
 * if min isn't an integer) and no greater than max (or the next integer
 * lower than max if max isn't an integer).
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


export { substituteNumbers, substituteOptions }