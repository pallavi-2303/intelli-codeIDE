// SnippetGenerator.jsx
import React, { useState } from 'react';
import { toast } from 'react-toastify';

const SnippetGenerator = ({ onInsert ,lang}) => {
  const [prompt, setPrompt] = useState("");
  const [generatedSnippet, setGeneratedSnippet] = useState("");

  function formatSnippet(rawSnippet) {
    // Trim the snippet to remove leading/trailing whitespace.
    let formatted = rawSnippet.trim();
    const lines = formatted.split('\n');
  
    // If the first line starts with triple backticks, remove it.
    if (lines[0].startsWith('```')) {
      lines.shift();
    }
    if (lines[lines.length - 1].endsWith('```')) {
      lines.pop();
    }
  
    return lines.join('\n').trim();
  }
  
  
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }
    try {
      const response = await fetch("http://localhost:3000/api/generate-snippet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, language: lang }),
      });
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0 && data[0].generated_text) {
        setGeneratedSnippet(formatSnippet(data[0].generated_text));
      } else {
        setGeneratedSnippet("No snippet generated");
      }
    } catch (error) {
      console.error("Error generating snippet:", error);
      toast.error("Error generating snippet");
    }
  };

  return (
    <div style={{ color: '#fff' }}>
      <h2 className='font-bold text-lg mb-1'>Snippet Generator</h2>
      <textarea
      className='text-black'
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Type your prompt here, e.g. // function to calculate factorial"
        rows={4}
        style={{ width: '100%', marginBottom: '10px', padding: '10px', borderRadius: '4px' }}
      />
      <br />
      <button className='p-2 bg-slate-500 border border-gray-700 rounded-md hover:bg-slate-800' onClick={handleGenerate} style={{ padding: '10px 20px', cursor: 'pointer', marginRight: '10px' }}>
        Generate Snippet
      </button>
      {generatedSnippet && (
        <>
          <h3>Generated Code:</h3>
          <pre style={{ 
      background: '#27272a', 
      padding: '10px', 
      borderRadius: '4px', 
      whiteSpace: 'pre-wrap', 
      maxHeight: '300px',   
      overflowY: 'auto'     
    }}>
            {generatedSnippet}
          </pre>
          <button
          className='p-2 bg-slate-500 border border-gray-700 rounded-md hover:bg-slate-800'
            onClick={() => onInsert(generatedSnippet)}
            style={{ padding: '10px 20px', cursor: 'pointer', marginTop: '10px' }}
          >
            Insert Snippet
          </button>
        </>
      )}
    </div>
  );
};

export default SnippetGenerator;
