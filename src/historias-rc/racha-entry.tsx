// Entrada aparte para renderizar las historias de la racha sin tocar Root.tsx mientras corre otro render.
import React from "react";
import { Composition, Folder, registerRoot } from "remotion";
import { LAMINAS_RA } from "./racha";

const RootRA: React.FC = () => (
  <Folder name="Historias-RA">
    {LAMINAS_RA.map(({ id, c }) => (
      <Composition key={id} id={`RA-${id}`} component={c} durationInFrames={1} fps={30} width={1080} height={1920} />
    ))}
  </Folder>
);
registerRoot(RootRA);
