import { useState, useRef } from 'react'
import Chart from 'chart.js/auto'
import { Bar } from 'react-chartjs-2';
import { Line } from 'react-chartjs-2';
import './App.css'
// import { sign } from 'chart.js/helpers';
const states_abbr = {AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California', CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware',
  FL: 'Florida', GA: 'Georgia', HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa', KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', 
  MD: 'Maryland', MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada',
  NH: 'New Hampshire', NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio', OK: 'Oklahoma', OR: 'Oregon', 
  PA: 'Pennsylvania', RI:'Rhode Island', SC: 'South Carolina', SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont', VA: 'Virginia', WA: 'Washington',
  WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming'};
const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
// let _csrfToken = null;


// function getCsrfToken() {
//   const csrfToken = document.cookie.split('; ')
//     .find(row => row.startsWith('csrf_token='))
//     ?.split('=')[1];
//   return csrfToken;
// }
// async function getCsrfToken() {
//   if (_csrfToken === null) {
//     const response = await fetch(`${API_BASE}/csrf/`, {
//       // credentials: 'include',
//     });
//     const data = await response.json();
//     _csrfToken = data.csrfToken;
//   }
//   return _csrfToken
// }

function ContainerComp() {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState('none');
  const [isloading, setIsloading] = useState(false)
  const [linechartdata, setLinechartdata] = useState({});
  const [barchartdata, setBarchartdata] = useState({});
  const [largestIncrease, setLargestIncrease] = useState(0);
  const [largestDecrease, setLargestDecrease] = useState(0);
  const [ifrom, setIfrom] = useState('--')
  const [ito, setIto] = useState('--')
  const [dfrom, setDfrom] = useState('--')
  const [dto, setDto] = useState('--')
  const abortControllerRef = useRef(null);
  let latestrequestid = useRef(0);





  const getSummary = async (object) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    try {
      const controller = new AbortController();
      abortControllerRef.current = controller;
      setLoading('block')
      setSummary('')
      setIsloading(true)
      const requestid = ++latestrequestid.current;
      const response = await fetch(`${API_BASE}/api/`, {
        method: 'POST',
        body: JSON.stringify(object),
        headers: {'Content-type': 'application/json; charset=UTF-8'},
        credentials: 'include',
        signal: controller.signal,
      })
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
    
      const { value: value1 } = await reader.read();
      if (value1) {
        const data = decoder.decode(value1);
        const obj = JSON.parse(data);
        setBarchartdata(obj['chartdata1'])
        setLinechartdata(obj['chartdata'])
        if (Object.keys(obj['chartdata']).length !== 0) {
          const { increasingindices, maxIncrease } = getlargestIncrease(Object.values(obj['chartdata']))
          setIfrom(Object.keys(obj['chartdata'])[increasingindices[0]])
          setIto(Object.keys(obj['chartdata'])[increasingindices[1]])
          setLargestIncrease(maxIncrease)
          const { decreasingindices, maxDecrease } = getlargestDecrease(Object.values(obj['chartdata']))
          setDfrom(Object.keys(obj['chartdata'])[decreasingindices[0]])
          setDto(Object.keys(obj['chartdata'])[decreasingindices[1]])
          setLargestDecrease(maxDecrease)
        } else {
          setIfrom('--')
          setIto('--')
          setDfrom('--')
          setDto('--')
          setLargestDecrease(0)
          setLargestIncrease(0)
        }
        
      }
    
      const { value: value2 } = await reader.read();
      if (value2 && latestrequestid.current === requestid) {
        const data = decoder.decode(value2);
        const obj = JSON.parse(data);
        setSummary(obj['db'])
        setLoading('none')
        setIsloading(false)
      }
    } catch (e) {
      if (e.name === 'AbortError') {
        console.log('Request was aborted intentionally');
      } else {
        console.error('Fetch failed:', e);
      }
    }
  };
    




  return (
    <>
      <header className='header text-center text-3xl p-2 bg-blue-100 rounded-2xl my-4'>
        User interface to query the starbucks reviews dataset
      </header>
      
      <div className='flex flex-col min-[1570px]:flex-row min-[995px]:mx-[20px] items-center justify-center'>
        <div className='flex-3 flex flex-col mx-4'>
          <div className='flex flex-col min-[995px]:flex-row items-center m-4'>
            <div className='box min-w-[400px] m-4 p-2'>
              <MyForm loading={loading} getSummary={getSummary}/>
            </div>
            <div className='box w-full max-w-[650px] min-h-[410px] min-[995px]:min-w-[550px] '>
              <h2 className='border-b-2'>Summary</h2>
              <MySummary summary={summary} isloading={isloading}/>
            </div>
          </div>
          <div className='box m-4 max-w-[1085px]'>
            <h2 className='border-b-2'>Average Rating by Year</h2>
            <div className='flex min-w-0 min-h-0 flex-col min-[880px]:flex-row min-[880px]:min-w-128'>
              <div className='chart flex-2 w-full min-h-0 min-w-0 max-h-75 m-auto mt-2 p-2 aspect-9/16'>
                    <div className='w-full h-full'>
                      <LineChart linechartdata={linechartdata}/>
                    </div>
              </div>
              <div className='flex-1 px-2 mt-4'>
                <div className='p-2 my-2 text-2xl'>
                  <p className='text-data'>Best Year <span className='data-numbers'>{largestIncrease ? Math.max(...Object.values(linechartdata)).toFixed(2) : '--'}</span></p>
                </div>
                <div className='p-2 my-2 text-2xl border-t-1'>
                  <p className='text-data'>Worst Year <span className='data-numbers'>{largestDecrease ? Math.min(...Object.values(linechartdata)).toFixed(2) : '--'}</span></p>                  
                </div>
                <div className='p-2 my-2 text-2xl border-t-1'>
                  <p className='text-data'>Greatest Increase  </p>
                  <p className='data-numbers'>{largestIncrease.toFixed(2)} from {ifrom} to {ito}</p>
                </div>
                <div className='p-2 my-2 text-2xl border-t-1'>
                  <p className='text-data'>Greatest Decrease  <span></span></p>
                  <p className='data-numbers'>{largestDecrease.toFixed(2)} from {dfrom} to {dto}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='flex-2'>
          <div className='box m-4 '>
            <h2 className='border-b-2'>Average Rating by State</h2>
            <div className='flex flex-col min-[650px]:flex-row mt-4 h-184'>
              <div className='chart flex-2 overflow-y-auto my-2 min-w-[200px] p-4 items-stretch max-w-76'>
                <div className='aspect-4/18'>
                  <BarChart barchartdata={barchartdata}/>
                </div>
              </div>
              <div className='flex-1 '>
                <div>
                  <p className='p-2 my-2 text-2xl text-data'>Top 3 States<span></span></p>
                  <div className='p-2 my-2 text-2xl border-t-1'>
                    {Object.keys(barchartdata).slice(0,3).map((state, index) => (
                      <p key={index} className='border-b-1 border-dashed p-2 data-numbers'>{`${states_abbr[state]}`}</p>
                    ))}
                  </div>
                  <p className='p-2 my-2 text-2xl text-data'>Bottom 3 States<span></span></p>
                  <div className='p-2 my-2 text-2xl border-t-1'>
                    {Object.keys(barchartdata).slice(-3).reverse().map((state, index) => (
                      <p key={index} className='border-b-1 border-dashed p-2 data-numbers'>{`${states_abbr[state]}`}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="footer bg-blue-100 p-2 text-center py-6 mt-6">
        <p className="">© 2025 Scott Lynn. All rights reserved.</p>
      </footer>
    </>
  )
}


function MyForm({loading, getSummary}) {
  const [years, setYears] = useState({'start': '2006', 'end': '2024'});
  const [state, setState] = useState('all');
  const [ratings, setRatings] = useState([]);
  const [product, setProduct] = useState('');
  const [yearserror, setYearserror] = useState('none')
  const [failsubmit, setFailsumbit] = useState('')
  const [selyears, setSelyears] = useState('')



  const handleSubmit = (e) => {
    e.preventDefault();
    let fail = false
    if (Number(years.end) < Number(years.start)) {
      setFailsumbit('text-red-500')
      fail = true
    }
    if (ratings.length == 0) {
      setSelyears('text-red-500')
      fail = true
    }
    if (fail) {
      return
    }
    getSummary({years, state, ratings, product});
  };

  const onCheckbox = (e) => {
    setSelyears('')
    if (e.target.checked) {
      setRatings((ratings) => [e.target.value, ...ratings]);
    }
    else {
      setRatings(() => {
        const index = ratings.indexOf(e.target.value);
        if (index > -1) {
          ratings.splice(index, 1);
        }
        return ratings
      })
    }
  };

  const onDateselect = (e) => {
    if (e.target.id == 'start') {
      setYears({...years, 'start': e.target.value})
      if (Number(years.end) < Number(e.target.value)) {
        setYearserror('block')
      } else {
        setYearserror('none')
      }
    }
    if (e.target.id == 'end') {
      setYears({...years, 'end': e.target.value})
      if (Number(e.target.value) < Number(years.start)) {
        setYearserror('block')
      } else {
        setYearserror('none')
      }
    }
  };

  const onStateselect = (e) => setState(e.target.value)

  const productSelect = (e) => setProduct(e.target.value)


  const yearslist = ['2006', '2007', '2008', '2009', '2010', '2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024'];

  return (
      <form onSubmit={handleSubmit} className='flex flex-col text-center'>
        <div className='p-2'>
          <p className='font-semibold mb-2'>Date Range</p>
          <p style={{display: yearserror}} className={failsubmit}>End year cannot be less than start year</p>
          <div>
            <div className='m-2'>
              <label className='m-1' htmlFor='start'>Starting Year</label>
              <select onChange={onDateselect} className='border p-2 rounded-s-sx input-bg' id="start" name='start'>
                {yearslist.map((year, index) => {
                  return (
                    <option key={index} value={year}>{year}</option>
                  )
                })}
              </select>
            </div>
            <div className='m-2'>
              <label className='m-1' htmlFor='end'>Ending Year</label>
              <select onChange={onDateselect} className='border p-2 rounded-s-sx input-bg' id="end" name='end' value={years.end}>
                {yearslist.map((year, index) => {
                  return (
                    <option key={index} value={year}>{year}</option>
                  )
                })}
              </select>
            </div>
          </div>
        </div>
        <div className='font-semibold p-2'>
        <label className='p-2' htmlFor='state'>State</label>
        <select onChange={onStateselect} className='border p-2 rounded-s-sx input-bg' id="state" name='state'>
          <option value='all'>All</option>
          {Object.keys(states_abbr).map((state, index) => {
            return (
              <option key={index} value={state}>{states_abbr[state]}</option>
            )
          })}
        </select>
        </div>
        <fieldset className='p-2'>
        <div className='font-semibold'>
        <legend className={selyears}>Select Review Ratings</legend>
        </div>
        <div className='flex justify-between'>
          <div>
            <input className='m-1 input-bg' onChange={onCheckbox} type="checkbox" id='rating1' name="ratings" value="1" />
            <label htmlFor="ratings1">1 Star</label>
          </div>
          <div>
            <input className='m-1 input-bg' onChange={onCheckbox} type="checkbox" id='rating2' name="ratings" value="2" />
            <label htmlFor="ratings2">2 Star</label>
          </div>
          <div>
            <input className='m-1 input-bg' onChange={onCheckbox} type="checkbox" id='rating3' name="ratings" value="3" />
            <label htmlFor="ratings3">3 Star</label>
          </div>
          <div>
            <input className='m-1 input-bg' onChange={onCheckbox} type="checkbox" id='rating4' name="ratings" value="4" />
            <label htmlFor="ratings4">4 Star</label>
          </div>
          <div>
            <input className='m-1 input-bg' onChange={onCheckbox} type="checkbox" id='rating5' name="ratings" value="5" />
            <label htmlFor="ratings5">5 Star</label>
          </div>
        </div>
        </fieldset>
        <div className='font-semibold'>
        <label htmlFor='product'>Product/Service (optional)</label>
        </div>
        <select onChange={productSelect} className='border p-2 rounded-s-sx input-bg' id="product" name='product'>
          <option value="">Choose a Product/Service</option>
          <option disabled>------------------</option>
          <option value="mobile order">Mobile Order System</option>
          <option value="drive thru">The Drive Through</option>
          <option value="in store">In Store Experience</option>
          <option disabled>------------------</option>
          <option value="white chocolate mocha">White Chocolate Mocha</option>
          <option value="pumpkin spice latte">Pumpkin Spice Latte</option>
          <option value="green tea latte">Green Tea Latte</option>
          <option value="vanilla sweet cream cold brew">Vanilla Sweet Cream Cold Brew</option>
          <option value="nitro cold brew">Nitro Cold Brew</option>
          <option value="caramel macchiato">Caramel Macchiato</option>
          <option value="cinnamon dolce latte">Cinnamon Dolce Latte</option>
          <option value="chai tea latte">Chai Tea Latte</option>
          <option value="espresso">Espresso</option>
          

        </select>
        <button className='border-sky-100 border-2 hover:border-blue-600 bg-sky-100 p-1 transition-all duration-325 rounded-md m-2' type='submit'>
          <div className='flex justify-center'>
            <div style={{display: loading}} className='animate-spin bg-sky-100 mr-2 rounded-full border-t-indigo-500 border-t-3 h-8 w-8'></div><div className='p-2'>Submit</div>
          </div>
        </button>
      </form>
  );
}






function MySummary({summary, isloading}) {
  return (
      <div className={summary ? 'p-2 m-2 font-display font-medium text-lg data-numbers fade-in' : 'p-2 m-2 font-display font-medium text-lg data-numbers'}>
        {isloading ? 
        <div className='loader'>
          <span></span>
          <span></span>
          <span></span>
        </div> : <></> }
        {summary}
      </div>
  )
}


function LineChart({linechartdata}) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    // aspectRatio: 2,
    plugins: {
      legend: {
        // position: 'top',
        display: false,
      },
    },
    scales: {
      y: {
        type: 'linear',
      },
    },
  };
  const data = {
    labels: Object.keys(linechartdata),
    datasets: [
      {
        label: 'Average Ratings by Year',
        data: Object.values(linechartdata),
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  };
  return(
      <Line options={options} data={data} />
  )
}

function BarChart({barchartdata}) {
  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        display: false
      },
    },
    scales: {
      x: {
        type: 'linear',
      },
    },
  };
  const data = {
    labels: Object.keys(barchartdata),
    datasets: [
      {
        label: 'Average Ratings by State',
        data: Object.values(barchartdata),
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  };
  return(
      <Bar options={options} data={data} />
  )
}

function App() {
  return (
    <>
      <ContainerComp />
    </>
  )
}

function getlargestIncrease(arr) {
  if (arr.length < 2) return null;

  let maxIncrease = 0;
  let index = -1;

  for (let i = 0; i < arr.length - 1; i++) {
    const increase = arr[i + 1] - arr[i];
    if (increase > maxIncrease) {
      maxIncrease = increase;
      index = i;
    }
  }

  return {
    maxIncrease,
    from: arr[index],
    to: arr[index + 1],
    increasingindices: [index, index + 1],
  };
}

function getlargestDecrease(arr) {
  if (arr.length < 2) return null;

  let maxDecrease = 0;
  let index = -1;

  for (let i = 0; i < arr.length - 1; i++) {
    const decrease = arr[i] - arr[i + 1];
    if (decrease > maxDecrease) {
      maxDecrease = decrease;
      index = i; // index of the first element in the pair
    }
  }

  return {
    maxDecrease,
    from: arr[index],
    to: arr[index + 1],
    decreasingindices: [index, index + 1],
  };
}

export default App
