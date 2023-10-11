# How-To Task Generation

## Format
```
{
    "title": [string],
    "type": [string],
    "description": [string],
    "code": [string],
    "taskText": [string],
    "options": [
        {
            "label": [string],
            "value": [number],
            "feebdack": [string]
        },
    ]
}
```

- `title` (string): Required. The title of the task.
- `type` (string): Required. One of `FIXED_OPTIONS` `PARAMETERIZED_OPTIONS`
- `description` (string): Required. Can be empty string `""` but is mandatory. Description display between title and code / options
- `code` (string): Required. Can be empty string `""` but is mandatory. Code scaffold for the task. Can contain [Parameters](#parameter)
- `taskText` (string): Required. Can be empty but is mandatory. Text displayed above the options.
- `options` (array of Option): Required. Needs at least one option in the array. Is only one Option given the task is recognized as "To implement" and the option is automatically set as selected. [Parameters](#parameter)

#### Options
- label (string) optional: Label the user sees to choose between possible answers. If not given the value is set as label
- value (string) Required: Value the output needs to have, that this answer is evaluated "right".
- feedback (string) optional: If given Feedback for this option is displayed, when the option got selected and was evaluated as "wrong".

## Parameter
Parameterized values can be inserted in the code: these are introduced with 2x @ 
e.g.: `@@{number;0;50}`

number indicates that it is a number, the first number after the semicolon is the start value, the second is the end value (both inclusive)

If you want to use the same number in another place in the code or in a option, you need the ref parameter:
e.g.: `@@{ref:0}`

ref indicates that you are referring to a previously inserted parameter-value. The number after the colon is the index of the value to insert.

refs can also be used more than once.

## Tipps:
For conversion strings [this tool](https://onlinetexttools.com/json-stringify-text) can be handy. Since you have to pay attention on escaping JSON characters and e.g. linebreaks.

### full example:
```
{
    "title": "Wie geben wir etwas aus?",
    "type": "PARAMETERIZED_OPTIONS",
    "description": "In Python kann man sogenannten Funktionen einen Wert mitgeben, mit dem sie arbeiten sollen. \nprint ist eine solche Funktion In Informatik sagen wir: \"Wir übergeben der Funktion einen Parameter\" allgemein erkennst du Funktionen an folgendem Aufbau: Methodenname direkt gefolgt von einer Klammer, optional mehreren Parametern und einer schließenden Klammer. Also so:\nMETHODENNAME(Parameter1, Parameter2, ....)\n\nJede Funktion hat eine bestimmmte Aufgabe. print z.B. gibt die ihr übergebenen Parameter in der Konsole aus.",
    "code": "print(@@{number;0;50})",
    "taskText": "Überlege dir, was bei diesem Code in der Konsole ausgegeben wird. Klicke es an und Klicke dann auf ausführen.",
    "options": [
        {
            "value": "print(@@{ref:0})",
            "feedback": "Schon fast. Tipp: Die Print-Funktion gibt die ihr übergebenen Parameter an die Console aus, nicht ihren eigenen Namen"
        },
        {
            "value": "@@{ref:0}"
        },
        {
            "value": "print"
        }
    ]
}
```

- So `print(@@{number;0;50})` will be evaluated to `print(<random number between 0,50>)` and the inserted value will be stored. In the options:  `"value": "print(@@{ref:0})"` since ref has index 0, the first inserted value is taken. which will be the one from the print before. Since second option has the same index in ref: `"value": "@@{ref:0}"` it also inserts the same number here.