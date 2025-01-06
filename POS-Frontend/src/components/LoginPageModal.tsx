
import React from "react";



interface Login {

  isVisible: boolean;

  onClose: () => void;

}



const Login: React.FC<Login> = ({ isVisible, onClose }) => {

  if (!isVisible) return null;



  return (

    <div>

      {/* Modal content */}

      <button onClick={onClose}>Close</button>

    </div>

  );

};



export default Login;
