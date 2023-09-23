import './App.css'
import Task from './features/Task'
import TaskGeneratorFromFiles from './features/TaskGeneratorFromFiles'

function App() {

  const tasks = [1]

  return (
    <div className="container mx-auto">
      <h1> Python Online Kurs</h1>
      {tasks.map(taskNumber => <TaskGeneratorFromFiles number={taskNumber}></TaskGeneratorFromFiles>)}
    </div>
  )
}

export default App
