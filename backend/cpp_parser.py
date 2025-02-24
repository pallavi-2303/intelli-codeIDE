import clang.cindex
import json
import sys
import os

# Set libclang path manually (Adjust the path to your actual installation)
clang_path = "C:/Program Files/LLVM/bin/libclang.dll"
clang.cindex.Config.set_library_file(clang_path)

def parse_cpp(file_path):
    index = clang.cindex.Index.create()
    
    # Ensure the file exists before parsing
    if not os.path.exists(file_path):
        return {"error": f"File {file_path} not found"}

    try:
        translation_unit = index.parse(file_path)
    except clang.cindex.TranslationUnitLoadError:
        return {"error": "Failed to parse C++ file. Ensure the file is valid and Clang is installed properly."}

    functions = {}

    for node in translation_unit.cursor.walk_preorder():
        if node.kind == clang.cindex.CursorKind.FUNCTION_DECL:
            functions[node.spelling] = [
                c.spelling for c in node.get_children() if c.kind == clang.cindex.CursorKind.CALL_EXPR
            ]

    return functions

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No file path provided"}))
        sys.exit(1)
    
    file_path = sys.argv[1]
    print(json.dumps(parse_cpp(file_path)))
