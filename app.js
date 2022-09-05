import CameraControls from "camera-controls";
import { Color } from "three";
import { IfcViewerAPI } from "web-ifc-viewer";

const container = document.getElementById("viewer-container");
const viewer = new IfcViewerAPI({
  container,
  backgroundColor: new Color(0xbebebe),
});

viewer.grid.setGrid(30, 30);
viewer.axes.setAxes();
viewer.context.ifcCamera.cameraControls.setLookAt(50, 50, 50, 0, 0, 0);
viewer.context.ifcCamera.cameraControls.dollyToCursor = true;

/**************** Loader local files ************************/

const input = document.getElementById("file-input");

input.addEventListener(
  "change",

  async (changed) => {
    const file = changed.target.files[0];
    const ifcURL = URL.createObjectURL(file);
    viewer.IFC.loadIfcUrl(ifcURL);
  },

  false
);

/******************* Loader URL path *****************************/

async function loadIfc(url) {
  const model = await viewer.IFC.loadIfcUrl(url);
  await viewer.shadowDropper.renderShadow(model.modelID);
  viewer.context.renderer.postProduction.active = true;

  const ifcProject = await viewer.IFC.getSpatialStructure(model.modelID);
  createTreeMenu(ifcProject);
}
loadIfc("../Resources/temp/01.ifc");

// Spatial tree menu

function createTreeMenu(ifcProject) {
  const root = document.getElementById("tree-root");
  removeAllChildren(root);
  const ifcProjectNode = createNestedChild(root, ifcProject);
  ifcProject.children.forEach((child) => {
    constructTreeMenuNode(ifcProjectNode, child);
  });
}

function nodeToString(node) {
  return `${node.type} - ${node.expressID}`;
}

function constructTreeMenuNode(parent, node) {
  const children = node.children;
  if (children.length === 0) {
    createSimpleChild(parent, node);
    return;
  }
  const nodeElement = createNestedChild(parent, node);
  children.forEach((child) => {
    constructTreeMenuNode(nodeElement, child);
  });
}

function createNestedChild(parent, node) {
  const content = nodeToString(node);
  const root = document.createElement("li");
  createTitle(root, content);
  const childrenContainer = document.createElement("ul");
  childrenContainer.classList.add("nested");
  root.appendChild(childrenContainer);
  parent.appendChild(root);
  return childrenContainer;
}

function createTitle(parent, content) {
  const title = document.createElement("span");
  title.classList.add("caret");
  title.onclick = () => {
    title.parentElement.querySelector(".nested").classList.toggle("active");
    title.classList.toggle("caret-down");
  };
  title.textContent = content;
  parent.appendChild(title);
}

function createSimpleChild(parent, node) {
  const content = nodeToString(node);
  const childNode = document.createElement("li");
  childNode.classList.add("leaf-node");
  childNode.textContent = content;
  parent.appendChild(childNode);

  childNode.onmouseenter = () => {
    viewer.IFC.selector.prepickIfcItemsByID(0, [node.expressID]);
  };

  childNode.onclick = async () => {
    viewer.IFC.selector.pickIfcItemsByID(0, [node.expressID]);
  };
}

function removeAllChildren(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

/****************** Select ************************************/
window.onclick = () => viewer.IFC.selector.pickIfcItem(false, false);
window.onmousemove = () => viewer.IFC.selector.prePickIfcItem();

window.onkeydown = (event) => {
  if (event.code === "KeyC") {
    viewer.IFC.selector.unpickIfcItems();
    viewer.IFC.selector.unHighlightIfcItems();
  }
};

/******************** Get properties ***************************/

// window.onclick = async () => {
//   const { modelID, id } = await viewer.IFC.selector.pickIfcItem();
//   const props = await viewer.IFC.getProperties(modelID, id, true, false);

//   console.log(props);
// };

/**************** Properties menu *****************************/

// window.ondblclick = async () => {
//   const result = await viewer.IFC.selector.highlightIfcItem();
//   if (!result) return;
//   const { modelID, id } = result;
//   const props = await viewer.IFC.getProperties(modelID, id, true, false);
//   createPropertiesMenu(props);
// };

// const propsGUI = document.getElementById("ifc-property-menu-root");

// function createPropertiesMenu(properties) {
//   console.log(properties);

//   removeAllChildren(propsGUI);

//   const psets = properties.psets;
//   const mats = properties.mats;
//   const type = properties.type;

//   delete properties.psets;
//   delete properties.mats;
//   delete properties.type;

//   for (let key in properties) {
//     createPropertyEntry(key, properties[key]);
//   }
// }

// function createPropertyEntry(key, value) {
//   const propContainer = document.createElement("div");
//   propContainer.classList.add("ifc-property-item");

//   if (value === null || value === undefined) value = "undefined";
//   else if (value.value) value = value.value;

//   const keyElement = document.createElement("div");
//   keyElement.textContent = key;
//   propContainer.appendChild(keyElement);

//   const valueElement = document.createElement("div");
//   valueElement.classList.add("ifc-property-value");
//   valueElement.textContent = value;
//   propContainer.appendChild(valueElement);

//   propsGUI.appendChild(propContainer);
// }

// function removeAllChildren(element) {
//   while (element.firstChild) {
//     element.removeChild(element.firstChild);
//   }
// }

/****************** Reset View buttons **********************/

const azimuthPositveX = document.getElementById("azimuth-x-positive");
azimuthPositveX.addEventListener("click", setAzimuthPosX);
function setAzimuthPosX() {
  viewer.context.ifcCamera.cameraControls.setLookAt(
    50,
    0,
    1,
    0,
    0,
    0,
    (enableTransition = true)
  );
}

const azimuthNegativeX = document.getElementById("azimuth-x-negative");
azimuthNegativeX.addEventListener("click", setAzimuthNegX);
function setAzimuthNegX() {
  viewer.context.ifcCamera.cameraControls.setLookAt(
    -50,
    0,
    0,
    0,
    0,
    0,
    (enableTransition = true)
  );
}

const polarPositive = document.getElementById("polar-positive");
polarPositive.addEventListener("click", setPolarPos);
function setPolarPos() {
  viewer.context.ifcCamera.cameraControls.setLookAt(
    0,
    50,
    0,
    0,
    0,
    0,
    (enableTransition = true)
  );
}

const polarNegative = document.getElementById("polar-negative");
polarNegative.addEventListener("click", setPolarNeg);
function setPolarNeg() {
  viewer.context.ifcCamera.cameraControls.setLookAt(
    0,
    -50,
    0,
    0,
    0,
    0,
    (enableTransition = true)
  );
}

const azimuthPositveZ = document.getElementById("azimuth-z-positive");
azimuthPositveZ.addEventListener("click", setAzimuthPosZ);
function setAzimuthPosZ() {
  viewer.context.ifcCamera.cameraControls.setLookAt(
    0,
    0,
    50,
    0,
    0,
    0,
    (enableTransition = true)
  );
}

const azimuthNegativeZ = document.getElementById("azimuth-z-negative");
azimuthNegativeZ.addEventListener("click", setAzimuthNegZ);
function setAzimuthNegZ() {
  viewer.context.ifcCamera.cameraControls.setLookAt(
    0,
    0,
    -50,
    0,
    0,
    0,
    (enableTransition = true)
  );
}

const azimuthIsometric = document.getElementById("isometric");
azimuthIsometric.addEventListener("click", setAzimuthIso);
function setAzimuthIso() {
  viewer.context.ifcCamera.cameraControls.setLookAt(
    50,
    50,
    50,
    0,
    0,
    0,
    (enableTransition = true)
  );
}

/**************************** Toggle ViewButtons *************************/

const viewButton = document.getElementById("viewBtn");
const viewBtnContainer = document.getElementById("navBoxes");

viewButton.addEventListener("click", visibility);
function visibility(event) {
  if (!this.dataset.clicked) {
    this.setAttribute("data-clicked", "true");
    viewBtnContainer.style = "display:inline-flex";
    viewButton.style = "outline-offset: -6px";
  } else {
    this.removeAttribute("data-clicked");
    this.removeAttribute("style");
    viewBtnContainer.removeAttribute("style");
  }
}

const lockedTopView = document.getElementById("view2D");

lockedTopView.addEventListener("click", toGeometryCamera);
function toGeometryCamera(event) {
  if (!this.dataset.clicked) {
    this.style = "outline-offset: -6px";
    this.setAttribute("data-clicked", "true");
    viewer.context.ifcCamera.cameraControls.setLookAt(
      0,
      50,
      0,
      0,
      0,
      0,
      (enableTransition = true)
    );
    viewer.context.ifcCamera.cameraControls.mouseButtons.left =
      CameraControls.ACTION.TRUCK;
  } else {
    this.removeAttribute("style");
    this.removeAttribute("data-clicked");
    viewer.context.ifcCamera.cameraControls.mouseButtons.left =
      CameraControls.ACTION.ROTATE;
  }
}

const hideSelectedElements = document.getElementById("hideButton");

hideSelectedElements.addEventListener("click", hidingSelected);
function hidingSelected(event) {
  if (!this.dataset.clicked) {
    this.setAttribute("data-clicked", "true");
    const props = viewer.IFC.getProperties(modelID, id, true, false);
    const selectedElements = [];
    selectedElements.push(props);
    console.log(id);
    // viewer.IFC.selector.dispose(selectedElements);
  } else {
    this.removeAttribute("data-clicked");
  }
}
