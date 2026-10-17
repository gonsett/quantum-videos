import "./index.css";
import { Composition, Folder } from "remotion";
import { AutomLeadVideo } from "./AutomLeadVideo";
import { ServiceVideo } from "./ServiceVideo";
import { PanelVideo } from "./PanelVideo";
import { Prueba3D } from "./Prueba3D";
import { PruebaGLB } from "./PruebaGLB";
import { FugaVideo } from "./FugaVideo";
import { Estudio } from "./Estudio";
import { VelocidadVideo } from "./VelocidadVideo";
import { RepartoVideo } from "./RepartoVideo";
import { DemoraVideo } from "./DemoraVideo";
import { PortadaDemora } from "./portadas/demora";
import { R1Gancho, R2Comodidad, R2Tercera, R3Solucion, R4Honestidad, R5Cierre } from "./ring-closers/escenas";
import { RingClosersVideo } from "./ring-closers/RingClosersVideo";
import { ReelVideo } from "./reel-rc/ReelVideo";
import * as ReelEscenas from "./reel-rc/escenas";
import { DURACION_REEL, reel } from "./reel-rc/timeline";
import { EstilosVideo } from "./estilos-rc/EstilosVideo";
import * as EstilosEscenas from "./estilos-rc/escenas";
import { DURACION_ESTILOS, estilos } from "./estilos-rc/timeline";
import { RachaVideo } from "./racha-rc/RachaVideo";
import * as RachaEscenas from "./racha-rc/escenas";
import { DURACION_RACHA, racha } from "./racha-rc/timeline";
import { ExplicadorVideo } from "./explicador-rc/ExplicadorVideo";
import * as ExplicadorEscenas from "./explicador-rc/escenas";
import { DURACION_EXPLICADOR, explicador } from "./explicador-rc/timeline";
import { DURACION_SECRETO, SecretoVideo } from "./secreto-rc/escenas";
import { SecretoVozVideo } from "./secreto-rc/escenas-voz";
import { QueEsVideo } from "./que-es-rc/QueEsVideo";
import * as HistoriasRC from "./historias-rc/imagenes";
import * as ComoFunciona from "./historias-rc/como-funciona";
import * as ComoFuncionaPasos from "./historias-rc/como-funciona-pasos";
import * as Ofertas from "./historias-rc/ofertas";
import * as Directores from "./historias-rc/directores";
import * as Valor from "./historias-rc/valor";
import * as SetH from "./historias-rc/setters";
import * as SetG from "./historias-rc/setters-gpt";
import * as SetOf from "./historias-rc/setters-ofertas";
import * as SetOf2 from "./historias-rc/setters-ofertas-2";
import * as SetVit from "./historias-rc/setters-vitrina";
import { CarnetSetterReal } from "./historias-rc/carnet-setter-real";
import { MuestraNota } from "./nota-rc/Muestra";
import { MuestraComision } from "./comision-rc/Muestra";
import { ComisionVideo, DURACION as DURACION_COMISION } from "./comision-rc/Video";
import { NotaVideo, DURACION as DURACION_NOTA } from "./nota-rc/Video";
import { EliteVideo } from "./elite-rc/EliteVideo";
import { PortadaElite } from "./elite-rc/Portada";
import { NovatoVideo } from "./novato-rc/NovatoVideo";
import { PortadaNovato } from "./novato-rc/Portada";
import { VeteranosVideo } from "./veteranos-rc/VeteranosVideo";
import { PortadaVeteranos } from "./veteranos-rc/Portada";
import { MuestraDirectores } from "./directores-rc/Muestra";
import { DirectoresVideo } from "./directores-rc/DirectoresVideo";
import { MuestraRayos } from "./rayos-rc/Muestra";
import { MuestraOferta } from "./oferta-rc/Muestra";
import { GanchoOferta } from "./oferta-rc/Gancho";
import { OfertaVideo, DURACION as DURACION_OFERTA_RC } from "./oferta-rc/Video";
import { PortadaOferta } from "./oferta-rc/Portada";
import { PortadaDirector } from "./oferta-rc/PortadaDirector";
import { GanchoComunidades } from "./comunidades-rc/Gancho";
import { MuestraLogros } from "./logros-rc/Muestra";
import { LogrosVideo, DURACION as DURACION_LOGROS } from "./logros-rc/Video";
import { EscuchateVideo, DURACION as DURACION_ESCUCHATE } from "./escuchate-rc/Video";
import { ComunidadesVideo, DURACION as DURACION_COMUNIDADES } from "./comunidades-rc/Video";
import { DURACION_DIRECTORES } from "./directores-rc/timeline";
import { D1 as CarLad1, D2 as CarLad2, D3 as CarLad3, D4 as CarLad4, D5 as CarLad5, D6 as CarLad6, D7 as CarLad7 } from "./veteranos-rc/Carrusel2";
import { C1 as CarVet1, C2 as CarVet2, C3 as CarVet3, C4 as CarVet4, C5 as CarVet5, C6 as CarVet6 } from "./veteranos-rc/Carrusel";
import { DURACION_VETERANOS } from "./veteranos-rc/timeline";
import { DURACION_NOVATO } from "./novato-rc/timeline";
import { DURACION_ELITE } from "./elite-rc/timeline";
import { DURACION_QUE_ES } from "./que-es-rc/timeline";
import { DURACION_SECRETO_VOZ } from "./secreto-rc/timeline1";
import { DURACION_RC, escenaRC } from "./ring-closers/timeline";
import { C1Portada, C2NoVes, C3ConLuz, C4Cierre } from "./carrusel/slides";
import { DURACION_REP } from "./timeline-reparto";
import { DURACION_DEM } from "./timeline-demora";
import { DURACION_VEL } from "./timeline-velocidad";
import { DURACION_FUGA } from "./timeline-fuga";
import { DURACION_PANEL } from "./timeline-panel";
import { DURACION_SERVICE } from "./timeline-service";
import { VIDEO } from "./theme";
import { DURACION_TOTAL, ESCENAS } from "./timeline";
import { S1Gancho } from "./escenas/S1Gancho";
import { S2Pregunta } from "./escenas/S2Pregunta";
import { S3Espera } from "./escenas/S3Espera";
import { S4Golpe } from "./escenas/S4Golpe";
import { S5AutomLead } from "./escenas/S5AutomLead";
import { S6Regla } from "./escenas/S6Regla";
import { S7Capacidades } from "./escenas/S7Capacidades";
import { S8Cierre } from "./escenas/S8Cierre";
import { SettersMuestra } from "./setters-rc/senal";
import { MuestraGoz, DUR_MUESTRA as DUR_GOZ } from "./setters-goz/Muestra";
import { MuestraGozV2, DUR_V2 as DUR_GOZ2 } from "./setters-goz/MuestraV2";
import { MuestraOficina, DUR_OFI } from "./oficina-rc/Muestra";
import { VideoOficina, DUR_OFI_V } from "./oficina-rc/Video";
import { VideoPipeline, DUR_PIPE } from "./pipeline-rc/Video";
import { VideoRacha, DUR_RACHA } from "./racha-rc/Video";
import { VideoLibreto, DUR_LIBRETO } from "./libreto-rc/Video";
import { MuestraSilencio, DUR_SIL_MUESTRA } from "./silencio-rc/Muestra";
import { VideoSilencio, DUR_SILENCIO } from "./silencio-rc/Video";
import { MuestraCajaNegra, DUR_CN_MUESTRA } from "./caja-negra-rc/Muestra";
import { VideoCajaNegra, DUR_CN } from "./caja-negra-rc/Video";
import { SettersGozCompleto, TOTAL_COMPLETO } from "./setters-goz/Completo";
import { AnuncioSetters, TOTAL_ANUNCIO } from "./setters-goz/Anuncio";
import { SettersVideo, DURACION_SETTERS } from "./setters-rc/video";

const ESCENA_COMPONENTES = [
  { id: "S1Gancho", componente: S1Gancho },
  { id: "S2Pregunta", componente: S2Pregunta },
  { id: "S3Espera", componente: S3Espera },
  { id: "S4Golpe", componente: S4Golpe },
  { id: "S5AutomLead", componente: S5AutomLead },
  { id: "S6Regla", componente: S6Regla },
  { id: "S7Capacidades", componente: S7Capacidades },
  { id: "S8Cierre", componente: S8Cierre },
];

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="AutomLead"
        component={AutomLeadVideo}
        durationInFrames={DURACION_TOTAL}
        fps={VIDEO.fps}
        width={VIDEO.width}
        height={VIDEO.height}
      />

      <Composition
        id="Service"
        component={ServiceVideo}
        durationInFrames={DURACION_SERVICE}
        fps={VIDEO.fps}
        width={VIDEO.width}
        height={VIDEO.height}
      />

      <Composition
        id="Panel"
        component={PanelVideo}
        durationInFrames={DURACION_PANEL}
        fps={VIDEO.fps}
        width={VIDEO.width}
        height={VIDEO.height}
      />

      <Composition
        id="Prueba3D"
        component={Prueba3D}
        durationInFrames={60}
        fps={VIDEO.fps}
        width={VIDEO.width}
        height={VIDEO.height}
      />

      <Composition
        id="PruebaGLB"
        component={PruebaGLB}
        durationInFrames={60}
        fps={VIDEO.fps}
        width={VIDEO.width}
        height={VIDEO.height}
      />

      <Composition
        id="Fuga"
        component={FugaVideo}
        durationInFrames={DURACION_FUGA}
        fps={VIDEO.fps}
        width={VIDEO.width}
        height={VIDEO.height}
      />

      <Composition
        id="Estudio"
        component={Estudio}
        durationInFrames={60}
        fps={VIDEO.fps}
        width={VIDEO.width}
        height={VIDEO.height}
      />

      <Composition
        id="Velocidad"
        component={VelocidadVideo}
        durationInFrames={DURACION_VEL}
        fps={VIDEO.fps}
        width={VIDEO.width}
        height={VIDEO.height}
      />

      <Composition
        id="Reparto"
        component={RepartoVideo}
        durationInFrames={DURACION_REP}
        fps={VIDEO.fps}
        width={VIDEO.width}
        height={VIDEO.height}
      />

      <Composition
        id="Demora"
        component={DemoraVideo}
        durationInFrames={DURACION_DEM}
        fps={VIDEO.fps}
        width={VIDEO.width}
        height={VIDEO.height}
      />

      {/* Ring Closers — marca independiente, comparte solo las herramientas de audio */}
      <Composition
        id="RingClosers"
        component={RingClosersVideo}
        durationInFrames={DURACION_RC}
        fps={30}
        width={1080}
        height={1920}
      />
      <Folder name="RingClosers-Escenas">
        {[
          { id: "r1-gancho", c: R1Gancho },
          { id: "r2-comodidad", c: R2Comodidad },
          { id: "r2-tercera", c: R2Tercera },
          { id: "r3-solucion", c: R3Solucion },
          { id: "r4-honestidad", c: R4Honestidad },
          { id: "r5-cierre", c: R5Cierre },
        ].map(({ id, c }) => (
          <Composition
            key={id}
            id={`RC-${id}`}
            component={c}
            durationInFrames={escenaRC(id).durationInFrames}
            fps={30}
            width={1080}
            height={1920}
          />
        ))}
      </Folder>

      {/* Reel de Ring Closers v2: 9:16 nativo, gancho "sos closer y no estás mejorando" */}
      <Composition id="Reel-RingClosers" component={ReelVideo} durationInFrames={DURACION_REEL}
        fps={30} width={1080} height={1920} />
      <Folder name="Reel-RC-Escenas">
        {[
          { id: "s1-gancho", c: ReelEscenas.S1Gancho },
          { id: "s2-problema", c: ReelEscenas.S2Problema },
          { id: "s3-solucion", c: ReelEscenas.S3Solucion },
          { id: "s4-oportunidad", c: ReelEscenas.S4Oportunidad },
          { id: "s5-cta", c: ReelEscenas.S5Cta },
        ].map(({ id, c }) => (
          <Composition key={id} id={`Reel-${id}`} component={c}
            durationInFrames={reel.escena(id).durationInFrames} fps={30} width={1080} height={1920} />
        ))}
      </Folder>

      {/* Ring Closers: video de estilos, "Elegís cómo entrás al ring" */}
      <Composition id="Estilos-RingClosers" component={EstilosVideo} durationInFrames={DURACION_ESTILOS}
        fps={30} width={1080} height={1920} />
      <Folder name="Estilos-RC-Escenas">
        {[
          { id: "e1-avatar", c: EstilosEscenas.E1Avatar },
          { id: "e2-guardias", c: EstilosEscenas.E2Guardias },
          { id: "e3-zurdo", c: EstilosEscenas.E3Zurdo },
          { id: "e4-contragolpe", c: EstilosEscenas.E4Contragolpe },
          { id: "e5-noqueador", c: EstilosEscenas.E5Noqueador },
          { id: "e6-prueba", c: EstilosEscenas.E6Prueba },
          { id: "e7-camino", c: EstilosEscenas.E7Camino },
          { id: "e8-cta", c: EstilosEscenas.E8Cta },
        ].map(({ id, c }) => (
          <Composition key={id} id={`Estilos-${id}`} component={c}
            durationInFrames={estilos.escena(id).durationInFrames} fps={30} width={1080} height={1920} />
        ))}
      </Folder>

      {/* Ring Closers: racha, logros y el momento de subir de rango */}
      <Composition id="Racha-RingClosers" component={RachaVideo} durationInFrames={DURACION_RACHA}
        fps={30} width={1080} height={1920} />
      <Folder name="Racha-RC-Escenas">
        {[
          { id: "s1-gancho", c: RachaEscenas.S1Gancho },
          { id: "s2-problema", c: RachaEscenas.S2Problema },
          { id: "s3-racha", c: RachaEscenas.S3Racha },
          { id: "s4-logro", c: RachaEscenas.S4Logro },
          { id: "s5-rankup", c: RachaEscenas.S5Rankup },
          { id: "s6-cierre", c: RachaEscenas.S6Cierre },
          { id: "s7-cta", c: RachaEscenas.S7Cta },
        ].map(({ id, c }) => (
          <Composition key={id} id={`Racha-${id}`} component={c}
            durationInFrames={racha.escena(id).durationInFrames} fps={30} width={1080} height={1920} />
        ))}
      </Folder>

      {/* Ring Closers: explicador simple — qué es, cómo funciona, rango, currículum y ofertas */}
      <Composition id="Explicador-RingClosers" component={ExplicadorVideo} durationInFrames={DURACION_EXPLICADOR}
        fps={30} width={1080} height={1920} />
      <Folder name="Explicador-RC-Escenas">
        {[
          { id: "s1-que-es", c: ExplicadorEscenas.S1QueEs },
          { id: "s2-problema", c: ExplicadorEscenas.S2Problema },
          { id: "s3-solucion", c: ExplicadorEscenas.S3Solucion },
          { id: "s4-rango", c: ExplicadorEscenas.S4Rango },
          { id: "s5-ofertas", c: ExplicadorEscenas.S5Ofertas },
          { id: "s6-cierre", c: ExplicadorEscenas.S6Cierre },
        ].map(({ id, c }) => (
          <Composition key={id} id={`Explicador-${id}`} component={c}
            durationInFrames={explicador.escena(id).durationInFrames} fps={30} width={1080} height={1920} />
        ))}
      </Folder>

      {/* Ring Closers: estilo "secreto" — tipografía cinética + objeto metálico. Serie "Secreto de closer". */}
      <Composition id="Secreto-RingClosers" component={SecretoVideo} durationInFrames={DURACION_SECRETO}
        fps={30} width={1080} height={1920} />
      <Composition id="Secreto-RingClosers-Voz" component={SecretoVozVideo} durationInFrames={DURACION_SECRETO_VOZ}
        fps={30} width={1080} height={1920} />

      {/* Ring Closers: qué es, qué problema resuelve y por qué usarlo (3 rounds, voz Charon). */}
      <Composition id="Que-Es-RingClosers" component={QueEsVideo} durationInFrames={DURACION_QUE_ES}
        fps={30} width={1080} height={1920} />

      {/* Video para closers de élite: afilás, te conocen, te buscan. Voz Charon, música a 120 BPM. */}
      <Composition id="Elite-RingClosers" component={EliteVideo} durationInFrames={DURACION_ELITE}
        fps={30} width={1080} height={1920} />

      {/* Portada del reel de élite (imagen fija). Se exporta con `remotion still --frame=60 --public-dir=public-elite` (las estrellas y la firma entran con fundido). */}
      <Composition id="Portada-Elite" component={PortadaElite} durationInFrames={90}
        fps={30} width={1080} height={1920} />

      {/* Video para closers novatos: "El ascenso" (cámara que sube, resaltador, ámbar a esmeralda). Voz Charon. */}
      <Composition id="Novato-RingClosers" component={NovatoVideo} durationInFrames={DURACION_NOVATO}
        fps={30} width={1080} height={1920} />

      {/* Portada del reel para novatos (imagen fija): `remotion still --frame=60 --public-dir=public-novato`. */}
      <Composition id="Portada-Novato" component={PortadaNovato} durationInFrames={90}
        fps={30} width={1080} height={1920} />

      {/* Video para closers veteranos: "El costo de aprender en vivo" (odómetro de leads quemados). Voz Charon. */}
      <Composition id="Veteranos-RingClosers" component={VeteranosVideo} durationInFrames={DURACION_VETERANOS}
        fps={30} width={1080} height={1920} />

      {/* Portada del reel para veteranos (imagen fija): `remotion still --frame=60 --public-dir=public-veteranos`. */}
      <Composition id="Portada-Veteranos" component={PortadaVeteranos} durationInFrames={90}
        fps={30} width={1080} height={1920} />

      {/* Video para directores comerciales ("La firma"): voz Charon, timeline-directores-rc.json. */}
      <Composition id="Directores-RingClosers" component={DirectoresVideo} durationInFrames={DURACION_DIRECTORES}
        fps={30} width={1080} height={1920} />
      {/* Rayos X de ventas #01 (formato Kayn): `remotion still --frame=75 --public-dir=public-rayos`. */}
      <Composition id="Gancho-Oferta" component={GanchoOferta} durationInFrames={96} fps={30} width={1080} height={1920} />
      <Composition id="Oferta-RC" component={OfertaVideo} durationInFrames={DURACION_OFERTA_RC} fps={30} width={1080} height={1920} />
      <Composition id="Portada-Oferta" component={PortadaOferta} durationInFrames={90} fps={30} width={1080} height={1920} />
      <Composition id="Portada-Director" component={PortadaDirector} durationInFrames={90} fps={30} width={1080} height={1920} />
      <Composition id="Muestra-Logros" component={MuestraLogros} durationInFrames={1} fps={30} width={1080} height={1920} />
      <Composition id="Logros-RC" component={LogrosVideo} durationInFrames={DURACION_LOGROS} fps={30} width={1080} height={1920} />
      <Composition id="Escuchate-RC" component={EscuchateVideo} durationInFrames={DURACION_ESCUCHATE} fps={30} width={1080} height={1920} />
      <Composition id="Gancho-Comunidades" component={GanchoComunidades} durationInFrames={120} fps={30} width={1080} height={1920} />
      <Composition id="Comunidades-RC" component={ComunidadesVideo} durationInFrames={DURACION_COMUNIDADES} fps={30} width={1080} height={1920} />
      <Composition id="Muestra-Oferta" component={MuestraOferta} durationInFrames={90}
        fps={30} width={1080} height={1920} />
      <Composition id="Muestra-Rayos" component={MuestraRayos} durationInFrames={90}
        fps={30} width={1080} height={1920} />
      {/* Muestra del video para directores: `remotion still --frame=60 --public-dir=public-directores`. */}
      <Composition id="Muestra-Directores" component={MuestraDirectores} durationInFrames={90}
        fps={30} width={1080} height={1920} />

      {/* Carrusel de veteranos (6 láminas 4:5): `remotion still ... --frame=60 --public-dir=public-veteranos`. */}
      <Folder name="Carrusel-Veteranos">
        <Composition id="CarVet-1" component={CarVet1} durationInFrames={90} fps={30} width={1080} height={1350} />
        <Composition id="CarVet-2" component={CarVet2} durationInFrames={90} fps={30} width={1080} height={1350} />
        <Composition id="CarVet-3" component={CarVet3} durationInFrames={90} fps={30} width={1080} height={1350} />
        <Composition id="CarVet-4" component={CarVet4} durationInFrames={90} fps={30} width={1080} height={1350} />
        <Composition id="CarVet-5" component={CarVet5} durationInFrames={90} fps={30} width={1080} height={1350} />
        <Composition id="CarVet-6" component={CarVet6} durationInFrames={90} fps={30} width={1080} height={1350} />
      </Folder>

      {/* Carrusel "Los 3 closers de tu semana" (7 láminas 4:5): `remotion still CarNiv-N ... --frame=60`. */}
      <Folder name="Carrusel-3-Niveles">
        <Composition id="CarNiv-1" component={CarLad1} durationInFrames={90} fps={30} width={1080} height={1350} />
        <Composition id="CarNiv-2" component={CarLad2} durationInFrames={90} fps={30} width={1080} height={1350} />
        <Composition id="CarNiv-3" component={CarLad3} durationInFrames={90} fps={30} width={1080} height={1350} />
        <Composition id="CarNiv-4" component={CarLad4} durationInFrames={90} fps={30} width={1080} height={1350} />
        <Composition id="CarNiv-5" component={CarLad5} durationInFrames={90} fps={30} width={1080} height={1350} />
        <Composition id="CarNiv-6" component={CarLad6} durationInFrames={90} fps={30} width={1080} height={1350} />
        <Composition id="CarNiv-7" component={CarLad7} durationInFrames={90} fps={30} width={1080} height={1350} />
      </Folder>

      {/* Destacada "Qué es Ring Closers": historias de FOTO (imágenes fijas). Se exportan con `remotion still --frame=60`. */}
      <Folder name="Historias-RC">
        {[
          { id: "1-que-es", c: HistoriasRC.H1QueEs },
          { id: "2-rivales", c: HistoriasRC.H2Rivales },
          { id: "3-videollamada", c: HistoriasRC.H3Videollamada },
          { id: "4-rangos", c: HistoriasRC.H4Rangos },
          { id: "5-coleccion", c: HistoriasRC.H5Coleccion },
          { id: "6-ranking", c: HistoriasRC.H6Ranking },
          { id: "7-entrar", c: HistoriasRC.H7Entrar },
          { id: "portada", c: HistoriasRC.HPortada },
        ].map(({ id, c }) => (
          <Composition key={id} id={`Historia-${id}`} component={c} durationInFrames={61} fps={30} width={1080} height={1920} />
        ))}
      </Folder>

      {/* Destacada "Cómo funciona": historias de FOTO. Se exportan con `remotion still --frame=0`. */}
      <Folder name="Historias-CF">
        {[
          { id: "0-portada", c: ComoFuncionaPasos.CFPortada },
          { id: "1-nivel", c: ComoFuncionaPasos.CF1Nivel },
          { id: "2-horarios", c: ComoFuncionaPasos.CF2Horarios },
          { id: "3-cartelera", c: ComoFunciona.CF3Cartelera },
          { id: "4-roleplay", c: ComoFuncionaPasos.CF4Roleplay },
          { id: "5-tarjeta", c: ComoFuncionaPasos.CF5Tarjeta },
          { id: "6-semana", c: ComoFuncionaPasos.CF6Semana },
        ].map(({ id, c }) => (
          <Composition key={id} id={`CF-${id}`} component={c} durationInFrames={1} fps={30} width={1080} height={1920} />
        ))}
      </Folder>

      {/* Destacada "Ofertas": historias de FOTO. Se exportan con `remotion still --frame=0`. */}
      <Folder name="Historias-OF">
        {[
          { id: "0-portada", c: Ofertas.OFPortada },
          { id: "1-apertura", c: Ofertas.OF1Apertura },
          { id: "2-ficha", c: Ofertas.OF2Ficha },
          { id: "3-postular", c: Ofertas.OF3Postular },
          { id: "4-reunion", c: Ofertas.OF4Reunion },
          { id: "5-director", c: Ofertas.OF5Director },
          { id: "6-rango", c: Ofertas.OF6Rango },
          /*OF*/
        ].map(({ id, c }) => (
          <Composition key={id} id={`OF-${id}`} component={c} durationInFrames={1} fps={30} width={1080} height={1920} />
        ))}
      </Folder>

      <Composition id="Nota-RC" component={NotaVideo} durationInFrames={DURACION_NOTA} fps={30} width={1080} height={1920} />
      <Composition id="Muestra-Nota" component={MuestraNota} durationInFrames={150} fps={30} width={1080} height={1920} />
      <Composition id="Muestra-Comision" component={MuestraComision} durationInFrames={150} fps={30} width={1080} height={1920} />
      <Composition id="Comision-RC" component={ComisionVideo} durationInFrames={DURACION_COMISION} fps={30} width={1080} height={1920} />
      <Composition id="Setters-Muestra" component={SettersMuestra} durationInFrames={150} fps={30} width={1080} height={1920} />
      <Composition id="Setters-Goz-Muestra" component={MuestraGoz} durationInFrames={DUR_GOZ} fps={30} width={1080} height={1920} />
      <Composition id="Setters-Goz-Muestra-V2" component={MuestraGozV2} durationInFrames={DUR_GOZ2} fps={60} width={1080} height={1920} />
      <Composition id="Oficina-RC-Muestra" component={MuestraOficina} durationInFrames={DUR_OFI} fps={60} width={1080} height={1920} />
      <Composition id="Oficina-RC-Video" component={VideoOficina} durationInFrames={DUR_OFI_V} fps={60} width={1080} height={1920} />
      <Composition id="Pipeline-RC-Video" component={VideoPipeline} durationInFrames={DUR_PIPE} fps={60} width={1080} height={1920} />
      <Composition id="Racha-RC-Video" component={VideoRacha} durationInFrames={DUR_RACHA} fps={60} width={1080} height={1920} />
      <Composition id="Libreto-RC-Video" component={VideoLibreto} durationInFrames={DUR_LIBRETO} fps={60} width={1080} height={1920} />
      <Composition id="Silencio-RC-Muestra" component={MuestraSilencio} durationInFrames={DUR_SIL_MUESTRA} fps={60} width={1080} height={1920} />
      <Composition id="Silencio-RC-Video" component={VideoSilencio} durationInFrames={DUR_SILENCIO} fps={60} width={1080} height={1920} />
      <Composition id="CajaNegra-RC-Muestra" component={MuestraCajaNegra} durationInFrames={DUR_CN_MUESTRA} fps={60} width={1080} height={1920} />
      <Composition id="CajaNegra-RC-Video" component={VideoCajaNegra} durationInFrames={DUR_CN} fps={60} width={1080} height={1920} />
      <Composition id="Setters-Goz-Completo" component={SettersGozCompleto} durationInFrames={TOTAL_COMPLETO} fps={60} width={1080} height={1920} />
      <Composition id="Setters-Anuncio" component={AnuncioSetters} durationInFrames={TOTAL_ANUNCIO} fps={60} width={1080} height={1920} />
      <Composition id="Setters-RC" component={SettersVideo} durationInFrames={DURACION_SETTERS} fps={30} width={1080} height={1920} />
      <Folder name="Historias-SETG">
        <Composition id="SETG-0-portada" component={SetG.SETGptPortada} durationInFrames={1} fps={30} width={1080} height={1920} />
        <Composition id="SETOF-3" component={SetOf2.SETOF3Agenda} durationInFrames={1} fps={30} width={1080} height={1920} />
        <Composition id="SETOF-4" component={SetOf2.SETOF4Nota} durationInFrames={1} fps={30} width={1080} height={1920} />
        <Composition id="SETOF-5" component={SetOf2.SETOF5Puntos} durationInFrames={1} fps={30} width={1080} height={1920} />
        <Composition id="SETOF-6" component={SetOf2.SETOF6Rango} durationInFrames={1} fps={30} width={1080} height={1920} />
        <Composition id="SETOF-7" component={SetOf2.SETOF7Carnet} durationInFrames={1} fps={30} width={1080} height={1920} />
        <Composition id="SETOF-2" component={SetOf.SETOF2Practica} durationInFrames={1} fps={30} width={1080} height={1920} />
        <Composition id="SETGEM-0" component={SetG.SETGem} defaultProps={{ n: 0 }} durationInFrames={1} fps={30} width={1080} height={1920} />
        <Composition id="SETGEM-1" component={SetG.SETGem} defaultProps={{ n: 1 }} durationInFrames={1} fps={30} width={1080} height={1920} />
        <Composition id="SETGEM-2" component={SetG.SETGem} defaultProps={{ n: 2 }} durationInFrames={1} fps={30} width={1080} height={1920} />
        <Composition id="SETGEM-3" component={SetG.SETGem} defaultProps={{ n: 3 }} durationInFrames={1} fps={30} width={1080} height={1920} />
        <Composition id="SETGEM-4" component={SetG.SETGem} defaultProps={{ n: 4 }} durationInFrames={1} fps={30} width={1080} height={1920} />
        <Composition id="SETGEM-5" component={SetG.SETGem} defaultProps={{ n: 5 }} durationInFrames={1} fps={30} width={1080} height={1920} />
        <Composition id="SETGEM-6" component={SetG.SETGem} defaultProps={{ n: 6 }} durationInFrames={1} fps={30} width={1080} height={1920} />
        <Composition id="SETGEM-7" component={SetG.SETGem} defaultProps={{ n: 7 }} durationInFrames={1} fps={30} width={1080} height={1920} />
        <Composition id="CarnetSetterReal" component={CarnetSetterReal} durationInFrames={1} fps={30} width={1400} height={883} defaultProps={{ ancho: 1400 }} />
        <Composition id="CarnetSetterVertical" component={CarnetSetterReal} durationInFrames={1} fps={30} width={883} height={1400} defaultProps={{ ancho: 883, vertical: true, foto: "historias-setters-gem/avatar-07.jpg" }} />
      <Composition id="SETVIT-0" component={SetVit.SETVitrina} defaultProps={{ n: 0 }} durationInFrames={1} fps={30} width={1080} height={1920} />
        <Composition id="SETVIT-1" component={SetVit.SETVitrina} defaultProps={{ n: 1 }} durationInFrames={1} fps={30} width={1080} height={1920} />
        <Composition id="SETVIT-2" component={SetVit.SETVitrina} defaultProps={{ n: 2 }} durationInFrames={1} fps={30} width={1080} height={1920} />
        <Composition id="SETVIT-3" component={SetVit.SETVitrina} defaultProps={{ n: 3 }} durationInFrames={1} fps={30} width={1080} height={1920} />
        <Composition id="SETVIT-4" component={SetVit.SETVitrina} defaultProps={{ n: 4 }} durationInFrames={1} fps={30} width={1080} height={1920} />
      </Folder>
      <Folder name="Historias-SET">
        {[
          { id: "0-portada", c: SetH.SETPortada }, { id: "1-que-es", c: SetH.SET1QueEs }, { id: "2-agenda", c: SetH.SET2Agenda }, { id: "3-reporte", c: SetH.SET3Reporte }, { id: "4-fathom", c: SetH.SET4Fathom }, { id: "5-progreso", c: SetH.SET5Progreso }, { id: "6-trabajo", c: SetH.SET6Trabajo }, { id: "7-cierre", c: SetH.SET7Cierre },
        ].map(({ id, c }) => (
          <Composition key={id} id={`SET-${id}`} component={c} durationInFrames={1} fps={30} width={1080} height={1920} />
        ))}
      </Folder>
      <Folder name="Historias-VAL">
        {[
          { id: "0-portada", c: Valor.VALPortada },
          { id: "1-peleas", c: Valor.VAL1Peleas },
          { id: "2-agenda", c: Valor.VAL2Agenda }, { id: "3-fathom", c: Valor.VAL3Fathom }, { id: "4-nota", c: Valor.VAL4Nota }, { id: "5-metricas", c: Valor.VAL5Metricas }, { id: "6-carnet", c: Valor.VAL6Carnet }, { id: "7-ofertas", c: Valor.VAL7Ofertas }, { id: "8-closers", c: Valor.VAL8Closers }, { id: "9-cierre", c: Valor.VAL9Cierre }, /*VAL*/
        ].map(({ id, c }) => (
          <Composition key={id} id={`VAL-${id}`} component={c} durationInFrames={1} fps={30} width={1080} height={1920} />
        ))}
      </Folder>

      <Folder name="Historias-DIR">
        {[
          { id: "0-portada", c: Directores.DIRPortada },
          { id: "1-apertura", c: Directores.DIR1Apertura },
          { id: "2-directorio", c: Directores.DIR2Directorio },
          { id: "3-cv", c: Directores.DIR3CV },
          { id: "4-oferta", c: Directores.DIR4Oferta },
          { id: "5-pipeline", c: Directores.DIR5Pipeline },
          { id: "6-equipo", c: Directores.DIR6Equipo },
          { id: "7-cierre", c: Directores.DIR7Cierre },
          /*DIR*/
        ].map(({ id, c }) => (
          <Composition key={id} id={`DIR-${id}`} component={c} durationInFrames={1} fps={30} width={1080} height={1920} />
        ))}
      </Folder>

      {/* Portada del reel. Un solo cuadro: se exporta con `remotion still`. */}
      <Composition
        id="Portada-Demora"
        component={PortadaDemora}
        durationInFrames={1}
        fps={VIDEO.fps}
        width={VIDEO.width}
        height={VIDEO.height}
      />

      {/* Carrusel 1080x1350. Son placas fijas: un solo cuadro cada una. */}
      <Folder name="Carrusel">
        {[
          { id: "Carrusel-1-Portada", c: C1Portada },
          { id: "Carrusel-2-NoVes", c: C2NoVes },
          { id: "Carrusel-3-ConLuz", c: C3ConLuz },
          { id: "Carrusel-4-Cierre", c: C4Cierre },
        ].map(({ id, c }) => (
          <Composition
            key={id}
            id={id}
            component={c}
            durationInFrames={1}
            fps={30}
            width={1080}
            height={1350}
          />
        ))}
      </Folder>

      {/* Cada escena suelta, para poder ajustarla sin recorrer todo el video */}
      <Folder name="Escenas">
        {ESCENA_COMPONENTES.map(({ id, componente }, i) => (
          <Composition
            key={id}
            id={id}
            component={componente}
            durationInFrames={ESCENAS[i].durationInFrames}
            fps={VIDEO.fps}
            width={VIDEO.width}
            height={VIDEO.height}
          />
        ))}
      </Folder>
    </>
  );
};
