# Aura & Thread (React)

React + Vite version of the Aura & Thread clothing store (shop, cart, checkout, sign in, sign up).

## Run it

```bash
cd aura-app
npm install
npm run dev
```

Then open the address Vite prints (usually http://localhost:5173).

## Add your images

Copy your old `image` folder into `public/image/` so these paths work:
`/image/logo.png`, `/image/Hoodie1.jpeg`, `/image/shirts1.jpeg`, and so on.
Missing images show an "Image coming soon" placeholder.

## Structure

```
aura-app/
├── index.html
├── package.json
├── vite.config.js
├── public/image/            <- put your images here
└── src/
    ├── main.jsx             entry: router + providers + CSS
    ├── App.jsx              routes: /  /signin  /signup
    ├── data/products.js     products, categories, sizes, colours, slider slides
    ├── context/
    │   ├── AuthContext.jsx  signed-in user (signUp, signIn, signOut)
    │   └── CartContext.jsx  cart state, saved to localStorage
    ├── utils/
    │   ├── authStorage.js   localStorage accounts + PBKDF2 password hashing
    │   └── format.js        price format + placeholder image
    ├── components/          Header, Slider, CategoryBar, ProductGrid, ProductCard,
    │                        CartDrawer, CheckoutModal, Footer, BackToTop, ...
    ├── pages/               Shop, SignIn, SignUp
    └── styles/
        ├── index.css        your original shop CSS (+ a few React additions at the end)
        └── auth.css         your original login CSS, scoped to .auth-page
```

## How the old code maps to React

| Old | New |
| --- | --- |
| index.html / signin.html / signup.html | `Shop.jsx` / `SignIn.jsx` / `SignUp.jsx` with React Router |
| index.js `cart` array + `updateCart()` | `CartContext` (state re-renders the UI automatically) |
| login.js session helpers | `AuthContext` + `utils/authStorage.js` |
| Bootstrap offcanvas / modal (data-bs attributes) | `react-bootstrap` `Offcanvas` and `Modal` |
| `innerHTML` product cards | `ProductCard` component |
| Slider with `setInterval` + DOM updates | `Slider` component with `useState` / `useEffect` |

Accounts, the cart and orders are still stored in the browser's localStorage (demo only).
