// import React, { useState } from "react";
// import { motion } from "framer-motion";

// const ProfileSelection = ({ onSelect }) => {
//   const [selected, setSelected] = useState(null);

//   const handleSelect = (num) => {
//     setSelected(num);
//     onSelect(num);
//   };

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
//       <h1 className="text-2xl font-bold mb-6">Kaç Kişi İçin Film Önerisi Almak İstiyorsunuz?</h1>
//       <div className="flex gap-4">
//         {[1, 2, 3, 4].map((num) => (
//           <motion.div
//             key={num}
//             className={`w-20 h-20 flex items-center justify-center rounded-lg cursor-pointer transition-all ${
//               selected === num ? "bg-red-500 scale-110" : "bg-gray-700"
//             }`}
//             whileHover={{ scale: 1.2 }}
//             whileTap={{ scale: 0.9 }}
//             onClick={() => handleSelect(num)}
//           >
//             <span className="text-3xl font-bold">{num}</span>
//           </motion.div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default ProfileSelection;

import React, { useState } from 'react';
import './App.css'; // Varsa stil dosyanız

function App() {
  const [profileCount, setProfileCount] = useState(0); // Seçilen profil sayısını tutan state

  const handleProfileSelection = (number) => {
    setProfileCount(number);
  };

  return (
    <div className="App">
      <h1>Profil Seçme Ekranı</h1>
      <div className="profile-selection">
        {[1, 2, 3, 4].map((number) => (
          <button 
            key={number} 
            onClick={() => handleProfileSelection(number)} 
            className={profileCount === number ? 'selected' : ''}
          >
            Profil {number}
          </button>
        ))}
      </div>
      <div className="selected-profile">
        {profileCount > 0 && <p>Seçilen profil: {profileCount}</p>}
      </div>
    </div>
  );
}

export default App;
