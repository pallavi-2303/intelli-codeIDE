import bashlex
import json
import sys

def parse_bash(file_path):
    try:
        with open(file_path, "r") as f:
            code = f.read()
        
        parsed = bashlex.parse(code)  # Parse Bash script
        call_graph = {}  # Stores function calls
        defined_functions = []  # Stores function definitions

        # ✅ Extract function definitions
        for node in parsed:
            if isinstance(node, bashlex.ast.node) and node.kind == "function":
                function_name = node.parts[0].word  # ✅ Extract correct function name
                defined_functions.append(function_name)
                call_graph[function_name] = []  # Initialize empty call graph

        # ✅ Extract function calls inside other functions
        for node in parsed:
            if isinstance(node, bashlex.ast.node) and node.kind == "command":
                if hasattr(node, "parts") and node.parts:
                    command_name = node.parts[0].word  # ✅ Extract correct command
                    for function_name in defined_functions:
                        if function_name in code:  # ✅ Check function body
                            call_graph[function_name].append(command_name)

        return {"callGraph": call_graph, "definedFunctions": defined_functions}

    except Exception as e:
        return {"error": f"Failed to parse Bash: {str(e)}"}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No file provided"}))
        sys.exit(1)

    file_path = sys.argv[1]
    result = parse_bash(file_path)

    # ✅ Ensure valid JSON output
    print(json.dumps(result, indent=4))
