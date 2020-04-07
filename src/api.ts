import Axios from 'axios';

export default Axios.create({
  baseURL: 'https://covidtracking.com/api',
});
