import { PropsWithChildren, useState } from "react";
import PythonSandbox from "../PythonSandbox";

export default function Task(props: PropsWithChildren
    & {
        code: string,
        options: string[],
    }) {
    const [output, setOutput] = useState<string | null>(null)
    const [selectedOptionIndex, setSelectedOption] = useState<number>(props.options.length > 1 ? -1 : 0)

    function setSelectedOptionRestriced(key: number) {
        if (output) {
            return
        }
        setSelectedOption(key)
    }

    function getOptions() {
        if (props.options) {

            return props.options.map((option, key) => {
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

    return (
        <div className="row">
            <PythonSandbox key={props.code} className="col-12 col-md" code={props.code} onOutput={setOutput} ableToRun={selectedOptionIndex !== -1}></PythonSandbox>
            <div className="col-12 col-md p-2">
                <h4>Aufgabe: </h4>
                {props.children}
                <div className="d-flex flex-wrap">{getOptions()}</div>
                {/* {getFeedback()} */}
            </div>
        </div>

    )
}