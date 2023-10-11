import { PropsWithChildren, useState } from "react";
import PythonSandbox from "../PythonSandbox";

export type TaskProps = PropsWithChildren & {
    task: {
        id: string,
        code: string,
        options: Option[],
    },
    onFail?: (id: string) => any
}
export type Option = {
    id: string,
    value: string
}

export default function Task(props: TaskProps) {
    const [output, setOutput] = useState<string | null>(null)
    const [selectedOptionId, setSelectedOptionId] = useState<string>(props.task.options.length > 1 ? "" : props.task.options[0].id)

    function setSelectedOptionRestriced(id: string) {
        if (output) {
            return
        }
        setSelectedOptionId(id)
    }

    function getOptions() {
        if (props.task.options) {

            return props.task.options.map(option => {
                return <button
                    key={option.id}
                    className={`btn ${getButtonColor(option.value, option.id) || "btn-secondary"} w-100 mt-2 `}
                    onClick={() => setSelectedOptionRestriced(option.id)}
                >{option.value}</button>
            })
        }
    }

    function getButtonColor(option: string, id: string) {
        if (!output) {
            if (selectedOptionId === id) {
                return "btn-primary"
            } else {
                return
            }
        }

        if (option === output) {
            return "btn-success"
        }
        if (selectedOptionId === id) {
            return "btn-danger"
        }
    }

    function getFeedback() {
        return
    }

    function handleNewOutput(newOutput: string) {
        const wasSelected = props.task.options.find(option => option.value === newOutput && option.id === selectedOptionId)

        if (!wasSelected) {
            props.onFail && props.onFail(props.task.id)
        }
        setOutput(newOutput)
    }

    return (
        <div className="row">
            <PythonSandbox key={props.task.code} className="col-12 col-md" code={props.task.code} onOutput={handleNewOutput} ableToRun={!!selectedOptionId}></PythonSandbox>
            <div className="col-12 col-md p-2">
                <h4>Aufgabe: </h4>
                {props.children}
                <div className="d-flex flex-wrap">{getOptions()}</div>
                {/* {getFeedback()} */}
            </div>
        </div>

    )
}