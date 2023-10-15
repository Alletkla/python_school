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
    label?: string,
    value: string
    feedback?: string,
}

export default function Task(props: TaskProps) {
    const [rightOptionId, setRightOptionId] = useState<string | null>(null)
    const [selectedOptionId, setSelectedOptionId] = useState<string>(props.task.options.length > 1 ? "" : props.task.options[0].id)

    function setSelectedOptionRestriced(id: string) {
        if (rightOptionId !== null) {
            return
        }
        setSelectedOptionId(id)
    }

    function renderOptions() {
        if (props.task.options) {

            return props.task.options.map(option => {
                return <button
                    key={option.id}
                    className={`pre-wrap btn ${getButtonColor(option.id) || "btn-secondary"} w-100 mt-2 `}
                    onClick={() => setSelectedOptionRestriced(option.id)}
                >{option.label || option.value}</button>
            })
        }
    }

    function getButtonColor(id: string) {
        if (rightOptionId === id) {
            return "btn-success"
        }
        if (selectedOptionId === id) {
            if (rightOptionId === null) {
                //no right option set yet --> mark as selected
                return "btn-primary"
            }
            return "btn-danger"
        }
    }

    function renderFeedback() {
        //Question was answered and Code ran
        if (rightOptionId !== null && rightOptionId !== selectedOptionId) {
            const selectedOption = props.task.options.find(option => option.id === selectedOptionId)
            if (selectedOption?.feedback) {
                return (
                    <div>
                        <div className="card mt-3 text-bg-info">
                            <div className="card-header">Feedback:</div>
                            <div className="pre-wrap card-body">{selectedOption?.feedback}</div>
                        </div>
                    </div>
                )
            } else {
                return <></>
            }
        }
    }

    function handleNewOutput(newOutput: string) {
        const rightOptionIndex = props.task.options.findIndex(option => option.value === newOutput)
        const rightOptionId = props.task.options[rightOptionIndex]?.id

        setRightOptionId(rightOptionId)

        if (rightOptionId !== selectedOptionId) {
            props.onFail && props.onFail(props.task.id)
        }
    }

    return (
        <div className="row">
            <PythonSandbox key={props.task.code} className="col-12 col-md" code={props.task.code} onOutput={handleNewOutput} ableToRun={!!selectedOptionId}></PythonSandbox>
            <div className="col-12 col-md p-2">
                <h4>Aufgabe: </h4>
                {props.children}
                <div className="d-flex flex-wrap">{renderOptions()}</div>
                {renderFeedback()}
            </div>
        </div>

    )
}