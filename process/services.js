import ai from "./gemini.js";

const generateResponse = async (prompt) => {
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt
    })
    return response.text;
}

export default generateResponse