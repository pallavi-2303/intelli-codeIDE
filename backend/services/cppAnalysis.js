const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

function analyzeCppCode(code) {
    const tempFilePath = path.join(__dirname, "temp.cpp");
    fs.writeFileSync(tempFilePath, code);
    
    try {
        const output = execSync(`python cpp_parser.py ${tempFilePath}`).toString();
        return JSON.parse(output); 
    } catch (error) {
        return { error: "Failed to analyze C++ code" };
    } finally {
        fs.unlinkSync(tempFilePath);
    }
}

//  Function to detect cycles in the call graph
function detectCyclesCpp(callGraph) {
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

    return Object.keys(callGraph).some(dfs);
}
function detectDeadCodeCpp(callGraph, definedFunctions) {
    let calledFunctions = new Set();

    // Collect all functions that are actually called
    for (const calls of Object.values(callGraph)) {
        calls.forEach(func => calledFunctions.add(func));
    }

    // Identify functions that are defined but never called
    let deadFunctions = [...definedFunctions].filter(func => !calledFunctions.has(func));

    return deadFunctions.length > 0 
        ? { deadFunctions, message: "Dead code detected" } 
        : { message: "No dead code found" };
}

module.exports = { analyzeCppCode, detectCyclesCpp,detectDeadCodeCpp}; // ✅ Export both functions
