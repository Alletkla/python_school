import { PropsWithChildren } from "react";


export default function TopBar(props: PropsWithChildren
    &
{ taskCount: number }) {

    let taskHeadings = []
    for (let i = 1; i <= props.taskCount; i++) {
        taskHeadings.push(
            <div key={`#wrapper_task_${i}`} className="btn btn-outline-secondary" onClick={() => scrollIntoView(`#wrapper_task_${i}`)} >
                <span className="d-none d-md-block">Aufgabe </span><span>{i}</span>
            </div>
        )
    }

    function scrollIntoView(selector: string) {
        document.querySelector(selector)?.scrollIntoView({ behavior: "smooth" })
    }

    
    return (
        <nav className="sticky-top bg-dark w-100 p-2">
            <div className="d-flex justify-content-around flex-wrap">
                {taskHeadings}
            </div>
        </nav>
    )
}