export async function sendFormDataToSheet(formData: {
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  edad?: string;
  zipCode?: string;
  idiomas: string[];
}) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const response = await fetch(
      'https://script.google.com/macros/s/AKfycbxFftXedU5wncDZ0PPaGzQZMeYEc-DI2hsbbTlc2VJieWjDkMx20rzJVAwAqfeZ_7MlGA/exec',
      {
        method: 'POST',
        mode: 'no-cors', // 👈 evita error de CORS
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      }
    );

    // No se puede leer la respuesta si usamos `no-cors`
    console.log('✅ Datos enviados a Google Sheets (sin esperar respuesta)');
  } catch (error) {
    console.error('❌ Error en la petición a Google Sheets:', error);
  }
}
