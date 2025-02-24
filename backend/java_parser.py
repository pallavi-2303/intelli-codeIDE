import javalang
import json
import sys

def parse_java(file_path):
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            code = f.read()

        tree = javalang.parse.parse(code)
        call_graph = {}
        defined_functions = set()

        # ✅ Extract function definitions and calls
        for path, node in tree.filter(javalang.tree.MethodDeclaration):
            function_name = node.name
            defined_functions.add(function_name)
            call_graph[function_name] = []

            for _, invoc in node.filter(javalang.tree.MethodInvocation):
                call_graph[function_name].append(invoc.member)

        # ✅ Detect cycles
        has_cycles = detect_cycles(call_graph)
        cycle_message = "Cycle detected" if has_cycles else "No cycles found"

        # ✅ Detect dead code
        called_functions = {callee for callees in call_graph.values() for callee in callees}
        dead_functions = [func for func in defined_functions if func not in called_functions]

        # ✅ Construct result JSON
        result = {
            "callGraph": call_graph,
            "definedFunctions": list(defined_functions),
            "cycleResult": {"message": cycle_message},
            "deadCodeResult": {
                "message": "Dead code found" if dead_functions else "No dead code detected",
                "deadFunctions": dead_functions
            }
        }

        # ✅ Ensure proper UTF-8 encoding
        print(json.dumps(result, indent=4, ensure_ascii=False))
        return result

    except Exception as e:
        print(json.dumps({"error": str(e)}, ensure_ascii=False))  # Fix encoding issue
        return {"error": str(e)}

# ✅ Function to detect cycles using DFS
def detect_cycles(call_graph):
    visited = set()
    stack = set()

    def dfs(node):
        if node in stack:
            return True  # Cycle detected
        if node in visited:
            return False

        visited.add(node)
        stack.add(node)

        for neighbor in call_graph.get(node, []):
            if dfs(neighbor):
                return True

        stack.remove(node)
        return False

    for function in call_graph:
        if dfs(function):
            return True
    return False

# ✅ Run Java parser
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No file path provided"}, ensure_ascii=False))
        sys.exit(1)

    file_path = sys.argv[1]
    parse_java(file_path)
