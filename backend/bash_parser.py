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

        for node in parsed:
            if isinstance(node, bashlex.ast.node):
                if node.kind == "function":  
                    function_name = node.word  # Extract function name
                    defined_functions.append(function_name)
                    call_graph[function_name] = []  # Initialize call graph

        for node in parsed:
            if isinstance(node, bashlex.ast.node):
                if node.kind == "command" and hasattr(node, "parts"):
                    command_name = node.parts[0].word  # Extract command name
                    for function_name in defined_functions:
                        if function_name in code:
                            call_graph[function_name].append(command_name)

        return {"callGraph": call_graph, "definedFunctions": defined_functions}

    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    file_path = sys.argv[1]
    print(json.dumps(parse_bash(file_path)))
