"use client";

import { useEffect, type RefObject } from "react";
import * as THREE from "three";

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Decorative WebGL sculpture behind the hero.
 * Mirrors the original prototype: a wireframed torus knot, two orbits,
 * a lime satellite and a cloud of particles that react to scroll and pointer.
 */
export function useHeroScene(
  hostRef: RefObject<HTMLDivElement | null>,
  heroRef: RefObject<HTMLElement | null>,
): void {
  useEffect(() => {
    const host = hostRef.current;
    const hero = heroRef.current;
    if (!host || !hero) return;

    // The hero sculpture is hidden on compact screens by CSS; skip WebGL there.
    if (window.matchMedia("(max-width: 900px)").matches) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let viewportHeight = window.innerHeight;

    let renderer: THREE.WebGLRenderer | null = null;
    let scene: THREE.Scene | null = null;
    let camera: THREE.PerspectiveCamera | null = null;
    let group: THREE.Group | null = null;
    let ring1: THREE.Line | null = null;
    let ring2: THREE.Line | null = null;
    let satellite: THREE.Mesh | null = null;
    let knot: THREE.Mesh | null = null;
    let wire: THREE.LineSegments | null = null;
    let particles: THREE.Points | null = null;
    let particleGeometry: THREE.BufferGeometry | null = null;

    let ready = false;
    let mx = 0;
    let my = 0;
    let smoothedX = 0;
    let smoothedY = 0;
    let scrollProgress = 0;
    let spin = 0.6;
    let raf = 0;

    const startedAt = performance.now();
    let lastFrame = startedAt;

    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "low-power",
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
      host.appendChild(renderer.domElement);

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(35, 1, 0.1, 60);
      camera.position.z = 9;

      scene.add(new THREE.AmbientLight(0xffffff, 0.65));

      const lightOne = new THREE.PointLight(0x9fd8ff, 1.5, 40);
      lightOne.position.set(-4, 3, 5);
      const lightTwo = new THREE.PointLight(0x6b7dff, 2, 40);
      lightTwo.position.set(4, -3, 3);
      scene.add(lightOne, lightTwo);

      group = new THREE.Group();
      scene.add(group);

      knot = new THREE.Mesh(
        new THREE.TorusKnotGeometry(1.5, 0.4, 220, 28, 2, 3),
        new THREE.MeshStandardMaterial({
          color: 0x465bff,
          metalness: 0.35,
          roughness: 0.3,
          transparent: true,
          opacity: 0.86,
        }),
      );
      wire = new THREE.LineSegments(
        new THREE.WireframeGeometry(
          new THREE.TorusKnotGeometry(1.5, 0.62, 90, 12, 2, 3),
        ),
        new THREE.LineBasicMaterial({
          color: 0x9fd8ff,
          transparent: true,
          opacity: 0.5,
        }),
      );
      group.add(knot, wire);

      const circle = (radius: number): THREE.BufferGeometry => {
        const points: THREE.Vector3[] = [];
        for (let index = 0; index <= 96; index += 1) {
          const angle = (index / 96) * Math.PI * 2;
          points.push(
            new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0),
          );
        }
        return new THREE.BufferGeometry().setFromPoints(points);
      };

      const ringMaterial = new THREE.LineBasicMaterial({
        color: 0x465bff,
        transparent: true,
        opacity: 0.4,
      });
      ring1 = new THREE.Line(circle(3.1), ringMaterial);
      ring1.rotation.x = 1.2;
      ring2 = new THREE.Line(circle(3.7), ringMaterial);
      ring2.rotation.set(0.5, 0.9, 0);

      satellite = new THREE.Mesh(
        new THREE.SphereGeometry(0.11, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0xc8f25a }),
      );

      group.add(ring1, ring2, satellite);

      const axes = new THREE.LineSegments(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(-4.6, 0, 0),
          new THREE.Vector3(4.6, 0, 0),
          new THREE.Vector3(0, -4.6, 0),
          new THREE.Vector3(0, 4.6, 0),
          new THREE.Vector3(0, 0, -4.6),
          new THREE.Vector3(0, 0, 4.6),
        ]),
        new THREE.LineBasicMaterial({
          color: 0x465bff,
          transparent: true,
          opacity: 0.22,
        }),
      );
      group.add(axes);

      const particlePositions = new Float32Array(240 * 3);
      for (let index = 0; index < 240; index += 1) {
        const radius = 3.6 + Math.random() * 2;
        const theta = Math.random() * 6.283;
        const phi = Math.acos(2 * Math.random() - 1);
        particlePositions[index * 3] = radius * Math.sin(phi) * Math.cos(theta);
        particlePositions[index * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        particlePositions[index * 3 + 2] = radius * Math.cos(phi);
      }
      particleGeometry = new THREE.BufferGeometry();
      particleGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(particlePositions, 3),
      );
      particles = new THREE.Points(
        particleGeometry,
        new THREE.PointsMaterial({
          color: 0x465bff,
          size: 0.035,
          transparent: true,
          opacity: 0.7,
        }),
      );
      group.add(particles);

      ready = true;
    } catch {
      ready = false;
      renderer?.dispose();
      renderer = null;
      hero.style.backgroundImage =
        "radial-gradient(circle at 72% 45%, rgba(70,91,255,.28), transparent 38%)";
    }

    const resize = (): void => {
      viewportHeight = window.innerHeight;
      if (!ready || !renderer || !camera) return;
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    };

    const frame = (now: number): void => {
      raf = requestAnimationFrame(frame);
      if (document.hidden || !renderer || !scene || !camera || !group) return;

      const time = (now - startedAt) / 1000;
      const aspect = window.innerWidth / window.innerHeight;
      const wide = aspect > 1.1;
      const delta = Math.min(Math.max((now - lastFrame) / 1000, 0), 0.05);
      lastFrame = now;

      const pageProgress = window.scrollY / viewportHeight;
      scrollProgress += (pageProgress - scrollProgress) * (1 - Math.exp(-delta * 7));

      const pointerEase = 1 - Math.exp(-delta * 3);
      smoothedX += (mx - smoothedX) * pointerEase;
      smoothedY += (my - smoothedY) * pointerEase;

      const intro = reduce ? 1 : clamp(time / 1.9, 0, 1);
      const easedIntro = 1 - Math.pow(1 - intro, 4);

      const visibleWidth = 5.67 * aspect;
      const targetX = wide
        ? visibleWidth * 0.22 * (1 - clamp(scrollProgress * 0.9, 0, 1) * 1.1)
        : 0;
      const targetY = (wide ? 0 : 1.4) + (reduce ? 0 : scrollProgress * 1.5);

      group.position.set(targetX, targetY, 0);

      const scale =
        (wide ? 1 : 0.72) *
        (0.55 + 0.45 * easedIntro) *
        (1 - clamp(scrollProgress, 0, 2.5) * 0.12);
      group.scale.setScalar(scale);

      if (!reduce) spin += delta * (0.11 + 0.04 * Math.sin(time * 0.35));

      group.rotation.y = spin + smoothedX * 0.35;
      group.rotation.x =
        0.25 +
        scrollProgress * 0.45 +
        smoothedY * 0.2 +
        (reduce ? 0 : Math.sin(time * 0.22) * 0.05);
      group.rotation.z = scrollProgress * 0.15;

      if (ring1) ring1.rotation.z = reduce ? 0 : spin * 1.2;
      if (ring2) ring2.rotation.z = reduce ? 0 : -spin * 0.8;
      if (particles) particles.rotation.y = reduce ? 0 : -spin * 0.35;

      if (satellite) {
        const angle = reduce ? 0 : spin * 5;
        satellite.position.set(
          Math.cos(angle) * 3.1,
          Math.sin(angle) * 3.1 * Math.sin(1.2),
          Math.sin(angle) * 3.1 * Math.cos(1.2) * -1,
        );
      }

      host.style.opacity = (
        easedIntro * clamp(1.05 - scrollProgress * 1.2, 0, 1)
      ).toFixed(3);
      renderer.render(scene, camera);
    };

    const onPointerMove = (event: PointerEvent): void => {
      mx = event.clientX / window.innerWidth - 0.5;
      my = event.clientY / window.innerHeight - 0.5;
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const active = entries[0]?.intersectionRatio >= 0.15;
        if (active && !raf) {
          lastFrame = performance.now();
          scrollProgress = window.scrollY / viewportHeight;
          raf = requestAnimationFrame(frame);
        } else if (!active && raf) {
          cancelAnimationFrame(raf);
          raf = 0;
          host.style.opacity = "0";
        }
      },
      { threshold: [0, 0.15] },
    );

    if (ready) {
      resize();
      observer.observe(hero);
      if (!reduce) {
        window.addEventListener("pointermove", onPointerMove, { passive: true });
      }
    }

    const onResize = (): void => resize();
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      raf = 0;
      observer.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointerMove);

      if (renderer) {
        renderer.dispose();
        renderer.domElement.remove();
      }
      knot?.geometry.dispose();
      if (knot) {
        const material = knot.material;
        if (Array.isArray(material)) material.forEach((item) => item.dispose());
        else material.dispose();
      }
      wire?.geometry.dispose();
      if (wire) {
        const material = wire.material;
        if (Array.isArray(material)) material.forEach((item) => item.dispose());
        else material.dispose();
      }
      particleGeometry?.dispose();
      if (particles) {
        const material = particles.material;
        if (Array.isArray(material)) material.forEach((item) => item.dispose());
        else material.dispose();
      }
    };
  }, [heroRef, hostRef]);
}
