import React from "react";
import { PropsWithChildren, useEffect, useState } from "react";
import Task from "./Task";
import Skeleton from "react-loading-skeleton";
import "./TaskGeneratorFromFiles.css"

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
    const [fileContents, setFileContents] = useState<Task[]>([]);

    const number = ("0" + props.number).slice(-2);


    async function fetchFile(taskNumber: number, fileContents: Task[]) {
        let string = `${import.meta.env.VITE_BASE_PREFIX}tasks/${number}/${("0" + taskNumber).slice(-2)}.json`
        let url = new URL(string, import.meta.url).href
        if (url && taskNumber < 5) {
            // Use the fetch API to read the file
            await fetch(url)
                .then((response) => {
                    if (!response.ok) {
                        // make the promise be rejected if we didn't get a 2xx response
                        throw new Error("File not Found");
                    }
                    return response.text();
                })
                .then(async (data) => {
                    /** @TODO generate a UUID here? */
                    fileContents.push(JSON.parse(data));
                    // Continue fetching recursively with the next taskNumber
                    await fetchFile(taskNumber + 1, fileContents);
                })
                .catch((error : Error) => {
                    if (error.message !== "File not Found") {
                        console.error('Error reading the file:', error);
                    }
                });
        }
        return fileContents
    }


    useEffect(() => {
        fetchFile(1, []).then(contents => setFileContents(contents))
    }, []);

    if (!fileContents) {
        return <Skeleton count={5}></Skeleton>
    }

    return (<>
        {fileContents.map((fileContent, key) => {
            console.log(fileContent?.description)
            return (
                <React.Fragment key={key}>
                    <h2>{fileContent?.title}</h2>
                    <p className="description">{fileContent?.description}</p>
                    <Task code={fileContent?.code} options={fileContent?.options || []}>
                        {fileContent?.taskText}
                    </Task>
                </React.Fragment>
                )
        })}

    </>)
}