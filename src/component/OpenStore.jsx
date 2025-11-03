// import React, { useEffect, useState } from "react";

// const API_URL = "https://great-lobster-rightly.ngrok-free.app/catagory/";

// export default function Category() {
//   const [users, setUsers] = useState([]);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     (async () => {
//       try {
//         const resp = await fetch(API_URL, {
//           method: "GET",
//           headers: {
//             Accept: "application/json", // ขอ JSON ชัดเจน
//             "ngrok-skip-browser-warning": "true", // กันหน้าเตือนของ ngrok
//           },
//         });
//         const data = await resp.json();
//         setUsers(data);
//       } catch (e) {
//         console.log(error);
//       }
//     })();
//   }, []);

//   return (
//     <div>
//       {users.map((item) => (
//         <div key={item.Catagory_ID}>
//           <p>{item.Catagory_ID}</p>
//           <p>{item.Catagory_Name}</p>
//         </div>
//       ))}
//     </div>
//   );
// }

import React from "react";
import RegisStore from "../openstorelayout/RegisStore";
import Box from "@mui/material/Box";

const OpenStore = () => {
  return (
    <>
      <RegisStore />
    </>
  );
};

export default OpenStore;
