import { useState, useEffect, memo } from "react";
import { useNavigate } from "react-router-dom";
import { MainContent } from "../components/MainContent";
import { useApiContext } from "../contexts/ApiContext";

const Index = memo(() => {
  const { endpoints, selectedEndpoint } = useApiContext();
  const navigate = useNavigate();

  const [showDocumentation, setShowDocumentation] = useState(false);

  useEffect(() => {
    // Show documentation by default if no endpoints are loaded
    setShowDocumentation(endpoints.length === 0);
  }, [endpoints.length]);

  useEffect(() => {
    // Redirect to apis page if an endpoint is selected
    if (selectedEndpoint) {
      navigate("apis");
    }
  }, [selectedEndpoint, navigate]);

  return (
    <MainContent
      endpoint={selectedEndpoint}
      showDocumentation={showDocumentation}
    />
  );
});

Index.displayName = "Index";

export default Index;
