import { PropsWithChildren, useEffect, useState } from "react";
import Task, { Option } from "./Task";
import { Task as ITask, TaskTypes } from "./TaskListFromIndexFile";
import shuffle from "../../helpers/shuffle";
import Skeleton from "react-loading-skeleton";


const substituteOptions = function (options: Option[], parameters: number[]) {
    const newOptions = [...options]
    newOptions.forEach((option, key) => {
        newOptions[key] = { ...option, id: option.id, label: substituteRefs(option.label, parameters), value: substituteRefs(option.value, parameters) }
        if (option.feedback) {
            newOptions[key] = { ...newOptions[key], feedback: substituteRefs(option.feedback, parameters) }
        }
    })

    /**
     * @TODO Although it should work in all cases since random numbers are only generated when there is no reff to the task itself
     * not a good way to seperate labels from values.
     */
    newOptions.forEach((option, key) => {
        const [newOptionVal, substitutionsVal] = substituteNumbers(option.value)
        newOptions[key] = { ...option, id: option.id, value: newOptionVal }
    })

    return newOptions
}

const substituteRefs = function (code: string | undefined, parameters: number[]) {

    if (code === undefined) {
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

export { substituteNumbers, substituteOptions, substituteRefs }


export default function ParameterizedTask(props: PropsWithChildren
    &
{
    task: {
        id: string,
        title: string,
        description: string,
        taskText: string,
        code: string,
        options: Option[],
        type: TaskTypes.PARAMETERIZED_OPTIONS
    },
    onFail?: (id: string) => any
}) {

    const [computedTask, setComputedTask] = useState<JSX.Element | null>(null)

    function preComputeTask(task: ITask) {
        let options = task.options
    
        if (task.shuffleOptions) {
            shuffle(options)
        }
    
        const [codeWithRefs, parameters] = substituteNumbers(task.code)
        const code = substituteRefs(codeWithRefs, parameters)
        options = substituteOptions(task.options, parameters)
    
        return <Task task={{ ...task, options, code }} onFail={props.onFail}></Task>
    }

    useEffect(() => {
        if (props.task) {
            setComputedTask(preComputeTask(props.task))
        }
    }, [])

    return (
        computedTask || <Skeleton count={5}/>
    )
}