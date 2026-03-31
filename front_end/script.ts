// Remarquez les declaration de variable ci-dessous

let modalLogin: boolean = false;
let token: string | null = null;
const btnLogin = document.querySelector(".btn-login") as HTMLButtonElement;

btnLogin.addEventListener("click", function () {
  toggleModale();
  validateConnexion();
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
      // Ici nous executons une action si la balise existe

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

async function show(token: string | null, role: "admin" | null): Promise<void> {
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
    (document.querySelector(".recipe-grid") as HTMLElement).innerHTML = "";
    data.forEach((recette) => {
      const card = document.createElement("article");
      card.classList.add("recipe-card");
      card.innerHTML = `
                <div class="card">
                    <img src="https://img.youtube.com/vi/${recette.youtube}/mqdefault.jpg" alt="${recette.title}" loading="lazy">
                   ${
                     role === "admin"
                       ? `<div class="buttonSection">
  <button id="${recette.status}" class="mini-btn visibility" value="${recette.id}">
    ${
      recette.status === "visible"
        ? `<img class="eye" value="visible" src="./assets/eye.png">`
        : `<img class="eye" value="close" src="./assets/noeye.png">`
    }
  </button>
  <button class="mini-btn delette" value="${recette.id}"><img src="./assets/trash.png"></button></div>
`
                       : ""
                   }
                <div class="card-content">
                    <h3>${recette.title}</h3>
                    <p>${recette.description}</p>

                        <button class="btn active btn-view" value="${recette.id}">
                            Voir la recette
                        </button>

                </div>
                </div>
            `;
      document.querySelector(".recipe-grid")!.appendChild(card);
      card.addEventListener("click", function (e) {
        if ((e.target as HTMLButtonElement).classList.contains("btn-view")) {
          document.querySelector(".recip-modal")!.innerHTML =
            `<article><h2>${recette.title}</h2>
          <br>
          <p>${recette.description}</p>
          <br>
          <ul>
          ${recette.etapes
            .map((etape) => {
              return `<li>${etape}</li>`;
            })
            .join("")}
          </ul>
          <br>
          <button class="btn closeRecip active">Close</button></article>
          <iframe width="560" height="315" src="https://www.youtube.com/embed/${recette.youtube}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
          let recipeModal = document.querySelector(
            ".recip-modal",
          ) as HTMLElement;
          recipeModal.classList.add("active");
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
