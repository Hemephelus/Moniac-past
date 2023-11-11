import React from "react";
import MoniacSketch from "./sketches/moniac1/MoniacSketch";

function App() {
// 28,79,74 1C4F4A green
// 158,177,172 9EB1AC green 1
// 223,227,222 DFE3DE green 2

// 252,103,25 FC6719 orange
// 255,177,48 FFB130 orange 1
// 251,235,214 FBEBD6 orange 2

// 204,220,246 CCDCF6 blue
// 28,74,144 1C4A90 blue 1
// 245,243,238 F5F3EE blue 2
  return (
    <div className="grid grid-cols-[auto_1fr]">    
      <MoniacSketch/>
      <aside className="bg-[#1c4f4af3] text-[#DFE3DE] shadow-3xl p-2"> 
      Hit 'd' to toggle debugging lines.<br/>Click the mouse to generate new vehicles.
      </aside>
    </div>
  );
}

export default App;
