import { StrictMode } from "react";
import "@ant-design/v5-patch-for-react-19";
import { unstableSetRender } from "antd";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import "./i18n.js";
import { GoogleOAuthProvider } from "@react-oauth/google";

// unstableSetRender((node, container) => {
//   container._reactRoot ||= createRoot(container);
//   const root = container._reactRoot;
//   root.render(node);
//   return async () => {
//     await new Promise((resolve) => setTimeout(resolve, 0));
//     root.unmount();
//   };
// });

// createRoot(document.getElementById("root")).render(
//   <StrictMode>
//     <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
//       <AuthProvider>
//         <BrowserRouter>
//           <App />
//         </BrowserRouter>
//       </AuthProvider>
//     </GoogleOAuthProvider>
//   </StrictMode>
// );

import SecurityCheck from "./security/SecurityCheck.jsx";
import { useState } from "react";

function RootApp() {
  const [verified, setVerified] = useState(
    localStorage.getItem("isVerified") === "true"
  );

  if (!verified) {
    return <SecurityCheck onVerified={() => setVerified(true)} />;
  }

  const GOOGLE_CLIENT_ID =
    "475106320895-gh0lpg7h1hbo7o689d85oaug01usbv03.apps.googleusercontent.com";

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RootApp />
  </StrictMode>
);
