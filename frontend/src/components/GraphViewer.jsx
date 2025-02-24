import React, { useEffect, useState } from "react";
import CytoscapeComponent from "react-cytoscapejs";

const GraphViewer = ({ callGraph = {}, definedFunctions = [] }) => {
  const [elements, setElements] = useState([]);

  useEffect(() => {
    console.log("Call Graph Data:", callGraph);
    console.log("Defined Functions (before conversion):", definedFunctions);

    let functionList = new Set();
    if (Array.isArray(definedFunctions)) {
      functionList = new Set(definedFunctions);
    } else if (definedFunctions && typeof definedFunctions === "object") {
      functionList = new Set(Object.keys(definedFunctions));
    }

    // Collect all unique functions (both callers & callees)
    Object.entries(callGraph).forEach(([caller, callees]) => {
      functionList.add(caller);
      if (Array.isArray(callees)) {
        callees.forEach((callee) => functionList.add(callee));
      }
    });

    console.log("📌 All Functions (Callers & Callees):", [...functionList]);

    // Define a grid-based fixed layout (to keep nodes centered)
    const nodePositions = {};
    const centerX = 300; // Center X position
    const centerY = 200; // Center Y position
    const radius = 150; // Distance from the center
    const totalNodes = functionList.size;
    let index = 0;

    const nodes = [...functionList].map((func) => {
      // Arrange nodes in a circular pattern around the center
      const angle = (index / totalNodes) * 2 * Math.PI;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      nodePositions[func] = { x, y };
      index++;

      return {
        data: { id: func, label: func },
        position: { x, y }, // Fixed position
      };
    });

    // Create edges for each call (caller -> callee)
    const edges = [];
    Object.entries(callGraph).forEach(([caller, callees]) => {
      if (Array.isArray(callees)) {
        callees.forEach((callee) => {
          edges.push({ data: { source: caller, target: callee } });
        });
      }
    });

    console.log("📌 Generated Nodes:", nodes);
    console.log("📌 Generated Edges:", edges);

    setElements([...nodes, ...edges]);
  }, [callGraph, definedFunctions]);

  return (
    <div style={{ width: "100%", height: "400px", background: "#1e1e1e" }}>
      <CytoscapeComponent
        elements={elements}
        style={{ width: "100%", height: "100%" }}
        layout={{ name: "preset" }} // Use fixed node positions
        cy={(cy) => {
          cy.zoomingEnabled(false); // Disable zoom to keep the graph size fixed
          cy.center(); // Keep the graph centered
          cy.fit(); // Adjust to fit within the viewport
        }}
        stylesheet={[
          {
            selector: "node",
            style: {
              "background-color": "#0074D9",
              label: "data(label)",
              "text-valign": "center",
              color: "#fff",
              "font-size": "12px",
              "text-halign": "center",
              width: "40px", // Fixed node size
              height: "40px",
            },
          },
          {
            selector: "edge",
            style: {
              width: 2,
              "line-color": "#ccc",
              "target-arrow-color": "#ccc",
              "target-arrow-shape": "triangle",
              "curve-style": "bezier",
            },
          },
        ]}
      />
    </div>
  );
};

export default GraphViewer;
