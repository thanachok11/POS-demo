
import React from "react";



interface RegisterPageModal {

  isVisible: boolean;

  onClose: () => void;

}



const LoginPageModal: React.FC<RegisterPageModal> = ({ isVisible, onClose }) => {

  if (!isVisible) return null;



  return (

    <div>

      {/* Modal content */}

      <button onClick={onClose}>Close</button>

    </div>

  );

};



export default LoginPageModal;
