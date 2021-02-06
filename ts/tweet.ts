class Tweet {
	private text:string;
	time:Date;

	constructor(tweet_text:string, tweet_time:string) {
        this.text = tweet_text;
		this.time = new Date(tweet_time);//, "ddd MMM D HH:mm:ss Z YYYY"
	}

	//returns either 'live_event', 'achievement', 'completed_event', or 'miscellaneous'
    get source():string {
        if (this.text.includes("live") || this.text.includes("now")){
            return "live_event";
        }
        else if (this.text.includes("goal") || this.text.includes("achieve"))
        {
            return "achievement";
        }
        else if (this.text.includes("completed") || this.text.includes("posted"))
        {
            return "completed_event";
        }
        return "miscellaneous";
    }

    //returns a boolean, whether the text includes any content written by the person tweeting.
    get written():boolean {
        const autoPattern1 = new RegExp("with @Runkeeper.");
        return !autoPattern1.test(this.text);
    }

    get writtenText():string {
        if(!this.written) {
            return "";
        }
        const autoPattern1 = new RegExp("\.\.\..*");
        var parsedWrittenText = this.text;
        //replace things from "..." to end.
        if (autoPattern1.test(parsedWrittenText))
        {
            parsedWrittenText.replace(autoPattern1,'');
        }
        //replace things from Just to '-'.
        const autoPattern2 = new RegExp("Just.*-");
        if (autoPattern2.test(parsedWrittenText))
        {
            parsedWrittenText.replace(autoPattern2, '');
        }
        
        //remove anything after a https
        const autoPattern3 = new RegExp("https.*");
        if (autoPattern3.test(parsedWrittenText))
        {
            parsedWrittenText.replace(autoPattern3, '');
        }

        return parsedWrittenText;
    }

    get activityType():string {
        if (this.source != 'completed_event') {
            return "unknown";
        }
        const autoPattern1 = new RegExp("(completed|posted).*(with|-)")
        try{
            let matcher = this.text.match(autoPattern1);
            if (matcher != null)
            {
                let split_matcher = matcher[0].split(' ');
                //https://stackoverflow.com/questions/175739/built-in-way-in-javascript-to-check-if-a-string-is-a-valid-number
                if(isNaN(Number(split_matcher[2])))
                {
                    return split_matcher[2];
                }
                else{
                    return split_matcher[4];
                }
            }
        }
        catch(err){
            console.log(err.message);
        }
        return "";
    }

    get distance():number {
        if(this.source != 'completed_event') {
            return 0;
        }
        const autoPattern1 = new RegExp("(completed|posted).*(with|-)")
        try{
            let matcher = this.text.match(autoPattern1);
            if (matcher != null)
            {
                let split_matcher = matcher[0].split(' ');
                //https://stackoverflow.com/questions/175739/built-in-way-in-javascript-to-check-if-a-string-is-a-valid-number
                if(isNaN(Number(split_matcher[2])))
                {
                    //deals with timed activities like yoga or MySports Freestyle
                    return 0;
                }
                else{
                    var numberInMiles = Number(split_matcher[2]);
                    if (split_matcher[3] == 'km')
                    {
                        //1mi = 1.609 km
                        numberInMiles = Number(split_matcher[2])/1.609
                    }
                    return numberInMiles;
                }
            }
        }
        catch(err){
            console.log(err.message);
        }
        return 0;
    }

    getHTMLTableRow(rowNumber:number):string {
        const httpLink = /(http\S*)/g;
        let matcher = httpLink.exec(this.text);
        var httpString = "";
        var newText = this.text;
        if (matcher != null)
        {
            var httpString = matcher[0].trim();
            newText = newText.replace(httpString, "<a href ="+ httpString+ ">" + httpString + "</a>");   
        }
        return "<tr>" + "<td>" + rowNumber + "</td>" + "<td>" + this.activityType + "</td>" + "<td>" + newText + "</td>"+"</tr>"  
        
    }
}