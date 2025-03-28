// App.js
import React from 'react';
import ProfileSelection from './components/profile';  // profile.js dosyanızı doğru yolda içe aktarın

const App = () => {
  return (
    <div className="App">
      <ProfileSelection />  {/* ProfileSelection bileşenini buraya ekliyoruz */}
    </div>
  );
}

export default App;
