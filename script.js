const firebaseConfig = {
  apiKey: "AIzaSyDzegHuuswkf0srLpUOP2_057knqUEBMfA",
  authDomain: "moda3-442f5.firebaseapp.com",
  databaseURL: "https://moda3-442f5-default-rtdb.firebaseio.com",
  projectId: "moda3-442f5",
  storageBucket: "moda3-442f5.firebasestorage.app",
  messagingSenderId: "545997757851",
  appId: "1:545997757851:web:6f7680cfafbfec4038153e",
  measurementId: "G-KFW99TWCLS",
};

firebase.initializeApp(firebaseConfig);
var database = firebase.database();

$(document).ready(function () {
  const adminUid = "";

  const auth = firebase.auth();
  const db = firebase.database();
  let currentUser = null;

  auth.onAuthStateChanged(function (user) {
    currentUser = user;
    updateUI();
    if (typeof readLooks === "function") {
      readLooks();
    }
  });

  function updateUI() {
    const authContainer = $("#auth-container");
    if (!authContainer.length) return;

    if (currentUser) {
      const displayName = currentUser.displayName || currentUser.email;
      let adminButton = "";

      if (currentUser.uid === adminUid) {
        // Lógica para o botão de administrador, se necessário
      }

      authContainer.html(`
        <span class="navbar-text me-3">Olá, ${displayName}</span>
        <button class="btn btn-danger" id="logout-button">Sair</button>
      `);
      $("#logout-button").on("click", () => auth.signOut());
    } else {
      authContainer.html(
        `<a href="login.html" class="btn btn-primary">Login / Cadastrar</a>`
      );
    }
  }

  if ($("#auth-button").length) {
    let isLoginMode = true;

    $("#toggle-mode").on("click", function (e) {
      e.preventDefault();
      isLoginMode = !isLoginMode;

      if (isLoginMode) {
        $("#form-title").text("Acesse sua Conta");
        $("#name-field").hide();
        $("#auth-button").text("Entrar");
        $("#toggle-mode").text("Não tem uma conta? Crie uma agora!");
      } else {
        $("#form-title").text("Crie sua Conta");
        $("#name-field").show();
        $("#auth-button").text("Criar Conta");
        $("#toggle-mode").text("Já tem uma conta? Acesse aqui!");
      }
    });

    $("#auth-button").on("click", function () {
      const email = $("#login-email").val();
      const password = $("#login-password").val();

      if (isLoginMode) {
        auth
          .signInWithEmailAndPassword(email, password)
          .then(() => {
            window.location.href = "index.html";
          })
          .catch((error) => {
            alert("Erro no login: " + error.message);
          });
      } else {
        const name = $("#signup-name").val();
        if (!name) {
          alert("Por favor, preencha seu nome.");
          return;
        }

        auth
          .createUserWithEmailAndPassword(email, password)
          .then((userCredential) => {
            return userCredential.user.updateProfile({
              displayName: name,
            });
          })
          .then(() => {
            alert("Conta criada com sucesso! Você já pode fazer o login.");
            $("#toggle-mode").click();
          })
          .catch((error) => {
            alert("Erro ao criar conta: " + error.message);
          });
      }
    });
  }

  if ($("#secao-primavera").length) {
    const looksRef = db.ref("looks");

    window.readLooks = function () {
      looksRef.on("value", function (snapshot) {
        $(".secao-looks .row").empty();
        snapshot.forEach(function (childSnapshot) {
          const key = childSnapshot.key;
          const look = childSnapshot.val();
          look.id = key;

          const cardHtml = `
                <div class="col-md-4 mb-4">
                    <div class="card h-100">
                        <img class="card-img-top" src="${
                          look.imageUrl ||
                          "https://dummyimage.com/450x300/dee2e6/6c757d.jpg"
                        }" alt="${look.name}" />
                        <div class="card-body p-4">
                            <div class="text-center">
                                <h5 class="fw-bolder">${look.name}</h5>
                                <span>${look.pieces}</span>
                            </div>
                        </div>
                        <div class="card-footer p-4 pt-0 border-top-0 bg-transparent">
                            <div class="text-center">
                                <button class="btn btn-outline-dark mt-auto" onclick='addToCart(${JSON.stringify(
                                  look
                                )})'>Adicionar ao carrinho</button>
                            </div>
                        </div>
                    </div>
                </div>`;

          if (look.estacao) {
            $(`#secao-${look.estacao} .row`).append(cardHtml);
          }
        });
      });
    };
    readLooks();
  }

  let cart = JSON.parse(localStorage.getItem("shoppingCart")) || [];

  window.addToCart = function (look) {
    cart.push(look);
    saveCart();
    updateCartUI();
  };

  window.removeFromCart = function (index) {
    cart.splice(index, 1);
    saveCart();
    updateCartUI();
  };

  function saveCart() {
    localStorage.setItem("shoppingCart", JSON.stringify(cart));
  }

  function updateCartUI() {
    const cartItemsContainer = $("#cart-items");
    if (!cartItemsContainer.length) return;

    cartItemsContainer.empty();

    if (cart.length === 0) {
      cartItemsContainer.html("<p>Seu carrinho está vazio.</p>");
    } else {
      cart.forEach((item, index) => {
        const itemHtml = `
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span>${item.name}</span>
            <button class="btn btn-danger btn-sm" onclick="removeFromCart(${index})">X</button>
          </div>`;
        cartItemsContainer.append(itemHtml);
      });
    }
  }
  updateCartUI();
});
