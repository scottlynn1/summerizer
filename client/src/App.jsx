import { useState } from 'react'
import Chart from 'chart.js/auto'
import { Bar } from 'react-chartjs-2';
import { Line } from 'react-chartjs-2';
import './App.css'

const API_HOST = 'http://localhost:8000';
let _csrfToken = null;

async function getCsrfToken() {
  if (_csrfToken === null) {
    const response = await fetch('http://127.0.0.1:8000/csrf/', {
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
    fetch('http://127.0.0.1:8000/api/', {
      method: 'POST',
      body: JSON.stringify(object),
      headers: {'X-CSRFToken': await getCsrfToken(), 'Content-type': 'application/json; charset=UTF-8'},
      credentials: 'include'
   }).then((response) => response.json()).then((data) => {
          setLoading('none');
          console.log(data);
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
        <div className='text-center text-3xl p-2 bg-blue-100'>
          This is a user interface integrating an LLM to analyse a customer review dataset.
          <p className='text-lg p-2'>
            You can select a date range, several levels of review ratings, narrow down to a specific state, and optional to a specific product or service.
            <br></br>
            The system will then generate a summary of the filtered data and display additional data such as average rating across time and average rating by state if applicable.
          </p>
        </div>
        <div className='flex flex-col min-[1200px]:flex-row justify-between items-start m-auto p-2'>
          <div className='flex flex-2 flex-col w-full min-w-[0px] mx-auto'>
            <div className='flex flex-col min-[850px]:flex-row items-center min-[850px]:items-start justify-around'>
              <div className='min-w-[400px] border rounded-md-2 mx-2 p-2 bg-sky-50'>
                <MyForm loading={loading} getSummary={getSummary}/>
              </div>
              <div className='w-full max-w-[750px] min-w-[300px] min-h-[350px] border mt-2 min-[850px]:mt-0 rounded-md bg-sky-50'>
                <MySummary summary={summary}/>
              </div>
            </div>
            <div className='flex w-full min-h-[0px] min-w-[0px] aspect-16/9 border m-auto mt-2 p-2 rounded-md bg-sky-50'>
                <LineChart linechartdata={linechartdata}/>
            </div>
          </div>
          <div className='flex flex-1 w-full max-w-[450px] min-h-[0px] min-w-[300px] aspect-9/18 border mx-auto mt-2 min-[1200px]:mt-0 min-[1200px]:ml-2 p-4 rounded-md bg-sky-50 items-stretch'>
            <BarChart barchartdata={barchartdata}/>
          </div>
        </div>
        <footer class="bg-blue-100 p-2 text-center py-6 mt-6">
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
        console.log('show')
        setYearserror('block')
      } else {
        console.log('hide')
        setYearserror('none')
      }
    }
    if (e.target.id == 'end') {
      setYears({...years, 'end': e.target.value})
      if (Number(e.target.value) < Number(years.start)) {
        console.log('show')
        setYearserror('block')
      } else {
        console.log('hide')
        setYearserror('none')
      }
    }
    console.log(years)
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
          <label className='m-1' for='start'>Starting Year</label>
          <select onChange={onDateselect} className='border p-2 rounded-s-sx' id="start" name='start'>
            {yearslist.map((year) => {
              return (
                <option value={year}>{year}</option>
              )
            })}
          </select>
          <label className='m-1' for='end'>Ending Year</label>
          <select onChange={onDateselect} className='border p-2 rounded-s-sx' id="end" name='end' value='2024'>
            {yearslist.map((year) => {
              return (
                <option value={year}>{year}</option>
              )
            })}
          </select>
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
    <div className='text-center'>
      <p className='text-lg border-b-2'>
        High level summary of review data
      </p>
      <div className=''>
        {summary}
      </div>
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
        position: 'top',
      },
    },
    scales: {
      y: {
        type: 'linear', // For numeric data (use 'time' for date values)
        min: 0,       // Minimum x-axis value
        max: 5,       // Maximum x-axis value
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
    <div className='flex-1 w-full h-full'>
      <Line options={options} data={data} />
    </div>
  )
}

function BarChart({barchartdata}) {
  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    // aspectRatio: .5,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      x: {
        type: 'linear', 
        min: 0,       
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
    <div className='flex-1 w-full h-full'>
      <Bar options={options} data={data} />
    </div>
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
