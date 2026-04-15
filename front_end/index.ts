// Remarquez les declaration de variable ci-dessous

let modalLogin: boolean = false;
let token: string | null = null;
const btnLogin = document.querySelector(".btn-login") as HTMLButtonElement;

btnLogin.addEventListener("click", function () {
  toggleModale();
  validateConnexion();
});

const disconect = function () {
  window.location.reload();
};

const headerCloser = document.querySelector("header") as HTMLElement;
headerCloser.addEventListener("click", function (e) {
  if (!(e.target as HTMLElement).closest("button")) {
    modalLogin = false;
    document.querySelector("main")!.classList.remove("blured");
    document.querySelector(".loginModal")!.classList.remove("active");
    document.querySelectorAll<HTMLButtonElement>(".btn-view").forEach((btn) => {
      btn.setAttribute("tabindex", "0");
      btn.classList.add("active");
    });
    document.querySelector("body")!.classList.remove("fixed");
    const recipeModal = document.querySelector(".recip-modal") as HTMLElement;
    recipeModal.classList.remove("active");
    recipeModal.classList.remove("add-recipe");
    recipeModal.innerHTML = "";
    document.querySelector("main")!.classList.remove("invisible");
  }
});

const btnCloseModale = document.querySelector(
  ".close-modal",
) as HTMLButtonElement;

btnCloseModale.addEventListener("click", function () {
  toggleModale();
});

function validateConnexion() {
  const loginInput = document.querySelector(".login") as HTMLInputElement;
  const passwordInput = document.querySelector(".password") as HTMLInputElement;
  const btnInscription = document.querySelector(
    ".btn-inscription",
  ) as HTMLButtonElement;
  const btnConnexion = document.querySelector(
    ".btn-connection",
  ) as HTMLButtonElement;
  if (loginInput.value.length > 2 && passwordInput.value.length > 2) {
    btnConnexion.setAttribute("tabindex", "0");
    btnConnexion.classList.add("active");
    btnInscription.setAttribute("tabindex", "0");
    btnInscription.classList.add("active");
    btnConnexion.addEventListener("click", connection);
    btnInscription.addEventListener("click", inscription);
  } else {
    btnConnexion.setAttribute("tabindex", "-1");
    btnConnexion.classList.remove("active");
    btnInscription.setAttribute("tabindex", "-1");
    btnInscription.classList.remove("active");
    btnConnexion.removeEventListener("click", connection);
    btnConnexion.removeEventListener("click", inscription);
  }
}

document.addEventListener("keyup", function () {
  validateConnexion();
});

async function inscription() {
  // Grace a la syntaxe suivante nous ciblons un element input
  // Puis nous nous assurons que sa valeure est bien une string

  const username: string = (
    document.querySelector(".login") as HTMLInputElement
  ).value;
  const password: string = (
    document.querySelector(".password") as HTMLInputElement
  ).value;
  const response = await fetch("http://localhost:3000/users/sign_up", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: username,
      password: password,
    }),
  });

  // Nous vennons de voire comment utiliser les types standart proposé par typescript
  // Creons maintenant notre propre type afin de verifier les infos que nous renvoie l'API

  type MonToken = {
    token: string;
    user: "admin" | null;
  };

  // Pour etre valide, la constante data doit etre du type MonToken

  const data: MonToken = await response.json();
  if (response.ok) {
    token = data.token;
    toggleModale();
    console.log(data.user);
    show(token, data.user);

    // Ci dessous nous ciblons le header et grace au ! nous precisons que cette balise existe bien dans le HTML
    // Nous aurions put utiliser ? a la place ce qui signifi que si cette balise existe on lui ajoute la class connected
    document.querySelector<HTMLElement>("header")!.classList.add("connected");
  }
}

async function connection() {
  const username: string = (
    document.querySelector(".login") as HTMLInputElement
  ).value;
  const password: string = (
    document.querySelector(".password") as HTMLInputElement
  ).value;
  const response = await fetch("http://localhost:3000/users/log_in", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: username,
      password: password,
    }),
  });
  type NewUser = {
    token: string;
    user: null;
    message: string;
    userId: number;
  };
  const data: NewUser = await response.json();

  if (response.ok) {
    token = data.token;
    toggleModale();
    show(token, data.user);

    // Ci dessous vous voyez les syntaxes raccourci cité precedemment
    // Ici nous affirmons que cette balise existe

    document.querySelector("header")!.classList.add("connected");
    data.user === "admin" &&
      // Ici nous executons une action si la balise exxiste

      document.querySelector("header")?.classList.add("adminHeader");
    displayUsers(token);
  }
}

const btnLogout = document.querySelector(".btn-logout") as HTMLButtonElement;
const header = document.querySelector("header") as HTMLElement;
btnLogout.addEventListener("click", function () {
  token = null;
  header.classList.remove("connected");
  header.classList.remove("adminHeader");
  document.querySelector("body")!.classList.remove("fixed");
  const recipeModal = document.querySelector(".recip-modal") as HTMLElement;
  recipeModal.classList.remove("active");
  recipeModal.classList.remove("add-recipe");
  recipeModal.innerHTML = "";
  document.querySelector("main")!.classList.remove("invisible");
  show(token, null);
});

function toggleModale() {
  modalLogin = !modalLogin;
  document.querySelector("main")!.classList.toggle("blured");
  document.querySelector(".loginModal")!.classList.toggle("active");
  document.querySelectorAll<HTMLButtonElement>(".btn-view").forEach((btn) => {
    modalLogin
      ? btn.setAttribute("tabindex", "-1")
      : btn.setAttribute("tabindex", "0");
    btn.classList.toggle("active");
  });
}

// Nous devons typer les variables attendu par notre fonction
// Nous pouvons aussi typer la valeur attendu en retour
function toggleFormRecipe(token: string | null, role: "admin" | null): void {
  document.querySelector(".add-recipe")!.addEventListener("click", function () {
    let recipeModal = document.querySelector(".recip-modal") as HTMLElement;
    recipeModal.classList.add("add-recipe");
    recipeModal.innerHTML = `
    <h2>Ajoutez une recette</h2>
    <div class="recipe-form">
      <form class="form-recipe">
              <input type="text" name="title" placeholder="Titre de la recette" required>
              <br>
              <textarea name="description" placeholder="Description de la recette" required></textarea>
              <br>
              <div class="input-etape">
                <br>
                <p>Etapes de la recette</p>
                <textarea name="etapes" placeholder="Etapes de la recette" required></textarea>
                <button type="button" class="add-etape active">  +  </button>
              </div>
              <br>
              
      </form>
      <div class="upload-media">
              <p>(optionnel) Ajoutez une image ou une vidéo de votre recette</p>
              <input type="file" name="file" accept=".jpg, .jpeg, .gif, .webp, .mp4">
      </div>
      </div>
      <button type="button" class="btn sendRecipe active">Envoyer la recette</button>
        `;
    document
      .querySelector(".add-etape")!
      .addEventListener("click", function () {
        const inputEtape = document.querySelector(
          ".input-etape",
        ) as HTMLElement;
        const newEtape = document.createElement("div");
        newEtape.innerHTML = `
        <textarea class="etape-input" name="etapes" placeholder="Etapes de la recette" required></textarea>
        <button class="delete-etape-btn btn-recipe">  -  </button>
        `;
        newEtape.classList.add("one-etape");
        inputEtape.insertBefore(newEtape, document.querySelector(".add-etape"));
        newEtape.children[1].addEventListener("click", function () {
          inputEtape.removeChild(newEtape);
        });
      });
    recipeModal.classList.add("active");
    document.querySelector("body")!.classList.add("fixed");
    document.querySelector("main")!.classList.add("invisible");
    const closeRecipe = document.querySelector(
      ".sendRecipe",
    ) as HTMLButtonElement;
    closeRecipe.addEventListener("click", async function () {
      const title = (
        document.querySelector('[name="title"]') as HTMLInputElement
      ).value;
      const description = (
        document.querySelector('[name="description"]') as HTMLTextAreaElement
      ).value;
      const etapes = Array.from(
        document.querySelectorAll(
          '[name="etapes"]',
        ) as NodeListOf<HTMLTextAreaElement>,
      ).map((etape) => etape.value);
      const formData = new FormData();
      if (title.length < 5 || description.length < 10 || etapes.length === 0) {
        alert(
          "Veuillez remplir tous les champs de la recette (titre, description, etapes)",
        );
        return;
      }
      const recette = {
        title: title,
        description: description,
        etapes: etapes,
      };
      formData.append("recette", JSON.stringify(recette));
      const fileInput = document.querySelector(
        '[name="file"]',
      ) as HTMLInputElement;
      if (fileInput.files && fileInput.files[0]) {
        formData.append("file", fileInput.files[0]);
      }
      const response = await fetch("http://localhost:3000/recettes", {
        method: "POST",
        headers: {
          Authorization: "Bearer " + token,
        },
        body: formData,
      });
      const data = await response.json();

      document.querySelector("body")!.classList.remove("fixed");
      const recipeModal = document.querySelector(".recip-modal") as HTMLElement;
      recipeModal.classList.remove("active");
      recipeModal.classList.remove("add-recipe");
      recipeModal.innerHTML = "";
      document.querySelector("main")!.classList.remove("invisible");
      show(token, role);
    });
  });
}

async function show(token: string | null, role: "admin" | null): Promise<void> {
  token !== null && toggleFormRecipe(token, role);

  let response;
  role === "admin"
    ? (response = await fetch("http://localhost:3000/recettes", {
        headers: { Authorization: "Bearer " + token },
      }))
    : (response = await fetch("http://localhost:3000/recettes/validate"));

  // En plus de permettre la creation de types personalisé nous pouvons utiliser des interface (souvenir POO)
  // Une interface permet de typer un objet dont nous auront besoin dans un autre type

  interface Recipe {
    id: number;
    title: string;
    description: string;
    etapes: string[];
    userId: number;
    imageName?: string;
    youtube?: string;
    status: "visible" | "pending" | "error" | "validate" | "published";
    imageUrl?: string;
  }

  // Servons nous de cette interface pour decrire le type attendu en retour

  const data: Recipe[] = await response.json();
  if (response.ok) {
    const recipeGrid = document.querySelector(".recipe-grid") as HTMLElement;
    recipeGrid.innerHTML = "";

    data.forEach((recette) => {
      const card = document.createElement("article");
      card.classList.add("recipe-card");

      // 1. Structure statique (Squelette)
      // On met des identifiants ou classes pour l'injection
      card.innerHTML = `
                        <div class="card">
                          <img class="recipe-img" loading="lazy">
                          <div class="admin-section"></div>
                          <div class="card-content">
                            <h3 class="recipe-title"></h3>
                            <p class="recipe-desc"></p>
                            <button class="btn active btn-view">
                              Voir la recette
                            </button>
                          </div>
                        </div>
                      `;

      // 2. Injection sécurisée des données (innerText / Attributes)

      // Image (Source dynamique)
      const img = card.querySelector(".recipe-img") as HTMLImageElement;
      const youtubeId =
        recette.youtube !== null ? recette.youtube : "uOQapO-2awo";
      img.src = `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;
      img.alt = recette.title;

      // Textes (innerText pour la sécurité)
      card.querySelector<HTMLElement>(".recipe-title")!.innerText =
        recette.title;
      card.querySelector<HTMLElement>(".recipe-desc")!.innerText =
        recette.description;

      // Bouton voir (on ajoute la value)
      const viewBtn = card.querySelector(".btn-view") as HTMLButtonElement;
      viewBtn.value = recette.id.toString();

      // 3. Section Admin (si rôle === admin)
      if (role === "admin") {
        const adminSection = card.querySelector(".admin-section")!;
        adminSection.innerHTML = `
      <div class="buttonSection">
        <button class="mini-btn visibility">
          <img class="eye">
        </button>
        <button class="mini-btn delette">
          <img src="./assets/trash.png">
        </button>
      </div>
    `;

        const visibilityBtn = adminSection.querySelector(
          ".visibility",
        ) as HTMLButtonElement;
        const eyeImg = adminSection.querySelector(".eye") as HTMLImageElement;
        const deleteBtn = adminSection.querySelector(
          ".delette",
        ) as HTMLButtonElement;

        // Configuration dynamique des boutons admin
        visibilityBtn.id = recette.status;
        visibilityBtn.value = recette.id.toString();
        deleteBtn.value = recette.id.toString();

        if (recette.status === "visible") {
          eyeImg.src = "./assets/eye.png";
          eyeImg.setAttribute("value", "visible");
        } else {
          eyeImg.src = "./assets/noeye.png";
          eyeImg.setAttribute("value", "close");
        }
      }

      recipeGrid.appendChild(card);

      card.addEventListener("click", function (e) {
        if ((e.target as HTMLButtonElement).classList.contains("btn-view")) {
          const modal = document.querySelector(".recip-modal")!;

          // 1. On injecte la structure statique (SQUELETTE)
          modal.innerHTML = `
                              <article>
                                <h2 id="modal-title"></h2>
                                <br>
                                <p id="modal-desc"></p>
                                <br>
                                <ul id="modal-steps"></ul>
                                <br>
                                <button class="btn closeRecip active">Close</button>
                              </article>
                              <div id="modal-media"></div>
                            `;

          // 2. On injecte les données dynamiques avec innerText
          modal.querySelector<HTMLElement>("#modal-title")!.innerText =
            recette.title;
          modal.querySelector<HTMLElement>("#modal-desc")!.innerText =
            recette.description;

          const stepsList = modal.querySelector("#modal-steps")!;
          recette.etapes.forEach((etape) => {
            const li = document.createElement("li");
            li.innerText = etape;
            stepsList.appendChild(li);
          });

          // 3. Gestion du média (iframe ou img)
          const mediaContainer = modal.querySelector("#modal-media")!;
          if (recette.youtube) {
            mediaContainer.innerHTML = `
    <iframe width="560" height="315" 
      src="https://www.youtube.com/embed/${recette.youtube}" 
      title="YouTube video player" frameborder="0" 
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
      referrerpolicy="strict-origin-when-cross-origin" allowfullscreen>
    </iframe>`;
          } else {
            const img = document.createElement("img");
            img.className = "image";
            img.src = recette.imageUrl || "./assets/cake.jpg";
            img.alt = recette.title;
            mediaContainer.appendChild(img);
          }
          let recipeModal = document.querySelector(
            ".recip-modal",
          ) as HTMLElement;
          recipeModal.classList.add("active");
          recipeModal.classList.remove("add-recipe");
          document.querySelector("body")!.classList.add("fixed");
          document.querySelector("main")!.classList.add("invisible");
          const closeRecipe = document.querySelector(
            ".closeRecip",
          ) as HTMLButtonElement;

          closeRecipe.addEventListener("click", function () {
            document.querySelector("body")!.classList.remove("fixed");
            const recipeModal = document.querySelector(
              ".recip-modal",
            ) as HTMLElement;
            recipeModal.classList.remove("active");
            recipeModal.classList.remove("add-recipe");
            recipeModal.innerHTML = "";
            document.querySelector("main")!.classList.remove("invisible");
          });
        }
      });
    });

    if (role === "admin") {
      listener();
    } else {
      document.querySelector(".user-grid")!.innerHTML = "";
    }
  }
}
show(token, null);

// Dans la fonction ci-dessous nous DEVONS ! typer les elements HTML pour nous assurer de pouvoire acceder a leurs proprieté "value"

const listener = function () {
  document.querySelectorAll<HTMLButtonElement>(".visibility").forEach((btn) => {
    btn.addEventListener("click", function () {
      btn.id === "visible"
        ? changeVisibility(Number(btn.value), "validate")
        : changeVisibility(Number(btn.value), "visible");
    });
  });

  // Puisque nos fonctions deletteRecipe et promoteAdmin imposent un id de type number
  // nous devons transformer la value du type string au type number

  document.querySelectorAll<HTMLButtonElement>(".delette").forEach((btn) => {
    btn.addEventListener("click", function () {
      deletteRecipe(Number(btn.value), token);
    });
  });
  document.querySelectorAll<HTMLButtonElement>(".btnAdmin").forEach((btn) => {
    btn.addEventListener("click", function () {
      promoteAdmin(Number(btn.value), token);
    });
  });
};

async function promoteAdmin(id: number, token: string | null): Promise<void> {
  const response = await fetch("http://localhost:3000/users/" + id, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  });
  const data = await response.json();
  if (response.ok) {
    displayUsers(token);
  }
}
async function displayUsers(token: string | null): Promise<void> {
  const response = await fetch("http://localhost:3000/users", {
    method: "GET",
    headers: { Authorization: "Bearer " + token },
  });
  interface User {
    id: number;
    username: string;
    role: "admin" | null;
  }
  type Users = {
    response: User[];
  };
  const users: Users = await response.json();
  document.querySelector(".user-grid")!.innerHTML = "<h2>Utilisateurs</h2>";
  if (response.ok) {
    users.response.forEach((user) => {
      const card = document.createElement("article");
      card.classList.add("user-card");
      card.innerHTML = `<button value="${user.id}" class="${user.role} btn active btnAdmin"> ${user.username}${user.role === "admin" ? "<span>👑</span>" : ""} </button>`;
      document.querySelector(".user-grid")!.appendChild(card);
    });
    listener();
  }
}

async function deletteRecipe(id: number, token: string | null): Promise<void> {
  const response = await fetch("http://localhost:3000/recettes/" + id, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  });
  const data = await response.json();
  if (response.ok) {
    show(token, "admin");
  }
}

async function changeVisibility(id: number, visibility: string): Promise<void> {
  const response = await fetch("http://localhost:3000/recettes/" + id, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({
      visible: visibility,
    }),
  });
  const data = await response.json();

  if (response.ok) {
    show(token, "admin");
  }
}
