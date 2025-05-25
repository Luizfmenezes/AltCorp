document.getElementById("login-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
  
    const username = (document.getElementById("username") as HTMLInputElement).value;
    const password = (document.getElementById("password") as HTMLInputElement).value;
  
    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);
  
    const mensagem = document.getElementById("mensagem") as HTMLElement;
  
    try {
      const response = await fetch("http://localhost:8000/login", {
        method: "POST",
        body: formData,
      });
  
      const data = await response.json();
  
      if (response.ok) {
        mensagem.textContent = data.message;
        mensagem.style.color = "green";
      } else {
        mensagem.textContent = data.detail;
        mensagem.style.color = "red";
      }
    } catch (error) {
      mensagem.textContent = "Erro na conexão com o servidor.";
      mensagem.style.color = "red";
    }
  });
  