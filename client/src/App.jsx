import { useState } from 'react'
import Chart from 'chart.js/auto'
import { Bar } from 'react-chartjs-2';
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
  const [chartdata, setChartdata] = useState({});
  const [chartdata1, setChartdata1] = useState({});

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
          setChartdata1(data['chartdata1']);
          setChartdata(data['chartdata']);
        })
        .catch((err) => {
          setLoading('none');
          console.log(err.message);
        }
      )
    };


  return (
    <>
      <MyForm loading={loading} getSummary={getSummary}/>
      <MySummary summary={summary}/>
      <MyChart chartdata={chartdata}/>
      <MyChart1 chartdata1={chartdata1}/>
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

  return (
    <div>
      <form onSubmit={handleSubmit} className='flex flex-col'>
        <div>
          <p>Date Range</p>
          <p style={{display: yearserror}} className={failsubmit}>End year cannot be less than start year</p>
          <label for='start'>Starting Year</label>
          <select onChange={onDateselect} className='border p-2 rounded-s-sx' id="start" name='start'>
            <option value="2006">2006</option>
            <option value="2007">2007</option>
            <option value="2008">2008</option>
            <option value="2009">2009</option>
            <option value="2010">2010</option>
            <option value="2011">2011</option>
            <option value="2012">2012</option>
            <option value="2013">2013</option>
            <option value="2014">2014</option>
            <option value="2015">2015</option>
            <option value="2016">2016</option>
            <option value="2017">2017</option>
            <option value="2018">2018</option>
            <option value="2019">2019</option>
            <option value="2020">2020</option>
            <option value="2021">2021</option>
            <option value="2022">2022</option>
            <option value="2023">2023</option>
            <option value="2024">2024</option>
          </select>
          <label for='end'>Ending Year</label>
          <select onChange={onDateselect} className='border p-2 rounded-s-sx' id="end" name='end' value='2024'>
            <option value="2006">2006</option>
            <option value="2007">2007</option>
            <option value="2008">2008</option>
            <option value="2009">2009</option>
            <option value="2010">2010</option>
            <option value="2011">2011</option>
            <option value="2012">2012</option>
            <option value="2013">2013</option>
            <option value="2014">2014</option>
            <option value="2015">2015</option>
            <option value="2016">2016</option>
            <option value="2017">2017</option>
            <option value="2018">2018</option>
            <option value="2019">2019</option>
            <option value="2020">2020</option>
            <option value="2021">2021</option>
            <option value="2022">2022</option>
            <option value="2023">2023</option>
            <option value="2024">2024</option>
          </select>
        </div>

        <label for='state'>State</label>
        <select onChange={onStateselect} className='border p-2 rounded-s-sx' id="state" name='state'>
          <option value='all'>All</option>
          <option value="AL">Alabama</option>
          <option value="AK">Alaska</option>
          <option value="AZ">Arizona</option>
          <option value="AR">Arkansas</option>
          <option value="CA">California</option>
          <option value="CO">Colorado</option>
          <option value="CT">Connecticut</option>
          <option value="DE">Delaware</option>
          <option value="FL">Florida</option>
          <option value="GA">Georgia</option>
          <option value="HI">Hawaii</option>
          <option value="ID">Idaho</option>
          <option value="IL">Illinois</option>
          <option value="IN">Indiana</option>
          <option value="IA">Iowa</option>
          <option value="KS">Kansas</option>
          <option value="KY">Kentucky</option>
          <option value="LA">Louisiana</option>
          <option value="ME">Maine</option>
          <option value="MD">Maryland</option>
          <option value="MA">Massachusetts</option>
          <option value="MI">Michigan</option>
          <option value="MN">Minnesota</option>
          <option value="MS">Mississippi</option>
          <option value="MO">Missouri</option>
          <option value="MT">Montana</option>
          <option value="NE">Nebraska</option>
          <option value="NV">Nevada</option>
          <option value="NH">New Hampshire</option>
          <option value="NJ">New Jersey</option>
          <option value="NM">New Mexico</option>
          <option value="NY">New York</option>
          <option value="NC">North Carolina</option>
          <option value="ND">North Dakota</option>
          <option value="OH">Ohio</option>
          <option value="OK">Oklahoma</option>
          <option value="OR">Oregon</option>
          <option value="PA">Pennsylvania</option>
          <option value="RI">Rhode Island</option>
          <option value="SC">South Carolina</option>
          <option value="SD">South Dakota</option>
          <option value="TN">Tennessee</option>
          <option value="TX">Texas</option>
          <option value="UT">Utah</option>
          <option value="VT">Vermont</option>
          <option value="VA">Virginia</option>
          <option value="WA">Washington</option>
          <option value="WV">West Virginia</option>
          <option value="WI">Wisconsin</option>
          <option value="WY">Wyoming</option>
        </select>
        <fieldset>
        <legend className={selyears}>Select Review Ratings</legend>
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
        <label for='product'>Product/Service (optional)</label>
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

        <button className='border-sky-100 border-2 hover:border-blue-600 bg-sky-100 p-1 transition-all duration-325 rounded-md m-1' type='submit'>
          <div className='flex justify-center'>
            <div style={{display: loading}} className='animate-spin bg-sky-100 mr-2 rounded-full border-t-indigo-500 border-t-3 h-8 w-8'></div><div className='p-2'>Submit</div>
          </div>
        </button>
      </form>
    </div>
  );
}






function MySummary({summary}) {
  return (
    <>
      <div className='w-[400px] aspect-16/9 border m-2'>
        {summary}
      </div>
    </>
  )
}



function MyReviews() {
  return(
    <>
    </>
  )
}

function MyChart({chartdata}) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
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
    labels: Object.keys(chartdata),
    datasets: [
      {
        label: 'Average Ratings',
        data: Object.values(chartdata),
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  };
  return(
    <div className='w-full max-w-[1000px] min-h-[0px] h-auto aspect-16/9'>
      <Bar options={options} data={data} />
    </div>
  )
}

function MyChart1({chartdata1}) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
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
    labels: Object.keys(chartdata1),
    datasets: [
      {
        label: 'Average Ratings',
        data: Object.values(chartdata1),
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  };
  return(
    <div className='w-full max-w-[1000px] min-h-[0px] h-auto aspect-16/9'>
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
