const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

function analyzeJavaCode(code) {
    const tempFilePath = path.join(__dirname, "temp.java");
    fs.writeFileSync(tempFilePath, code);

    try {
        const output = execSync(`python java_parser.py ${tempFilePath}`).toString();
        console.log("\n🔹 RAW PARSER OUTPUT:", output); 
        const result = JSON.parse(output);

        //  Validate Call Graph
        if (!result.callGraph || Object.keys(result.callGraph).length === 0) {
            console.error(" Invalid Call Graph:", result);
            return { callGraph: {}, definedFunctions: [], error: "Invalid call graph provided" };
        }

        return result;
    } catch (error) {
        console.error(" Java code analysis error:", error);
        return { callGraph: {}, definedFunctions: [], error: "Failed to analyze Java code" };
    } finally {
        fs.unlinkSync(tempFilePath);
    }
}

// ✅ Fix Cycle Detection Function
function detectCyclesJava(callGraph) {
    if (!callGraph || typeof callGraph !== "object" || Object.keys(callGraph).length === 0) {
        return { message: "Invalid call graph provided" };
    }

    const visited = new Set();
    const stack = new Set();

    function dfs(node) {
        if (stack.has(node)) return true; // Cycle detected
        if (visited.has(node)) return false;

        visited.add(node);
        stack.add(node);

        for (let neighbor of callGraph[node] || []) {
            if (dfs(neighbor)) return true;
        }

        stack.delete(node);
        return false;
    }

    return Object.keys(callGraph).some(dfs) ? { message: "Cycle detected" } : { message: "No cycles found" };
}

//  Fix Dead Code Detection
function detectDeadCodeJava(callGraph, definedFunctions) {
    if (!callGraph || typeof callGraph !== "object" || Object.keys(callGraph).length === 0 || !Array.isArray(definedFunctions)) {
        return { message: "Invalid input for dead code detection" };
    }

    let calledFunctions = new Set();
    for (const calls of Object.values(callGraph)) {
        calls.forEach(func => calledFunctions.add(func));
    }

    let deadFunctions = definedFunctions.filter(func => !calledFunctions.has(func));

    return deadFunctions.length > 0 ? { deadFunctions, message: "Dead code found" } : { message: "No dead code detected" };
}

module.exports = { analyzeJavaCode, detectCyclesJava, detectDeadCodeJava };
