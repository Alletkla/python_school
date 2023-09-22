import { PropsWithChildren, ReactElement, useState } from "react";
import PythonSandbox from "./PythonSandbox";

export default function Task(props: PropsWithChildren
    & {
        code: string,
        options: string[]
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
        if (!output) {
            return
        }
        if (props.options[selectedOptionIndex] === output) {
            return <div>YEAH</div>
        } else {
            return <>
                <div>NO. wanted Solution was:</div>
                <div>{output}</div>
            </>
        }
    }

    return (
        <div className="d-flex">
            <PythonSandbox className="w-50" code={props.code} onOutput={setOutput} ableToRun={selectedOptionIndex !== -1}></PythonSandbox>
            <div className="w-50 p-2">
                <h4>Aufgabe: </h4>
                {props.children}
                <div className="d-flex flex-wrap">{getOptions()}</div>
                {/* {getFeedback()} */}
            </div>
        </div>

    )
}