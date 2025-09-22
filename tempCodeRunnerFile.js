const axios = require("axios");

const credentials = [
  { email: "test1@example.com", password: "password1" },
  { email: "test2@example.com", password: "password2" },
  // ajouter d’autres combinaisons pour tester
];

async function testLogin() {
  for (const cred of credentials) {
    try {
      const response = await axios.post("http://localhost:3000/Utilisateur/Connexion", {
        Email: cred.email,
        MotDePasse: cred.password
      }, {
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (response.data.includes("connexion réussie")) {
        console.log(`Succès avec : ${cred.email} / ${cred.password}`);
        break;
      } else {
        console.log(`Échec : ${cred.email} / ${cred.password}`);
      }
    } catch (err) {
      console.error("Erreur de requête :", err.message);
    }
  }
}

testLogin();
