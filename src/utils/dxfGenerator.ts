import type { PalitoData } from "../types";
import {
  Colors,
  DxfWriter,
  HatchBoundaryPaths,
  HatchPolylineBoundary,
  HatchPredefinedPatterns,
  pattern,
  point2d,
  point3d,
  TextHorizontalAlignment,
  TextVerticalAlignment,
  Units,
  vertex,
  type MTextOptions,
} from "@tarikjabiri/dxf";

export const generateDXF = async (data: PalitoData[]) => {
  // Parâmetros globais
  const firstOrigin = point3d(0, 100);
  const gap = 15;

  // Instanciando a lib
  const dxf = new DxfWriter();
  dxf.setUnits(Units.Meters);

  // Estilo de linha
  const dashedLine = dxf.tables.addLType("DASHED", "__ __ __", [0.25, -0.125]);

  // Layers
  const depthLinesLayer = dxf.addLayer(
    "depthsLineLayer",
    Colors.Yellow,
    dashedLine.name
  );
  const scaleLayer = dxf.addLayer("scaleLayer", Colors.Red, "Continuous");
  const titlesLayer = dxf.addLayer("titlesLayer", Colors.Yellow, "Continuous");
  const finalDepthLayer = dxf.addLayer(
    "finalDepthLayer",
    Colors.Yellow,
    "Continuous"
  );
  const waterLevelShapeLayer = dxf.addLayer(
    "waterLevelShapeLayer",
    Colors.Red,
    "Continuous"
  );
  const waterLevelTextLayer = dxf.addLayer(
    "waterLevelTextLayer",
    Colors.Yellow,
    "Continuous"
  );
  const descriptionTextLayer = dxf.addLayer(
    "descriptionTextLayer",
    Colors.Yellow,
    "Continuous"
  );

  // Estilo de texto
  const arialTextStyle = dxf.tables.addStyle("arialText");
  arialTextStyle.fontFileName = "arial.ttf";
  arialTextStyle.widthFactor = 1.0;
  arialTextStyle.fixedTextHeight = 0;

  const descriptionMTextOptions: MTextOptions = {
    attachmentPoint: 3,
    width: 7.5,
    layerName: descriptionTextLayer.name,
  };

  // Definindo bloco vermelho que se repete na escala vertical
  const scaleBlock = dxf.addBlock("scaleBlock");
  scaleBlock.layerName = scaleLayer.name;
  const scalePolyline = new HatchPolylineBoundary();
  scalePolyline.add(vertex(0, 0));
  scalePolyline.add(vertex(0.2, 0));
  scalePolyline.add(vertex(0.2, -1));
  scalePolyline.add(vertex(0, -1));
  scalePolyline.add(vertex(0, 0));
  const scaleBoundary = new HatchBoundaryPaths();
  scaleBoundary.addPolylineBoundary(scalePolyline);
  const solidPattern = pattern({
    name: HatchPredefinedPatterns.SOLID,
  });
  scaleBlock.addHatch(scaleBoundary, solidPattern, {
    colorNumber: Colors.Red,
  });
  scaleBlock.addLine(point3d(0, -1), point3d(0.2, -1));

  // Bloco de linhas de profundidade
  const depthLineBlock = dxf.addBlock("depthLineBlock");
  depthLineBlock.layerName = depthLinesLayer.name;
  const depthVertices = [
    {
      point: point2d(0, 0),
    },
    {
      point: point2d(-2.72, 0),
    },
  ];
  depthLineBlock.addLWPolyline(depthVertices);

  // Bloco de nível da água
  const waterLevelBlock = dxf.addBlock("waterLevelBlock");
  waterLevelBlock.layerName = waterLevelShapeLayer.name;
  const waterLevelPolyline = new HatchPolylineBoundary();
  waterLevelPolyline.add(vertex(0, 0));
  waterLevelPolyline.add(vertex(-0.2754, 0.4406));
  waterLevelPolyline.add(vertex(0.2754, 0.4406));
  waterLevelPolyline.add(vertex(0, 0));
  const waterLevelBoundary = new HatchBoundaryPaths();
  waterLevelBoundary.addPolylineBoundary(waterLevelPolyline);
  waterLevelBlock.addHatch(waterLevelBoundary, solidPattern);
  waterLevelBlock.addLine(point3d(-0.2754, 0.4406), point3d(1.574, 0.4406));

  // Construindo cada palito
  data.forEach((sondagem, index) => {
    // Parâmetros individuais do palito
    const currentOrigin = point3d(firstOrigin.x + gap * index, firstOrigin.y);
    const maxDepth =
      sondagem.max_depth || sondagem.depths[sondagem.depths.length];

    // Fazendo o cabeçalho
    dxf.addLine(
      point3d(currentOrigin.x + 0.1, currentOrigin.y),
      point3d(currentOrigin.x + 0.1, currentOrigin.y + 2.45),
      { layerName: titlesLayer.name }
    );
    dxf.addLine(
      point3d(currentOrigin.x + 0.1, currentOrigin.y + 2.45),
      point3d(currentOrigin.x - 4.95, currentOrigin.y + 2.45),

      { layerName: titlesLayer.name }
    );

    const title = dxf.addText(
      point3d(currentOrigin.x - 0.18, currentOrigin.y + 2.67),
      0.65,
      sondagem.hole_id.toUpperCase(),
      {
        layerName: titlesLayer.name,
        horizontalAlignment: TextHorizontalAlignment.Right,
        verticalAlignment: TextVerticalAlignment.Bottom,
        secondAlignmentPoint: point3d(
          currentOrigin.x - 0.18,
          currentOrigin.y + 2.67
        ),
      }
    );
    title.textStyle = "arialText";

    const cota = dxf.addText(
      point3d(currentOrigin.x - 0.18, currentOrigin.y + 1.6),
      0.45,
      sondagem.z ? "COTA=" + sondagem.z.toFixed(2).replace(".", ",") : "COTA=0",
      {
        layerName: titlesLayer.name,
        horizontalAlignment: TextHorizontalAlignment.Right,
        verticalAlignment: TextVerticalAlignment.Bottom,
        secondAlignmentPoint: point3d(
          currentOrigin.x - 0.18,
          currentOrigin.y + 1.6
        ),
      }
    );
    cota.textStyle = "arialText";

    // Fazendo a escala vertical
    dxf.addLine(
      currentOrigin,
      point3d(currentOrigin.x, currentOrigin.y - maxDepth),
      {
        colorNumber: Colors.Red,
      }
    );
    dxf.addLine(
      point3d(currentOrigin.x + 0.2, currentOrigin.y),
      point3d(currentOrigin.x + 0.2, currentOrigin.y - maxDepth),
      { colorNumber: Colors.Red }
    );

    for (let i = 0; i < maxDepth - 2; i += 2) {
      dxf.addInsert(
        scaleBlock.name,
        point3d(currentOrigin.x, currentOrigin.y - i),
        { colorNumber: Colors.Red }
      );
    }
    const depthFloor = Math.floor(maxDepth);
    if (depthFloor !== maxDepth && !(depthFloor % 2)) {
      const finalScalePolyline = new HatchPolylineBoundary();
      finalScalePolyline.add(
        vertex(currentOrigin.x, currentOrigin.y - depthFloor)
      );
      finalScalePolyline.add(
        vertex(currentOrigin.x + 0.2, currentOrigin.y - depthFloor)
      );
      finalScalePolyline.add(
        vertex(currentOrigin.x + 0.2, currentOrigin.y - maxDepth)
      );
      finalScalePolyline.add(
        vertex(currentOrigin.x, currentOrigin.y - maxDepth)
      );
      finalScalePolyline.add(
        vertex(currentOrigin.x, currentOrigin.y - depthFloor)
      );
      const finalScaleBoundary = new HatchBoundaryPaths();
      finalScaleBoundary.addPolylineBoundary(finalScalePolyline);
      dxf.addHatch(finalScaleBoundary, solidPattern, {
        colorNumber: Colors.Red,
      });
      dxf.addLine(
        point3d(currentOrigin.x, currentOrigin.y - maxDepth),
        point3d(currentOrigin.x + 0.2, currentOrigin.y - maxDepth),
        { colorNumber: Colors.Red }
      );
    }

    // Linhas de profundidade
    sondagem.depths.forEach((d) => {
      if (d === 0) return;
      dxf.addInsert(
        depthLineBlock.name,
        point3d(currentOrigin.x, currentOrigin.y - d),
        { layerName: depthLinesLayer.name }
      );

      const depthText = dxf.addText(
        point3d(currentOrigin.x - 0.15, currentOrigin.y - d - 0.07),
        0.35,
        d.toFixed(2).replace(".", ","),
        {
          layerName: depthLinesLayer.name,
          horizontalAlignment: TextHorizontalAlignment.Right,
          verticalAlignment: TextVerticalAlignment.Bottom,
          secondAlignmentPoint: point3d(
            currentOrigin.x - 0.15,
            currentOrigin.y - d - 0.07
          ),
        }
      );
      depthText.textStyle = arialTextStyle.name;
    });

    // Descrições das camadas
    sondagem.geology.forEach((description, index) => {
      const startDepth = sondagem.depths[index] || 0;
      const endDepth = sondagem.depths[index + 1] || maxDepth;
      const midDepth = (startDepth + endDepth) / 2;

      const estimatedLines = Math.ceil(description.length / 40); // ~40 chars por linha
      const lineHeight = 0.35; // altura da linha + espaçamento
      const totalTextHeight = estimatedLines * lineHeight;

      const adjustedY = currentOrigin.y - midDepth + totalTextHeight / 2;

      const descriptionStr =
        sondagem.interp && sondagem.interp[index].trim()
          ? sondagem.interp[index].trim().toUpperCase() +
            " - " +
            description.trim().toUpperCase()
          : description.trim().toUpperCase();

      const descriptionText = dxf.addMText(
        point3d(currentOrigin.x - 1.47, adjustedY),
        0.25,
        descriptionStr,
        descriptionMTextOptions
      );
      descriptionText.textStyle = arialTextStyle.name;
    });

    //NSPTs
    const firstNsptDepth = sondagem.nspt.start_depth;
    let currentNsptDepth = firstNsptDepth;
    sondagem.nspt.values.forEach((value) => {
      const nsptText = dxf.addText(
        point3d(
          currentOrigin.x + 0.57,
          currentOrigin.y - currentNsptDepth - 0.12
        ),
        0.35,
        value,
        {
          layerName: depthLinesLayer.name,
          horizontalAlignment: TextHorizontalAlignment.Left,
          verticalAlignment: TextVerticalAlignment.Top,
          secondAlignmentPoint: point3d(
            currentOrigin.x + 0.57,
            currentOrigin.y - currentNsptDepth - 0.12
          ),
        }
      );
      nsptText.textStyle = arialTextStyle.name;
      currentNsptDepth += 1;
    });

    // Nível d'água
    const waterLevel = sondagem.water_level ?? maxDepth;
    const waterLevelStr =
      sondagem.water_level != null
        ? "NA=" + sondagem.water_level.toFixed(2).replace(".", ",")
        : "NA SECO";
    dxf.addInsert(
      waterLevelBlock.name,
      point3d(currentOrigin.x + 2.9136, currentOrigin.y - waterLevel)
    );
    const textPoint = point3d(
      sondagem.water_level ? currentOrigin.x + 2.86 : currentOrigin.x + 2.76,
      currentOrigin.y - waterLevel + 0.48
    );
    const waterLevelText = dxf.addText(textPoint, 0.25, waterLevelStr, {
      layerName: waterLevelTextLayer.name,
      horizontalAlignment: TextHorizontalAlignment.Left,
      verticalAlignment: TextVerticalAlignment.Bottom,
      secondAlignmentPoint: textPoint,
    });
    waterLevelText.textStyle = arialTextStyle.name;

    // Profundidade final
    const finalDepthStr =
      "PROFUNDIDADE FINAL = " + maxDepth.toFixed(2).replace(".", ",") + " m.";
    const finalDepthPosition = point3d(
      currentOrigin.x - 5.72,
      currentOrigin.y - maxDepth - 0.87
    );
    const finalDepthText = dxf.addText(
      finalDepthPosition,
      0.35,
      finalDepthStr,
      {
        horizontalAlignment: TextHorizontalAlignment.Left,
        verticalAlignment: TextVerticalAlignment.Top,
        secondAlignmentPoint: finalDepthPosition,
        layerName: finalDepthLayer.name,
      }
    );
    finalDepthText.textStyle = arialTextStyle.name;
  });

  // Baixando o arquivo
  const dxfString = dxf.stringify();
  downloadDXF(dxfString, "palitos.dxf");
};

const downloadDXF = (content: string, filename: string) => {
  const blob = new Blob([content], { type: "application/dxf" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
};
