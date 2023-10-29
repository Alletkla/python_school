import React, { createContext } from 'react'
import './App.css'
import TaskGeneratorFromFiles, { Task } from './features/TaskGeneratorFromFiles'
import TopBar from './features/TopBar'

export const TaskContext = createContext<Task[]>([])

function App() {

  const taskNumbers = [1, 2, 3, 4, 5, 6, 7, 8]

  return (
    <div className="container mx-auto">
      <TopBar taskCount={taskNumbers.length}></TopBar>
      <h1> Python Online Kurs</h1>
      {taskNumbers.map(taskNumber => {
        return (<React.Fragment key={taskNumber}>
          <TaskGeneratorFromFiles key={taskNumber} number={taskNumber}></TaskGeneratorFromFiles>
          <hr className='border border-4 opacity-100'></hr>
        </React.Fragment>
        )
      })}
    </div>
  )
}



export default App
