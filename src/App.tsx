import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Alert,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import type { PalitoData } from "./types";
import { generateDXF } from "./utils/dxfGenerator";

function App() {
  const [palitoData, setPalitoData] = useState<PalitoData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Carregar JSON de teste do public
  const loadTestData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/sp10.json");
      const data = await response.json();
      setPalitoData(data);
      setMessage({
        type: "success",
        text: "Dados de teste carregados com sucesso!",
      });
    } catch (error) {
      setMessage({ type: "error", text: "Erro ao carregar dados de teste" });
      console.error("Erro:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Upload de arquivo JSON
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string);
        setPalitoData(jsonData);
        setMessage({
          type: "success",
          text: "Arquivo JSON carregado com sucesso!",
        });
      } catch (error) {
        setMessage({ type: "error", text: "Erro ao processar arquivo JSON" });
        console.error("Erro:", error);
      }
    };
    reader.readAsText(file);
  };

  // Gerar DXF
  const handleGenerateDXF = async () => {
    if (palitoData.length === 0) {
      setMessage({
        type: "error",
        text: "Nenhum dado carregado para gerar DXF",
      });
      return;
    }

    try {
      setIsLoading(true);
      await generateDXF(palitoData);
      setMessage({ type: "success", text: "DXF gerado com sucesso!" });
    } catch (error) {
      setMessage({ type: "error", text: "Erro ao gerar DXF" });
      console.error("Erro:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card>
            <Card.Header>
              <h3 className="mb-0">Gerador de Palitos DXF</h3>
            </Card.Header>
            <Card.Body>
              {/* Mensagens */}
              {message && (
                <Alert
                  variant={message.type === "success" ? "success" : "danger"}
                  onClose={() => setMessage(null)}
                  dismissible
                >
                  {message.text}
                </Alert>
              )}

              {/* Seção de carregamento de dados */}
              <div className="mb-4">
                <h5>1. Carregar Dados</h5>
                <Row>
                  <Col md={6}>
                    <Button
                      variant="outline-primary"
                      onClick={loadTestData}
                      disabled={isLoading}
                      className="w-100 mb-2"
                    >
                      {isLoading ? "Carregando..." : "Usar Dados de Teste"}
                    </Button>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Ou fazer upload de JSON:</Form.Label>
                      <Form.Control
                        type="file"
                        accept=".json"
                        onChange={handleFileUpload}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </div>

              {/* Preview dos dados */}
              {palitoData.length > 0 && (
                <div className="mb-4">
                  <h5>2. Dados Carregados</h5>
                  <div className="bg-light p-3 rounded">
                    <strong>Sondagens encontradas:</strong> {palitoData.length}
                  </div>
                </div>
              )}

              {/* Botão de gerar DXF */}
              <div className="mb-4">
                <h5>3. Gerar DXF</h5>
                <Button
                  variant="success"
                  size="lg"
                  onClick={handleGenerateDXF}
                  disabled={isLoading || palitoData.length === 0}
                  className="w-100"
                >
                  {isLoading
                    ? "Gerando..."
                    : `Gerar DXF (${palitoData.length} palito${
                        palitoData.length !== 1 ? "s" : ""
                      })`}
                </Button>
              </div>

              {/* Debug info */}
              {palitoData.length > 0 && (
                <details className="mt-4">
                  <summary className="btn btn-link">
                    Ver dados JSON (debug)
                  </summary>
                  <pre
                    className="bg-light p-3 mt-2"
                    style={{
                      fontSize: "12px",
                      maxHeight: "300px",
                      overflow: "auto",
                    }}
                  >
                    {JSON.stringify(palitoData, null, 2)}
                  </pre>
                </details>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default App;
