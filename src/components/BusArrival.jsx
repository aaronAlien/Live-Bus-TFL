import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import "../../src/index.css";


const BusArrival = ({ stopInfo, arrivals }) => {
  if (!stopInfo) {
    return <p className="text-slate-600 my-6 text-center">No stop information available.</p>;
  }

  if (!arrivals || arrivals.length === 0) {
    return <p className="text-slate-600 my-6 text-center">No live arrivals for this stop.</p>;
  }

  function formatDistanceAbbr(date, options = {}) {
    // regular date-fns
    const formatted = formatDistanceToNow(date, options)
    
    // replace min
    return formatted
      .replace(/minutes?/g, 'min')
      .replace(/seconds?/g, 'sec')
  }

  const arrivalsByLine = arrivals.reduce((acc, arrival) => {
    const { lineName } = arrival;
    if (!acc[lineName]) {
      acc[lineName] = [];
    }
    acc[lineName].push(arrival);
    return acc;
  }, {});

  const stopLines = arrivals.reduce((acc, arrival) => {
    if (!acc.includes(arrival.lineName)) {
      acc.push(arrival.lineName);
    }
    return acc;
  }, []).join(', ');


  return (
    <div className="mt-12">
      <div className="flex flex-col gap-4 items-center justify-between mb-4">
        <h2 className="text-xl font-semibold uppercase tracking-wider border-b-4 border-accent-2 py-2 px-4 rounded">{stopInfo.commonName}</h2>
        {stopLines && <p className="font-bold mb-2 text-xl border-4 border-transparent bg-accent-1 text-black py-2 px-6 text-center rounded-lg">{stopLines}</p>}
      </div>

      {Object.entries(arrivalsByLine).map(([lineName, lineArrivals]) => (
        <div key={lineName} className="mb-3 border-b border-accent-2 py-3">

          <h3 className="font-semibold text-black bg-accent-1 rounded-lg text-lg w-min px-3 py-1 mb-2 md:mb-4">{lineName}</h3>

          <ul className="space-y-2">
            {lineArrivals.map((arrival) => (
              <li key={arrival.id} className="text-base text-black">
                <h3 className="uppercase text-base">
                {arrival.destinationName}</h3>{' '}
                <span className="text-black font-semibold tracking-wide">
                  {formatDistanceAbbr(new Date(arrival.expectedArrival), {
                    addSuffix: true,
                  })}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <button 
      className="bg-accent-2 hover:opacity-80 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline uppercase cursor-pointer transition-opacity duration-300 ease-in-out"
      onClick={() => window.location.reload()}
      >
refresh
      </button>
    </div>
  );
};

export default BusArrival;