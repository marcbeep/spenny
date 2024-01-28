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
      <button class="btn btn-primary mb-4">+ New Transaction</button>
      <Table data={data} />
    </div>
  );
};

export default Home;
