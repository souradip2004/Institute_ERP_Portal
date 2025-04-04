// components/video/transitions/ImageTransitionMaterials.tsx
//import { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';

// These will be used in a React component, so we need to create types
interface ImageTransitionMaterialProps {
  effectFactor?: number;
  dispFactor?: number;
  tex?: THREE.Texture;
  tex2?: THREE.Texture;
  disp?: THREE.Texture;
  toneMapped?: boolean;
}

// Create the shader materials
export const createImageTransitionMaterials = (THREE: typeof import('three')) => {
  // Noise-based fade transition
  const ImageFadeMaterial = new THREE.ShaderMaterial({
    uniforms: {
      effectFactor: { value: 1.2 },
      dispFactor: { value: 0 },
      tex: { value: null },
      tex2: { value: null },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform sampler2D tex;
      uniform sampler2D tex2;
      uniform float _rot;
      uniform float dispFactor;
      uniform float effectFactor;

      float rand(vec2 n) { 
        return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
      }
      
      float noise(vec2 p){
        vec2 ip = floor(p);
        vec2 u = fract(p);
        u = u*u*(3.0-2.0*u);
        
        float res = mix(
          mix(rand(ip),rand(ip+vec2(1.0,0.0)),u.x),
          mix(rand(ip+vec2(0.0,1.0)),rand(ip+vec2(1.0,1.0)),u.x),u.y);
        return res*res;
      }

      void main() {
        vec2 uv = vUv;

        float noiseFactor = noise(gl_FragCoord.xy * 0.4);

        vec2 distortedPosition = vec2(uv.x + dispFactor * noiseFactor, uv.y);
        vec2 distortedPosition2 = vec2(uv.x - (1.0 - dispFactor) * noiseFactor, uv.y);
        vec4 _texture = texture2D(tex, distortedPosition);
        vec4 _texture2 = texture2D(tex2, distortedPosition2);
        vec4 finalTexture = mix(_texture, _texture2, dispFactor);
        gl_FragColor = finalTexture;
      }
    `
  });

  // Displacement-based transition
  const ImageDisplacementMaterial = new THREE.ShaderMaterial({
    uniforms: {
      effectFactor: { value: 4.2 },
      dispFactor: { value: 0 },
      tex: { value: null },
      tex2: { value: null },
      disp: { value: null },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform sampler2D tex;
      uniform sampler2D tex2;
      uniform sampler2D disp;
      uniform float _rot;
      uniform float dispFactor;
      uniform float effectFactor;
      void main() {
        vec2 uv = vUv;
        vec4 disp = texture2D(disp, uv);
        vec2 distortedPosition = vec2(uv.x + dispFactor * (disp.r*effectFactor), uv.y);
        vec2 distortedPosition2 = vec2(uv.x - (1.0 - dispFactor) * (disp.r*effectFactor), uv.y);
        vec4 _texture = texture2D(tex, distortedPosition);
        vec4 _texture2 = texture2D(tex2, distortedPosition2);
        vec4 finalTexture = mix(_texture, _texture2, dispFactor);
        gl_FragColor = finalTexture;
      }
    `
  });

  // Noise-based transition
  const ImageNoiseMaterial = new THREE.ShaderMaterial({
    uniforms: {
      effectFactor: { value: 2.5 },
      dispFactor: { value: 0 },
      tex: { value: null },
      tex2: { value: null },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform sampler2D tex;
      uniform sampler2D tex2;
      uniform float dispFactor;
      uniform float effectFactor;

      float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
      }

      void main() {
        vec2 uv = vUv;
        float noise = random(uv * effectFactor);
        
        vec4 color1 = texture2D(tex, uv);
        vec4 color2 = texture2D(tex2, uv);
        
        // Create noise-based transition
        float threshold = 1.0 - dispFactor;
        vec4 finalTexture = mix(
          color1, 
          color2, 
          step(threshold, noise)
        );
        
        gl_FragColor = finalTexture;
      }
    `
  });

  return {
    ImageFadeMaterial,
    ImageDisplacementMaterial,
    ImageNoiseMaterial
  };
};