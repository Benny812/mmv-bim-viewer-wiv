import { Color } from "three";
import { IfcViewerAPI } from "web-ifc-viewer";

const container = document.getElementById("viewer-container");
const viewer = new IfcViewerAPI({
  container,
  backgroundColor: new Color(0xbebebe),
});

// Create grid and axes
viewer.grid.setGrid(30, 30);
viewer.axes.setAxes();

async function loadIfc(url) {
  // Load the model
  const model = await viewer.IFC.loadIfcUrl(url);

  // Add dropped shadow and post-processing efect
  await viewer.shadowDropper.renderShadow(model.modelID);
  viewer.context.renderer.postProduction.active = true;
}

loadIfc("../Resources/temp/01.ifc");
