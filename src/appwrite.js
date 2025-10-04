import { Client, ID, Databases, Query } from "appwrite";



const PROJECT_ID = import.meta.env.VITE_APPWRITE_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const TABLE_ID = import.meta.env.VITE_APPWRITE_TABLE_ID;


const client = new Client()
    .setEndpoint('https://nyc.cloud.appwrite.io/v1') 
    .setProject(PROJECT_ID)


const databases = new Databases(client);

export const updateSearchCount = async(searchTerm, movie) => {
   try{
    const result = await databases.listDocuments(DATABASE_ID, TABLE_ID, [
        Query.equal('searchTerm', searchTerm)
    ]);

    if(result.documents.length > 0){
        const doc = result.documents[0];

        await databases.updateDocument(DATABASE_ID, TABLE_ID, doc.$id, {
            count: (doc.count || 0) + 1,
        });
    
  }else{
    await databases.createDocument(DATABASE_ID, TABLE_ID, ID.unique(), {
        searchTerm,
        count: 1,
        movie_id: movie.id,
        poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    })
  }
 }
  
    catch(error){
        console.error('Error updating search count:', error);
    }
}

export const getTrendingMovies = async() => {
    try{
        const result = await databases.listDocuments(DATABASE_ID, TABLE_ID, [
            Query.limit(6),
            Query.orderDesc('count')
        ])

        return result.documents;

    }
    catch(error){
        console.error('Error fetching trending movies:', error);
    }

}