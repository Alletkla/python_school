import { PropsWithChildren, useState } from "react";
import PythonSandbox from "../PythonSandbox";

export type TaskProps = PropsWithChildren & {
    task: {
        id: string,
        code: string,
        options: string[],
    },
    onFail?: (id: string) => any
}

export default function Task(props: TaskProps) {
    const [output, setOutput] = useState<string | null>(null)
    const [selectedOptionIndex, setSelectedOption] = useState<number>(props.task.options.length > 1 ? -1 : 0)

    function setSelectedOptionRestriced(key: number) {
        if (output) {
            return
        }
        setSelectedOption(key)
    }

    function getOptions() {
        if (props.task.options) {

            return props.task.options.map((option, key) => {
                return <button
                    key={key}
                    className={`btn ${getButtonColor(option, key) || "btn-secondary"} w-100 mt-2 `}
                    onClick={() => setSelectedOptionRestriced(key)}
                >{option}</button>
            })
        }
    }

    function getButtonColor(option: string, key: number) {
        if (!output) {
            if (selectedOptionIndex === key) {
                return "btn-primary"
            } else {
                return
            }
        }

        if (option === output) {
            return "btn-success"
        }
        if (selectedOptionIndex === key) {
            return "btn-danger"
        }
    }

    function getFeedback() {
        return
    }

    function handleNewOutput(newOutput: string) {
        if (props.task.options[selectedOptionIndex] !== newOutput) {
            props.onFail && props.onFail(props.task.id)
        }
        setOutput(newOutput)
    }

    return (
        <div className="row">
            <PythonSandbox key={props.task.code} className="col-12 col-md" code={props.task.code} onOutput={handleNewOutput} ableToRun={selectedOptionIndex !== -1}></PythonSandbox>
            <div className="col-12 col-md p-2">
                <h4>Aufgabe: </h4>
                {props.children}
                <div className="d-flex flex-wrap">{getOptions()}</div>
                {/* {getFeedback()} */}
            </div>
        </div>

    )
}