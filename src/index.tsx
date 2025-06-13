import { createRoot } from "react-dom/client";
import React from 'react';
import App from "./App";

const rootElement = document.getElementById("root");

createRoot(rootElement!).render(<App />);
