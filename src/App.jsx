import {useEffect, useState } from 'react'
import { useDebounce } from 'react-use'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import './index.css'
import Search from './Components/Search'
import Loading from './Components/Loading'
import MovieCard from './Components/MovieCard'
import { getTrendingMovies, updateSearchCount } from './appwrite.js'


const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_API_KEY;

// Debug: Check if API key is loaded
console.log('API Key loaded:', API_KEY ? 'Yes' : 'No');
console.log('API Key length:', API_KEY?.length || 0);

const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
}

function App() {
  const [count, setCount] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [movieList, setMovieList] = useState([])
  const [trendingMovies, setTrendingMovies] = useState([])
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');


  useDebounce(() => {
    setDebouncedSearchTerm(searchTerm);
  }, 500, [searchTerm]);




  const fetchMovies = async (query = '' ) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const endpoint = query ?`${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`
      :`${API_BASE_URL}/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc`;
      const response = await fetch(endpoint, options);
      
      if(!response.ok){
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API Response:', data); // Debug log
      
      // TMDb returns success differently than OMDB
      if(data.success === false){
        setErrorMessage(data.status_message || 'No movies found');
        setMovieList([]);
        return;
      }
      
      setMovieList(data.results || []);
      
      if(query && data.results.length > 0){
        await updateSearchCount(query, data.results[0]);
      }
    }
    catch (error) {
      console.error('Error fetching movies:', error);
      setErrorMessage('Failed to load movies: ' + error.message);
    }
    finally {
      setLoading(false);
    }
  } // Fixed: Added missing closing brace

  const loadTrendingMovies = async() =>{
    try{

      const movies = await getTrendingMovies();

      setTrendingMovies(movies || []);
    }
    catch(error){
      console.error('Error loading trending movies:', error);
    }

  }

  // useEffect should be INSIDE the component
  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    loadTrendingMovies();
  }, []);

  return (
    <>
      <main>
        <div className='pattern'/>
        <div className='wrapper'>
          <header>
            <img src='src/hero-img.png' alt="Hero" />
            <h1>Find <span className='text-gradient'>Movies</span> You'll Love Without the Hassle</h1>
            <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm}/>
          </header>
          
          {trendingMovies.length > 0 && (
             <section className='trending'>
            <h2 >TRENDING MOVIES</h2>

            <ul>
              {trendingMovies.map((movie , index) => (
                <li key={movie.$id}>
                  <p>{index + 1}</p>
                  <img src={movie.poster_url} alt={movie.title} />
                </li>
              ))}
            </ul>
          </section>
          )}

          <section className='all-movies'>
          <h2 >ALL MOVIES</h2>
          {loading ? (
            <Loading />
          ) : errorMessage ? (
            <p className='text-red-500'>{errorMessage}</p>
          ) : (
            <ul>
              {movieList.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </ul>
          )}
          </section>
        </div>
      </main>
    </>
  )
}

export default App
