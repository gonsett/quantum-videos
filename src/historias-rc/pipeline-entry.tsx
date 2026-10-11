// Entrada aparte para renderizar las historias del pipeline sin tocar Root.tsx mientras corre otro render.
import React from "react";
import { Composition, Folder, registerRoot } from "remotion";
import { LAMINAS_PIP } from "./pipeline";

const RootPIP: React.FC = () => (
  <Folder name="Historias-PIP">
    {LAMINAS_PIP.map(({ id, c }) => (
      <Composition key={id} id={`PIP-${id}`} component={c} durationInFrames={1} fps={30} width={1080} height={1920} />
    ))}
  </Folder>
);
registerRoot(RootPIP);
