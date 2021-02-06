//declare this outside a function to make it global
var written_tweet_array = []
function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});

	
	for(let x = 0; x< tweet_array.length; x++){
		if(tweet_array[x].written)
		{
			written_tweet_array.push(tweet_array[x]);
		}
	}
	

}

var searchText = "";

function searcher(e){
	var searchCount = 0;
	let numRows = document.querySelector('#tweetTable').rows.length;
		for(let j=0;j<numRows;j++)
		{
			document.querySelector('#tweetTable').deleteRow(0);
		}
	if(e.data == null && e.inputType == "deleteContentBackward")
		{
			searchText = searchText.slice(0,searchText.length-1);
			for(let i =0; i<written_tweet_array.length;i++)
			{
				if(written_tweet_array[i].writtenText.includes(searchText))
					{
						var myRow = document.querySelector('#tweetTable').insertRow(searchCount);
						searchCount++;
						var htmlRow = written_tweet_array[i].getHTMLTableRow(searchCount);
						myRow.innerHTML = htmlRow;
					}
			}
		}
	else
		{
		searchText += e.data;
		for(let i =0; i<written_tweet_array.length;i++)
			{
				if(written_tweet_array[i].writtenText.includes(searchText))
					{
						var myRow = document.querySelector('#tweetTable').insertRow(searchCount);
						searchCount++;
						var htmlRow = written_tweet_array[i].getHTMLTableRow(searchCount);
						myRow.innerHTML = htmlRow;					
					}
			}
		}
	document.querySelector('#searchText').innerText = searchText;
	document.querySelector('#searchCount').innerText = searchCount;
	//hack to get 0 to display on empty searchText
	if (searchText == "")
	{
		document.querySelector('#searchCount').innerText = 0;
		let numRows = document.querySelector('#tweetTable').rows.length;
		for(let j=0;j<numRows;j++)
		{
			document.querySelector('#tweetTable').deleteRow(0);
		}
	}

}

function addEventHandlerForSearch() {
	document.querySelector('#textFilter').addEventListener('input', searcher)
	//TODO: Search the written tweets as text is entered into the search box, and add them to the table
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	addEventHandlerForSearch();
	loadSavedRunkeeperTweets().then(parseTweets);
});