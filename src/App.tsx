import './App.css'
import TaskGeneratorFromFiles from './features/TaskGeneratorFromFiles'

function App() {

  const tasks = [1, 2, 3]

  return (
    <div className="container mx-auto">
      <h1> Python Online Kurs</h1>
      {tasks.map(taskNumber => {
        return (
          <>
            <TaskGeneratorFromFiles key={taskNumber} number={taskNumber}></TaskGeneratorFromFiles>
            <hr className='border border-4 opacity-100'></hr>
          </>
        )
      })}
    </div>
  )
}

export default App
