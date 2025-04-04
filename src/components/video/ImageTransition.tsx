import React, { useRef, useState, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { createImageTransitionMaterials } from './transitions/ImageTransitionMaterials';

interface ImageTransitionProps {
  currentImage: string;
  prevImage: string | null;
  transitionType?: 'fade' | 'displacement' | 'noise';
  className?: string;
}

const ImageTransition: React.FC<ImageTransitionProps> = ({
  currentImage,
  prevImage,
  transitionType = 'fade',
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const requestRef = useRef<number>(0);
  const [textures, setTextures] = useState<{
    current: THREE.Texture | null, 
    prev: THREE.Texture | null,
    disp: THREE.Texture | null
  }>({
    current: null,
    prev: null,
    disp: null
  });

  // Create transition materials
  const materials = useMemo(() => createImageTransitionMaterials(THREE), []);

  // Initialize Three.js scene
  useEffect(() => {
    if (!canvasRef.current) return;

    // Create renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
    rendererRef.current = renderer;

    // Create scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Create camera (orthographic for 2D rendering)
    const camera = new THREE.OrthographicCamera(
      -0.5, 0.5, 0.5, -0.5, 0.1, 1000
    );
    camera.position.z = 1;
    cameraRef.current = camera;

    // Create plane geometry
    const geometry = new THREE.PlaneGeometry(1, 1);

    // Choose material based on transition type
    const material = transitionType === 'displacement' 
      ? materials.ImageDisplacementMaterial.clone() 
      : materials.ImageFadeMaterial.clone();
    materialRef.current = material;

    // Create mesh and add to scene
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Load displacement texture if needed
    if (transitionType === 'displacement') {
      const displacementLoader = new THREE.TextureLoader();
      displacementLoader.load('/textures/displacement/13.png', (dispTexture) => {
        setTextures(prev => ({ ...prev, disp: dispTexture }));
        if (materialRef.current) {
          materialRef.current.uniforms.disp.value = dispTexture;
        }
      });
    }

    // Clean up
    return () => {
      cancelAnimationFrame(requestRef.current);
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      if (sceneRef.current) {
        // Dispose geometries and materials
        sceneRef.current.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            object.geometry.dispose();
            if (object.material instanceof THREE.Material) {
              object.material.dispose();
            }
          }
        });
      }
    };
  }, [transitionType, materials]);

  // Handle images loading
  useEffect(() => {
    if (!currentImage) return;
    
    const textureLoader = new THREE.TextureLoader();
    
    // Load current image
    textureLoader.load(currentImage, (texture) => {
      setTextures(prev => ({ ...prev, current: texture }));
      
      // When we get a new current image, the old current becomes prev
      if (materialRef.current) {
        if (textures.current) {
          materialRef.current.uniforms.tex2.value = texture;
          // Start transition
          startTransition();
        } else {
          // First load, no transition
          materialRef.current.uniforms.tex.value = texture;
          materialRef.current.uniforms.tex2.value = texture;
          materialRef.current.uniforms.dispFactor.value = 0;
        }
      }
    });
    
    // Load previous image
    if (prevImage && prevImage !== currentImage) {
      textureLoader.load(prevImage, (texture) => {
        setTextures(prev => ({ ...prev, prev: texture }));
        if (materialRef.current) {
          materialRef.current.uniforms.tex.value = texture;
        }
      });
    }
  }, [currentImage, prevImage]);

  // Handle animation
  const startTransition = () => {
    if (!materialRef.current) return;
    
    let start: number | null = null;
    const duration = 800; // ms
    
    const animate = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = (timestamp - start) / duration;
      
      if (materialRef.current) {
        materialRef.current.uniforms.dispFactor.value = Math.min(progress, 1);
      }
      
      // Render scene
      if (sceneRef.current && cameraRef.current && rendererRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
      
      if (progress < 1) {
        requestRef.current = requestAnimationFrame(animate);
      } else {
        // Transition complete, update textures
        if (materialRef.current && textures.current) {
          materialRef.current.uniforms.tex.value = textures.current;
          materialRef.current.uniforms.dispFactor.value = 0;
        }
      }
    };
    
    requestRef.current = requestAnimationFrame(animate);
  };

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && rendererRef.current && cameraRef.current) {
        rendererRef.current.setSize(
          canvasRef.current.clientWidth, 
          canvasRef.current.clientHeight
        );
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full object-contain ${className}`}
    />
  );
};

export default ImageTransition;