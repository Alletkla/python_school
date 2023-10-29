import { PropsWithChildren } from "react";


export default function TopBar(props: PropsWithChildren
    &
{ taskCount: number }) {

    let taskHeadings = []
    for (let i = 1; i <= props.taskCount; i++) {
        taskHeadings.push(
            <div key={`#heading_task_${i}_1`} className="btn btn-outline-secondary" onClick={() => scrollIntoView(`#heading_task_${i}_1`)} >{`Aufgabe ${i}`}</div>
        )
    }

    function scrollIntoView(selector: string){
        document.querySelector(selector)?.scrollIntoView({behavior: "smooth"})
    }

    
    return (
        <nav className="sticky-top bg-dark w-100 p-2">
            <div className="d-flex justify-content-around">
                {taskHeadings}
            </div>
        </nav>
    )
}