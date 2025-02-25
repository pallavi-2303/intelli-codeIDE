# Full-Stack-Multi-Code-IDE
# **Intelligent Online IDE 🚀**  
An AI-powered **online multi-language IDE** supporting **C, C++, JavaScript, Java, and Bash**, with real-time collaboration, AI-driven code analysis, and automated debugging.  

##  Features
✅ **Multi-language Support** – Edit & run C++, JavaScript, Java, and Bash.  
✅ **Graph-Based Code Analysis** – AST generation, call graphs, and dependency tracking.  
✅ **AI-Powered Debugging** – Instant error detection and suggestions using the Gemini API.  
✅ **Real-Time Collaboration** – Google Docs-style live coding with WebSockets.  
✅ **Automated Snippet Generation** – Convert natural language to code.  
✅ **Project Management** – Authentication, saving, editing, and deleting projects.  

---

## **🛠️ Tech Stack**  
### **Frontend**  
- React.js  
- Monaco Editor  
- react-split (Resizable Panels)  

### **Backend**  
- Node.js  
- Express.js  
- MongoDB (Database)  

### **AI & Analysis**  
- Gemini API (AI Code Suggestions & Debugging)  
- AST Parsing (Babel, JavaParser, clang, bash-parser)  
- Graph Visualization (Cytoscape.js, react-flow)  

---

## **⚙️ Environment Setup**  
### **🔹 Prerequisites**  
Ensure you have the following installed:  
- **Node.js** (v16+)  
- **MongoDB** (Local or Atlas)  
- **Git**
- Create a .env file in backend folder with 3 variables named
- MONGO_URI="give your mongo uri"
- GEMINI_API_KEY="your gemini api key"
- PORT=3000

### **🔹 Clone the Repository**  
git clone https://github.com/pallavi-2303/intelli-codeIDE/edit/main/README.md
cd intelli-codeIDE
