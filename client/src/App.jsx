import { useState } from 'react'
import Chart from 'chart.js/auto'
import { Bar } from 'react-chartjs-2';
import { Line } from 'react-chartjs-2';
import './App.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
let _csrfToken = null;

async function getCsrfToken() {
  if (_csrfToken === null) {
    const response = await fetch(`${API_BASE}/csrf/`, {
      credentials: 'include',
    });
    const data = await response.json();
    _csrfToken = data.csrfToken;
  }
  return _csrfToken
}

function ContainerComp() {
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState('none');
  const [linechartdata, setLinechartdata] = useState({});
  const [barchartdata, setBarchartdata] = useState({});

  const getSummary = async (object) => {
    setLoading('block')
    fetch(`${API_BASE}/api/`, {
      method: 'POST',
      body: JSON.stringify(object),
      headers: {'X-CSRFToken': await getCsrfToken(), 'Content-type': 'application/json; charset=UTF-8'},
      credentials: 'include'
   }).then((response) => response.json()).then((data) => {
          console.log(data)
          setLoading('none');
          setSummary(data['db']);
          setBarchartdata(data['chartdata1']);
          setLinechartdata(data['chartdata']);
        })
        .catch((err) => {
          setLoading('none');
          console.log(err.message);
        }
      )
    };


  return (
    <>
      <header className='header text-center text-3xl p-2 bg-blue-100 rounded-2xl my-4'>
        User interface to query the starbucks reviews dataset
      </header>
      
      <div className='flex flex-col min-[1570px]:flex-row min-[995px]:mx-[80px] items-center'>
        <div className='flex-2 flex flex-col'>
          <div className='flex flex-col min-[995px]:flex-row items-center'>
            <div className='box min-w-[400px] m-4 p-2'>
              <MyForm loading={loading} getSummary={getSummary}/>
            </div>
            <div className='box w-full max-w-[650px] min-h-[410px] min-[995px]:min-w-[550px] m-4'>
              <h2 className='border-b-2'>Summary</h2>
              <MySummary summary={summary}/>
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
                  <p>Best Year: <span>{summary.length > 0 ? Math.max(...Object.values(linechartdata)).toFixed(2) : '--'}</span></p>
                </div>
                <div className='p-2 my-2 text-2xl border-t-1'>
                  <p>Worst Year: <span>{summary.length > 0 ? Math.min(...Object.values(linechartdata)).toFixed(2) : '--'}</span></p>                  
                </div>
                <div className='p-2 my-2 text-2xl border-t-1'>
                  <p>Greatest Increase: </p>
                  <p></p>
                </div>
                <div className='p-2 my-2 text-2xl border-t-1'>
                  <p>Greatest Decrease: <span></span></p>
                  <p></p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='flex-1'>
          <div className='box m-4 max-w-[1050px]'>
            <h2 className='border-b-2'>Average Rating by State</h2>
            <div className='flex flex-col min-[650px]:flex-row mt-4 max-w-126 h-184'>
              <div className='chart flex-2 overflow-y-auto my-2 w-[350px] min-w-[200px] p-4 items-stretch'>
                <div className='aspect-4/18 w-'>
                  <BarChart barchartdata={barchartdata}/>
                </div>
              </div>
              <div className='flex-1 '>
                <div>
                  <p className='p-2 my-2 text-2xl border-t-1'>Top 3 States: <span></span></p>
                  <p className='p-2 my-2 text-2xl border-t-1'>
                    {Object.keys(barchartdata).slice(0,3).map((state, index) => (
                      <p>{`${index + 1}. ${state}`}</p>
                    ))}
                  </p>
                  <p className='p-2 my-2 text-2xl border-t-1'>Bottom 3 States: <span></span></p>
                  <p className='p-2 my-2 text-2xl border-t-1'>
                    {Object.keys(barchartdata).slice(-3).map((state, index) => (
                      <p>{`${index + 1}. ${state}`}</p>
                    ))}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer class="footer bg-blue-100 p-2 text-center py-6 mt-6">
        <p class="">© 2025 Scott Lynn. All rights reserved.</p>
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
    console.log({years, state, ratings, product})
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

  const states_abbr = {AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California', CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware',
    FL: 'Florida', GA: 'Georgia', HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa', KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', 
    MD: 'Maryland', MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada',
    NH: 'New Hampshire', NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio', OK: 'Oklahoma', OR: 'Oregon', 
    PA: 'Pennsylvania', RI:'Rhode Island', SC: 'South Carolina', SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont', VA: 'Virginia', WA: 'Washington',
    WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming'};

  const yearslist = ['2006', '2007', '2008', '2009', '2010', '2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024'];

  return (
      <form onSubmit={handleSubmit} className='flex flex-col text-center'>
        <div className='p-2'>
          <p className='font-semibold mb-2'>Date Range</p>
          <p style={{display: yearserror}} className={failsubmit}>End year cannot be less than start year</p>
          <div>
            <div className='m-2'>
              <label className='m-1' for='start'>Starting Year</label>
              <select onChange={onDateselect} className='border p-2 rounded-s-sx' id="start" name='start'>
                {yearslist.map((year) => {
                  return (
                    <option value={year}>{year}</option>
                  )
                })}
              </select>
            </div>
            <div className='m-2'>
              <label className='m-1' for='end'>Ending Year</label>
              <select onChange={onDateselect} className='border p-2 rounded-s-sx' id="end" name='end' value={years.end}>
                {yearslist.map((year) => {
                  return (
                    <option value={year}>{year}</option>
                  )
                })}
              </select>
            </div>
          </div>
        </div>
        <div className='font-semibold p-2'>
        <label className='p-2' for='state'>State</label>
        <select onChange={onStateselect} className='border p-2 rounded-s-sx' id="state" name='state'>
          <option value='all'>All</option>
          {Object.keys(states_abbr).map((state) => {
            return (
              <option value={state}>{states_abbr[state]}</option>
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
            <input className='m-1' onChange={onCheckbox} type="checkbox" id='rating1' name="ratings" value="1" />
            <label for="ratings1">1 Star</label>
          </div>
          <div>
            <input className='m-1' onChange={onCheckbox} type="checkbox" id='rating2' name="ratings" value="2" />
            <label for="ratings2">2 Star</label>
          </div>
          <div>
            <input className='m-1' onChange={onCheckbox} type="checkbox" id='rating3' name="ratings" value="3" />
            <label for="ratings3">3 Star</label>
          </div>
          <div>
            <input className='m-1' onChange={onCheckbox} type="checkbox" id='rating4' name="ratings" value="4" />
            <label for="ratings4">4 Star</label>
          </div>
          <div>
            <input className='m-1' onChange={onCheckbox} type="checkbox" id='rating5' name="ratings" value="5" />
            <label for="ratings5">5 Star</label>
          </div>
        </div>
        </fieldset>
        <div className='font-semibold'>
        <label for='product'>Product/Service (optional)</label>
        </div>
        <select onChange={productSelect} className='border p-2 rounded-s-sx' id="product" name='product'>
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






function MySummary({summary}) {
  return (
      <div className='p-2 m-2 font-display font-medium text-lg'>
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

export default App
