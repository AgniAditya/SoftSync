const getUserResponse = async () => {
  const prompt = "Hello, My name is Jia"
  const res = await window.versions.getUserResponse(prompt)
  const information = document.getElementById('info')
  information.innerText = `User: ${prompt} | Gemini: ${res}`
}

const completeUserTask = async () => {
  const prompt = "Hey schedule a meeting regarding the softsync project of 10 people only on 18-March-2026 at 3:00 pm"
  const res = await window.versions.getUserTaskResponse(prompt)
  console.log(res);
}

completeUserTask()
getUserResponse()