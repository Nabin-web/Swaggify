import React from "react";
import ReactJson from "react-json-view";

type JsonValue = string | boolean | number | JsonObject | JsonValue[] | null;
interface JsonObject {
  [key: string]: JsonValue;
}

interface JsonViewer {
  json: JsonObject;
}

const ReactJsonViewer = ({ json }: JsonViewer) => {
  return (
    <ReactJson collapsed={1} theme={"shapeshifter"} name={false} src={json} />
  );
};

export default ReactJsonViewer;
