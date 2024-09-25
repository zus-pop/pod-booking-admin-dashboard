import { useState, useEffect } from 'react';
const baseUrl = 'http://3.27.69.109:3000/api/v1'
const Fetch = () => {
  const [photos, setPhotos] = useState([]);
  useEffect(() => {
    fetch(`${baseUrl}/pods`)
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        console.log(data);
        setPhotos(data);
      });
  }, []);
  return (
    <div>
      {photos.map((photo) => (
        <img key={photo.pod_id} src={photo.url} alt={photo.title} width={100} />
      ))}
    </div>
  );
};
export default Fetch;