import { useState, useEffect } from 'react';
const baseUrl = 'http://3.27.69.109:3000/api/v1'
function Fetch  () {
  const [data, setData] = useState([]);
  useEffect(() => {
    fetchData();
  }, []); // Empty dependency array ensures the effect runs once on mount

  // Function to fetch data
  const fetchData = async () => {
    try {
      // Make a GET request using the Fetch API
      const response = await fetch(`${baseUrl}/pods`);
      
      // Check if the response is successful (status code 200-299)
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      // Parse the JSON data from the response
      const result = await response.json();

      // Update the state with the fetched data
      setData(result);
    } catch (error) {
      console.error('Error fetching data:', error.message);
    }
  };
};
export default Fetch;