export default function Locations() {
  const locations = [
    {
      state: "New York",
      cities: "NYC, Buffalo, Rochester, Syracuse, Albany"
    },
    {
      state: "New Jersey", 
      cities: "Newark, Jersey City, Paterson, Elizabeth, Trenton"
    },
    {
      state: "Connecticut",
      cities: "Hartford, Bridgeport, New Haven, Stamford, Waterbury"
    },
    {
      state: "Pennsylvania",
      cities: "Philadelphia, Pittsburgh, Allentown, Erie, Reading"
    }
  ];

  return (
    <section className="locations">
      <div className="container">
        <h2 className="section-title">Ubicaciones Disponibles</h2>
        <p className="section-subtitle">Estamos contratando en múltiples ciudades</p>
        
        <div className="locations-grid">
          {locations.map((location, index) => (
            <div key={index} className="location-card">
              <div className="location-icon">📍</div>
              <h3 className="location-state">{location.state}</h3>
              <p className="location-cities">{location.cities}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

