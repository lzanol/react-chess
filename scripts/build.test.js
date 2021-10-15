const rewire = require("rewire")
const build = rewire("./build")
const printErrors = build.__get__("printErrors")
const copyPublicFolder = build.__get__("copyPublicFolder")
// @ponicode
describe("printErrors", () => {
    test("0", () => {
        let object = [["Message box: foo; bar\n", "ValueError", "multiple errors occurred", "too many arguments", "invalid choice", "error\n", "error"], ["Message box: foo; bar\n", "ValueError", "multiple errors occurred", "too many arguments", "invalid choice", "error\n", "error"], "New Error "]
        let param2 = [["This is an exception, voilà", "cannot be found.", "Counterparty sent error: %s"], ["Bad Authentication data", "There is a mismatch", "Invalid data: No data found in any of the field(s)!!!"], object]
        let callFunction = () => {
            printErrors("payment transaction at Satterfield - Hyatt using card ending with ***0494 for GHS 370.23 in account ***63108447", param2)
        }
    
        expect(callFunction).not.toThrow()
    })

    test("1", () => {
        let param2 = [["Unable to find your git executable - Shutdown SickBeard and EITHER <a href=\"http://code.google.com/p/sickbeard/wiki/AdvancedSettings\" onclick=\"window.open(this.href); return false;\">set git_path in your config.ini</a> OR delete your .git folder and run from source to enable updates.", "Message recipient is the same as originator", "Error in retrieving email."], ["ValueError exception should be raised", "Exception not raised: %s", "Could not find an existing submission in location.  rubric is original."], ["Invalid Invitation Token.", "To force deletion of the LAG use delete_force: True", "An error occurred processing your request."]]
        let callFunction = () => {
            printErrors("withdrawal transaction at Kovacek Inc using card ending with ***6291 for IRR 718.83 in account ***77705372", param2)
        }
    
        expect(callFunction).not.toThrow()
    })

    test("2", () => {
        let object = [["Message box: foo; bar\n", "ValueError", "multiple errors occurred", "too many arguments", "invalid choice", "error\n", "error"], "Bad Authentication data", "Counterparty sent error: %s"]
        let param2 = [object, ["An error occurred processing your request.", "Error:", "This is an exception, voilà"], ["Unknown Error", "<error_message>%s</error_message>", "invalid option"]]
        let callFunction = () => {
            printErrors("deposit transaction at Streich, Mann and Rutherford using card ending with ***5156 for TJS 69.36 in account ***97846125", param2)
        }
    
        expect(callFunction).not.toThrow()
    })

    test("3", () => {
        let object = ["Warning: ", ["Message box: foo; bar\n", "ValueError", "multiple errors occurred", "too many arguments", "invalid choice", "error\n", "error"], "the specified credentials were rejected by the server"]
        let object2 = ["Top level object in 'override.yml' needs to be an object", ["Message box: foo; bar\n", "ValueError", "multiple errors occurred", "too many arguments", "invalid choice", "error\n", "error"], "Invalid [%s] value. %s"]
        let param2 = [object, object2, ["Error:", "New Error ", "Uploaded file was not added to the resource. "]]
        let callFunction = () => {
            printErrors("invoice transaction at Larkin Inc using card ending with ***8987 for GHS 889.84 in account ***54986018", param2)
        }
    
        expect(callFunction).not.toThrow()
    })

    test("4", () => {
        let object = ["Could not find an existing submission in location.  rubric is original.", ["Message box: foo; bar\n", "ValueError", "multiple errors occurred", "too many arguments", "invalid choice", "error\n", "error"], "Error in retrieving email."]
        let param2 = [["Unable to find your git executable - Shutdown SickBeard and EITHER <a href=\"http://code.google.com/p/sickbeard/wiki/AdvancedSettings\" onclick=\"window.open(this.href); return false;\">set git_path in your config.ini</a> OR delete your .git folder and run from source to enable updates.", "An error occurred processing your request.", "No response"], ["This is an exception, voilà", "Top level object in 'override.yml' needs to be an object", "Bad Authentication data"], object]
        let callFunction = () => {
            printErrors("invoice transaction at Larkin Inc using card ending with ***8987 for GHS 889.84 in account ***54986018", param2)
        }
    
        expect(callFunction).not.toThrow()
    })

    test("5", () => {
        let callFunction = () => {
            printErrors(undefined, undefined)
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("copyPublicFolder", () => {
    test("0", () => {
        let callFunction = () => {
            copyPublicFolder()
        }
    
        expect(callFunction).not.toThrow()
    })
})
