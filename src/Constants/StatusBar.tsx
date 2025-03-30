import React from "react";
import { StatusBar } from "react-native";
import { useSelector } from "react-redux";

const Statusbar: React.FC<{ bgrstatus: string, bgrcolor: string,translucent:boolean }> = ({ bgrstatus, bgrcolor,translucent }) => {
  const color = useSelector((state: any) => state.colorApp.value)
  return (
    <StatusBar
      animated={true}
      translucent={translucent} 
      barStyle={color.black === bgrcolor ? 'dark-content' : 'light-content'}
      backgroundColor={bgrstatus}

    />

  )
}
export default Statusbar;