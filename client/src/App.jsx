import { useState, useEffect } from 'react'
import Chart from 'chart.js/auto'
import { Bar } from 'react-chartjs-2';
import './App.css'

function MyForm() {
  const [years, setYears] = useState({start: '2006', end: '2024'});
  const [state, setState] = useState('');
  const [ratings, setRatings] = useState([]);
  const [product, setProduct] = useState('');
  const [posts, setPosts] = useState([]);

  const summary = (years, state, ratings, product) => {
    fetch('https://127.0.0.1:5173', {
      method: 'POST',
      body: JSON.stringify({
         years: years,
         state: state,
         ratings: ratings,
         product: product
      }),
      headers: {
         'Content-type': 'application/json; charset=UTF-8',
      }
    }).then((response) => response.json()).then((data) => {
          console.log(data);
          setPosts(data);
        })
        .catch((err) => {
          console.log(err.message);
        }
      )
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      console.log(ratings, years)
      // summary(dates, states, ratings, product);
    };

    const onCheckbox = (e) => {
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
      console.log(e.target.value)
    };

    const onDateselect = (e) => {
      setYears((years) => {
        years[e.target.id] = e.target.value;
        return years;
      });
      console.log(years)
    };

  return (
    <form className='flex flex-col'>
      <div>
        <p>Date Range</p>
        <label for='start'>Starting Year</label>
        <select onChange={onDateselect} className='border p-2 rounded-s-sx' id="start" name='start'>
          <option value="2006">Year</option>
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
        <select onChange={onDateselect} className='border p-2 rounded-s-sx' id="end" name='end'>
          <option value="2024">Year</option>
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
      <input className='border' id='state' name='state'></input>

      <fieldset>
      <legend>Select Review Ratings</legend>
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
      <label for='product'>Product/Service</label>
      <select className='border p-2 rounded-s-sx' id="product" name='product'>
        <option value="">Choose a Product/Service</option>
        <option value="whitechocolatemocha">White Chocolate Mocha</option>
        <option value="pumpkinspicelatte">Pumpkin Spice Latte</option>
        <option value="drivethru">The Drive Through</option>
      </select>

      <button onClick={handleSubmit} className='border-sky-100 border-2 hover:border-blue-600 bg-sky-100 p-1 transition-all duration-325 rounded-md m-1' type='button'>Submit</button>
    </form>
  );
}

function MySummary() {
  return (
    <>
      <div className='w-[400px] aspect-16/9 border m-2'>

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

function MyChart() {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Chart.js Bar Chart',
      },
    },
  };
  const data = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    datasets: [
      {
        label: 'Dataset 1',
        data: [1,2,3,4,5,6],
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
      {
        label: 'Dataset 2',
        data: [1,2,3,4,5,6],
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
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
      <MyForm />
      <MySummary />
      <MyChart />
    </>
  )
}

export default App
