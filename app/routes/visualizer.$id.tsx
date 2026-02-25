import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { Box, Download, RefreshCcw, Share2, X } from "lucide-react";

import { generate3DView } from "lib/ai.action";
import { Button } from "components/ui/Button";

const VisualizerId = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { initialImage, name, initialRender } = location.state || {};

  const hasInitialGenerated = useRef(false);

  const [isProcessing, setIsProcessing] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(
    initialRender || null,
  );

  const handleBack = () => navigate("/");

  const runGeneration = async () => {
    if (!initialImage) return;
    try {
      setIsProcessing(true);
      const result = await generate3DView({ sourceImage: initialImage });
      if (result.renderedImage) {
        setCurrentImage(result.renderedImage);
      }
    } catch (error) {
      console.error("Generation failed", error);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (!initialImage || hasInitialGenerated.current) return;

    if (initialRender) {
      setCurrentImage(initialRender);
      hasInitialGenerated.current = true;
      return;
    }
    hasInitialGenerated.current = true;
    runGeneration();
  }, [initialImage, initialRender]);

  return (
    <div className="visualizer">
      <nav className="topbar">
        <div className="brand">
          <Box className="logo" />

          <span className="name">Apartix</span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleBack} className="exit">
          <X className="icon" />
          Exit
        </Button>
      </nav>
      <section className="content">
        <div className="panel">
          <div className="panel-header">
            <div className="panel-meta">
              <p>Project</p>
              <h2>{"Untitled"} </h2>
              <p className="note">Created by You</p>
            </div>
            <div className="panel-actions">
              <Button
                className="export"
                size="sm"
                disabled={!currentImage}
                onClick={() => {}}
              >
                <Download className="w-4 h-4 mr-2" />
                Export Image
              </Button>
              <Button size="sm" onClick={() => {}} className="share">
                <Share2 className="w-4 h-4 mr-2" /> Share
              </Button>
            </div>
          </div>
          <div className={`render-area ${isProcessing ? "is-processing" : ""}`}>
            {currentImage ? (
              <img src={currentImage} alt="AI Image" className="render-img" />
            ) : (
              <div className="render-placeholder">
                {initialImage && (
                  <img
                    src={initialImage}
                    alt="Og"
                    className="render-fallback"
                  />
                )}
              </div>
            )}
            {isProcessing && (
              <div className="render-overlay">
                <div className="rendering-card">
                  <RefreshCcw className="spinner" />
                  <span className="title">Rendering...</span>
                  <span className="subtitle">
                    Generating Your 3D Visualization Image
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default VisualizerId;
