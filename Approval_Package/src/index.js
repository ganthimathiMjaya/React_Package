
import React, { useState, useEffect } from "react";
       import "./App.css";
       import MiniDrawer from "./components/MiniDrawer";
       import config from 'devextreme/core/config';
       import { licenseKey } from './devextreme-license';
       
        
       config({ licenseKey });
       
       function App(props) {
        const [propsData, setPropsData] = useState({
          style: { padding: "20px" },
            baseURL: props?.baseURL,
            token: props?.token,
            projectId: props?.projectId,
            customerId: props?.customerId,
            selectedGroupId: props?.selectedGroupId,
        });
      
        useEffect(() => {
          const newProps = {
            style: { padding: "20px" },
            baseURL: props?.baseURL,
            token: props?.token,
            projectId: props?.projectId,
            customerId: props?.customerId,
            selectedGroupId: props?.selectedGroupId,
          };
      
          // Update the propsData state when new props are received
          setPropsData(newProps);
        }, [props]); 
         return (
           <div >
                 <MiniDrawer {...propsData}/>
           </div>
         );
       }
              export default App;
