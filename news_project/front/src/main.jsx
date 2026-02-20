import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// 1. 공통 스타일을 먼저!
import './css/common.css';
// 2. 전용 스타일을 나중에! (그래야 덮어씌우기가 가능함)
import './css/main.css';
import './css/sub.css';

ReactDOM.createRoot(document.getElementById('root')).render(<App />);