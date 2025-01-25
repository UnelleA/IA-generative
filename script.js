// Fonction pour obtenir des suggestions de prompt à partir de GPT
async function getSuggestionsFromGPT(userInput) {
  const apiKey = "VOTRE_CLE_API";
  const apiUrl = "https://api.openai.com/v1/chat/completions";

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: `Propose trois versions améliorées de cette description pour générer une image : "${userInput}"`,
          },
        ],
        max_tokens: 100,
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      return data.choices[0].message.content.trim().split("\n").slice(0, 3); // Limiter à 3 suggestions
    } else {
      throw new Error(data.error.message || "Erreur inconnue.");
    }
  } catch (error) {
    console.error("Erreur API GPT :", error);
    return [];
  }
}

// Fonction pour générer une image via l'API DALL·E
async function generateImageWithDALL_E(prompt) {
  const apiKey = "VOTRE_CLE_API"; // Remplacez par votre clé API DALL·E
  const apiUrl = "https://api.openai.com/v1/images/generations";

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        prompt: prompt,
        n: 1,
        size: "512x512",
      }),
    });

    const data = await response.json();

    if (response.ok) {
      return data.data[0].url;
    } else {
      throw new Error(data.error.message || "Erreur inconnue.");
    }
  } catch (error) {
    console.error("Erreur API DALL·E :", error);
    return null;
  }
}

// Gérer la génération des suggestions
document
  .getElementById("generatePromptBtn")
  .addEventListener("click", async () => {
    const userInput = document.getElementById("descriptionInput").value;
    const suggestionsList = document.getElementById("suggestionsList");
    suggestionsList.innerHTML = ""; // Réinitialiser la liste

    if (!userInput.trim()) {
      alert("Veuillez entrer une description!");
      return;
    }

    const suggestions = await getSuggestionsFromGPT(userInput);

    if (suggestions.length > 0) {
      suggestions.forEach((suggestion, index) => {
        const suggestionItem = document.createElement("li");
        suggestionItem.textContent = suggestion;
        suggestionItem.addEventListener("click", () => {
          document.getElementById("descriptionInput").value = suggestion; // Modifier la description
          document.getElementById("generateImageBtn").disabled = false; // Activer le bouton
        });
        suggestionsList.appendChild(suggestionItem);
      });
    } else {
      alert("Échec de la génération des suggestions.");
    }
  });

// Gérer la génération d'image
document
  .getElementById("generateImageBtn")
  .addEventListener("click", async () => {
    const prompt = document.getElementById("descriptionInput").value;
    const imageResult = document.getElementById("imageResult");
    const loading = document.getElementById("loading");
    const downloadBtn = document.getElementById("downloadBtn");

    if (!prompt.trim()) {
      alert("Veuillez sélectionner ou modifier un prompt!");
      return;
    }

    imageResult.style.display = "none";
    downloadBtn.style.display = "none";
    loading.style.display = "block";

    const imageUrl = await generateImageWithDALL_E(prompt);

    loading.style.display = "none";

    if (imageUrl) {
      imageResult.src = imageUrl;
      imageResult.style.display = "block";
      downloadBtn.style.display = "block";

      // Gérer le téléchargement de l'image

      // Gérer le téléchargement de l'image
      downloadBtn.addEventListener("click", () => {
        const a = document.createElement("a");
        a.href = imageUrl; // URL de l'image générée
        a.download = "image.png"; // Nom par défaut pour le fichier téléchargé
        a.click(); // Ouvre la fenêtre de téléchargement
      });
    } else {
      alert("Échec de la génération de l'image.");
    }
  });
