import Modal from "../modal/madal";

const MapView = ({setMapLocation, lat, lng }) => {
  if (!lat || !lng) return <p>Location mavjud emas</p>;

  return (
    <Modal
      modalSize='bigModal'
      handleModal={() => setMapLocation(null)}
      positionX={'20%'}
      positionY={'10%'} 
    >
      <div style={{ width: "100%", height: "700px" }}>
        <iframe
          title="google-map"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          src={`https://www.google.com/maps?q=${lat},${lng}&z=15&output=embed`}
        />
      </div>
    </Modal>
  );
};

export default MapView;
