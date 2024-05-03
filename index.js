const API = (() => {
  const URL = "http://localhost:3000";

  const getCart = () => {
    return fetch(`${URL}/cart`).then((response) => response.json());
  };

  const getInventory = () => {
    return fetch(`${URL}/inventory`).then((response) => response.json());
  };

  const addToCart = (inventoryItem) => {
    // define your method to add an item to cart
  };

  const updateCart = (id, newAmount) => {
    // define your method to update an item in cart
  };

  const deleteFromCart = (id) => {
    // define your method to delete an item in cart
  };

  const checkout = () => {
    // you don't need to add anything here
    return getCart().then((data) =>
      Promise.all(data.map((item) => deleteFromCart(item.id)))
    );
  };

  return {
    getCart,
    updateCart,
    getInventory,
    addToCart,
    deleteFromCart,
    checkout,
  };
})();

const Model = (() => {
  class State {
    #onChange;
    #inventory;
    #cart;

    constructor() {
      this.#inventory = [];
      this.#cart = [];
    }

    get cart() {
      return this.#cart;
    }

    get inventory() {
      return this.#inventory;
    }

    set cart(newCart) {
      this.#cart = newCart;
      this.#onChange(this.#cart);
    }

    set inventory(newInventory) {
      this.#inventory = newInventory;
      this.#onChange(this.#inventory);
    }

    subscribe(cb) {
      this.#onChange = cb;
    }
  }

  const {
    getCart,
    updateCart,
    getInventory,
    addToCart,
    deleteFromCart,
    checkout,
  } = API;

  return {
    State,
    getCart,
    updateCart,
    getInventory,
    addToCart,
    deleteFromCart,
    checkout,
  };
})();

const View = (() => {
  const renderInventory = (inventory) => {
    const inventoryList = document.querySelector(".inventory-list");
    inventoryList.innerHTML = "";
    inventory.forEach((item) => {
      const li = document.createElement("li");
      li.innerHTML = `
          ${item.content} 
          <button class="minus-btn">-</button>
          <span class="amount">0</span>
          <button class="plus-btn">+</button>
          <button class="add-to-cart-btn blue">add to cart</button>
      `;
      li.dataset.id = item.id;
      inventoryList.appendChild(li);
    });
  };

  const renderCart = (cart) => {
    const cartList = document.querySelector(".cart-list");
    cartList.innerHTML = "";
    cart.forEach((item) => {
      const li = document.createElement("li");
      li.innerHTML = `
          ${item.content} x ${item.amount}
          <button class="delete-btn red">delete</button>
      `;
      li.dataset.id = item.id;
      cartList.appendChild(li);
    });
  };

  return {
    renderInventory,
    renderCart,
  };
})();

const Controller = ((model, view) => {
  const state = new model.State();

  const init = () => {
    state.subscribe((inventory) => {
      view.renderInventory(inventory);
    });

    model.getInventory().then((inventory) => {
      state.inventory = inventory;
    });

    model.getCart().then((cart) => {
      view.renderCart(cart);
    });

    document.querySelector(".inventory-list").addEventListener("click", (event) => {
      const { target } = event;
      const id = target.parentElement.dataset.id;
      if (target.classList.contains("plus-btn") || target.classList.contains("minus-btn")) {
        const amountSpan = target.parentElement.querySelector(".amount");
        let amount = parseInt(amountSpan.textContent);
        if (target.classList.contains("plus-btn")) {
          amount++;
        } else {
          amount = Math.max(0, amount - 1);
        }
        amountSpan.textContent = amount.toString();
      } else if (target.classList.contains("add-to-cart-btn")) {
        const amount = parseInt(target.parentElement.querySelector(".amount").textContent);
        const item = state.inventory.find((item) => item.id === parseInt(id));
        if (amount > 0) {
          const existingItem = state.cart.find((cartItem) => cartItem.id === item.id);
          if (existingItem) {
            existingItem.amount += amount;
          } else {
            state.cart.push({ ...item, amount });
          }
          view.renderCart(state.cart);
        }
      }
    });

    document.querySelector(".cart-container").addEventListener("click", (event) => {
      const { target } = event;
      if (target.classList.contains("delete-btn")) {
        const id = target.parentElement.dataset.id;
        const itemIndex = state.cart.findIndex((item) => item.id === parseInt(id));
        state.cart.splice(itemIndex, 1);
        view.renderCart(state.cart);
      } else if (target.classList.contains("checkout-btn")) {
        model.checkout()
          .then(() => {
            state.cart = [];
            view.renderCart(state.cart);
            state.inventory.forEach((item) => {
              item.amount = 0;
            });
            view.renderInventory(state.inventory);
          });
      }
    });
  };

  return {
    init,
  };
})(Model, View);

Controller.init();
