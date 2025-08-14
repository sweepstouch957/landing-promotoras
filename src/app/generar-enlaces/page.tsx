"use client";

import { useState } from "react";
import { 
  Box, 
  CircularProgress, 
  Container,
  Typography, 
  Button, 
  Card,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Input,
} from '@mui/material';

import { 
  Download, 
  Link as LinkIcon, 
  Upload, 
  ContentCopy,
  CheckCircle,
  Cancel,
  Email,
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: { main: '#e91e63', dark: '#c2185b', light: '#f8bbd9' },
    secondary: { main: '#ad1457', dark: '#880e4f', light: '#f48fb1' },
  },
});

interface EmailLink {
  email: string;
  link: string;
}

export default function GenerarEnlacesPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [emailLinks, setEmailLinks] = useState<EmailLink[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [jsonFile, setJsonFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/json') {
      setJsonFile(file);
      setError(null);
    } else {
      setError('Por favor selecciona un archivo JSON válido');
      setJsonFile(null);
    }
  };

  const processJsonFile = async () => {
    if (!jsonFile) {
      setError('Por favor selecciona un archivo JSON');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const fileContent = await jsonFile.text();
      const jsonData = JSON.parse(fileContent);
      
      // Validar que el JSON contenga un array de emails
      let emails: string[] = [];
      
      if (Array.isArray(jsonData)) {
        // Si es un array directo de strings (emails)
        if (jsonData.every(item => typeof item === 'string')) {
          emails = jsonData;
        }
        // Si es un array de objetos con propiedad email
        else if (jsonData.every(item => typeof item === 'object' && item.email)) {
          emails = jsonData.map(item => item.email);
        }
      }
      // Si es un objeto con una propiedad que contiene los emails
      else if (typeof jsonData === 'object') {
        const possibleArrays = Object.values(jsonData).filter(Array.isArray);
        if (possibleArrays.length > 0) {
          const emailArray = possibleArrays[0] as any[];
          if (emailArray.every(item => typeof item === 'string')) {
            emails = emailArray;
          } else if (emailArray.every(item => typeof item === 'object' && item.email)) {
            emails = emailArray.map(item => item.email);
          }
        }
      }

      if (emails.length === 0) {
        throw new Error('No se encontraron emails válidos en el archivo JSON');
      }

      // Validar que todos sean emails válidos
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const validEmails = emails.filter(email => emailRegex.test(email));
      
      if (validEmails.length === 0) {
        throw new Error('No se encontraron emails con formato válido');
      }

      // Generar enlaces únicos para cada email
      const baseUrl = window.location.origin;
      const generatedLinks: EmailLink[] = validEmails.map(email => ({
        email: email,
        link: `${baseUrl}/training?email=${encodeURIComponent(email)}`
      }));

      setEmailLinks(generatedLinks);
      
    } catch (error) {
      console.error('Error procesando archivo JSON:', error);
      setError(`Error procesando el archivo: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, email: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedEmail(email);
      setTimeout(() => setCopiedEmail(null), 2000);
    } catch (error) {
      console.error('Error copiando al portapapeles:', error);
    }
  };

  const downloadCSV = () => {
    if (emailLinks.length === 0) return;

    const csvContent = [
      ['Email', 'Enlace'].join(','),
      ...emailLinks.map(item => [
        item.email,
        item.link
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `enlaces-usuarios-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadJSON = () => {
    if (emailLinks.length === 0) return;

    const jsonContent = JSON.stringify(emailLinks, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `enlaces-usuarios-${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: '100vh', background: '#f5f5f5', padding: 3 }}>
        <Container maxWidth="xl">
          <Card sx={{ 
            padding: 4, 
            marginBottom: 3,
            background: 'rgba(255,255,255,0.95)', 
            backdropFilter: 'blur(10px)',
            border: '2px solid #e91e63'
          }}>
            <Typography variant="h3" gutterBottom sx={{ 
              fontWeight: 700, 
              color: 'primary.main', 
              textAlign: 'center',
              marginBottom: 3
            }}>
              <LinkIcon sx={{ fontSize: 40, marginRight: 2 }} />
              Generador de Enlaces desde JSON
            </Typography>
            
            <Typography variant="body1" sx={{ 
              textAlign: 'center', 
              marginBottom: 4,
              color: 'text.secondary'
            }}>
              Sube un archivo JSON con correos electrónicos y genera enlaces únicos para envío masivo
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center' }}>
              {/* Subida de archivo */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <input
                  accept=".json"
                  style={{ display: 'none' }}
                  id="json-file-upload"
                  type="file"
                  onChange={handleFileChange}
                />
                <label htmlFor="json-file-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<Upload />}
                    sx={{
                      borderColor: '#e91e63',
                      color: '#e91e63',
                      '&:hover': { borderColor: '#c2185b', backgroundColor: 'rgba(233, 30, 99, 0.05)' }
                    }}
                  >
                    Seleccionar Archivo JSON
                  </Button>
                </label>
                
                {jsonFile && (
                  <Typography variant="body2" color="success.main">
                    Archivo seleccionado: {jsonFile.name}
                  </Typography>
                )}
              </Box>

              {/* Botón de procesar */}
              <Button
                variant="contained"
                onClick={processJsonFile}
                disabled={!jsonFile || isLoading}
                startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <Email />}
                sx={{
                  backgroundColor: '#e91e63',
                  minWidth: 200,
                  '&:hover': { backgroundColor: '#c2185b' }
                }}
              >
                {isLoading ? 'Procesando...' : 'Generar Enlaces'}
              </Button>

              {/* Botones de descarga */}
              {emailLinks.length > 0 && (
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={downloadCSV}
                    startIcon={<Download />}
                    sx={{
                      borderColor: '#4caf50',
                      color: '#4caf50',
                      '&:hover': { borderColor: '#388e3c', backgroundColor: 'rgba(76, 175, 80, 0.05)' }
                    }}
                  >
                    Descargar CSV
                  </Button>
                  
                  <Button
                    variant="outlined"
                    onClick={downloadJSON}
                    startIcon={<Download />}
                    sx={{
                      borderColor: '#2196f3',
                      color: '#2196f3',
                      '&:hover': { borderColor: '#1976d2', backgroundColor: 'rgba(33, 150, 243, 0.05)' }
                    }}
                  >
                    Descargar JSON
                  </Button>
                </Box>
              )}
            </Box>

            {error && (
              <Alert severity="error" sx={{ marginTop: 3 }}>
                {error}
              </Alert>
            )}

            {emailLinks.length > 0 && (
              <Alert severity="success" sx={{ marginTop: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, marginBottom: 1 }}>
                  {emailLinks.length} enlaces generados exitosamente
                </Typography>
                <Typography variant="body2">
                  Puedes copiar los enlaces individualmente o descargar los archivos CSV/JSON para envío masivo.
                </Typography>
              </Alert>
            )}

            {/* Ejemplo de formato JSON */}
            <Box sx={{ marginTop: 4, padding: 3, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
              <Typography variant="h6" sx={{ marginBottom: 2, color: 'primary.main' }}>
                Formatos de JSON soportados:
              </Typography>
              <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
{`// Opción 1: Array directo de emails
[
  "usuario1@ejemplo.com",
  "usuario2@ejemplo.com",
  "usuario3@ejemplo.com"
]

// Opción 2: Array de objetos con propiedad email
[
  {"email": "usuario1@ejemplo.com", "nombre": "Juan"},
  {"email": "usuario2@ejemplo.com", "nombre": "María"}
]

// Opción 3: Objeto con array de emails
{
  "usuarios": ["usuario1@ejemplo.com", "usuario2@ejemplo.com"]
}`}
              </Typography>
            </Box>
          </Card>

          {emailLinks.length > 0 && (
            <Card sx={{ 
              background: 'rgba(255,255,255,0.95)', 
              backdropFilter: 'blur(10px)',
            }}>
              <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8bbd9' }}>Email</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8bbd9' }}>Enlace Generado</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f8bbd9' }}>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {emailLinks.map((item, index) => (
                      <TableRow key={index} hover>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {item.email}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontFamily: 'monospace', 
                              fontSize: '0.75rem',
                              maxWidth: 400,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {item.link}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Tooltip title={copiedEmail === item.email ? "¡Copiado!" : "Copiar enlace"}>
                            <IconButton
                              onClick={() => copyToClipboard(item.link, item.email)}
                              color={copiedEmail === item.email ? "success" : "primary"}
                              size="small"
                            >
                              {copiedEmail === item.email ? <CheckCircle /> : <ContentCopy />}
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
}

