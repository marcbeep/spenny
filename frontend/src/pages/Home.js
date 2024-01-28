import {useEffect, useState} from 'react';

const apiBaseUrl = process.env.REACT_APP_API_URL;

const Home = () => {

  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`${apiBaseUrl}/trans/`);
      const data = await res.json();

      if (res.ok){
        setData(data);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="home">
      <h1>Home</h1>
      {data && data.map((item) => (
        <div key={item.id}>
          <h3>{item.title}</h3>
          <p>{item.amount}</p>
        </div>
      ))}
    </div>
  );
};

export default Home;
