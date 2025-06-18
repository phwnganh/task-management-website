// import { useState } from "react";
// import reactLogo from "./assets/react.svg";
// import viteLogo from "/vite.svg";
// import "./App.css";
// import AppRoutes from "./routes/AppRoutes";

// function App() {
//   const [count, setCount] = useState(0);

//   return (
//     <>
//       <AppRoutes />
//     </>
//   );
// }

// export default App;
import AppRoutes from "./routes/AppRoutes";
import { ConfigProvider, theme as antdTheme } from "antd";
import { useTheme } from "./context/ThemeContext";

function App() {
  const { dark } = useTheme(); // Lấy biến dark từ context

  return (
    <ConfigProvider
      theme={{
        algorithm: dark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
      }}
    >
      <AppRoutes />
    </ConfigProvider>
  );
}

export default App;
