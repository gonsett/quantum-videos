// Entrada aparte para renderizar las historias del oficina sin tocar Root.tsx mientras corre otro render.
import React from "react";
import { Composition, Folder, registerRoot } from "remotion";
import { LAMINAS_OF } from "./oficina";

const RootOF: React.FC = () => (
  <Folder name="Historias-OF">
    {LAMINAS_OF.map(({ id, c }) => (
      <Composition key={id} id={`OF-${id}`} component={c} durationInFrames={1} fps={30} width={1080} height={1920} />
    ))}
  </Folder>
);
registerRoot(RootOF);
