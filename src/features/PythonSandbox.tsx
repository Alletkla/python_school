import { FormEvent, KeyboardEvent, PropsWithChildren, Suspense, useEffect, useRef, useState } from 'react';
import "./PythonSandbox.css"
import '../assets/js/skulpt.min.js'; // Replace with your actual path
import '../assets/js/skulpt-stdlib.js'; // Replace with your actual path
import hljs from 'highlight.js/lib/core';
import python from 'highlight.js/lib/languages/python';
import 'highlight.js/styles/atom-one-light.css';

hljs.registerLanguage('python', python);

//Skip typescript checks for Sk since it has none
declare var Sk: any

export default function PythonSandbox(props: PropsWithChildren
    & {
        className?: string
        code: string,
        onOutput: (output: string) => void
        ableToRun?: boolean
    }) {
    const [code, setCode] = useState(props.code)
    const [cursorPosition, setCursorPosition] = useState(0)
    const [output, setOutput] = useState<string | null>(null)
    const [status, setStatus] = useState<string | null>(null)
    const [executionSuspended, setExecutionSuspended] = useState(false)
    const codeArea = useRef<HTMLPreElement>(null)
    const canvasRef = useRef<HTMLDivElement>(null)
    const outputRef = useRef<HTMLPreElement>(null)
    const statusRef = useRef<HTMLPreElement>(null)
    const ableToRun = props.ableToRun === undefined ? true : props.ableToRun

    useEffect(() => {
        // Restore cursor position after rerender
        restoreCursorPosition(cursorPosition);
    }, [code]);

    //Not good practice, but necessary, when encapsulating output in Sandbox
    //since react queues state changes, and output is not updated fast enough
    //and state-setter are not allowed inside each other
    //Alternative would be lifting state up, what is not desired
    useEffect(() => {
        if (output === null) {
            return
        }

        props.onOutput(output)
    }, [output])

    function onOutputSet(text: string) {
        let newOutput = ""
        setOutput(prev => {
            if (!prev || status !== null) {
                console.log("landed here cause:", prev, status)
                newOutput = text;
            } else {
                newOutput = prev + "\n" + text
            }
            return newOutput
        })
    }

    /**
     * Called when text would be send to console
     * @param text 
     */
    function outf(text: string) {
        text = text.trimEnd()
        onOutputSet(text)
    }

    // Builtin read function
    function builtinRead(x: string) {
        if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][x] === undefined)
            throw "File not found: '" + x + "'";
        return Sk.builtinFiles["files"][x];
    }

    // Run Python code
    function runPythonCode() {
        const code = codeArea.current?.textContent

        if (status !== null || output !== null) {
            setStatus(null)
            setOutput(null)
            setExecutionSuspended(true)
            return
        }

        Sk.configure({ output: outf, read: builtinRead });
        (Sk.TurtleGraphics || (Sk.TurtleGraphics = {})).target = canvasRef.current?.id;

        const promise = Sk.misceval.asyncToPromise(function () {
            return Sk.importMainWithBody('<stdin>', false, code, true);
        });

        promise.then(
            (mod: any) => {
                //Due to closures and JS handling async events we need to wrap this into another function.
                //Since the function (and its inner values) is evaluated on runtime. 
                //Without the function wrapper output would have the value before the promise resolved, since the code got evaluated back then
                return () => {
                    setStatus('>> Python code executed successfully')
                    if (output === null) {
                        onOutputSet("")
                    }
                }
            },
            (err: Error) => {
                setStatus(err.toString())
            }
        );
    }

    function isChildOf(node: Node | null, parentId: string) {
        while (node !== null) {
            if (node instanceof HTMLElement) {
                if (node.id === parentId) {
                    return true;
                }
            }
            node = node.parentNode as HTMLElement;
        }

        return false;
    };

    function getCurrentCursorPosition(parentId: string) {
        var selection = window.getSelection(),
            charCount = -1,
            node: Node | null;

        if (selection?.focusNode) {
            if (isChildOf(selection.focusNode, parentId)) {
                node = selection.focusNode as HTMLElement;
                charCount = selection.focusOffset;

                while (node) {
                    if (node instanceof HTMLElement) { // Use type narrowing for TS
                        if (node.id === parentId) {
                            break;
                        }
                    }

                    if (node.previousSibling) {
                        node = node.previousSibling;
                        charCount += node.textContent?.length || 0;
                    } else {
                        node = node.parentNode;
                        if (node === null) {
                            break
                        }
                    }
                }
            }
        }

        return charCount;
    };

    // Function to restore the cursor position
    function createRange(node: Node, chars: { count: number }, range?: Range): Range {
        if (range === undefined) {
            range = document.createRange()
            range.selectNode(node);
            range.setStart(node, 0);
        }

        if (chars.count === 0) {
            range.setEnd(node, chars.count);
        } else if (node && chars.count > 0) {
            if (node.nodeType === Node.TEXT_NODE) {
                if (node.textContent && node.textContent.length < chars.count) {
                    chars.count -= node.textContent.length;
                } else {
                    range.setEnd(node, chars.count);
                    chars.count = 0;
                }
            } else {
                for (var lp = 0; lp < node.childNodes.length; lp++) {
                    range = createRange(node.childNodes[lp], chars, range);

                    if (chars.count === 0) {
                        break;
                    }
                }
            }
        }

        return range;
    };

    // Function to restore the cursor position
    function restoreCursorPosition(chars: number) {
        if (!codeArea.current?.parentElement) {
            return
        }

        if (chars >= 0) {
            var selection = window.getSelection();

            if (!selection) {
                return
            }

            const range = createRange(codeArea.current.parentElement, { count: chars });

            if (range) {
                range.collapse(false);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        }
    };

    const highlighted = hljs.highlight(code, { language: 'python' }).value

    function getlineBreakCount(str: string) {
        /* counts \n */
        const match = str.match(/[^\n]*\n[^\n]*/gi)
        if (match) {
            return match.length
        }
        return 0
    }

    function getLineNumbering(str: string) {
        const lineCount = getlineBreakCount(str) + 1
        const numberingEls = []
        for (let i = 1; i <= lineCount; i++) {
            numberingEls.push(<div key={i} className='font-monospace'>{i}</div>)
        }

        return numberingEls
    }

    function handleInput(e: FormEvent<HTMLElement>) {
        setCursorPosition(getCurrentCursorPosition(e.currentTarget.parentElement?.id || ""))
        setCode(e.currentTarget.textContent || "")
    }

    function handleKeyDown(e: KeyboardEvent<HTMLElement>) {
        if (e.key === "Tab") {
            const cursorPos = getCurrentCursorPosition(e.currentTarget.parentElement?.id || "")
            console.log(cursorPos)
            e.preventDefault()
            const codeToIndex = e.currentTarget.textContent?.substring(0, cursorPos) || ""
            const newCode = codeToIndex + "\t" + e.currentTarget.textContent?.substring(cursorPos)
            setCursorPosition(cursorPos + 1)
            setCode(newCode)
        }
    }

    if (executionSuspended) {
        setExecutionSuspended(false)
        runPythonCode()
    }

    return (
        <div className={`theme-atom-one-light ${props.className}`}>
            {/* panret id must be something, that is not included in the code id, espaccially not empty */}
            <div className='hljs codeWrapper p-2 border rounded text-nowrap overflow-scroll d-flex fs-6'>
                <pre className='pe-3 font-monospace'>
                    {getLineNumbering(code)}
                </pre>
                <div id="code" className='w-100'>
                    <pre ref={codeArea} className='hide-outline w-100' spellCheck={false} contentEditable={true} dangerouslySetInnerHTML={{ __html: highlighted }} onInput={handleInput} onKeyDown={handleKeyDown}>

                    </pre>
                </div>
            </div>
            <br />
            <button className='btn btn-primary w-100' type="button" onClick={runPythonCode} disabled={!ableToRun}>Ausführen</button>
            <div id="mycanvas"></div>
            <h4>Console:</h4>
            <pre className="bg-light text-dark rounded p-3" ref={outputRef}>{ableToRun ? output || "... Ausführen Klicken für Ausgabe" : "Erst Antwort auswählen"}</pre>
            <pre ref={statusRef}>{status}</pre>
        </div>
    );
}