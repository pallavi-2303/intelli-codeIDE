const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

function analyzeBashCode(code) {
    if (!code || typeof code !== "string" || code.trim() === "") {
        return { error: "Invalid Bash code provided" };
    }

    const tempFilePath = path.join(__dirname, "temp.sh");
    fs.writeFileSync(tempFilePath, code);

    try {
        if (!fs.existsSync("bash_parser.py")) {
            throw new Error("bash_parser.py not found in directory.");
        }

        const output = execSync(`python bash_parser.py ${tempFilePath}`, { encoding: "utf-8" }).trim();
        if (!output) {
            return { error: "No output received from parser" };
        }

        let parsedData;
        try {
            console.log("Raw Output from bash_parser.py:", output);
            parsedData = JSON.parse(output);
        } catch (err) {
            console.error("JSON Parse Error:", err.message, "Raw Output:", output);
            return { error: `Failed to parse JSON: ${err.message}` };
        }

        // ✅ Ensure required fields exist
        if (!parsedData.callGraph || typeof parsedData.callGraph !== "object") {
            parsedData.callGraph = {}; // Default empty object
        }
        if (!parsedData.definedFunctions || !Array.isArray(parsedData.definedFunctions)) {
            parsedData.definedFunctions = []; // Default empty array
        }

        return parsedData;
    } catch (error) {
        console.error("Bash analysis failed:", error.message);
        return { error: `Failed to analyze Bash code: ${error.message}` };
    } finally {
        if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
        }
    }
}

module.exports = { analyzeBashCode };
