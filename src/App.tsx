import Board from './components/Board';
import { useEffect, useRef, useState } from 'react';
import { CanvasBackgroundManager } from './models/initBackground';

import './App.css';
import imgUrl from './assets/mountain-noshadow.png';
import { getImage } from './utils/utils';
import Preview from './components/Preview';

const App = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const bgCanvasRef = useRef<HTMLCanvasElement>(null);
  const canvasParentRef = useRef<HTMLDivElement>(null);
  const bgCleanupRef = useRef<() => void>(null);

  const mountainImg = getImage(imgUrl);

  const [isRefreshing, setIsRefreshing] = useState(false);

  // init bg canvas effect
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

    bgCleanupRef.current = () => {
      localStorage.setItem("isNight", BackgroundManager.isNight.toString());
      localStorage.setItem("daytimeTimer", BackgroundManager.daytimeTimer.toString());
    }

    return () => {
      mountainImg.removeEventListener("load", () => BackgroundManager.initialise(mountainImg));
      mountainImg.removeEventListener("resize", () => BackgroundManager.handleResize(canvas!));

      BackgroundManager.destroy();
    }
  }, []);

  useEffect(() => {
    setTimeout(() => {
      containerRef.current?.classList.remove("loading");
    }, 1400);
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey && (e.key === 'r' || e.key === 'к')) || e.key === 'F5') {
        e.preventDefault();
        setIsRefreshing(true);

        containerRef.current?.classList.add("loading");
        if (bgCleanupRef.current) bgCleanupRef.current();
        setTimeout(() => window.location.reload(), 1650);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="root-container loading" ref={containerRef}>
      <Preview isReversed={isRefreshing} />
      <Board />
      <div 
        ref={canvasParentRef}
        className="background"
      >
        <canvas ref={bgCanvasRef} />
      </div>

      <div className="logo-container">
        <img src="/logo.svg" alt="logo" />
      </div>
    </div>
  );
}

export default App;