import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Editor2 from '@monaco-editor/react';
import { useParams } from 'react-router-dom';
import { api_base_url } from '../helper';
import { toast } from 'react-toastify';
import axios from "axios";
const Editor = () => {
  const [code, setCode] = useState("");
  const { id } = useParams();
  const [output, setOutput] = useState("");
  const [error, setError] = useState(false);
  const [data, setData] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [language, setLanguage] = useState("javascript");
  useEffect(() => {
    fetch(`${api_base_url}/getProject`, {
      mode: 'cors',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: localStorage.getItem('token'),
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
        console.error('Error fetching project:', err);
        toast.error('Failed to load project.');
      });
  }, [id]);

  const saveProject = () => {
    fetch(`${api_base_url}/saveProject`, {
      mode: 'cors',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: localStorage.getItem('token'),
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
        console.error('Error saving project:', err);
        toast.error('Failed to save the project.');
      });
  };

  useEffect(() => {
    const handleSaveShortcut = (e) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        saveProject();
      }
    };
    window.addEventListener('keydown', handleSaveShortcut);
    return () => {
      window.removeEventListener('keydown', handleSaveShortcut);
    };
  }, [code]);

  const runProject = () => {
    fetch("https://emkc.org/api/v2/piston/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language,
        version: data?.version,
        files: [{
          filename: `main.${language}`,
          content: code,
        }]
      })
    })
      .then(res => res.json())
      .then(data => {
        setOutput(data.run.output);
        setError(data.run.code === 1);
      })
      .catch(err => console.error("Error running code:", err));
  };

  const analyzeCode = () => {
    fetch(`http://localhost:3000/api/analyzeCode`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, language })
    })
      .then(res => res.json())
      .then(data => {
        console.log(data);
        if (data.callGraph && Object.keys(data.callGraph).length > 0) {
      
          setAnalysis(data);
          toast.success("Code analysis completed!");
        } else {
          console.log(data.error);
          toast.error("Error analyzing code.");
        }
      })
      .catch(err => {
        console.error("Error analyzing code:", err);
        toast.error("Failed to analyze the code.");
      });
  };

  return (
    <>
      <Navbar />
      <div className="flex items-center justify-between" style={{ height: 'calc(100vh - 90px)' }}>
        <div className="left w-[50%] h-full">
          <Editor2
            onChange={(newCode) => setCode(newCode || '')}
            theme="vs-dark"
            height="100%"
            width="100%"
            language={language}
            value={code}
          />
        </div>
        <div className="right p-[15px] w-[50%] h-full bg-[#27272a]">
          <div className="flex pb-3 border-b-[1px] border-b-[#1e1e1f] items-center justify-between px-[30px]">
            <p className="p-0 m-0">Output</p>
            <button className="btnNormal !w-fit !px-[15px] bg-green-500 hover:bg-green-600" onClick={analyzeCode}>Analyze</button>
            <button className="btnNormal !w-fit !px-[20px] bg-blue-500 transition-all hover:bg-blue-600" onClick={runProject}>Run</button>
          </div>

          <pre className={`w-full h-[40vh] ${error ? "text-red-500" : ""}`} style={{ textWrap: "nowrap" }}>
            {output}
          </pre>

          {analysis && (
            <div className="mt-16 p-4 bg-gray-800 text-white rounded-lg">
              <div className='mt-2 max-h-[280px] overflow-y-auto p-4 bg-gray-800 text-white rounded-lg'>
              <h3 className="text-lg font-semibold">Code Analysis Results</h3>
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
        {analysis.deadCodeResult.deadFunctions && analysis.deadCodeResult.deadFunctions.length > 0 ? (
          <pre className="bg-gray-900 p-2 overflow-auto text-sm rounded">
            {JSON.stringify(analysis.deadCodeResult.deadFunctions, null, 2)}
          </pre>
        ) : (
          <p className="text-green-400">No dead code detected</p>
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
              </div>
            </div> 
          )}
        </div>
      </div>
    </>
  );
};

export default Editor;
