import { substituteNumbers, substituteOptions } from "./ParameterizedTask"

describe("substituteNumbers()", () => {
    test("Should replace one Placeholders correctly", () => {
        const [newCode, parameters] = substituteNumbers("print(@@{number;0;9})")
        expect(newCode).toBe(`print(${parameters[0]})`)
    })

    test("Should use default placeholders", () => {
        const [newCode, parameters] = substituteNumbers("print(@@{number})")
        expect(newCode).toBe(`print(${parameters[0]})`)
    })

    test("Should replace multiple Placeholders correctly", () => {
        const [newCode, parameters] = substituteNumbers(`print(@@{number;5;5})
        print(@@{number;4;4})`)
        expect(newCode).toMatch(`print(${parameters[0]})
        print(${parameters[1]})`)
    })
})

describe("substitute", () => {
    test("Should substitute with given parameters", () => {
        const REPLACE_WITH = 5
        expect(substituteOptions(["print(@@{ref:0})"], [REPLACE_WITH])).toEqual([`print(${REPLACE_WITH})`])
    })
})

