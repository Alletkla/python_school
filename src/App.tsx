import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import SkulptInterpreter from './features/PythonSandbox'
import PythonSandbox from './features/PythonSandbox'
import Task from './features/Task'

function App() {

  return (
    <div className="container mx-auto">
        <h1> Python Online Kurs</h1>
        <Task code={"print(2)"} options={["2","4","8"]}>
          Überlege dir, welche Ausgabe erzeugt dieser Code:
        </Task>
    </div>
  )
}

export default App
