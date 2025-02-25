const { analyzeJSCode, detectCyclesJS, detectDeadCode } = require("../services/jsAnalysis");
const { analyzeJavaCode, detectCyclesJava, detectDeadCodeJava } = require("../services/javaAnalysis");
const { analyzeCppCode, detectCyclesCpp, detectDeadCodeCpp } = require("../services/cppAnalysis");
const { analyzeBashCode, detectCyclesBash, detectDeadCodeBash } = require("../services/bashAnalysis");

exports.analyzeCode = (req, res) => {
    try {
        const { code, language } = req.body;
        if (!code) return res.status(400).json({ message: "No code provided" });


        let callGraph = {}; // ✅ Ensure it's always an object
        let cycleResult = { message: "No cycles found" }; // ✅ Default cycle result
        let deadCodeResult = []; // ✅ Default dead code array
        let definedFunctions = []; // ✅ Default to an empty array

        switch (language) {
            case "javascript":
                const jsResult = analyzeJSCode(code);
                callGraph = jsResult.graph;
                definedFunctions = jsResult.definedFunctions; // ✅ Extract functions
                console.log("Extracted Defined Functions:", definedFunctions); // ✅ Check if empty

                cycleResult = detectCyclesJS(callGraph);
                deadCodeResult = detectDeadCode(callGraph, jsResult.definedFunctions);
                break;
            case "java":
                const javaResult = analyzeJavaCode(code);
                console.log("\n🔹 Java Analysis Result:", javaResult); // ✅ Debugging

                if (javaResult.error) {
                    return res.status(500).json({ message: javaResult.error });
                }

                callGraph = javaResult.callGraph;
                definedFunctions = javaResult.definedFunctions; // ✅ Extract functions
                if (!callGraph || Object.keys(callGraph).length === 0) {
                    return res.status(400).json({ message: "No functions found in Java code" });
                }

                cycleResult = detectCyclesJava(callGraph);
                deadCodeResult = detectDeadCodeJava(callGraph, javaResult.definedFunctions);
                break;
            case "cpp":
                const cppResult = analyzeCppCode(code);
                callGraph = cppResult.callGraph;
                definedFunctions = cppResult.definedFunctions; // ✅ Extract functions
                cycleResult = detectCyclesCpp(callGraph);
                deadCodeResult = detectDeadCodeCpp(callGraph, cppResult.definedFunctions);
                break;
            case "bash":
                const bashResult = analyzeBashCode(code);
                callGraph = bashResult.callGraph;
                definedFunctions = bashResult.definedFunctions; // ✅ Extract functions
                cycleResult = detectCyclesBash(callGraph);
                deadCodeResult = detectDeadCodeBash(callGraph, bashResult.definedFunctions);
                break;
            default:
                return res.status(400).json({ message: "Unsupported language" });
        }
console.log(definedFunctions);

        res.json({ callGraph, cycleResult, deadCodeResult,  definedFunctions: Array.from(definedFunctions) })// Convert Set to array });
    } catch (error) {
        console.error("Error analyzing code:", error);
        res.status(500).json({ message: "Error analyzing code" });
    }
};
