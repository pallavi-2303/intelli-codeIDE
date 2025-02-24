const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

function analyzeBashCode(code) {
    const tempFilePath = path.join(__dirname, "temp.sh");
    fs.writeFileSync(tempFilePath, code);

    try {
        const output = execSync(`python3 bash_parser.py ${tempFilePath}`).toString().trim();

        if (!output) {
            return { error: "No output received from parser" };
        }

        let parsedData;
        try {
            parsedData = JSON.parse(output);
        } catch (err) {
            return { error: "Failed to parse JSON output" };
        }

        if (!parsedData.functions || typeof parsedData.functions !== "object") {
            return { error: "Invalid parser response format" };
        }

        return parsedData;
    } catch (error) {
        return { error: `Failed to analyze Bash code: ${error.message}` };
    } finally {
        fs.unlinkSync(tempFilePath);
    }
}

// ✅ Function to detect cycles in the call graph
function detectCyclesBash(callGraph) {
    if (!callGraph || typeof callGraph !== "object" || Object.keys(callGraph).length === 0) {
        return { error: "Invalid call graph provided" };
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

    return { hasCycle: Object.keys(callGraph).some(dfs) };
}

// ✅ Function to detect dead code in Bash scripts
function detectDeadCodeBash(graph, definedFunctions) {
    if (!graph || typeof graph !== "object" || Object.keys(graph).length === 0) {
        return { error: "Invalid graph provided" };
    }
    if (!Array.isArray(definedFunctions) || definedFunctions.length === 0) {
        return { error: "Invalid defined functions list provided" };
    }

    let calledFunctions = new Set();

    for (const calls of Object.values(graph)) {
        if (Array.isArray(calls)) {
            calls.forEach(func => calledFunctions.add(func));
        }
    }

    let deadFunctions = definedFunctions.filter(func => !calledFunctions.has(func));

    return { deadFunctions, message: deadFunctions.length > 0 ? "Dead code found" : "No dead code" };
}

// ✅ Export functions
module.exports = { analyzeBashCode, detectCyclesBash, detectDeadCodeBash };
