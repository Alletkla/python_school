import { PropsWithChildren } from "react";
import Task from "./Task";


export default function ParameterizedTask(props: PropsWithChildren
    &
{
    code: string,
    options: string[],
}) {

    const [code, parameters] = substituteNumbers(props.code)
    const options = substituteOptions(props.options, parameters)

    return (
        <Task code={code} options={options}>{props.children}</Task>
    )
}

const substituteOptions = function (options: string[], parameters: number[]) {
    const newOptions = [...options]
    newOptions.forEach((option, key) => {
        let reg = new RegExp("@@{ref:(.*)}", "g")
        let matches = [...option.matchAll(reg)]

        let lastMatchedIndex = 0
        let newOption = ""
        matches.forEach(match => {
            const ref = parseInt(match[1])

            const startIndex = match.index || 0
            const insertedParameter = parameters[ref]

            newOption += option.substring(lastMatchedIndex, startIndex) + insertedParameter
            lastMatchedIndex = startIndex + match[0].length
        })

        //add all missing characters from lastMatchedIndex to end
        newOption += option.substring(lastMatchedIndex)
        newOptions[key] = newOption
    })

    newOptions.forEach((option, key) => {
        const [newOption, substitutions] = substituteNumbers(option)
        newOptions[key] = newOption
    })

    return newOptions
}

const substituteNumbers = function (code: string): [string, number[]] {
    let replacedCode = ""

    let reg = new RegExp("@@{number;?(.*)}", "g")
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