import { PropsWithChildren, useState } from "react";
import PythonSandbox from "../PythonSandbox";

export type TaskProps = PropsWithChildren & {
    task: {
        id: string,
        title: string,
        taskText: string,
        description: string,
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

/**
 * @type null if not set
 * @type string if found
 * @type -1 if not found
 */
export type OptionId = null | string | "-1"

export default function Task(props: TaskProps) {
    const [rightOptionId, setRightOptionId] = useState<OptionId>(null)
    const [selectedOptionId, setSelectedOptionId] = useState<OptionId>(null)

    //defaults for selected option
    if (!selectedOptionId && props.task.options.length === 1) {
        setSelectedOptionId(props.task.options[0].id)
    }
    if (!selectedOptionId && props.task.options.length === 0) {
        setSelectedOptionId("-1")
    }

    /**
     * Restrict the setting, if answer was already given
     * @param id 
     * @returns 
     */
    function setSelectedOptionRestriced(id: string) {
        if (rightOptionId !== null) {
            return
        }
        setSelectedOptionId(id)
    }

    function handleNewOutput(newOutput: string) {
        const rightOptionIndex = props.task.options.findIndex(option => option.value === newOutput)
        const rightOptionId = props.task.options[rightOptionIndex]?.id || "-1"

        setRightOptionId(rightOptionId)

        if (rightOptionId !== selectedOptionId) {
            props.onFail && props.onFail(props.task.id)
        }
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
                //no right option set yet --> mark the option as selected
                return "btn-primary"
            }
            return "btn-danger"
        }
    }

    function renderFeedback() {
        if (rightOptionId === null || rightOptionId === selectedOptionId) {
            //code did not run yet, or question was answered right
            return
        }

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
        }
    }

    function renderNextTaskText() {
        if (!rightOptionId) {
            return
        }
        let text = ""
        if (rightOptionId !== selectedOptionId || rightOptionId === "-1") {
            text = "⬇️ Versuche es gleich noch mal 👍🏽 ⬇️"
        }

        return <div className="fs-2 text-center m-2">{text}</div>
    }

    return (
        <>
            <h2>{props.task?.title}</h2>
            <p className="pre-wrap fs-5">{props.task?.description}</p>
            <div className="row">
                <PythonSandbox key={props.task.code} className="col-12 col-md-6" code={props.task.code} onOutput={handleNewOutput} ableToRun={!!selectedOptionId}></PythonSandbox>
                <div className="col-12 col-md-6 p-2">
                    <h4>Aufgabe: </h4>
                    {props.task.taskText}
                    <div className="d-flex flex-wrap">{renderOptions()}</div>
                    {renderFeedback()}
                </div>
                {renderNextTaskText()}
            </div>
        </>
    )
}