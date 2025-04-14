import { useState } from "react";
import "./index.css";
import { fetchStopCode, fetchLiveArrivals } from "./util/api.js";
import BusArrival from "./components/BusArrival";
import InputForm from "./components/InputForm.jsx";

import Footer from "./components/Footer.jsx";
function App() {
  const [arrivals, setArrivals] = useState([]);
  const [stopInfo, setStopInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleStopCodeSubmit = async (code) => {
    setLoading(true);
    setError(null);
    setStopInfo(null);
    setArrivals([]);
    try {
      const stopData = await fetchStopCode(code);
      if (stopData) {
        setStopInfo(stopData);
        const liveArrivals = await fetchLiveArrivals(stopData.id);
        setArrivals(liveArrivals);
      } else {
        setError("Bus stop not found.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <div className='container flex flex-col justify-center items-center my-10 mx-auto max-w-2xl p-8 rounded-xl shadow-2xl'>
      <div className='flex flex-col  justify-between items-center gap-4'>
        <h1 className='text-2xl text-center font-bold tracking-wider'>
          Live Bus Times
        </h1>
        <InputForm onSubmit={handleStopCodeSubmit} />
        <p className='text-sm text-center md:text-left'>
          Enter the 5-digit code found at the bus stop
        </p>
      </div>
      {loading && <p className='text-blue-600 my-6 text-center'>Loading...</p>}
      {error && <p className='text-red-600 my-6 text-center'>{error}</p>}
      {stopInfo && <BusArrival stopInfo={stopInfo} arrivals={arrivals} />}
    </div>
    <Footer />

</>
  );
}

export default App;
