function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}
	
	tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});

	//Edit the DOM
	//https://stackoverflow.com/questions/53584369/javascript-map-increment-value
	
	//This is to count how many times an activity occurred - find top 3 is the goal
	var activityCounterMap = new Map();

	//This is to count the avg distance/activity. Activity: total distance
	var activityDistanceMap = new Map();

	//This counts number of activities done on weekend
	var weekendCount = 0;
	var weekendDistance = 0;

	//This counts number of activities done on weekday
	var weekdayCount = 0;
	var weekdayDistance =0;


	
	for(let x = 0; x< tweet_array.length; x++){
		let activity = tweet_array[x].activityType;
		if(!activityCounterMap.has(activity))
		{
			activityCounterMap.set(activity, 1);
			activityDistanceMap.set(activity, tweet_array[x].distance);
		}
		else{
			activityCounterMap.set(activity, activityCounterMap.get(activity)+1);
			activityDistanceMap.set(activity, activityDistanceMap.get(activity)+tweet_array[x].distance);
		}
		//This block does the weekend/weekday operations
		activity = tweet_array[x];
		if(activity.time.getDay() == 0 || activity.time.getDay() == 6)
		{
			weekendCount++;
			weekendDistance += activity.distance;
		}
		else{
			weekdayCount++;
			weekdayDistance += activity.distance;
		}
	}
	//https://stackoverflow.com/questions/37982476/how-to-sort-a-map-by-value-in-javascript
	//handles sorting by value
	const sorted_keys = new Map([...activityCounterMap.entries()].sort((a, b) => b[1] - a[1]));
	document.querySelector('#numberActivities').innerText = activityCounterMap.size;
	var a = sorted_keys.entries();
	var first = a.next().value[0];
	var second = a.next().value[0];
	var third = a.next().value[0];
	document.querySelector('#firstMost').innerText = first ;
	document.querySelector('#secondMost').innerText = second;
	document.querySelector('#thirdMost').innerText = third;

	var firstAverageDistance = activityDistanceMap.get(first)/activityCounterMap.get(first);
	var secondAverageDistance = activityDistanceMap.get(second)/activityCounterMap.get(second);
	var thirdAverageDistance = activityDistanceMap.get(second)/activityCounterMap.get(third);
	
	var disposableMap = new Map();
	disposableMap.set(first, firstAverageDistance);
	disposableMap.set(second, secondAverageDistance);
	disposableMap.set(third, thirdAverageDistance);
	const sorted_disposable = new Map([...disposableMap.entries()].sort((a, b) => b[1] - a[1]));
	a = sorted_disposable.entries();
	var first = a.next().value[0];
	var second = a.next().value[0];
	var third = a.next().value[0];
	
	document.querySelector('#longestActivityType').innerText = first ;
	document.querySelector('#shortestActivityType').innerText = third;

	var weekendAverage = weekendDistance/weekendCount;
	var weekdayAverage = weekdayDistance/weekdayCount;
	
	if(weekendAverage>weekdayAverage)
	{
		document.querySelector('#weekdayOrWeekendLonger').innerText = 'weekend';
	}
	else{
		document.querySelector('#weekdayOrWeekendLonger').innerText = 'weekday';
	}
	
	//TODO: create a new array or manipulate tweet_array to create a graph of the number of tweets containing each type of activity.

	//manipulate activityCounterMap to format data
	var activityIterator = activityCounterMap.entries();
	done = false;
	var values = [];
	while(!done)
	{
		var pair = (activityIterator.next().value);
		if(pair == undefined)
		{
			done =true;
		}
		else{
			//Hack to hide one bad data 
			if (pair[0] == "17.28km")
            {
                continue;
            }
			//End hack
			var group = {"Activity Name": pair[0], "Activity Count":pair[1]};
			values.push(group);
		}
	}
	

	activity_vis_spec = 
	{
	  "$schema": "https://vega.github.io/schema/vega-lite/v4.json",
	  "description": "A graph of the number of Tweets containing each type of activity.",
	  "data": 
	  {
	    	values
	  },
	  "mark": 'bar',
	  "encoding": {
		  "x": {"field": "Activity Name", "type": "nominal"},
		  "y": {"field": "Activity Count", "type": "quantitative"}
	  }

	};
	vegaEmbed('#activityVis', activity_vis_spec, {actions:false});


	//Second chart
	var mapDist = []

	//I think looping through again is better than hard-coding the top-3 activites above. Another possible route is to 
	//change the maps so that activites relate to more fields. As I am running out of time, here I will loop through the set again. 
	
	for(let x = 0; x< tweet_array.length; x++)
	{
		let tweet = tweet_array[x];
		let options = {weekday: 'long'};
		let day = tweet.time.toLocaleDateString("en-US",options=options).split(",")[0];
		if(tweet.activityType == first || tweet.activityType == second ||tweet.activityType == third)
		{
			var group = {"Day of the Week": day, "Distance(mi)": tweet.distance, "Activity":tweet.activityType}
			mapDist.push(group);
		}
	}
	
	
	distByDay =
	{
		"$schema": "https://vega.github.io/schema/vega-lite/v4.json",
	  	"description": "A plot of the distances by day of the week for all of the three most tweeted-about activities. Day of the week should be encoded on the x-axis, distance on the y-axis, and activity type by color. There are a lot of points on this plot, so it’s hard to interpret which activity tended to be longest and on what day of the week.",
		"data":
		{
			"values":mapDist
		},
		"mark": 'point',
		"encoding":
		{
			"x":{"field":"Day of the Week", "type": "nominal"},
			"y":{"field":"Distance(mi)", "type": "quantitative"},
			"color": {"field": "Activity", "type": "nominal"}
		},
		
	}

	vegaEmbed('#distanceVis', distByDay, {actions:false});
	var distance = document.querySelector('#distanceVis');
	distance.style.display = "block";


	//Third plot graph
	avgDistByDay =
	{
		"$schema": "https://vega.github.io/schema/vega-lite/v4.json",
	  	"description": "A plot of the distances by day of the week for all of the three most tweeted-about activities. Day of the week should be encoded on the x-axis, distance on the y-axis, and activity type by color. There are a lot of points on this plot, so it’s hard to interpret which activity tended to be longest and on what day of the week.",
		"data":
		{
			"values":mapDist
		},
		"mark": 'point',
		"encoding":
		{
			"x":{"field":"Day of the Week", "type": "nominal"},
			"y":{"aggregate": "mean", "field":"Distance(mi)", "type": "quantitative"},
			"color": {"field": "Activity", "type": "nominal"}
		},
	}
	vegaEmbed('#distanceVisAggregated', avgDistByDay, {actions:false});
	//hide this one first
	document.querySelector('#distanceVisAggregated').style.display = 'none';

	//set a listener
	document.querySelector("#aggregate").addEventListener("click", dayToDistanceDisplay);

	function dayToDistanceDisplay() {
		var distance = document.querySelector('#distanceVis');
		var avgDistance = document.querySelector('#distanceVisAggregated');
		if (distance.style.display === 'none') {
			document.querySelector('#aggregate').innerText = "Show means";
			avgDistance.style.display = 'none';
		  	distance.style.display = 'block';
		} else {
			document.querySelector('#aggregate').innerText = "Show all activites";
			avgDistance.style.display = 'block';
			distance.style.display = 'none';
		}
	  }
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);
});