const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;

// Function to analyze JavaScript code
function analyzeJSCode(code) {
    const ast = parser.parse(code, { sourceType: "module" });
    let graph = {};
    let definedFunctions = new Set(); // ✅ Initialize definedFunctions

    traverse(ast, {
        FunctionDeclaration(path) {
            const functionName = path.node.id.name;
            definedFunctions.add(functionName);
            if (!graph[functionName]) graph[functionName] = [];
        },
        CallExpression(path) {
            if (path.node.callee.type === "Identifier") {
                const calleeName = path.node.callee.name;
                const caller = path.getFunctionParent()?.node?.id?.name;
                if (caller && calleeName) {
                    if (!graph[caller]) graph[caller] = [];
                    graph[caller].push(calleeName);
                }
            }
        }
    });

    return { graph, definedFunctions };
}

// Function to detect cycles
function detectCyclesJS(graph) {
    const visited = new Set();
    const stack = new Set();
    let cycles = [];

    function dfs(node) {
        if (stack.has(node)) {
            cycles.push(node);
            return;
        }
        if (visited.has(node)) return;

        visited.add(node);
        stack.add(node);

        for (const neighbor of graph[node] || []) {
            dfs(neighbor);
        }

        stack.delete(node);
    }

    for (const node in graph) {
        if (!visited.has(node)) {
            dfs(node);
        }
    }

    return cycles.length > 0 ? { cycles, message: "Cycle detected" } : { message: "No cycles found" };
}

// Function to detect dead code
function detectDeadCode(graph, definedFunctions) {
    let calledFunctions = new Set();

    // Collect all functions that are called
    for (const calls of Object.values(graph)) {
        calls.forEach(func => calledFunctions.add(func));
    }

    // Find functions that are never called
    let deadFunctions = [...definedFunctions].filter(func => !calledFunctions.has(func));

    return deadFunctions.length > 0 ? { deadFunctions, message: "Dead code found" } : { message: "No dead code" };
}

module.exports = { analyzeJSCode, detectCyclesJS, detectDeadCode };
