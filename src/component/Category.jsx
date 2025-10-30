// import React, { useEffect, useState } from "react";

// const Apiurl = "https://great-lobster-rightly.ngrok-free.app/catagory/";

// const Category = () => {
//   const [users, SetUsers] = useState([]);

//   useEffect(() => {
//     hdlFetch();
//   }, []);

//   const hdlFetch = async () => {
//     try {
//       const resp = await fetch(Apiurl);
//       if (!resp.ok) {
//         throw new Error("Network response was not ok: " + resp.status);
//       }
//       const data = await resp.json(); // จะ error ถ้าไม่ใช่ JSON
//       console.log(typeof data);
//       SetUsers(data);
//     } catch (error) {
//       console.log("Fetch error:", error.message);
//     }
//   };

//   return (
//     <div>
//       {users.map((item) => {
//         console.log(typeof item);
//         return (
//           <div>
//             <p key={item.Catagory_ID}>{item.Catagory_ID}</p>
//             <p key={item.Catagory_ID}>{item.Catagory_Name}</p>
//           </div>
//         );
//       })}
//     </div>
//   );
// };

// export default Category;

import React, { useEffect, useState } from "react";

const API_URL = "https://great-lobster-rightly.ngrok-free.app/catagory/";

export default function Category() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const resp = await fetch(API_URL, {
          method: "GET",
          headers: {
            Accept: "application/json", // ขอ JSON ชัดเจน
            "ngrok-skip-browser-warning": "true", // กันหน้าเตือนของ ngrok
          },
        });
        const data = await resp.json();
        setUsers(data);
      } catch (e) {
        console.log(error);
      }
    })();
  }, []);

  return (
    <div>
      {users.map((item) => (
        <div key={item.Catagory_ID}>
          <p>{item.Catagory_ID}</p>
          <p>{item.Catagory_Name}</p>
        </div>
      ))}
    </div>
  );
}
