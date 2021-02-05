function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});
	
	//This line modifies the DOM, searching for the tag with the numberTweets ID and updating the text.
	//It works correctly, your task is to update the text of the other tags in the HTML file!
	document.getElementById('numberTweets').innerText = tweet_array.length;
	
	//get earliest and latest date
	var earlyDay = tweet_array[0].time;
	var lateDay = tweet_array[0].time;

	//variables for Tweet categories 
	var completedEvents = 0;
	var achievements = 0;
	var live_events = 0;
	var miscellaneous = 0;

	//variable for user-written
	var userWritten = 0;

	for(let x = 0; x< tweet_array.length; x++){
		if (tweet_array[x].time > lateDay)
		{
			lateDay = tweet_array[x].time
		}
		if (tweet_array[x].time < earlyDay)
		{
			earlyDay = tweet_array[x].time
		}
		switch (tweet_array[x].source)
		{
			case "live_event":
				live_events ++;
				break;
			case "achievement":
				achievements++;
				break;
			case "completed_event":
				completedEvents++;
				break;
			case "miscellaneous":
				miscellaneous++;
				break;
			default:
				console.log("There was an error, likely in tweet.ts");
				break;
		}
		if(tweet_array[x].written)
		{
			userWritten++;
		}
	}
	//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleDateString
	var options = {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'}
	document.querySelector('#firstDate').innerText = earlyDay.toLocaleDateString('en-US', options);
	document.querySelector('#lastDate').innerText = lateDay.toLocaleDateString('en-US', options);

	//handle live_event', 'achievement', 'completed_event', or 'miscellaneous
	
	//no need to loop through the set twice, add it to the loop above.
	var total = tweet_array.length;
	//js does not compile and options can be overwritten here without problem
	var options = {notation:'fixed',precision:2};
	//using querySelectorAll here because there's more than one completedEvents
	var queryCompletedEvents = document.querySelectorAll('.completedEvents');
	for(let i = 0; i< queryCompletedEvents.length;i++)
	{
		queryCompletedEvents[i].innerText = completedEvents;
	} 
	document.querySelector('.completedEventsPct').innerText = math.format(completedEvents/total, options);  
	document.querySelector('.liveEvents').innerText = live_events; 
	document.querySelector('.liveEventsPct').innerText = math.format(live_events/total, options); 
	document.querySelector('.achievements').innerText = achievements; 
	document.querySelector('.achievementsPct').innerText = math.format(achievements/total, options); 
	document.querySelector('.miscellaneous').innerText = miscellaneous; 
	document.querySelector('.miscellaneousPct').innerText = math.format(miscellaneous/total, options); 
	document.querySelector('.written').innerText = userWritten; 
	document.querySelector('.writtenPct').innerText = math.format(userWritten/total, options); 
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);
});