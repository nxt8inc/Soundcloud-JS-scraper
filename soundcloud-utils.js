const url = 'https://soundcloud.com/mt-marcy/cold-nights';
const axios = require('axios');
const cheerio = require('cheerio');

function getSrcData(html) {
		data = [];
		const $ = cheerio.load(html);
		$('script').each((i, elem) => {
			data.push({
				link : $(elem).get()[0].attribs['src']
			});
		});
		return data
	}

function extractUserID(text) {
	let index1 = text.match(/,client_id:/).index
	let index2 = text.match(/,env:"/).index
	return text.substr(index1+12,index2-index1-13);
}

getUserID = async function(){ 

	return axios.get(url)
	.then(response => {
		
		let link = getSrcData(response.data)[11]['link'];
		return axios.get(link)
		.then(response => {
		
		
		let userID = extractUserID(response.data);
		return userID;
		})
		.catch(error => {
			console.log(error);
		});

		
	})
	.catch(error => {
		console.log(error);
	});


}

async function searchSoundcloud(query){
	let result = getUserID()
	let baseURL = "https://api-v2.soundcloud.com/search?"
	return result.then(function(result) {
		let requestURL = baseURL + "q=" + query +"&client_id=" + result +"&limit=10&offset=0"
   		return axios.get(requestURL)
		.then(response => {
			listOfUrls = []
			response.data['collection'].forEach(function(entry) {
				
    			try{
    			listOfUrls.push({
    				title : entry['title'],
    				streamURL : entry['media']['transcodings'][1]['url']
    			});
    			}
    			catch(TypeError){
    				listOfUrls.push({
    				title : entry['title'],
    				streamURL : /*entry['media'][0]*/ 'no link'
    			});
    			}	
			});
			return listOfUrls;
			 
		})
		.catch(error => {
			console.log(error);
		});
	})

}

function getMP3StreamLink(query, position){
	let result = searchSoundcloud(query)
	let result2 = getUserID()
	return result.then(function(result){
		result2.then(function(result2){
		let streamURL = result[position]['streamURL'];
		
		let newestURL = streamURL + '?client_id=' + result2
		
		return axios.get(newestURL)
		.then(response => {
			console.log(response.data)
		})
		.catch(error => {
			console.log(error);
		});	
		
	})
	})
}

function getSearchResult(query){
	let result = searchSoundcloud(query)
	result.then(function(result){
		
			console.log(result)
		
	})
}

function resolveUserInformation(userURL){
	let result = getUserID()
	return result.then(function(result){
		let resolveURL = "https://api-v2.soundcloud.com/resolve?url="+userURL+"&client_id="+ result
		return axios.get(resolveURL)
		.then(response => {
			console.log(response.data)
			return response.data['id']
		})
		.catch(error => {
			console.log(error);
		});	
	})
}

function getUserResult(url){
	let result = resolveUserInformation(url)
	result.then(function(result){
		
			console.log(result)
		
	})
}

//getMP3StreamLink("prosumer dj set", 1);
//getSearchResult("prosumer dj set");
getUserResult("https://soundcloud.com/daniel-bollinger-1");