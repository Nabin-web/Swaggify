export const getNamespace = () => {
  const namespaceLocalstorage = localStorage.getItem("namespace");
  const url = location.hostname;

  if (url === "localhost" || url.includes("192")) {
    return namespaceLocalstorage || "pos";
  }

  const namespace = url?.split(".")?.[0];
  return namespaceLocalstorage || namespace;
};
