import './App.css'
import Task from './features/Task'


function App() {

  return (
    <div className="container mx-auto">
      <h1> Python Online Kurs</h1>
      <h2>Variablen Einführung</h2>
      <p>Variablen sind "Zwischenspeicher" für Inhalte.
        Python erzeugt Variablen automatisch für dich.
        Im folgenden Code ist a zum Beispiel eine solche Variable.
        Variablen können beliebig oft überschrieben werden.
        Dabei gilt immer der zuletzt zugewiesene Wert.</p>
      <Task code={`# lies: a wird der Wert 10 zugewiesen
a = 10
# lies: a wird der Wert 5 zugewiesen
a = 5

# Ausgabe:
print(a)`} options={["5", "10", "2", "4"]} >
        Überlege dir, welche Ausgabe erzeugt dieser Code. Deine Antwort wird nach dem Ausführen geprüft.
      </Task>

      <h2>Variablen Aufgabe</h2>
      <Task code={`
#Ausgabe
print(a)`} options={["6"]}>
        Weise der Variablen a folgenden Wert zu:
      </Task>
    </div>
  )
}

export default App
