import React from "react";
import { StatusBar } from "react-native";
import { useSelector } from "react-redux";
interface StatusbarProps {
  bgrstatus: string;
}
const Statusbar: React.FC<{ bgrstatus: string, bgrcolor: string }> = ({ bgrstatus, bgrcolor }) => {
  const color = useSelector((state: any) => state.colorApp.value)
  return (
    <StatusBar
      animated={true}
      translucent={true}
      barStyle={color.black === bgrcolor ? 'dark-content' : 'light-content'}
      backgroundColor={bgrstatus}

    />

  )
}
export default Statusbar;