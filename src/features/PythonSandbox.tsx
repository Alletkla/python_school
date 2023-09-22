import { PropsWithChildren, useRef, useState } from 'react';
import '../assets/js/skulpt.min.js'; // Replace with your actual path
import '../assets/js/skulpt-stdlib.js'; // Replace with your actual path

//Skip typescript checks for Sk since it has none
declare var Sk: any

export default function PythonSandbox(props: PropsWithChildren
    & {
        className?: string
        code: string,
        onOutput: React.Dispatch<React.SetStateAction<string | null>>
        ableToRun?: boolean
    }) {
    const [code, setCode] = useState(props.code)
    const codeTArea = useRef<HTMLTextAreaElement>(null)
    const canvasRef = useRef<HTMLDivElement>(null)
    const outputRef = useRef<HTMLPreElement>(null)
    const statusRef = useRef<HTMLPreElement>(null)
    const ableToRun = props.ableToRun === undefined ? true : props.ableToRun

    /**
     * Called when text would be send to console
     * @param text 
     */
    function outf(text: string) {
        text = text.trimEnd()
        if (outputRef.current) {
            outputRef.current.innerHTML += text;
        }
        if (outputRef.current) {
            props.onOutput(outputRef.current.innerHTML)
        }else{
            props.onOutput("")
        } 
    }

    // Builtin read function
    function builtinRead(x: string) {
        if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][x] === undefined)
            throw "File not found: '" + x + "'";
        return Sk.builtinFiles["files"][x];
    }

    // Run Python code
    function runPythonCode() {
        const code = codeTArea.current?.value

        // Clear previous output
        if (outputRef.current) {
            outputRef.current.innerText = '';
        }

        if (canvasRef.current) {
            canvasRef.current.innerText = ''
        }

        Sk.configure({ output: outf, read: builtinRead });
        (Sk.TurtleGraphics || (Sk.TurtleGraphics = {})).target = 'mycanvas';

        const promise = Sk.misceval.asyncToPromise(function () {
            return Sk.importMainWithBody('<stdin>', false, code, true);
        });

        promise.then(
            (mod: any) => {
                if (statusRef.current) {
                    statusRef.current.innerText = '>> Python code executed successfully';
                }
            },
            (err: Error) => {
                if (statusRef.current) {
                    statusRef.current.innerText = err.toString();
                }
            }
        );
    }

    return (
        <div className={props.className}>
            <textarea className='form-control' ref={codeTArea} id="yourcode" cols={40} rows={10} value={code} onChange={(e) => setCode(e.currentTarget.value)}>

            </textarea>
            <br />
            <button className='btn btn-primary w-100' type="button" onClick={runPythonCode} disabled={!ableToRun}>Ausführen</button>
            <div id="mycanvas"></div>
            <h4>Console:</h4>
            <pre className="bg-light text-dark rounded p-3" ref={outputRef}>{ableToRun ? "... Ausführen Klicken für Ausgabe" : "Erst Antwort auswählen"}</pre>
            <pre ref={statusRef}></pre>
        </div>
    );
}