import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Editor2 from "@monaco-editor/react";
import { useParams } from "react-router-dom";
import { api_base_url } from "../helper";
import { toast } from "react-toastify";
import SnippetGenerator from "../components/SnippetGenerator";
import GraphViewer from "../components/GraphViewer"; // Import GraphViewer
import Split from "react-split";
// ✅ Import resizable panels

const Editor = () => {
  const [code, setCode] = useState("");
  const { id } = useParams();
  const [output, setOutput] = useState("");
  const [error, setError] = useState(false);
  const [data, setData] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [language, setLanguage] = useState("javascript");
  // Control the visibility of the snippet generator modal
  const [showSnippetModal, setShowSnippetModal] = useState(false);
  const [editorInstance, setEditorInstance] = useState(null);
  const [selectedText, setSelectedText] = useState("");
  const [analysisResult, setAnalysisResult] = useState("");
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);

  useEffect(() => {
    fetch(`${api_base_url}/getProject`, {
      mode: "cors",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: localStorage.getItem("token"),
        projectId: id,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCode(data.project.code);
          setData(data.project);
          setLanguage(data.project.projLanguage);
        } else {
          toast.error(data.msg);
        }
      })
      .catch((err) => {
        console.error("Error fetching project:", err);
        toast.error("Failed to load project.");
      });
  }, [id]);

  // Callback to insert a generated snippet into the current code.
  const handleInsertSnippet = (snippet) => {
    setCode((prevCode) => prevCode + "\n" + snippet);
    setShowSnippetModal(false);
  };

  // Handle Monaco Editor mount to get the editor instance and listen for selection changes
  const handleEditorMount = (editor, monaco) => {
    setEditorInstance(editor);
    editor.onDidChangeCursorSelection(() => {
      const selection = editor.getSelection();
      const text = editor.getModel().getValueInRange(selection);
      setSelectedText(text.trim());
      console.log("Selected Text:", text.trim());
    });
  };

  const saveProject = () => {
    fetch(`${api_base_url}/saveProject`, {
      mode: "cors",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: localStorage.getItem("token"),
        projectId: id,
        code,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          toast.success(data.msg);
        } else {
          toast.error(data.msg);
        }
      })
      .catch((err) => {
        console.error("Error saving project:", err);
        toast.error("Failed to save the project.");
      });
  };

  useEffect(() => {
    const handleSaveShortcut = (e) => {
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        saveProject();
      }
    };
    window.addEventListener("keydown", handleSaveShortcut);
    return () => {
      window.removeEventListener("keydown", handleSaveShortcut);
    };
  }, [code]);

  const runProject = () => {
    fetch("https://emkc.org/api/v2/piston/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language,
        version: data?.version,
        files: [
          {
            filename: `main.${language}`,
            content: code,
          },
        ],
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setOutput(data.run.output);
        setError(data.run.code === 1);
      })
      .catch((err) => console.error("Error running code:", err));
  };
  const handleAnalyzeCode = async () => {
    if (!selectedText) {
      toast.error("Please select some code to analyze.");
      return;
    }
    try {
      const response = await fetch("http://localhost:3000/api/analyze-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codeSnippet: selectedText }),
      });
      const data = await response.json();
      console.log("Analysis response:", data);
      setAnalysisResult(formatText(data.analysis));
      setShowAnalysisModal(true);
    } catch (error) {
      console.error("Error analyzing code:", error);
      toast.error("Error analyzing code");
    }
  };
  function formatText(input) {
    // const boldPattern = /\*\*(.*?)\*\*/g;
    // const italicPattern = /\*(.*?)\*/g;
    // const formattedText = input
    //     .replace(boldPattern, '<strong>$1</strong>')
    //     .replace(italicPattern, '<em>$1</em>');

    return input;
  }

  const analyzeCode = () => {
    fetch(`http://localhost:3000/api/analyzeCode`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, language }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("\n✅ Received API Response:", data); // Debug frontend response
        console.log("Call Graph:", data.callGraph); // Log before setting state
        console.log("Defined Functions:", data.definedFunctions); // Log before setting state
        // ✅ Handle backend errors if present
        if (data.error) {
          console.error("Backend Error:", data.error);
          toast.error(`Error: ${data.error}`);
          return;
        }
        if (
          (!data.callGraph || Object.keys(data.callGraph).length === 0) &&
          (!data.definedFunctions || data.definedFunctions.length === 0)
        ) {
          toast.info("No functions detected in the code.");
        }

        if (data.cycleResult?.message === "No cycles found") {
          toast.info("No cycles detected in the code.");
        }

        if (data.deadCodeResult?.message === "No dead code") {
          toast.info("No dead code found.");
        }

        if (data.callGraph && Object.keys(data.callGraph).length > 0) {
          setAnalysis(data);
          console.log(analysis?.callGraph);
          console.log(analysis?.definedFunctions);
          toast.success("Code analysis completed!");
        }
      })
      .catch((err) => {
        console.error("Error analyzing code: actual Error", err);
        toast.error("Failed to analyze the code.");
      });
  };
  useEffect(() => {
    console.log("Updated Analysis:", analysis);
    console.log("Call Graph:", analysis?.callGraph);
    console.log("Defined Functions:", analysis?.definedFunctions);
  }, [analysis]);
  return (
    <>
      <Navbar />
      <div style={{ height: "calc(100vh - 90px)" }}>
        <Split
          sizes={[50, 50]}
          minSize={200}
          gutterSize={10}
          direction="horizontal"
          style={{ display: "flex", height: "100%" }}
        >
          {/* <div
            className="flex items-center justify-between"
            style={{ height: "calc(100vh - 90px)" }}
          > */}
            <div classname="realative" style={{ height: "100%"}}>
              {/* Floating button for snippet generation */}
              <div
                style={{
                  position: "absolute",
                  bottom: 15,
                  right: 10,
                  zIndex: 1000,
                }}
              >
                <button
                  onClick={() => setShowSnippetModal(true)}
                  className="btnNormal bg-green-500 transition-all hover:bg-green-600 p-2 rounded-md"
                >
                  Generate Snippet
                </button>
              </div>
              {/* Floating button for code analysis: appears if there's a non-empty selection */}
              {selectedText && (
                <div
                  style={{
                    position: "absolute",
                    bottom: 15,
                    left: 10,
                    zIndex: 1000,
                  }}
                >
                  <button
                    onClick={handleAnalyzeCode}
                    className="btnNormal bg-orange-500 transition-all hover:bg-orange-600 p-2 rounded-md"
                  >
                    Analyze Code
                  </button>
                </div>
              )}
              {/* Left Panel - Code Editor */}

              <Editor2
                onChange={(newCode) => setCode(newCode || "")}
                theme="vs-dark"
                height="100%"
                width="100%"
                language={language}
                onMount={handleEditorMount}
                value={code}
              />
            </div>
            {/* Floating Snippet Generator Modal */}
            {showSnippetModal && (
              <div
                className="fixed inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.6)] z-50"
                onClick={() => setShowSnippetModal(false)}
              >
                <div
                  className="bg-[#1e1e1e] p-6 rounded-lg relative"
                  onClick={(e) => e.stopPropagation()}
                  style={{ width: "50%", maxWidth: "600px" }}
                >
                  <button
                    onClick={() => setShowSnippetModal(false)}
                    style={{ position: "absolute", top: 10, right: 10 }}
                    className="text-white"
                  >
                    X
                  </button>
                  <SnippetGenerator
                    onInsert={handleInsertSnippet}
                    lang={data?.projLanguage}
                  />
                </div>
              </div>
            )}
            {/* Resizable Handle */}

            {/* Right Panel - Output & Analysis */}

            <div style={{ height: "100%", overflow: "auto", background: "#27272a", padding: "15px"}}>
            <div className="flex pb-3 border-b-[1px] border-b-[#1e1e1f] items-center justify-between px-[30px]">
                <p className="p-0 m-0">Output</p>
                <button
                  className="btnNormal !w-fit !px-[15px] bg-green-500 hover:bg-green-600"
                  onClick={analyzeCode}
                >
                  Analyze
                </button>
                <button
                  className="btnNormal !w-fit !px-[20px] bg-blue-500 transition-all hover:bg-blue-600"
                  onClick={runProject}
                >
                  Run
                </button>
              </div>

              <pre
                className={`w-full h-[40vh] ${error ? "text-red-500" : ""}`}
                style={{ textWrap: "nowrap" }}
              >
                {output}
              </pre>

              {analysis && (
                <div className="mt-16 p-4 bg-gray-800 text-white rounded-lg">
                  <div className="mt-2 max-h-[280px] overflow-y-auto p-4 bg-gray-800 text-white rounded-lg">
                    <h3 className="text-lg font-semibold">
                      Code Analysis Results
                    </h3>
                    {analysis.callGraph && (
                      <div className="mt-2">
                        <h4 className="font-semibold">Call Graph:</h4>
                        <pre className="bg-gray-900 p-2 overflow-auto text-sm rounded">
                          {JSON.stringify(analysis.callGraph, null, 2)}
                        </pre>
                      </div>
                    )}
                    {analysis.cycleResult && (
                      <div className="mt-2">
                        <h4 className="font-semibold">Cycle Detection:</h4>
                        <pre className="bg-gray-900 p-2 overflow-auto text-sm rounded">
                          {JSON.stringify(analysis.cycleResult, null, 2)}
                        </pre>
                      </div>
                    )}
                    {/* ✅ Display Dead Code Analysis Results */}
                    {analysis.deadCodeResult && (
                      <div className="mt-2">
                        <h4 className="font-semibold">Dead Code Detection:</h4>
                        {analysis.deadCodeResult.deadFunctions &&
                        analysis.deadCodeResult.deadFunctions.length > 0 ? (
                          <pre className="bg-gray-900 p-2 overflow-auto text-sm rounded">
                            {JSON.stringify(
                              analysis.deadCodeResult.deadFunctions,
                              null,
                              2
                            )}
                          </pre>
                        ) : (
                          <p className="text-green-400">
                            No dead code detected
                          </p>
                        )}
                      </div>
                    )}
                    {analysis.errors && analysis.errors.length > 0 && (
                      <div className="mt-2 text-red-500">
                        <h4 className="font-semibold">Detected Issues:</h4>
                        <ul className="list-disc pl-5">
                          {analysis.errors.map((err, index) => (
                            <li key={index}>{err.message}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {/* New Graph Visualization Section */}
                    {analysis.callGraph && analysis.definedFunctions && (
                      <div className="mt-4">
                        <h3 className="text-lg font-bold text-white">
                          Call Graph Visualization
                        </h3>
                        <GraphViewer
                          callGraph={analysis.callGraph}
                          definedFunctions={analysis.definedFunctions}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          {/* </div> */}
        </Split>
      </div>
      {/* Save Project Button */}
      <div style={{ textAlign: "center", marginTop: "10px" }}>
        <button
          onClick={saveProject}
          className="btnNormal bg-blue-500 transition-all hover:bg-blue-600"
          style={{ padding: "10px 20px" }}
        >
          Save Project
        </button>
      </div>
      {/* Analysis Result Modal */}
      {showAnalysisModal && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.6)] z-50"
          onClick={() => setShowAnalysisModal(false)}
        >
          <div
            className="bg-[#1e1e1e] p-6 rounded-lg relative"
            onClick={(e) => e.stopPropagation()}
            style={{ width: "50%", maxWidth: "600px" }}
          >
            <button
              onClick={() => setShowAnalysisModal(false)}
              style={{ position: "absolute", top: 10, right: 10 }}
              className="text-white"
            >
              X
            </button>
            <h3 className="text-white mb-4">Code Analysis</h3>
            <pre
              style={{
                background: "#27272a",
                padding: "10px",
                borderRadius: "4px",
                whiteSpace: "pre-wrap",
                maxHeight: "300px",
                overflowY: "auto",
                color: "#fff",
              }}
            >
              {analysisResult}
            </pre>
          </div>
        </div>
      )}
    </>
  );
};

export default Editor;
