
const getUserResponse = async () => {
  const prompt = "Hello, My name is Jia"
  const res = await window.versions.getUserResponse(prompt)
  const information = document.getElementById('info')
  information.innerText = `User: ${prompt} | Gemini: ${res}`
}

getUserResponse()
func()