import React from 'react'

function Search({searchTerm, setSearchTerm}) {
    return (
        <div className='search'>
            <div>
                <img src="src/search.svg" alt="Search Icon" />
                <input
                    type="text"
                    placeholder="Search for movies, TV shows, actors, and more..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>
    )
}

export default Search
