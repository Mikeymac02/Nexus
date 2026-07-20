/* eslint-disable @typescript-eslint/no-explicit-any */

const API_KEY = import.meta.env.VITE_NEWS_API_KEY;


export const newsModule = {
    id: "news",                          //How your module is identified and catalogued by the shell
    name: "News",                        //Name of your module
    refreshInterval: 1000000,                  //How often your module refreshes data (Currently set to 1 second aka 1000ms)
            

    //Everything here will only run during initialization

    async update() {
        //Everything inside this function will run during each refresh as listed in refreshInterval
        try {
            const response = await fetch(`https://api.thenewsapi.com/v1/news/top?locale=us&language=en&api_token=${API_KEY}&limit=5`);
           
            console.log(response)
            if (!response.ok) {
                throw new Error("Failed to fetch news");
            }

            const data = await response.json();
            // Extract just the headline titles
            const headlines = data.data ? data.data.map((article: any) => article.title) : [];


            return {
                data: {
                    headlines: headlines.length > 0 ? headlines : ["No news available"]
                }
            };
            
        } catch (error) {
            console.error("Failed to fetch news", error);
        }

        return {
            data: {
                headlines: ["No news available"]
            }
        };
    }
}