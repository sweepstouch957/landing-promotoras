import { Clock, Calendar, MapPin, Star, Phone, TrendingUp } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                S
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">
                Sweepstouch
              </span>
            </div>
            <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium transition-colors">
              Aplicar Ahora
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-purple-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium mb-6">
                💰 Gana hasta $25/hora
              </div>

              <h1 className="text-5xl font-bold text-gray-900 mb-6">
                Trabajo Flexible
                <br />
                para <span className="text-purple-600">Estudiantes</span>
              </h1>

              <p className="text-xl text-gray-600 mb-8">
                ¿Eres estudiante universitaria y buscas un trabajo que se adapte
                a tu horario académico? ¡Esta oportunidad es perfecta para ti!
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="flex items-center bg-white p-3 rounded-lg shadow-sm">
                  <Clock className="w-5 h-5 text-blue-500 mr-2" />
                  <span className="text-gray-700">Solo 4 horas</span>
                </div>
                <div className="flex items-center bg-white p-3 rounded-lg shadow-sm">
                  <Calendar className="w-5 h-5 text-purple-500 mr-2" />
                  <span className="text-gray-700">Horario flexible</span>
                </div>
                <div className="flex items-center bg-white p-3 rounded-lg shadow-sm">
                  <MapPin className="w-5 h-5 text-green-500 mr-2" />
                  <span className="text-gray-700">Múltiples ubicaciones</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors">
                  Aplicar Ahora
                </button>
                <button className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-8 py-3 rounded-lg font-medium transition-colors">
                  Más Información
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="w-full h-64 bg-gray-200 rounded-lg mb-4 relative overflow-hidden">
                  {/* Imagen desde carpeta public */}
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                    <img
                      src="/estudiante-trabajando.png"
                      alt="Estudiante trabajando"
                      className="object-cover w-full h-full"
                    />
                  </div>

                  {/* Money circle overlay */}
                  <div className="absolute top-4 right-4 w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-xs font-bold">💵</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Payment Structure */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Estructura de Pagos Transparente
            </h2>
            <p className="text-xl text-gray-600">
              Gana más según tu rendimiento - ¡Tú decides cuánto ganar!
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Participaciones
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Pago por Turno
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Pago por Hora
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900">100</td>
                    <td className="px-6 py-4 text-sm font-semibold text-green-600">
                      $40
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-green-600">
                      $10
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900">150</td>
                    <td className="px-6 py-4 text-sm font-semibold text-green-600">
                      $60
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-green-600">
                      $15
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900">175</td>
                    <td className="px-6 py-4 text-sm font-semibold text-green-600">
                      $70
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-green-600">
                      $17.50
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      200 (Meta)
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-green-600">
                      $80
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-green-600">
                      $20
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900">250</td>
                    <td className="px-6 py-4 text-sm font-semibold text-green-600">
                      $86
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-green-600">
                      $21.50
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900">300</td>
                    <td className="px-6 py-4 text-sm font-semibold text-green-600">
                      $92
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-green-600">
                      $23
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900">350</td>
                    <td className="px-6 py-4 text-sm font-semibold text-green-600">
                      $100
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-green-600">
                      $25
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Sweepstouch */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              ¿Por Qué Elegir Sweepstouch?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Flexibilidad Total */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Flexibilidad Total
              </h3>
              <ul className="space-y-3">
                <li className="flex items-center text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Tú eliges cuándo trabajar
                </li>
                <li className="flex items-center text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Turnos de 4 horas
                </li>
                <li className="flex items-center text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Compatible con clases
                </li>
                <li className="flex items-center text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Sin horarios fijos
                </li>
              </ul>
            </div>

            {/* Tecnología Amigable */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                <Phone className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Tecnología Amigable
              </h3>
              <ul className="space-y-3">
                <li className="flex items-center text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  App móvil intuitiva
                </li>
                <li className="flex items-center text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Check-in/out automático
                </li>
                <li className="flex items-center text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Tracking en tiempo real
                </li>
                <li className="flex items-center text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Pago semanal directo
                </li>
              </ul>
            </div>

            {/* Desarrollo Profesional */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Desarrollo Profesional
              </h3>
              <ul className="space-y-3">
                <li className="flex items-center text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Habilidades de ventas
                </li>
                <li className="flex items-center text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Experiencia en marketing
                </li>
                <li className="flex items-center text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Networking
                </li>
                <li className="flex items-center text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Referencias para CV
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Bonos Adicionales */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Bonos Adicionales
            </h2>
            <p className="text-xl text-gray-600">
              Gana extra con nuestros bonos semanales y mensuales
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Bonos Semanales */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-blue-900 mb-6">
                Bonos Semanales
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-white p-4 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      👥
                    </div>
                    <span className="text-gray-700">5 días seguidos</span>
                  </div>
                  <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    $25
                  </span>
                </div>
                <div className="flex items-center justify-between bg-white p-4 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      ⭐
                    </div>
                    <span className="text-gray-700">Meta todos los días</span>
                  </div>
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    $50
                  </span>
                </div>
                <div className="flex items-center justify-between bg-white p-4 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      👑
                    </div>
                    <span className="text-gray-700">Top performer</span>
                  </div>
                  <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    $100
                  </span>
                </div>
                <div className="flex items-center justify-between bg-white p-4 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                      📈
                    </div>
                    <span className="text-gray-700">
                      Superar marca personal
                    </span>
                  </div>
                  <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    $20
                  </span>
                </div>
              </div>
            </div>

            {/* Bonos Mensuales */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-purple-900 mb-6">
                Bonos Mensuales
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-white p-4 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      💰
                    </div>
                    <span className="text-gray-700">
                      Promedio 200+ participaciones
                    </span>
                  </div>
                  <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    $200
                  </span>
                </div>
                <div className="flex items-center justify-between bg-white p-4 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      👥
                    </div>
                    <span className="text-gray-700">Por cada referido</span>
                  </div>
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    $50
                  </span>
                </div>
                <div className="flex items-center justify-between bg-white p-4 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      👑
                    </div>
                    <span className="text-gray-700">Líder mensual</span>
                  </div>
                  <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    $250
                  </span>
                </div>
                <div className="flex items-center justify-between bg-white p-4 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                      ⏰
                    </div>
                    <span className="text-gray-700">Puntualidad perfecta</span>
                  </div>
                  <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    $100
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Lo Que Dicen Nuestras Impulsadoras
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 text-yellow-400 fill-current"
                  />
                ))}
              </div>
              <p className="text-gray-600 mb-6">
               &quot;¡Perfecto para mi horario universitario! Gano más que en
                trabajos tradicionales y tengo flexibilidad total.&quot;
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                  M
                </div>
                <div>
                  <p className="font-semibold text-gray-900">María, 20 años</p>
                  <p className="text-sm text-gray-500">NYU</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 text-yellow-400 fill-current"
                  />
                ))}
              </div>
              <p className="text-gray-600 mb-6">
                &quot;En 3 meses he ganado $2,400 trabajando solo fines de semana.
                ¡Increíble!&quot;
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                  S
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Sofía, 19 años</p>
                  <p className="text-sm text-gray-500">Rutgers</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 text-yellow-400 fill-current"
                  />
                ))}
              </div>
              <p className="text-gray-600 mb-6">
                &quot;El ambiente es súper friendly y las bonificaciones hacen que
                valga la pena el esfuerzo extra.&quot;
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                  C
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Camila, 21 años</p>
                  <p className="text-sm text-gray-500">UConn</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Locations */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Ubicaciones Disponibles
            </h2>
            <p className="text-xl text-gray-600">
              Estamos contratando en múltiples ciudades
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">New York</h3>
              <p className="text-gray-600 text-sm">
                NYC, Buffalo, Rochester, Syracuse, Albany
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                New Jersey
              </h3>
              <p className="text-gray-600 text-sm">
                Newark, Jersey City, Paterson, Elizabeth, Trenton
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Connecticut
              </h3>
              <p className="text-gray-600 text-sm">
                Hartford, Bridgeport, New Haven, Stamford, Waterbury
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Pennsylvania
              </h3>
              <p className="text-gray-600 text-sm">
                Philadelphia, Pittsburgh, Allentown, Erie, Reading
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-400 text-sm">
              Made with Manus Create my website
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
