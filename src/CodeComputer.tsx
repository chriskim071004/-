"use client";
import { useState } from "react";

/** The exact Spline community scene is not identified by the provided subtitles.
 * Set NEXT_PUBLIC_SPLINE_SCENE_URL to an authorized public embed URL to use it.
 */
export default function CodeComputer() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const splineUrl = process.env.NEXT_PUBLIC_SPLINE_SCENE_URL;
  if (splineUrl) {
    return <div className="computer-scene"><iframe className="spline-frame" title="인터랙티브 스플라인 3D 장면" src={splineUrl} loading="lazy" referrerPolicy="no-referrer" /></div>;
  }
  return (
    <div className="computer-scene" aria-label="마우스를 따라 눈이 움직이는 귀여운 컴퓨터" onPointerMove={(e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      setPosition({ x, y });
    }} onPointerLeave={() => setPosition({ x: 0, y: 0 })}>
      <span className="computer-halo" /><span className="computer-spark s1">✧</span>
      <span className="computer-spark s2">✦</span><span className="computer-spark s3">✳</span>
      <div className="computer-device" style={{ transform: "rotateY(" + position.x * 15 + "deg) rotateX(" + (-position.y * 12) + "deg)" }}>
        <div className="computer-top"><div className="computer-screen">
          <div className="computer-face">
            {[0, 1].map((i) => <span className="computer-eye" key={i}>
              <span className="computer-pupil" style={{ transform: "translate(" + position.x * 10 + "px," + position.y * 10 + "px)" }} />
            </span>)}
          </div>
          <span className="computer-mouth" /><span className="computer-screen-text">HELLO, DESTINY!</span>
        </div></div>
        <div className="computer-neck" /><div className="computer-base" />
      </div>
      <span className="computer-caption">MOVE YOUR CURSOR · 나의 작은 우주</span>
    </div>
  );
}
