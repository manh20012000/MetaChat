const formatSeconds = (secs:number) => {
    const pad = (n:number) => n < 10 ? `0${n}` : n;
  
    const h = Math.floor(secs / 3600);
    const m = Math.floor(secs / 60) - (h * 60);
    const s = Math.floor(secs - h * 3600 - m * 60);
  
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  }
 

    const formatTime=(secon:number)=>{
      const pad = (n:number) => n < 10 ? `0${n}` : n;
  
    const h = Math.floor(secon / 3600);
    const m = Math.floor(secon / 60) - (h * 60);
    const s = Math.floor(secon - h * 3600 - m * 60);
    
     
      if(secon>3600){
        return `${pad(h)}:${pad(m)}:${pad(s)}`;
      }else{
        return `${pad(m)}:${pad(s)}`;
      }
    

   
    }  
   export default formatSeconds;
    export{formatTime}