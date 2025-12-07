import { useEffect, useRef } from 'react';
import Board from './components/Board';
import { CanvasBackgroundManager } from './models/initBackground';

import './App.css'
import imgUrl from './assets/mountain.png';
import { getImage } from './utils/utils';

const App = () => {
  const bgCanvasRef = useRef<HTMLCanvasElement>(null);
  const canvasParentRef = useRef<HTMLDivElement>(null);
  const mountainImg = getImage(imgUrl);

  useEffect(() => {
    const canvas = bgCanvasRef.current;
    const parent = canvasParentRef.current;
    const {offsetWidth, offsetHeight} = canvasParentRef.current!;

    canvas!.width = offsetWidth;
    canvas!.height = offsetHeight;
    
    const context = canvas?.getContext("2d");
    
    if (!context || !parent) return;
    
    const BackgroundManager = new CanvasBackgroundManager(parent, context);
    mountainImg.addEventListener("load", () => BackgroundManager.initialise(mountainImg));
    mountainImg.addEventListener("resize", () => BackgroundManager.handleResize(canvas!));

    return () => {
      mountainImg.removeEventListener("load", () => BackgroundManager.initialise(mountainImg));
      mountainImg.removeEventListener("resize", () => BackgroundManager.handleResize(canvas!));
      BackgroundManager.destroy();
    }
  }, []);

  return (
    <>
      <Board />
      <div 
        ref={canvasParentRef}
        className="background" 
      >
        <canvas ref={bgCanvasRef} />
      </div>
    </>
  );
}

export default App;