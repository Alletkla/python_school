import { PropsWithChildren, useEffect, useState } from "react";
import Task from "./Task";
import Skeleton from "react-loading-skeleton";

enum TaskTypes {
    FIXED_OPTIONS
}

interface Task {
    title: string,
    type: TaskTypes,
    description: string,
    code: string,
    taskText: string,
    options: string[]
}

export default function TaskGeneratorFromFiles(props: PropsWithChildren & { number: number }) {
    const [fileContent, setFileContent] = useState<Task | null>(null);

    const number = ("0" + props.number).slice(-2);

    const string = `/tasks/${number}/VariablenEinfuehrung.json`
    const url = new URL(string, import.meta.url).href

    useEffect(() => {
        // Use the fetch API to read the file
        fetch(url)
            // fetch(new URL(`/VariablenEinfuehrung.json`, import.meta.url).href)
            .then((response) => response.text())
            .then((data) => {
                setFileContent(JSON.parse(data));
            })
            .catch((error) => {
                console.error('Error reading the file:', error);
            });
    }, []);

    if (!fileContent){
        return <Skeleton count={5}></Skeleton>
    }

    return (<>
        <h2>{fileContent?.title}</h2>
        <p>{fileContent?.description}</p>
        <Task code={fileContent?.code} options={fileContent?.options || []}>
            {fileContent?.taskText}
        </Task>
    </>)
}