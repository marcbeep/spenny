import {useEffect, useState} from 'react';
import Table from '../components/Table';

const Home = () => {

  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch('https://cash-api.reeflink.org/trans/');
      const data = await res.json();

      if (res.ok){
        setData(data);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="home">
      <h1 className="text-xl font-bold mb-4">Home</h1>
      <Table data={data} />
    </div>
  );
};

export default Home;
