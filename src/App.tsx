import { createContext, useReducer } from 'react'
import './App.css'
import TaskGeneratorFromFiles, { Task } from './features/TaskGeneratorFromFiles'

export const TaskContext = createContext<Task[]>([])

function App() {

  const taskNumbers = [1, 2, 3]

  return (
    <div className="container mx-auto">
      <h1> Python Online Kurs</h1>
      {taskNumbers.map(taskNumber => {
        return (<>
          <TaskGeneratorFromFiles key={taskNumber} number={taskNumber}></TaskGeneratorFromFiles>
          <hr className='border border-4 opacity-100'></hr>
        </>
        )
      })}
    </div>
  )
}



export default App
